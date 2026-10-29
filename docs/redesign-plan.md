# Digital Engineering Studio

## Goal and baseline

Redesign Ahmed Samer's portfolio as an editorial engineering studio while keeping the existing static HTML, CSS, JavaScript, GitHub Pages deployment model, professional information, nine projects, and external profile/repository links.

Baseline: commit `3094c79`, clean `main`; four source/documentation files and `.nojekyll`; no packages, build, lint, type-check, or test tooling. Desktop baseline captured in `screenshots/baseline-desktop.png` before changes.

The existing site repeats rounded, translucent cards across almost every section. Gradient headlines and a typing loop compete with the content. The large hero pushes its actions below the first screen. Selected work follows a long career section and gives private products no visual explanation. Navigation disappears below 980px without a replacement. Content starts invisible until JavaScript reveals it. GitHub failure invents a `10+` repository count. Remote statistics images have no robust failure treatment. There is no skip link, filter state announcement, local resume, or social image.

## Direction and constraints

An engineering field journal: near-black ink, warm ivory, acid-lime signal, hairline rules, large tightly set editorial headings, monospace annotations, and a recurring four-point node motif. Deliberate asymmetry and open space replace repeated containers. Native SVG diagrams explain systems; they are explicitly conceptual, never presented as product screenshots or live telemetry.

System fonts keep the initial render independent of font services. CSS and native browser APIs handle motion. No framework, animation library, canvas runtime, backend, or deployment change is needed. One carefully composed dark theme is intentional, as allowed by the brief. Avoid invented claims, metrics, ownership details, email addresses, and product URLs. A printable HTML resume uses only existing information.

Alternatives: a 3D scene adds runtime weight without clarifying the engineer's work; a generic dashboard mockup risks implying nonexistent UI; a framework migration adds maintenance without a functional requirement. All are rejected.

## Phases and commits

1. Audit and strategy: capture baseline and record this plan.
2. Foundations: establish tokens, readable primitives, responsive sticky navigation, skip link, and progressive enhancement.
3. Hero: oversized introduction, accessible interactive system diagram, work/contact/resume actions.
4. Work: full-width Interview Intelligence feature, contrasting LeadAtlas feature, differentiated secondary work and filterable archive; native engineering-note disclosures.
5. Story: editorial about/principles, career timeline, grouped stack, achievements, education, activity, contact, printable resume.
6. Polish: purposeful entrances, progress, hover/focus states, reduced motion, resilient optional remote stats, favicon and social metadata.
7. Validation: source/asset checks, syntax checks, desktop/mobile browser workflows, keyboard and failure checks; documentation and evidence.

Each phase is committed in a working state. Implementation remains local; no push or deployment is requested.

## Validation and realistic risks

Validate native navigation, mobile menu/Escape/focus, all project filters, disclosures, diagram selection, resume, and external-link preservation. Inspect 320px, 390px, 768px, and desktop layout for overflow. Check reduced-motion CSS, progressive enhancement, focus visibility, headings, link labels and contrast. Record actual browser checks separately from source-level checks. Run JavaScript syntax and static site integrity checks; do not manufacture a build or TypeScript pipeline for buildless JavaScript.

Remote GitHub and statistic services may fail; keep primary content usable, show unavailable data honestly, reserve image space, and retain profile links. Browser or network restrictions may limit external checks. Production Core Web Vitals require measurements after deployment and cannot be certified by local inspection.
