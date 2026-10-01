# GeoLand Admin — Fix & Polish Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the CMS with a green end-to-end test run, then polish the admin panel's navigation and craft so the owner can run it without a manual.

**Architecture:** No architecture changes. This plan verifies the three fixes already applied (render parameter collision, slug preservation on edit, self-contained duplicate-slug test), cleans test debris, captures admin screenshots, and applies a concrete polish list to `admin/admin.css` + templates.

**Tech Stack:** unchanged (Python stdlib server, SQLite, server-rendered admin templates).

---

## 0. CURRENT STATE (verified before this plan)

- Public site with CMS content: 74/74 checks green (`scripts/verify.py`).
- E2E `scripts/test_cms.py`: **26/31 pass**. Fixed but unverified:
  1. `cms/render.py` — `template(name, …)` collided with `name=` context key (confirm page 500). Renamed the parameter to `template_name`.
  2. `cms/content.py` `save_project` — editing a title with an empty slug field regenerated the slug → published URL changed → public page 404. Now: existing slug is preserved unless the slug field is explicitly edited.
  3. `scripts/test_cms.py` — duplicate-slug test restructured to be self-contained (creates two projects, asserts `-2`, deletes both); credentials read from `GEOLAND_ADMIN` / `GEOLAND_ADMIN_PASSWORD` environment variables (never stored in the repo).
- Admin account: created locally with `scripts/set_admin.py` (the account password is not stored in this repository; the minimum length is 8 characters).
- Known debris: projects titled `CMS Test Project …` may remain from failed runs; possibly unreferenced uploads.

## 1. FILE STRUCTURE (changes in this plan)

```
scripts/test_cms.py          # done: new creds + dup-slug restructure  (verify only)
scripts/admin_shots.py       # create: Playwright screenshots of admin pages
admin/admin.css              # polish: skip-link, counts restyle, table scroll, mobile padding
cms/templates/layout.html    # polish: skip link + main id
cms/templates/dashboard.html # polish: counts markup, table wrapper
cms/templates/projects.html  # polish: table wrapper, empty-state link
cms/templates/services.html  # polish: table wrapper
cms/templates/milestones.html# polish: table wrapper
cms/templates/media.html     # polish: table wrapper not needed; upload row layout
cms/templates/project_form.html / service_form.html # polish: breadcrumb row
cms/admin_pages.py           # polish: pass crumb text to form templates
docs/qa/review.md            # append admin ai-slop findings + fixes
DESIGN.md / PRODUCT.md       # document admin section
```

---

## 2. TASKS

### Task 1: Verify the three fixes — E2E must go green

**Files:** verify `cms/render.py`, `cms/content.py`, `scripts/test_cms.py`

- [ ] **Step 1: Clean debris + confirm baseline** — a small Python script deletes projects `title LIKE 'CMS Test Project%'` (and their rows in `project_images`), then removes unreferenced `media WHERE is_upload = 1 AND id NOT IN (SELECT image_media_id FROM projects WHERE image_media_id NOT NULL UNION SELECT media_id FROM project_images UNION SELECT image_media_id FROM services WHERE image_media_id NOT NULL)`. Expect: `projects: 28 | drafts: 0`.
- [ ] **Step 2: Restart the server** so it imports the fixed modules: kill the port-4173 process, `Start-Process python server.py` with stderr redirected to `data/server-err.log`.
- [ ] **Step 3: Run `python scripts/test_cms.py`.** Expected: `RESULT: ALL CMS CHECKS PASSED` (31 checks). If any check fails, read `data/server-err.log` tail, fix the named root cause in the cms module, restart, re-run. Do not patch the test to hide a product bug.
- [ ] **Step 4: Verify no residue after the run** — API count back to 28; `data/server-err.log` contains no `[server] error` lines from this run.
- [ ] **Step 5: Commit** `test: cms end-to-end pipeline green`.

### Task 2: Admin screenshot harness

**Files:** Create `scripts/admin_shots.py`

- [ ] **Step 1: Write the script** — Playwright, 1280×900 and 390×844. Log in once (form fill on `/admin/login` with env `GEOLAND_ADMIN`/`GEOLAND_ADMIN_PASSWORD`, same defaults as the test). Capture: `login`, `dashboard`, `projects`, `project-form` (open `/admin/projects/edit?id=<first id from projects list regex>`), `services`, `service-form`, `milestones`, `media`, `confirm` (via `/admin/confirm?action=delete_project&id=<id>` — screenshot only, no POST). Desktop set to `docs/qa/admin/`; mobile set (`projects`, `project-form`, `dashboard`) suffixed `-mobile`.
- [ ] **Step 2: Run it** — `python scripts/admin_shots.py` → 12 PNGs, zero console errors reported.
- [ ] **Step 3: Review the captures against the ai-slop rubric** — specifically: counts strip reading as SaaS stat-tiles, table density and horizontal crush on mobile, form rhythm (label size vs input), top-bar wrapping at 390px, login composition, empty/notice states. Append findings with evidence to `docs/qa/review.md` under “Admin panel”, each with a concrete fix.
- [ ] **Step 4: Commit** `chore: admin screenshot harness and review notes`.

### Task 3: Navigation polish (owner-first)

**Files:** Modify `cms/templates/layout.html`, `cms/templates/project_form.html`, `cms/templates/service_form.html`, `cms/admin_pages.py`, `admin/admin.css`

- [ ] **Step 1: Keyboard skip link** — in `layout.html` add `<a class="skip-link" href="#admin-main">Skip to content</a>` directly after `<body class="admin">`, and change `<main class="admin-page">` to `<main class="admin-page" id="admin-main">`. (base.css already styles `.skip-link`.)
- [ ] **Step 2: Breadcrumbs on forms** — in `admin_pages.project_form` pass `crumbs='<a href="/admin/projects">Projects</a> / '` and render in the template above the `<h1>`: `{{#crumbs}}<p class="crumbs mono">{{{crumbs}}}<span>{{heading}}</span></p>{{/crumbs}}`. Same pattern for `service_form` (`Services / `). CSS: `.crumbs { margin-bottom: var(--s-2); color: var(--muted); } .crumbs a { color: var(--muted); } .crumbs a:hover { color: var(--orange-2); } .crumbs span { color: var(--ink); }`
- [ ] **Step 3: Active-section clarity in the top bar** — the nav already sets `.is-active`; add `aria-current="page"` to the active link in `nav()` for assistive tech, and bump the active underline to 2px solid `--orange` (already), no visual change needed beyond aria.
- [ ] **Step 4: “New project” affordance on every projects view** — the filter row already carries it; also add it to the dashboard quick actions (exists). No change if captured screenshots show it above the fold; otherwise move the button before the filters.
- [ ] **Step 5: Commit** `polish: admin navigation - skip link, breadcrumbs, aria-current`.

### Task 4: Visual polish (ai-slop informed)

**Files:** Modify `admin/admin.css`, `cms/templates/dashboard.html`, `cms/templates/projects.html`, `cms/templates/services.html`, `cms/templates/milestones.html`, `cms/templates/login.html`

- [ ] **Step 1: Counts strip → content register** — replace the big-number `.counts` tiles with the site's register language: a hairline definition list, 2 columns on desktop, 1 on mobile. `dashboard.html` markup: `<dl class="count-list">` with each entry `<div><dt><a href="…">Projects</a></dt><dd>28 <span class="mono muted">24 published · 4 drafts</span></dd></div>` — the published/drafts detail lives inside the Projects row instead of three separate tiles. Same rows for Services, Milestones, Images. CSS: `.count-list { border-top: var(--hairline); } .count-list div { display: grid; grid-template-columns: 12rem 1fr; gap: var(--s-4); padding: var(--s-3) 0; border-bottom: var(--hairline); } .count-list dt a { color: var(--ink); text-decoration: none; border-bottom: 1px solid var(--line-strong); } .count-list dd { margin: 0; }`
- [ ] **Step 2: Table wrapper for small screens** — wrap `{{{table}}}` in `<div class="tbl-wrap">…</div>` in `projects.html`, `services.html`, `milestones.html`, and the recent-changes table in `dashboard.html`. CSS: `.tbl-wrap { overflow-x: auto; } .tbl { min-width: 640px; }` — the admin page keeps its own horizontal scroll instead of crushing rows at 390px.
- [ ] **Step 3: Mobile top bar** — at `max-width: 860px` keep the nav on its own scrollable row (already), add `-webkit-overflow-scrolling` not needed; ensure `.admin-bar__meta` wraps under (it does) and add `padding-block: var(--s-2)` to the meta row so it isn't flush against the nav.
- [ ] **Step 4: Login composition** — add the hexagon mark above the wordmark (copy the 30×33 SVG from `layout` brand, ink strokes) and set `h1` to “Sign in to the admin panel” so the page states its purpose without the bar.
- [ ] **Step 5: Forms density** — reduce `form textarea` min-height to 110px for milestone text (it is 130 globally); ensure `.form-grid` stacks below 860px (exists); ensure the file inputs and selects share the 44px control height (add `form input[type="file"] { padding: .5rem .75rem; border: 1px solid var(--line-strong); border-radius: var(--radius); background: var(--paper); }`).
- [ ] **Step 6: Re-run `python scripts/admin_shots.py`; read 4 key captures (dashboard, projects-mobile, project-form, media) and fix any new issue the captures reveal** — each fix gets one line in `docs/qa/review.md`.
- [ ] **Step 7: Commit** `polish: admin visual language - register counts, table scroll, login, controls`.

### Task 5: Final gates + documentation

**Files:** Modify `DESIGN.md`, `PRODUCT.md`, `docs/plans/2026-10-01-geoland-cms.md`

- [ ] **Step 1: Public site gate** — `python scripts/verify.py` → `RESULT: ALL CHECKS PASSED` (74/74).
- [ ] **Step 2: E2E gate** — `python scripts/test_cms.py` → all checks pass, API back to 28.
- [ ] **Step 3: Docs** — `DESIGN.md`: add “Admin panel” section (shared tokens, utilitarian rules: tables over cards, no shadows/gradients, register-density, breadcrumbs). `PRODUCT.md`: add admin user row (owner: publish/manage content without touching code) and admin non-goals (single admin, no WYSIWYG, no scheduling). Mark the CMS plan’s tasks complete in `docs/plans/2026-10-01-geoland-cms.md`.
- [ ] **Step 4: Commit + tag** `feat: cms v2 - admin panel with verified publishing pipeline`; `git tag v2.0.0`.

## 3. SELF-REVIEW

- **Coverage:** E2E green (T1), navigation ease (T3: skip link, breadcrumbs, aria, CTA), polish (T4: counts, mobile tables, login, controls), review evidence (T2 + T4.6), gates + docs (T5). The user’s personal credentials handled in Task 0 state (already applied via `set_admin.py`).
- **No placeholders:** every change names the file, selector/markup, and expected result; screenshot-driven fixes are bounded by the explicit rubric.
- **Consistency:** class names (`.count-list`, `.tbl-wrap`, `.crumbs`) are introduced once and reused; the test defaults match the admin account; no change touches public-site CSS/JS.
