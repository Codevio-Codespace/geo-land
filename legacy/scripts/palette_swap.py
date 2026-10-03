import glob
import os

ROOT = r'C:\Users\Admin\geoland-kosova'
REPL = [
    ('#06120e', '#16232a'),
    ('#0a5c5a', '#075056'),
    ('#f87800', '#ff5b04'),
    ('#f4f5f0', '#e4eef0'),
    ('#9aa8a0', '#9fb2b8'),
    ('rgba(6, 18, 14,', 'rgba(22, 35, 42,'),
    ('rgba(244, 245, 240,', 'rgba(228, 238, 240,'),
    ('rgba(0, 72, 32, .06)', 'rgba(7, 80, 86, .08)'),
]

files = glob.glob(os.path.join(ROOT, '*.html')) + glob.glob(os.path.join(ROOT, 'assets', 'css', '*.css')) + [os.path.join(ROOT, 'favicon.svg')]
for path in files:
    t = open(path, encoding='utf-8').read()
    original = t
    for old, new in REPL:
        t = t.replace(old, new)
    if t != original:
        open(path, 'w', encoding='utf-8', newline='\n').write(t)
        print('updated', os.path.basename(path))

# verify no old palette remnants
leftovers = 0
for path in files:
    t = open(path, encoding='utf-8').read()
    for old, _ in REPL:
        if old in t:
            print('LEFTOVER', old, 'in', os.path.basename(path))
            leftovers += 1
print('leftovers:', leftovers)
