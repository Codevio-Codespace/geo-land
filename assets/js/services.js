(() => {
  'use strict';

  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const items = $$('.svc');
  if (!items.length) return;
  const heads = items.map((item) => item.querySelector('.svc__head'));

  const setOpen = (item, open) => {
    item.classList.toggle('is-open', open);
    const head = item.querySelector('.svc__head');
    if (head) head.setAttribute('aria-expanded', String(open));
  };

  heads.forEach((head, i) => {
    if (!head) return;
    head.addEventListener('click', () => {
      const item = items[i];
      const isOpen = item.classList.contains('is-open');
      items.forEach((it) => setOpen(it, false));
      if (!isOpen) setOpen(item, true);
    });
    head.addEventListener('keydown', (e) => {
      const n = heads.length;
      if (e.key === 'ArrowDown') { e.preventDefault(); heads[(i + 1) % n].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); heads[(i - 1 + n) % n].focus(); }
      if (e.key === 'Escape') setOpen(items[i], false);
    });
  });

  const fromHash = () => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target || !target.classList.contains('svc')) return;
    items.forEach((it) => setOpen(it, it === target));
    const top = target.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: 'auto' });
  };
  fromHash();
  window.addEventListener('hashchange', fromHash);
})();
