# folio-2026 — Current source graph

> Scope: Current application, test and project-configuration code only. This AST extraction does not prove feature completeness. Historical planning and deleted code are excluded; Git history preserves the earlier implementation.

[Interactive graph](graph.html) · [Graph JSON](graph.json) · [Current README](../README.md)

Generated: 2026-09-21T18:41:14.636234+00:00

- 92 nodes · 95 directed edges · 27 communities
- 29 current code files; repository-relative source paths with SHA-256 fingerprints
- AST extraction only: no LLM calls or API cost
- Clustering: NetworkX Louvain, seed 42, on the undirected projection
- Edge confidence: EXTRACTED: 89, INFERRED: 6

## Source navigation

- [eslint.config.mjs](../eslint.config.mjs): 1 nodes
- [next.config.ts](../next.config.ts): 1 nodes
- [scripts/prepare-doom-assets.mjs](../scripts/prepare-doom-assets.mjs): 1 nodes
- [scripts/prepare-tv-assets.mjs](../scripts/prepare-tv-assets.mjs): 1 nodes
- [scripts/refresh-code-graph.py](../scripts/refresh-code-graph.py): 5 nodes
- [src/app/error.tsx](../src/app/error.tsx): 2 nodes
- [src/app/icon.tsx](../src/app/icon.tsx): 1 nodes
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
- [src/components/portfolio-content.tsx](../src/components/portfolio-content.tsx): 1 nodes
- [src/components/portrait-name.tsx](../src/components/portrait-name.tsx): 2 nodes
- [src/components/side-navigation.tsx](../src/components/side-navigation.tsx): 2 nodes
- [src/components/television/doom-runtime.ts](../src/components/television/doom-runtime.ts): 4 nodes
- [src/components/television/television-scene.ts](../src/components/television/television-scene.ts): 2 nodes
- [src/components/television/television.tsx](../src/components/television/television.tsx): 17 nodes
- [src/lib/doom-preparation.ts](../src/lib/doom-preparation.ts): 4 nodes
- [src/lib/game-controls.ts](../src/lib/game-controls.ts): 4 nodes
- [src/lib/pond.ts](../src/lib/pond.ts): 8 nodes
- [tests/doom-preparation.test.ts](../tests/doom-preparation.test.ts): 2 nodes
- [tests/game-controls.test.ts](../tests/game-controls.test.ts): 1 nodes
- [tests/pond.test.ts](../tests/pond.test.ts): 1 nodes

## Communities

### 0: television.tsx

17 nodes · edge density 0.21

- `television.tsx` — src/components/television/television.tsx L1
- `boot()` — src/components/television/television.tsx L89
- `fail()` — src/components/television/television.tsx L241
- `keyDown()` — src/components/television/television.tsx L179
- `keyUp()` — src/components/television/television.tsx L187
- `locked()` — src/components/television/television.tsx L171
- `mouseDown()` — src/components/television/television.tsx L202
- `mouseLeave()` — src/components/television/television.tsx L199
- `mouseMove()` — src/components/television/television.tsx L190
- `mouseUp()` — src/components/television/television.tsx L217
- `pause()` — src/components/television/television.tsx L66
- `play()` — src/components/television/television.tsx L150
- `preload()` — src/components/television/television.tsx L41
- `releaseKeys()` — src/components/television/television.tsx L63
- `shutDown()` — src/components/television/television.tsx L76
- `transition()` — src/components/television/television.tsx L56
- `visibility()` — src/components/television/television.tsx L218

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

### 2: doom-runtime.ts / doom-preparation.ts

8 nodes · edge density 0.25

- `doom-runtime.ts` — src/components/television/doom-runtime.ts L1
- `doom-preparation.ts` — src/lib/doom-preparation.ts L1
- `createDoomPreparation()` — src/lib/doom-preparation.ts L49
- `isLevelFrameReady()` — src/lib/doom-preparation.ts L4
- `withAbort()` — src/lib/doom-preparation.ts L26
- `installShareware()` — src/components/television/doom-runtime.ts L45
- `loadEmulator()` — src/components/television/doom-runtime.ts L19
- `startDoom()` — src/components/television/doom-runtime.ts L219

### 3: pond.ts

8 nodes · edge density 0.50

- `pond.ts` — src/lib/pond.ts L1
- `advancePond()` — src/lib/pond.ts L190
- `angleDifference()` — src/lib/pond.ts L93
- `clamp()` — src/lib/pond.ts L31
- `createKoi()` — src/lib/pond.ts L40
- `disturbPond()` — src/lib/pond.ts L98
- `smoothstep()` — src/lib/pond.ts L35
- `stepPond()` — src/lib/pond.ts L111

### 4: koi-model.ts

7 nodes · edge density 0.43

- `koi-model.ts` — src/components/pond/koi-model.ts L1
- `createKoiModel()` — src/components/pond/koi-model.ts L167
- `crossSection()` — src/components/pond/koi-model.ts L144
- `fanGeometry()` — src/components/pond/koi-model.ts L154
- `makeCoat()` — src/components/pond/koi-model.ts L47
- `seeded()` — src/components/pond/koi-model.ts L19
- `softNoise()` — src/components/pond/koi-model.ts L27

### 5: refresh-code-graph.py

5 nodes · edge density 0.70

- `refresh-code-graph.py` — scripts/refresh-code-graph.py L1
- `communities_for()` — scripts/refresh-code-graph.py L60
- `main()` — scripts/refresh-code-graph.py L70
- `relative_source()` — scripts/refresh-code-graph.py L48
- `source_paths()` — scripts/refresh-code-graph.py L26

### 6: pond-bed.ts / pond-renderer.ts

4 nodes · edge density 0.50

- `pond-bed.ts` — src/components/pond/pond-bed.ts L1
- `pond-renderer.ts` — src/components/pond/pond-renderer.ts L1
- `createPondBed()` — src/components/pond/pond-bed.ts L2
- `createPondRenderer()` — src/components/pond/pond-renderer.ts L95

### 7: game-controls.ts

4 nodes · edge density 0.50

- `game-controls.ts` — src/lib/game-controls.ts L1
- `createGameInput()` — src/lib/game-controls.ts L61
- `createMouseLook()` — src/lib/game-controls.ts L34
- `mouseTurn()` — src/lib/game-controls.ts L28

### 8: monitor-scene.tsx

3 nodes · edge density 0.67

- `monitor-scene.tsx` — src/components/monitor/monitor-scene.tsx L1
- `creationFailed()` — src/components/monitor/monitor-scene.tsx L217
- `lost()` — src/components/monitor/monitor-scene.tsx L175

### 9: error.tsx

2 nodes · edge density 1.00

- `error.tsx` — src/app/error.tsx L1
- `ErrorPage()` — src/app/error.tsx L3

### 10: layout.tsx

2 nodes · edge density 1.00

- `layout.tsx` — src/app/layout.tsx L1
- `RootLayout()` — src/app/layout.tsx L13

### 11: not-found.tsx

2 nodes · edge density 1.00

- `not-found.tsx` — src/app/not-found.tsx L1
- `NotFound()` — src/app/not-found.tsx L2

### 12: page.tsx

2 nodes · edge density 1.00

- `page.tsx` — src/app/page.tsx L1
- `Home()` — src/app/page.tsx L5

### 13: monitor-desktop.tsx

2 nodes · edge density 1.00

- `monitor-desktop.tsx` — src/components/monitor/monitor-desktop.tsx L1
- `MonitorDesktop()` — src/components/monitor/monitor-desktop.tsx L7

### 14: koi-pond.tsx

2 nodes · edge density 1.00

- `koi-pond.tsx` — src/components/pond/koi-pond.tsx L1
- `KoiPond()` — src/components/pond/koi-pond.tsx L9

### 15: portrait-name.tsx

2 nodes · edge density 1.00

- `portrait-name.tsx` — src/components/portrait-name.tsx L1
- `PortraitName()` — src/components/portrait-name.tsx L10

### 16: side-navigation.tsx

2 nodes · edge density 1.00

- `side-navigation.tsx` — src/components/side-navigation.tsx L1
- `SideNavigation()` — src/components/side-navigation.tsx L14

### 17: television-scene.ts

2 nodes · edge density 1.00

- `television-scene.ts` — src/components/television/television-scene.ts L1
- `createTVScene()` — src/components/television/television-scene.ts L13

### 18: doom-preparation.test.ts

2 nodes · edge density 1.00

- `doom-preparation.test.ts` — tests/doom-preparation.test.ts L1
- `deferred()` — tests/doom-preparation.test.ts L21

### 19: eslint.config.mjs

1 nodes · edge density 0.00

- `eslint.config.mjs` — eslint.config.mjs L1

### 20: next.config.ts

1 nodes · edge density 0.00

- `next.config.ts` — next.config.ts L1

### 21: prepare-doom-assets.mjs

1 nodes · edge density 0.00

- `prepare-doom-assets.mjs` — scripts/prepare-doom-assets.mjs L1

### 22: prepare-tv-assets.mjs

1 nodes · edge density 0.00

- `prepare-tv-assets.mjs` — scripts/prepare-tv-assets.mjs L1

### 23: icon.tsx

1 nodes · edge density 0.00

- `icon.tsx` — src/app/icon.tsx L1

### 24: portfolio-content.tsx

1 nodes · edge density 0.00

- `portfolio-content.tsx` — src/components/portfolio-content.tsx L1

### 25: game-controls.test.ts

1 nodes · edge density 0.00

- `game-controls.test.ts` — tests/game-controls.test.ts L1

### 26: pond.test.ts

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
