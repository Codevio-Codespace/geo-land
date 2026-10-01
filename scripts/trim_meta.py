import os

ROOT = r'C:\Users\Admin\geoland-kosova'
TARGETS = {
    'index.html': ['Selected', 'Prishtina', 'Field → map → decision'],
    'about.html': ['Prishtina, Kosovo', 'Our standard', 'Since establishment', 'Join Geo&Land'],
    'services.html': ['Select a discipline', 'How we work'],
    'technology.html': ['UAV surveying', 'Kosovo · Albania · North Macedonia', 'Systems we have built'],
    'contact.html': ['Prishtina, Kosovo'],
}

for name, labels in TARGETS.items():
    path = os.path.join(ROOT, name)
    t = open(path, encoding='utf-8').read()
    total = 0
    for label in labels:
        needle = f'<span class="mono muted">{label}</span>'
        count = t.count(needle)
        if count != 1:
            print(f'  WARN {name}: "{label}" found {count} times — skipped')
            continue
        # remove the span plus its line's leading whitespace and trailing newline
        line = f'            {needle}\n'
        if line in t:
            t = t.replace(line, '', 1)
        else:
            t = t.replace(needle, '', 1)
        total += 1
    open(path, 'w', encoding='utf-8', newline='\n').write(t)
    print(f'{name}: removed {total} metas')
