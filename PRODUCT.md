# PRODUCT.md — GeoLand Kosova website

## Offer
Geo&Land is a Prishtina-based Geoinformation company (self-described as one of the largest in south east Europe) providing six service disciplines — GIS & Software Development, Surveying, Mapping & Remote Sensing, Agriculture & Forestry, Orthophotos, UAV Aerial Data Collection — plus five software systems built for Kosovo's public sector. Airbus satellite-imagery partner for Kosovo, Croatia, Albania and North Macedonia since 2013.

## Target users and their jobs
| User | Job to be done on this site |
|---|---|
| Public institutions (ministries, municipalities, cadastral/forest agencies) | Verify GeoLand can deliver a national-scale register/survey, then request a quote |
| International organizations (FAO, USAID, Deloitte) | Check project evidence and certifications before shortlisting |
| Private sector (construction, energy, agriculture, mining) | Confirm relevant capability (UAV, volumes, cadastre), then contact |
| Job applicants | Find requirements and the application form |

## Primary tasks
1. Understand what GeoLand does within ~10 seconds (home hero + services index).
2. Judge credibility: certifications, licences, named organizations, real projects.
3. Inspect a specific discipline's actual scope (services accordion).
4. Browse project evidence by category and read a project's details (register + dialog).
5. Contact GeoLand (phone, email, form, offices) — reachable in ≤2 clicks from any page.

## Real facts vs. assumptions
- **Facts**: everything in `EVIDENCE.md` — all extracted from geoland-kosova.com (2026-10-01). No founding year, staff names, client logos, awards, or statistics were published there; none appear here.
- **Assumptions**: none presented as fact. The "20+ documented projects" figure counts the projects published on the source site (28 entries in the register, deduplicated).

## Non-goals
- No e-commerce, accounts, or client portal.
- No invented testimonials, metrics, or client logos.
- No second language yet (English only; structure is translatable later).

## Content gaps (structured to accept later)
Named staff; client logo list; founding year; higher-resolution certificate scans; new job-application file (still links to the old site's DOCX); real form backend (mailto compose for now).

## Accessibility target
WCAG 2.1 AA for public-facing content: contrast audited (`scripts/contrast.py`), keyboard-complete (drawer, accordion, dialogs, form), visible focus, `prefers-reduced-motion` honored, semantics + alt text verified by `scripts/verify.py`.

## Success criteria
Visitor can answer who/what/where in 10 seconds; project evidence is filterable and readable; every public claim traces to source; no fabricated content; mobile experience intentionally composed (not stacked desktop).
