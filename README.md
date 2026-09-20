# Rajdeep Pandey — portfolio

A quiet, white portfolio with a small interactive world at the top: an original 3D desktop computer, a living koi pond on its screen, and straightforward writing about Rajdeep's work below it.

The text is the portfolio. The monitor is an invitation to pause and explore; visitors can reach the work, experience and résumé through ordinary page navigation.

## Development

Use Node.js 22.18 or later and the committed npm lockfile.

```sh
npm ci
npm run dev -- --port 3013
```

Open [localhost:3013](http://localhost:3013).

```sh
npm run check
npm run build
```

`check` runs lint, TypeScript checking and the repository's tests. Run the production build separately before publishing.

## Implementation

- **Next.js, React and TypeScript:** readable portfolio content rendered by the server, with client components for the interactive scene.
- **Three.js, React Three Fiber and Drei:** original procedural monitor, keyboard and mouse geometry. An HTML screen places the pond inside the monitor.
- **Three.js pond:** four volumetric koi with deforming bodies and fins, original Canvas-generated coat and pond-bed textures, lighting and shadows. An offscreen scene feeds a water shader that adds moving caustics, refraction and expanding disturbance waves.
- **Swimming:** a fixed-step simulation smooths steering, acceleration and body bend. Continuous stroke phase keeps the tails moving naturally as fish accelerate, turn and return to a glide.
- **Content:** project descriptions and experience drawn from Rajdeep's supplied résumé and project information. These are self-reported facts, not independently verified claims.

See [development notes](docs/development.md), [asset provenance](docs/assets.md) and [third-party notices](THIRD_PARTY_NOTICES.md).

## Design references

[Henry Heffernan](https://henryheffernan.com/) inspired the physical computer framing; [Shawn](https://www.shwn.design/) inspired the playful pond; [Adi Singh](https://www.adisingh.com/) inspired the clear, text-first presentation. The implementation uses original scene and pond code, rather than assets copied from those sites.

## Branch history

This direction is developed on `feat/minimal-monitor-pond`. The earlier Porsche experience is preserved on `main` at commit `17f1f6f`. Its vehicle assets and driving interface are not part of this version.

## Interaction

Click or tap the water for a ripple, drag to create a trail of disturbances, or tap near a koi for a stronger reaction. Fish turn and accelerate smoothly before settling back into swimming. The focused pond also responds to Enter or Space. The control below the monitor pauses or resumes it. Reduced-motion preferences start the pond still, with an explicit option to play.

Desktop shortcuts jump to selected work and open the supplied résumé. All portfolio content is also available as ordinary HTML below the scene. Fish animation suspends offscreen and in hidden tabs; the outer 3D monitor renders on demand. If the pond cannot initialize WebGL or loses its context, it switches to a still Canvas 2D illustration with visible ripple feedback. An outer monitor WebGL failure uses a flat monitor frame. Written content and navigation remain available in either case.

## Validation

Lint, TypeScript, formatting, five simulation regression tests and the production build pass. The revised pond has been checked in the browser at desktop and 390px mobile sizes, including pointer interaction, keyboard ripples and pause/resume, with no observed browser errors. Follow the [manual verification workflow](docs/development.md#validation) when changing the renderer.

The procedural artwork and bounded rendering resolution do not imply a frame-rate guarantee. Measure performance on target devices and verify reduced-motion, unavailable-WebGL and context-loss paths explicitly.
