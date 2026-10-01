# GeoLand Kosova Website Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace the outdated Joomla site at geoland-kosova.com with a premium, static, bilingual-ready presentation site (6 pages) that uses only the company's real information and an original measurement-inspired design system.

**Architecture:** Zero-dependency static site — semantic HTML5 per page, three layered CSS files (base → components → pages) driven by design tokens, vanilla JS modules for interaction (nav, scroll reveals, service accordion, project filter + dialog, form, lightbox). Real GeoLand imagery is downloaded from the current site, optimized to WebP with JPEG fallback via Python/PIL. No build step, no framework, no external JS libraries.

**Tech Stack:** HTML5, CSS (custom properties, grid, clamp), vanilla ES2020 JS, Python 3.13 (asset pipeline only), Playwright (verification only). Fonts via Google Fonts: Schibsted Grotesk, Instrument Sans, IBM Plex Mono.

---

## 1. DISCOVERY — What the existing site actually contains

Investigated pages (2026-10-01): `/`, `/about-us/company-profile`, `/company/management`, `/company/key-staff`, `/company/certificates`, `/company/client`, `/company/job-application`, all 6 `/services/*`, all 4 `/projects/*` (+ pagination), `/software` (+ pagination), `/airbus-group1`, `/contact-us1`.

**Company facts (verbatim-source, can be quoted):**
- "Geo&Land is one of the largest companies in south east Europe specialized in Geoinformation disciplines, such as GIS, land administration, cadastre, agriculture and software development."
- "Recently, Geo&Land has implemented many national projects in Kosovo, few of them carried out for the first time in our country."
- Current strategy: "realize large scale projects in the field of Geoinformation, including software development and Web-GIS systems in different commercial and open source platforms." Software department rising "taking into account trade development and INSPIRE directives." Ambition: "remain a leader in the field of GIS and land administration in Kosovo." Activities extended to Albania and Macedonia.
- Three words: **innovative, dedicated, reliable**. Core values: "integrity, collaboration, commitment, and professionalism."
- Certifications (real, from site): ISO 9001:2008 by Bureau Veritas for GIS, Geodetic, Cadastre and Project Management; Licensed by Kosovo Cadastral Agency for cadastral and property rights registration; Licensed by MAFRD for compilation of long-term forest management plans.
- Airbus partnership since 2013 — "the only partner of AIRBUS for territories: Republic of Kosovo, Croatia, Albania and North Macedonia." Products: optical/radar satellite imagery (Pléiades Neo, Pléiades, Vision-1, SPOT 6/7, Radar Constellation, DMC, KazEOSat-1), Agriculture Satellite Monitoring (Verde, AgNeo, Farmstar, Starling, Grassland Production Index), OneAtlas.
- Teams (descriptions only, no names published): Management, Geodesy, Software Development, Agriculture.
- Contact: Bardhyl Çaushi Ob.C15/11 No.07, 10000 Prishtina; Qamil Hoxha No.5, 10000 Prishtina; +383 38 739 193; +383 44 224 853; info@geoland-kosova.com; Facebook `/GeoLand`, Twitter `@geoandland`, LinkedIn `geo&land`.

**Do NOT invent:** founding year, employee count, revenue, awards, named testimonials, client logos, equipment brands, "years of experience." None exist on the source site. Named organizations may appear **only** where a real project cites them (FAO, USAID, Deloitte, Ministry of Agriculture, Kosovo Forest Agency, Municipality of Peja/Rahovec, MoESP, New CO Ferronickel, Consult Engineering).

**Brand identity observed:** hexagonal badge logo (globe + meridians), wordmark "GEO&" in dark teal/ink, "LAND" in orange; palette sampled from logo: ink `#001820`, deep green `#004820`, teal `#004848–#0A5C5A`, orange `#F87800`, pale sage `#C8D8D0`. Current site is a dated Joomla template (sliders, placeholders, broken news images) — the information is good, the presentation is not.

**Design research findings (surveying/geospatial peers):** leading firms communicate (a) what they do within 5 seconds, (b) project evidence over adjectives, (c) credentials/licenses early, (d) service areas, (e) an obvious contact path. High-end sites use editorial typography, restrained motion, real fieldwork imagery, and technical detail (equipment, resolution, deliverables) as credibility. We will adopt those principles — never copy layout, branding, or copy.

## 2. CONTENT INVENTORY — real information to transfer

### 2.1 Services (6, exact source scope)
1. **GIS & Software Development** — Data acquisition/digitisation; data management & maintenance; data conversion/integration; validation/processing; analyses/evaluations; GIS project management; system integration (EAI); data & services hosting/mash-up; geo component development; geo infrastructure design; GIS operation (outsourcing). Products: desktop GIS, mobile GIS/LBS, geo service server, geodata server, DBMS storage, GDI components, Web-GIS solutions (agriculture, forestry, local government).
2. **Surveying** — Geodetic control networks (design, reconnaissance, establishment, surveying, processing & adjustment, analysis); urban planning; engineering (tunnel, railway, mining, road, bridge, hydropower plant construction); monitoring.
3. **Mapping & Remote Sensing** — Digital 2D/3D mapping; mobile mapping; forestry/agriculture/mining & geology mapping; satellite imagery interpretation & classification; land cover & land use maps; forest type delineation; monitoring; watershed management.
4. **Agriculture & Forestry** — Agriculture land registration; rural development; land consolidation; agriculture & forestry inventory; GIS-based registers; project management.
5. **Orthophotos** — Aerial imagery and orthophotos for Kosovo, Albania and Macedonia for urban-spatial planning; GIS municipal portal for urban, development and legalization plans.
6. **Aerial Data Collection — UAV Surveying** (2019) — Certified UAV operators; capture, analysis, archival, web map distribution; use cases: mapping, agriculture & forestry, mining & volume calculation, vegetation/crop diagnosis, oil & gas, infrastructure & utilities, emergency & disaster; "UAV LiDAR survey at 1cm/pixel resolution". Deliverables shown: surveying, orthophoto, point cloud, DEM.

### 2.2 Software products (5)
1. **Kosovo Forest Information System (KFIS)** — with FAO; permanent IT system for forestry strategy and policy.
2. **Kosovo Vineyard Cadastre & Wine Quality Control System (SVV v1.3)** — with Ministry of Agriculture; vineyards and wine registry.
3. **National Farmer and Payment System (SPFN)** — web app for farmer register and grant management; HTML5, jQuery, jQuery UI, jqGrid; responsive UI; AJAX/RAP.
4. **Municipal GIS System** — Municipality of Peja; spatial + textual data in one system.
5. **Addressing System** (2011).

### 2.3 Projects (real, deduplicated across the 4 categories)
**GIS & Agriculture:** Creation of soil map, Rahovec (2018, consortium, initial phase); Integration of GIS Module in KFIS (2017, FAO); Further development of vineyard register & interoperability with national farm register (2014); National Farmer & Payment System SPFN (2014); Development of vineyard cadastre & national register based on GIS (2014); Creation of vineyard cadastre for Rahovec area based on GIS (2014).
**Software Development:** Design/development/installation/delivery/after-sales of KFIS (FAO); Further development of vineyard register (dup); SPFN (dup); Vineyard cadastre national register (dup); Development of GIS system for local government (2014); Vineyard cadastre Rahovec (dup).
**Geodetic & Cadastral Surveying:** Expropriation application for economic zone in Drenas (2017); Land surveying for urban planning, Prishtina (2017); Surveying Services (2014); Expropriation for Brezovica Resort, 3000 ha, contracted by Deloitte/USAID (2013); Creation of digital maps for GIS advancement — GPS-measured water meters (2014); Cadastral reconstruction in 5 cadastral zones (2014); Consultancy in topographic surveying & agriculture (2014); Resurveying of immovable property for tax purposes, Mitrovica region (2014); Topographic surveying New CO Ferronickel L.L.C (2014); Geodetic measurements & maps for ILS and CAT 2 (2014); Digitalization of cadastral data for Peja municipality (2014); GPS installation, monitoring & municipality staff training (2014); Establishment of geophysical grid by means of GPS (2014); Surveying & 3D mapping of dumps in Fushe Kosove, Kline, Podujeve, Gjakove, Ferizaj, Lipjan, Kaçanik (2014); Creation of building cadastre in 5 major cities: Prishtine, Prizren, Mitrovice, Peje, Gjilan (2014).
**Forestry:** Integration of GIS module in KFIS (2017, FAO); Support to Implementation of Forest Policy & Strategy in Kosovo (2014, FAO, with Consult Engineering); Development of management plans for forestry (2014, Kosovo Forest Agency).

### 2.4 Milestones timeline (real news dates)
2011 farmer register (EU project), forestry management plans (Kosovo Forest Agency), Ministry of Agriculture two-year contract; 2012 USAID digital maps contract, farmer register system completed; 2013 Brezovica expropriation with Deloitte/USAID, visit to Austria paying agency; Oct 2014 INTERGEO conference, KAVEKO workshop; Nov 2014 international conference on Geoinformation, Space & Defence (organized by Geo&Land); 2015 KFIS training; 2017 KFIS-GIS contract (FAO), MoESP database project, Drenas expropriation app; 2018 Rahovec soil map; 2019 UAV surveying launched, Airbus partnership page.

### 2.5 Imagery available (download from source; see Task 0)
Service images, project images (`/images/projets/*`), UAV deliverables (`/images/services/uav/*`: surveying, orthophoto, point cloud, DEM), team photos (`/images/staff/*/img1.jpg`), certificate scans (`/images/certificates/1-3.jpg`, `CERTI.png`), Airbus imagery (`/images/airbusGroup/*`), gallery photos (`/images/gallery/001-028`) for a field-operations strip. Logo banner (`/templates/sj_financial/images/logo.png`).

## 3. INFORMATION ARCHITECTURE

| Page | Purpose | Sections (in order) |
|---|---|---|
| `index.html` | Positioning + fast orientation | Nav · Hero (name, claim, CTA) · Credentials strip · Services index (6) · Featured projects (4) · Company teaser · Technology strip (UAV + Airbus) · CTA band · Footer |
| `about.html` | Credibility + people | Page hero · Company profile (source text, edited) · Mission & values · Teams (4) · Licenses & certificates · Clients (evidence-based) · Milestones timeline · Careers note (job application) |
| `services.html` | What GeoLand does, precisely | Page hero · Service accordion (6, numbered) with source scope lists · Capability detail (deliverables) · CTA |
| `projects.html` | Real evidence | Page hero · Filter (All / GIS & Agriculture / Software / Geodetic & Cadastral / Forestry) · Editorial project list · `<dialog>` project detail · CTA |
| `technology.html` | UAV, satellite, software | Page hero · UAV capability (specs + deliverables gallery + lightbox) · Orthophotos · Airbus partnership (products table, monitoring services) · Software products (5) · CTA |
| `contact.html` | Convert | Page hero · Contact cards (2 offices, phone, mobile, email) · Form (mailto-compose, validated) · Map embed (lazy) · Social links |

Navigation: Home, About, Services, Projects, Technology, Contact + persistent "Contact" CTA. Footer: sitemap, contact facts, certifications, social, copyright.

## 4. DESIGN SYSTEM

### 4.1 Tokens (`assets/css/base.css` `:root`) — exact

```css
:root {
  /* Brand — sampled from logo */
  --ink: #06120e;
  --ink-2: #0b1d18;
  --ink-3: #123229;
  --green: #004820;
  --green-2: #0a5c5a;
  --orange: #f87800;
  --orange-2: #d96700;
  --paper: #f4f5f0;
  --paper-2: #e8eae2;
  --paper-3: #dde0d5;
  --sage: #c8d8d0;
  --muted: #56605a;
  --muted-dark: #9aa8a0;
  --line: rgba(6, 18, 14, .16);
  --line-strong: rgba(6, 18, 14, .32);
  --line-dark: rgba(244, 245, 240, .18);

  /* Type */
  --font-display: "Schibsted Grotesk", "Segoe UI", sans-serif;
  --font-body: "Instrument Sans", "Segoe UI", sans-serif;
  --font-mono: "IBM Plex Mono", Consolas, monospace;
  --step--1: clamp(.8125rem, .78rem + .15vw, .875rem);
  --step-0: clamp(1rem, .96rem + .2vw, 1.125rem);
  --step-1: clamp(1.25rem, 1.1rem + .6vw, 1.5rem);
  --step-2: clamp(1.6rem, 1.3rem + 1.2vw, 2.25rem);
  --step-3: clamp(2.1rem, 1.6rem + 2.2vw, 3.5rem);
  --step-4: clamp(2.6rem, 1.6rem + 4vw, 5.25rem);

  /* Space */
  --s-1: .25rem; --s-2: .5rem; --s-3: .75rem; --s-4: 1rem; --s-5: 1.5rem;
  --s-6: 2rem; --s-7: 3rem; --s-8: 4rem; --s-9: 6rem; --s-10: 8rem;
  --section: clamp(4.5rem, 8vw, 8.5rem);

  /* Layout */
  --container: 1280px;
  --gutter: clamp(1.25rem, 4vw, 3rem);
  --radius: 2px;
  --hairline: 1px solid var(--line);

  /* Motion */
  --ease: cubic-bezier(.22, .61, .36, 1);
  --ease-out: cubic-bezier(.16, 1, .3, 1);
  --dur-1: .18s; --dur-2: .35s; --dur-3: .6s; --dur-4: .9s;
}
```

### 4.2 Typography rules
- Display: Schibsted Grotesk 600–700, tracking `-0.02em`, line-height `1.02` (hero `0.98`).
- Body: Instrument Sans 400/500, `var(--step-0)`, line-height `1.65`, max text width `68ch`.
- Mono labels: IBM Plex Mono 400/500, `0.72–0.8rem`, uppercase, tracking `0.08em`, used for section indices, coordinates, metadata, buttons.
- Rules: headings sentence case (never Title Case Everything); real em dashes; no italics for display.

### 4.3 Layout & surfaces
- 12-col grid, container 1280px, gutter clamp. Sections separated by `--section` padding; alternate `paper`, `paper-2`, and `ink` (dark) bands. Hairline rules as structural devices.
- Cards: square corners (2px), 1px borders, no shadows (except dialog). Hover = border darkens + translateY(-2px) + orange index.
- Buttons: `.btn` (solid ink), `.btn--orange`, `.btn--ghost` (hairline border), mono uppercase label 12px, height 48px desktop / 44px mobile, radius 2px. Text link `.link-arrow` with `→`.
- Images: real GeoLand photos only; `aspect-ratio` boxes, `object-fit: cover`, radius 2px; subtle `filter: saturate(.92)` on cards, full saturation on hover.
- Background texture: SVG survey grid (8px minor) at `opacity:.5` on paper-2 sections only; topographic contour SVG only in hero; coordinate readouts (`N 42.6629° E 21.1655°`) in mono at hero edges. Never both grid and contours in the same viewport area.

### 4.4 Color usage law
Paper = 70% of surface area, ink = 20%, orange = <5% (CTAs, active indices, markers, hovers, one accent per screen). Green/teal only for logos, links hover, and the dark band tint. No gradients anywhere. No glassmorphism, no glows, no shadows on static elements.

## 5. COMPONENT ARCHITECTURE

| Component | File | Markup contract |
|---|---|---|
| Nav | `components.css` + `main.js` | `header.site-nav` > logo SVG + `nav` (6 links) + `.btn--orange` CTA + hamburger `button.nav-toggle[aria-expanded]`; mobile drawer `div.nav-drawer` |
| Footer | components | 4 columns: brand + statement, pages, services, contact; certifications line; social links; `© <span data-year>` |
| Section header | components | `.section-head` = mono index `[01]` + rule + label + `h2` + optional lead |
| Button / arrow link | components | `.btn`, `.link-arrow` |
| Credential strip | components | `.creds` — 4 text items (ISO, KCA license, MAFRD license, Airbus partner) with mono labels |
| Service row | components + pages | `.svc` button rows with `aria-expanded`, panel with scope list + image (accordion, one open) |
| Project row | components + `projects.js` | `.proj-row` grid: index, title, category, year; hover preview `figure.proj-peek` (desktop only); click opens `dialog#project-dialog` |
| Project dialog | components + js | native `<dialog>`: image, meta, description, close button, `::backdrop` |
| Team card | components | photo + h3 + role description |
| Cert card | components | scan thumbnail + title + issuer |
| Timeline | components | `.timeline` rows: year (mono) + event + source date |
| Stat/fact | components | `.fact` — value + label; only source-derived values (see 8.2) |
| Dialog/Lightbox | components + js | `dialog.lightbox` for UAV/gallery imagery, prev/next buttons, keyboard arrows + Esc |
| Forms | components | `label` + input + `error[aria-live]`; `.field` |
| CTA band | components | dark band: statement + button + mono coordinates |

## 6. ANIMATION SYSTEM (restrained, transform/opacity only)
1. **Scroll reveals** — `[data-reveal]`: opacity 0 + `translateY(22px)` → visible, 600ms `--ease-out`, stagger via `data-reveal-delay`. `IntersectionObserver`, threshold .15, once.
2. **Hero** — coordinate labels fade in at 200ms intervals; contour SVG stroke draw (`stroke-dasharray`/`dashoffset`, 1.6s); hero image `scale(1.04)` → `1` over 1.2s; kicker/headline/CTA staggered 80ms.
3. **Nav** — transparent-to-solid on scroll (class toggle, 200ms); mobile drawer slide `translateX(100%)` → `0` 350ms; hamburger to X.
4. **Service accordion** — panel height/opacity via grid-template-rows 0fr→1fr trick + fade (350ms); number turns orange when open.
5. **Project rows** — hover: title shifts x+6px, orange index, floating preview follows cursor with lerp (rAF, desktop + fine pointer only).
6. **Dialog** — `@starting-style` opacity/translateY, 300ms; backdrop fade.
7. **Lightbox** — crossfade images 250ms.
8. **Links/buttons** — arrow translate 4px on hover.
All above wrapped in `@media (prefers-reduced-motion: reduce)` → transitions none, reveals instantly visible, no transforms. No parallax, no bounce/spring, no animation loops except the hero contour draw.

## 7. RESPONSIVE STRATEGY
Breakpoints: `max-width: 1023px` (tablet), `max-width: 719px` (mobile), plus `hover: none` guards for preview effects.
- Nav → drawer below 1024px; drawer full-height, focus-trapped, Esc + backdrop close, `aria-modal`.
- Hero → single column, coordinates reduced to one mono line, contour rotated/scaled.
- Service accordion → single column; image below scope list.
- Projects → preview float disabled (touch), rows become 2-line cards: title + meta; dialog full-screen-ish `width: min(680px, 92vw)`.
- Technology product table → horizontal scroll wrapper with `tabindex="0"` + `aria-label`.
- Footers → 2-col (tablet) → 1-col (mobile); contact facts stack.
- Fluid `clamp()` everywhere; test 360, 390, 768, 1024, 1280, 1440 widths; no horizontal overflow (`overflow-x: clip` as safety).

## 8. SEO
1. Per-page `<title>` exactly: `Geo&Land Kosova — <Page>` (home: `Geo&Land Kosova — Geoinformation, Surveying & GIS`); unique meta description from real content per page; canonical `https://www.geoland-kosova.com/<page>`.
2. Open Graph + Twitter card per page; `og:image` = hero image per page.
3. JSON-LD: `Organization` on home (`name: Geo&Land`, address Prishtina, phone +383 38 739 193, email, sameAs Facebook/Twitter/LinkedIn), `LocalBusiness` on contact, `BreadcrumbList` on inner pages.
4. Semantic landmarks: `header/nav/main/section[h2]/footer`, one `h1` per page, logical `h2→h3`, descriptive alt text for every image (use project names/context; decorative SVG `aria-hidden`).
5. `sitemap.xml` + `robots.txt` + `404.html` optional: skip 404 (no server config yet) — document as follow-up.
6. No keyword stuffing; service names used naturally as headings.

## 9. PERFORMANCE
- Images: download originals → resize (max 1600px wide full-bleed, 900px cards, 640px thumbs) → WebP q78 + JPEG fallback via `scripts/optimize_images.py` (PIL); `loading="lazy"` + `decoding="async"` everywhere except hero (`fetchpriority="high"`); explicit `width`/`height` attrs to reserve space.
- Fonts: Google Fonts with `preconnect` + `display=swap`; only 3 families, limited weights (600/700, 400/500/600, 400/500).
- JS: ~15KB total vanilla, `defer`; no libraries; observers only where needed; `content-visibility: auto` on below-fold sections.
- CSS: 3 files, no preprocessor; critical styles in base (inlined? no — keep files, it's a small site).
- Target: LCP < 2.0s on cable, no CLS (fixed aspect boxes), 90+ Lighthouse performance/mobile.

### 8.2 Allowed facts (source-derived only)
`6` service disciplines · `20+` documented projects · `5` software systems · `4` countries covered by the Airbus partnership · ISO 9001:2008 (Bureau Veritas) · 2 licenses (KCA, MAFRD) · partnership since 2013. No other numbers.

## 10. IMPLEMENTATION ORDER

Foundation first (tokens → components → JS), then pages in value order (home → services → projects → about → technology → contact), then SEO files, then verification and the creative-director pass. Every task ends with a commit. Every page task: skeleton write (≤1k tokens) then one edit per section (≤1k tokens each), then a full-file read and consistency fix.

**Execution note:** Working dir `C:\Users\Admin\geoland-kosova`. Serve locally with `python -m http.server 4173` (run from project root, background). Visual check with the Playwright script from Task 12. Commit style: `feat: ...`, `chore: ...`, `fix: ...`.

---

### Task 0: Project scaffold + asset pipeline

**Files:**
- Create: `scripts/fetch_images.ps1`, `scripts/optimize_images.py`, `assets/img/**`

- [x] **Step 1: Write the fetch script** `scripts/fetch_images.ps1` — downloads the curated real-asset list to `research/originals/` with a `$base = "https://www.geoland-kosova.com"` and an array of relative paths: services (`/images/services/gisimg.png`, `imgforestry.png`, `mappingandremote.jpg`, `agricultureimg.png`, `ortos.jpg`), projects (`/images/projets/image.png`, `kfis1.png`, `kaveko.jpg`, `efr.jpg`, `devvineyard.jpg`, `rahovec.jpg`, `31.png`, `21.png`, `client-banner.jpg`, `brezovica.jpg`, `digitalmap.jpg`, `reconstruction.jpg`, `gispeja.jpg`, `imgaddresingsystem.png`), UAV (`/images/services/uav/uav1.jpg`, `IMG-20200718-WA0016.jpg`, `IMG-20200718-WA0043.jpg`, `ortho1.PNG`..`ortho3.PNG`, `orto4.PNG`, `orto5.PNG`, `pointcloud2.PNG`, `dem1.PNG`..`dem3.PNG`), team (`/images/staff/menagment/img1.jpg`, `/images/staff/geodesy/img1.jpg`, `/images/staff/sofwtaredeveloper/img1.jpg`, `/images/staff/agriculture/img1.jpg`), certs (`/images/certificates/1.jpg`, `2.jpg`, `3.jpg`, `CERTI.png` → `/images/companyprofile/CERTI.png`), Airbus (`/images/airbusGroup/AIRBUS.jpg`, `intro.png`, `r54519_9_constellation-imagery-062019.jpg`), gallery subset (`/images/gallery/001.jpg`, `003.jpg`, `005.jpg`, `008.jpg`, `010.jpg`, `012.jpg`, `014.jpg`, `017.jpg`, `020.jpg`, `026.jpeg`, `027.jpg`, `028.jpg`), about (`/images/companyprofile/profilecompany.jpg`). Use a loop with `Invoke-WebRequest`, skip-if-exists, `-OutFile` to `research/originals/<slug>`. Slug = path minus leading slash with `/`→`-`.
- [x] **Step 2: Run it** — `powershell -File scripts/fetch_images.ps1`; Expected: ~50 files in `research/originals/`, none 0 bytes. Fix any 404 names by checking casing (note `orto4.PNG` vs `ortho*`, `sofwtaredeveloper` typo is real).
- [x] **Step 3: Write the optimizer** `scripts/optimize_images.py` — PIL: for each original, produce width targets `[1600, 900, 640]` (only ≤ original width), save WebP q78 + JPEG q80 into `assets/img/<group>/<name>-<w>.webp|.jpg`; group mapping from filename prefix table in the script; also emit `research/manifest.txt` lines `group/name|w|webp-size`. Skip files already present.
- [x] **Step 4: Run optimizer + inspect** — `python scripts/optimize_images.py && Get-ChildItem assets/img -Recurse | Measure-Object -Property Length -Sum`; Expected: < 15MB total, no errors. Read 6 random outputs with the Read tool to confirm they are real photos (not placeholders).
- [x] **Step 5: Commit** — `git add -A; git commit -m "chore: scaffold project and build image pipeline with real GeoLand assets"`

---

### Task 1: `assets/css/base.css` — tokens, reset, typography, utilities

**Files:** Create `assets/css/base.css`

- [x] **Step 1: Skeleton** — write the full `:root` token block from §4.1 verbatim, then empty section comment stubs: RESET, BASE TYPE, UTILITIES, GRID/CONTAINER, MOTION PRIMITIVES, REDUCED MOTION.
- [x] **Step 2: Fill RESET + BASE TYPE** — box-sizing border-box; margin 0; `html { scroll-behavior: smooth; -webkit-text-size-adjust }`; `body { background: var(--paper); color: var(--ink); font: 400 var(--step-0)/1.65 var(--font-body) }`; headings → display font, weights, tracking, `text-wrap: balance`; `p { max-width: 68ch }`; `a` color inherit + underline offset; `::selection { background: var(--orange); color: var(--paper) }`; focus-visible → `outline: 2px solid var(--orange); outline-offset: 3px`; `img,svg,video { display:block; max-width:100% }`.
- [x] **Step 3: Fill UTILITIES + GRID** — `.container` (max-width + padding-inline); `.grid-12`; `.mono` (mono label style); `.eyebrow`; `.lead`; `.rule` (hairline hr); `.visually-hidden`; `.skip-link` (visible on focus); `.section` padding; `.section--paper2`, `.section--ink` inversions; `.section-head` pattern per §5; `.link-arrow`.
- [x] **Step 4: Fill MOTION PRIMITIVES + REDUCED MOTION** — `[data-reveal] { opacity: 0; transform: translateY(22px); transition: opacity var(--dur-3) var(--ease-out), transform var(--dur-3) var(--ease-out); transition-delay: var(--reveal-delay, 0ms) }`; `.is-revealed` reset; `@media (prefers-reduced-motion: reduce)` → all `[data-reveal]` visible, transitions `0.01ms`, `scroll-behavior auto`.
- [x] **Step 5: Verify** — `python -m http.server 4173` (background) then `python -c "import urllib.request; print(urllib.request.urlopen('http://localhost:4173/assets/css/base.css').status)"` → `200`. Sanity grep: `findstr /C:"--orange" assets\css\base.css`.
- [x] **Step 6: Commit** — `git add assets/css/base.css; git commit -m "feat: design tokens, typography and base primitives"`

---

### Task 2: `assets/css/components.css` — shared UI

**Files:** Create `assets/css/components.css`

- [x] **Step 1: Skeleton** — stubs: NAV, DRAWER, FOOTER, BUTTONS, CRED STRIP, SECTION HEAD ART, SERVICE ROW, PROJECT ROW + PEEK, DIALOG, LIGHTBOX, TEAM/CERT/TIMELINE/FACT, FORMS, CTA BAND, PAGE HERO, GALLERY STRIP.
- [x] **Step 2: NAV + DRAWER** — `.site-nav` fixed top, transparent initially, `.is-scrolled` → paper bg + bottom hairline + reduced height; grid: logo | links | CTA | toggle. Logo = inline SVG hexagon mark + wordmark "GEO&LAND" (GEO& ink, LAND orange, mono 700). Links: Instrument Sans 500 15px, hover → orange underline offset. `.nav-toggle` 44×44 visible <1024px. `.nav-drawer` fixed inset-block, `translateX(105%)`, `.is-open` → 0; contains links (24px display) + contact facts; `body.nav-open { overflow: hidden }`.
- [x] **Step 3: FOOTER + CTA BAND + PAGE HERO** — footer dark (`--ink`), 4-col grid, hairline top, mono column titles, muted links, certifications line, social inline SVG icons, `[data-year]`. `.cta-band` ink background, display h2 + orange button + mono coordinates right. `.page-hero` paper-2 background, grid lines bg, mono breadcrumb (`Home / Services`), h1 `--step-4`, lead, right-aligned mono index.
- [x] **Step 4: BUTTONS/BUTTON VARIANTS + FORMS** — `.btn` block styles per §4.3; `.field` stack, inputs 48px, 1px border, focus orange; `.form-note`; error style `.field--error input { border-color: var(--orange) }`.
- [x] **Step 5: SERVICE ROW + PROJECT ROW + PEEK + DIALOG** — exact accordion mechanics: `.svc` (button full-width grid: index | name | chevron); `.svc-panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--dur-2) var(--ease) }`; `.svc.is-open .svc-panel { grid-template-rows: 1fr }`; inner `overflow: hidden`; open state index orange. `.proj-row` 4-col grid with hairline top; `.proj-peek` fixed, 320×220, pointer-events none, opacity 0, follows cursor (transform set by JS), hidden by default + `@media (hover:none)` hidden always. `dialog` reset + `.proj-dialog` layout (image 16:9, meta mono, description, close 44×44), `::backdrop rgba(6,18,14,.6)`, `@starting-style` entrance.
- [x] **Step 6: LIGHTBOX + TEAM/CERT/TIMELINE/FACT + GALLERY STRIP + CRED STRIP** — `dialog.lightbox` centered image + caption + prev/next/close buttons (44px), keyboard hint mono. `.team-card`, `.cert-card`, `.timeline` rows, `.fact` value (`--step-3` display) + label mono. `.gallery-strip` horizontal scroll-snap row of square images with `scrollbar-width: none`. `.creds` 4-col hairline grid, mono labels.
- [x] **Step 7: Verify + commit** — grep each class exists: `findstr /C:".svc-panel" /C:".proj-row" /C:".nav-drawer" assets\css\components.css`; HTTP 200 check; commit `feat: shared components — nav, footer, service accordion, project list, dialogs, forms`.

---

### Task 3: `assets/css/pages.css` — page-specific sections

**Files:** Create `assets/css/pages.css`

- [x] **Step 1: Skeleton** — stubs: HERO HOME, HOME SERVICES INDEX, FEATURED PROJECTS, ABOUT TEASER, TECH STRIP, ABOUT PAGE, SERVICES PAGE, PROJECTS PAGE, TECHNOLOGY PAGE, CONTACT PAGE, RESPONSIVE (1023/719/hover-none).
- [x] **Step 2: HOME hero** — full-viewport (min 88svh) grid: left copy (kicker mono, h1 and lead exactly per §11.2), CTA row, mono coordinates bottom. Right: real orthophoto image in 4:5 box with orange corner markers (pure CSS `::before/::after` ticks). Contour SVG absolutely positioned, low opacity, `aria-hidden`. Draw-in keyframes.
- [x] **Step 3: HOME services index + featured projects + about teaser + tech strip** — services index = 6 hairline rows with mono numbers, name, one-line scope, arrow; hover row → ink background text paper? (keep: hover → background paper-2 + orange number). Featured = 2 large project cards (real image + name + category + year) + 2 rows. About teaser = split: text left, team photo right, facts strip below (6 disciplines / 20+ projects / ISO). Tech strip = ink section: UAV mini-gallery 3 images + text + Airbus partner line.
- [x] **Step 4: ABOUT + SERVICES pages** — `.about-profile` two-col (prose + portrait image), `.values` 4 items, `.teams` alternating rows, `.certs` 3 cards, `.timeline` list, `.careers-note`. Services page: intro + accordion + `.svc-detail` extras.
- [x] **Step 5: PROJECTS + TECHNOLOGY + CONTACT pages** — `.filters` (button row, `.is-active` orange underline), `.proj-list`, `.tech-specs` definition rows, `.deliverable-tabs` (reuse accordion classes where possible — DRY), `.products` 5 cards, `.airbus` dark band + scrollable table, `.contact-cards` 2-col, `.map-embed` 16:9 iframe frame, `.form` max 640px.
- [x] **Step 6: Responsive block** — all §7 rules; verify no horizontal scroll at 360px via Playwright screenshot check (Task 12).
- [x] **Step 7: Verify + commit** — `findstr /C:"@media" assets\css\pages.css` shows 1023 + 719 + hover-none; commit `feat: page sections and responsive rules`.

---

### Task 4: `assets/js/main.js` — shared behavior

**Files:** Create `assets/js/main.js`

- [x] **Step 1: Skeleton** — module pattern: `const $ = (s, c=document) => c.querySelector(s); const $$ = ...`; init functions `initNav()`, `initReveal()`, `initYear()`, `initLightbox()`, `initForm()`, each guarded by element existence; call all on DOMContentLoaded.
- [x] **Step 2: Nav + reveal + year** — `initNav`: scroll > 24px → `.is-scrolled`; toggle `.is-open` + `aria-expanded`; Esc + drawer backdrop close; focus first link on open; close on link click. `initReveal`: IntersectionObserver, unobserve after reveal, `data-reveal-delay` → `style.setProperty('--reveal-delay', ...)`. `initYear`: `[data-year]`.
- [x] **Step 3: Lightbox** — `initLightbox`: `[data-lightbox]` triggers read `data-group`; dialog contains img + caption; prev/next with wrap; keyboard ArrowLeft/Right/Esc; restore focus to trigger on close.
- [x] **Step 4: Form** — `initForm` (contact): on submit preventDefault; validate name/email/subject/message (`type="email"` + non-empty); render errors into `.field-error[aria-live="polite"]`; if valid → `location.href = mailto:info@geoland-kosova.com?subject=...&body=...` via `encodeURIComponent`, show `.form-success` note.
- [x] **Step 5: Verify + commit** — `node --check assets/js/main.js` → no output; commit `feat: shared interactions — nav, reveals, lightbox, contact form`.

---

### Task 5: `index.html` — Home

**Files:** Create `index.html` (link base/components/pages.css, main.js defer, JSON-LD Organization, OG tags, hero preload)

- [x] **Step 1: Skeleton** — full `<head>` (title `Geo&Land Kosova — Geoinformation, Surveying & GIS`, meta description, canonical, OG, JSON-LD Organization, font preconnect + CSS link), skip-link, nav, main with section stubs `<!-- HERO --> <section id="hero"> …`, `<!-- CREDS -->`, `<!-- SERVICES -->`, `<!-- FEATURED -->`, `<!-- ABOUT TEASER -->`, `<!-- TECH -->`, `<!-- CTA -->`, footer. Copy nav + footer markup from §11.1/§11.7 (same on every page).
- [x] **Step 2: Hero section** — per §11.2 copy; contour SVG inline (single `<path>`, `stroke-dasharray` anim); coordinates mono; hero image `assets/img/uav/ortho1-900.webp` with JPEG fallback via `<picture>`; corner ticks.
- [x] **Step 3: Creds + services index** — §11.3/§11.4 copy; 6 rows linking to `services.html#gis` etc. (anchor ids `gis`, `surveying`, `mapping`, `agri`, `ortho`, `uav`).
- [x] **Step 4: Featured projects** — §11.5: 2 large + 2 compact rows using real images (`projects/brezovica-900.webp`, `projects/kfis1-900.webp`, `projects/rahovec-900.webp`, `projects/gispeja-900.webp`); all link `projects.html`.
- [x] **Step 5: About teaser + tech strip + CTA** — §11.6 copy; facts strip; UAV mini gallery (3 real images, `data-lightbox`); Airbus line; CTA band.
- [x] **Step 6: Read full file, fix inconsistencies, commit** — every `src` exists (`Test-Path` loop over parsed paths); commit `feat: home page`.

---

### Task 6: `about.html`

**Files:** Create `about.html`

- [x] **Step 1: Skeleton** — head (title `Geo&Land Kosova — About`, desc from profile line, OG, BreadcrumbList JSON-LD), nav, page hero (§11.8), stubs: PROFILE, MISSION, TEAMS, CERTS, CLIENTS, TIMELINE, CAREERS, CTA, footer.
- [x] **Step 2: Profile + mission** — §11.9 copy (edited source text, quotes preserved); values as 4 hairline items (integrity, collaboration, commitment, professionalism); profile photo `assets/img/about/profilecompany-900.webp` + fallback.
- [x] **Step 3: Teams (4) + certs (3)** — §11.10 copy; team photos from `assets/img/team/*`; cert cards with scans from `assets/img/certs/*` (mapping fixed in Task 0 optimizer: `1.jpg`, `2.jpg`, `3.jpg`, `CERTI.png` → group `certs`).
- [x] **Step 4: Clients + timeline + careers** — §11.11 copy; clients paragraph + named organizations listed as evidence ("Selected organizations GeoLand has worked with, as cited in project records: FAO, USAID, Deloitte, Ministry of Agriculture, Kosovo Forest Agency, Municipality of Peja, Municipality of Rahovec, MoESP, New CO Ferronickel, Consult Engineering"); timeline 2011→2019 from §2.4; careers note links to contact (job application docx referenced as external link to old site until a new file is provided — use `https://www.geoland-kosova.com/images/jobapp/jobapp.docx`).
- [x] **Step 5: Review + commit** — read file end-to-end; commit `feat: about page`.

---

### Task 7: `services.html` + `assets/js/services.js`

**Files:** Create `services.html`, `assets/js/services.js`

- [x] **Step 1: Skeleton page** — head (title `Geo&Land Kosova — Services`, OG, BreadcrumbList), nav, page hero, stubs: INTRO, ACCORDION (6 services, anchor ids `gis`, `surveying`, `mapping`, `agri`, `ortho`, `uav`), CAPABILITIES, CTA, footer.
- [x] **Step 2: Accordion markup for services 1–3** — exact pattern per §5 `.svc`; each panel: scope `<ul>` (real bullets from §2.1), image `<picture>`, mono "DELIVERABLES" label. Service 1 open by default (`aria-expanded="true"`).
- [x] **Step 3: Accordion markup services 4–6 + capabilities section** — §11.12 copy; capabilities = 3-col hairline grid summarizing platforms (commercial & open source GIS, Web-GIS, INSPIRE-aligned software development, DBMS/geo server components — all sourced statements).
- [x] **Step 4: `services.js`** — one-open accordion: click toggles; close others; hash on load opens matching id and scrolls with offset; `aria-expanded` synced; keyboard: buttons native, ArrowUp/Down moves focus between headers (roving); Esc closes.
- [x] **Step 5: Verify + commit** — `node --check assets/js/services.js`; open page, click through (Playwright check in Task 12); commit `feat: services page with accessible service accordion`.

---

### Task 8: `projects.html` + `assets/js/projects.js`

**Files:** Create `projects.html`, `assets/js/projects.js`

- [x] **Step 1: Skeleton page** — head (title `Geo&Land Kosova — Projects`, OG, BreadcrumbList), nav, page hero, stubs: FILTERS, LIST, DIALOG, CTA, footer.
- [x] **Step 2: `projects.js` data literal** — `const PROJECTS = [...]` with every real project from §2.3 (deduplicated), each: `{ id, title, cat: 'gis-agri'|'software'|'cadastre'|'forestry', year, desc, img, org? }`. Descriptions: use source text where available (verbatim-safe condensed), else title only + category (never invent scope). Include the 4 category labels map. Write in =2 edits; verify with `node --check`.
- [x] **Step 3: JS behavior** — render list rows into `#proj-list` (JS-rendered to avoid 24 duplicated HTML blocks); filter buttons toggle `data-active`, filter with `hidden` attr + count update in `aria-live` region; row click → fill dialog (title, meta, desc, image) + `showModal()`; close button + Esc + backdrop click; floating peek preview: on `mouseenter` set image, rAF lerp follow, disable when `matchMedia('(hover: none)')`.
- [x] **Step 4: Page wiring** — filters + list container + dialog skeleton markup; `<noscript>` note stating the project list requires JavaScript and linking to `contact.html` and `services.html` for the same information.
- [x] **Step 5: Verify + commit** — `node --check`; commit `feat: projects page with filtering and detail dialog`.

---

### Task 9: `technology.html`

**Files:** Create `technology.html`

- [x] **Step 1: Skeleton** — head (title `Geo&Land Kosova — Technology & Capabilities`, OG, BreadcrumbList), nav, page hero (§11.13), stubs: UAV, DELIVERABLES, ORTHOPHOTOS, AIRBUS, SOFTWARE, CTA, footer.
- [x] **Step 2: UAV + deliverables gallery** — §11.14 copy (source claims only: certified operators, 1cm/pixel UAV LiDAR claim, use-case list); specs rows (mono key/value): survey, orthophoto, point cloud, DEM — four lightbox groups with real images.
- [x] **Step 3: Orthophotos + Airbus** — §11.15 copy; Airbus dark band: partnership statement + territory line + product table (§11.16 data: constellation, swath, revisit, resolution, daily capacity — copied from source) inside `.table-scroll[tabindex="0"]`; monitoring services list (Verde, AgNeo, Farmstar, Starling, GPI) one line each from source.
- [x] **Step 4: Software products** — 5 cards (§2.2), each: name, context line (client/partner where real), tech line only where sourced (SPFN: HTML5, jQuery, jQuery UI, jqGrid; KFIS: FAO; SVV: MoA; Municipal GIS: Peja; Addressing System).
- [x] **Step 5: Review + commit** — read end-to-end; commit `feat: technology and capabilities page`.

---

### Task 10: `contact.html`

**Files:** Create `contact.html`

- [x] **Step 1: Skeleton** — head (title `Geo&Land Kosova — Contact`, OG, LocalBusiness JSON-LD with both addresses, phone, email, geo), nav, page hero, stubs: CARDS, FORM, MAP, SOCIAL, footer.
- [x] **Step 2: Contact cards + form** — §11.17 copy; cards for Office 1, Office 2, Phone/Mobile, Email (tel:/mailto: links); form per Task 4 Step 4 with `novalidate` (JS validates) + native fallback via `action="mailto:info@geoland-kosova.com" method="post" enctype="text/plain"`; note under form: "This form composes an email in your client — or write to info@geoland-kosova.com directly."
- [x] **Step 3: Map + social** — lazy iframe `https://www.google.com/maps?q=Bardhyl%20%C3%87aushi%2C%20Prishtina%2C%20Kosovo&output=embed` in 16:9 frame with `loading="lazy"`, `title="Map of GeoLand office in Prishtina"`; social links (Facebook `https://www.facebook.com/pages/GeoLand/127476490650224`, Twitter `https://twitter.com/geoandland`, LinkedIn `https://www.linkedin.com/company/geo&land` — encode `&` as `%26` in href).
- [x] **Step 4: Review + commit** — commit `feat: contact page with validated form and map`.

---

### Task 11: SEO + brand files

**Files:** Create `sitemap.xml`, `robots.txt`, `favicon.svg`, `assets/img/brand/og-home.jpg` (render from hero image via PIL script step)

- [x] **Step 1: `robots.txt`** — `User-agent: *\nAllow: /\nSitemap: https://www.geoland-kosova.com/sitemap.xml`.
- [x] **Step 2: `sitemap.xml`** — 6 URLs with `lastmod 2026-10-01`, `priority` home 1.0 others 0.8, `changefreq monthly`.
- [x] **Step 3: `favicon.svg`** — hexagon mark, ink stroke + orange node, matches nav logo mark (16–32px legible); link in every page head (add `<link rel="icon" href="favicon.svg" type="image/svg+xml">` to all 6 pages).
- [x] **Step 4: OG images** — script `scripts/make_og.py` (PIL): 1200×630 crop of each page hero image + 48px bottom-right ink band; output `assets/img/brand/og-<page>.jpg`; wire `og:image` absolute URLs to `https://www.geoland-kosova.com/assets/img/brand/og-<page>.jpg`.
- [x] **Step 5: Verify + commit** — `sitemap` parses (python `xml.etree`), favicon exists; commit `chore: sitemap, robots, favicon and social images`.

---

### Task 12: Verification (evidence before claims)

**Files:** Create `scripts/verify.py`, `docs/qa/screenshots/**`

- [x] **Step 1: Write `scripts/verify.py`** — Playwright (chromium): for each page × viewport `[1440×900, 390×844]`: goto `http://localhost:4173/<page>.html`, wait `networkidle`, fail on any `console.error` or pageerror, fail on horizontal overflow (`document.documentElement.scrollWidth > innerWidth + 1`), screenshot to `docs/qa/screenshots/<page>-<w>.png`, assert `<h1>` exactly one, assert all `img` have `alt` attr, collect broken images (`naturalWidth === 0`) and fail if any.
- [x] **Step 2: Interaction checks in the same script** — services: click 3 accordion headers, assert panels toggle and only one open; projects: click filter `software`, assert row count changes, click first row, assert `dialog` open, press Esc, assert closed; contact: submit empty form, assert 2+ error messages visible; nav mobile: open drawer, assert `aria-expanded="true"`, Esc closes.
- [x] **Step 3: Run** — `python -m http.server 4173` (background) then `python scripts/verify.py`; Expected: `PASS 6 pages × 2 viewports`, zero console errors, zero overflow. Fix all failures before proceeding (re-run until green).
- [x] **Step 4: Read 4 screenshots** (home desktop, home mobile, projects desktop, contact mobile) with the Read tool; adjust spacing/typography if anything overflows, crowds, or looks generic; re-run.
- [x] **Step 5: Commit** — `git add scripts/verify.py docs/qa; git commit -m "test: automated page, a11y-baseline and interaction verification"`.

---

### Task 13: Creative-director self-critique + polish

- [x] **Step 1: Run the §17 checklist** (user brief) against all screenshots: information accuracy (nothing invented — re-read copy against §2), AI-slop scan, navigation clarity, typography strength, spacing rhythm, animation taste, technical credibility, mobile intentionality, section purpose. Write findings to `docs/qa/review.md` (max 12 bullets, each with fix).
- [x] **Step 2: Apply fixes** — weakest 5 first; re-run verify.py; read changed screenshots.
- [x] **Step 3: Final commit** — `git commit -am "polish: creative-director pass — typography, spacing, motion restraint"` and tag `git tag v1.0.0`.

---

## 11. PAGE CONTENT SPECS (final copy — write exactly this)

### 11.1 Nav (all pages)
Links: Home · About · Services · Projects · Technology · Contact. CTA button: "Start a project". Logo: SVG hexagon + `GEO&LAND` (GEO& ink, LAND orange). Drawer footer: "+383 38 739 193 · info@geoland-kosova.com".

### 11.2 Home hero
- Kicker (mono): `GEOINFORMATION · LAND ADMINISTRATION · CADASTRE — PRISHTINA, KOSOVO`
- H1: `Ground truth, measured precisely.` (=7 words, no buzzwords) — alternative rejected: "Mapping the future" (cliché).
- Lead: `Geo&Land is one of the largest companies in south east Europe specialized in Geoinformation disciplines — GIS, land administration, cadastre, agriculture and software development. Since our early national projects, we have carried out work in Kosovo that had never been done here before.` (source-derived)
- CTAs: `Explore services` → services.html · `Talk to our team` → contact.html
- Mono coordinates bottom: `N 42.6629° · E 21.1655° · GRID ZONE 34T`

### 11.3 Credentials strip (home)
`ISO 9001:2008 — Bureau Veritas` / `Licensed — Kosovo Cadastral Agency` / `Licensed — MAFRD forest management plans` / `AIRBUS partner since 2013 — Kosovo · Croatia · Albania · North Macedonia`

### 11.4 Services index (home, 6 rows)
1. `GIS & Software Development` — `Spatial data infrastructure, Web-GIS and software built for land, agriculture and forestry.`
2. `Surveying` — `Geodetic control networks, engineering surveying and monitoring for demanding construction.`
3. `Mapping & Remote Sensing` — `2D and 3D mapping, satellite interpretation and land-cover analysis.`
4. `Agriculture & Forestry` — `Land registration, consolidation, inventory and GIS-based registers.`
5. `Orthophotos` — `Aerial imagery and orthophotos for Kosovo, Albania and North Macedonia.`
6. `Aerial Data Collection — UAV` — `Certified operators, up to 1 cm/pixel UAV LiDAR survey deliverables.`

### 11.5 Featured projects (home)
- Large 1: `Expropriation for Brezovica Resort` — `Geodetic & Cadastral Surveying · 2013` — `Land expropriation across 3,000 ha, contracted by Deloitte/USAID.` img `projects/brezovica`.
- Large 2: `Kosovo Forest Information System` — `Software Development · FAO` — `National forest IT system built with the Food and Agriculture Organization of the UN.` img `projects/kfis1`.
- Row 3: `Vineyard Cadastre, Rahovec` — `GIS & Agriculture · 2014`.
- Row 4: `Municipal GIS System, Peja` — `Software Development · 2014`.

### 11.6 Home about teaser + tech strip
- Teaser text: `Innovative, dedicated, reliable — in three words, that is Geo&Land. Our staff continuously raise their professional level, and our growth reflects the seriousness with which we work.` Facts: `6 service disciplines` / `20+ documented projects` / `5 software systems` / `4 countries via AIRBUS partnership`.
- Tech strip H2: `From field to map to decision.` Body: `Certified UAV operators capture, analyse and archive aerial data — distributed through web map services. Since 2013 we are the only AIRBUS partner for Kosovo, Croatia, Albania and North Macedonia, bringing satellite imagery and agricultural monitoring into the same workflows.` CTA: `See technology →`.

### 11.7 Footer (all pages)
Columns: About (4-line source-derived statement) · Pages (6) · Services (6) · Contact (both addresses, phone, mobile, email). Bottom line: `© <year> Geo&Land — Kosova. All rights reserved.` + social icons (Facebook, Twitter/X, LinkedIn). Cert line: `ISO 9001:2008 · Licensed by KCA · Licensed by MAFRD`.

### 11.8 Inner page heroes (title / lead / breadcrumb)
- About: `The company behind the maps.` / `Who we are, what we stand for, and the teams that deliver.` / `Home / About`
- Services: `Six disciplines. One standard.` / `What Geo&Land does, scoped exactly as we practise it.` / `Home / Services`
- Projects: `Work that speaks for itself.` / `Selection of documented projects across GIS, software, cadastre and forestry.` / `Home / Projects`
- Technology: `Technology with a job to do.` / `UAV surveying, satellite data and the systems we build.` / `Home / Technology`
- Contact: `Let us map your project.` / `Tell us what you need surveyed, mapped or built.` / `Home / Contact`

### 11.9 About profile + mission (edited source, quotes preserved)
- Profile: §2 opening lines, then: `We are trained and certified by prestigious and well-known standards and institutions to offer high quality services with a qualified and diverse staff.` + certification sentence + strategy sentence (large-scale Geoinformation projects, software development, Web-GIS on commercial and open-source platforms, INSPIRE directives) + `Geo&Land intends to remain a leader in the field of GIS and land administration in Kosovo. Today our activities extend into Albania and North Macedonia.`
- Pull quote: `"If we were to describe Geo&Land in three words it would be innovative, dedicated, and reliable."`
- Values 4: Integrity · Collaboration · Commitment · Professionalism (from source quote).
- Mission statement: `Our mission is to provide the highest quality services in order to meet client needs — forming lasting relationships, not just completing projects.` + institutional development/training/knowledge transfer line + senior-level consultancy and R&D line.

### 11.10 Teams + certificates
- Management Team: `High professionals with prestigious educational backgrounds, selected by the board of the company.`
- Geodesy Team: `Specialized in GIS and land surveying, qualified and trained to provide quality services across our surveying projects.`
- Software Development Team: `Trained to solve problems with creative solutions; the applications we deliver are sophisticated, easy to use, and come with manuals and instructions.`
- Agriculture Team: `Working to improve the agricultural landscape of Kosovo; consulting farmers and helping ideas become concrete businesses with access to grants.`
- Certificates: ISO 9001:2008 (Bureau Veritas — GIS, geodetic, cadastre and project management) · Long-term forest management plans (Ministry of Agriculture and Forestry) · Cadastral and property rights registration (Kosovo Cadastral Agency).

### 11.11 Clients + timeline + careers
- Clients lead: `Throughout the years, we have worked for public and private clients across different industries — and soon after our establishment we grew beyond our borders to include international organizations.` Evidence line per Task 6 Step 4.
- Timeline: 2011 `Farmer Register System delivered (EU-financed project)` · 2011 `Forestry management plans, Kosovo Forest Agency` · 2012 `Digital and hard-copy maps for municipalities, USAID` · 2013 `Brezovica Resort expropriation, 3,000 ha — Deloitte/USAID` · 2014 `INTERGEO; KAVEKO workshop; GeoLand hosts international conference on Geoinformation, Space and Defence` · 2015 `KFIS training` · 2017 `KFIS GIS module (FAO); MoESP database project; Drenas expropriation application` · 2018 `Soil map of Rahovec (consortium)` · 2019 `UAV surveying service launched`.
- Careers: `We hire competitively and expect commitment, teamwork, communication, professionalism and respect for work ethic. Applications are read only when a vacancy is open.` Link: `Job application form (DOCX)` → old-site file.

### 11.12 Services page capabilities
`Commercial and open-source GIS platforms` · `Web-GIS for agriculture, forestry and local government` · `DESKTOP, MOBILE AND SERVER-SIDE GEO COMPONENTS` · `ISO 9001:2008 certified processes` · `INSPIRE-aligned software development` · `Institutional training and knowledge transfer`.

### 11.13 Technology hero + UAV copy
Lead: §11.8. UAV body (source): `Geo&Land is a drone data collection provider. Our certified UAV operators control the process of data capture, analysis, archival and distribution — delivering aerial data quickly and more cost-effectively through web map services. Whether the project is mapping, agriculture and forestry, mining and volume calculation, vegetation and crop diagnosis, oil and gas, infrastructure and utilities, or emergency and disaster response — our team can quickly and safely provide a UAV LiDAR survey at 1 cm/pixel resolution.`
Spec rows: `Surveying — GNSS-supported field control` · `Orthophoto — georeferenced, mosaic-ready` · `Point cloud — high-density 3D capture` · `DEM — terrain and surface models`.
Lightbox caption format: `UAV deliverable — <type> · Geo&Land`.

### 11.14 Orthophotos copy
`For urban-spatial planning, Geo&Land offers aerial images and orthophotos for Kosovo, Albania and North Macedonia. To manage urban, development and legalization plans, we provide a GIS municipal portal.`

### 11.15 Airbus copy
`Geo&Land proudly holds a partnership agreement with AIRBUS, covering cooperation in promoting, distributing and using AIRBUS products and services — from satellite optical and radar imagery to Agriculture Satellite Monitoring Services and OneAtlas. The agreement dates back to 2013, and Geo&Land continues to be the only AIRBUS partner for the Republic of Kosovo, Croatia, Albania and North Macedonia.`
Monitoring one-liners: Verde `Crop analytics from satellite and UAV imagery` · AgNeo `Precision farming decision platform` · Farmstar `Satellite + UAV agronomic advice` · Starling `Deforestation-free commodity monitoring` · Grassland Production Index `Continuous grass growth monitoring`.

### 11.16 Airbus table data
Rows (name | swath | revisit | resolution): Pléiades Neo | 14 km | twice daily, anywhere | 30 cm pan / 1.2 m MS · Pléiades | 20 km | twice daily, anywhere | 50 cm pan / 2 m MS · Vision-1 | 20.8 km | daily to 8 days | 0.9 m pan / 3.5 m MS · SPOT 6/7 | 60 km | twice daily, anywhere | 1.5 m pan / 6 m MS · Radar Constellation | 4–270 km | daily for most latitudes | 25 cm–40 m · DMC | 640 km | daily to every 2 days | 22 m. Caption: `Source: Airbus Defence and Space product documentation, as published on geoland-kosova.com.`

### 11.17 Contact page copy
Cards: Office 1 `Bardhyl Çaushi, Ob. C15/11 No. 07, 10000 Prishtina` · Office 2 `Qamil Hoxha No. 5, 10000 Prishtina` · Phone `+383 38 739 193` / Mobile `+383 44 224 853` · Email `info@geoland-kosova.com`. Form labels: Name, Email, Subject, Message; submit `Send message`. Success note: `Your email client should now open with the message ready to send.`

## 12. SELF-REVIEW (completed)

- **Spec coverage:** every brief section mapped — Discovery §1, Content §2, IA §3, Design §4, Components §5, Animation §6, Responsive §7, SEO §8, Performance §9, Order §10, Copy §11. No invented facts; no placeholders (all copy final).
- **Consistency:** class names shared across §5/§10/§11 (`svc`, `proj-row`, `creds`, `section-head`); image groups fixed in Task 0 mapping (`projects/`, `services/`, `team/`, `certs/`, `uav/`, `about/` → note: optimizer mapping must include `about` group for `profilecompany` and `certs` for certificate scans; Task 6 references adjusted accordingly).
- **Known follow-ups (documented, not hidden):** real form backend, new job-application file, client logo list, individual staff names — all absent at source, site structured to accept them later.
