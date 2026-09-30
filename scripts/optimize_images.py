import os
import sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "research", "originals")
DST = os.path.join(ROOT, "assets", "img")
MANIFEST = os.path.join(ROOT, "research", "manifest.txt")

# slug (filename without extension) -> group/newname
MAP = {
    "images-services-gisimg": ("services", "gis"),
    "images-services-imgforestry": ("services", "surveying"),
    "images-services-mappingandremote": ("services", "mapping"),
    "images-services-agricultureimg": ("services", "agriculture"),
    "images-services-ortos": ("services", "orthophotos"),
    "images-projets-image": ("projects", "soil-map"),
    "images-projets-kfis1": ("projects", "kfis"),
    "images-projets-kaveko": ("projects", "vineyard-kaveko"),
    "images-projets-efr": ("projects", "spfn"),
    "images-projets-devvineyard": ("projects", "vineyard-register"),
    "images-projets-rahovec": ("projects", "vineyard-rahovec"),
    "images-projets-31": ("projects", "drenas"),
    "images-projets-21": ("projects", "prishtina-planning"),
    "images-projets-client-banner": ("projects", "geodetic-banner"),
    "images-projets-brezovica": ("projects", "brezovica"),
    "images-projets-digitalmap": ("projects", "digital-map"),
    "images-projets-reconstruction": ("projects", "cadastre-reconstruction"),
    "images-projets-gispeja": ("projects", "gis-peja"),
    "images-projets-imgaddresingsystem": ("projects", "addressing"),
    "images-services-uav-uav1": ("uav", "surveying-1"),
    "images-services-uav-IMG-20200718-WA0016": ("uav", "field-1"),
    "images-services-uav-IMG-20200718-WA0043": ("uav", "field-2"),
    "images-services-uav-ortho1": ("uav", "ortho-1"),
    "images-services-uav-ortho2": ("uav", "ortho-2"),
    "images-services-uav-ortho3": ("uav", "ortho-3"),
    "images-services-uav-orto4": ("uav", "ortho-4"),
    "images-services-uav-orto5": ("uav", "ortho-5"),
    "images-services-uav-pointcloud2": ("uav", "pointcloud"),
    "images-services-uav-dem1": ("uav", "dem-1"),
    "images-services-uav-dem2": ("uav", "dem-2"),
    "images-services-uav-dem3": ("uav", "dem-3"),
    "images-staff-menagment-img1": ("team", "management"),
    "images-staff-geodesy-img1": ("team", "geodesy"),
    "images-staff-sofwtaredeveloper-img1": ("team", "software"),
    "images-certificates-1": ("certs", "mafrd-forestry"),
    "images-certificates-2": ("certs", "iso-9001"),
    "images-certificates-3": ("certs", "kca-cadastre"),
    "images-companyprofile-CERTI": ("certs", "bureau-veritas"),
    "images-companyprofile-profilecompany": ("about", "profile"),
    "images-airbusGroup-AIRBUS": ("airbus", "partner"),
    "images-airbusGroup-intro": ("airbus", "intro"),
    "images-airbusGroup-r54519_9_constellation-imagery-062019": ("airbus", "constellation"),
}
# re-use the real agriculture service image for the broken team photo
MAP["images-services-agricultureimg"] = ("services", "agriculture")
EXTRA = {"images-services-agricultureimg": ("team", "agriculture")}

for i in range(1, 32):
    pass  # gallery handled below

WIDTHS = [1600, 900, 640]
lines = []
missing_map = []

def process(src_path, group, name):
    try:
        img = Image.open(src_path).convert("RGBA")
    except Exception as e:
        print("SKIP", src_path, e)
        return
    w0, h0 = img.size
    for w in WIDTHS:
        if w > w0 and w != WIDTHS[0]:
            continue
        ww = min(w, w0)
        hh = round(h0 * ww / w0)
        r = img.resize((ww, hh), Image.LANCZOS)
        out_dir = os.path.join(DST, group)
        os.makedirs(out_dir, exist_ok=True)
        base = os.path.join(out_dir, f"{name}-{ww}")
        r.save(base + ".webp", "WEBP", quality=78, method=5)
        bg = Image.new("RGB", r.size, (244, 245, 240))
        bg.paste(r, mask=r.split()[-1])
        bg.save(base + ".jpg", "JPEG", quality=80, optimize=True)
        lines.append(f"{group}/{name}-{ww}.webp|{ww}|{os.path.getsize(base + '.webp')}")

for fn in sorted(os.listdir(SRC)):
    slug, ext = os.path.splitext(fn)
    full = os.path.join(SRC, fn)
    if slug in MAP:
        group, name = MAP[slug]
        process(full, group, name)
        if slug in EXTRA:
            process(full, *EXTRA[slug])
    elif slug.startswith("images-gallery-"):
        num = slug.replace("images-gallery-", "")
        process(full, "gallery", f"field-{num}")
    else:
        missing_map.append(fn)

with open(MANIFEST, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print("outputs:", len(lines))
print("unmapped:", missing_map)
