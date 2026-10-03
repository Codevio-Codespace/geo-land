import re
import sys

target = sys.argv[1]
main_id = sys.argv[2] if len(sys.argv) > 2 else ''

t = open('index.html', encoding='utf-8').read()

# strip main content, keep shell (nav, footer, lightbox)
t = re.sub(r'<main id="main">.*?</main>', '<main id="main">\n<!-- CONTENT -->\n  </main>', t, flags=re.S)

# aria-current: only the nav link matching target
for page in ['index', 'about', 'services', 'projects', 'technology', 'contact']:
    t = t.replace(' aria-current="page"', '')
t = t.replace(f'<a href="{target}">', f'<a href="{target}" aria-current="page">')

open(target, 'w', encoding='utf-8', newline='\n').write(t)
print('created', target)
