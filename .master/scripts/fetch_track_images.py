#!/usr/bin/env python3
"""Fetch overhead track maps + aerial photos for the 2026 F1 calendar from Wikimedia Commons."""
import json, os, sys, time, urllib.parse, urllib.request

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'tracks_2026')
os.makedirs(OUT, exist_ok=True)
UA = {'User-Agent': 'Formula1LegendsResearch/1.0 (local research script)'}

# slug -> (track-map search query, aerial search query)
CIRCUITS = [
    ('r01_melbourne',   'Track map Albert Park Circuit Melbourne', 'Albert Park Circuit aerial'),
    ('r02_shanghai',    'Track map Shanghai International Circuit', 'Shanghai International Circuit aerial'),
    ('r03_suzuka',      'Track map Suzuka Circuit',                'Suzuka Circuit aerial'),
    ('r04_miami',       'Track map Miami International Autodrome', 'Miami International Autodrome aerial'),
    ('r05_montreal',    'Track map Circuit Gilles Villeneuve',     'Circuit Gilles Villeneuve aerial'),
    ('r06_monaco',      'Track map Monaco Formula 1',              'Circuit de Monaco aerial'),
    ('r07_catalunya',   'Track map Circuit de Barcelona-Catalunya','Circuit de Barcelona-Catalunya aerial'),
    ('r08_redbullring', 'Track map Red Bull Ring',                 'Red Bull Ring aerial Spielberg'),
    ('r09_silverstone', 'Track map Silverstone Circuit',           'Silverstone Circuit aerial'),
    ('r10_spa',         'Track map Spa-Francorchamps',             'Spa-Francorchamps aerial'),
    ('r11_hungaroring', 'Track map Hungaroring',                   'Hungaroring aerial'),
    ('r12_zandvoort',   'Track map Zandvoort',                     'Circuit Park Zandvoort from air'),
    ('r13_monza',       'Track map Monza',                         'Autodromo Nazionale Monza aerial'),
    ('r14_madring',     'Track map Madring',                       'Madring circuit IFEMA'),
    ('r15_baku',        'Track map Baku City Circuit',             'Baku City Circuit aerial'),
    ('r16_sepang',      'Track map Sepang International Circuit',  'Sepang International Circuit aerial'),
    ('r17_marinabay',   'Track map Marina Bay Street Circuit',     'Marina Bay Street Circuit aerial'),
    ('r18_cota',        'Track map Circuit of the Americas',       'Circuit of the Americas aerial'),
    ('r19_mexico',      'Track map Autodromo Hermanos Rodriguez',  'Autodromo Hermanos Rodriguez aerial'),
    ('r20_interlagos',  'Track map Interlagos',                    'Autodromo Jose Carlos Pace aerial'),
    ('r21_vegas',       'Track map Las Vegas Strip Circuit',       'Las Vegas Strip Circuit aerial'),
    ('r22_lusail',      'Track map Lusail International Circuit',  'Lusail International Circuit aerial'),
    ('r23_yasmarina',   'Track map Yas Marina Circuit',            'Yas Marina Circuit aerial'),
]

def api(params, base='https://commons.wikimedia.org/w/api.php'):
    url = base + '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode('utf-8', 'replace'))

def search_files(query, limit=8):
    try:
        data = api({'action':'query','list':'search','srnamespace':'6','format':'json','srlimit':str(limit),'srsearch':query})
        return [h['title'] for h in data.get('query',{}).get('search',[])]
    except Exception as e:
        print('    search error:', e); return []

def pick(cands, exts=('.svg','.png','.jpg','.jpeg')):
    for t in cands:
        if t.lower().endswith(exts):
            return t
    return None

def download(title, dest, width=1400):
    name = title.replace('File:','')
    url = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + urllib.parse.quote(name)
    if not title.lower().endswith(('.jpg','.jpeg')):
        url += '?width=%d' % width
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r, open(dest,'wb') as f:
        f.write(r.read())
    return os.path.getsize(dest)

manifest = []
for slug, map_q, air_q in CIRCUITS:
    print(f'--- {slug}')
    entry = {'slug': slug}
    # 1) overhead track map
    cands = search_files(map_q)
    prefer = [t for t in cands if 'track map' in t.lower() or 'circuit' in t.lower() or 'outline' in t.lower()]
    t_map = pick(prefer) or pick(cands)
    if t_map:
        ext = '.png' if t_map.lower().endswith('.svg') else os.path.splitext(t_map)[1].lower()
        dest = os.path.join(OUT, f'{slug}_trackmap{ext}')
        try:
            sz = download(t_map, dest)
            print(f'    map : {t_map} -> {os.path.basename(dest)} ({sz} bytes)')
            entry['map_file'] = t_map; entry['map_local'] = os.path.basename(dest)
        except Exception as e:
            print('    map download FAILED:', e)
    else:
        print('    map : NO RESULT for', map_q)
    time.sleep(0.4)
    # 2) aerial / overhead photo
    cands2 = search_files(air_q)
    t_air = pick(cands2, ('.jpg','.jpeg','.png'))
    if t_air:
        ext = os.path.splitext(t_air)[1].lower()
        dest = os.path.join(OUT, f'{slug}_aerial{ext}')
        try:
            sz = download(t_air, dest, width=1600)
            print(f'    aerial: {t_air} -> {os.path.basename(dest)} ({sz} bytes)')
            entry['aerial_file'] = t_air; entry['aerial_local'] = os.path.basename(dest)
        except Exception as e:
            print('    aerial download FAILED:', e)
    else:
        print('    aerial: NO RESULT for', air_q)
    time.sleep(0.4)
    manifest.append(entry)

with open(os.path.join(OUT, 'image_manifest.json'), 'w') as f:
    json.dump(manifest, f, indent=2)
print('DONE. Manifest entries:', len(manifest))
