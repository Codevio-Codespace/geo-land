import json
import mimetypes
import os
import sys
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)

from cms import admin as admin_cms  # noqa: E402
from cms import db, public  # noqa: E402

PORT = int(os.environ.get('GEOLAND_PORT', '4173'))
BLOCKED_DIRS = {'data', 'cms', 'scripts', 'docs', 'research', '.git', '__pycache__'}
BLOCKED_FILES = {'project-template.html', 'seed'}

MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.woff2': 'font/woff2',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}


def cors_headers():
    return [('X-Content-Type-Options', 'nosniff')]


class Handler(BaseHTTPRequestHandler):
    server_version = 'GeoLand/2.0'

    def log_message(self, fmt, *args):
        sys.stderr.write('%s %s\n' % (self.address_string(), fmt % args))

    def do_GET(self):
        self._dispatch('GET')

    def do_POST(self):
        self._dispatch('POST')

    def _dispatch(self, method):
        parsed = urllib.parse.urlparse(self.path)
        path = urllib.parse.unquote(parsed.path)
        query = urllib.parse.parse_qs(parsed.query, keep_blank_values=True)
        try:
            if path == '/admin' or path.startswith('/admin/'):
                self._send(admin_cms.handle(self, path.rstrip('/') or '/admin', query, method))
                return
            if method != 'GET':
                self._send_text(405, 'Method not allowed')
                return
            if path == '/api/projects':
                self._send_json(public.api_projects())
                return
            if path == '/sitemap.xml':
                self._send_bytes(200, public.sitemap_xml().encode('utf-8'), 'application/xml; charset=utf-8',
                                 cache='no-cache')
                return
            if path.startswith('/project/'):
                slug = path[len('/project/'):].strip('/')
                if not slug or '/' in slug:
                    self._send_404()
                    return
                html = public.project_page(slug)
                if html is None:
                    self._send_404()
                    return
                self._send_bytes(200, html.encode('utf-8'), MIME['.html'], cache='no-cache')
                return
            self._serve_static(path)
        except BrokenPipeError:
            pass
        except Exception as exc:
            sys.stderr.write(f'[server] error on {path}: {exc!r}\n')
            self._send_text(500, 'Something went wrong on the server. Please try again.')

    def _serve_static(self, path):
        rel = path.lstrip('/')
        if not rel:
            rel = 'index.html'
        parts = [p for p in rel.split('/') if p not in ('', '.')]
        if any(p == '..' for p in parts) or (parts and parts[0] in BLOCKED_DIRS):
            self._send_404()
            return
        if any(p.startswith('.') for p in parts) or parts[-1] in BLOCKED_FILES:
            self._send_404()
            return
        full = os.path.realpath(os.path.join(ROOT, *parts))
        if not full.startswith(os.path.realpath(ROOT) + os.sep) and full != os.path.realpath(ROOT):
            self._send_404()
            return
        if os.path.isdir(full):
            full = os.path.join(full, 'index.html')
            parts.append('index.html')
        if not os.path.isfile(full):
            self._send_404()
            return
        ext = os.path.splitext(full)[1].lower()
        if ext in ('.py', '.db', '.key', '.doc', '.md'):
            self._send_404()
            return
        if not ext or os.path.splitext(full)[0].endswith('project-template'):
            self._send_404()
            return
        ctype = MIME.get(ext) or mimetypes.guess_type(full)[0] or 'application/octet-stream'
        if path.startswith('/assets/uploads/'):
            cache = 'public, max-age=31536000, immutable'
        elif ext == '.html':
            cache = 'no-cache'
        else:
            cache = 'public, max-age=3600'
        with open(full, 'rb') as f:
            body = f.read()
        if ext == '.html' and parts[0] in public.PAGE_BLOCKS:
            body = public.transform_page(parts[0], body.decode('utf-8')).encode('utf-8')
        self._send_bytes(200, body, ctype, cache=cache)

    def _send_404(self):
        body = ('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">'
                '<meta name="viewport" content="width=device-width, initial-scale=1">'
                '<title>Not found — Geo&Land Kosova</title>'
                '<link rel="stylesheet" href="/assets/css/base.css"></head>'
                '<body><main class="container" style="padding: 12vh 0;">'
                '<p class="mono" style="color: var(--orange-2)">404</p>'
                '<h1 style="margin: .5rem 0 1rem;">This page does not exist.</h1>'
                '<p><a class="link-arrow" href="/">Back to the home page</a></p>'
                '</main></body></html>').encode('utf-8')
        self._send_bytes(404, body, MIME['.html'], cache='no-cache')

    def _send_text(self, status, text):
        self._send_bytes(status, text.encode('utf-8'), 'text/plain; charset=utf-8')

    def _send_json(self, payload):
        self._send_bytes(200, json.dumps(payload, ensure_ascii=False).encode('utf-8'),
                         MIME['.json'], cache='no-cache')

    def _send_bytes(self, status, body, content_type, cache=None, headers=None):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        if cache:
            self.send_header('Cache-Control', cache)
        for key, value in (headers or []):
            self.send_header(key, value)
        for key, value in cors_headers():
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body)

    def _send(self, response):
        self.send_response(response.status)
        self.send_header('Content-Type', response.content_type)
        self.send_header('Content-Length', str(len(response.body)))
        if response.content_type.startswith('text/html'):
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('X-Frame-Options', 'SAMEORIGIN')
            self.send_header('Referrer-Policy', 'same-origin')
        for key, value in response.headers:
            self.send_header(key, value)
        for key, value in cors_headers():
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(response.body)


def main():
    os.chdir(ROOT)
    db.init_schema()
    setup_hint = '' if db.one('SELECT COUNT(*) c FROM users')['c'] else '  (first run: /admin/setup)'
    server = ThreadingHTTPServer(('0.0.0.0', PORT), Handler)
    print(f'Geo&Land server — public site: http://127.0.0.1:{PORT}/')
    print(f'                 admin panel: http://127.0.0.1:{PORT}/admin{setup_hint}')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
