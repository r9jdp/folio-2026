# Development handoff

## Run

Node.js 22.18+ and npm are the baseline used for verification. `npm ci` installs the committed dependency set. `npm run dev` serves the app at http://127.0.0.1:3000. No API keys or environment variables are required for this foundation.

`npm run check` runs ESLint, TypeScript and state tests. `npm run build` creates a production build; `npm start` serves it. `npm run format` and `npm run format:check` apply/check formatting. There is one package-manager lockfile: `package-lock.json`.

React and React DOM are pinned to 19.2 because the selected React Three Fiber version declares React `<19.3`. ESLint is pinned to 9.39.5 because the selected Next.js React/import/accessibility plugins do not support ESLint 10. Revisit these constraints together when updating dependencies; do not bypass peer dependency checks.

## Layout

- `src/app`: home, server-rendered standard portfolio, project routes, metadata and error states.
- `src/content`: shared portfolio descriptions and application registry. Meetly is disabled with its existing address intact.
- `src/components/experience`: lazily loaded Three.js canvas, Taycan and camera/door transition.
- `src/components/desktop`: real HTML workspace and window controls.
- `src/state`: guarded modes and input ownership. There is no physics, driving or game loop yet.
- `scripts/prepare-taycan.mjs`: repeatable offline asset preparation.
- `assets/manifest.json`: model provenance and measurements.
- `tests`: state handoff, cancellation, preserved selection and disabled-app checks.

Direct content routes never import the 3D scene. The WebGL renderer uses a demand frame loop and invalidates while the entry transition runs. The model is loaded only by the scene chunk. Fonts are served locally. The scene has a recoverable portfolio path if the model or WebGL fails.

## What works now

The showroom loads the actual prepared Taycan. A button or downward wheel gesture starts the entry animation. The desktop opens Work, About, Experience, Contact or a product introduction; windows close and maximize/restore. Going back to the showroom preserves the selected app. A standard portfolio and individual project pages work directly. The supplied PDF opens through a normal link.

Product launch links currently open the actual sites in a separate tab. No iframe is enabled yet: the registry preserves the previously observed blocked/unverified states, and the real guest/login flows still need browser verification. Project descriptions are an initial editorial pass based on the supplied planning material; richer case-study evidence and current résumé details can be reviewed next.

## Next implementation step

Refine the physical dashboard display and cabin composition, make the entry continuously follow scroll progress, then validate Fermeon's live embed with external-link recovery. After that, implement the finite driving track, explicit input/audio lifecycle and Return to Portfolio flow. The full first-playable milestone is not complete yet.

Driving, responsive motor audio, endless terrain, Doom, external-app embedding and deployment are pending. Do not expose launch buttons until those features have usable outcomes.

The approved video is in `docs/reference/taycan-concept.mp4`. Read it together with `docs/assets.md` and the README before changing the visual direction.

## Graphify

Follow `AGENTS.md`. `graphify update .` performs AST extraction after code changes. The graph also contains a retained planning snapshot; those nodes are requirements, not evidence that every planned feature exists. Document-semantic extraction is separate from the code-only update.
