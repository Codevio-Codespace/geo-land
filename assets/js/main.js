(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  function initNav() {
    const nav = $('.site-nav');
    if (!nav) return;
    const toggle = $('.nav-toggle', nav);
    const drawer = $('.nav-drawer');

    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!toggle || !drawer) return;
    let lastFocus = null;

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      drawer.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      if (open) {
        lastFocus = document.activeElement;
        const first = $('a', drawer);
        if (first) first.focus();
      } else if (lastFocus) {
        lastFocus.focus();
        lastFocus = null;
      }
    };

    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
      if (e.key === 'Tab' && toggle.getAttribute('aria-expanded') === 'true') {
        const focusables = $$('a, button', drawer);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    $$('a', drawer).forEach((a) => a.addEventListener('click', () => setOpen(false)));
  }

  function initReveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;
    items.forEach((el) => {
      const delay = el.getAttribute('data-reveal-delay');
      if (delay) el.style.setProperty('--reveal-delay', delay + 'ms');
    });
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-revealed'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => io.observe(el));
  }

  function initYear() {
    const year = String(new Date().getFullYear());
    $$('[data-year]').forEach((el) => { el.textContent = year; });
  }

  function initLightbox() {
    const dialog = $('.lightbox');
    if (!dialog) return;
    const triggers = $$('[data-lightbox]');
    if (!triggers.length) return;

    const img = $('img', dialog);
    const cap = $('[data-lightbox-caption]', dialog);
    const btnPrev = $('[data-lightbox-prev]', dialog);
    const btnNext = $('[data-lightbox-next]', dialog);
    const btnClose = $('[data-lightbox-close]', dialog);

    let group = [];
    let index = 0;
    let opener = null;

    const render = () => {
      const t = group[index];
      if (!t) return;
      const source = t.querySelector('img');
      img.src = t.getAttribute('data-full') || (source ? source.src : '');
      img.alt = source ? source.alt : '';
      cap.textContent = t.getAttribute('data-caption') || '';
    };

    const open = (trigger) => {
      const key = trigger.getAttribute('data-lightbox');
      group = triggers.filter((t) => t.getAttribute('data-lightbox') === key);
      index = group.indexOf(trigger);
      opener = trigger;
      render();
      dialog.showModal();
    };

    const step = (dir) => {
      if (!group.length) return;
      index = (index + dir + group.length) % group.length;
      render();
    };

    triggers.forEach((t) => t.addEventListener('click', () => open(t)));
    if (btnPrev) btnPrev.addEventListener('click', () => step(-1));
    if (btnNext) btnNext.addEventListener('click', () => step(1));
    if (btnClose) btnClose.addEventListener('click', () => dialog.close());
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (opener) opener.focus();
      opener = null;
    });
  }

  function initForm() {
    const form = $('#contact-form');
    if (!form) return;
    const success = $('#form-success');
    const setError = (name, message) => {
      const field = $('[name="' + name + '"]', form);
      if (!field) return;
      const wrap = field.closest('.field');
      const error = $('.field-error', wrap);
      wrap.classList.toggle('field--error', Boolean(message));
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (error) error.textContent = message || '';
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        subject: form.elements.subject.value.trim(),
        message: form.elements.message.value.trim(),
      };
      let ok = true;
      if (!data.name) { setError('name', 'Please enter your name.'); ok = false; } else setError('name', '');
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        setError('email', 'Please enter a valid email address.'); ok = false;
      } else setError('email', '');
      if (!data.subject) { setError('subject', 'Please add a subject.'); ok = false; } else setError('subject', '');
      if (!data.message) { setError('message', 'Please write a message.'); ok = false; } else setError('message', '');
      if (!ok) {
        const firstInvalid = $('[aria-invalid="true"]', form);
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      const body = 'Name: ' + data.name + '\nEmail: ' + data.email + '\n\n' + data.message;
      window.location.href = 'mailto:info@geoland-kosova.com'
        + '?subject=' + encodeURIComponent(data.subject)
        + '&body=' + encodeURIComponent(body);
      if (success) success.hidden = false;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initReveal();
    initYear();
    initLightbox();
    initForm();
  });
})();
