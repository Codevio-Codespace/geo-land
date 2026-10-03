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
    for tag in ['section', 'article', 'div', 'main', 'dialog', 'ul', 'ol', 'li', 'figure', 'picture', 'button', 'a', 'section']:
        o = len(re.findall(r'<' + tag + r'[\s>]', t))
        c = t.count('</' + tag + '>')
        if o != c:
            print('   TAG IMBALANCE', tag, o, 'open vs', c, 'close')
            ok = False
    if missing:
        ok = False
print('RESULT:', 'OK' if ok else 'ISSUES')
