# Rajdeep Pandey — portfolio

A quiet, white portfolio with a playable vintage television above straightforward writing about Rajdeep's work. A supplied pixel-art landscape loops on its curved glass. Turn the Belweder TV's left knob to see analog snow, then play the original Doom shareware episode.

## Development

Use Node.js 22.18 or later and the committed npm lockfile.

```sh
npm ci
npm run dev -- --port 3013
npm run check
npm run build
```

Open [127.0.0.1:3013](http://127.0.0.1:3013). Installation copies the selected CC0 model and pinned game workers/WASM files into `public/`; those generated copies are ignored by Git. The original 2.45 MB shareware distribution is committed unchanged. No game account, runtime CDN or API key is required.

## Playing the TV

The TV starts with a silent, looping landscape video. The left knob switches into Doom and back to the video; the right knob toggles Doom sound. After a short static sequence, click the screen to start. The game stays paused until that click. Returning to the video discards the current game session; this version does not save progress. A small control below the TV pauses or resumes the video. Reduced-motion visitors start with a still frame and can choose to play it.

| Input | Action |
| --- | --- |
| WASD | Forward, strafe left, backward, strafe right |
| Mouse | Turn horizontally (classic Doom auto-aim) |
| Left click / Ctrl | Fire |
| E / Space | Open doors, use switches; restart after death |
| Shift | Run |
| 1–7 | Select available weapons |
| Tab | Automap |
| Esc | Pause and release mouse |

Desktop browsers use pointer lock. If an embedded browser refuses capture, the game still runs with WASD and mouse turning while the pointer is over the TV. Clicking outside the game, losing window focus or hiding the tab pauses it. Fullscreen enlarges the cabinet where supported. A keyboard and mouse are required; there is no touch gamepad in this version. Written portfolio content remains accessible without playing.

## TV implementation

`television-scene.ts` loads the same CC0 Belweder OT-1782 cabinet from [CrazyGL](https://crazygl.com/hero/vhs-product-screen), retaining the approved framing. A canvas texture maps ambient video, static and the live 320×200 Doom framebuffer onto the curved screen at a 4:3 display aspect. The 205 KB MP4 is served locally, cover-cropped without stretching, with a matching WebP poster and subtle scanlines. Accessible HTML buttons track the two physical knobs. Parallax freezes during play and respects reduced motion. Video playback and rendering pause offscreen and in hidden tabs; a manual video pause survives channel changes.

`doom-runtime.ts` starts the pinned `emulators@8.4.2` DOSBox worker only after power-on. It verifies the original shareware archive's SHA-256, unpacks the complete distribution into browser memory and boots E1M2 (Nuclear Plant) on normal difficulty with a WASD configuration. This provides 41 enemies, including guards near the starting area, instead of the previous E1M1 easy start with only four enemies. This is the original single-player campaign against AI enemies; it does not connect to multiplayer opponents. Web Audio starts from the user's interaction; mute, pause and shutdown stop queued audio. Power-off cancels startup and disposes the game worker. Slow or failed startup offers a retry.

Game downloads and extraction begin during idle time after the TV loads. Successful preparation is reused across power cycles for the current page; failed or stalled preparation can retry. Startup reports download percentage and preparation/launch stages. Losing focus only pauses active gameplay, so switching tabs during loading cannot freeze startup. Readiness detects the revealed HUD instead of waiting for 70 frame callbacks. Relative mouse input uses pixel deltas; the uncaptured fallback derives movement from pointer positions.

The untouched blank-TV concept is preserved at `2ffe887`; the first playable milestone is `d610720`. See [development notes](docs/development.md), [assets](docs/assets.md), [game credits](public/games/credits.txt) and [third-party notices](THIRD_PARTY_NOTICES.md).

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

This direction is developed on `feat/minimal-monitor-pond`. The earlier Porsche experience is preserved on `main` at commit `17f1f6f`. Its vehicle assets and driving interface are not part of this version. The completed monitor-and-pond iteration is preserved at `32087a2`; the active hero now plays Doom on the vintage TV.

## Previous pond interaction

These controls describe the retained pond iteration, not the active Doom TV.

Click or tap the water for a ripple, drag to create a trail of disturbances, or tap near a koi for a stronger reaction. Fish turn and accelerate smoothly before settling back into swimming. The focused pond also responds to Enter or Space. The control below the monitor pauses or resumes it. Reduced-motion preferences start the pond still, with an explicit option to play.

Desktop shortcuts jump to selected work and open the supplied résumé. All portfolio content is also available as ordinary HTML below the scene. Fish animation suspends offscreen and in hidden tabs; the outer 3D monitor renders on demand. If the pond cannot initialize WebGL or loses its context, it switches to a still Canvas 2D illustration with visible ripple feedback. An outer monitor WebGL failure uses a flat monitor frame. Written content and navigation remain available in either case.

## Validation

Run lint, TypeScript, all sixteen tests, formatting and the production build. Five startup tests cover shared preparation, cancellation, retries, timeout and readiness; six input tests cover mouse deltas, pointer re-entry, simultaneous held controls, key aliases and short fire clicks; five retained tests cover pond simulation. Browser checks cover startup while switching tabs, repeated power-on, mouse-only turning, fire and Esc pause/resume. In-app testing exercises the uncaptured mouse fallback; native pointer lock, subjective audio quality and representative low-end hardware need testing in a normal desktop browser. A local prepared-game startup measured approximately 2.8 seconds; this is not a guarantee for a first visit over a remote tunnel.
