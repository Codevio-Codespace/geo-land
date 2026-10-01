import os
import sys
from playwright.sync_api import sync_playwright

BASE = 'http://127.0.0.1:4173'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', 'qa', 'screenshots')
os.makedirs(OUT, exist_ok=True)

PAGES = ['index.html', 'about.html', 'services.html', 'projects.html', 'technology.html', 'contact.html']
VIEWPORTS = [(1440, 900, 'desktop'), (390, 844, 'mobile')]

failures = []

def check(name, condition, detail=''):
    status = 'PASS' if condition else 'FAIL'
    print(f'  [{status}] {name}' + (f' — {detail}' if detail and not condition else ''))
    if not condition:
        failures.append(f'{name}: {detail}')

def settle(page, full=True):
    if not full:
        return
    page.evaluate("""async () => {
        let last = 0;
        for (let i = 0; i < 40; i++) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(r => setTimeout(r, 100));
            if (document.body.scrollHeight === last && i > 2) break;
            last = document.body.scrollHeight;
            window.scrollTo(0, last * 0.7);
            await new Promise(r => setTimeout(r, 100));
        }
        document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
        document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-revealed'));
        await Promise.all(Array.from(document.images).map(img =>
            img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; })
        ));
        window.scrollTo(0, 0);
    }""")
    page.wait_for_timeout(400)

with sync_playwright() as p:
    browser = p.chromium.launch()

    print('== Page checks ==')
    for page_name in PAGES:
        for w, h, label in VIEWPORTS:
            page = browser.new_page(viewport={'width': w, 'height': h})
            errors = []
            page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(f'{BASE}/{page_name}', wait_until='networkidle')
            settle(page, full=(label == 'desktop'))
            check(f'{page_name} [{label}] console', not errors, str(errors))
            overflow = page.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
            check(f'{page_name} [{label}] no horizontal overflow', overflow <= 1, f'overflow {overflow}px')
            h1 = page.locator('h1').count()
            check(f'{page_name} [{label}] single h1', h1 == 1, f'found {h1}')
            no_alt = page.evaluate("Array.from(document.images).filter(i => !i.hasAttribute('alt')).length")
            check(f'{page_name} [{label}] images have alt', no_alt == 0, f'{no_alt} missing')
            broken = page.evaluate("Array.from(document.images).filter(i => { const s = i.getAttribute('src'); return !!s && i.complete && i.naturalWidth === 0; }).length")
            check(f'{page_name} [{label}] no broken images', broken == 0, f'{broken} broken')
            page.screenshot(path=os.path.join(OUT, f'{page_name.replace(".html", "")}-{label}.png'), full_page=True)
            page.close()

    print('== Interactions ==')
    page = browser.new_page(viewport={'width': 1440, 'height': 900})

    page.goto(f'{BASE}/services.html', wait_until='networkidle')
    page.wait_for_timeout(400)
    page.click('#surveying .svc__head')
    page.wait_for_timeout(450)
    check('services accordion opens target', page.locator('#surveying.is-open').count() == 1)
    check('services accordion closes others', page.locator('#gis.is-open').count() == 0)
    check('services aria-expanded synced', page.locator('#surveying .svc__head').get_attribute('aria-expanded') == 'true')

    page.goto(f'{BASE}/projects.html', wait_until='networkidle')
    page.wait_for_timeout(400)
    page.click('button[data-filter="forestry"]')
    page.wait_for_timeout(250)
    check('projects filter count', page.locator('#proj-count').inner_text() == '2')
    visible = page.locator('.proj-row:visible').count()
    check('projects visible rows', visible == 2, f'{visible} visible')
    page.locator('.proj-row:visible').first.click()
    page.wait_for_timeout(350)
    check('projects dialog opens', page.locator('#project-dialog[open]').count() == 1)
    page.keyboard.press('Escape')
    page.wait_for_timeout(250)
    check('projects dialog closes on Esc', page.locator('#project-dialog[open]').count() == 0)

    page.goto(f'{BASE}/contact.html', wait_until='networkidle')
    page.wait_for_timeout(400)
    page.click('#contact-form button[type="submit"]')
    page.wait_for_timeout(250)
    errs = page.locator('.field-error:not(:empty)').count()
    check('contact form shows errors on empty submit', errs >= 4, f'{errs} errors')

    page.set_viewport_size({'width': 390, 'height': 844})
    page.goto(f'{BASE}/index.html', wait_until='networkidle')
    page.wait_for_timeout(400)
    page.click('.nav-toggle')
    page.wait_for_timeout(350)
    check('mobile drawer opens', page.locator('.nav-drawer.is-open').count() == 1)
    page.keyboard.press('Escape')
    page.wait_for_timeout(250)
    check('mobile drawer closes on Esc', page.locator('.nav-drawer.is-open').count() == 0)
    page.close()

    browser.close()

print()
if failures:
    print(f'RESULT: {len(failures)} FAILURES')
    for f in failures:
        print(' -', f)
    sys.exit(1)
print('RESULT: ALL CHECKS PASSED')
