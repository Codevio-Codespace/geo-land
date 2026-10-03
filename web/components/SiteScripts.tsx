'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const $ = <T extends Element = Element>(selector: string, context: ParentNode = document) =>
  context.querySelector<T>(selector);
const $$ = <T extends Element = Element>(selector: string, context: ParentNode = document) =>
  Array.from(context.querySelectorAll<T>(selector));

function initNav(): () => void {
  const nav = $('.site-nav');
  if (!nav) return () => {};
  const toggle = $('.nav-toggle', nav);
  const drawer = $('.nav-drawer');
  const cleanups: (() => void)[] = [];

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  cleanups.push(() => window.removeEventListener('scroll', onScroll));

  if (!toggle || !drawer) return () => cleanups.forEach((fn) => fn());
  let lastFocus: Element | null = null;

  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    if (open) {
      lastFocus = document.activeElement;
      const first = $('a', drawer);
      if (first) (first as HTMLElement).focus();
    } else if (lastFocus) {
      (lastFocus as HTMLElement).focus();
      lastFocus = null;
    }
  };

  const onToggle = () => setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  toggle.addEventListener('click', onToggle);
  cleanups.push(() => toggle.removeEventListener('click', onToggle));

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
    if (e.key === 'Tab' && toggle.getAttribute('aria-expanded') === 'true') {
      const focusables = $$<HTMLElement>('a, button', drawer);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  document.addEventListener('keydown', onKeydown);
  cleanups.push(() => document.removeEventListener('keydown', onKeydown));

  $$('a', drawer).forEach((a) => a.addEventListener('click', () => setOpen(false)));
  cleanups.push(() => {
    document.body.classList.remove('nav-open');
    drawer.classList.remove('is-open');
  });
  return () => cleanups.forEach((fn) => fn());
}

function initReveal(): () => void {
  const items = $$<HTMLElement>('[data-reveal]');
  if (!items.length) return () => {};
  items.forEach((el) => {
    const delay = el.getAttribute('data-reveal-delay');
    if (delay) el.style.setProperty('--reveal-delay', delay + 'ms');
  });
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-revealed'));
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  items.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

function initYear(): void {
  const year = String(new Date().getFullYear());
  $$('[data-year]').forEach((el) => {
    el.textContent = year;
  });
}

function initLightbox(): () => void {
  const dialog = $<HTMLDialogElement>('.lightbox');
  if (!dialog) return () => {};
  const triggers = $$<HTMLElement>('[data-lightbox]');
  if (!triggers.length) return () => {};
  const cleanups: (() => void)[] = [];

  const img = $<HTMLImageElement>('img', dialog)!;
  const cap = $('[data-lightbox-caption]', dialog)!;
  const btnPrev = $('[data-lightbox-prev]', dialog);
  const btnNext = $('[data-lightbox-next]', dialog);
  const btnClose = $('[data-lightbox-close]', dialog);

  let group: HTMLElement[] = [];
  let index = 0;
  let opener: HTMLElement | null = null;

  const render = () => {
    const t = group[index];
    if (!t) return;
    const source = t.querySelector('img');
    img.src = t.getAttribute('data-full') || (source ? source.src : '');
    img.alt = source ? source.alt : '';
    cap.textContent = t.getAttribute('data-caption') || '';
  };

  const open = (trigger: HTMLElement) => {
    const key = trigger.getAttribute('data-lightbox');
    group = triggers.filter((t) => t.getAttribute('data-lightbox') === key);
    index = group.indexOf(trigger);
    opener = trigger;
    render();
    dialog.showModal();
  };

  const step = (dir: number) => {
    if (!group.length) return;
    index = (index + dir + group.length) % group.length;
    render();
  };

  triggers.forEach((t) => t.addEventListener('click', () => open(t)));
  if (btnPrev) btnPrev.addEventListener('click', () => step(-1));
  if (btnNext) btnNext.addEventListener('click', () => step(1));
  if (btnClose) btnClose.addEventListener('click', () => dialog.close());
  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  };
  dialog.addEventListener('keydown', onKeydown);
  const onClick = (e: MouseEvent) => {
    if (e.target === dialog) dialog.close();
  };
  dialog.addEventListener('click', onClick);
  dialog.addEventListener('close', () => {
    if (opener) opener.focus();
    opener = null;
  });
  cleanups.push(() => {
    triggers.forEach((t) => t.replaceWith(t.cloneNode(true)));
    dialog.close();
  });
  return () => {
    dialog.removeEventListener('keydown', onKeydown);
    dialog.removeEventListener('click', onClick);
    cleanups.forEach((fn) => fn());
  };
}

function initServices(): () => void {
  const items = $$<HTMLElement>('.svc');
  if (!items.length) return () => {};
  const heads = items.map((item) => item.querySelector<HTMLElement>('.svc__head'));

  const setOpen = (item: HTMLElement, open: boolean) => {
    item.classList.toggle('is-open', open);
    const head = item.querySelector('.svc__head');
    if (head) head.setAttribute('aria-expanded', String(open));
    const panel = item.querySelector('.svc-panel');
    if (panel) {
      panel.toggleAttribute('inert', !open);
      panel.setAttribute('aria-hidden', String(!open));
    }
  };

  const cleanups: (() => void)[] = [];
  heads.forEach((head, i) => {
    if (!head) return;
    const onClick = () => {
      const item = items[i];
      const isOpen = item.classList.contains('is-open');
      items.forEach((it) => setOpen(it, false));
      if (!isOpen) setOpen(item, true);
    };
    const onKeydown = (e: KeyboardEvent) => {
      const n = heads.length;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        heads[(i + 1) % n]?.focus();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        heads[(i - 1 + n) % n]?.focus();
      }
      if (e.key === 'Escape') setOpen(items[i], false);
    };
    head.addEventListener('click', onClick);
    head.addEventListener('keydown', onKeydown);
    cleanups.push(() => {
      head.removeEventListener('click', onClick);
      head.removeEventListener('keydown', onKeydown);
    });
  });

  items.forEach((item) => setOpen(item, item.classList.contains('is-open')));

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
  cleanups.push(() => window.removeEventListener('hashchange', fromHash));
  return () => cleanups.forEach((fn) => fn());
}

function initForm(): () => void {
  const form = $<HTMLFormElement>('#contact-form');
  if (!form) return () => {};
  const success = $<HTMLElement>('#form-success');
  const setError = (name: string, message: string) => {
    const field = $(`[name="${name}"]`, form);
    if (!field) return;
    const wrap = field.closest('.field');
    const error = wrap ? $('.field-error', wrap) : null;
    if (wrap) wrap.classList.toggle('field--error', Boolean(message));
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) error.textContent = message || '';
  };

  const onSubmit = (e: Event) => {
    e.preventDefault();
    const elements = form.elements as unknown as Record<string, HTMLInputElement & HTMLTextAreaElement>;
    const data = {
      name: elements.name.value.trim(),
      email: elements.email.value.trim(),
      subject: elements.subject.value.trim(),
      message: elements.message.value.trim(),
    };
    let ok = true;
    if (!data.name) {
      setError('name', 'Please enter your name.');
      ok = false;
    } else setError('name', '');
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setError('email', 'Please enter a valid email address.');
      ok = false;
    } else setError('email', '');
    if (!data.subject) {
      setError('subject', 'Please add a subject.');
      ok = false;
    } else setError('subject', '');
    if (!data.message) {
      setError('message', 'Please write a message.');
      ok = false;
    } else setError('message', '');
    if (!ok) {
      const firstInvalid = $<HTMLElement>('[aria-invalid="true"]', form);
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    const body = 'Name: ' + data.name + '\nEmail: ' + data.email + '\n\n' + data.message;
    window.location.href =
      'mailto:info@geoland-kosova.com' +
      '?subject=' +
      encodeURIComponent(data.subject) +
      '&body=' +
      encodeURIComponent(body);
    if (success) success.hidden = false;
  };

  form.addEventListener('submit', onSubmit);
  return () => form.removeEventListener('submit', onSubmit);
}

export function SiteScripts() {
  const pathname = usePathname();

  useEffect(() => {
    const cleanups = [initNav(), initReveal(), initLightbox(), initServices(), initForm()];
    initYear();
    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
