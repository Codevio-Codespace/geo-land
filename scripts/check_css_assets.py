import glob
import os
import re

root = r'C:\Users\Admin\geoland-kosova'
missing = []
for css in glob.glob(os.path.join(root, 'assets', 'css', '*.css')):
    t = open(css, encoding='utf-8').read()
    for url in re.findall(r'url\("([^"]+)"\)', t):
        path = os.path.normpath(os.path.join(os.path.dirname(css), url))
        if not os.path.exists(path):
            missing.append((os.path.basename(css), url))
print('missing css assets:', missing if missing else 'none')
