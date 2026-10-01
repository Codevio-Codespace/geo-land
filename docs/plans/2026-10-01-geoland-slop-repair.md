# GeoLand Kosova — AI-slop repair pass (plan)

> Executed in-session, 2026-10-01. Reviewed against the `ai-slop` rubric §3–§4 after the main build (`2026-10-01-geoland-kosova-website.md`, all tasks complete, `v1.0.0`).

**Context:** The site already scores well on grounding (all copy sourced), truthfulness (no invented facts), distinctiveness (brand-derived palette, real imagery, register metaphor). The deterministic scan found no AI-buzzword copy and one stray inline style. The honest failures are: (1) motion over-application, (2) redundant mono meta labels, (3) five identical product cards, (4) missing skill-required artifacts (PRODUCT/DESIGN/EVIDENCE).

## Findings → actions

| # | Dimension | Evidence | Fix |
|---|---|---|---|
| 1 | Motion (§3.10) — **major** | `data-reveal` on creds items, service rows, facts, values, team/cert/contact cards, monitor items, timeline — routine content fades/rises with staggered delays | Keep reveals only on section heads and media figures/galleries; strip from routine lists and cards. Motion law documented in DESIGN.md |
| 2 | Typography (§3.8) — minor | Section heads carry 3 mono elements; right-hand meta often repeats context ("Prishtina", "Selected", "How we work") | Remove non-factual right metas; keep those carrying new facts ("06 disciplines", "04 teams", "2011 → today", "AIRBUS partner since 2013") |
| 3 | Composition (§3.4) — noticeable | Technology software section = 5 identical bordered cards (component-library feel) | Rebuild as a systems register: numbered rows with name + context + client/scope columns — same document metaphor as the project register |
| 4 | Implementation (§3.13) — minor | One inline `style="margin-top…"` in services.html | Replace with a utility class |
| 5 | Legibility — minor | `.mono` at 0.72rem (11.5px) | Raise to 0.75rem (12px) |
| 6 | Artifacts (§5) — required | PRODUCT.md, DESIGN.md, EVIDENCE.md missing | Create all three |
| 7 | Copy check — pass | "We let our success speak for itself" is source copy; "Ground truth" is real surveying terminology; no buzzword scan hits | No change; documented in EVIDENCE.md |

## Verification
Stripped reveals must not break reveal JS (guarded, no-op safe) — re-run `verify.py` (70 checks), fresh screenshots, independent `interface-reviewer` pass, commit `polish:` and tag `v1.0.1`.

## Outcome (2026-10-01, same session)

All findings fixed and verified. Independent `interface-reviewer` pass additionally found real defects that the original QA missed because it only tested at scroll position 0:

| Sev | Finding | Fix |
|---|---|---|
| BLOCKER | Modals laid out at document origin when opened from a scrolled page (`* { margin:0 }` killed UA `dialog{margin:auto}`; author `position` overrode `dialog:modal{position:fixed}`) — lightbox 0% visible on mobile | `dialog[open]{position:fixed;inset:0;margin:auto}` in base.css; removed `position:relative` overrides. Geometry assertion added to verify.py |
| MAJOR | Mobile drawer ✕ painted behind the open panel (parent z-index cap) | `body.nav-open .site-nav{z-index:130}` + toggle label swaps Open/Close |
| MAJOR | Form boundaries 2.09:1 (below 3:1, WCAG 1.4.11) | `--line-strong` raised to .55 alpha (~3.4:1) |
| MAJOR | Collapsed accordion panels remained in the a11y tree | `inert` + `aria-hidden` synced in services.js incl. initial state |
| MINOR | 578px submit slab; weak input focus change; layout-property hover animations; 5 identical grids; 39px touch chips; illegible Brezovica crop; phantom grid column; URL-less filter state; initial live-region announcement; duplicated H1/H2 copy; near-invisible contour; dialog first-focus on a link | `justify-self:start` on submit; global focus ring restored; padding-left hover removed; monitor list → definition rows, caps → indexed register; 44px chips; `object-position:left top` for the document card; 4-col svc-index; `?filter=` in URL; silent initial filter; differentiated H1s; contour at `--green-2/.22`; `autofocus` on dialog close |

Re-verified: `verify.py` 74/74 checks pass (incl. modal geometry from scroll), zero console errors, zero overflow at 390/1440, axe-core 0 violations beyond the declared wordmark exception.
