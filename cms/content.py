import re
import unicodedata

from . import db, media as media_mod

CATS = {
    'gis-agri': 'GIS & Agriculture',
    'software': 'Software Development',
    'cadastre': 'Geodetic & Cadastral Surveying',
    'forestry': 'Forestry',
}
CAT_KEYS = tuple(CATS.keys())


def slugify(title):
    t = unicodedata.normalize('NFKD', title or '')
    t = t.encode('ascii', 'ignore').decode('ascii')
    t = re.sub(r'[^a-zA-Z0-9]+', '-', t).strip('-').lower()
    return (t[:80] or 'project').strip('-')


def unique_slug(base, exclude_id=None):
    slug = base
    n = 2
    while True:
        row = db.one('SELECT id FROM projects WHERE slug = ?', (slug,))
        if not row or (exclude_id and row['id'] == exclude_id):
            return slug
        slug = f'{base}-{n}'
        n += 1


def public_projects():
    return db.query(
        'SELECT * FROM projects WHERE published = 1 ORDER BY year DESC, title ASC')


def public_project_by_slug(slug):
    return db.one('SELECT * FROM projects WHERE slug = ? AND published = 1', (slug,))


def project_by_id(project_id):
    return db.one('SELECT * FROM projects WHERE id = ?', (project_id,))


def admin_projects(status=None):
    if status == 'published':
        return db.query('SELECT * FROM projects WHERE published = 1 ORDER BY updated_at DESC')
    if status == 'draft':
        return db.query('SELECT * FROM projects WHERE published = 0 ORDER BY updated_at DESC')
    return db.query('SELECT * FROM projects ORDER BY updated_at DESC')


def featured_projects():
    return db.query(
        'SELECT * FROM projects WHERE published = 1 AND featured = 1 '
        'ORDER BY featured_rank ASC, year DESC LIMIT 4')


def project_images(project_id):
    return db.query(
        'SELECT m.*, pi.sort FROM project_images pi JOIN media m ON m.id = pi.media_id '
        'WHERE pi.project_id = ? ORDER BY pi.sort ASC, m.id ASC', (project_id,))


def project_image_ids(project_id):
    return [r['media_id'] for r in db.query(
        'SELECT media_id FROM project_images WHERE project_id = ?', (project_id,))]


def public_services():
    return db.query('SELECT * FROM services WHERE published = 1 ORDER BY sort ASC, id ASC')


def all_services():
    return db.query('SELECT * FROM services ORDER BY sort ASC, id ASC')


def service_by_id(service_id):
    return db.one('SELECT * FROM services WHERE id = ?', (service_id,))


def public_milestones():
    return db.query('SELECT * FROM milestones WHERE published = 1 ORDER BY year DESC, sort ASC, id ASC')


def all_milestones():
    return db.query('SELECT * FROM milestones ORDER BY year DESC, sort ASC, id ASC')


def milestone_by_id(milestone_id):
    return db.one('SELECT * FROM milestones WHERE id = ?', (milestone_id,))


def media_by_id(media_id):
    if not media_id:
        return None
    return db.one('SELECT * FROM media WHERE id = ?', (media_id,))


def media_all():
    return db.query('SELECT * FROM media ORDER BY id DESC')


def _text(data, key, max_len, required=False, label=None):
    value = (data.get(key) or '').strip()
    if required and not value:
        return None, f'{label or key.title()} is required.'
    if len(value) > max_len:
        return None, f'{label or key.title()} is too long (max {max_len} characters).'
    return value, None


def _year(data):
    raw = (data.get('year') or '').strip()
    if not raw:
        return None, None
    try:
        value = int(raw)
    except ValueError:
        return None, 'Year must be a number.'
    if value < 1900 or value > 2100:
        return None, 'Year must be between 1900 and 2100.'
    return value, None


def _int(data, key, default=100, low=0, high=9999):
    raw = (data.get(key) or '').strip()
    if not raw:
        return default
    try:
        return max(low, min(high, int(raw)))
    except ValueError:
        return default


def _flag(data, key):
    return str(data.get(key) or '').strip().lower() not in ('', '0', 'off', 'false', 'no')


def save_project(data, actor, project_id=None):
    errors = []
    title, err = _text(data, 'title', 200, required=True, label='Title')
    if err:
        errors.append(err)
    if title and len(title) < 3:
        errors.append('Title must be at least 3 characters.')
    category = (data.get('category') or '').strip()
    if category not in CAT_KEYS:
        errors.append('Category is not valid.')
    year, err = _year(data)
    if err:
        errors.append(err)
    description, err = _text(data, 'description', 4000, label='Description')
    if err:
        errors.append(err)
    org, err = _text(data, 'org', 120, label='Organization')
    if err:
        errors.append(err)

    image_id = data.get('image_media_id')
    image_id = int(image_id) if str(image_id or '').isdigit() else None
    if image_id and not media_by_id(image_id):
        errors.append('Selected main image no longer exists.')
        image_id = None
    if not image_id:
        errors.append('A main image is required.')

    if errors:
        return None, errors

    slug_input = (data.get('slug') or '').strip().lower()
    base = slugify(slug_input or title)
    slug = unique_slug(base, exclude_id=project_id)
    featured = 1 if _flag(data, 'featured') else 0
    rank = _int(data, 'featured_rank', 100)
    published = 1 if _flag(data, 'published') else 0
    ts = db.now()

    if project_id:
        db.execute(
            'UPDATE projects SET slug=?, title=?, category=?, year=?, org=?, description=?, '
            'image_media_id=?, featured=?, featured_rank=?, published=?, updated_at=? WHERE id=?',
            (slug, title, category, year, org, description, image_id,
             featured, rank, published, ts, project_id))
        pid = project_id
    else:
        cur = db.execute(
            'INSERT INTO projects (slug, title, category, year, org, description, image_media_id, '
            'featured, featured_rank, published, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
            (slug, title, category, year, org, description, image_id, featured, rank, published, ts, ts))
        pid = cur.lastrowid

    extra = data.get('additional_images') or []
    if isinstance(extra, str):
        extra = [extra]
    ok_ids = [int(i) for i in extra if str(i).isdigit() and media_by_id(int(i))]
    db.execute('DELETE FROM project_images WHERE project_id = ?', (pid,))
    for sort, mid in enumerate(dict.fromkeys(ok_ids)):
        db.execute('INSERT INTO project_images (project_id, media_id, sort) VALUES (?,?,?)',
                   (pid, mid, sort * 10))

    state = 'published' if published else 'draft'
    db.log(actor, 'update' if project_id else 'create', 'project', pid,
           f'{"Updated" if project_id else "Created"} {state} project “{title}”')
    return pid, None


def set_project_published(project_id, published, actor):
    row = project_by_id(project_id)
    if not row:
        return 'Project not found.'
    if published and not row['image_media_id']:
        return 'Add a main image before publishing.'
    db.execute('UPDATE projects SET published=?, updated_at=? WHERE id=?',
               (1 if published else 0, db.now(), project_id))
    db.log(actor, 'publish' if published else 'unpublish', 'project', project_id,
           f'{"Published" if published else "Unpublished"} “{row["title"]}”')
    return None


def delete_project(project_id, actor):
    row = project_by_id(project_id)
    if not row:
        return 'Project not found.'
    db.execute('DELETE FROM project_images WHERE project_id = ?', (project_id,))
    db.execute('DELETE FROM projects WHERE id = ?', (project_id,))
    db.log(actor, 'delete', 'project', project_id, f'Deleted “{row["title"]}”')
    return None


def save_service(data, actor, service_id=None):
    errors = []
    name, err = _text(data, 'name', 120, required=True, label='Name')
    if err:
        errors.append(err)
    anchor = slugify((data.get('anchor') or '').strip() or name or '')
    if not anchor:
        errors.append('Anchor is required.')
    short_scope, err = _text(data, 'short_scope', 200, label='Short scope')
    if err:
        errors.append(err)
    scope_paragraph, err = _text(data, 'scope_paragraph', 1200, label='Intro paragraph')
    if err:
        errors.append(err)
    deliverables, err = _text(data, 'deliverables', 300, label='Deliverables')
    if err:
        errors.append(err)
    items = [line for line in (data.get('scope_items') or '').splitlines() if line.strip()]
    if len(items) > 12:
        errors.append('Scope allows at most 12 items.')
    for item in items:
        if len(item.strip()) > 200:
            errors.append('Each scope item must be under 200 characters.')
            break
    image_id = data.get('image_media_id')
    image_id = int(image_id) if str(image_id or '').isdigit() else None
    if image_id and not media_by_id(image_id):
        errors.append('Selected image no longer exists.')
        image_id = None
    if errors:
        return None, errors

    existing = db.one('SELECT id FROM services WHERE anchor = ?', (anchor,))
    if existing and (not service_id or existing['id'] != service_id):
        errors.append('Another service already uses that anchor.')
        return None, errors

    sort = _int(data, 'sort', 100)
    published = 1 if _flag(data, 'published') else 0
    scope_text = '\n'.join(item.strip() for item in items)

    if service_id:
        db.execute(
            'UPDATE services SET anchor=?, name=?, short_scope=?, scope_items=?, scope_paragraph=?, '
            'deliverables=?, image_media_id=?, sort=?, published=?, updated_at=? WHERE id=?',
            (anchor, name, short_scope, scope_text, scope_paragraph, deliverables, image_id,
             sort, published, db.now(), service_id))
        sid = service_id
    else:
        cur = db.execute(
            'INSERT INTO services (anchor, name, short_scope, scope_items, scope_paragraph, '
            'deliverables, image_media_id, sort, published, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
            (anchor, name, short_scope, scope_text, scope_paragraph, deliverables, image_id,
             sort, published, db.now()))
        sid = cur.lastrowid
    db.log(actor, 'update' if service_id else 'create', 'service', sid,
           f'{"Updated" if service_id else "Created"} service “{name}”')
    return sid, None


def save_milestone(data, actor, milestone_id=None):
    text, err = _text(data, 'text', 500, required=True, label='Text')
    if err:
        return None, [err]
    year, err = _year(data)
    if err:
        return None, [err]
    if year is None:
        return None, ['Year is required.']
    sort = _int(data, 'sort', 100)
    published = 1 if _flag(data, 'published') else 0
    if milestone_id:
        db.execute('UPDATE milestones SET year=?, text=?, sort=?, published=?, updated_at=? WHERE id=?',
                   (year, text, sort, published, db.now(), milestone_id))
        mid = milestone_id
    else:
        cur = db.execute('INSERT INTO milestones (year, text, sort, published, updated_at) VALUES (?,?,?,?,?)',
                         (year, text, sort, published, db.now()))
        mid = cur.lastrowid
    db.log(actor, 'update' if milestone_id else 'create', 'milestone', mid,
           f'{"Updated" if milestone_id else "Added"} milestone {year}')
    return mid, None


def delete_milestone(milestone_id, actor):
    row = milestone_by_id(milestone_id)
    if not row:
        return 'Milestone not found.'
    db.execute('DELETE FROM milestones WHERE id = ?', (milestone_id,))
    db.log(actor, 'delete', 'milestone', milestone_id, f'Deleted milestone {row["year"]}')
    return None


def set_media_alt(media_id, alt, actor):
    row = media_by_id(media_id)
    if not row:
        return 'Image not found.'
    alt = (alt or '').strip()[:200]
    db.execute('UPDATE media SET alt = ? WHERE id = ?', (alt, media_id))
    db.log(actor, 'update', 'media', media_id, f'Updated alt text for {row["base"].rsplit("/", 1)[-1]}')
    return None

