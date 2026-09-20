# Development notes

## Page structure

Keep the page on a white background with a restrained type scale, generous spacing and normal document scrolling. A compact header links to the written sections. The current hero contains a vintage television with opt-in Doom; work, experience and personal details remain readable below it.

Portfolio content belongs in the server-rendered page or a shared content module. Rendering and pointer interaction belong in isolated client components. The scene must not become the only route to a project, résumé or contact link.

## Current playable television

`television.tsx` owns the off → booting → ready → playing state machine, keyboard focus, pointer lock, fallback mouse input, sound, fullscreen and cleanup. Esc, blur and hidden tabs pause; power-off aborts startup and resets the session. A 60-second watchdog makes a stalled download retryable. Game input is isolated in `src/lib/game-controls.ts`; all held keys and pending fire releases are cleared on pause, shutdown and unmount.

`television-scene.ts` uses Three.js and the approved CC0 Belweder cabinet. It replaces only the screen material with a canvas texture, projects knob hit targets into page coordinates and pauses parallax while playing. Static is generated at 20 Hz (slower for reduced motion), followed by the real Doom framebuffer. An intersection observer and document visibility suspend rendering. Dispose GLTF geometry, materials, textures, renderer, observers and animation callbacks on unmount.

`doom-runtime.ts` loads self-hosted DOSBox and archive workers lazily. The unmodified shareware ZIP is SHA-256 verified and its two LHA parts joined, then all original game and documentation files are extracted into memory. A separate runtime config supplies WASD, horizontal mouse turning, automatic episode/skill selection and audio. The first level's opening transition finishes before the preview pauses. Game sound uses Web Audio; pending sound buffers are stopped on pause and shutdown. No persistent saves or commercial WADs are included.

`scripts/prepare-doom-assets.mjs` copies the pinned engine/archive assets, license texts and the CC0 model into `public/` at installation. Generated files stay out of Git. Serve locally or over HTTPS for Web Crypto and pointer lock. A strict future CSP must permit same-origin WASM, workers and the local engine script. Do not replace worker URLs with third-party CDN URLs.

### TV browser checklist

1. Start off, power on, observe snow on the glass, then enter the first level.
2. Move with WASD, turn with the mouse, fire and observe ammunition decrease. Verify E opens doors, Shift runs, Tab toggles the map and number keys select owned weapons.
3. Esc must pause/release, and clicking the screen must resume. Blur or hiding the tab must release held movement/fire. Input outside an active game must leave page navigation alone.
4. Toggle sound; power off during startup and during play; restart. Check for stale game frames, duplicate sound, console errors and workers left running.
5. Check native pointer lock/fullscreen in a desktop browser and fallback movement in an embedded browser. Check desktop and 390px cabinet alignment and scrolling. Touch visitors must be told a keyboard/mouse are required.
6. Check reduced motion, blocked asset requests, WebGL failures and audio on target hardware. These paths are not established by the unit tests.

## Previous monitor and pond scene

The following technical notes describe the retained, unused implementation preserved at commit `32087a2`.

The computer uses procedural Three.js geometry and a Drei HTML display. It renders on demand. Drei mounts its display in a separate React root, so the screen's DOM ref invalidates the scene after mounting; removing that invalidation can leave the screen untransformed on first load.

The pond is an independent Three.js renderer inside that HTML display. It renders four volumetric koi, a textured pond bed, lights and fish shadows into an offscreen render target. A second pass samples that scene through a water shader, adding animated caustics, surface refraction and expanding ripples. Both the pond bed and koi coats are deterministic, original Canvas-generated textures; no runtime asset download is required.

Fish bodies are procedural meshes with deforming spines and articulated fins. The simulation advances in fixed steps with smooth acceleration, angular velocity and body bend. Tail stroke phase is integrated continuously, so changes in speed do not produce jumps in tail animation. Keep simulation and rendering separate from the written portfolio.

The pond uses `requestAnimationFrame` without publishing fish positions through React state. Cap rendering resolution, bound active ripple data, and dispose geometries, materials, textures, render targets and the renderer on unmount. Cancel frame callbacks and remove observers and listeners. The outer monitor and inner pond have separate WebGL lifecycles.

## Previous pond interaction and fallbacks

Pointer taps create ripples; taps near fish produce stronger reactions. Pointer dragging creates spaced disturbances. Enter and Space activate the focused pond. Keep normal vertical page scrolling available on touch devices and preserve ordinary links for portfolio navigation.

Reduced motion starts paused. The visitor can explicitly resume or pause the pond. Visibility and intersection observers suspend animation while the page is hidden or the pond is offscreen.

If pond WebGL initialization fails or its context is lost, release its renderer and display a still Canvas 2D illustration with tap/keyboard ripple feedback. This fallback does not animate the fish. If the outer computer scene fails, render a flat monitor frame; its pond independently selects its supported rendering path. Text navigation remains outside both scenes.

## Validation

Run current code checks and the production build for the active TV preview. The pond checklist and recorded results below apply to the previous iteration; retain them if that scene is revisited.

Run `npm run check` and `npm run build`. The simulation currently has five regression tests. They cover motion behavior; they do not establish visual quality, GPU compatibility or device performance.

Manually verify the following after renderer changes:

1. Load desktop and narrow mobile layouts; check the monitor's first-frame screen alignment, resizing, pond visibility and normal scrolling.
2. Tap water, tap near each fish and drag through the pond. Check that ripples begin under the pointer, fish react smoothly and tails remain continuous during turns and speed changes.
3. Tab to the pond, use Enter and Space, and exercise pause/resume. Test a reduced-motion preference from initial page load and explicit opt-in to animation.
4. Scroll the pond out of view and switch tabs, then return. Confirm animation resumes without a large simulation jump or duplicate frame loops.
5. Verify the still pond fallback when WebGL is unavailable or its context is lost, and the flat monitor fallback when the outer scene fails. Keep work, résumé and contact links usable.
6. Inspect console errors and measure performance on representative target devices. Do not infer a frame-rate guarantee from procedural assets or a small scene.

The Three.js pond rewrite passes lint, TypeScript, formatting, five simulation tests and a production build. Browser review covered desktop and a 390px viewport, pointer interaction, keyboard ripples and pause/resume, with no observed browser errors. Reduced-motion emulation, unavailable-WebGL, forced context-loss and device performance measurements remain separate verification work; they are not implied by these checks.

After code changes, follow `AGENTS.md` and run `graphify update .` from the repository root. Then run `python scripts/refresh-code-graph.py .` with Graphify's Python environment. The second step rebuilds from current source only and repairs the incremental tool's retention of historical/deleted nodes. It uses AST extraction, with no model or API calls. Review generated graph output before committing it.

## Files

- `src/components/television/television.tsx`: TV lifecycle, game controls, power and sound.
- `src/components/television/television.module.css`: white stage, projected control targets and responsive TV layout.
- `scripts/prepare-tv-assets.mjs`: version-guarded package asset-path repair.
- `src/components/portfolio-content.tsx`: résumé-based text and outbound links.

The following scene files are retained from the previous iteration and are not mounted by the current homepage:

- `src/components/monitor/monitor.tsx`: motion preference, pause control, lazy scene and flat fallback.
- `src/components/monitor/monitor-scene.tsx`: original procedural hardware, fixed camera and on-demand WebGL rendering.
- `src/components/monitor/monitor-desktop.tsx`: pond screen and accessible desktop shortcuts.
- `src/components/pond/koi-pond.tsx`: animation lifecycle, input, visibility handling and still Canvas 2D fallback.
- `src/components/pond/pond-renderer.ts`: pond lighting, shadows, offscreen target, refractive water shader and GPU resource disposal.
- `src/components/pond/koi-model.ts`: volumetric koi, procedural coats and body/fin deformation.
- `src/components/pond/pond-bed.ts`: original moss, gravel, stones and reeds generated into a Canvas texture.
- `src/lib/pond.ts`: fixed-step swimming and disturbance simulation, covered by `tests/pond.test.ts`.

## Local preview

```sh
npm run dev -- --port 3013
```

The port is explicit so this preview can run separately from another local project. No API key or backend service is required for the portfolio or TV preview.
