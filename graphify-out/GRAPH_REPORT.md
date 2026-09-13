# Graph Report - folio-2026  (2026-09-13)

> Scope: one planning document, README.md. All application features remain planned; this graph is not an analysis of implemented code. EXTRACTED means explicitly stated in the README, not independently verified. The dated iframe observations were not rechecked in this run. Cross-community connections are within this document, not discoveries across independent sources.

[Interactive graph](graph.html) · [Graph data](graph.json) · [Source README](../README.md)


## Corpus Check
- Corpus is ~5,262 words - fits in a single context window. You may not need a graph.

## Summary
- 74 nodes · 128 edges · 8 communities detected
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.87)
- Token usage / cost: provider-metered counts and monetary cost are unavailable. Text-size estimates only: ~9,399 source tokens and ~16,294 extraction JSON tokens (characters / 4). These exclude instructions, reasoning, tools and retries; they are not billing totals.

## Community Navigation
- [Runtime modes and lifecycles](#community-0---runtime-modes-and-lifecycles)
- [Assets and rendering preparation](#community-1---assets-and-rendering-preparation)
- [Embedded apps and arcade](#community-2---embedded-apps-and-arcade)
- [Desktop interaction and accessibility](#community-3---desktop-interaction-and-accessibility)
- [Content architecture and loading](#community-4---content-architecture-and-loading)
- [Scope and implementation milestones](#community-5---scope-and-implementation-milestones)
- [Endless road and distance](#community-6---endless-road-and-distance)
- [Car animation and handling](#community-7---car-animation-and-handling)

## God Nodes (most connected - your core abstractions)
1. `First playable browser milestone` - 12 edges
2. `Linux-inspired desktop shell` - 9 edges
3. `Application registry` - 9 edges

## Surprising Connections (inferred across planning topics)

- Audio suspension and input ownership share focus-loss and mode-change triggers. [INFERRED 0.90; README.md:87; README.md:349]
- World-coordinate rebasing needs coordinated physics and render-state updates. [INFERRED 0.84; README.md:128; README.md:331]
- Flat-screen views need the same live-app usability and recovery checks as the cabin display. [INFERRED 0.82; README.md:257; README.md:299-302]

## Hyperedges (group relationships)
- **First playable proves content, dashboard, car and controls together** — readme_first_playable, readme_shared_content, readme_html_screen, readme_articulated_parts, readme_vehicle_controller [EXTRACTED 1.00]
- **Exactly one keyboard owner among desktop, embedded app, driving and arcade** — readme_input_owner, readme_desktop, readme_iframe_runtime, readme_vehicle_controller, readme_arcade [EXTRACTED 1.00]

## Communities

### Community 0 - "Runtime modes and lifecycles"
Cohesion: 0.21
Nodes (13): Shared Web Audio context and mixer, Background and mode audio suspension, Explicit start/pause/dispose lifecycles, Unmeasured initial performance targets, Visibility does not stop active subsystems, Per-frame React rerenders are avoidable, Mesh, scenery and collider recycling, Portfolio return and explicit resume (+5 more)

### Community 1 - "Assets and rendering preparation"
Cohesion: 0.18
Nodes (12): Per-asset provenance manifest, Blender and glTF Transform workflow, Responsive electric-car sound layers, Audio provenance and synthesized first pass, Candidate lighting, road and scenery assets, Concept Taycan source model, Historical concept asset findings, Doom runtime and release-content decision (+4 more)

### Community 2 - "Embedded apps and arcade"
Cohesion: 0.23
Nodes (12): Optional Doom Arcade application, ClawIN live application candidate, Fermeon live application candidate, Lazy live iframe integration, Real iframe flow tests and recovery, Parent-owned Return/Close controls, Iframe load is not proof of a usable app, CORS does not grant iframe framing permission (+4 more)

### Community 3 - "Desktop interaction and accessibility"
Cohesion: 0.27
Nodes (10): Accessible and resilient visitor paths, Linux-inspired desktop shell, Keyboard and touch driving controls, HTML dashboard integration, Exclusive input ownership, About, Work, Experience, Résumé and Contact, Cross-origin websites require a real HTML surface, Named-device profiling and sustained-drive evidence (+2 more)

### Community 4 - "Content architecture and loading"
Cohesion: 0.25
Nodes (8): Next.js, React and TypeScript layer, Client-side subsystem boundaries, Direct portfolio and project routes, Meetly optional disabled launcher, HTML-first staged loading, Useful content must precede immersion, Prepared runtime assets and source storage, Structured portfolio content

### Community 5 - "Scope and implementation milestones"
Cohesion: 0.33
Nodes (7): First playable browser milestone, Approved concept; application unscaffolded, Taycan portfolio specification, Developer and founder portfolio, Prove integrated interactions before expansion, Unresolved implementation and release choices, Pending implementation phases 0–6

### Community 6 - "Endless road and distance"
Cohesion: 0.47
Nodes (6): Bounded endless road system, Versioned local driving records, Position-independent logical distance, Rebasing limits long-drive precision loss, Deterministic constrained segments, Coordinated world-coordinate rebasing

### Community 7 - "Car animation and handling"
Cohesion: 0.33
Nodes (6): Single scroll/timeline system, Moving car parts and screen anchors, Finite handling test track, Rapier through React Three Rapier, Showroom and cabin entry, Arcade vehicle controller

## Knowledge Gaps
- **17 sparsely connected node(s):** `Approved concept; application unscaffolded`, `Developer and founder portfolio`, `Single scroll/timeline system`, `Rapier through React Three Rapier`, `Client-side subsystem boundaries` (+12 more)
  These have ≤1 connection in this extraction. Low degree alone does not establish missing requirements.

## Suggested Questions
_Questions to trace through the plan:_

- **What must the first playable prototype prove across the car, desktop, apps and runtime modes?**
  _High betweenness centrality (0.248) - this node is a cross-community bridge._
- **How does the vehicle controller connect driving, audio, input ownership and the endless road?**
  _High betweenness centrality (0.187) - this node is a cross-community bridge._

## Evidence and limitations

- Node and edge locations use README.md line numbers. They refer to the source fingerprint below.
- Relationship directions are retained in `_src` / `_tgt`; community detection uses an undirected projection.
- Confidence scores describe extraction/inference certainty, not runtime readiness or implementation completion.
- Louvain clustering (NetworkX, seed 42) is used because optional Leiden dependencies are not installed. Cohesion is edge density, not a quality/completeness score.
- All detected supported input was processed: one document; no code, image, paper or video input.
- The graph is a navigation aid for a small corpus. Consult the README for complete requirements and caveats.

Source SHA-256: `868ed6cbe048cfa34a2a5c2c2185cb1caaa7bdb3bc1d24c6293d598a2cb7aab7`.

## Query-context benchmark

Estimated full-corpus context: ~7,016 tokens. Mean sampled query context: ~3,232 tokens; ~2.2× smaller.

These are heuristic text-size estimates on graphify sample queries, not measured billing savings or a benchmark of answer quality. Initial extraction effort is not included.

## Using these outputs

Open `graph.html` in a browser. Search for a concept, select a result, follow its neighbors, or toggle a community. Scroll to zoom and drag to move around the graph. The inspector displays the source lines and planning status. The HTML currently needs internet access to load vis-network from unpkg; graph data is embedded locally and is not sent to a graph service.

Browser verification covered rendering, search, node inspection, neighbor navigation and community visibility. The generated HTML includes a fix for escaped neighbor links and displays source provenance; the installed Graphify package was not changed.

`graph.json` retains descriptions, confidence scores, source locations, community IDs, directions and group relationships. `audit.json` records the structural checks; `benchmark.json` records heuristic query-context estimates. `cost.json` records unavailable actual usage as null, with estimates separately labeled. The semantic cache and manifest support a later Graphify update.
