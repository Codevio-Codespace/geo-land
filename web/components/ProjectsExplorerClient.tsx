'use client';

import { useEffect, useRef, useState } from 'react';

const CATS: Record<string, string> = {
  'gis-agri': 'GIS & Agriculture',
  software: 'Software Development',
  cadastre: 'Geodetic & Cadastral Surveying',
  forestry: 'Forestry',
};

export interface ExplorerProject {
  id: string;
  title: string;
  cat: string;
  year: string | number;
  org: string;
  desc: string;
  img: string;
}

export function ProjectsExplorerClient({ projects }: { projects: ExplorerProject[] }) {
  const [filter, setFilter] = useState('all');
  const [status, setStatus] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const peekRef = useRef<HTMLDivElement>(null);
  const peekImgRef = useRef<HTMLImageElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dImageRef = useRef<HTMLImageElement>(null);
  const dMetaRef = useRef<HTMLParagraphElement>(null);
  const dTitleRef = useRef<HTMLHeadingElement>(null);
  const dDescRef = useRef<HTMLParagraphElement>(null);

  const visibleProjects = projects.filter((p) => filter === 'all' || p.cat === filter);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('filter');
    if (initial && (initial === 'all' || CATS[initial])) setFilter(initial);
  }, []);

  const applyFilter = (next: string, announce = true) => {
    setFilter(next);
    if (announce) {
      const count = projects.filter((p) => next === 'all' || p.cat === next).length;
      setStatus(count + ' projects shown');
    }
    const url = new URL(window.location.href);
    if (next === 'all') url.searchParams.delete('filter');
    else url.searchParams.set('filter', next);
    history.replaceState(null, '', url);
  };

  const openProject = (project: ExplorerProject) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (dImageRef.current) {
      dImageRef.current.src = project.img + '.jpg';
      dImageRef.current.alt = project.title;
    }
    if (dMetaRef.current) {
      dMetaRef.current.textContent = [CATS[project.cat], project.year, project.org].filter(Boolean).join(' · ');
    }
    if (dTitleRef.current) dTitleRef.current.textContent = project.title;
    if (dDescRef.current) {
      dDescRef.current.textContent =
        project.desc || 'Scope details are available on request — contact us for the full project record.';
    }
    dialog.showModal();
  };

  useEffect(() => {
    const list = listRef.current;
    const peek = peekRef.current;
    const peekImg = peekImgRef.current;
    if (!list || !peek || !peekImg) return;

    const dialog = dialogRef.current;
    const onDialogClick = (e: MouseEvent) => {
      if (e.target === dialog) dialog?.close();
    };
    dialog?.addEventListener('click', onDialogClick);

    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return () => dialog?.removeEventListener('click', onDialogClick);
    }

    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    let raf: number | null = null;
    const tick = () => {
      px += (tx - px) * 0.18;
      py += (ty - py) * 0.18;
      peek.style.transform = 'translate3d(' + (px - 150) + 'px,' + (py - 112) + 'px,0)';
      if (peek.classList.contains('is-visible')) raf = requestAnimationFrame(tick);
      else raf = null;
    };
    const onMouseOver = (e: MouseEvent) => {
      const row = (e.target as HTMLElement).closest<HTMLElement>('.proj-row');
      if (!row || row.hidden) return;
      const slug = row.dataset.slug;
      const project = projects.find((p) => p.id === slug);
      if (!project) return;
      const src = project.img + '.jpg';
      if (peekImg.getAttribute('src') !== src) {
        peekImg.src = src;
        peekImg.alt = '';
      }
      peek.classList.add('is-visible');
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onMouseMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const onMouseLeave = () => peek.classList.remove('is-visible');

    list.addEventListener('mouseover', onMouseOver);
    list.addEventListener('mousemove', onMouseMove);
    list.addEventListener('mouseleave', onMouseLeave);
    return () => {
      list.removeEventListener('mouseover', onMouseOver);
      list.removeEventListener('mousemove', onMouseMove);
      list.removeEventListener('mouseleave', onMouseLeave);
      dialog?.removeEventListener('click', onDialogClick);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [projects]);

  return (
    <>
      <div className="proj-toolbar">
        <div className="filters" role="group" aria-label="Filter projects by category">
          {[
            ['all', 'All'],
            ['gis-agri', 'GIS & Agriculture'],
            ['software', 'Software Development'],
            ['cadastre', 'Geodetic & Cadastral'],
            ['forestry', 'Forestry'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={filter === key ? 'is-active' : undefined}
              data-filter={key}
              aria-pressed={filter === key}
              onClick={() => applyFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mono proj-count">
          <span id="proj-count">{visibleProjects.length}</span> projects
        </p>
      </div>
      <p className="visually-hidden" id="proj-status" aria-live="polite">
        {status}
      </p>

      <noscript>
        <p className="proj-empty">
          The interactive project register requires JavaScript. Browse our <a href="/services">services</a> or{' '}
          <a href="/contact">contact us</a> for the full project list.
        </p>
      </noscript>

      <div className="proj-list" id="proj-list" ref={listRef}>
        {visibleProjects.map((p) => (
          <button
            key={p.id}
            type="button"
            className="proj-row"
            data-cat={p.cat}
            data-slug={p.id}
            aria-label={'Open project details: ' + p.title}
            onClick={() => openProject(p)}
          >
            <span className="mono proj-row__index">{String(projects.indexOf(p) + 1).padStart(2, '0')}</span>
            <span className="proj-row__title">{p.title}</span>
            <span className="proj-row__cat">{CATS[p.cat]}</span>
            <span className="mono proj-row__year">{p.year}</span>
            <span className="proj-row__arrow" aria-hidden="true">
              →
            </span>
          </button>
        ))}
      </div>
      <div className="proj-peek" id="proj-peek" aria-hidden="true" ref={peekRef}>
        <img src="" alt="" ref={peekImgRef} />
      </div>

      <dialog className="proj-dialog" id="project-dialog" aria-labelledby="dialog-title" ref={dialogRef}>
        <img className="proj-dialog__image" id="dialog-image" src="" alt="" ref={dImageRef} />
        <div className="proj-dialog__body">
          <p className="mono proj-dialog__meta" id="dialog-meta" ref={dMetaRef}></p>
          <h2 id="dialog-title" ref={dTitleRef}>
            Project
          </h2>
          <p className="muted" id="dialog-desc" ref={dDescRef}></p>
          <p>
            <a className="link-arrow" href="/contact">
              Ask about this project
            </a>
          </p>
        </div>
        <button
          className="proj-dialog__close"
          type="button"
          data-dialog-close
          autoFocus
          aria-label="Close project details"
          onClick={() => dialogRef.current?.close()}
        >
          ✕
        </button>
      </dialog>
    </>
  );
}
