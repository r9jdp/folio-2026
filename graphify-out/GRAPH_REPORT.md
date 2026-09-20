# folio-2026 — Current source graph

> Scope: Current application, test and project-configuration code only. This AST extraction does not prove feature completeness. Historical planning and deleted code are excluded; Git history preserves the earlier implementation.

[Interactive graph](graph.html) · [Graph JSON](graph.json) · [Current README](../README.md)

Generated: 2026-09-20T14:55:03.105278+00:00

- 52 nodes · 52 directed edges · 16 communities
- 17 current code files; repository-relative source paths with SHA-256 fingerprints
- AST extraction only: no LLM calls or API cost
- Clustering: NetworkX Louvain, seed 42, on the undirected projection
- Edge confidence: EXTRACTED: 48, INFERRED: 4

## Source navigation

- [eslint.config.mjs](../eslint.config.mjs): 1 nodes
- [next.config.ts](../next.config.ts): 1 nodes
- [scripts/refresh-code-graph.py](../scripts/refresh-code-graph.py): 5 nodes
- [src/app/error.tsx](../src/app/error.tsx): 2 nodes
- [src/app/layout.tsx](../src/app/layout.tsx): 2 nodes
- [src/app/not-found.tsx](../src/app/not-found.tsx): 2 nodes
- [src/app/page.tsx](../src/app/page.tsx): 2 nodes
- [src/components/monitor/monitor-desktop.tsx](../src/components/monitor/monitor-desktop.tsx): 2 nodes
- [src/components/monitor/monitor-scene.tsx](../src/components/monitor/monitor-scene.tsx): 3 nodes
- [src/components/monitor/monitor.tsx](../src/components/monitor/monitor.tsx): 8 nodes
- [src/components/pond/koi-model.ts](../src/components/pond/koi-model.ts): 7 nodes
- [src/components/pond/koi-pond.tsx](../src/components/pond/koi-pond.tsx): 2 nodes
- [src/components/pond/pond-bed.ts](../src/components/pond/pond-bed.ts): 2 nodes
- [src/components/pond/pond-renderer.ts](../src/components/pond/pond-renderer.ts): 2 nodes
- [src/components/portfolio-content.tsx](../src/components/portfolio-content.tsx): 2 nodes
- [src/lib/pond.ts](../src/lib/pond.ts): 8 nodes
- [tests/pond.test.ts](../tests/pond.test.ts): 1 nodes

## Communities

### 0: pond.ts / koi-model.ts

9 nodes · edge density 0.42

- `pond.ts` — src/lib/pond.ts L1
- `crossSection()` — src/components/pond/koi-model.ts L144
- `advancePond()` — src/lib/pond.ts L190
- `angleDifference()` — src/lib/pond.ts L93
- `clamp()` — src/lib/pond.ts L31
- `createKoi()` — src/lib/pond.ts L40
- `disturbPond()` — src/lib/pond.ts L98
- `smoothstep()` — src/lib/pond.ts L35
- `stepPond()` — src/lib/pond.ts L111

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

### 2: koi-model.ts

6 nodes · edge density 0.53

- `koi-model.ts` — src/components/pond/koi-model.ts L1
- `createKoiModel()` — src/components/pond/koi-model.ts L167
- `fanGeometry()` — src/components/pond/koi-model.ts L154
- `makeCoat()` — src/components/pond/koi-model.ts L47
- `seeded()` — src/components/pond/koi-model.ts L19
- `softNoise()` — src/components/pond/koi-model.ts L27

### 3: refresh-code-graph.py

5 nodes · edge density 0.70

- `refresh-code-graph.py` — scripts/refresh-code-graph.py L1
- `communities_for()` — scripts/refresh-code-graph.py L60
- `main()` — scripts/refresh-code-graph.py L70
- `relative_source()` — scripts/refresh-code-graph.py L48
- `source_paths()` — scripts/refresh-code-graph.py L26

### 4: pond-bed.ts / pond-renderer.ts

4 nodes · edge density 0.50

- `pond-bed.ts` — src/components/pond/pond-bed.ts L1
- `pond-renderer.ts` — src/components/pond/pond-renderer.ts L1
- `createPondBed()` — src/components/pond/pond-bed.ts L2
- `createPondRenderer()` — src/components/pond/pond-renderer.ts L95

### 5: monitor-scene.tsx

3 nodes · edge density 0.67

- `monitor-scene.tsx` — src/components/monitor/monitor-scene.tsx L1
- `creationFailed()` — src/components/monitor/monitor-scene.tsx L217
- `lost()` — src/components/monitor/monitor-scene.tsx L175

### 6: error.tsx

2 nodes · edge density 1.00

- `error.tsx` — src/app/error.tsx L1
- `ErrorPage()` — src/app/error.tsx L3

### 7: layout.tsx

2 nodes · edge density 1.00

- `layout.tsx` — src/app/layout.tsx L1
- `RootLayout()` — src/app/layout.tsx L13

### 8: not-found.tsx

2 nodes · edge density 1.00

- `not-found.tsx` — src/app/not-found.tsx L1
- `NotFound()` — src/app/not-found.tsx L2

### 9: page.tsx

2 nodes · edge density 1.00

- `page.tsx` — src/app/page.tsx L1
- `Home()` — src/app/page.tsx L4

### 10: monitor-desktop.tsx

2 nodes · edge density 1.00

- `monitor-desktop.tsx` — src/components/monitor/monitor-desktop.tsx L1
- `MonitorDesktop()` — src/components/monitor/monitor-desktop.tsx L7

### 11: koi-pond.tsx

2 nodes · edge density 1.00

- `koi-pond.tsx` — src/components/pond/koi-pond.tsx L1
- `KoiPond()` — src/components/pond/koi-pond.tsx L9

### 12: portfolio-content.tsx

2 nodes · edge density 1.00

- `portfolio-content.tsx` — src/components/portfolio-content.tsx L1
- `PortfolioContent()` — src/components/portfolio-content.tsx L84

### 13: eslint.config.mjs

1 nodes · edge density 0.00

- `eslint.config.mjs` — eslint.config.mjs L1

### 14: next.config.ts

1 nodes · edge density 0.00

- `next.config.ts` — next.config.ts L1

### 15: pond.test.ts

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
