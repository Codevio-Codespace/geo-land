from playwright.sync_api import sync_playwright

BASE = 'http://127.0.0.1:4173'

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    errors = []
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.on('pageerror', lambda e: errors.append(str(e)))

    # projects: filter + dialog
    page.goto(BASE + '/projects.html', wait_until='networkidle')
    page.wait_for_timeout(500)
    total = page.locator('.proj-row:visible').count()
    page.click('button[data-filter="software"]')
    page.wait_for_timeout(300)
    soft = page.locator('.proj-row:visible').count()
    count_text = page.locator('#proj-count').inner_text()
    print('projects total/visible:', total, 'software:', soft, 'count label:', count_text)
    page.locator('.proj-row:visible').first.click()
    page.wait_for_timeout(400)
    dialog_open = page.locator('#project-dialog[open]').count()
    title = page.locator('#dialog-title').inner_text()
    print('dialog open:', dialog_open, '| title:', title)
    page.keyboard.press('Escape')
    page.wait_for_timeout(300)
    print('dialog closed:', page.locator('#project-dialog[open]').count() == 0)

    # services: accordion
    page.goto(BASE + '/services.html', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.click('#surveying .svc__head')
    page.wait_for_timeout(500)
    print('svc1 open:', page.locator('#gis.is-open').count(), '| svc2 open:', page.locator('#surveying.is-open').count())
    page.keyboard.press('Escape')
    print('svc2 after Esc:', page.locator('#surveying.is-open').count())

    # hash deep link
    page.goto(BASE + '/services.html#uav', wait_until='networkidle')
    page.wait_for_timeout(600)
    print('uav open via hash:', page.locator('#uav.is-open').count())

    # mobile drawer
    page.set_viewport_size({'width': 390, 'height': 844})
    page.goto(BASE + '/index.html', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.click('.nav-toggle')
    page.wait_for_timeout(400)
    print('drawer open:', page.locator('.nav-drawer.is-open').count(),
          '| aria:', page.locator('.nav-toggle').get_attribute('aria-expanded'))
    page.keyboard.press('Escape')
    page.wait_for_timeout(300)
    print('drawer closed:', page.locator('.nav-drawer.is-open').count() == 0)

    # lighbox
    page.set_viewport_size({'width': 1440, 'height': 900})
    page.goto(BASE + '/index.html', wait_until='networkidle')
    page.wait_for_timeout(500)
    page.locator('[data-lightbox="home-uav"]').first.click()
    page.wait_for_timeout(400)
    print('lightbox open:', page.locator('.lightbox[open]').count())
    page.keyboard.press('ArrowRight')
    page.wait_for_timeout(300)
    page.keyboard.press('Escape')
    page.wait_for_timeout(200)
    print('lightbox closed:', page.locator('.lightbox[open]').count() == 0)

    print('console errors:', errors if errors else 'none')
    browser.close()
