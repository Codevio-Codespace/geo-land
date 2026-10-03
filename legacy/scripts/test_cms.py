import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import http.cookiejar

BASE = 'http://127.0.0.1:4173'
USERNAME = os.environ.get('GEOLAND_ADMIN', '')
PASSWORD = os.environ.get('GEOLAND_ADMIN_PASSWORD', '')
TITLE = f'CMS Test Project {int(time.time())}'
failures = []


def check(name, condition, detail=''):
    print(f'  [{"PASS" if condition else "FAIL"}] {name}' + (f' — {detail}' if detail and not condition else ''))
    if not condition:
        failures.append(name)


def png_bytes(color=(255, 91, 4)):
    from PIL import Image
    buf = io.BytesIO()
    Image.new('RGB', (1200, 800), color).save(buf, 'PNG')
    return buf.getvalue()


def multipart(fields, files=None):
    boundary = '----geolandtest' + str(int(time.time() * 1000))
    parts = []
    for k, v in fields.items():
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    for k, (filename, data, ctype) in (files or {}).items():
        parts.append(
            f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"; filename="{filename}"\r\n'
            f'Content-Type: {ctype}\r\n\r\n'.encode() + data + b'\r\n')
    parts.append(f'--{boundary}--\r\n'.encode())
    return b''.join(parts), f'multipart/form-data; boundary={boundary}'


class Client:
    def __init__(self):
        self.jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.jar))

    def request(self, path, data=None, ctype=None, follow=True, raw=False):
        req = urllib.request.Request(BASE + path, data=data)
        if ctype:
            req.add_header('Content-Type', ctype)
        opener = self.opener if follow else urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(self.jar), NoRedirect())
        try:
            resp = opener.open(req, timeout=60)
            body = resp.read()
            return resp.status, resp.url, body.decode('utf-8', 'replace')
        except urllib.error.HTTPError as e:
            return e.code, e.url, e.read().decode('utf-8', 'replace')

    def get(self, path, **kw):
        return self.request(path, **kw)

    def post(self, path, fields=None, files=None, raw_body=None, ctype=None, **kw):
        if raw_body is not None:
            return self.request(path, raw_body, ctype or 'application/x-www-form-urlencoded', **kw)
        body, ct = multipart(fields or {}, files)
        return self.request(path, body, ct, **kw)


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def csrf_of(html):
    m = re.search(r'name="csrf" value="([^"]+)"', html)
    return m.group(1) if m else ''


def admin_id_of(html, title):
    m = re.search(r'/admin/projects/edit\?id=(\d+)">' + re.escape(title) + r'<', html)
    return int(m.group(1)) if m else None


def main():
    if not USERNAME or not PASSWORD:
        print('Set GEOLAND_ADMIN and GEOLAND_ADMIN_PASSWORD environment variables first.')
        sys.exit(2)
    c = Client()

    # 1. Setup / login
    status, url, html = c.get('/admin/setup', follow=False)
    if status == 200 and 'Create the administrator account' in html:
        status, url, html = c.post('/admin/setup', {'username': USERNAME, 'password': PASSWORD})
        check('setup creates administrator', status == 200 and '/admin' in url, f'{status} {url}')
    else:
        status, url, html2 = c.get('/admin/login')
        status, url, html = c.post('/admin/login', {'username': USERNAME, 'password': PASSWORD})
        check('login works', '/admin' in url and 'Dashboard' in html and 'Sign in' not in html,
              f'{status} {url}')
    check('dashboard reachable', 'Dashboard' in html and 'Recent changes' in html)

    # 2. Create draft project with an uploaded image
    status, url, html = c.get('/admin/projects/new')
    csrf = csrf_of(html)
    body, ct = multipart(
        {'csrf': csrf, 'id': '', 'title': TITLE, 'slug': '', 'category': 'software',
         'year': '2026', 'org': 'GeoLand QA', 'description': 'First paragraph.\n\nSecond paragraph.',
         'published': '', 'featured': '', 'featured_rank': '100', 'image_media_id': '',
         'image_alt': 'Test image alt'},
        {'image_upload': ('test.png', png_bytes(), 'image/png')})
    status, url, html = c.post('/admin/projects/save', raw_body=body, ctype=ct)
    check('create draft succeeds', 'ok=' in url and 'Draft' in html, url)
    pid = admin_id_of(html, TITLE)
    check('project listed in admin', pid is not None)
    draft_slug = 'cms-test-project-' + TITLE.split()[-1]

    # 3. Draft is not public
    status, _, api = c.get('/api/projects')
    check('api hides draft', draft_slug not in api)
    status, _, page = c.get('/project/' + draft_slug)
    check('project page 404 while draft', status == 404, str(status))
    status, _, page = c.request('/project/' + draft_slug, follow=False)[:3]
    check('unfollowed 404 check', status == 404)

    # 4. Publish
    status, url, html = c.get(f'/admin/projects/edit?id={pid}')
    csrf = csrf_of(html)
    image_id = re.search(r'<option value="(\d+)" selected>', html)
    check('main image preselected', image_id is not None)
    status, url, html = c.post('/admin/projects/action',
                               {'csrf': csrf, 'id': str(pid), 'do': 'publish'})
    check('publish action ok', 'ok=' in url, url)
    status, _, api = c.get('/api/projects')
    check('api shows published project', draft_slug in api)
    check('api count is 29', '"count": 29' in api or json.loads(api)['count'] == 29)
    status, _, page = c.get('/project/' + draft_slug)
    check('project page 200', status == 200)
    check('title in <title>', TITLE in page.split('<title>')[1].split('</title>')[0])
    check('og:image present', 'og:image' in page)
    check('description paragraphs rendered', 'First paragraph.' in page and 'Second paragraph.' in page)
    check('existing design classes used', 'page-hero' in page and 'about-profile' in page)

    # 5. Edit and re-check
    status, url, html = c.get(f'/admin/projects/edit?id={pid}')
    csrf = csrf_of(html)
    body, ct = multipart(
        {'csrf': csrf, 'id': str(pid), 'title': TITLE + ' Updated', 'slug': '',
         'category': 'cadastre', 'year': '2027', 'org': 'GeoLand QA',
         'description': 'Updated description.', 'published': '1', 'featured': '',
         'featured_rank': '100', 'image_media_id': image_id.group(1)})
    status, url, html = c.post('/admin/projects/save', raw_body=body, ctype=ct)
    check('edit saved', 'ok=' in url, url)
    status, _, page = c.get('/project/' + draft_slug)
    check('public page reflects edit', 'Updated description.' in page and '2027' in page)

    # 6. Gallery upload
    status, url, html = c.get(f'/admin/projects/edit?id={pid}')
    csrf = csrf_of(html)
    body, ct = multipart(
        {'csrf': csrf, 'id': str(pid), 'title': TITLE + ' Updated', 'slug': '',
         'category': 'cadastre', 'year': '2027', 'org': 'GeoLand QA',
         'description': 'Updated description.', 'published': '1', 'featured': '',
         'featured_rank': '100', 'image_media_id': image_id.group(1)},
        {'images_upload': ('gallery.png', png_bytes((7, 80, 86)), 'image/png')})
    status, url, html = c.post('/admin/projects/save', raw_body=body, ctype=ct)
    status, _, page = c.get('/project/' + draft_slug)
    check('gallery rendered from upload', 'gallery-strip' in page and 'project-gallery' in page)

    # 7. Negative: CSRF, auth, uploads, delete guard
    status, url, html = c.post('/admin/projects/action', {'id': str(pid), 'do': 'unpublish'},
                               raw_body=b'id=%d&do=unpublish' % pid,
                               ctype='application/x-www-form-urlencoded')
    check('missing csrf rejected', status == 403, str(status))

    fresh = Client()
    status, url, html = fresh.get('/admin/projects')
    check('unauthenticated admin redirects to login', '/admin/login' in url, url)

    status, url, html = c.get('/admin/media')
    csrf = csrf_of(html)
    body, ct = multipart(
        {'csrf': csrf, 'alt': 'bad'},
        {'files': ('notimage.png', b'this is not an image', 'image/png')})
    status, url, html = c.post('/admin/media/upload', raw_body=body, ctype=ct)
    check('non-image rejected with message', 'err=' in url, url)

    big = b'\x89PNG\r\n\x1a\n' + b'0' * (21 * 1024 * 1024)
    body, ct = multipart(
        {'csrf': csrf, 'alt': 'big'},
        {'files': ('big.png', big, 'image/png')})
    status, url, html = c.post('/admin/media/upload', raw_body=body, ctype=ct)
    check('oversized upload rejected', 'err=' in url and '20' in urllib.parse.unquote_plus(url), url)

    status, url, html = c.get(f'/admin/media')
    uid = re.search(r'name="id" value="(\d+)"', html)
    status, url, html = c.post('/admin/media/action',
                               {'csrf': csrf, 'id': image_id.group(1), 'do': 'delete'})
    check('delete blocked while referenced', 'err=' in url and 'Still+used' in url, url)

    # 8. Unpublish then delete
    status, url, html = c.get(f'/admin/projects/edit?id={pid}')
    csrf = csrf_of(html)
    status, url, html = c.post('/admin/projects/action',
                               {'csrf': csrf, 'id': str(pid), 'do': 'unpublish'})
    check('unpublish ok', 'ok=' in url, url)
    status, _, api = c.get('/api/projects')
    check('api hides unpublished', draft_slug not in api)
    status, _, page = c.get('/project/' + draft_slug)
    check('project page 404 after unpublish', status == 404, str(status))

    status, url, html = c.get(f'/admin/confirm?action=delete_project&id={pid}')
    csrf = csrf_of(html)
    status, url, html = c.post('/admin/projects/action',
                               {'csrf': csrf, 'id': str(pid), 'do': 'delete'})
    check('delete ok', 'ok=' in url, url)
    status, _, api = c.get('/api/projects')
    check('api back to 28', json.loads(api)['count'] == 28)
    status, _, html = c.get('/admin/projects')
    check('project gone from admin', TITLE + ' Updated' not in html)

    # 9. Duplicate slug handling (self-contained: create two, expect -2 suffix)
    t2 = TITLE + ' Dup'
    for i in range(2):
        status, url, html = c.get('/admin/projects/new')
        csrf = csrf_of(html)
        body, ct = multipart(
            {'csrf': csrf, 'id': '', 'title': t2, 'slug': '', 'category': 'software',
             'year': '2026', 'org': '', 'description': '', 'image_media_id': '', 'image_alt': ''},
            {'image_upload': (f'dup{i}.png', png_bytes((22, 35, 42)), 'image/png')})
        status, url, html = c.post('/admin/projects/save', raw_body=body, ctype=ct)
    status, url, html = c.get('/admin/projects')
    ids = sorted(set(int(i) for i in re.findall(
        r'/admin/projects/edit\?id=(\d+)">' + re.escape(t2) + r'<', html)))
    check('two duplicate projects listed', len(ids) == 2, str(ids))
    slugs = []
    for pid_i in ids:
        status, url, page = c.get(f'/admin/projects/edit?id={pid_i}')
        m = re.search(r'name="slug" type="text" value="([^"]*)"', page)
        slugs.append(m.group(1) if m else '')
    check('duplicate slug gets suffix',
          len(set(slugs)) == 2 and any(s.endswith('-2') for s in slugs), str(slugs))
    for pid_i in ids:
        status, url, page = c.get(f'/admin/confirm?action=delete_project&id={pid_i}')
        csrf = csrf_of(page)
        c.post('/admin/projects/action', {'csrf': csrf, 'id': str(pid_i), 'do': 'delete'})

    print()
    if failures:
        print(f'RESULT: {len(failures)} FAILURES')
        for f in failures:
            print(' -', f)
        sys.exit(1)
    print('RESULT: ALL CMS CHECKS PASSED')


if __name__ == '__main__':
    main()
