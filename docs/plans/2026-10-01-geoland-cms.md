# GeoLand Kosova — Admin Panel & CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the GeoLand owner a self-hosted admin panel to manage projects, services and milestones, where published content renders through the existing public-site components unchanged — admin controls content, the frontend controls design.

**Architecture:** A zero-new-dependency Python 3.13 server (`ThreadingHTTPServer`) becomes the single entry point: it serves the existing static site, renders CMS content into the **existing HTML markup** via comment-marker blocks (server-side, so the design and SEO stay exactly as approved), exposes a small JSON API for the already-client-rendered project register, serves dynamic `/project/<slug>` pages with server-injected meta, and hosts a server-rendered admin panel. Content lives in SQLite (`data/geoland.db`); uploads are validated and processed with PIL into the site's established `-1600/-900/-640 .webp/.jpg` derivative convention; publishing is instant because HTML is rendered per request from the DB (`Cache-Control: no-cache` for HTML, immutable long-cache for hashed uploads).

**Tech Stack:** Python 3.13 stdlib (`http.server`, `sqlite3`, `hmac`, `hashlib`, `secrets`), PIL (already used), existing HTML/CSS/JS (untouched design), Playwright (existing, for E2E tests).

**Non-negotiables from the brief:** public design untouched; admin is utilitarian and GeoLand-flavored (same tokens, no SaaS cards); auth + CSRF + server-side validation on every mutation; one source of truth (DB drives public pages); draft content never public; full publish/edit/unpublish E2E tests.

---

## 1. EXISTING ARCHITECTURE (inspected, 2026-10-01)

- **Public site:** 6 static pages (`index/about/services/projects/technology/contact.html`), 3 CSS files (`base.css` tokens, `components.css`, `pages.css`), 3 JS modules (`main.js` nav/reveal/lightbox/form, `services.js` accordion, `projects.js` register with a hardcoded 28-project literal). No framework, no build step.
- **Design system:** tokens in `base.css` (Mirage `#16232a`, Blaze `#ff5b04`, Deep Sea Green `#075056`, Wild Sand `#e4eef0`); Schibsted Grotesk / Instrument Sans / IBM Plex Mono; 2px radius, hairline rules, no shadows; contours-not-grids surface rule.
- **Content that is hardcoded today:** 28 projects (`projects.js` literal), 6 services (`index.html` svc-index rows + `services.html` accordion articles), 8 milestones (`about.html` timeline), featured projects (`index.html` feat-grid/feat-rows), all imagery in `assets/img/**` following a `base + "-<width>.<ext>"` convention.
- **Rendering today:** projects register is client-rendered from the literal; everything else is static HTML.
- **Server today:** `python -m http.server 4173` — replaced by `server.py`.
- **No database, no auth exist.** Tests: `scripts/verify.py` (public site, 74 checks), `scripts/qa_interactions.py`, `scripts/shot.py`.

## 2. ARCHITECTURE DECISION

**Why not a client-side CMS or SPA:** the approved design is server-delivered static HTML; runtime hydration of every section would risk visual drift, duplicate SEO content, and fight the "content vs presentation" separation. Server-rendered marker replacement keeps byte-identical markup and instant relevance.

**Data flow:** `owner → /admin (server-rendered forms) → SQLite → server renders existing HTML markers → public pages`. One source of truth: the DB. Seeding imports today's hardcoded content (projects via Node-eval of the current literal to avoid transcription errors; services/milestones parsed from the current HTML).

**Public integration points (the only frontend changes allowed):**
1. `projects.js`: `PROJECTS` literal → `fetch('/api/projects')` (same data shape, same rendering; error state added).
2. Marker blocks added to `index.html` (featured projects, services index), `services.html` (accordion list), `about.html` (timeline). Each marker wraps the current markup as static fallback; the server replaces the block when published DB content exists, so the site still works if the server is ever used plainly.
3. New `project-template.html` → served at `/project/<slug>` with server-filled meta + body (no client fetch; real SEO).
4. `sitemap.xml` becomes DB-generated (route in server.py).
5. CSS/design: **no changes to existing files** except none; admin gets its own `admin/admin.css` consuming the same tokens.

## 3. FILE MAP

```
server.py                      # HTTP entry: routing, static files, API, admin dispatch
cms/__init__.py                # package marker
cms/db.py                      # connection, schema, migrations, activity log
cms/auth.py                    # PBKDF2 hashing, sessions table, cookie signing, CSRF, rate limit
cms/multipart.py               # minimal multipart/form-data parser (cgi removed in 3.13)
cms/media.py                   # image validation + derivative generation (PIL)
cms/content.py                 # published-content queries (public) + content CRUD helpers (admin)
cms/render.py                  # marker replacement, {{var}}/{{{raw}}} templates, picture() helper
cms/admin.py                   # all /admin routes (GET pages + POST actions)
cms/templates/*.html           # admin UI shell + pages (server-rendered)
admin/admin.css                # admin-only styles layered on the site tokens
assets/uploads/                # uploaded image derivatives (gitignored)
data/geoland.db                # SQLite (gitignored); data/secret.key (gitignored)
project-template.html          # public dynamic project page shell (markers + shell copied from index)
scripts/seed_cms.py            # one-time: schema + import services, milestones, projects (via node)
scripts/test_cms.py            # E2E pipeline tests (setup→draft→publish→edit→unpublish→delete)
scripts/admin_shots.py         # Playwright screenshots of admin for ai-slop review
.gitignore                     # add data/, assets/uploads/
```

## 4. DATA MODEL (SQLite, WAL)

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL,
  pw_hash TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY, username TEXT NOT NULL, expires_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY, base TEXT UNIQUE NOT NULL,
  original_name TEXT DEFAULT '', alt TEXT DEFAULT '',
  width INTEGER, height INTEGER, widths TEXT DEFAULT '',
  is_upload INTEGER DEFAULT 1, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL,
  category TEXT NOT NULL, year INTEGER, org TEXT DEFAULT '',
  description TEXT DEFAULT '', image_media_id INTEGER REFERENCES media(id),
  featured INTEGER DEFAULT 0, featured_rank INTEGER DEFAULT 100,
  published INTEGER DEFAULT 0, created_at TEXT, updated_at TEXT);
CREATE TABLE IF NOT EXISTS project_images (
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL REFERENCES media(id),
  sort INTEGER DEFAULT 100, PRIMARY KEY (project_id, media_id));
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY, anchor TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
  short_scope TEXT DEFAULT '', scope_items TEXT DEFAULT '',
  deliverables TEXT DEFAULT '', image_media_id INTEGER REFERENCES media(id),
  sort INTEGER DEFAULT 100, published INTEGER DEFAULT 1, updated_at TEXT);
CREATE TABLE IF NOT EXISTS milestones (
  id INTEGER PRIMARY KEY, year INTEGER NOT NULL, text TEXT NOT NULL,
  sort INTEGER DEFAULT 100, published INTEGER DEFAULT 1, updated_at TEXT);
CREATE TABLE IF NOT EXISTS activity (
  id INTEGER PRIMARY KEY, ts TEXT NOT NULL, actor TEXT NOT NULL,
  action TEXT NOT NULL, entity TEXT NOT NULL, entity_id INTEGER, summary TEXT NOT NULL);
```

Rules: categories are the fixed four (`gis-agri`, `software`, `cadastre`, `forestry`) — a CHECK constraint keeps typos out; `slug` unique, auto-generated from title with `-2/-3` suffixes; drafts are rows with `published=0`; empty titles are impossible (NOT NULL + validation).

## 5. SECURITY MODEL

- **Auth:** first-run `/admin/setup` creates the single admin (disabled afterwards); PBKDF2-SHA256, 200k iterations, per-user salt; sessions in DB (revocable), cookie `gl_admin=<sid>.<exp>.<hmac>` — HttpOnly, SameSite=Lax, Secure when TLS detected; 30-day expiry.
- **CSRF:** token = `hmac(secret, "csrf:"+sid)`; hidden field in every admin form; all POSTs verified.
- **Rate limit:** login failures per IP (8 per 10 min) — in-memory.
- **Uploads:** extension + size (≤20MB) + PIL `verify()` (magic sniff); filenames discarded (sha256-named); only images re-encoded; stored under `assets/uploads/`.
- **Server:** all paths resolved and confined to the project root (traversal guard); SQLite parameterized queries only; admin routes 303→login when unauthenticated; destructive actions are POST + confirmation page.
- **Validation:** duplicated server-side even where HTML has `required`: title 3–200, slug `^[a-z0-9-]{2,80}$`, description ≤4000, org ≤120, year 1900–2100, scope items ≤200 each/≤12 items, milestone text ≤500; image refs must exist in `media`.

## 6. CACHING / REVALIDATION

- HTML + `/api/projects`: `Cache-Control: no-cache` (revalidate every load — publishing is instantly visible; SQLite reads are sub-ms, no manual invalidation needed, nothing disabled "just in case").
- Static assets under `assets/css|js|img` (non-upload): `Cache-Control: public, max-age=3600`.
- Uploads: content-hashed filenames → `Cache-Control: public, max-age=31536000, immutable`.
- `/sitemap.xml`: `no-cache`, regenerated per request from DB.

---

## 7. TASKS

### Task 0: Scaffold, .gitignore, seed extraction

**Files:** Create `.gitignore` (add `data/`, `assets/uploads/`), `cms/__init__.py`, empty dirs `cms/templates/`, `admin/`, `assets/uploads/`, `data/`.

- [ ] **Step 1:** Append to `.gitignore`: `data/`, `assets/uploads/`, `__pycache__/`. Create `cms/__init__.py` (empty) and the dirs.
- [ ] **Step 2:** Extract the current projects literal to JSON for seeding **before** touching `projects.js`: `node -e "const fs=require('fs');const t=fs.readFileSync('assets/js/projects.js','utf8');const m=t.match(/const PROJECTS = (\[[\s\S]*?\]);/);fs.writeFileSync('scripts/projects_seed.json', JSON.stringify(eval('('+m[1]+')'),null,2))"` — Expected: `scripts/projects_seed.json` with 28 objects; verify `node -e "console.log(require('./scripts/projects_seed.json').length)"` → `28`.
- [ ] **Step 3:** Commit: `chore: cms scaffold and project seed extraction`.

### Task 1: `cms/db.py` — connection, schema, activity

**Files:** Create `cms/db.py`

- [ ] **Step 1:** Implement `connect()` (module-level connection, `check_same_thread=False`, `PRAGMA journal_mode=WAL`, `PRAGMA foreign_keys=ON`, `row_factory=sqlite3.Row`), `init_schema()` executing the §4 DDL, and `log(actor, action, entity, entity_id, summary)` inserting into `activity` with ISO timestamp.
- [ ] **Step 2:** Verify: `python -c "from cms import db; db.init_schema(); print('ok')"` → creates `data/geoland.db`; `python -c "from cms import db; print(db.connect().execute('select count(*) from activity').fetchone()[0])"` → `0`.
- [ ] **Step 3:** Commit: `feat: sqlite schema and activity log`.

### Task 2: `cms/auth.py`

**Files:** Create `cms/auth.py`

- [ ] **Step 1:** Implement: `secret()` (load/create `data/secret.key`), `hash_password(pw)` / `verify_password(pw, stored)` (PBKDF2-SHA256 200k, format `pbkdf2$iter$salt_hex$hash_hex`), `create_user(username, pw) -> bool` (refuses if any user exists), `login(username, pw) -> sid|None` (DB session, 30d), `logout(sid)`, `current_user(cookies) -> username|None` (verify hmac signature + expiry + session row), `csrf_token(sid) -> str`, `check_csrf(sid, token) -> bool` (constant-time), `rate_limited(ip) -> bool` (8 fails / 10 min).
- [ ] **Step 2:** Verify with a smoke test: create user, login, `current_user` returns username, wrong password returns None, csrf validates. Command: `python -c "from cms import auth, db; db.init_schema(); print(auth.create_user('admin','correct-horse-battery')); sid=auth.login('admin','correct-horse-battery'); print(sid is not None, auth.login('admin','nope') is None, auth.check_csrf(sid, auth.csrf_token(sid)))"` → `True True None True True`; then delete the test user row (`sqlite3` CLI or python) to keep setup clean.
- [ ] **Step 3:** Commit: `feat: admin auth - password hashing, sessions, csrf, rate limit`.

### Task 3: `cms/multipart.py`

**Files:** Create `cms/multipart.py`

- [ ] **Step 1:** Implement `parse(body: bytes, content_type: str) -> dict[str, list[dict]]` for browser `multipart/form-data`: extract boundary, split parts, parse headers (`Content-Disposition` name/filename, `Content-Type`), return `{field: [{'filename': str|None, 'content_type': str, 'data': bytes}]}`. Reject >25MB bodies early.
- [ ] **Step 2:** Unit check with a generated fixture: `python -c "from cms.multipart import parse; b=b'--X\r\nContent-Disposition: form-data; name=\"a\"\r\n\r\nhello\r\n--X--\r\n'; print(parse(b, 'multipart/form-data; boundary=X'))"` → dict with `a` → `hello`.
- [ ] **Step 3:** Commit: `feat: minimal multipart parser for python 3.13`.

### Task 4: `cms/media.py`

**Files:** Create `cms/media.py`

- [ ] **Step 1:** Implement `save_upload(data: bytes, filename: str, alt: str) -> (media_id|None, error|None)`:
  - validate extension in {jpg,jpeg,png,webp} and size ≤20MB;
  - `Image.open(BytesIO)` + `.verify()` then reopen, `ImageOps.exif_transpose`, convert RGBA→RGB on `#e4eef0` (paper token) for JPEG;
  - `hash8 = sha256(data)[:8]`; `base = f"/assets/uploads/u{hash8}"`; if a media row with same base exists → return it (dedupe);
  - widths = [w for w in (1600, 900, 640) if min(w, img.width) == w or w == 1600][:3] deduped, fallback `[img.width]`; save `{base}-{w}.webp` (q78) and `.jpg` (q80, paper background);
  - insert media row with `width/height` of largest, `widths` = comma list, `is_upload=1`.
- [ ] **Step 2:** Implement `delete_media(media_id) -> error|None` refusing when referenced by `projects.image_media_id`, `project_images`, or `services.image_media_id` (return human message naming the item), else delete row + files.
- [ ] **Step 3:** Verify: run once with a real PNG from `assets/img/brand` via a small python snippet (read bytes, save_upload) → row exists, 6 files in `assets/uploads/`, then `delete_media` → files gone. Remove test row after.
- [ ] **Step 4:** Commit: `feat: media upload validation and derivative pipeline`.

### Task 5: `cms/render.py`

**Files:** Create `cms/render.py`

- [ ] **Step 1:** Implement `template(name, **ctx) -> str`: reads `cms/templates/<name>.html`, replaces `{{key}}` (HTML-escaped), `{{{key}}}` (raw), `{{#key}}...{{/key}}` conditional blocks; missing keys → `''`.
- [ ] **Step 2:** Implement `replace_block(html, marker, inner) -> str`: replaces everything between `<!-- cms:NAME -->` and `<!-- /cms:NAME -->` with `inner`; returns html unchanged if markers absent or `inner` is falsy (fallback preserved).
- [ ] **Step 3:** Implement `picture(media, alt, sizes='100vw', loading='lazy') -> str` producing the site's exact `<picture>` pattern from a media row (webp sources first, `<img src="{base}-{largest}.jpg"` with `srcset`, explicit `width`/`height`, escaped alt, `decoding="async"`), choosing widths from `media['widths']`; if `media` is None returns `''`.
- [ ] **Step 4:** Implement `paragraphs(text) -> str` (split on blank lines → `<p>` escaped each) and `split_lines(text) -> list[str]`.
- [ ] **Step 5:** Verify: `python -c "from cms import render; print(render.replace_block('<a>cms:x</a>','x','IN')[:0] or render.template('missing'))"` returns `''` gracefully; commit `feat: rendering helpers - markers, templates, picture`.

### Task 6: `cms/content.py`

**Files:** Create `cms/content.py`

- [ ] **Step 1:** Public queries (published only): `public_projects()` (ordered year DESC, title), `project_by_slug(slug)`, `project_images(project_id)`, `featured_projects()` (featured=1 AND published=1 ORDER BY featured_rank LIMIT 4), `public_services()` (published=1 ORDER BY sort), `public_milestones()` (published=1 ORDER BY sort DESC), `media_by_id(id)`, `media_all()`.
- [ ] **Step 2:** Admin mutations (each returns `(ok, error)` and logs to activity): `save_project(data, project_id=None)` with the §5 validation + slug generation/unique-suffix logic + featured rank; `set_project_published(id, bool)`; `delete_project(id)`; `save_service(data, service_id=None)`; `set_service_published`; `save_milestone(data, milestone_id=None)`; `delete_milestone`; `set_media_alt(id, alt)`; `delete_media_checked(id)` delegating to `media.delete_media`.
- [ ] **Step 3:** `slugify(title)` → lowercase, transliterate diacritics (unicodedata NFKD), non-alnum → `-`, collapse, trim, max 80.
- [ ] **Step 4:** Verify: py-smoke: init schema, `save_project` with minimal valid data → row + activity; invalid (empty title, bad category, year 1800) each return errors; duplicate titles produce `-2` slug. Commit `feat: cms content queries and admin mutations`.

### Task 7: `cms/admin.py`

**Files:** Create `cms/admin.py`

- [ ] **Step 1:** Route table + helpers: `handle(handler, path, method) -> bool` (True when handled); `_require_auth`, `_redirect`, `_notice_from_query` (`?ok=`/`?err=`), csrf injection into every form context.
- [ ] **Step 2:** Auth routes: `GET/POST /admin/setup` (only when no user; on success → login), `GET/POST /admin/login` (rate-limited, generic error "Invalid credentials"), `GET /admin/logout` (POST-style via redirect + session delete; also accept GET for owner convenience), all with `Secure`/`HttpOnly`/`SameSite=Lax` cookie.
- [ ] **Step 3:** Dashboard `GET /admin`: content counts table (projects total/published/draft, services, milestones, media), recent activity (last 10 from `activity`), quick actions (New project, Upload images). No fake stats, no cards.
- [ ] **Step 4:** Projects: `GET /admin/projects` (table incl. status/featured/updated, row actions), `GET /admin/projects/new`, `GET /admin/projects/edit?id=`, `POST /admin/projects/save` (create/update; handles `image_media_id` and `project_images[]` multi-select), `POST /admin/projects/action` (`publish|unpublish|delete`, delete requires the confirm page first).
- [ ] **Step 5:** Services + milestones CRUD pages with the same patterns; media: `GET /admin/media` (grid of thumbnails + alt forms + usage counts + delete), `POST /admin/media/upload` (multi-file), `POST /admin/media/action` (save alt / delete with reference guard).
- [ ] **Step 6:** Destructive confirmation: `GET /admin/confirm?action=...&id=...` renders the item name + irreversible warning + POST form; all destructive POSTs re-verify CSRF.
- [ ] **Step 7:** Verify route wiring with a request sweep script (browser in Task 9). Commit `feat: admin routes - dashboard, projects, services, milestones, media`.

### Task 8: `server.py`

**Files:** Create `server.py`

- [ ] **Step 1:** `ThreadingHTTPServer` + `BaseHTTPRequestHandler` subclass: `do_GET`/`do_POST` dispatch order: (1) `/admin*` → `cms.admin.handle`; (2) `POST /api/*` 405; (3) `GET /api/projects` → JSON `{cats, projects:[{id,title,cat,year,org,desc,img}]}` built from `public_projects()` (img = media base + `-900`, or largest available); (4) `GET /project/<slug>` → render `project-template.html` (404 page when missing) with server-injected head/meta/body; (5) `GET /sitemap.xml` → DB-generated; (6) static files with traversal guard (`Path.resolve().is_relative_to(ROOT)`), MIME map, cache headers per §6; directory requests → `index.html`; unknown → styled 404 (reuse site shell, minimal).
- [ ] **Step 2:** Startup: `db.init_schema()`, ensure `data/`, print banner with URL + `admin at /admin` + setup hint. `if __name__ == '__main__'`: port from `--port`/env, default 4173.
- [ ] **Step 3:** Kill-flag handling (`Ctrl+C` clean exit); log requests minimally (method, path, status) to stderr.
- [ ] **Step 4:** Verify: `python server.py` starts; `curl -s http://127.0.0.1:4173/api/projects | python -m json.tool | head` → JSON (28 after seeding); `/admin` → 303 to `/admin/login`; traversal `GET /../server.py` → 404; commit `feat: application server with api, project pages and admin routing`.

### Task 9: Admin UI — templates + `admin/admin.css`

**Files:** Create `admin/admin.css`, `cms/templates/layout.html`, `login.html`, `setup.html`, `dashboard.html`, `projects.html`, `project_form.html`, `services.html`, `service_form.html`, `milestones.html`, `media.html`, `confirm.html`

- [ ] **Step 1: `admin/admin.css`** — admin shell on the site tokens (link `base.css` first, then this): top bar (wordmark + horizontal nav + "View site ↗" + logout), content column max 1080px, `.tbl` tables (hairline rows, mono headers), `.badge` status text (PUBLISHED green / DRAFT orange-2), forms in the site's `.field` language, `.btn`/`.btn--ghost` reuse, `.notice` (ok/err) with left rule, `.thumb` media tiles, focus rings inherited. Explicitly **no**: cards, shadows, gradients, rounded containers, dashboard tiles. ~300 lines.
- [ ] **Step 2: `layout.html`** — shell with `{{{nav}}}`, `{{{notice}}}`, `{{{content}}}`, `<title>{{title}} · Geo&Land Admin`, links `base.css` + `/admin/admin.css`; no site main.js on admin pages except a tiny inline script for the unsaved-form guard? No — YAGNI, skip.
- [ ] **Step 3: `login.html` / `setup.html`** — single centered column (max 420px), label mono, inputs 48px, Blaze submit, generic error line; setup copy: "First run — create the administrator account." + password rules.
- [ ] **Step 4: `dashboard.html`** — "Content" table (rows: Projects N (X published · Y draft), Services, Milestones, Media) + "Recent changes" table (time, actor, summary) + quick actions row. Counts are links to the respective lists.
- [ ] **Step 5: `projects.html`** — filter row (All/Published/Draft via query), table columns: Title (link to edit), Category, Year, Featured, Status, Updated, actions (Edit · Publish/Unpublish · Delete). Empty state text, not an illustration.
- [ ] **Step 6: `project_form.html`** — two-column grid on desktop (main fields left: title, slug (auto-filled via small inline script, editable), category select, year, org, description textarea with counter; side column: image picker (current thumbnail + native `<select>` of media + file upload field), additional images multi-select, featured checkbox + rank, published checkbox, Save draft / Save & publish buttons). Validation errors rendered above the field. Character limits mirror server (§5).
- [ ] **Step 7: `services.html` + `service_form.html`** — list (name, anchor, sort, published, actions) + form (name, anchor, short scope, scope items textarea one-per-line, deliverables, image, sort, published).
- [ ] **Step 8: `milestones.html`** — single page: add form on top (year, text) + list with inline edit links.
- [ ] **Step 9: `media.html`** — upload form (multiple) + responsive grid of tiles: thumbnail (largest available), filename, dimensions, alt edit form per tile, usage count, delete. Delete disabled (with reason) when referenced.
- [ ] **Step 10: `confirm.html`** — "Delete ‘{name}’? This cannot be undone." + detail line (e.g. referenced images count) + POST confirm + cancel link.
- [ ] **Step 11:** Verify visually with the server + `python scripts/shot.py http://127.0.0.1:4173/admin/login docs/qa/admin-login.png 1280 900` (adjust per page). Commit `feat: admin templates and styles`.

### Task 10: Public frontend integration (minimal, design-preserving)

**Files:** Modify `projects.js`, `index.html`, `services.html`, `about.html`; Create `project-template.html`

- [ ] **Step 1: `projects.js`** — replace the `PROJECTS` literal with `let PROJECTS = []` + `fetch('/api/projects')`; move row-building into `renderRegister()` called after data; on failure render an honest error line in `#proj-list` ("Project register is temporarily unavailable — please try again.") and keep filters inert. All rendering code, classes and interactions unchanged.
- [ ] **Step 2: markers** — wrap in `index.html` the `.svc-index` block with `<!-- cms:services-index -->…<!-- /cms:services-index -->` and the `.feat-grid` + `.feat-rows` with `<!-- cms:featured -->…<!-- /cms:featured -->`; in `services.html` wrap the six `<article class="svc">` items inside `.svc-list` with `<!-- cms:services-full -->…<!-- /cms:services-full -->`; in `about.html` wrap the `<ol class="timeline">` with `<!-- cms:milestones -->…<!-- /cms:milestones -->`. Current markup stays inside the markers as the no-DB fallback.
- [ ] **Step 3: server fills markers** — in `server.py` before serving `index.html`/`services.html`/`about.html`, call `content.*` and replace blocks: services-index rows (reuse `.svc-index__row` markup exactly), featured (first two featured → `.feat-card` with `picture()`, next two → `.feat-row`), services accordion (anchor ids preserved, open state on first item), milestones (`.timeline li`). If no published rows → leave fallback.
- [ ] **Step 4: `project-template.html`** — full page reusing the site shell (nav, footer, lightbox dialog copied from `index.html`) and existing classes: `.page-hero` (crumb `Home / Projects / title`, h1, mono meta `CATEGORY · YEAR · ORG`), section with `.about-profile`-style two-column (main image left via `picture()` 1600/900; description `paragraphs()` right), `.gallery-strip` of additional images as lightbox triggers (`data-lightbox="project-images"`), back link + CTA band. Markers: `<!-- cms:head -->` (title/description/canonical/OG), `<!-- cms:hero -->`, `<!-- cms:body -->`.
- [ ] **Step 5: verify** — with seeded DB: `/api/projects` returns 28; `index.html` serves server-rendered featured (view-source contains `.feat-card`); `/project/brezovica` 200 with title in `<title>`, og:image absolute; `scripts/verify.py` (updated base URL to `server.py` on 4173) still 74/74; commit `feat: connect public site to cms content`.

### Task 11: Seed `scripts/seed_cms.py`

**Files:** Create `scripts/seed_cms.py`

- [ ] **Step 1:** `init_schema()` then idempotent seeding (skip when rows exist): 6 services (anchors `gis/surveying/mapping/agri/ortho/uav`, scope items and deliverables transcribed from the current accordion, short scopes from the index rows, images base `/assets/img/services/{gis,surveying,mapping,agriculture,orthophotos}` + `/assets/img/uav/surveying-1`), 8 milestones (from the current timeline), 28 projects from `scripts/projects_seed.json` (map `img` base, desc, org, year, cat; relabel category strings to the 4 keys; set featured ranks: Brezovica 1, Vineyard Rahovec 2, KFIS 3, Municipal GIS 4).
- [ ] **Step 2:** Media rows for every distinct base: scan filesystem for `-{1600,900,640}.webp/jpg` to fill `widths`, read largest JPG via PIL for `width/height`, `is_upload=0`.
- [ ] **Step 3:** Run: `python scripts/seed_cms.py` → prints counts `6 services, 8 milestones, 28 projects, N media`; re-run → prints `already seeded` and changes nothing.
- [ ] **Step 4:** Commit `feat: seed cms from current site content`.

### Task 12: E2E tests `scripts/test_cms.py`

**Files:** Create `scripts/test_cms.py`

- [ ] **Step 1:** HTTP flow (urllib + cookie jar, against `python server.py` on 4173): setup admin (or login if exists) → create project **as draft** with a tiny generated PNG upload → assert: `/api/projects` excludes it; `/project/<slug>` → 404; `/admin/projects` row shows DRAFT.
- [ ] **Step 2:** Publish → assert `/api/projects` includes it; `/project/<slug>` → 200 with `<title>` containing the title and `og:image`; unfiltered `index.html` unchanged unless featured (then `.feat-row`/`.feat-card` contains title); register count via API = 29.
- [ ] **Step 3:** Edit title + description → publish → assert public page reflects both; upload second image → appears in `/project/<slug>` gallery; PNG upload produced 6 derivative files on disk under `assets/uploads/`.
- [ ] **Step 4:** Negative cases: duplicate slug handled (`-2`); invalid year/category rejected with error notice; POST without CSRF → 403; unauthenticated `/admin/projects` → 303 login; oversized/non-image upload rejected with readable message; media delete while referenced → blocked with message.
- [ ] **Step 5:** Unpublish → gone from API and `/project/<slug>` (404); delete (with confirm POST) → gone from admin; final assert original 28 intact.
- [ ] **Step 6:** Run `python scripts/test_cms.py` → all checks `PASS`, exit code 0. Commit `test: end-to-end cms pipeline`.

### Task 13: Admin UX review with `/ai-slop` + polish

**Files:** Modify templates/admin.css as findings require.

- [ ] **Step 1:** `scripts/admin_shots.py` (Playwright, logged-in session via setup/login): screenshots of login, dashboard, projects list, project form (empty + validation errors), media grid, projects on 390px. Save to `docs/qa/admin/`.
- [ ] **Step 2:** Review against the ai-slop rubric specifically for: generic SaaS shell, card grids, rounded containers, decorative motion, duplicated patterns, typography inconsistency, complexity beyond need. Record findings in `docs/qa/review.md` (append an "Admin panel" section) with evidence + fixes.
- [ ] **Step 3:** Apply fixes (e.g. reduce chrome, tighten table density, remove any decorative element without a job), re-shoot, confirm public pages unchanged (`verify.py` still green).
- [ ] **Step 4:** Update `DESIGN.md` (admin section: tokens shared, utilitarian rules) and `PRODUCT.md` (admin users/jobs). Commit `polish: admin ux review and design doc updates`; tag `v2.0.0`.

---

## 8. ACCEPTANCE — the brief's 15-step flow maps to Task 12

Login (T12.1) → create (T12.1) → upload (T12.1/3) → save draft (T12.1) → draft not public (T12.1) → publish (T12.2) → appears publicly (T12.2) → open project page (T12.2) → existing design used (T12.5 + Task 10 markers keep classes byte-identical) → edit (T12.3) → publish (T12.3) → reflected (T12.3) → unpublish (T12.5) → disappears (T12.5) → desktop/mobile (T13 screenshots + existing responsive CSS untouched).

## 9. SELF-REVIEW

- **Spec coverage:** owner content types (projects+images, services, milestones/news, media, featured) ✓; separation of content/presentation (markers + fixed components, no admin styling inputs anywhere) ✓; auth/security (§5) ✓; source of truth (DB; seed is one-time) ✓; caching (§6) ✓; SEO (server-injected per-project meta + DB sitemap) ✓; error handling (validation messages, upload failures, 404s, delete guards) ✓; E2E 15 steps ✓; ai-slop review (Task 13) ✓.
- **Consistency:** `media.base` convention identical between seed, upload, API and `picture()`; `CATS` keys unchanged so `projects.js` filters work untouched; marker names match between server and HTML edits; admin mutations all log to `activity` and return `(ok, error)`.
- **Known limits (documented):** single admin user (brief implies the owner); no WYSIWYG (fields are plain text — the frontend formats); contact form stays mailto; deployment instructions: run `python server.py` (production note: put behind a reverse proxy for TLS).



