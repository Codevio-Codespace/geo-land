import hashlib
import io
import os

from PIL import Image, ImageOps

from . import db

ROOT = db.ROOT
UPLOAD_DIR = os.path.join(ROOT, 'assets', 'uploads')
UPLOAD_URL = '/assets/uploads'
MAX_FILE = 20 * 1024 * 1024
ALLOWED_EXT = {'jpg', 'jpeg', 'png', 'webp'}
WIDTHS = (1600, 900, 640)
PAPER = (228, 238, 240)


def _ext_ok(filename):
    return '.' in (filename or '') and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXT


def save_upload(data: bytes, filename: str, alt: str = ''):
    if not data:
        return None, 'The uploaded file is empty.'
    if len(data) > MAX_FILE:
        return None, 'Image is larger than the 20 MB limit.'
    if not _ext_ok(filename):
        return None, 'Only JPG, PNG or WebP images are allowed.'
    try:
        probe = Image.open(io.BytesIO(data))
        probe.verify()
        img = Image.open(io.BytesIO(data))
        img = ImageOps.exif_transpose(img)
        img.load()
    except Exception:
        return None, 'This file is not a readable image.'

    hash8 = hashlib.sha256(data).hexdigest()[:8]
    base = f'{UPLOAD_URL}/u{hash8}'
    existing = db.one('SELECT * FROM media WHERE base = ?', (base,))
    if existing:
        return existing['id'], None

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    widths = sorted({min(w, img.width) for w in WIDTHS if w <= img.width} or {img.width}, reverse=True)
    largest = None
    for w in widths:
        h = round(img.height * w / img.width)
        r = img.resize((w, h), Image.LANCZOS)
        stem = os.path.join(UPLOAD_DIR, f'u{hash8}-{w}')
        r.convert('RGBA').save(stem + '.webp', 'WEBP', quality=78, method=5)
        bg = Image.new('RGB', r.size, PAPER)
        if r.mode in ('RGBA', 'LA', 'P'):
            r = r.convert('RGBA')
            bg.paste(r, mask=r.split()[-1])
        else:
            bg.paste(r.convert('RGB'))
        bg.save(stem + '.jpg', 'JPEG', quality=80, optimize=True)
        largest = (w, h)

    cur = db.execute(
        'INSERT INTO media (base, original_name, alt, width, height, widths, is_upload, created_at) '
        'VALUES (?,?,?,?,?,?,1,?)',
        (base, os.path.basename(filename or ''), alt or '', largest[0], largest[1],
         ','.join(str(w) for w in widths), db.now()))
    return cur.lastrowid, None


def usage(media_id):
    refs = []
    row = db.one('SELECT title FROM projects WHERE image_media_id = ?', (media_id,))
    if row:
        refs.append(f'project “{row["title"]}”')
    rows = db.query(
        'SELECT p.title FROM project_images pi JOIN projects p ON p.id = pi.project_id '
        'WHERE pi.media_id = ?', (media_id,))
    refs.extend(f'project “{r["title"]}”' for r in rows)
    row = db.one('SELECT name FROM services WHERE image_media_id = ?', (media_id,))
    if row:
        refs.append(f'service “{row["name"]}”')
    return refs


def delete_media(media_id):
    row = db.one('SELECT * FROM media WHERE id = ?', (media_id,))
    if not row:
        return 'Image not found.'
    refs = usage(media_id)
    if refs:
        return 'Still used by ' + ', '.join(refs) + ' — remove it there first.'
    if row['is_upload']:
        for w in (row['widths'] or '').split(','):
            if not w:
                continue
            stem = os.path.join(UPLOAD_DIR, row['base'].rsplit('/', 1)[1] + f'-{w}')
            for ext in ('.webp', '.jpg'):
                try:
                    os.remove(stem + ext)
                except OSError:
                    pass
    db.execute('DELETE FROM media WHERE id = ?', (media_id,))
    return None
