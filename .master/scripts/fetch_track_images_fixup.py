#!/usr/bin/env python3
import json, os, re, time, urllib.parse, urllib.request
OUT = '/Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/assets/tracks_2026'
UA = {'User-Agent': 'Formula1LegendsResearch/1.0 (local research)'}

def get(url, timeout=60, tries=4, base_delay=8):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 404) or e.code >= 500:
                if e.code == 404 and i >= 1: raise
                time.sleep(base_delay * (i + 1)); continue
            raise
    raise RuntimeError('retries exhausted: ' + url)

def wikitext(title):
    u = 'https://en.wikipedia.org/w/index.php?title=%s&action=raw' % urllib.parse.quote(title)
    return get(u).decode('utf-8', 'replace')

def dl(fname, dest, width=1400):
    u = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + urllib.parse.quote(fname)
    if not fname.lower().endswith(('.jpg', '.jpeg')): u += '?width=%d' % width
    d = get(u, timeout=90)
    open(dest, 'wb').write(d)
    return len(d)

def best_map_file(wt, hints):
    files = re.findall(r'(?:File:)?([^|\]\n{}]*?\.(?:svg|png))', wt, re.I)
    def sc(n):
        nl = n.lower(); s = 0
        if any(h in nl for h in hints): s += 5
        if 'map' in nl or 'circuit' in nl or 'track' in nl or 'layout' in nl: s += 3
        if nl.endswith('.svg'): s += 1
        if 'logo' in nl or 'flag' in nl: s -= 20
        return s
    c = sorted({f.strip() for f in files if sc(f) > 2}, key=lambda f: -sc(f))
    return c[0] if c else None

JOBS = [
    ('r10_spa',        'Circuit_de_Spa-Francorchamps', ['spa', 'francorchamps']),
    ('r13_monza',      'Autodromo_Nazionale_Monza',    ['monza']),
    ('r14_madring',    'Madring',                      ['madring', 'madrid']),
    ('r15_baku',       'Baku_City_Circuit',            ['baku']),
]
for slug, title, hints in JOBS:
    print('--- map fixup', slug, flush=True)
    try:
        wt = wikitext(title)
        f = best_map_file(wt, hints)
        print('    chosen:', f, flush=True)
        if f:
            ext = os.path.splitext(f)[1].lower()
            sz = dl(f, os.path.join(OUT, slug + '_trackmap' + ext))
            print('    saved', slug + '_trackmap' + ext, sz, flush=True)
    except Exception as e:
        print('    FAIL', e, flush=True)
    time.sleep(6)

# Zandvoort aerial retry
print('--- aerial fixup r12_zandvoort', flush=True)
try:
    sz = dl('Circuit Park Zandvoort from air 2016-08-24.jpg', os.path.join(OUT, 'r12_zandvoort_aerial.jpg'), width=1600)
    print('    saved r12_zandvoort_aerial.jpg', sz, flush=True)
except Exception as e:
    print('    FAIL', e, flush=True)
time.sleep(6)

# Slow aerial search pass for slugs still missing aerials
SLUGS = {
 'r04_miami': 'Miami International Autodrome', 'r06_monaco': 'Circuit de Monaco',
 'r07_catalunya': 'Circuit de Barcelona-Catalunya', 'r08_redbullring': 'Red Bull Ring Spielberg',
 'r09_silverstone': 'Silverstone Circuit', 'r10_spa': 'Spa-Francorchamps',
 'r11_hungaroring': 'Hungaroring', 'r13_monza': 'Autodromo Nazionale Monza',
 'r14_madring': 'Madring Madrid circuit', 'r15_baku': 'Baku City Circuit',
 'r17_marinabay': 'Marina Bay Street Circuit', 'r18_cota': 'Circuit of the Americas',
 'r19_mexico': 'Autodromo Hermanos Rodriguez', 'r20_interlagos': 'Autodromo Jose Carlos Pace Interlagos',
 'r21_vegas': 'Las Vegas Strip Circuit', 'r22_lusail': 'Lusail International Circuit',
 'r23_yasmarina': 'Yas Marina Circuit', 'r02_shanghai': 'Shanghai International Circuit',
}
def search(q):
    u = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(
        {'action':'query','list':'search','srnamespace':'6','format':'json','srlimit':'10','srsearch':q + ' aerial'})
    d = json.loads(get(u).decode('utf-8','replace'))
    return [h['title'].replace('File:','') for h in d.get('query',{}).get('search',[])]

for slug, name in SLUGS.items():
    if os.path.exists(os.path.join(OUT, slug + '_aerial.jpg')): continue
    print('--- aerial search', slug, flush=True)
    try:
        cands = [c for c in search(name) if c.lower().endswith(('.jpg','.jpeg','.png'))]
        if cands:
            ext = os.path.splitext(cands[0])[1].lower()
            sz = dl(cands[0], os.path.join(OUT, slug + '_aerial' + ext), width=1600)
            print('    saved', slug + '_aerial' + ext, '<-', cands[0], sz, flush=True)
        else:
            print('    no candidates', flush=True)
    except Exception as e:
        print('    FAIL', e, flush=True)
    time.sleep(12)
print('FIXUP DONE', flush=True)
