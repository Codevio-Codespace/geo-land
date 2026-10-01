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
    ('muted on paper', '#56605a', '#f4f5f0'),
    ('muted on paper2', '#56605a', '#e8eae2'),
    ('orange-2 on paper', '#d96700', '#f4f5f0'),
    ('orange on ink', '#f87800', '#06120e'),
    ('muted-dark on ink', '#9aa8a0', '#06120e'),
    ('paper on ink', '#f4f5f0', '#06120e'),
    ('ink on paper', '#06120e', '#f4f5f0'),
    ('orange on paper', '#f87800', '#f4f5f0'),
    ('ink on orange', '#06120e', '#f87800'),
    ('paper on orange', '#f4f5f0', '#f87800'),
    ('green-2 links on paper', '#0a5c5a', '#f4f5f0'),
    ('sage on ink', '#c8d8d0', '#06120e'),
]
for name, fg, bg in PAIRS:
    r = ratio(fg, bg)
    flag = 'OK' if r >= 4.5 else ('LARGE/UI' if r >= 3 else 'FAIL')
    print(f'{r:5.2f}  {flag:9} {name}')
