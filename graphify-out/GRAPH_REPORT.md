# Graph Report - folio-2026  (2026-09-13)

> Scope: Current code plus 74 retained planning concepts. Source-code extraction does not prove feature completeness. Planning nodes cite the preserved original README at `planning/README.md`, rather than the updated live README. The new documentation has not undergone a fresh semantic extraction. Read the current README and `docs/development.md` for delivered scope.

[Interactive graph](graph.html) · [Graph JSON](graph.json) · [Current README](../README.md) · [Original planning source](planning/README.md)


## Corpus Check
- 26 files · ~10,809 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 127 nodes · 158 edges · 30 communities detected
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.86)
- This code-only update used AST extraction with no LLM calls. Actual usage for the original semantic run remains unavailable; see cost.json.

## Community Navigation
- [Lint configuration](#community-20---lint-configuration)
- [Next generated types](#community-21---next-generated-types)
- [Next app configuration](#community-22---next-app-configuration)
- [Offline model preparation](#community-9---offline-model-preparation)
- [Route error recovery](#community-10---route-error-recovery)
- [Document layout and metadata](#community-11---document-layout-and-metadata)
- [Route loading state](#community-12---route-loading-state)
- [Project routes and missing pages](#community-7---project-routes-and-missing-pages)
- [Showroom home route](#community-13---showroom-home-route)
- [Credits and attribution page](#community-14---credits-and-attribution-page)
- [Standard portfolio route](#community-23---standard-portfolio-route)
- [Shared project presentation](#community-15---shared-project-presentation)
- [Site navigation](#community-16---site-navigation)
- [Desktop keyboard handling](#community-17---desktop-keyboard-handling)
- [dashboard-home.tsx](#community-18---dashboard-hometsx)
- [dashboard.tsx](#community-24---dashboardtsx)
- [display-projection.ts](#community-19---display-projectionts)
- [Showroom entry and recovery](#community-5---showroom-entry-and-recovery)
- [Taycan rendering and camera](#community-8---taycan-rendering-and-camera)
- [Application registry data](#community-25---application-registry-data)
- [Portfolio content data](#community-26---portfolio-content-data)
- [Experience state and guards](#community-27---experience-state-and-guards)
- [display-projection.test.ts](#community-28---display-projectiontestts)
- [Experience state tests](#community-29---experience-state-tests)
- [Product scope and milestones](#community-1---product-scope-and-milestones)
- [Planned desktop and applications](#community-6---planned-desktop-and-applications)
- [Planned runtime and audio lifecycles](#community-3---planned-runtime-and-audio-lifecycles)
- [Planned rendering and endless road](#community-0---planned-rendering-and-endless-road)
- [Planned car and asset integration](#community-2---planned-car-and-asset-integration)
- [Planned desktop and applications](#community-6---planned-desktop-and-applications)

## God Nodes (most connected - your core abstractions)
1. `First playable browser milestone` - 12 edges
2. `Linux-inspired desktop shell` - 9 edges
3. `Application registry` - 9 edges
4. `Arcade vehicle controller` - 9 edges
5. `Direct portfolio and project routes` - 8 edges

## Connections across communities
- `NotFound()` --calls--> `ProjectPage()`  [INFERRED]
  src/app/not-found.tsx → src/app/projects/[slug]/page.tsx

## Hyperedges (group relationships)
- **First playable proves content, dashboard, car and controls together** — readme_first_playable, readme_shared_content, readme_html_screen, readme_articulated_parts, readme_vehicle_controller [EXTRACTED 1.00]
- **Exactly one keyboard owner among desktop, embedded app, driving and arcade** — readme_input_owner, readme_desktop, readme_iframe_runtime, readme_vehicle_controller, readme_arcade [EXTRACTED 1.00]

## Communities

### Community 0 - "Planned rendering and endless road"
Cohesion: 0.13
Nodes (22): Exclusive input ownership, Explicit start/pause/dispose lifecycles, Rapier through React Three Rapier, Algorithm and browser verification, Fixed-step simulation and UI separation, Parent-owned Return/Close controls, Arcade vehicle controller, Finite handling test track, Keyboard and touch driving controls, Bounded endless road system (+12 more)

### Community 1 - "Product scope and milestones"
Cohesion: 0.18
Nodes (13): Taycan portfolio specification, Approved concept; application unscaffolded, Developer and founder portfolio, First playable browser milestone, Direct portfolio and project routes, Structured portfolio content, Next.js, React and TypeScript layer, Client-side subsystem boundaries, Meetly optional disabled launcher, Pending implementation phases 0–6 (+3 more)

### Community 2 - "Planned car and asset integration"
Cohesion: 0.17
Nodes (13): Three.js through React Three Fiber, Selected Drei utilities, Concept Taycan source model, Historical concept asset findings, Blender and glTF Transform workflow, Per-asset provenance manifest, Prepared runtime assets and source storage, Candidate lighting, road and scenery assets, Audio provenance and synthesized first pass, Doom runtime and release-content decision (+3 more)

### Community 3 - "Planned runtime and audio lifecycles"
Cohesion: 0.28
Nodes (9): Experience mode transitions, Start Drive readiness gate, Portfolio return and explicit resume, Small typed shared state store, Moving car parts and screen anchors, Covered studio-to-track transition, Shared Web Audio context and mixer, Responsive electric-car sound layers, Background and mode audio suspension

### Community 4 - "Planned desktop and applications"
Cohesion: 0.31
Nodes (9): Application registry, Fermeon live application candidate, TryDonna framing-blocked candidate, ClawIN live application candidate, Lazy live iframe integration, Scoped embedding and frame policies, Real iframe flow tests and recovery, CORS does not grant iframe framing permission, Iframe load is not proof of a usable app

### Community 5 - "Showroom entry and recovery"
Cohesion: 0.25
Nodes (8): showroom.tsx, SceneBoundary, .getDerivedStateFromError(), .componentDidCatch(), .render(), subscribeCompact(), getCompactSnapshot(), Showroom()

### Community 6 - "Planned desktop and applications"
Cohesion: 0.32
Nodes (8): Showroom and cabin entry, Linux-inspired desktop shell, HTML dashboard integration, Single scroll/timeline system, About, Work, Experience, Résumé and Contact, Accessible and resilient visitor paths, Maximised and small-screen flat views, Cross-origin websites require a real HTML surface

### Community 7 - "Project routes and missing pages"
Cohesion: 0.33
Nodes (6): not-found.tsx, NotFound(), page.tsx, generateStaticParams(), generateMetadata(), ProjectPage()

### Community 8 - "Taycan rendering and camera"
Cohesion: 0.5
Nodes (5): taycan-scene.tsx, clamp(), smooth(), Car(), TaycanScene()

### Community 9 - "Offline model preparation"
Cohesion: 0.5
Nodes (4): prepare-taycan.mjs, constructor(), readAsArrayBuffer(), add()

### Community 10 - "Route error recovery"
Cohesion: 1.0
Nodes (2): error.tsx, ErrorPage()

### Community 11 - "Document layout and metadata"
Cohesion: 1.0
Nodes (2): layout.tsx, RootLayout()

### Community 12 - "Route loading state"
Cohesion: 1.0
Nodes (2): loading.tsx, Loading()

### Community 13 - "Showroom home route"
Cohesion: 1.0
Nodes (2): page.tsx, HomePage()

### Community 14 - "Credits and attribution page"
Cohesion: 1.0
Nodes (2): page.tsx, CreditsPage()

### Community 15 - "Shared project presentation"
Cohesion: 1.0
Nodes (2): project-content.tsx, ProjectMark()

### Community 16 - "Site navigation"
Cohesion: 1.0
Nodes (2): site-header.tsx, SiteHeader()

### Community 17 - "Desktop keyboard handling"
Cohesion: 1.0
Nodes (2): desktop.tsx, onKey()

### Community 18 - "dashboard-home.tsx"
Cohesion: 1.0
Nodes (2): dashboard-home.tsx, launch()

### Community 19 - "display-projection.ts"
Cohesion: 1.0
Nodes (2): display-projection.ts, quadTransform()

### Community 20 - "Lint configuration"
Cohesion: 1.0
Nodes (1): eslint.config.mjs

### Community 21 - "Next generated types"
Cohesion: 1.0
Nodes (1): next-env.d.ts

### Community 22 - "Next app configuration"
Cohesion: 1.0
Nodes (1): next.config.ts

### Community 23 - "Standard portfolio route"
Cohesion: 1.0
Nodes (1): page.tsx

### Community 24 - "dashboard.tsx"
Cohesion: 1.0
Nodes (1): dashboard.tsx

### Community 25 - "Application registry data"
Cohesion: 1.0
Nodes (1): apps.ts

### Community 26 - "Portfolio content data"
Cohesion: 1.0
Nodes (1): portfolio.ts

### Community 27 - "Experience state and guards"
Cohesion: 1.0
Nodes (1): experience.ts

### Community 28 - "display-projection.test.ts"
Cohesion: 1.0
Nodes (1): display-projection.test.ts

### Community 29 - "Experience state tests"
Cohesion: 1.0
Nodes (1): experience.test.ts

## Knowledge Gaps
- **17 sparsely connected node(s):** `Approved concept; application unscaffolded`, `Developer and founder portfolio`, `Single scroll/timeline system`, `Rapier through React Three Rapier`, `Client-side subsystem boundaries` (+12 more)
  These have ≤1 connection in this extraction. The code extractor does not capture all JSX composition, state usage or runtime behavior; low degree alone is not a defect.
- **Thin community `Lint configuration`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next generated types`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next app configuration`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Route error recovery`** (2 nodes): `error.tsx`, `ErrorPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Document layout and metadata`** (2 nodes): `layout.tsx`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Route loading state`** (2 nodes): `loading.tsx`, `Loading()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Showroom home route`** (2 nodes): `page.tsx`, `HomePage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Credits and attribution page`** (2 nodes): `page.tsx`, `CreditsPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Standard portfolio route`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Shared project presentation`** (2 nodes): `project-content.tsx`, `ProjectMark()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Site navigation`** (2 nodes): `site-header.tsx`, `SiteHeader()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Desktop keyboard handling`** (2 nodes): `desktop.tsx`, `onKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `dashboard-home.tsx`** (2 nodes): `dashboard-home.tsx`, `launch()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `dashboard.tsx`** (1 nodes): `dashboard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `display-projection.ts`** (2 nodes): `display-projection.ts`, `quadTransform()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Application registry data`** (1 nodes): `apps.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Portfolio content data`** (1 nodes): `portfolio.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Experience state and guards`** (1 nodes): `experience.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `display-projection.test.ts`** (1 nodes): `display-projection.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Experience state tests`** (1 nodes): `experience.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `First playable browser milestone` connect `Product scope and milestones` to `Planned rendering and endless road`, `Planned car and asset integration`, `Planned runtime and audio lifecycles`, `Planned desktop and applications`, `Planned desktop and applications`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `Arcade vehicle controller` connect `Planned rendering and endless road` to `Planned runtime and audio lifecycles`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
## Audit notes

- Graph structure validated: unique IDs, valid edge endpoints, and both planning group relationships retained.
- Source paths are repository-relative. JSON includes fingerprints for sources.
- Directions are retained in `_src`/`_tgt`; clustering uses an undirected projection.
- Cohesion is edge density, not implementation quality.
- benchmark.json is the historical 74-node planning-graph estimate; it does not measure this combined graph.
- The HTML uses vis-network from unpkg and requires internet access for that visualization library.
