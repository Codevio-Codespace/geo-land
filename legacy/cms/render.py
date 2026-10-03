import html
import os
import re

TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')


def esc(value):
    return html.escape(str(value if value is not None else ''), quote=True)


def template(template_name, **ctx):
    path = os.path.join(TEMPLATE_DIR, template_name + '.html')
    if not os.path.exists(path):
        return ''
    t = open(path, encoding='utf-8').read()
    for key in re.findall(r'\{\{#(\w+)\}\}', t):
        pattern = r'\{\{#' + key + r'\}\}(.*?)\{\{/' + key + r'\}\}'
        if ctx.get(key):
            t = re.sub(pattern, lambda m: m.group(1), t, flags=re.S)
        else:
            t = re.sub(pattern, '', t, flags=re.S)
    for key, value in ctx.items():
        t = t.replace('{{{' + key + '}}}', str(value if value is not None else ''))
    def sub_esc(m):
        return esc(ctx.get(m.group(1), ''))
    t = re.sub(r'\{\{(\w+)\}\}', sub_esc, t)
    return t


def replace_block(html_text, marker, inner):
    if not inner:
        return html_text
    start = f'<!-- cms:{marker} -->'
    end = f'<!-- /cms:{marker} -->'
    a = html_text.find(start)
    b = html_text.find(end)
    if a == -1 or b == -1 or b < a:
        return html_text
    return html_text[:a + len(start)] + '\n' + inner + '\n' + html_text[b:]


def media_widths(media_row):
    if not media_row:
        return []
    return [w for w in (media_row['widths'] or '').split(',') if w.isdigit()]


def picture(media_row, alt=None, sizes='100vw', loading='lazy', cls=None):
    if not media_row:
        return ''
    widths = sorted((int(w) for w in media_widths(media_row)), reverse=True)
    if not widths:
        return ''
    base = media_row['base']
    webp_set = ', '.join(f'{base}-{w}.webp {w}w' for w in widths)
    jpg_set = ', '.join(f'{base}-{w}.jpg {w}w' for w in widths)
    largest = widths[0]
    alt_text = esc(alt if alt is not None else (media_row['alt'] or ''))
    cls_attr = f' class="{esc(cls)}"' if cls else ''
    return (
        '<picture>'
        f'<source type="image/webp" srcset="{webp_set}" sizes="{esc(sizes)}">'
        f'<img{cls_attr} src="{base}-{largest}.jpg" srcset="{jpg_set}" sizes="{esc(sizes)}"'
        f' width="{media_row["width"] or largest}" height="{media_row["height"] or largest}"'
        f' alt="{alt_text}" loading="{esc(loading)}" decoding="async">'
        '</picture>'
    )


def paragraphs(text):
    if not text:
        return ''
    parts = [p.strip() for p in re.split(r'\n\s*\n', text.strip()) if p.strip()]
    return '\n'.join('<p>' + esc(p).replace('\n', '<br>') + '</p>' for p in parts)


def split_lines(text):
    return [line.strip() for line in (text or '').splitlines() if line.strip()]
