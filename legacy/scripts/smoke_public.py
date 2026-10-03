import json
import urllib.request

base = 'http://127.0.0.1:4173'
api = json.load(urllib.request.urlopen(base + '/api/projects'))
print('api count:', api['count'], '| first img:', api['projects'][0]['img'])
slug = [p['id'] for p in api['projects'] if 'Brezovica' in p['title']][0]
print('brezovica slug:', slug)
html = urllib.request.urlopen(base + '/project/' + slug).read().decode()
print('project page title:', html.split('<title>')[1].split('</title>')[0])
print('root-relative image:', '/assets/img/projects/brezovica' in html, '| gallery:', 'gallery-strip' in html, '| og:image:', 'og:image' in html)
idx = urllib.request.urlopen(base + '/index.html').read().decode()
print('featured cards:', idx.count('feat-card"'), '| feat rows:', idx.count('feat-row"'), '| svc rows:', idx.count('svc-index__row'))
svc = urllib.request.urlopen(base + '/services.html').read().decode()
anchors = [a for a in ['gis', 'surveying', 'mapping', 'agri', 'ortho', 'uav'] if f'id="{a}"' in svc]
print('service articles:', svc.count('<article class="svc'), '| anchors:', anchors, '| uav note:', 'svc-note' in svc)
ab = urllib.request.urlopen(base + '/about.html').read().decode()
print('milestones:', ab.count('<li><span class="mono">'))
sm = urllib.request.urlopen(base + '/sitemap.xml').read().decode()
print('sitemap project urls:', sm.count('/project/'))
