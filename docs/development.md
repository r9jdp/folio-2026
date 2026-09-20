# Development notes

## Page structure

Keep the page on a white background with a restrained type scale, generous spacing and normal document scrolling. A compact header links to the written sections. The hero contains the computer and pond; work, experience and personal details remain readable below it.

Portfolio content belongs in the server-rendered page or a shared content module. Rendering and pointer interaction belong in isolated client components. The scene must not become the only route to a project, résumé or contact link.

## Interactive scene

The computer is procedural Three.js geometry with an HTML screen embedded through Drei. The pond is a separate Canvas 2D component. Keep fish simulation and rendering independent from the surrounding portfolio so that the pond can be adjusted without changing the written sections.

Animate through `requestAnimationFrame` or the scene's frame loop. Avoid React state updates for every fish position. Bound canvas resolution and clean up frame callbacks, observers and event listeners when components unmount.

## Validation

Run `npm run check` and `npm run build`. Browser review should cover desktop and narrow screens, ordinary scrolling, project and résumé links, keyboard navigation, pond pointer interaction and console errors.

The implementation includes these behavior safeguards; retain them when editing the scene:

- Reduced-motion settings stop or substantially reduce ambient motion.
- A pond outside the viewport or in a hidden tab stops scheduling unnecessary animation.
- WebGL failure leaves a readable fallback and preserves access to all written content.
- The monitor screen remains legible and its pointer target stays aligned as the layout resizes.

Do not infer a frame-rate guarantee from the procedural asset approach; measure on the devices being targeted.

After code changes, follow `AGENTS.md` and run `graphify update .` from the repository root. Then run `python scripts/refresh-code-graph.py .` with Graphify's Python environment. The second step rebuilds from current source only and repairs the incremental tool's retention of historical/deleted nodes. It uses AST extraction, with no model or API calls. Review generated graph output before committing it.

## Files

- `src/components/portfolio-content.tsx`: resume-based text and outbound links.
- `src/components/monitor/monitor.tsx`: motion preference, pause control, lazy scene and flat fallback.
- `src/components/monitor/monitor-scene.tsx`: original procedural hardware, fixed camera and on-demand WebGL rendering.
- `src/components/monitor/monitor-desktop.tsx`: pond screen and accessible desktop shortcuts.
- `src/components/pond/koi-pond.tsx`: original Canvas 2D illustration and animation lifecycle.
- `src/lib/pond.ts`: bounded swimming and disturbance simulation; covered by `tests/pond.test.ts`.

The monitor renders on demand. Drei creates its HTML display in a separate React root, so the screen's DOM ref invalidates the scene after mounting; removing that invalidation can leave an untransformed screen on first load. The pond animates independently of WebGL.

Reduced motion starts paused. The visitor can explicitly resume or pause the pond. Visibility and intersection observers suspend animation while hidden or offscreen. A WebGL context loss or scene error switches to a flat monitor containing the same interactive pond; text navigation remains outside the scene.

## Local preview

```sh
npm run dev -- --port 3013
```

The port is explicit so this preview can run separately from another local project. No API key or backend service is required for the portfolio and pond.
