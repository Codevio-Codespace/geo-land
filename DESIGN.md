# DESIGN.md — GeoLand Kosova website

## Art direction (one sentence)
A survey instrument, not a brochure: document-like registers, measured typography and GeoLand's own fieldwork imagery, organized by the same grid discipline the company sells.

## Brand attributes
Precise · technical · regional (Kosovo/Balkans) · established · understated.

## Anti-references
Dark-neon SaaS, purple gradients, glassmorphism, glowing blobs, stock-photo grids, oversized slogan typography, hover-everything animation.

## Palette (sampled from the GeoLand logo)
| Token | Value | Role |
|---|---|---|
| `--ink` | `#06120e` | text, dark bands, footer |
| `--green` / `--green-2` | `#004820` / `#0a5c5a` | links hover, wordmark, secondary accents |
| `--orange` | `#f87800` | brand accent: CTAs, markers, dark-section highlights |
| `--orange-2` / `--orange-hover` | `#a94f00` / `#e06e00` | accessible text accents on light (5.04:1); hover fills |
| `--paper` / `--paper-2` / `--paper-3` | `#f4f5f0` / `#e8eae2` / `#dde0d5` | light surfaces, alternating bands |
| `--sage` | `#c8d8d0` | contour lines, quiet backgrounds |
| `--muted` / `--muted-dark` | `#56605a` / `#9aa8a0` | secondary text on light / dark |

Rule: orange ≤5% of surface area; no gradients anywhere.

## Typography (role-based)
- **Display** — Schibsted Grotesk 600/650 (fluent clamp scale, `-0.02em`). Rationale: engineering neutral, avoids the overused default display faces.
- **Body** — Instrument Sans 400/500, 68ch measure. Rationale: humanist clarity for long service/project copy.
- **Data** — IBM Plex Mono 400/500 for coordinates, indices, labels, metadata. Rationale: instrument readouts; the technical voice.

## Grid, spacing, surfaces
12-col container 1280px, fluid gutter `clamp(1.25rem,4vw,3rem)`; spacing scale 4→128px (`--s-1…--s-10`); section rhythm `clamp(4.5rem,8vw,8.5rem)`; alternating `paper` / `paper-2` / `ink` bands. Radius 2px everywhere; 1px hairlines; **no elevation** except dialogs/lightbox.

## Imagery direction
Only GeoLand's own material (downloaded from the source site, optimized to WebP+JPEG). Documents and screenshots (cadastral maps, GIS views, KFIS) are treated as documents — left-aligned crops, visible margins allowed; photographs (fieldwork, UAV) are treated as photography — cover crops. No duotones, no overlays, no floating cards.

## Motion law (rationale required per pattern)
| Motion | Why it exists |
|---|---|
| Hero entry (stagger + contour draw) | First impression of the brand's measurement language; scoped to the hero only |
| Scroll reveal on section heads + media | Sequence: marks progress through the register; deliberately NOT on routine rows/cards |
| Accordion panel (grid-rows) | Communicates open/closed state |
| Dialog / lightbox transitions | Spatial continuity between list and detail |
| Project preview follow (desktop only) | Pointer continuity between register row and its evidence |
| Reduced-motion | All transforms removed; reveals resolve instantly |

No parallax, no bounce/spring, no loops (except the one-shot hero contour), no scroll-jacking.

## Component vocabulary
Nav + drawer · section head (`[NN]` index + eyebrow + fact-bearing meta) · register rows (projects, systems) · accordion (services) · dialog · lightbox · facts strip · timeline · document cards (team/cert) · CTA band · form. Cards are used only where content is genuinely card-like (people, certificates); registers are used where content is a list of records.

## Responsive principles
Breakpoints from content failure: 1024px (nav → drawer, grids collapse), 720px (register rows re-compose, two-col forms stack). Mobile re-composes rather than stacks: register rows keep index+title hierarchy, service accordions keep the numbered spine, the Airbus table becomes a labelled scroll region. Verified at 390/768/1024/1440 + no horizontal overflow (`scripts/verify.py`).

## Intentional exceptions
- Orange wordmark on paper (2.5:1) — logo/brand exception, WCAG 1.4.3 exempts logotypes.
- Identical CTA band across pages — wayfinding consistency; secondary action varies by page.
- Repeated section-head pattern — a drawing-sheet system, not a component default.
