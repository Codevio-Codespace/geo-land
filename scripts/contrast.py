def lum(h):
    h = h.lstrip('#')
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    def c(v):
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b)

def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

PAIRS = [
    ('muted on paper', '#46585e', '#e4eef0'),
    ('muted on paper2', '#46585e', '#d9e4e8'),
    ('orange-2 on paper', '#b84000', '#e4eef0'),
    ('orange on ink', '#ff5b04', '#16232a'),
    ('muted-dark on ink', '#9fb2b8', '#16232a'),
    ('paper on ink', '#e4eef0', '#16232a'),
    ('ink on paper', '#16232a', '#e4eef0'),
    ('orange on paper', '#ff5b04', '#e4eef0'),
    ('ink on orange', '#16232a', '#ff5b04'),
    ('paper on orange', '#e4eef0', '#ff5b04'),
    ('green-2 links on paper', '#0a5f64', '#e4eef0'),
    ('sage on ink', '#a8c1c6', '#16232a'),
    ('ink on orange-hover', '#16232a', '#ff6e1f'),
]
for name, fg, bg in PAIRS:
    r = ratio(fg, bg)
    flag = 'OK' if r >= 4.5 else ('LARGE/UI' if r >= 3 else 'FAIL')
    print(f'{r:5.2f}  {flag:9} {name}')
