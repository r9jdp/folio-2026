# Development handoff

## Run

Node.js 22.18+ and npm are the baseline used for verification. `npm ci` installs the committed dependency set. `npm run dev` serves the app at http://127.0.0.1:3000. No API keys or environment variables are required for the portfolio or driving game.

`npm run check` runs ESLint, TypeScript and the state/simulation tests. `npm run build` creates a production build; `npm start` serves it. `npm run format` and `npm run format:check` apply/check formatting. There is one package-manager lockfile: `package-lock.json`.

React and React DOM are pinned to 19.2 because the selected React Three Fiber version declares React `<19.3`. ESLint is pinned to 9.39.5 because the selected Next.js React/import/accessibility plugins do not support ESLint 10. Revisit these constraints together when updating dependencies; do not bypass peer dependency checks.

## Layout

- `src/app`: home, server-rendered standard portfolio, project routes, metadata and error states.
- `src/content`: shared portfolio descriptions and application registry. Meetly is disabled with its existing address intact.
- `src/components/experience`: lazily loaded Three.js canvas, Taycan and camera/door transition.
- `src/components/desktop`: expanded HTML reading view and app controls.
- `src/components/experience/dashboard*`: physical dashboard surfaces and portfolio launcher. `display-projection.ts` maps the central screen corners into a CSS perspective transform; the camera updates before this projection. The UI stays outside WebGL so buttons remain accessible.
- `public/textures`: original SVG instrument, passenger and console display artwork; these decorative panels do not claim working vehicle controls.
- `src/state`: guarded showroom/entry/desktop/driving modes, driving pause and input ownership.
- `src/components/experience/driving-game.tsx`: input, pause/recovery UI, HUD, local distance record and audio coordination. `drive-scene.tsx` owns the driving canvas, reusable road/terrain geometry, instanced scenery and chase/hood cameras.
- `src/lib/driving.ts`: fixed-step arcade controller and analytic road curve; no physics-engine dependency. `drive-terrain.ts` shares terrain generation/triangle sampling between meshes and scenery.
- `src/lib/drive-audio.ts`: original synthesized motor/wind and explicit audio lifecycle. `taycan-model.ts` shares cloned materials between parked and driving scenes.
- `scripts/prepare-taycan.mjs`: repeatable offline asset preparation.
- `assets/manifest.json`: model provenance and measurements.
- `tests`: state handoff, entry controls, screen projection, driving lifecycle guards, controller behaviour, analytic-road continuity and terrain-placement checks.

Direct content routes never import the 3D scene. The parked WebGL renderer uses a demand frame loop. It invalidates while entry or camera focus moves, then sleeps. The driving renderer runs continuously while active and returns to demand rendering while paused. Scroll sets a target; camera and door transforms are updated together. Automatic entry uses elapsed time rather than frame count. The model is loaded only by the scene chunk. Fonts are served locally. The scene has a recoverable portfolio path if the model or WebGL fails.

## What works now

The showroom loads the prepared Taycan with revised silver paint, studio lighting and a simple architectural backdrop. Wheel and single-touch gestures scrub the driver-door/camera route forward and backward. The entry slider supports keyboard navigation; Continue resumes the automatic route from the current position. The main Enter button provides the automatic route. Escape cancels safely. Reduced-motion visitors skip camera movement.

Work, About, Experience, Contact and individual project summaries render inside the dashboard. Choosing an app focuses the camera on the central display without opening an overlay. Cockpit view restores the wide composition. Reading view and Read case study explicitly open the longer content layout; Back to cockpit preserves the current app. At or below 760px, the reading layout opens directly.

The state store gates dashboard input until arrival, clamps finite scroll targets, ignores out-of-mode controls, and preserves the selected app when leaving the car. Model/render failures and WebGL context loss expose the standard portfolio route. Start driving is available from the showroom, physical dashboard, cockpit controls and reading view. No arcade launcher is presented yet.

Product launch links currently open the actual sites in a separate tab. No iframe is enabled yet: the registry preserves the previously observed blocked/unverified states, and the real guest/login flows still need browser verification. Project descriptions are an initial editorial pass based on the supplied planning material; richer case-study evidence and current résumé details can be reviewed next.

## Endless driving implementation

Start driving creates an audio owner from the user gesture and replaces the parked scene with `DrivingGame`. The separately loaded driving canvas blocks movement until the car is ready. It reuses the licensed car asset; road, landscape, sky, asphalt texture and motor/wind audio are original procedural content.

The vehicle controller runs at 1/120-second steps with at most 100 ms accumulated per render frame. Vehicle state and input live in refs; the HUD/audio receive updates around ten times per second. The controller supports forward acceleration, braking, drag, steering and simple guardrail slowdown/deflection. It does not implement reverse, rigid-body suspension, tyre simulation, traffic or objectives.

Road strips reuse fixed-size buffers. Terrain grids update in place, and scenery uses fixed instance counts. An analytic road curve and its exact derivative keep adjacent samples consistent. Terrain placement samples rendered triangles rather than an unrelated surface approximation. The car stays near the render origin; logical road progress grows independently. This avoids accumulating distant geometry but does not substitute for sustained memory/frame profiling.

| Action | Controls |
|---|---|
| Accelerate | W / Up; touch DRIVE pedal |
| Brake | S / Down / Space; touch BRAKE pedal |
| Steer | A/D / Left/Right; touch arrow buttons |
| Cruise | Toggle beside speed; holds acceleration while steering stays manual |
| Camera | C or camera button; chase and hood/bonnet views |
| Sound | M or sound button |
| Pause/resume | Escape / P; visible Pause and Resume driving buttons |
| End drive | Back to portfolio |

Cruise is an optional held-throttle mode, not automatic steering or speed regulation. Braking, pausing, blur/hidden-tab changes and exit cancel it; resume and a new drive leave it off.

The game clears held keys and touch pointers on pause, blur, hidden-tab changes and focus moving onto interface controls. Losing focus requires explicit resume; a held key must be released before it drives again. The pause dialog contains keyboard focus, with the game controls inert behind it. Pointer lock is not used. Rendering errors and WebGL loss stop the drive and offer the portfolio.

Audio is optional. The original Web Audio helper unlocks only on an explicit gesture, keeps mute through pause/resume, suspends during inactivity and disposes on exit. It does not store a cross-session mute preference. The best logical distance is stored locally under `rajdeep-endless-drive-best-v1`; unavailable storage does not block play.

Back to portfolio preserves the selected app and restores the parked cockpit. It ends the current run and releases driving/audio resources. A new Start begins from rest at zero distance; only the personal best survives. Reduced motion removes camera easing, body roll and speed-based field-of-view changes during the drive.

## Next implementation step

Validate the complete entry/app/drive/return flow on target browsers and physical touch devices, then record a sustained driving profile on named hardware. Refine handling, distant scenery transitions and visual detail based on those results. Fixed object counts are established in code; stable memory or target FPS has not been established by that fact alone.

Wheel/steering articulation, cabin asset refinement, a cockpit driving camera and a continuous studio-to-road animation remain future work. Rapier, traffic, checkpoints and competitive modes are optional enhancements rather than requirements for the current free-drive loop. Doom, external-app embedding and deployment remain pending. The full original product specification is not complete.

The approved video is in `docs/reference/taycan-concept.mp4`. Read it together with `docs/assets.md` and the README before changing the visual direction.

## Graphify

Follow `AGENTS.md`. `graphify update .` performs AST extraction after code changes. The graph also contains a retained planning snapshot; those nodes are requirements, not evidence that every planned feature exists. Document-semantic extraction is separate from the code-only update.

## Dashboard reference and limitations

The arrangement follows [Porsche’s Taycan interior reference](https://newsroom.porsche.com/en/2019/products/porsche-taycan-interior-digital-clear-sustainable-18432.html): separate instrument cluster, central display, optional passenger display and lower console. The UI is original portfolio artwork, not a reproduction of Porsche PCM. The screen dimensions are fitted to the current model, not a claim of CAD-level accuracy. The instrument and climate panels remain decorative while parked. Driving speed and distance are presented in the separate game HUD; the parked panel artwork does not become a live vehicle cluster.

The central launcher uses a four-corner CSS homography instead of nested CSS camera transforms. Projection tests cover corner correspondence and degenerate geometry; browser verification must also cover pointer targets, entry, returning from reading view, and resizing. The camera frame callback runs at priority -1 so projection observes the current camera matrix.

## Porsche and driving verification

Run the repository check and production-build commands. Browser checks should cover:

- forward/reverse entry, the position slider, Continue, Enter and Escape;
- app selection in the physical screen, focus/wide camera, and reading-view round trips;
- portfolio destinations and unchanged project/resume links;
- mobile reading layout, desktop resizing and direct portfolio routes;
- Start driving from each entry point, acceleration/braking/steering, and camera/sound controls;
- Cruise activation, manual steering, cancellation on brake/pause/blur, and disabled state after resume/new start;
- multi-touch pedals/steering, pointer cancellation, keyboard focus and viewport changes;
- pause/resume, blur/hidden tabs, released held inputs and reduced-motion camera behaviour;
- loading/WebGL failure recovery, repeated start/return cycles and the selected app after return;
- local best distance with storage available and blocked;
- a sustained drive with measured geometry counts, memory and frame timing on named hardware.

Camera transforms and the position-slider value update through refs; frame-by-frame camera movement does not rerender React. The 3D asset remains explicitly classified as a prototype in the asset manifest. Functional browser checks do not establish a performance target.
