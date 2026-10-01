(() => {
  'use strict';

  const CATS = {
    'gis-agri': 'GIS & Agriculture',
    software: 'Software Development',
    cadastre: 'Geodetic & Cadastral Surveying',
    forestry: 'Forestry',
  };

  let PROJECTS = [];

  const list = document.getElementById('proj-list');
  if (!list) return;

  const dialog = document.getElementById('project-dialog');
  const dImage = document.getElementById('dialog-image');
  const dMeta = document.getElementById('dialog-meta');
  const dTitle = document.getElementById('dialog-title');
  const dDesc = document.getElementById('dialog-desc');
  const closeBtn = dialog.querySelector('[data-dialog-close]');
  const countEl = document.getElementById('proj-count');
  const status = document.getElementById('proj-status');
  const peek = document.getElementById('proj-peek');
  const peekImg = peek.querySelector('img');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  const pad = (n) => String(n).padStart(2, '0');

  function boot() {
  const rows = PROJECTS.map((p, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'proj-row';
    btn.dataset.cat = p.cat;
    btn.setAttribute('aria-label', 'Open project details: ' + p.title);
    btn.innerHTML =
      '<span class="mono proj-row__index">' + pad(i + 1) + '</span>' +
      '<span class="proj-row__title">' + p.title + '</span>' +
      '<span class="proj-row__cat">' + CATS[p.cat] + '</span>' +
      '<span class="mono proj-row__year">' + p.year + '</span>' +
      '<span class="proj-row__arrow" aria-hidden="true">\u2192</span>';
    return btn;
  });
  rows.forEach((row) => list.appendChild(row));

  const filterButtons = Array.from(document.querySelectorAll('.filters button'));
  const applyFilter = (filter, announce = true) => {
    let visible = 0;
    rows.forEach((row) => {
      const show = filter === 'all' || row.dataset.cat === filter;
      row.hidden = !show;
      if (show) visible += 1;
    });
    countEl.textContent = String(visible);
    if (announce) status.textContent = visible + ' projects shown';
    filterButtons.forEach((b) => {
      const active = b.dataset.filter === filter;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });
  };
  filterButtons.forEach((b) => {
    b.addEventListener('click', () => {
      applyFilter(b.dataset.filter);
      const url = new URL(window.location.href);
      if (b.dataset.filter === 'all') url.searchParams.delete('filter');
      else url.searchParams.set('filter', b.dataset.filter);
      history.replaceState(null, '', url);
    });
  });

  const openProject = (project) => {
    dImage.src = project.img + '.jpg';
    dImage.alt = project.title;
    dMeta.textContent = [CATS[project.cat], project.year, project.org].filter(Boolean).join(' \u00b7 ');
    dTitle.textContent = project.title;
    dDesc.textContent = project.desc || 'Scope details are available on request — contact us for the full project record.';
    dialog.showModal();
  };

  list.addEventListener('click', (e) => {
    const row = e.target.closest('.proj-row');
    if (!row) return;
    const index = rows.indexOf(row);
    if (index > -1) openProject(PROJECTS[index]);
  });
  closeBtn.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  if (finePointer.matches) {
    let px = 0, py = 0, tx = 0, ty = 0, raf = null;
    const tick = () => {
      px += (tx - px) * 0.18;
      py += (ty - py) * 0.18;
      peek.style.transform = 'translate3d(' + (px - 150) + 'px,' + (py - 112) + 'px,0)';
      if (peek.classList.contains('is-visible')) raf = requestAnimationFrame(tick);
      else raf = null;
    };
    list.addEventListener('mouseover', (e) => {
      const row = e.target.closest('.proj-row');
      if (!row || row.hidden) return;
      const index = rows.indexOf(row);
      if (index < 0) return;
      const src = PROJECTS[index].img + '.jpg';
      if (peekImg.getAttribute('src') !== src) {
        peekImg.src = src;
        peekImg.alt = '';
      }
      peek.classList.add('is-visible');
      if (!raf) raf = requestAnimationFrame(tick);
    });
    list.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
    });
    list.addEventListener('mouseleave', () => peek.classList.remove('is-visible'));
  }

  const params = new URLSearchParams(window.location.search);
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
})();
