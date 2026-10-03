import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from cms import content, db  # noqa: E402
from PIL import Image  # noqa: E402

ROOT = db.ROOT


def scan_media(base, alt=''):
    row = db.one('SELECT * FROM media WHERE base = ?', (base,))
    if row:
        return row['id']
    widths = []
    largest = None
    for w in (640, 900, 1600, 995, 674, 1263, 1251, 1020, 976, 780, 760, 750, 696, 508, 493, 440):
        path = os.path.join(ROOT, base.lstrip('/').replace('/', os.sep) + f'-{w}.jpg')
        if os.path.exists(path):
            widths.append(str(w))
            largest = path
    found = []
    folder, stem = os.path.split(base)
    disk = os.path.join(ROOT, folder.lstrip('/').replace('/', os.sep))
    if os.path.isdir(disk):
        prefix = stem + '-'
        for fn in os.listdir(disk):
            m = re.match(re.escape(prefix) + r'(\d+)\.(?:jpg|webp)$', fn)
            if m:
                found.append(int(m.group(1)))
    widths = sorted(set(int(w) for w in widths) | set(found), reverse=True)
    if not widths:
        print('  !! no files for', base)
        return None
    big = os.path.join(ROOT, base.lstrip('/').replace('/', os.sep) + f'-{widths[0]}.jpg')
    img = Image.open(big)
    cur = db.execute(
        'INSERT INTO media (base, original_name, alt, width, height, widths, is_upload, created_at) '
        'VALUES (?,?,?,?,?,?,0,?)',
        (base, os.path.basename(base), alt, img.width, img.height,
         ','.join(str(w) for w in widths), db.now()))
    return cur.lastrowid


SERVICES = [
    dict(anchor='gis', name='GIS & Software Development', sort=10,
         short_scope='Spatial data infrastructure, Web-GIS and software for land, agriculture and forestry.',
         scope_items='''Data acquisition and digitisation
Data management and maintenance
Data conversion and integration
Data validation and processing
Analyses and evaluations
GIS project management
System integration (EAI)
Data and services hosting / mash-up
Development and programming of geo components
Design of geo infrastructures
GIS operation (outsourcing)''',
         deliverables='Deliverables — desktop GIS · mobile GIS/LBS · geo service server · geodata server · DBMS storage · GDI components · Web-GIS for agriculture, forestry and local government',
         image='/assets/img/services/gis'),
    dict(anchor='surveying', name='Surveying', sort=20,
         short_scope='Geodetic control networks, engineering surveying and monitoring for demanding construction.',
         scope_items='''Geodetic control networks — design, reconnaissance, establishment
Surveying, processing and adjustment, analysis
Urban planning
Engineering — tunnel and railway construction
Mining, roads and bridges
Hydropower plants
Monitoring''',
         deliverables='Deliverables — geodetic control networks · engineering set-out · deformation monitoring',
         image='/assets/img/services/surveying'),
    dict(anchor='mapping', name='Mapping & Remote Sensing', sort=30,
         short_scope='2D and 3D mapping, satellite imagery interpretation and land-cover analysis.',
         scope_items='''Digital 2D mapping
Digital 3D mapping
Mobile mapping
Forestry, agriculture, mining and geology mapping
Satellite imagery interpretation and classification
Land cover and land usage maps
Identification and delineation of forest types
Monitoring and watershed management''',
         deliverables='Deliverables — 2D and 3D maps · land cover · forest type delineation',
         image='/assets/img/services/mapping'),
    dict(anchor='agri', name='Agriculture & Forestry', sort=40,
         short_scope='Land registration, consolidation, forest and agriculture inventory, GIS-based registers.',
         scope_items='''Agriculture land registration
Rural development
Land consolidation
Agriculture and forestry inventory
Creation of GIS-based registers
Project management''',
         deliverables='Deliverables — registers · inventories · consolidation and rural development plans',
         image='/assets/img/services/agriculture'),
    dict(anchor='ortho', name='Orthophotos', sort=50,
         short_scope='Aerial imagery and orthophotos for Kosovo, Albania and North Macedonia.',
         scope_items='',
         scope_paragraph='For the purpose of urban-spatial planning, Geo&Land offers different aerial images and orthophotos for Kosovo, Albania and North Macedonia. In order to manage urban, development and legalization plans, we offer a GIS municipal portal.',
         deliverables='Deliverables — orthophotos · aerial imagery · GIS municipal portal',
         image='/assets/img/services/orthophotos'),
    dict(anchor='uav', name='Aerial Data Collection — UAV Surveying', sort=60,
         short_scope='Certified operators; UAV LiDAR survey deliverables at up to 1 cm/pixel.',
         scope_items='''Mapping
Agriculture and forestry
Mining and volume calculation
Vegetation and crop diagnosis
Oil and gas
Infrastructure and utilities
Emergency and disaster response''',
         scope_paragraph='Certified UAV operators control data capture, analysis and archival — with UAV LiDAR survey deliverables at up to 1 cm/pixel resolution.',
         deliverables='Deliverables — surveying · orthophoto · point cloud · DEM',
         image='/assets/img/uav/surveying-1'),
]

MILESTONES = [
    (2019, 'UAV surveying service launched; AIRBUS partnership presented.'),
    (2018, 'Soil map of the Municipality of Rahovec, as part of a consortium.'),
    (2017, 'KFIS GIS module with FAO; database project for the Ministry of Environment and Spatial Planning; expropriation application for the Drenas economic zone.'),
    (2015, 'KFIS training for the Kosovo Forest Information System.'),
    (2014, 'INTERGEO conference attendance; KAVEKO workshop; Geo&Land organizes the international conference on Geoinformation, Space and Defence.'),
    (2013, 'Brezovica Resort expropriation across 3,000 ha, contracted by Deloitte/USAID.'),
    (2012, 'USAID contract — creation of digital and hard-copy maps for municipalities in Kosovo; farmer register system completed.'),
    (2011, 'Farmer Register System delivered as part of an EU-financed project; long-term forestry management plans contract with the Kosovo Forest Agency; contracts with the Ministry of Agriculture for the vineyard register.'),
]

FEATURED = {'brezovica': 1, 'vineyard-rahovec': 2, 'kfis-ddi': 3, 'municipal-gis': 4}


def main():
    db.init_schema()
    if db.one('SELECT COUNT(*) c FROM projects')['c']:
        print('already seeded — nothing to do')
        return
    service_ids = {}
    for spec in SERVICES:
        image_id = scan_media(spec['image'])
        db.execute(
            'INSERT INTO services (anchor, name, short_scope, scope_items, scope_paragraph, '
            'deliverables, image_media_id, sort, published, updated_at) VALUES (?,?,?,?,?,?,?,?,1,?)',
            (spec['anchor'], spec['name'], spec['short_scope'], spec['scope_items'],
             spec.get('scope_paragraph', ''), spec['deliverables'], image_id, spec['sort'], db.now()))
        service_ids[spec['anchor']] = True
    for year, text in MILESTONES:
        db.execute('INSERT INTO milestones (year, text, sort, published, updated_at) VALUES (?,?,100,1,?)',
                   (year, text, db.now()))

    projects = json.load(open(os.path.join(ROOT, 'scripts', 'projects_seed.json'), encoding='utf-8'))
    for p in projects:
        img = p['img']
        base = re.sub(r'-\d+$', '', img)
        if not base.startswith('/'):
            base = '/' + base
        alt = p['title']
        media_id = scan_media(base, alt)
        slug = content.slugify(p['title'])
        featured = 1 if p['id'] in FEATURED else 0
        rank = FEATURED.get(p['id'], 100)
        db.execute(
            'INSERT INTO projects (slug, title, category, year, org, description, image_media_id, '
            'featured, featured_rank, published, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,1,?,?)',
            (slug, p['title'], p['cat'], p.get('year') or None, p.get('org', ''),
             p.get('desc', ''), media_id, featured, rank, db.now(), db.now()))
    counts = {t: db.one(f'SELECT COUNT(*) c FROM {t}')['c']
              for t in ('services', 'milestones', 'projects', 'media')}
    print(f"seeded: {counts['services']} services, {counts['milestones']} milestones, "
          f"{counts['projects']} projects, {counts['media']} media rows")


if __name__ == '__main__':
    main()
