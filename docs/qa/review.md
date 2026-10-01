# Creative-director review — GeoLand Kosova rebuild

Date: 2026-10-01 · Reviewed against the brief's §17 checklist and full screenshot set (docs/qa/screenshots).

## Findings and actions

1. **Scrolled nav let content ghost through** (visible on dark sections and mobile) → made `.site-nav.is-scrolled` a solid `--paper` background. Fixed.
2. **Orange text on paper measured 2.5:1** (section indices, fact values, small mono labels) → introduced `--orange-2: #a94f00` (5.04:1 on paper) for all text accents and UI indicators on light surfaces; `--orange` stays for fills on dark and the wordmark. Fixed.
3. **Input focus/error borders and active filter borders used bright orange** (2.5:1, below 3:1 for UI indicators) → switched to `--orange-2`; dark sections and footer keep bright orange focus rings (6.98:1). Fixed.
4. **Floating project preview could not animate `transform` cleanly** (CSS translate/scale conflicted with JS follow) → moved positioning fully to JS (`translate3d`), opacity-only CSS transition. Fixed.
5. **`hidden` rows still rendered** because `.proj-row{display:grid}` overrode the UA `[hidden]` rule → added `[hidden]{display:none!important}`. Fixed.
6. **Mobile drawer/backdrop and dialog focus handling** verified by automated tests (Esc, backdrop, focus return). No change needed.
7. **Authenticity check** — all copy re-read against source: no invented stats, clients, staff names, equipment or dates. Brezovica image is GeoLand's own expropriation map; Airbus table copied from their published product page; 1 cm/pixel claim attributed as GeoLand's published claim. Verified.
8. **AI-slop scan** — no gradients, glassmorphism, glows, stock people, fake logos or emoji; imagery is GeoLand's own fieldwork and outputs. Passed.
9. **Typography and spacing** — Schibsted Grotesk display at fluid scale with hairline rules; section rhythm alternates paper/paper-2/ink; mono metadata carries the technical voice. Kept.
10. **Animation restraint** — reveals on scroll, hero draw/coordinate stagger, accordion, dialog, preview follow; all transform/opacity, all disabled under `prefers-reduced-motion`. Kept.
11. **Brezovica feature image retains its document margins** — judged authentic (a real expropriation map), kept as-is with left-aligned crop.
12. **Table scroll affordance on mobile** — `.table-scroll` is focusable with `role="region"` and aria-label; horizontal cut indicates scrollability. Kept.

## Residual follow-ups (documented, not hidden)
- Contact form composes a mailto: — a server endpoint can replace it later without markup changes.
- Job application DOCX still points at the old site until a new file is provided.
- Client logo list and individual staff names are absent at source; the layout accepts them later (clients list is text-based by design).
- `404.html` requires server configuration; not in scope for the static bundle.
