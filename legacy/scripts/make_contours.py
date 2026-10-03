import math
import random

W, H = 1400, 900
STROKE = '#075056'


def closed_contour(cx, cy, r, seed, n=72):
    rnd = random.Random(seed)
    p1, p2, p3 = (rnd.uniform(0, 6.28) for _ in range(3))
    a1, a2, a3 = (rnd.uniform(.05, .10), rnd.uniform(.03, .06), rnd.uniform(.015, .03))
    sx, sy = rnd.uniform(.85, 1.2), rnd.uniform(.8, 1.1)
    rot = rnd.uniform(0, 6.28)
    pts = []
    for i in range(n):
        t = i / n * 2 * math.pi
        ri = r * (1 + a1 * math.sin(3 * t + p1) + a2 * math.sin(5 * t + p2) + a3 * math.sin(8 * t + p3))
        x, y = math.cos(t) * ri * sx, math.sin(t) * ri * sy
        pts.append((cx + x * math.cos(rot) - y * math.sin(rot),
                    cy + x * math.sin(rot) + y * math.cos(rot)))
    return pts


def open_line(y0, seed, amp=26, n=26, slope=None):
    rnd = random.Random(seed)
    p1, p2 = rnd.uniform(0, 6.28), rnd.uniform(0, 6.28)
    if slope is None:
        slope = rnd.uniform(-.05, .05)
    pts = []
    for i in range(n):
        x = -80 + (W + 160) * i / (n - 1)
        y = y0 + slope * (x - W / 2) + amp * math.sin(2.2 * x / W * 6.28 + p1) + amp * .5 * math.sin(4.9 * x / W * 6.28 + p2)
        pts.append((x, y))
    return pts


def to_path(pts, closed):
    def seg(p0, p1, p2, p3):
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        return f'C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}'
    n = len(pts)
    d = f'M{pts[0][0]:.1f} {pts[0][1]:.1f}'
    rng = range(n) if closed else range(n - 1)
    for i in rng:
        p0, p1, p2, p3 = pts[(i - 1) % n], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        d += seg(p0, p1, p2, p3)
    if closed:
        d += 'Z'
    return d


# Each page gets its own terrain: hills = (cx, cy, radii, seed); lines = (y, amp, slope)
VARIANTS = {
    'about': {
        'hills': [(380, 430, [70, 130, 190, 250], 7), (1080, 320, [60, 115, 170], 21), (1260, 800, [90, 160], 33)],
        'lines': [(120, 26, None), (230, 26, None), (640, 30, None), (760, 30, None)],
        'labels': [(352, 352, '421 m'), (1052, 242, '398 m'), (1236, 722, '412 m')],
    },
    'services': {
        'hills': [(300, 520, [90, 170, 250, 330], 12)],
        'lines': [(90, 34, .03), (200, 30, .02), (700, 32, -.03), (810, 28, -.02)],
        'labels': [(268, 430, '512 m'), (240, 620, '366 m'), (900, 96, '445 m')],
    },
    'projects': {
        'hills': [(250, 260, [60, 110], 15), (700, 180, [50, 95, 140], 28), (1150, 300, [70, 130, 190], 41)],
        'lines': [(620, 24, None), (720, 26, None), (820, 24, None)],
        'labels': [(232, 240, '451 m'), (682, 162, '478 m'), (1132, 282, '407 m')],
    },
    'technology': {
        'hills': [(640, 330, [80, 150, 220, 290, 360], 19)],
        'lines': [(760, 34, .02), (840, 30, .02)],
        'labels': [(600, 350, '534 m'), (560, 560, '398 m'), (1180, 800, '372 m')],
    },
    'contact': {
        'hills': [(1180, 180, [60, 120, 180], 24)],
        'lines': [(300, 28, .03), (430, 26, .03), (560, 30, .02), (690, 28, .02), (820, 26, .01)],
        'labels': [(1136, 170, '389 m'), (420, 430, '302 m'), (900, 690, '288 m')],
    },
}

for name, spec in VARIANTS.items():
    paths = []
    for cx, cy, radii, seed in spec['hills']:
        for i, r in enumerate(radii):
            paths.append(to_path(closed_contour(cx, cy, r, seed, n=72 + i * 4), True))
    for i, (y, amp, slope) in enumerate(spec['lines']):
        paths.append(to_path(open_line(y, 100 + i + hash(name) % 50, amp=amp, slope=slope), False))

    body = '\n'.join(f'  <path d="{d}" />' for d in paths)
    label_markup = '\n'.join(
        f'    <text x="{x}" y="{y}">{t}</text>' for x, y, t in spec['labels'])
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" fill="none">
  <g stroke="{STROKE}" stroke-opacity="0.42" stroke-width="1.1" stroke-linecap="round">
{body}
  </g>
  <g fill="{STROKE}" fill-opacity="0.5" font-family="IBM Plex Mono, Consolas, monospace" font-size="11" letter-spacing="0.5">
{label_markup}
  </g>
</svg>
'''
    out = rf'C:\Users\Admin\geoland-kosova\assets\img\brand\contours-{name}.svg'
    open(out, 'w', encoding='utf-8', newline='\n').write(svg)
    print(f'contours-{name}.svg:', len(paths), 'paths')
