# Ahmed Samer — Digital Engineering Studio

A buildless portfolio in HTML, CSS, and JavaScript. No runtime dependencies, framework, font service, or bundler.

## Run locally

```sh
python -m http.server 8081 --bind 127.0.0.1
```

Open http://127.0.0.1:8081/. The files also work directly from disk; live GitHub data requires network access.

## Experience

- Living Blueprint: choose Interview Intelligence, LeadAtlas, or DefleX and explore their documented interface, system, and intelligence layers.
- Eight filterable projects, differentiated concept artwork, native expandable engineering notes, and preserved repository links.
- Editorial story, connected career timeline, illustrated technical ecosystem, achievements, and contact.
- Responsive navigation, keyboard focus and skip link, reduced-motion support, finite entrances, and pointer-only depth effects.
- Printable `resume.html`, drawn entirely from existing professional information.
- Lazy public GitHub profile/events from the official API, with honest empty/error states. The original third-party contribution graph returned HTTP 402, so full contribution history is linked on GitHub.
- Codeforces and LeetCode images load only when their optional disclosure is opened. Direct profile links remain usable if the services fail or JavaScript is disabled.

## Source map

- `index.html`: semantic content and custom SVG artwork.
- `styles.css`: design tokens, layouts, responsive rules, motion and print styling.
- `script.js`: navigation, progress and project filtering.
- `blueprint.js`: project-aware signature interaction; uses only documented facts.
- `motion.js`: finite entrances, pointer depth, reduced-motion changes and cleanup.
- `activity.js`: lazy optional public data, bounded requests, validation and fallbacks.
- `assets/`: locally stored technology icons, favicon and social image. Icon source/license are in `assets/icons/`.
- `docs/`: audit, creative direction, validation and screenshots.

## Content and deployment

GitHub Pages can serve these files directly from the branch root; `.nojekyll` is retained. No build command is needed. Nothing is automatically pushed or deployed by this repository.

Update professional details in `index.html` and `resume.html` together. Keep the small project summaries in `blueprint.js` synchronized. All project visuals are labeled conceptual; they are not product screenshots. No email address or original PDF resume was supplied, so contact uses the existing professional channels.

Before deploying to a confirmed public domain, set an absolute `og:image` / `twitter:image` URL for `assets/social-card.png` and add the matching canonical URL. Relative image metadata is kept portable until the destination is confirmed. Check field Core Web Vitals after deployment; local tests cannot certify production performance.

## Validation

```sh
python tools/verify_site.py
node --test tests/activity.test.cjs
```

The integrity check uses Python's standard library and Node's syntax checker. It validates local assets, anchors, metadata, project count, preserved external destinations and safe SVGs. No lint, TypeScript, or production build pipeline exists because this is a buildless JavaScript site. Browser checks and limitations are recorded in `docs/validation.md`.
