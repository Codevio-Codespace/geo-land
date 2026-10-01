import html
import json
import urllib.parse

from . import auth, content, db, media as media_mod, multipart, render

CATS = content.CATS


class Response:
    def __init__(self, status=200, body=b'', content_type='text/html; charset=utf-8', headers=None):
        self.status = status
        self.body = body if isinstance(body, bytes) else str(body).encode('utf-8')
        self.content_type = content_type
        self.headers = headers or []


def redirect(location):
    return Response(303, '', 'text/plain', [('Location', location)])


def notice_from(query, form=None):
    ok = (query.get('ok', [''])[0] if query else '')
    err = (query.get('err', [''])[0] if query else '')
    if not ok and not err and form:
        ok = form.get('ok', [''])[0]
        err = form.get('err', [''])[0]
    if ok:
        return f'<p class="notice notice--ok" role="status">{render.esc(ok)}</p>'
    if err:
        return f'<p class="notice notice--err" role="alert">{render.esc(err)}</p>'
    return ''


def nav(active, username):
    links = [
        ('dashboard', '/admin', 'Dashboard'),
        ('projects', '/admin/projects', 'Projects'),
        ('services', '/admin/services', 'Services'),
        ('milestones', '/admin/milestones', 'Milestones'),
        ('media', '/admin/media', 'Media'),
    ]
    items = ''.join(
        f'<a href="{href}"{" class=\"is-active\"" if key == active else ""}>{label}</a>'
        for key, href, label in links)
    return (
        '<header class="admin-bar"><div class="admin-bar__inner">'
        '<a class="admin-brand" href="/admin"><span class="brand__text">GEO&amp;<em>LAND</em></span>'
        '<span class="mono admin-brand__tag">Admin</span></a>'
        f'<nav class="admin-nav" aria-label="Admin">{items}</nav>'
        '<div class="admin-bar__meta">'
        '<a href="/" target="_blank" rel="noopener">View site ↗</a>'
        f'<span class="mono">{render.esc(username)}</span>'
        '<form method="post" action="/admin/logout"><input type="hidden" name="csrf" value="">'
        '<button class="linkish" type="submit">Log out</button></form>'
        '</div></div></header>')


def page(title, active, username, content_html, notice='', sid=None):
    csrf = auth.csrf_token(sid) if sid else ''
    body = render.template(
        'layout', title=title, nav=nav(active, username),
        notice=notice, content=content_html, csrf=csrf)
    return Response(200, body)


def set_cookie(sid):
    return [('Set-Cookie',
             f'gl_admin={auth.cookie_value(sid)}; Path=/; HttpOnly; SameSite=Lax; Max-Age={30*24*3600}')]


def clear_cookie():
    return [('Set-Cookie', 'gl_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')]


def parse_form(handler):
    length = int(handler.headers.get('Content-Length') or 0)
    if length > multipart.MAX_BODY:
        raise multipart.MultipartError('Request is too large.')
    body = handler.rfile.read(length) if length else b''
    ctype = handler.headers.get('Content-Type', '')
    if 'multipart/form-data' in ctype:
        return multipart.parse(body, ctype)
    if 'application/x-www-form-urlencoded' in ctype:
        parsed = urllib.parse.parse_qs(body.decode('utf-8', 'replace'), keep_blank_values=True)
        return {k: [{'filename': None, 'content_type': None, 'data': v.encode()} for v in vals]
                for k, vals in parsed.items()}
    return {}


def field(form, key, default=''):
    entries = form.get(key)
    if not entries:
        return default
    return entries[0]['data'].decode('utf-8', 'replace')


def files(form, key):
    return [e for e in form.get(key, []) if e.get('filename')]


def flat(form):
    out = {}
    for key, entries in form.items():
        if entries and entries[0].get('filename') is None:
            out[key] = entries[0]['data'].decode('utf-8', 'replace')
    out['_multi'] = {k: [e['data'].decode() for e in v if e.get('filename') is None]
                     for k, v in form.items()}
    return out


def handle(handler, path, query, method):
    form = {}
    if method == 'POST':
        try:
            form = parse_form(handler)
        except multipart.MultipartError as exc:
            return Response(400, str(exc), 'text/plain; charset=utf-8')

    cookie = handler.headers.get('Cookie')
    user = auth.current_user(cookie)
    sid = auth.sid_from_cookie(cookie)

    if path == '/admin/setup':
        if auth.has_user():
            return redirect('/admin/login')
        if method == 'GET':
            return page('Set up', 'dashboard', 'admin', render.template('setup', error=''), '', '')
        username = field(form, 'username')
        pw = field(form, 'password')
        ok, error = auth.create_user(username, pw)
        if not ok:
            return page('Set up', 'dashboard', 'admin',
                        render.template('setup', error=error), '', '')
        sid = auth.login(username, pw)
        return Response(303, '', 'text/plain', [('Location', '/admin')] + set_cookie(sid))

    if path == '/admin/login':
        if method == 'POST':
            ip = handler.client_address[0]
            if auth.rate_limited(ip):
                return page('Log in', 'dashboard', 'admin',
                            render.template('login', error='Too many attempts — wait a few minutes.'),
                            '', '')
            username = field(form, 'username')
            pw = field(form, 'password')
            sid = auth.login(username, pw)
            if not sid:
                auth.record_failure(ip)
                return page('Log in', 'dashboard', 'admin',
                            render.template('login', error='Invalid username or password.'), '', '')
            return Response(303, '', 'text/plain', [('Location', '/admin')] + set_cookie(sid))
        return page('Log in', 'dashboard', 'admin', render.template('login', error=''), '', '')

    if path == '/admin/logout':
        if method == 'POST':
            auth.logout(sid)
        return Response(303, '', 'text/plain', [('Location', '/admin/login')] + clear_cookie())

    if not user:
        return redirect('/admin/login')

    if method == 'POST':
        token = field(form, 'csrf')
        if not auth.check_csrf(sid, token):
            return page('Denied', 'dashboard', user,
                        '<h1>Request blocked</h1><p>The security token was missing or expired. '
                        'Go back and try again.</p>', '', sid)
    return _routes(handler, path, query, method, form, user, sid)


def _routes(handler, path, query, method, form, user, sid):
    from . import admin_pages
    return admin_pages.dispatch(handler, path, query, method, form, user, sid,
                                page=page, redirect=redirect, notice_from=notice_from,
                                field=field, files=files, flat=flat)
