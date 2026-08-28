#!/usr/bin/env python3
"""V2: resolve track-map & aerial filenames from article wikitext, then direct-download from Commons. Render maplink GeoJSON if needed."""
import json, os, re, time, urllib.parse, urllib.request

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'tracks_2026')
os.makedirs(OUT, exist_ok=True)
UA = {'User-Agent': 'Formula1LegendsResearch/1.0 (contact: local)'}

ARTICLES = [
 ('r01_melbourne','Albert_Park_Circuit'), ('r02_shanghai','Shanghai_International_Circuit'),
 ('r03_suzuka','Suzuka_International_Racing_Course'), ('r04_miami','Miami_International_Autodrome'),
 ('r05_montreal','Circuit_Gilles_Villeneuve'), ('r06_monaco','Circuit_de_Monaco'),
 ('r07_catalunya','Circuit_de_Barcelona-Catalunya'), ('r08_redbullring','Red_Bull_Ring'),
 ('r09_silverstone','Silverstone_Circuit'), ('r10_spa','Circuit_de_Spa-Francorchamps'),
 ('r11_hungaroring','Hungaroring'), ('r12_zandvoort','Circuit_Zandvoort'),
 ('r13_monza','Autodromo_Nazionale_Monza'), ('r14_madring','Madring'),
 ('r15_baku','Baku_City_Circuit'), ('r16_sepang','Sepang_International_Circuit'),
 ('r17_marinabay','Marina_Bay_Street_Circuit'), ('r18_cota','Circuit_of_the_Americas'),
 ('r19_mexico','Autódromo_Hermanos_Rodríguez'), ('r20_interlagos','Autódromo_José_Carlos_Pace'),
 ('r21_vegas','Las_Vegas_Strip_Circuit'), ('r22_lusail','Lusail_International_Circuit'),
 ('r23_yasmarina','Yas_Marina_Circuit'),
]

def get(url, timeout=40, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 429 or e.code >= 500:
                time.sleep(6 * (i + 1)); continue
            raise
    raise RuntimeError('retries exhausted: ' + url)

def fetch_wikitext(title):
    url = 'https://en.wikipedia.org/w/index.php?title=%s&action=raw' % urllib.parse.quote(title)
    return get(url).decode('utf-8', 'replace')

def dl_commons(fname, dest, width=1400):
    url = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + urllib.parse.quote(fname)
    if not fname.lower().endswith(('.jpg', '.jpeg')):
        url += '?width=%d' % width
    data = get(url, timeout=90)
    with open(dest, 'wb') as f:
        f.write(data)
    return len(data)

def render_geojson_svg(geo, dest, w=1000):
    coords = []
    def walk(o):
        if isinstance(o, dict):
            if 'coordinates' in o:
                c = o['coordinates']
                if isinstance(c[0], (int, float)): coords.append(c)
                else:
                    for x in c: walk({'coordinates': x})
            else:
                for v in o.values(): walk(v)
        elif isinstance(o, list):
            for v in o: walk(v if isinstance(v, (dict, list)) else None) if isinstance(v, (dict, list)) else None
    walk(geo)
    if len(coords) < 5:
        raise RuntimeError('too few coords: %d' % len(coords))
    lons = [c[0] for c in coords]; lats = [c[1] for c in coords]
    minx, maxx, miny, maxy = min(lons), max(lons), min(lats), max(lats)
    pad, h = 40, None
    scale = (w - 2 * pad) / max(maxx - minx, 1e-9)
    h = int((maxy - miny) * scale) + 2 * pad
    def px(lon, lat):
        return pad + (lon - minx) * scale, h - pad - (lat - miny) * scale
    pts = ' '.join('%.2f,%.2f' % px(lo, la) for lo, la in coords)
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">'
           '<rect width="100%%" height="100%%" fill="#10141c"/>'
           '<polyline points="%s" fill="none" stroke="#e10600" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>'
           '</svg>') % (w, h, w, h, pts)
    with open(dest, 'w') as f:
        f.write(svg)
    return len(coords)

manifest, report = [], []
for slug, title in ARTICLES:
    print('---', slug, flush=True)
    entry = {'slug': slug, 'article': title}
    try:
        wt = fetch_wikitext(title)
    except Exception as e:
        print('   wikitext FAIL', e, flush=True); wt = ''
    time.sleep(1.0)
    files = re.findall(r'File:([^|\]\n]+?\.(?:svg|png|jpe?g))', wt, re.I)
    mapgeo = re.search(r'maplink\|from=([^|}]+?\.map)', wt, re.I) or re.search(r'Data:([^|}\s]+?\.map)', wt)
    def score(n):
        nl = n.lower(); s = 0
        if 'track map' in nl or 'map' in nl: s += 6
        if 'layout' in nl or 'circuit' in nl or 'track' in nl: s += 2
        if 'logo' in nl or 'flag' in nl or 'icon' in nl or 'commons' in nl: s -= 20
        if nl.endswith(('.jpg', '.jpeg')): s -= 3
        return s
    mapfile = None
    m_tm = re.search(r'track_map\s*=\s*(?:\[\[)?File:([^|\]\n]+)', wt, re.I)
    if m_tm: mapfile = m_tm.group(1).strip()
    else:
        cand = sorted({f for f in files if score(f) > 0}, key=lambda f: -score(f))
        mapfile = cand[0] if cand else None
    if mapfile:
        ext = os.path.splitext(mapfile)[1].lower()
        dest = os.path.join(OUT, slug + '_trackmap' + ext)
        try:
            sz = dl_commons(mapfile, dest)
            print('    map:', mapfile, '->', os.path.basename(dest), sz, flush=True)
            entry['map_file'] = 'File:' + mapfile; entry['map_local'] = os.path.basename(dest)
        except Exception as e:
            print('    map dl FAIL:', mapfile, e, flush=True); mapfile = None
    if not mapfile and mapgeo:
        gname = mapgeo.group(1).strip()
        try:
            url = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + urllib.parse.quote(gname)
            geo = json.loads(get(url).decode('utf-8', 'replace'))
            dest = os.path.join(OUT, slug + '_trackmap.svg')
            n = render_geojson_svg(geo, dest)
            print('    map(GEOJSON):', gname, '->', os.path.basename(dest), n, 'pts', flush=True)
            entry['map_file'] = 'Data:' + gname + ' (rendered)'; entry['map_local'] = os.path.basename(dest)
        except Exception as e:
            print('    geojson render FAIL:', gname, e, flush=True)
    time.sleep(0.7)
    airfile = None
    acand = [f for f in files if re.search(r'aerial|from[_ ]air|from the air', f, re.I)]
    if acand:
        airfile = sorted(acand, key=lambda f: -score(f))[0]
        ext = os.path.splitext(airfile)[1].lower()
        dest = os.path.join(OUT, slug + '_aerial' + ext)
        try:
            sz = dl_commons(airfile, dest, width=1600)
            print('    aerial:', airfile, '->', os.path.basename(dest), sz, flush=True)
            entry['aerial_file'] = 'File:' + airfile; entry['aerial_local'] = os.path.basename(dest)
        except Exception as e:
            print('    aerial dl FAIL:', airfile, e, flush=True)
    else:
        print('    aerial: none in article', flush=True)
    manifest.append(entry)
    time.sleep(0.7)

with open(os.path.join(OUT, 'image_manifest.json'), 'w') as f:
    json.dump(manifest, f, indent=2)
print('DONE', len(manifest), flush=True)
