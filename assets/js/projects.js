(() => {
  'use strict';

  const CATS = {
    'gis-agri': 'GIS & Agriculture',
    software: 'Software Development',
    cadastre: 'Geodetic & Cadastral Surveying',
    forestry: 'Forestry',
  };

  const PROJECTS = [
    {
      id: 'soil-map',
      title: 'Soil map of the Municipality of Rahovec',
      cat: 'gis-agri',
      year: 2018,
      org: 'Municipality of Rahovec — consortium',
      desc: 'Geo&Land is part of a consortium for the creation of the soil map of the Municipality of Rahovec — the initial phase of the effort.',
      img: 'assets/img/projects/soil-map-458',
    },
    {
      id: 'kfis-gis',
      title: 'Integration of the GIS module in KFIS',
      cat: 'gis-agri',
      year: 2017,
      org: 'FAO',
      desc: 'Based on a contract with the FAO, Geo&Land developed the integration of the GIS module and other functionalities in the current version of the Kosovo Forest Information System.',
      img: 'assets/img/projects/kfis-900',
    },
    {
      id: 'vineyard-register',
      title: 'Further development of the vineyard register and interoperability with the national farm register',
      cat: 'gis-agri',
      year: 2014,
      org: 'Ministry of Agriculture',
      desc: 'Creation of the vineyards cadastre to build a general database on vineyard property for the whole territory of Kosovo, with interoperability to the national farm register.',
      img: 'assets/img/projects/vineyard-register-439',
    },
    {
      id: 'vineyard-national',
      title: 'Development of vineyard cadastre and national register based on GIS',
      cat: 'gis-agri',
      year: 2014,
      desc: 'Development of a general database on vineyard property for the whole territory of Kosovo, based on GIS.',
      img: 'assets/img/projects/vineyard-kaveko-780',
    },
    {
      id: 'vineyard-rahovec',
      title: 'Creation of vineyard cadastre for the Rahovec area based on GIS',
      cat: 'gis-agri',
      year: 2014,
      org: 'Municipality of Rahovec',
      desc: 'A database of vineyard properties in the Municipality of Rahovec, developed as a unique system based on Web GIS.',
      img: 'assets/img/projects/vineyard-rahovec-493',
    },
    {
      id: 'kfis-ddi',
      title: 'Design, development, installation, delivery and after-sales service of KFIS',
      cat: 'software',
      year: 2014,
      org: 'FAO',
      desc: 'With the Food and Agriculture Organization of the United Nations, Geo&Land built a system application to enhance forestry strategy and policies in Kosovo — a permanent IT system for forestry.',
      img: 'assets/img/projects/kfis-900',
    },
    {
      id: 'spfn',
      title: 'National Farmer and Payment System (SPFN)',
      cat: 'software',
      year: 2014,
      desc: 'Web-based application for farmer register and grant management of Kosovo. Built on open standards HTML5, jQuery, jQuery UI and jqGrid; responsive, high-performance and Ajax-based.',
      img: 'assets/img/projects/spfn-780',
    },
    {
      id: 'svv',
      title: 'Kosovo Vineyard Cadastre & Wine Quality Control System (SVV v1.3)',
      cat: 'software',
      year: 2014,
      org: 'Ministry of Agriculture',
      desc: 'Application built as part of the project “Maintenance, expansion and enhancement of vineyards and wine industry in the vineyard region in Kosovo” with the Ministry of Agriculture.',
      img: 'assets/img/projects/vineyard-kaveko-780',
    },
    {
      id: 'gis-local',
      title: 'Development of GIS system for local government',
      cat: 'software',
      year: 2014,
      desc: '',
      img: 'assets/img/projects/gis-peja-780',
    },
    {
      id: 'municipal-gis',
      title: 'Municipal GIS System, Peja',
      cat: 'software',
      year: 2014,
      org: 'Municipality of Peja',
      desc: 'One of the first municipal GIS systems in Kosovo — a database of geospatial and textual data, presented together in one system.',
      img: 'assets/img/projects/gis-peja-780',
    },
    {
      id: 'addressing',
      title: 'Addressing System',
      cat: 'software',
      year: 2011,
      desc: '',
      img: 'assets/img/projects/addressing-800',
    },
    {
      id: 'drenas',
      title: 'Expropriation application for the economic zone in Drenas',
      cat: 'cadastre',
      year: 2017,
      desc: 'The main goal was to develop an application for property expropriation in the economic zone in Drenas. Existing cadastral information was collected, analysed and mapped, together with ownership data.',
      img: 'assets/img/projects/drenas-1251',
    },
    {
      id: 'prishtina-planning',
      title: 'Land surveying for urban planning, Prishtina',
      cat: 'cadastre',
      year: 2017,
      desc: 'Land surveying in the urban zones of Prishtina, including data collection for infrastructure and digital mapping.',
      img: 'assets/img/projects/prishtina-planning-1263',
    },
    {
      id: 'surveying-services',
      title: 'Surveying Services',
      cat: 'cadastre',
      year: 2014,
      desc: '',
      img: 'assets/img/projects/geodetic-banner-914',
    },
    {
      id: 'brezovica',
      title: 'Expropriation for Brezovica Resort',
      cat: 'cadastre',
      year: 2013,
      org: 'Deloitte / USAID',
      desc: 'In July 2013, Geo&Land was contracted by Deloitte/USAID to implement the land expropriation process across 3,000 ha of the Brezovica Resort, using CAD and GIS software for digital maps and statistical analysis.',
      img: 'assets/img/projects/brezovica-674',
    },
    {
      id: 'water-meters',
      title: 'Creation of digital maps for GIS advancement',
      cat: 'cadastre',
      year: 2014,
      desc: 'Measurement of all water meters through GPS technology and creation of a digital map for GIS advancement.',
      img: 'assets/img/projects/digital-map-440',
    },
    {
      id: 'reconstruction',
      title: 'Cadastral reconstruction in 5 cadastral zones',
      cat: 'cadastre',
      year: 2014,
      desc: 'Updating the cadastral database with actual information regarding inventory and property.',
      img: 'assets/img/projects/cadastre-reconstruction-508',
    },
    {
      id: 'consultancy',
      title: 'Consultancy services in topographic surveying and agriculture',
      cat: 'cadastre',
      year: 2014,
      desc: '',
      img: 'assets/img/projects/geodetic-banner-914',
    },
    {
      id: 'resurveying',
      title: 'Resurveying of immovable property for tax purposes — Mitrovica region',
      cat: 'cadastre',
      year: 2014,
      desc: 'Surveying of all immovable properties in the region of Mitrovica, and creation of an application for data collection and data management.',
      img: 'assets/img/projects/cadastre-reconstruction-508',
    },
    {
      id: 'ferronickel',
      title: 'Topographic surveying — New CO Ferronickel L.L.C',
      cat: 'cadastre',
      year: 2014,
      desc: '',
      img: 'assets/img/projects/geodetic-banner-914',
    },
    {
      id: 'ils-cat',
      title: 'Geodetic measurements and map production for ILS and CAT 2',
      cat: 'cadastre',
      year: 2014,
      desc: '',
      img: 'assets/img/projects/prishtina-planning-1263',
    },
    {
      id: 'peja-digital',
      title: 'Digitalization of cadastral data for the Peja municipality',
      cat: 'cadastre',
      year: 2014,
      org: 'Municipality of Peja',
      desc: 'Digitalization of cadastral data for the Peja municipality as part of its municipal GIS initiative.',
      img: 'assets/img/projects/gis-peja-780',
    },
    {
      id: 'gps-training',
      title: 'GPS installation, monitoring and training of municipality staff',
      cat: 'cadastre',
      year: 2014,
      desc: '',
      img: 'assets/img/projects/digital-map-440',
    },
    {
      id: 'geophysical',
      title: 'Establishment of geophysical grid by means of GPS',
      cat: 'cadastre',
      year: 2014,
      desc: '',
      img: 'assets/img/projects/prishtina-planning-1263',
    },
    {
      id: 'dumps',
      title: 'Surveying and 3D mapping of the dumps in Fushe Kosove, Kline, Podujeve, Gjakove, Ferizaj, Lipjan and Kaçanik',
      cat: 'cadastre',
      year: 2014,
      desc: 'Surveying and 3D mapping of the dumps across seven municipalities in Kosovo.',
      img: 'assets/img/gallery/field-008-640',
    },
    {
      id: 'buildings',
      title: 'Creation of building cadastre in 5 major cities',
      cat: 'cadastre',
      year: 2014,
      desc: 'Creation of the building cadastre in five major cities of Kosovo: Prishtina, Prizren, Mitrovica, Peja and Gjilan.',
      img: 'assets/img/projects/cadastre-reconstruction-508',
    },
    {
      id: 'forest-policy',
      title: 'Support to the Implementation of the Forest Policy and Strategy in Kosovo',
      cat: 'forestry',
      year: 2014,
      org: 'FAO — with Consult Engineering',
      desc: 'In consortium with Consult Engineering, Geo&Land worked on the “Support to Implementation of the Forest Policy and Strategy in Kosovo” with the FAO.',
      img: 'assets/img/projects/kfis-900',
    },
    {
      id: 'forest-plans',
      title: 'Development of management plans for forestry',
      cat: 'forestry',
      year: 2014,
      org: 'Kosovo Forest Agency',
      desc: 'Research on existing forest plots and digitalization of the data, for the Kosovo Forest Agency.',
      img: 'assets/img/projects/kfis-900',
    },
  ];

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
  const applyFilter = (filter) => {
    let visible = 0;
    rows.forEach((row) => {
      const show = filter === 'all' || row.dataset.cat === filter;
      row.hidden = !show;
      if (show) visible += 1;
    });
    countEl.textContent = String(visible);
    status.textContent = visible + ' projects shown';
    filterButtons.forEach((b) => {
      const active = b.dataset.filter === filter;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });
  };
  filterButtons.forEach((b) => {
    b.addEventListener('click', () => applyFilter(b.dataset.filter));
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

  applyFilter('all');
})();
