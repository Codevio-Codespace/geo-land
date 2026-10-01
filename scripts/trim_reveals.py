import os
import re

ROOT = r'C:\Users\Admin\geoland-kosova'
FILES = ['index.html', 'about.html', 'services.html', 'projects.html', 'technology.html', 'contact.html']
KEEP = ['section-head', 'gallery-strip', 'teaser__photo', 'about-profile__figure', 'uav-grid__figure']

attr_re = re.compile(r'\s*data-reveal(?:-delay="\d+")?')

for name in FILES:
    path = os.path.join(ROOT, name)
    t = open(path, encoding='utf-8').read()

    def repl(match):
        tag = match.group(0)
        if 'data-reveal' not in tag:
            return tag
        if any(k in tag for k in KEEP):
            return tag
        return attr_re.sub('', tag)

    new = re.sub(r'<[a-zA-Z][^>]*>', repl, t)
    removed = t.count('data-reveal') - new.count('data-reveal')
    kept = new.count('data-reveal')
    if new != t:
        open(path, 'w', encoding='utf-8', newline='\n').write(new)
    print(f'{name}: kept {kept}, removed {removed}')
