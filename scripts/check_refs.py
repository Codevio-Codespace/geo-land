import re
import os
import sys

root = r'C:\Users\Admin\geoland-kosova'
os.chdir(root)

ok = True
for page in sys.argv[1:] or ['index.html']:
    if not os.path.exists(page):
        print('MISSING PAGE', page)
        ok = False
        continue
    t = open(page, encoding='utf-8').read()
    refs = set(re.findall(r'(?:src|srcset|href)="([^"#][^"]*\.(?:jpg|webp|png|svg|css|js))"', t))
    missing = sorted(p for p in refs if not os.path.exists(p))
    stubs = re.findall(r'<!-- [A-Z]+ -->', t)
    print(page, '| refs:', len(refs), '| missing:', missing, '| stubs:', stubs)
    if missing:
        ok = False
print('RESULT:', 'OK' if ok else 'ISSUES')
