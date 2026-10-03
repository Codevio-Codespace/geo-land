from . import auth, content, db, media as media_mod, render

CATS = content.CATS


def _thumb(media_row, cls='thumb'):
    if not media_row:
        return '<span class="thumb thumb--empty mono">no image</span>'
    widths = render.media_widths(media_row)
    w = widths[-1] if widths else (media_row['width'] or 640)
    return (f'<img class="{cls}" src="{media_row["base"]}-{w}.jpg" alt="" '
            f'loading="lazy" decoding="async">')


def _media_options(selected_id, include_empty=True):
    options = []
    if include_empty:
        options.append('<option value="">— none —</option>')
    for m in content.media_all():
        label = m['alt'] or m['original_name'] or m['base'].rsplit('/', 1)[-1]
        dims = f'{m["width"]}×{m["height"]}' if m['width'] else ''
        selected = ' selected' if str(m['id']) == str(selected_id or '') else ''
        options.append(f'<option value="{m["id"]}"{selected}>{render.esc(label)} {render.esc(dims)}</option>')
    return '\n'.join(options)


def _media_checkboxes(selected_ids):
    tiles = []
    for m in content.media_all():
        checked = ' checked' if m['id'] in selected_ids else ''
        widths = render.media_widths(m)
        w = widths[-1] if widths else (m['width'] or 640)
        label = m['alt'] or m['original_name'] or m['base'].rsplit('/', 1)[-1]
        tiles.append(
            '<label class="media-pick">'
            f'<input type="checkbox" name="additional_images" value="{m["id"]}"{checked}>'
            f'<img src="{m["base"]}-{w}.jpg" alt="" loading="lazy" decoding="async">'
            f'<span class="mono">{render.esc(label)}</span></label>')
    return '\n'.join(tiles) if tiles else '<p class="muted">No images uploaded yet.</p>'


def _errors_html(errors):
    if not errors:
        return ''
    items = ''.join(f'<li>{render.esc(e)}</li>' for e in errors)
    return f'<div class="notice notice--err" role="alert"><ul>{items}</ul></div>'


def dashboard(handler, query, user, sid, page, notice_from):
    counts = {
        'projects': db.one('SELECT COUNT(*) c FROM projects')['c'],
        'published': db.one('SELECT COUNT(*) c FROM projects WHERE published = 1')['c'],
        'drafts': db.one('SELECT COUNT(*) c FROM projects WHERE published = 0')['c'],
        'services': db.one('SELECT COUNT(*) c FROM services')['c'],
        'milestones': db.one('SELECT COUNT(*) c FROM milestones')['c'],
        'media': db.one('SELECT COUNT(*) c FROM media')['c'],
    }
    activity = db.query('SELECT * FROM activity ORDER BY id DESC LIMIT 10')
    rows = '\n'.join(
        f'<tr><td class="mono">{render.esc(r["ts"])}</td><td>{render.esc(r["summary"])}</td>'
        f'<td class="muted">{render.esc(r["actor"])}</td></tr>' for r in activity)
    if not rows:
        rows = '<tr><td colspan="3" class="muted">Nothing yet — create your first project.</td></tr>'
    body = render.template(
        'dashboard',
        projects=counts['projects'], published=counts['published'], drafts=counts['drafts'],
        services=counts['services'], milestones=counts['milestones'], media=counts['media'],
        activity_rows=rows,
        project_missing='' if counts['projects'] else ' is-empty')
    return page('Dashboard', 'dashboard', user, body, notice_from(query), sid)


def projects_list(handler, query, user, sid, page, notice_from):
    status = (query.get('status', [''])[0] or '').strip()
    projects = content.admin_projects(status or None)
    rows = []
    for p in projects:
        badge = ('<span class="badge badge--live">Published</span>' if p['published']
                 else '<span class="badge badge--draft">Draft</span>')
        star = '<span class="mono" title="Featured">★</span>' if p['featured'] else ''
        action = 'unpublish' if p['published'] else 'publish'
        label = 'Unpublish' if p['published'] else 'Publish'
        rows.append(
            f'<tr><td><a href="/admin/projects/edit?id={p["id"]}">{render.esc(p["title"])}</a></td>'
            f'<td class="muted">{render.esc(CATS.get(p["category"], p["category"]))}</td>'
            f'<td class="mono">{p["year"] or ""}</td><td>{star}</td><td>{badge}</td>'
            f'<td class="mono muted">{render.esc((p["updated_at"] or "")[:10])}</td>'
            f'<td class="row-actions">'
            f'<a href="/admin/projects/edit?id={p["id"]}">Edit</a>'
            f'<form method="post" action="/admin/projects/action">'
            f'<input type="hidden" name="csrf" value="{auth.csrf_token(sid)}">'
            f'<input type="hidden" name="id" value="{p["id"]}">'
            f'<input type="hidden" name="do" value="{action}">'
            f'<button class="linkish" type="submit">{label}</button></form>'
            f'<a class="danger" href="/admin/confirm?action=delete_project&id={p["id"]}">Delete</a>'
            '</td></tr>')
    table = ('<table class="tbl"><thead><tr><th>Title</th><th>Category</th><th>Year</th>'
             '<th></th><th>Status</th><th>Updated</th><th></th></tr></thead><tbody>'
             + ('\n'.join(rows) or '<tr><td colspan="7" class="muted">No projects in this view.</td></tr>')
             + '</tbody></table>')
    filters = ('<div class="filter-row">'
               f'<a href="/admin/projects"{" class=\"is-active\"" if not status else ""}>All</a>'
               f'<a href="/admin/projects?status=published"{" class=\"is-active\"" if status == "published" else ""}>Published</a>'
               f'<a href="/admin/projects?status=draft"{" class=\"is-active\"" if status == "draft" else ""}>Drafts</a>'
               '<a class="btn btn--orange btn--sm" href="/admin/projects/new">New project</a></div>')
    body = render.template('projects', filters=filters, table=table)
    return page('Projects', 'projects', user, body, notice_from(query), sid)


def project_form(handler, query, user, sid, page, notice_from, project=None, errors=None):
    editing = bool(project and project.get('id'))
    values = project or {'title': '', 'slug': '', 'category': 'gis-agri', 'year': '',
                         'org': '', 'description': '', 'featured': 0, 'featured_rank': 100,
                         'published': 0, 'image_media_id': None, 'additional_ids': []}
    image = content.media_by_id(values.get('image_media_id'))
    body = render.template(
        'project_form',
        heading='Edit project' if editing else 'New project',
        action='save',
        csrf=auth.csrf_token(sid),
        project_id=values.get('id', ''),
        error_block=_errors_html(errors or []),
        title=render.esc(values.get('title', '')),
        slug=render.esc(values.get('slug', '')),
        description=render.esc(values.get('description', '')),
        org=render.esc(values.get('org', '')),
        year=render.esc(values.get('year') or ''),
        featured_rank=render.esc(values.get('featured_rank') or 100),
        cat_options='\n'.join(
            f'<option value="{key}"{" selected" if key == values.get("category") else ""}>{label}</option>'
            for key, label in CATS.items()),
        image_options=_media_options(values.get('image_media_id')),
        current_thumb=_thumb(image),
        media_picks=_media_checkboxes(set(values.get('additional_ids') or [])),
        featured_checked=' checked' if values.get('featured') else '',
        published_checked=' checked' if values.get('published') else '',
        delete_link=(f'<a class="danger" href="/admin/confirm?action=delete_project&id={values["id"]}">Delete this project</a>'
                     if editing else ''),
    )
    return page('Projects', 'projects', user, body, notice_from(query), sid)


def projects_dispatch(handler, path, query, method, form, user, sid, page, redirect, notice_from, field):
    if path == '/admin/projects' and method == 'GET':
        return projects_list(handler, query, user, sid, page, notice_from)

    if path == '/admin/projects/new' and method == 'GET':
        return project_form(handler, query, user, sid, page, notice_from)

    if path == '/admin/projects/edit' and method == 'GET':
        pid = query.get('id', [''])[0]
        if not pid.isdigit():
            return redirect('/admin/projects?err=Project+not+found')
        project = content.project_by_id(int(pid))
        if not project:
            return redirect('/admin/projects?err=Project+not+found')
        values = dict(project)
        values['additional_ids'] = content.project_image_ids(project['id'])
        return project_form(handler, query, user, sid, page, notice_from, project=values)

    if path == '/admin/projects/save' and method == 'POST':
        data = dict(form)
        pid = field(data, 'id')
        pid = int(pid) if pid.isdigit() else None
        uploaded = _process_uploads(form, user)
        if uploaded.get('error'):
            return _form_error(handler, query, user, sid, page, notice_from, data, pid, uploaded['error'])
        extra_uploaded = _process_file_list(form, 'images_upload', user)
        if extra_uploaded.get('error'):
            return _form_error(handler, query, user, sid, page, notice_from, data, pid, extra_uploaded['error'])
        if uploaded.get('id'):
            data['image_media_id'] = [{'filename': None, 'content_type': None, 'data': str(uploaded['id']).encode()}]
        if extra_uploaded['ids']:
            picks = list(data.get('additional_images', []))
            for mid in extra_uploaded['ids']:
                picks.append({'filename': None, 'content_type': None, 'data': str(mid).encode()})
            data['additional_images'] = picks
        elif 'additional_images' not in data:
            data['additional_images'] = []
        project_id, errors = content.save_project(_flatten(data), user, project_id=pid)
        if errors:
            return _form_error(handler, query, user, sid, page, notice_from, data, pid, errors)
        row = content.project_by_id(project_id)
        ok = urllib_quote(f'{"Updated" if pid else "Saved"} “{row["title"]}”'
                          + ('' if row['published'] else ' as draft'))
        return redirect(f'/admin/projects?ok={ok}')

    if path == '/admin/projects/action' and method == 'POST':
        pid = field(form, 'id')
        action = field(form, 'do')
        if not pid.isdigit():
            return redirect('/admin/projects?err=Project+not+found')
        pid = int(pid)
        if action == 'publish':
            err = content.set_project_published(pid, True, user)
        elif action == 'unpublish':
            err = content.set_project_published(pid, False, user)
        elif action == 'delete':
            err = content.delete_project(pid, user)
        else:
            err = 'Unknown action.'
        if err:
            return redirect('/admin/projects?err=' + urllib_quote(err))
        return redirect('/admin/projects?ok=Done')

    return None


def _plain_field(form, key, default=''):
    entries = form.get(key) or []
    if entries and entries[0].get('filename') is None:
        return entries[0]['data'].decode('utf-8', 'replace')
    return default


def _process_uploads(form, user):
    entries = [e for e in form.get('image_upload', []) if e.get('filename')]
    if not entries:
        return {}
    entry = entries[0]
    mid, error = media_mod.save_upload(entry['data'], entry['filename'],
                                       _plain_field(form, 'image_alt'))
    if error:
        return {'error': error}
    db.log(user, 'upload', 'media', mid, f'Uploaded {entry["filename"]}')
    return {'id': mid}


def _process_file_list(form, key, user):
    ids = []
    for entry in [e for e in form.get(key, []) if e.get('filename')]:
        mid, error = media_mod.save_upload(entry['data'], entry['filename'])
        if error:
            return {'error': error}
        db.log(user, 'upload', 'media', mid, f'Uploaded {entry["filename"]}')
        ids.append(mid)
    return {'ids': ids}


def _flatten(form):
    out = {}
    for key, entries in form.items():
        if key == 'additional_images':
            out[key] = [e['data'].decode() for e in entries if e.get('filename') is None]
            continue
        if entries and entries[0].get('filename') is None:
            out[key] = entries[0]['data'].decode()
    return out


def _form_error(handler, query, user, sid, page, notice_from, data, pid, errors):
    if isinstance(errors, str):
        errors = [errors]
    values = _flatten(data)
    values['id'] = pid
    values['additional_ids'] = [int(x) for x in values.get('additional_images', []) if str(x).isdigit()]
    return project_form(handler, query, user, sid, page, notice_from, project=values, errors=errors)


def urllib_quote(text):
    import urllib.parse
    return urllib.parse.quote_plus(text)


def services_list(handler, query, user, sid, page, notice_from):
    rows = []
    for s in content.all_services():
        badge = ('<span class="badge badge--live">Shown</span>' if s['published']
                 else '<span class="badge badge--draft">Hidden</span>')
        rows.append(
            f'<tr><td><a href="/admin/services/edit?id={s["id"]}">{render.esc(s["name"])}</a></td>'
            f'<td class="mono muted">#{render.esc(s["anchor"])}</td>'
            f'<td class="mono">{s["sort"]}</td><td>{badge}</td>'
            f'<td class="row-actions"><a href="/admin/services/edit?id={s["id"]}">Edit</a></td></tr>')
    table = ('<table class="tbl"><thead><tr><th>Service</th><th>Anchor</th><th>Order</th>'
             '<th>Status</th><th></th></tr></thead><tbody>'
             + ('\n'.join(rows) or '<tr><td colspan="5" class="muted">No services.</td></tr>')
             + '</tbody></table>')
    note = ('<p class="note">Services keep their anchor (#gis, #surveying…) because the site links '
            'to them. Hide a service instead of deleting it.</p>')
    body = render.template('services', note=note, table=table)
    return page('Services', 'services', user, body, notice_from(query), sid)


def service_form(handler, query, user, sid, page, notice_from, service=None, errors=None):
    editing = bool(service and service.get('id'))
    values = service or {'name': '', 'anchor': '', 'short_scope': '', 'scope_items': '',
                         'deliverables': '', 'image_media_id': None, 'sort': 100,
                         'published': 1, 'id': None}
    image = content.media_by_id(values.get('image_media_id'))
    body = render.template(
        'service_form',
        heading='Edit service' if editing else 'New service',
        csrf=auth.csrf_token(sid),
        error_block=_errors_html(errors or []),
        service_id=values.get('id') or '',
        name=render.esc(values.get('name', '')),
        anchor=render.esc(values.get('anchor', '')),
        short_scope=render.esc(values.get('short_scope', '')),
        scope_items=render.esc(values.get('scope_items', '')),
        scope_paragraph=render.esc(values.get('scope_paragraph', '')),
        deliverables=render.esc(values.get('deliverables', '')),
        sort=render.esc(values.get('sort') or 100),
        image_options=_media_options(values.get('image_media_id')),
        current_thumb=_thumb(image),
        published_checked=' checked' if values.get('published') else '',
    )
    return page('Services', 'services', user, body, notice_from(query), sid)


def milestones_page(handler, query, user, sid, page, notice_from, edit=None, errors=None, form_values=None):
    edit = edit or {}
    rows = []
    for m in content.all_milestones():
        badge = ('<span class="badge badge--live">Shown</span>' if m['published']
                 else '<span class="badge badge--draft">Hidden</span>')
        rows.append(
            f'<tr><td class="mono">{m["year"]}</td><td>{render.esc(m["text"])}</td>'
            f'<td class="mono">{m["sort"]}</td><td>{badge}</td>'
            f'<td class="row-actions"><a href="/admin/milestones?edit={m["id"]}">Edit</a>'
            f'<form method="post" action="/admin/milestones/action">'
            f'<input type="hidden" name="csrf" value="{auth.csrf_token(sid)}">'
            f'<input type="hidden" name="id" value="{m["id"]}">'
            f'<input type="hidden" name="do" value="{"unpublish" if m["published"] else "publish"}">'
            f'<button class="linkish" type="submit">{"Hide" if m["published"] else "Show"}</button></form>'
            f'<a class="danger" href="/admin/confirm?action=delete_milestone&id={m["id"]}">Delete</a>'
            '</td></tr>')
    table = ('<table class="tbl"><thead><tr><th>Year</th><th>Entry</th><th>Order</th>'
             '<th>Status</th><th></th></tr></thead><tbody>'
             + ('\n'.join(rows) or '<tr><td colspan="5" class="muted">No milestones yet.</td></tr>')
             + '</tbody></table>')
    v = form_values or edit or {}
    body = render.template(
        'milestones',
        heading='Edit milestone' if edit.get('id') else 'Add milestone',
        csrf=auth.csrf_token(sid),
        milestone_id=edit.get('id') or '',
        error_block=_errors_html(errors or []),
        year=render.esc(v.get('year') or ''),
        text=render.esc(v.get('text') or ''),
        sort=render.esc(v.get('sort') or 100),
        published_checked=' checked' if (v.get('published') if form_values else v.get('published', 1)) else '',
        table=table,
        cancel=(f'<a href="/admin/milestones">Cancel</a>' if edit.get('id') else ''),
    )
    return page('Milestones', 'milestones', user, body, notice_from(query), sid)


def media_page(handler, query, user, sid, page, notice_from):
    tiles = []
    for m in content.media_all():
        widths = render.media_widths(m)
        w = widths[-1] if widths else (m['width'] or 640)
        refs = media_mod.usage(m['id'])
        used = f'used in: {render.esc(", ".join(refs))}' if refs else 'not used yet'
        delete = ('' if refs else
                  f'<a class="danger" href="/admin/confirm?action=delete_media&id={m["id"]}">Delete</a>')
        src = 'uploaded' if m['is_upload'] else 'site image'
        tiles.append(
            f'<div class="media-tile"><img src="{m["base"]}-{w}.jpg" alt="" loading="lazy" decoding="async">'
            f'<div class="media-tile__meta"><span class="mono">{render.esc(m["original_name"] or m["base"].rsplit("/", 1)[-1])}</span>'
            f'<span class="mono muted">{m["width"]}×{m["height"]} · {src}</span></div>'
            f'<form method="post" action="/admin/media/action" class="media-tile__alt">'
            f'<input type="hidden" name="csrf" value="{auth.csrf_token(sid)}">'
            f'<input type="hidden" name="id" value="{m["id"]}">'
            f'<label class="mono">Alt text</label>'
            f'<input type="text" name="alt" value="{render.esc(m["alt"] or "")}" maxlength="200">'
            f'<button class="linkish" type="submit">Save alt</button></form>'
            f'<p class="mono muted media-tile__usage">{used}</p>'
            f'<div class="media-tile__actions">{delete}</div></div>')
    grid = '<div class="media-grid">' + ('\n'.join(tiles) or '<p class="muted">No images yet.</p>') + '</div>'
    body = render.template('media', csrf=auth.csrf_token(sid), grid=grid)
    return page('Media', 'media', user, body, notice_from(query), sid)


def confirm_page(handler, query, user, sid, page, notice_from, field):
    action = query.get('action', [''])[0]
    raw_id = query.get('id', [''])[0]
    if not raw_id.isdigit():
        return _redirect_projects('Missing item', 'err')
    item_id = int(raw_id)
    name = details = ''
    if action == 'delete_project':
        row = content.project_by_id(item_id)
        if row:
            name = row['title']
            details = ('Published on the site.' if row['published'] else 'Draft.')
    elif action == 'delete_milestone':
        row = content.milestone_by_id(item_id)
        if row:
            name = f'{row["year"]} — {row["text"][:60]}'
    elif action == 'delete_media':
        row = content.media_by_id(item_id)
        if row:
            name = row['original_name'] or row['base'].rsplit('/', 1)[-1]
    if not name:
        return _redirect_projects('Item not found', 'err')
    routes = {
        'delete_project': ('/admin/projects/action', '/admin/projects'),
        'delete_milestone': ('/admin/milestones/action', '/admin/milestones'),
        'delete_media': ('/admin/media/action', '/admin/media'),
    }
    action_route, cancel_target = routes.get(action, ('/admin/projects/action', '/admin/projects'))
    body = render.template(
        'confirm', csrf=auth.csrf_token(sid), action=action, item_id=item_id,
        name=render.esc(name), details=render.esc(details),
        action_route=action_route, cancel_target=cancel_target)
    return page('Confirm', 'dashboard', user, body, notice_from(query), sid)


def _redirect_projects(message, kind):
    from .admin import Response
    return Response(303, '', 'text/plain', [('Location', f'/admin/projects?{kind}=' + urllib_quote(message))])


def services_dispatch(handler, path, query, method, form, user, sid, page, redirect, notice_from, field):
    if path == '/admin/services' and method == 'GET':
        return services_list(handler, query, user, sid, page, notice_from)
    if path == '/admin/services/edit' and method == 'GET':
        sid_ = query.get('id', [''])[0]
        service = content.service_by_id(int(sid_)) if sid_.isdigit() else None
        if not service:
            return redirect('/admin/services?err=Service+not+found')
        return service_form(handler, query, user, sid, page, notice_from, service=dict(service))
    if path == '/admin/services/save' and method == 'POST':
        data = _flatten(form)
        sid_ = field(form, 'id')
        service_id = int(sid_) if sid_.isdigit() else None
        uploaded = _process_uploads(form, user)
        if uploaded.get('error'):
            data['id'] = service_id
            return service_form(handler, query, user, sid, page, notice_from, service=data,
                                errors=[uploaded['error']])
        if uploaded.get('id'):
            data['image_media_id'] = str(uploaded['id'])
        new_id, errors = content.save_service(data, user, service_id=service_id)
        if errors:
            data['id'] = service_id
            return service_form(handler, query, user, sid, page, notice_from, service=data, errors=errors)
        row = content.service_by_id(new_id)
        return redirect('/admin/services?ok=' + urllib_quote(f'Saved “{row["name"]}”'))
    return None


def milestones_dispatch(handler, path, query, method, form, user, sid, page, redirect, notice_from, field):
    if path == '/admin/milestones' and method == 'GET':
        edit = None
        edit_id = query.get('edit', [''])[0]
        if edit_id.isdigit():
            row = content.milestone_by_id(int(edit_id))
            edit = dict(row) if row else None
        return milestones_page(handler, query, user, sid, page, notice_from, edit=edit)
    if path == '/admin/milestones/save' and method == 'POST':
        data = _flatten(form)
        mid = field(form, 'id')
        milestone_id = int(mid) if mid.isdigit() else None
        new_id, errors = content.save_milestone(data, user, milestone_id=milestone_id)
        if errors:
            return milestones_page(handler, query, user, sid, page, notice_from,
                                   edit={'id': milestone_id}, errors=errors, form_values=data)
        return redirect('/admin/milestones?ok=Saved')
    if path == '/admin/milestones/action' and method == 'POST':
        mid = field(form, 'id')
        do = field(form, 'do')
        if mid.isdigit():
            if do == 'delete':
                err = content.delete_milestone(int(mid), user)
            else:
                db.execute('UPDATE milestones SET published=?, updated_at=? WHERE id=?',
                           (1 if do == 'publish' else 0, db.now(), int(mid)))
                err = None
            if err:
                return redirect('/admin/milestones?err=' + urllib_quote(err))
        return redirect('/admin/milestones?ok=Done')
    return None


def media_dispatch(handler, path, query, method, form, user, sid, page, redirect, notice_from, field):
    if path == '/admin/media' and method == 'GET':
        return media_page(handler, query, user, sid, page, notice_from)
    if path == '/admin/media/upload' and method == 'POST':
        entries = [e for e in form.get('files', []) if e.get('filename')]
        if not entries:
            return redirect('/admin/media?err=Choose+at+least+one+image')
        errors = []
        for entry in entries:
            mid, error = media_mod.save_upload(entry['data'], entry['filename'],
                                               field(form, 'alt'))
            if error:
                errors.append(f'{entry["filename"]}: {error}')
            else:
                db.log(user, 'upload', 'media', mid, f'Uploaded {entry["filename"]}')
        if errors:
            return redirect('/admin/media?err=' + urllib_quote('; '.join(errors)))
        return redirect('/admin/media?ok=' + urllib_quote(f'Uploaded {len(entries)} image(s)'))
    if path == '/admin/media/action' and method == 'POST':
        mid = field(form, 'id')
        if mid.isdigit():
            if field(form, 'do') == 'delete':
                error = media_mod.delete_media(int(mid))
                if error:
                    return redirect('/admin/media?err=' + urllib_quote(error))
                db.log(user, 'delete', 'media', int(mid), 'Deleted image')
            else:
                error = content.set_media_alt(int(mid), field(form, 'alt'), user)
                if error:
                    return redirect('/admin/media?err=' + urllib_quote(error))
        return redirect('/admin/media?ok=Saved')
    return None


def dispatch(handler, path, query, method, form, user, sid, page, redirect, notice_from, field, files, flat):
    if path == '/admin':
        return dashboard(handler, query, user, sid, page, notice_from)
    if path.startswith('/admin/projects'):
        result = projects_dispatch(handler, path, query, method, form, user, sid,
                                   page, redirect, notice_from, field)
        return result or _not_found()
    if path.startswith('/admin/services'):
        result = services_dispatch(handler, path, query, method, form, user, sid,
                                   page, redirect, notice_from, field)
        return result or _not_found()
    if path.startswith('/admin/milestones'):
        result = milestones_dispatch(handler, path, query, method, form, user, sid,
                                     page, redirect, notice_from, field)
        return result or _not_found()
    if path.startswith('/admin/media'):
        result = media_dispatch(handler, path, query, method, form, user, sid,
                                page, redirect, notice_from, field)
        return result or _not_found()
    if path.startswith('/admin/confirm'):
        return confirm_page(handler, query, user, sid, page, notice_from, field)
    return _not_found()


def _not_found():
    from .admin import Response
    return Response(404, '<h1>Not found</h1><p><a href="/admin">Back to dashboard</a></p>')

