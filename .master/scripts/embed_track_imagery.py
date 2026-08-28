#!/usr/bin/env python3
"""Embed 2026 track imagery into the track-design report.

- Scans .master/assets/tracks_2026/ for rNN_*_trackmap.* / rNN_*_aerial.* /
  r17_marinabay_pitbuilding.jpg
- Inserts an **Imagery:** line under each Round heading (relative links).
- Appends an '## 6. Imagery Index' section with Commons attribution from
  image_manifest.json.
"""
import glob, json, os, re

ASSETS = '/Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/assets/tracks_2026'
REPORT = ('/Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/'
          '.master/documents/track_design_report_2026_calendar.md')
REL = '../assets/tracks_2026'

SLUGS = {
    1: 'r01_melbourne', 2: 'r02_shanghai', 3: 'r03_suzuka', 4: 'r04_miami',
    5: 'r05_montreal', 6: 'r06_monaco', 7: 'r07_catalunya', 8: 'r08_redbullring',
    9: 'r09_silverstone', 10: 'r10_spa', 11: 'r11_hungaroring',
    12: 'r12_zandvoort', 13: 'r13_monza', 14: 'r14_madring', 15: 'r15_baku',
    16: 'r16_sepang', 17: 'r17_marinabay', 18: 'r18_cota', 19: 'r19_mexico',
    20: 'r20_interlagos', 21: 'r21_vegas', 22: 'r22_lusail', 23: 'r23_yasmarina',
}

def files_for(slug):
    d = {}
    hits = glob.glob(os.path.join(ASSETS, slug + '_trackmap.*'))
    if hits:
        d['map'] = os.path.basename(hits[0])
    hits = glob.glob(os.path.join(ASSETS, slug + '_aerial.*'))
    if hits:
        d['aerial'] = os.path.basename(hits[0])
    extra = os.path.join(ASSETS, slug + '_pitbuilding.jpg')
    if os.path.exists(extra):
        d['venue'] = os.path.basename(extra)
    extra = os.path.join(ASSETS, slug + '_sphere.jpg')
    if os.path.exists(extra):
        d['venue'] = os.path.basename(extra)
    return d

def imagery_line(rd, files):
    if not files:
        return ('*Imagery:* none available yet — see '
                '[image_manifest.json](%s/image_manifest.json) for status.'
                % REL)
    parts = []
    if 'map' in files:
        parts.append('[track map](%s/%s)' % (REL, files['map']))
    if 'aerial' in files:
        parts.append('[aerial](%s/%s)' % (REL, files['aerial']))
    if 'venue' in files:
        parts.append('[venue photo](%s/%s)' % (REL, files['venue']))
    return '*Imagery:* ' + ' · '.join(parts) + \
        ' *(Wikimedia Commons, see Imagery Index for attribution)*'

def build_index(manifest):
    rows = []
    for rd in sorted(SLUGS):
        slug = SLUGS[rd]
        m = manifest.get(slug, {})
        files = files_for(slug)
        def attr(kind):
            a = m.get(kind + '_attribution') or {}
            src = a.get('source_file') or (m.get('map_file') if kind == 'map' else None)
            author = a.get('author', '')
            lic = a.get('license', '')
            bits = []
            if src:
                page = ('https://commons.wikimedia.org/wiki/' +
                        src.replace(' ', '_')) if not src.startswith('http') else src
                bits.append('[%s](%s)' % (src.replace('File:', ''), page))
            if author:
                bits.append(author)
            if lic:
                bits.append(lic)
            return ', '.join(bits) if bits else 'see Commons'
        map_cell = ('[%s](%s/%s)' % (os.path.splitext(files['map'])[0].split('_', 2)[-1],
                                     REL, files['map'])) if 'map' in files else '—'
        aer_cell = ('[aerial photo](%s/%s)' % (REL, files['aerial'])) if 'aerial' in files else '—'
        rows.append('| %d | %s | %s | %s | %s | %s |' % (
            rd, slug.split('_', 1)[1].replace('_', ' ').title(),
            map_cell, aer_cell,
            attr('map') if 'map' in files else '—',
            attr('aerial') if 'aerial' in files else '—'))
    header = (
        '\n---\n\n'
        '## 6. Imagery Index\n\n'
        'All imagery is from Wikimedia Commons (rasterized thumbnails at 1280 px '
        'where applicable). Local copies live in `.master/assets/tracks_2026/`; '
        'machine-readable details in `image_manifest.json`. Circuits marked "—" '
        'have no freely-licensed aerial or map captured to date.\n\n'
        '| Rd | Circuit | Track map | Aerial | Map attribution | Aerial attribution |\n'
        '| -- | ------- | --------- | ------ | --------------- | ------------------ |\n')
    return header + '\n'.join(rows) + '\n'

def main():
    manifest = {m['slug']: m for m in json.load(open(os.path.join(ASSETS, 'image_manifest.json')))}
    text = open(REPORT).read()

    # idempotency: drop a previously generated imagery index AND stale imagery lines
    text = re.split(r'\n---\n\n## 6\. Imagery Index\n', text)[0].rstrip() + '\n'
    kept, prev_blank = [], False
    for ln in text.split('\n'):
        if ln.startswith('*Imagery:*'):
            continue
        blank = (ln.strip() == '')
        if blank and prev_blank:
            continue
        kept.append(ln)
        prev_blank = blank
    lines = kept
    out, inserted = [], 0
    for ln in lines:
        out.append(ln)
        m = re.match(r'^### Round (\d+) —', ln)
        if m:
            rd = int(m.group(1))
            slug = SLUGS.get(rd)
            if slug:
                out.append('')
                out.append(imagery_line(rd, files_for(slug)))
                inserted += 1
    text = '\n'.join(out).rstrip() + '\n' + build_index(manifest)
    print('imagery lines inserted:', inserted)
    open(REPORT, 'w').write(text)

if __name__ == '__main__':
    main()

