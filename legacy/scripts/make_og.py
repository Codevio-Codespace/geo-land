import os
from PIL import Image

ROOT = r'C:\Users\Admin\geoland-kosova'
PAIRS = {
    'og-home': 'assets/img/uav/ortho-1-995.jpg',
    'og-about': 'assets/img/gallery/field-008-640.jpg',
    'og-services': 'assets/img/services/gis-800.jpg',
    'og-projects': 'assets/img/projects/drenas-1251.jpg',
    'og-technology': 'assets/img/uav/ortho-3-1215.jpg',
    'og-contact': 'assets/img/gallery/field-001-640.jpg',
}
W, H = 1200, 630
out_dir = os.path.join(ROOT, 'assets', 'img', 'brand')
os.makedirs(out_dir, exist_ok=True)

for name, rel in PAIRS.items():
    img = Image.open(os.path.join(ROOT, rel)).convert('RGB')
    w, h = img.size
    scale = max(W / w, H / h)
    nw, nh = round(w * scale), round(h * scale)
    img = img.resize((nw, nh), Image.LANCZOS)
    left = (nw - W) // 2
    top = (nh - H) // 2
    img = img.crop((left, top, left + W, top + H))
    img.save(os.path.join(out_dir, name + '.jpg'), 'JPEG', quality=82, optimize=True)
    print(name, os.path.getsize(os.path.join(out_dir, name + '.jpg')))
