from playwright.sync_api import sync_playwright

BASE = 'http://127.0.0.1:4173'
with sync_playwright() as p:
    browser = p.chromium.launch()

    m = browser.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
    m.goto(f'{BASE}/index.html', wait_until='networkidle')
    m.click('.nav-toggle')
    m.wait_for_timeout(450)
    m.screenshot(path='docs/qa/fix-drawer-open.png')
    print('drawer saved')

    d = browser.new_page(viewport={'width': 1440, 'height': 900})
    d.goto(f'{BASE}/contact.html', wait_until='networkidle')
    d.evaluate("document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-revealed'))")
    d.locator('#contact-form').scroll_into_view_if_needed()
    d.wait_for_timeout(400)
    d.locator('#cf-name').focus()
    d.screenshot(path='docs/qa/fix-contact-focus.png')
    print('contact saved')

    d.goto(f'{BASE}/index.html', wait_until='networkidle')
    d.evaluate("document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-revealed'))")
    d.wait_for_timeout(300)
    d.screenshot(path='docs/qa/fix-home-hero.png')
    d.locator('.feat-grid').scroll_into_view_if_needed()
    d.wait_for_timeout(600)
    d.screenshot(path='docs/qa/fix-home-featured.png')
    print('home saved')
    browser.close()
