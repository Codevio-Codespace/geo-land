from playwright.sync_api import sync_playwright

BASE = 'http://127.0.0.1:4173'
PAGES = ['about', 'services', 'projects', 'technology', 'contact']
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1440, 'height': 760})
    for name in PAGES:
        page.goto(f'{BASE}/{name}.html', wait_until='networkidle')
        page.wait_for_timeout(600)
        page.screenshot(path=f'docs/qa/hero-{name}.png')
        print('saved hero-' + name)
    browser.close()
