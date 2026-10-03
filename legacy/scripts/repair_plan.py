import re

p = r'C:\Users\Admin\geoland-kosova\docs\plans\2026-10-01-geoland-kosova-website.md'
t = open(p, encoding='utf-8').read()

# Specific repairs first
t = t.replace('`?`', '`\u2192`')
t = t.replace('0fr?1fr', '0fr\u21921fr')
t = t.replace('h2?h3', 'h2\u2192h3')
t = t.replace('2011?2019', '2011\u21922019')
t = t.replace('`/`?`-`', '`/`\u2192`-`')
t = t.replace('? no output', '\u2192 no output')
t = t.replace('only ? original width', 'only \u2264 original width')

# Protect legitimate question marks with sentinel
for legit in ['inlined? no', 'com?subject', 'org? }', '`<noscript>`? Simpler', 'maps?q=', 'paper? (keep']:
    t = t.replace(legit, legit.replace('?', '\x00'))

# All remaining ' ? ' are lost arrows
t = t.replace(' ? ', ' \u2192 ')
t = t.replace(' ?`', ' \u2192`')

# Restore legitimate question marks
t = t.replace('\x00', '?')

open(p, 'w', encoding='utf-8', newline='').write(t)
print('done. arrows:', t.count('\u2192'), 'leq:', t.count('\u2264'), 'section:', t.count('\u00a7'), 'middot:', t.count('\u00b7'))
for m in re.finditer(r'.{15}\?.{15}', t, re.S):
    print('remaining:', repr(m.group(0)))
