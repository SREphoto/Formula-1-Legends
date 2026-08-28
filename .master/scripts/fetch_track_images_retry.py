#!/usr/bin/env python3
"""Targeted aerial retry with alternate query terms (paced 20s)."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from fetch_track_images_final import fetch_file, search_titles, aerial_score, OUT

RETRY = {
    'r04_miami':     ['Miami International Autodrome satellite',
                      'Hard Rock Stadium Miami satellite',
                      'Miami Gardens Florida aerial'],
    'r14_madring':   ['Valdebebas aerial', 'Madring construction',
                      'IFEMA Madrid aerial'],
    'r21_vegas':     ['Las Vegas Grand Prix', 'Las Vegas Strip Circuit',
                      'Las Vegas aerial satellite'],
    'r22_lusail':    ['Lusail circuit', 'Lusail SkySat',
                      'Lusail International Circuit'],
    'r09_silverstone': ['Silverstone SkySat', 'Silverstone aerial view'],
}
manifest_path = os.path.join(OUT, 'image_manifest.json')
manifest = json.load(open(manifest_path))
by_slug = {m['slug']: m for m in manifest}

for slug, queries in RETRY.items():
    if any(os.path.exists(os.path.join(OUT, slug + '_aerial.' + e))
           for e in ('jpg', 'jpeg', 'png')):
        print('skip', slug, '(have aerial)', flush=True)
        continue
    print('--- retry', slug, flush=True)
    got = False
    for q in queries:
        try:
            cands = [c for c in sorted(search_titles(q), key=lambda n: -aerial_score(n))
                     if aerial_score(c) > 0]
        except Exception as e:
            print('  search FAIL', e, flush=True); continue
        if not cands:
            print('  no candidates:', q, flush=True); continue
        for cand in cands[:2]:
            try:
                meta = {}
                dest = fetch_file(cand, os.path.join(OUT, slug + '_aerial.jpg'), meta)
                by_slug[slug]['aerial_local'] = os.path.basename(dest)
                by_slug[slug]['aerial_attribution'] = meta
                got = True; break
            except Exception as e:
                print('  dl FAIL', cand, e, flush=True)
        if got: break
    if not got:
        print('  NO AERIAL for', slug, flush=True)

json.dump(manifest, open(manifest_path, 'w'), indent=2, ensure_ascii=False)
print('RETRY DONE', flush=True)
