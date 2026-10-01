import re

ROOT = r'C:\Users\Admin\geoland-kosova'


def read(name):
    return open(f'{ROOT}\\{name}', encoding='utf-8').read()


def write(name, text):
    open(f'{ROOT}\\{name}', 'w', encoding='utf-8', newline='\n').write(text)


# --- index.html: wrap services rows inside .svc-index ---
t = read('index.html')
open_tag = '<div class="svc-index">'
start = t.index(open_tag) + len(open_tag)
end = t.index('\n        </div>', start)
assert 'cms:' not in t[start:end], 'markers already present'
t = t[:start] + '\n          <!-- cms:services-index -->' + t[start:end] + '          <!-- /cms:services-index -->' + t[end:]
write('index.html', t)
print('index.html: services-index markers inserted')

# --- index.html: wrap .feat-grid + .feat-rows ---
t = read('index.html')
gstart = t.index('<div class="feat-grid">')
last_figure = t.index('<div class="feat-rows">')
end = t.index('\n        </div>', last_figure) + len('\n        </div>')
assert 'cms:featured' not in t
t = t[:gstart] + '<!-- cms:featured -->\n        ' + t[gstart:end] + '\n        <!-- /cms:featured -->' + t[end:]
write('index.html', t)
print('index.html: featured markers inserted')

# --- services.html: wrap the accordion articles ---
t = read('services.html')
open_tag = '<div class="svc-list">'
start = t.index(open_tag) + len(open_tag)
end = t.index('\n        </div>\n      </div>\n    </section>', start)
assert 'cms:' not in t[start:end]
t = t[:start] + '\n          <!-- cms:services-full -->' + t[start:end] + '\n          <!-- /cms:services-full -->' + t[end:]
write('services.html', t)
print('services.html: accordion markers inserted')

# --- about.html: wrap timeline items ---
t = read('about.html')
open_tag = '<ol class="timeline">'
assert open_tag in t, 'timeline open tag not found'
start = t.index(open_tag) + len(open_tag)
end = t.index('\n        </ol>', start)
assert 'cms:' not in t[start:end]
t = t[:start] + '\n          <!-- cms:milestones -->' + t[start:end] + '\n          <!-- /cms:milestones -->' + t[end:]
write('about.html', t)
print('about.html: milestone markers inserted')

# --- projects.js: literal -> API fetch ---
t = read('assets\\js\\projects.js')
t2, n = re.subn(r'  const PROJECTS = \[[\s\S]*?\n  \];', '  let PROJECTS = [];', t, count=1)
assert n == 1, 'PROJECTS literal not found'
t2 = t2.replace(
    '  const rows = PROJECTS.map((p, i) => {',
    '  function boot() {\n'
    '  const rows = PROJECTS.map((p, i) => {')
tail_old = "  const params = new URLSearchParams(window.location.search);\n  const initial = params.get('filter');\n  applyFilter(initial && (initial === 'all' || CATS[initial]) ? initial : 'all', false);\n})();"
tail_new = """  const params = new URLSearchParams(window.location.search);
  const initial = params.get('filter');
  applyFilter(initial && (initial === 'all' || CATS[initial]) ? initial : 'all', false);
  }

  function registerFailure() {
    list.innerHTML = '<p class="proj-empty">The project register is temporarily unavailable — '
      + 'please refresh, or <a href="contact.html">contact us</a> directly.</p>';
    if (countEl) countEl.textContent = '—';
  }

  fetch('/api/projects')
    .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then((data) => { PROJECTS = Array.isArray(data.projects) ? data.projects : []; boot(); })
    .catch(registerFailure);
})();"""
assert tail_old in t2, 'tail anchor not found'
t2 = t2.replace(tail_old, tail_new)
write('assets\\js\\projects.js', t2)
print('projects.js: literal swapped for /api/projects fetch')
