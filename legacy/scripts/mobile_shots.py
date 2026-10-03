from playwright.sync_api import sync_playwright

BASE = 'http://127.0.0.1:4173'
SHOTS = [
    ('index.html', '#services-title', 'mobile-home-services'),
    ('index.html', '.teaser', 'mobile-home-teaser'),
    ('services.html', '#surveying', 'mobile-services-accordion'),
    ('projects.html', '#proj-list', 'mobile-projects-list'),
    ('technology.html', '.table-scroll', 'mobile-tech-table'),
    ('contact.html', '#contact-form', 'mobile-contact-form'),
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
    for page_name, selector, out in SHOTS:
        page.goto(f'{BASE}/{page_name}', wait_until='networkidle')
        page.evaluate("document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-revealed'))")
        page.wait_for_timeout(400)
        el = page.locator(selector).first
        el.scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        page.screenshot(path=f'docs/qa/{out}.png')
        print('saved', out)
    browser.close()
