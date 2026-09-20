# folio-2026 — Current source graph

> Scope: Current application, test and project-configuration code only. This AST extraction does not prove feature completeness. Historical planning and deleted code are excluded; Git history preserves the earlier implementation.

[Interactive graph](graph.html) · [Graph JSON](graph.json) · [Current README](../README.md)

Generated: 2026-09-20T14:35:16.894305+00:00

- 45 nodes · 45 directed edges · 14 communities
- 14 current code files; repository-relative source paths with SHA-256 fingerprints
- AST extraction only: no LLM calls or API cost
- Clustering: NetworkX Louvain, seed 42, on the undirected projection
- Edge confidence: EXTRACTED: 45

## Source navigation

- [eslint.config.mjs](../eslint.config.mjs): 1 nodes
- [next.config.ts](../next.config.ts): 1 nodes
- [scripts/refresh-code-graph.py](../scripts/refresh-code-graph.py): 5 nodes
- [src/app/error.tsx](../src/app/error.tsx): 2 nodes
- [src/app/layout.tsx](../src/app/layout.tsx): 2 nodes
- [src/app/not-found.tsx](../src/app/not-found.tsx): 2 nodes
- [src/app/page.tsx](../src/app/page.tsx): 2 nodes
- [src/components/monitor/monitor-desktop.tsx](../src/components/monitor/monitor-desktop.tsx): 2 nodes
- [src/components/monitor/monitor-scene.tsx](../src/components/monitor/monitor-scene.tsx): 2 nodes
- [src/components/monitor/monitor.tsx](../src/components/monitor/monitor.tsx): 8 nodes
- [src/components/pond/koi-pond.tsx](../src/components/pond/koi-pond.tsx): 10 nodes
- [src/components/portfolio-content.tsx](../src/components/portfolio-content.tsx): 2 nodes
- [src/lib/pond.ts](../src/lib/pond.ts): 5 nodes
- [tests/pond.test.ts](../tests/pond.test.ts): 1 nodes

## Communities

### 0: koi-pond.tsx

10 nodes · edge density 0.40

- `koi-pond.tsx` — src/components/pond/koi-pond.tsx L1
- `bodyPath()` — src/components/pond/koi-pond.tsx L219
- `createBed()` — src/components/pond/koi-pond.tsx L109
- `drawKoi()` — src/components/pond/koi-pond.tsx L230
- `drawSurface()` — src/components/pond/koi-pond.tsx L374
- `ellipse()` — src/components/pond/koi-pond.tsx L27
- `KoiPond()` — src/components/pond/koi-pond.tsx L430
- `leaf()` — src/components/pond/koi-pond.tsx L86
- `randomGenerator()` — src/components/pond/koi-pond.tsx L17
- `rock()` — src/components/pond/koi-pond.tsx L42

### 1: monitor.tsx

8 nodes · edge density 0.25

- `monitor.tsx` — src/components/monitor/monitor.tsx L1
- `FlatMonitor()` — src/components/monitor/monitor.tsx L19
- `readMotion()` — src/components/monitor/monitor.tsx L15
- `SceneBoundary` — src/components/monitor/monitor.tsx L33
- `.componentDidCatch()` — src/components/monitor/monitor.tsx L41
- `.getDerivedStateFromError()` — src/components/monitor/monitor.tsx L38
- `.render()` — src/components/monitor/monitor.tsx L44
- `subscribeToMotion()` — src/components/monitor/monitor.tsx L10

### 2: refresh-code-graph.py

5 nodes · edge density 0.70

- `refresh-code-graph.py` — scripts/refresh-code-graph.py L1
- `communities_for()` — scripts/refresh-code-graph.py L60
- `main()` — scripts/refresh-code-graph.py L70
- `relative_source()` — scripts/refresh-code-graph.py L48
- `source_paths()` — scripts/refresh-code-graph.py L26

### 3: pond.ts

5 nodes · edge density 0.60

- `pond.ts` — src/lib/pond.ts L1
- `advancePond()` — src/lib/pond.ts L77
- `angleDifference()` — src/lib/pond.ts L62
- `createKoi()` — src/lib/pond.ts L17
- `disturbPond()` — src/lib/pond.ts L66

### 4: error.tsx

2 nodes · edge density 1.00

- `error.tsx` — src/app/error.tsx L1
- `ErrorPage()` — src/app/error.tsx L3

### 5: layout.tsx

2 nodes · edge density 1.00

- `layout.tsx` — src/app/layout.tsx L1
- `RootLayout()` — src/app/layout.tsx L13

### 6: not-found.tsx

2 nodes · edge density 1.00

- `not-found.tsx` — src/app/not-found.tsx L1
- `NotFound()` — src/app/not-found.tsx L2

### 7: page.tsx

2 nodes · edge density 1.00

- `page.tsx` — src/app/page.tsx L1
- `Home()` — src/app/page.tsx L4

### 8: monitor-desktop.tsx

2 nodes · edge density 1.00

- `monitor-desktop.tsx` — src/components/monitor/monitor-desktop.tsx L1
- `MonitorDesktop()` — src/components/monitor/monitor-desktop.tsx L7

### 9: monitor-scene.tsx

2 nodes · edge density 1.00

- `monitor-scene.tsx` — src/components/monitor/monitor-scene.tsx L1
- `lost()` — src/components/monitor/monitor-scene.tsx L175

### 10: portfolio-content.tsx

2 nodes · edge density 1.00

- `portfolio-content.tsx` — src/components/portfolio-content.tsx L1
- `PortfolioContent()` — src/components/portfolio-content.tsx L84

### 11: eslint.config.mjs

1 nodes · edge density 0.00

- `eslint.config.mjs` — eslint.config.mjs L1

### 12: next.config.ts

1 nodes · edge density 0.00

- `next.config.ts` — next.config.ts L1

### 13: pond.test.ts

1 nodes · edge density 0.00

- `pond.test.ts` — tests/pond.test.ts L1

## Limits and audit

- Every node refers to an existing, in-scope code file. Historical planning nodes, missing files and their edges are absent.
- Node IDs and edge endpoints are validated. Relationship directions and confidence are preserved.
- The extractor may omit JSX composition, framework routing and dynamic state relationships. A sparse or isolated node does not establish a defect.
- Name-based call inference can produce false matches. Review the source before treating a connection as runtime evidence.
- Community labels name source files; clustering and edge density are navigation aids, not quality measurements.
- CSS, documents, binary assets and generated files are outside this graph's scope.
- graph.html loads vis-network from unpkg and needs network access for its visualization library.
