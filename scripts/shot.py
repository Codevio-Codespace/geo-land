import sys
from playwright.sync_api import sync_playwright

url = sys.argv[1]
out = sys.argv[2]
width = int(sys.argv[3]) if len(sys.argv) > 3 else 1440
height = int(sys.argv[4]) if len(sys.argv) > 4 else 900
full = len(sys.argv) > 5 and sys.argv[5] == 'full'

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': width, 'height': height})
    errors = []
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(url, wait_until='networkidle')
    page.wait_for_timeout(900)
    if full:
        page.evaluate("""async () => {
            let last = 0;
            for (let i = 0; i < 40; i++) {
                window.scrollTo(0, document.body.scrollHeight);
                await new Promise(r => setTimeout(r, 120));
                if (document.body.scrollHeight === last && i > 2) break;
                last = document.body.scrollHeight;
                window.scrollTo(0, last * 0.7);
                await new Promise(r => setTimeout(r, 120));
            }
            document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
            document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-revealed'));
            await Promise.all(Array.from(document.images).map(img =>
                img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; })
            ));
            window.scrollTo(0, 0);
        }""")
        page.wait_for_timeout(600)
    page.screenshot(path=out, full_page=full)
    print('saved', out, '| console errors:', errors if errors else 'none')
    browser.close()
