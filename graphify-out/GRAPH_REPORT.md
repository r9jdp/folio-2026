# Graph Report - folio-2026  (2026-09-20)

> Scope: Current code plus 74 retained planning concepts. Source-code extraction does not prove feature completeness. Planning nodes cite the preserved original README at `planning/README.md`, rather than the updated live README. The new documentation has not undergone a fresh semantic extraction. Read the current README and `docs/development.md` for delivered scope.

[Interactive graph](graph.html) · [Graph JSON](graph.json) · [Current README](../README.md) · [Original planning source](planning/README.md)


## Corpus Check
- 34 files · ~19,538 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 178 nodes · 230 edges · 33 communities detected
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.84)
- This code-only update used AST extraction with no LLM calls. Actual usage for the original semantic run remains unavailable; see cost.json.

## Community Navigation
- [Lint configuration](#community-22---lint-configuration)
- [Next generated types](#community-23---next-generated-types)
- [Next app configuration](#community-24---next-app-configuration)
- [Offline model preparation](#community-2---offline-model-preparation)
- [Route error recovery](#community-12---route-error-recovery)
- [Document layout and metadata](#community-13---document-layout-and-metadata)
- [Route loading state](#community-14---route-loading-state)
- [Project routes and missing pages](#community-9---project-routes-and-missing-pages)
- [Showroom home route](#community-15---showroom-home-route)
- [Credits and attribution page](#community-16---credits-and-attribution-page)
- [Standard portfolio route](#community-25---standard-portfolio-route)
- [Shared project presentation](#community-17---shared-project-presentation)
- [Site navigation](#community-18---site-navigation)
- [Desktop keyboard handling](#community-19---desktop-keyboard-handling)
- [dashboard-home.tsx](#community-20---dashboard-hometsx)
- [dashboard.tsx](#community-26---dashboardtsx)
- [display-projection.ts](#community-21---display-projectionts)
- [drive-scene.tsx / drive-terrain.ts / driving.test.ts / driving.ts](#community-1---drive-scenetsx--drive-terraints--drivingtestts--drivingts)
- [driving-game.tsx](#community-4---driving-gametsx)
- [Showroom entry and recovery](#community-5---showroom-entry-and-recovery)
- [Taycan rendering and camera](#community-10---taycan-rendering-and-camera)
- [Application registry data](#community-27---application-registry-data)
- [Portfolio content data](#community-28---portfolio-content-data)
- [taycan-model.ts](#community-11---taycan-modelts)
- [Experience state and guards](#community-29---experience-state-and-guards)
- [display-projection.test.ts](#community-30---display-projectiontestts)
- [drive-terrain.test.ts](#community-31---drive-terraintestts)
- [Experience state tests](#community-32---experience-state-tests)
- [Product scope and milestones](#community-8---product-scope-and-milestones)
- [Planned rendering and endless road](#community-0---planned-rendering-and-endless-road)
- [Planned car and asset integration](#community-3---planned-car-and-asset-integration)
- [Planned runtime and audio lifecycles](#community-6---planned-runtime-and-audio-lifecycles)
- [Planned rendering and endless road](#community-0---planned-rendering-and-endless-road)

## God Nodes (most connected - your core abstractions)
1. `First playable browser milestone` - 12 edges
2. `DriveAudio` - 11 edges
3. `Linux-inspired desktop shell` - 9 edges
4. `Application registry` - 9 edges
5. `Arcade vehicle controller` - 9 edges

## Connections across communities
- `onKeyDown()` --calls--> `add()`  [INFERRED]
  src/components/experience/driving-game.tsx → scripts/prepare-taycan.mjs
- `advance()` --calls--> `stepDrive()`  [INFERRED]
  tests/driving.test.ts → src/lib/driving.ts
- `roadX()` --calls--> `roadCenter()`  [INFERRED]
  src/components/experience/drive-scene.tsx → src/lib/driving.ts

## Hyperedges (group relationships)
- **First playable proves content, dashboard, car and controls together** — readme_first_playable, readme_shared_content, readme_html_screen, readme_articulated_parts, readme_vehicle_controller [EXTRACTED 1.00]
- **Exactly one keyboard owner among desktop, embedded app, driving and arcade** — readme_input_owner, readme_desktop, readme_iframe_runtime, readme_vehicle_controller, readme_arcade [EXTRACTED 1.00]

## Communities

### Community 0 - "Planned rendering and endless road"
Cohesion: 0.13
Nodes (27): First playable browser milestone, Linux-inspired desktop shell, HTML dashboard integration, Direct portfolio and project routes, Structured portfolio content, Exclusive input ownership, Algorithm and browser verification, Application registry, About, Work, Experience, Résumé and Contact, Fermeon live application candidate (+17 more)

### Community 1 - "drive-scene.tsx / drive-terrain.ts / driving.test.ts / driving.ts"
Cohesion: 0.15
Nodes (19): drive-scene.tsx, hash(), roadX(), stripGeometry(), RoadStrip(), lost(), drive-terrain.ts, terrainColumn(), terrainHeight(), terrainSample() (+9 more)

### Community 2 - "Offline model preparation"
Cohesion: 0.23
Nodes (16): prepare-taycan.mjs, constructor(), readAsArrayBuffer(), add(), drive-audio.ts, DriveAudio, .unlock(), .update(), .setMuted(), .suspend() (+6 more)

### Community 3 - "Planned car and asset integration"
Cohesion: 0.14
Nodes (15): Showroom and cabin entry, Three.js through React Three Fiber, Selected Drei utilities, Single scroll/timeline system, Concept Taycan source model, Historical concept asset findings, Blender and glTF Transform workflow, Moving car parts and screen anchors, Per-asset provenance manifest, Candidate lighting, road and scenery assets (+5 more)

### Community 4 - "driving-game.tsx"
Cohesion: 0.18
Nodes (13): driving-game.tsx, readBestDistance(), isInteractive(), DriveBoundary, .getDerivedStateFromError(), .componentDidCatch(), .render(), onKeyDown(), onKeyUp(), onVisibility() (+3 more)

### Community 5 - "Showroom entry and recovery"
Cohesion: 0.22
Nodes (11): showroom.tsx, SceneBoundary, .getDerivedStateFromError(), .componentDidCatch(), .render(), subscribeQuery(), subscribeCompact(), subscribeReduced(), getCompact(), getReduced() (+1 more)

### Community 6 - "Planned runtime and audio lifecycles"
Cohesion: 0.25
Nodes (11): Experience mode transitions, Explicit start/pause/dispose lifecycles, Start Drive readiness gate, Portfolio return and explicit resume, Small typed shared state store, Mesh, scenery and collider recycling, Covered studio-to-track transition, Shared Web Audio context and mixer, Background and mode audio suspension, Unmeasured initial performance targets (+1 more)

### Community 7 - "Planned rendering and endless road"
Cohesion: 0.24
Nodes (11): Rapier through React Three Rapier, Fixed-step simulation and UI separation, Arcade vehicle controller, Finite handling test track, Bounded endless road system, Deterministic constrained segments, Coordinated world-coordinate rebasing, Position-independent logical distance, Versioned local driving records, Rebasing limits long-drive precision loss (+1 more)

### Community 8 - "Product scope and milestones"
Cohesion: 0.2
Nodes (10): Taycan portfolio specification, Approved concept; application unscaffolded, Developer and founder portfolio, Next.js, React and TypeScript layer, Client-side subsystem boundaries, TryDonna framing-blocked candidate, Scoped embedding and frame policies, Pending implementation phases 0–6, Unresolved implementation and release choices, CORS does not grant iframe framing permission

### Community 9 - "Project routes and missing pages"
Cohesion: 0.33
Nodes (6): not-found.tsx, NotFound(), page.tsx, generateStaticParams(), generateMetadata(), ProjectPage()

### Community 10 - "Taycan rendering and camera"
Cohesion: 0.5
Nodes (5): taycan-scene.tsx, clamp(), smooth(), Car(), RendererRecovery()

### Community 11 - "taycan-model.ts"
Cohesion: 0.67
Nodes (3): taycan-model.ts, cloneTaycan(), disposeTaycanMaterials()

### Community 12 - "Route error recovery"
Cohesion: 1.0
Nodes (2): error.tsx, ErrorPage()

### Community 13 - "Document layout and metadata"
Cohesion: 1.0
Nodes (2): layout.tsx, RootLayout()

### Community 14 - "Route loading state"
Cohesion: 1.0
Nodes (2): loading.tsx, Loading()

### Community 15 - "Showroom home route"
Cohesion: 1.0
Nodes (2): page.tsx, HomePage()

### Community 16 - "Credits and attribution page"
Cohesion: 1.0
Nodes (2): page.tsx, CreditsPage()

### Community 17 - "Shared project presentation"
Cohesion: 1.0
Nodes (2): project-content.tsx, ProjectMark()

### Community 18 - "Site navigation"
Cohesion: 1.0
Nodes (2): site-header.tsx, SiteHeader()

### Community 19 - "Desktop keyboard handling"
Cohesion: 1.0
Nodes (2): desktop.tsx, onKey()

### Community 20 - "dashboard-home.tsx"
Cohesion: 1.0
Nodes (2): dashboard-home.tsx, goHome()

### Community 21 - "display-projection.ts"
Cohesion: 1.0
Nodes (2): display-projection.ts, quadTransform()

### Community 22 - "Lint configuration"
Cohesion: 1.0
Nodes (1): eslint.config.mjs

### Community 23 - "Next generated types"
Cohesion: 1.0
Nodes (1): next-env.d.ts

### Community 24 - "Next app configuration"
Cohesion: 1.0
Nodes (1): next.config.ts

### Community 25 - "Standard portfolio route"
Cohesion: 1.0
Nodes (1): page.tsx

### Community 26 - "dashboard.tsx"
Cohesion: 1.0
Nodes (1): dashboard.tsx

### Community 27 - "Application registry data"
Cohesion: 1.0
Nodes (1): apps.ts

### Community 28 - "Portfolio content data"
Cohesion: 1.0
Nodes (1): portfolio.ts

### Community 29 - "Experience state and guards"
Cohesion: 1.0
Nodes (1): experience.ts

### Community 30 - "display-projection.test.ts"
Cohesion: 1.0
Nodes (1): display-projection.test.ts

### Community 31 - "drive-terrain.test.ts"
Cohesion: 1.0
Nodes (1): drive-terrain.test.ts

### Community 32 - "Experience state tests"
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
- **Thin community `dashboard-home.tsx`** (2 nodes): `dashboard-home.tsx`, `goHome()`
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
- **Thin community `drive-terrain.test.ts`** (1 nodes): `drive-terrain.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Experience state tests`** (1 nodes): `experience.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `First playable browser milestone` connect `Planned rendering and endless road` to `Product scope and milestones`, `Planned car and asset integration`, `Planned runtime and audio lifecycles`, `Planned rendering and endless road`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `Arcade vehicle controller` connect `Planned rendering and endless road` to `Planned rendering and endless road`, `Planned car and asset integration`, `Planned runtime and audio lifecycles`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
## Audit notes

- Graph structure validated: unique IDs, valid edge endpoints, and both planning group relationships retained.
- Source paths are repository-relative. JSON includes fingerprints for sources.
- Directions are retained in `_src`/`_tgt`; clustering uses an undirected projection.
- Cohesion is edge density, not implementation quality.
- benchmark.json is the historical 74-node planning-graph estimate; it does not measure this combined graph.
- The HTML uses vis-network from unpkg and requires internet access for that visualization library.
