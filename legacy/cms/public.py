import html as html_mod
import json
import os

from . import content, db, render

CATS = content.CATS
ESC = render.esc


def services_index_html():
    rows = []
    for i, s in enumerate(content.public_services(), start=1):
        scope = s['short_scope'] or s['deliverables'] or ''
        rows.append(
            f'<a class="svc-index__row" href="services.html#{ESC(s["anchor"])}">\n'
            f'  <span class="mono svc-index__index">{i:02d}</span>\n'
            f'  <span class="svc-index__name">{ESC(s["name"])}</span>\n'
            f'  <span class="svc-index__scope">{ESC(scope)}</span>\n'
            f'  <span class="svc-index__arrow" aria-hidden="true">→</span>\n'
            '</a>')
    return '\n'.join(rows)


def featured_html():
    projects = content.featured_projects()
    if not projects:
        return ''
    large = projects[:2]
    compact = projects[2:4]
    cards = []
    for p in large:
        media = content.media_by_id(p['image_media_id'])
        meta = CATS.get(p['category'], p['category'])
        desc = (p['description'] or '').split('\n')[0][:160]
        cards.append(
            f'<a class="feat-card" href="project/{ESC(p["slug"])}">\n'
            f'  <figure>{render.picture(media, sizes="(max-width: 1023px) 100vw, 50vw")}</figure>\n'
            f'  <p class="mono feat-card__meta"><span>{ESC(meta)}</span><span>{p["year"] or ""}</span></p>\n'
            f'  <h3>{ESC(p["title"])}</h3>\n'
            + (f'  <p class="muted">{ESC(desc)}</p>\n' if desc else '')
            + '</a>')
    rows = []
    for p in compact:
        meta = CATS.get(p['category'], p['category'])
        if p['org']:
            meta = f'{meta} · {p["org"]}'
        rows.append(
            '<a class="feat-row" href="project/' + ESC(p['slug']) + '">\n'
            f'  <h3>{ESC(p["title"])}</h3>\n'
            f'  <span>{ESC(meta)}</span>\n'
            f'  <span class="mono">{p["year"] or ""} →</span>\n'
            '</a>')
    grid = '<div class="feat-grid">\n' + '\n'.join(cards) + '\n</div>'
    row_block = ('<div class="feat-rows">\n' + '\n'.join(rows) + '\n</div>') if rows else ''
    return grid + ('\n' + row_block if row_block else '')


def services_accordion_html():
    services = content.public_services()
    articles = []
    for i, s in enumerate(services, start=1):
        media = content.media_by_id(s['image_media_id'])
        open_state = ' is-open' if i == 1 else ''
        expanded = 'true' if i == 1 else 'false'
        items = [line for line in (s['scope_items'] or '').splitlines() if line.strip()]
        if items:
            scope = '<ul>' + ''.join(f'<li>{ESC(item)}</li>' for item in items) + '</ul>'
            if s['scope_paragraph']:
                scope += f'<p class="muted svc-note">{ESC(s["scope_paragraph"])}</p>'
        else:
            scope = f'<p>{ESC(s["scope_paragraph"] or s["short_scope"])}</p>'
        caption = ESC(s['deliverables']) if s['deliverables'] else ''
        figure = ''
        if media:
            figure = (f'<figure>{render.picture(media, sizes="(max-width: 1023px) 100vw, 40vw")}'
                      + (f'<figcaption>{caption}</figcaption>' if caption else '')
                      + '</figure>')
        else:
            figure = f'<figure><figcaption>{caption}</figcaption></figure>'
        articles.append(
            f'<article class="svc{open_state}" id="{ESC(s["anchor"])}">\n'
            '  <h3>\n'
            f'    <button class="svc__head" type="button" aria-expanded="{expanded}" aria-controls="svc-panel-{ESC(s["anchor"])}">\n'
            f'      <span class="mono svc__index">{i:02d}</span>\n'
            f'      <span class="svc__name">{ESC(s["name"])}</span>\n'
            '      <span class="svc__chev" aria-hidden="true"></span>\n'
            '    </button>\n'
            '  </h3>\n'
            f'  <div class="svc-panel" id="svc-panel-{ESC(s["anchor"])}" role="region" aria-label="{ESC(s["name"])} scope">\n'
            '    <div class="svc-panel__inner">\n'
            '      <div class="svc-panel__grid">\n'
            f'        <div><h4>Scope</h4>{scope}</div>\n'
            f'        {figure}\n'
            '      </div>\n'
            '    </div>\n'
            '  </div>\n'
            '</article>')
    return '\n'.join(articles)


def milestones_html():
    rows = []
    for m in content.public_milestones():
        rows.append(f'<li><span class="mono">{m["year"]}</span><p>{ESC(m["text"])}</p></li>')
    return '\n'.join(rows)


def api_projects():
    projects = []
    for p in content.public_projects():
        media = content.media_by_id(p['image_media_id'])
        img = ''
        if media:
            widths = [int(w) for w in render.media_widths(media) if w.isdigit()]
            w = 900 if 900 in widths else (max(widths) if widths else None)
            img = f'{media["base"]}-{w}' if w else media['base']
        projects.append({
            'id': p['slug'],
            'title': p['title'],
            'cat': p['category'],
            'year': p['year'] or '',
            'org': p['org'] or '',
            'desc': p['description'] or '',
            'img': img,
        })
    return {
        'cats': CATS,
        'projects': projects,
        'count': len(projects),
    }


def sitemap_xml(base='https://www.geoland-kosova.com'):
    urls = ['/', '/about.html', '/services.html', '/projects.html',
            '/technology.html', '/contact.html']
    urls += [f'/project/{p["slug"]}' for p in content.public_projects()]
    entries = []
    for u in urls:
        loc = base + u
        entries.append(f'  <url><loc>{html_mod.escape(loc)}</loc>'
                       '<lastmod>2026-10-01</lastmod><changefreq>monthly</changefreq>'
                       f'<priority>{"1.0" if u == "/" else "0.8"}</priority></url>')
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            + '\n'.join(entries) + '\n</urlset>\n')


PAGE_BLOCKS = {
    'index.html': [('services-index', services_index_html),
                   ('featured', featured_html)],
    'services.html': [('services-full', services_accordion_html)],
    'about.html': [('milestones', milestones_html)],
}


def transform_page(filename, html_text):
    for marker, builder in PAGE_BLOCKS.get(filename, []):
        try:
            html_text = render.replace_block(html_text, marker, builder())
        except Exception as exc:  # never take the public site down
            print(f'[cms] block {marker} failed: {exc}')
    return html_text


def project_page(slug, base_url='https://www.geoland-kosova.com'):
    p = content.public_project_by_slug(slug)
    if not p:
        return None
    media = content.media_by_id(p['image_media_id'])
    gallery = content.project_images(p['id'])
    cat = CATS.get(p['category'], p['category'])
    meta_bits = [cat]
    if p['year']:
        meta_bits.append(str(p['year']))
    if p['org']:
        meta_bits.append(p['org'])
    meta_line = ' · '.join(meta_bits)

    description = (p['description'] or '').strip()
    meta_desc = (description.split('\n')[0][:160] or f'{p["title"]} — a Geo&Land project.') \
        .replace('"', '&quot;')
    og_image = ''
    if media:
        widths = [int(w) for w in render.media_widths(media) if w.isdigit()]
        w = 900 if 900 in widths else (max(widths) if widths else None)
        if w:
            og_image = f'{base_url}{media["base"]}-{w}.jpg'

    crumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': base_url + '/'},
            {'@type': 'ListItem', 'position': 2, 'name': 'Projects', 'item': base_url + '/projects.html'},
            {'@type': 'ListItem', 'position': 3, 'name': p['title'],
             'item': f'{base_url}/project/{p["slug"]}'},
        ],
    }
    head = (
        f'<title>{ESC(p["title"])} — Geo&Land Kosova</title>\n'
        f'  <meta name="description" content="{meta_desc}">\n'
        f'  <link rel="canonical" href="{base_url}/project/{ESC(p["slug"])}">\n'
        '  <meta property="og:type" content="article">\n'
        f'  <meta property="og:title" content="{ESC(p["title"])} — Geo&Land Kosova">\n'
        f'  <meta property="og:description" content="{meta_desc}">\n'
        f'  <meta property="og:url" content="{base_url}/project/{ESC(p["slug"])}">\n'
        + (f'  <meta property="og:image" content="{og_image}">\n' if og_image else '')
        + '  <script type="application/ld+json">\n  '
        + json.dumps(crumb, ensure_ascii=False)
        + '\n  </script>')

    hero = (
        '<section class="page-hero page-hero--projects" aria-labelledby="page-title">\n'
        '  <div class="container page-hero__inner">\n'
        '    <p class="mono page-hero__crumb"><a href="index.html">Home</a> / '
        '<a href="projects.html">Projects</a> / <span>' + ESC(p['title']) + '</span></p>\n'
        f'    <h1 id="page-title">{ESC(p["title"])}</h1>\n'
        f'    <p class="mono muted">{ESC(meta_line)}</p>\n'
        '  </div>\n</section>')

    figure = ('<figure class="about-profile__figure">'
              + render.picture(media, sizes='(max-width: 1023px) 100vw, 45vw', loading='eager')
              + '</figure>') if media else ''
    copy = ('<div class="about-profile__copy">\n'
            + render.paragraphs(description)
            + '\n<p><a class="link-arrow" href="projects.html">Back to the register</a></p>\n</div>')
    body = ('<section class="section">\n<div class="container about-profile">\n'
            + figure + '\n' + copy + '\n</div>\n</section>')

    if gallery:
        thumbs = []
        for m in gallery:
            label = m['alt'] or p['title']
            thumbs.append(
                '<button type="button" data-lightbox="project-gallery" '
                f'data-caption="{ESC(label)}" aria-label="Open image: {ESC(label)}">'
                + render.picture(m, sizes='(max-width: 719px) 70vw, 320px')
                + '</button>')
        body += ('\n<section class="section section--paper2" aria-labelledby="gallery-title">\n'
                 '<div class="container">\n'
                 '<header class="section-head">'
                 '<div class="section-head__row">'
                 '<span class="mono section-head__index">[ 01 ]</span>'
                 '<span class="mono eyebrow">Gallery</span>'
                 '<span class="section-head__rule"></span></div>'
                 f'<h2 id="gallery-title">{len(gallery)} images from this project.</h2></header>\n'
                 '<div class="gallery-strip">'
                 + '\n'.join(thumbs) + '</div>\n</div>\n</section>')

    path = os.path.join(db.ROOT, 'project-template.html')
    t = open(path, encoding='utf-8').read()
    t = render.replace_block(t, 'head', head)
    t = render.replace_block(t, 'hero', hero)
    t = render.replace_block(t, 'body', body)
    return t
