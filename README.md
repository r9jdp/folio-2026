# Rajdeep Pandey — portfolio

A quiet, white portfolio with a vintage television at the top and straightforward writing about Rajdeep's work below it. The current hero is a quick visual preview of the Belweder OT-1782 TV from [CrazyGL](https://crazygl.com/hero/vhs-product-screen), with a blank blue-grey screen.

The TV preview helps choose the physical object before developing its screen. It mounts neither the previous desktop nor the pond. Visitors can reach work, experience and the résumé through ordinary page navigation.

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

## Current TV preview

`src/components/television/television.tsx` loads the official `@crazygl/hero-vhs-product-screen` package, pinned to `0.1.1`, on the client. The TV sits against white with subtle pointer parallax. Screen media, marketing copy, turn-on animation and glitches are disabled; there is no pond integration in this preview.

The package code is Apache-2.0 and the selected Belweder model is CC0-1.0. A version-guarded `postinstall` script, `scripts/prepare-tv-assets.mjs`, copies the selected CC0 Belweder into `dist/models` to repair its published relative asset path. It aliases unused model URLs to Belweder so only that model is emitted. This preview intentionally supports Belweder only.

## Previous monitor and pond implementation

The following code remains in the repository, unused by the active homepage, and is preserved at commit `32087a2`.

- **Next.js, React and TypeScript:** readable portfolio content rendered by the server, with client components for the interactive scene.
- **Three.js, React Three Fiber and Drei:** original procedural monitor, keyboard and mouse geometry. An HTML screen places the pond inside the monitor.
- **Three.js pond:** four volumetric koi with deforming bodies and fins, original Canvas-generated coat and pond-bed textures, lighting and shadows. An offscreen scene feeds a water shader that adds moving caustics, refraction and expanding disturbance waves.
- **Swimming:** a fixed-step simulation smooths steering, acceleration and body bend. Continuous stroke phase keeps the tails moving naturally as fish accelerate, turn and return to a glide.
- **Content:** project descriptions and experience drawn from Rajdeep's supplied résumé and project information. These are self-reported facts, not independently verified claims.

See [development notes](docs/development.md), [asset provenance](docs/assets.md) and [third-party notices](THIRD_PARTY_NOTICES.md).

## Design references

[Henry Heffernan](https://henryheffernan.com/) inspired the physical computer framing; [Shawn](https://www.shwn.design/) inspired the playful pond; [Adi Singh](https://www.adisingh.com/) inspired the clear, text-first presentation. The previous monitor and pond use original code, rather than assets copied from those three sites. The active television preview uses the official CrazyGL package and its bundled model.

## Branch history

This direction is developed on `feat/minimal-monitor-pond`. The earlier Porsche experience is preserved on `main` at commit `17f1f6f`. Its vehicle assets and driving interface are not part of this version. The completed monitor-and-pond iteration is preserved at `32087a2`; the active hero now previews the vintage TV.

## Previous pond interaction

These controls describe the retained pond iteration, not the active blank-screen TV preview.

Click or tap the water for a ripple, drag to create a trail of disturbances, or tap near a koi for a stronger reaction. Fish turn and accelerate smoothly before settling back into swimming. The focused pond also responds to Enter or Space. The control below the monitor pauses or resumes it. Reduced-motion preferences start the pond still, with an explicit option to play.

Desktop shortcuts jump to selected work and open the supplied résumé. All portfolio content is also available as ordinary HTML below the scene. Fish animation suspends offscreen and in hidden tabs; the outer 3D monitor renders on demand. If the pond cannot initialize WebGL or loses its context, it switches to a still Canvas 2D illustration with visible ripple feedback. An outer monitor WebGL failure uses a flat monitor frame. Written content and navigation remain available in either case.

## Validation

The TV preview passes lint, TypeScript, formatting and the production build. Browser review covered asset loading, a blank screen on white, desktop and 390px layouts, with no observed console errors. Existing five pond simulation tests still pass; they do not test the TV. Device performance, reduced-motion emulation and GPU failure handling need separate verification.

For the preserved pond iteration, lint, TypeScript, formatting, five simulation regression tests and the production build passed. The revised pond has been checked in the browser at desktop and 390px mobile sizes, including pointer interaction, keyboard ripples and pause/resume, with no observed browser errors. Follow the [manual verification workflow](docs/development.md#validation) when changing the renderer.

The procedural artwork and bounded rendering resolution do not imply a frame-rate guarantee. Measure performance on target devices and verify reduced-motion, unavailable-WebGL and context-loss paths explicitly.
