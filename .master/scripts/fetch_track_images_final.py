#!/usr/bin/env python3
"""Final gap-fill pass for 2026 track imagery.

- Uses action=query&prop=imageinfo (iiurlwidth) to get a standard-size thumbnail
  URL plus extmetadata (Artist, LicenseShortName) in ONE request per file.
- 25s pacing between all Commons requests (v1/v2 hit 429s at faster rates).
- Magic-byte validation: an HTML error page is never written as an image.
- Updates image_manifest.json with map_local / aerial_local + attribution.
"""
import json, os, re, time, urllib.parse, urllib.request

OUT = '/Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/assets/tracks_2026'
MANIFEST = os.path.join(OUT, 'image_manifest.json')
UA = {'User-Agent': 'Formula1LegendsResearch/1.0 (contact: repo maintainer)'}
PACE = 25          # seconds between any two Wikimedia requests
THUMB = 1280       # standard thumbnail size (per WMF guidance)

def get(url, timeout=90, tries=4):
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            last = e
            if e.code in (429, 500, 502, 503):
                wait = PACE * (i + 1)
                print('    HTTP %d, backoff %ds' % (e.code, wait), flush=True)
                time.sleep(wait); continue
            raise
    raise RuntimeError('retries exhausted: %s (%s)' % (url, last))

def is_image(b):
    if b[:8] == b'\x89PNG\r\n\x1a\n': return 'png'
    if b[:5] == b'<?xml' or b[:4] == b'<svg': return 'svg'
    if b[:2] == b'\xff\xd8': return 'jpg'
    if b[:4] == b'GIF8': return 'gif'
    if b[:4] == b'RIFF' and b[8:12] == b'WEBP': return 'webp'
    return None

def api(params):
    q = urllib.parse.urlencode(dict(params, format='json'))
    return json.loads(get('https://commons.wikimedia.org/w/api.php?' + q).decode('utf-8', 'replace'))

def fetch_file(fname, dest, meta_out=None):
    """Download a Commons file at standard thumb width; save metadata."""
    time.sleep(PACE)
    d = api({'action': 'query', 'titles': 'File:' + fname,
             'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size',
             'iiurlwidth': str(THUMB)})
    pages = d.get('query', {}).get('pages', {})
    info = None
    for p in pages.values():
        if 'imageinfo' in p:
            info = p['imageinfo'][0]
    if info is None:
        raise RuntimeError('no imageinfo for ' + fname)
    thumb = info.get('thumburl') or info.get('url')
    data = get(thumb)
    kind = is_image(data)
    if kind is None:
        raise RuntimeError('not an image (throttle page?) from ' + thumb)
    ext = os.path.splitext(dest)[1].lower().lstrip('.')
    if ext != kind:
        dest = os.path.splitext(dest)[0] + '.' + kind
    open(dest, 'wb').write(data)
    em = info.get('extmetadata', {})
    def meta(k):
        v = em.get(k, {}).get('value', '') or ''
        return re.sub(r'<[^>]+>', '', v).strip()
    if meta_out is not None:
        meta_out.update({
            'source_file': 'File:' + fname,
            'source_url': 'https://commons.wikimedia.org/wiki/File:' +
                          urllib.parse.quote(fname.replace(' ', '_')),
            'author': meta('Artist') or 'unknown',
            'license': meta('LicenseShortName') or 'see Commons page',
            'width': info.get('thumbwidth'), 'height': info.get('thumbheight'),
        })
    print('    saved %s (%d bytes, %s) <- %s' %
          (os.path.basename(dest), len(data), kind, fname), flush=True)
    return dest

def search_titles(q, limit=10):
    time.sleep(PACE)
    d = api({'action': 'query', 'list': 'search', 'srnamespace': '6',
             'srlimit': str(limit), 'srsearch': q})
    return [h['title'].replace('File:', '')
            for h in d.get('query', {}).get('search', [])]

AERIAL_TERMS = ('aerial', 'skysat', 'satellite', 'from air', 'from the air', 'bird')
def aerial_score(name):
    nl = name.lower(); s = 0
    for t in AERIAL_TERMS:
        if t in nl: s += 10
    if any(t in nl for t in ('logo', 'map', 'layout', 'poster', 'flag', 'grandstand')): s -= 25
    if nl.endswith(('.jpg', '.jpeg')): s += 2
    return s

# ---- job tables -------------------------------------------------------------
MAP_JOBS = {
    'r13_monza':  'Monza track map.svg',
    'r15_baku':   'Baku Formula One circuit map.svg',
}
AERIAL_QUERIES = {
    'r02_shanghai':    ['Shanghai International Circuit aerial', 'Shanghai International Circuit SkySat'],
    'r04_miami':       ['Miami International Autodrome aerial', 'Hard Rock Stadium circuit aerial'],
    'r06_monaco':      ['Circuit de Monaco aerial', 'Circuit de Monaco SkySat'],
    'r07_catalunya':   ['Circuit de Barcelona-Catalunya aerial', 'Circuit de Barcelona-Catalunya SkySat'],
    'r08_redbullring': ['Red Bull Ring aerial', 'Red Bull Ring SkySat'],
    'r09_silverstone': ['Silverstone Circuit aerial', 'Silverstone Circuit SkySat'],
    'r10_spa':         ['Circuit de Spa-Francorchamps aerial', 'Spa-Francorchamps SkySat'],
    'r11_hungaroring': ['Hungaroring aerial', 'Hungaroring SkySat'],
    'r13_monza':       ['Autodromo Nazionale Monza aerial', 'Monza circuit SkySat'],
    'r14_madring':     ['Madring aerial', 'Madrid circuit aerial'],
    'r15_baku':        ['Baku City Circuit aerial', 'Baku street circuit aerial'],
    'r17_marinabay':   ['Marina Bay Street Circuit aerial', 'Singapore circuit SkySat'],
    'r18_cota':        ['Circuit of the Americas aerial', 'Circuit of the Americas SkySat'],
    'r19_mexico':      ['Autodromo Hermanos Rodriguez aerial'],
    'r20_interlagos':  ['Autodromo Jose Carlos Pace aerial', 'Interlagos aerial'],
    'r21_vegas':       ['Las Vegas Strip Circuit aerial'],
    'r22_lusail':      ['Lusail International Circuit aerial'],
    'r23_yasmarina':   ['Yas Marina Circuit aerial', 'Yas Marina Circuit SkySat'],
}
# explicitly skip slugs that already have aerials
HAVE_AERIAL = {'r01_melbourne', 'r03_suzuka', 'r05_montreal',
               'r12_zandvoort', 'r16_sepang'}

def main():
    manifest = json.load(open(MANIFEST))
    by_slug = {m['slug']: m for m in manifest}

    # clean junk files written as HTML error pages
    for junk in ('r06_monaco_aerial.jpg', 'r13_monza_trackmap.svg',
                 'r15_baku_trackmap.svg'):
        p = os.path.join(OUT, junk)
        if os.path.exists(p) and open(p, 'rb').read(5) == b'<!DOC':
            os.remove(p); print('removed junk', junk, flush=True)

    # --- maps ----------------------------------------------------------------
    for slug, fname in MAP_JOBS.items():
        print('--- map', slug, flush=True)
        try:
            meta = {}
            dest = fetch_file(fname, os.path.join(OUT, slug + '_trackmap.svg'), meta)
            by_slug[slug]['map_local'] = os.path.basename(dest)
            by_slug[slug]['map_attribution'] = meta
        except Exception as e:
            print('    FAIL', e, flush=True)

    # --- aerials -------------------------------------------------------------
    for slug, queries in AERIAL_QUERIES.items():
        if slug in HAVE_AERIAL: continue
        dest_base = os.path.join(OUT, slug + '_aerial')
        if any(os.path.exists(dest_base + e) for e in ('.jpg', '.jpeg', '.png')):
            continue
        print('--- aerial', slug, flush=True)
        got = False
        for q in queries:
            try:
                cands = sorted(search_titles(q), key=lambda n: -aerial_score(n))
                cands = [c for c in cands if aerial_score(c) > 0]
            except Exception as e:
                print('    search FAIL', e, flush=True); continue
            if not cands:
                print('    no candidates:', q, flush=True); continue
            for cand in cands[:3]:
                try:
                    meta = {}
                    dest = fetch_file(cand, dest_base + '.jpg', meta)
                    by_slug[slug]['aerial_local'] = os.path.basename(dest)
                    by_slug[slug]['aerial_attribution'] = meta
                    got = True; break
                except Exception as e:
                    print('    dl FAIL', cand, e, flush=True)
            if got: break
        if not got:
            print('    NO AERIAL FOUND for', slug, flush=True)

    # drop a duplicate map render if both png+svg exist (prefer svg; keep r03)
    for m in manifest:
        ml = m.get('map_local')
        if ml and ml.endswith('.svg'):
            png = os.path.join(OUT, m['slug'] + '_trackmap.png')
            if os.path.exists(png) and m['slug'] != 'r03_suzuka':
                os.remove(png); print('removed duplicate png for', m['slug'], flush=True)

    json.dump(manifest, open(MANIFEST, 'w'), indent=2, ensure_ascii=False)
    print('MANIFEST UPDATED', flush=True)
    print('FINAL PASS DONE', flush=True)

if __name__ == '__main__':
    main()

