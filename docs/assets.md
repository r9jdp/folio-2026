# Assets and references

## Current television preview

The homepage uses the official `@crazygl/hero-vhs-product-screen@0.1.1` component and its bundled `belweder-ot-1782.glb` (approximately 6.06 MB). The code is Apache-2.0. The selected model is **Black and white “Belweder” — OT 1782 TV set** by [Virtual Museums of Małopolska](https://sketchfab.com/WirtualneMuzeaMalopolski), released under CC0-1.0 according to its embedded metadata; see the [original model page](https://sketchfab.com/3d-models/black-and-white-belweder-ot-1782-tv-set-5c2be264f3ce4e11ac9387505e0bcea0) and [third-party notices](../THIRD_PARTY_NOTICES.md).

The stage is white and screen media is empty. No pond, video or application is mounted inside the TV. `scripts/prepare-tv-assets.mjs` repairs version `0.1.1`'s relative model paths during installation by copying Belweder from the package root into `dist/models` and aliasing unused model URLs to it. Only the CC0 Belweder asset is emitted; other package models are excluded from the build.

The optional upstream models have separate embedded credits: **[The Little TV That Couldn't](https://sketchfab.com/3d-models/the-little-tv-that-couldnt-6813826f9126436fa1248d7eeb792f66)** by [B Domeier](https://sketchfab.com/acidfawn), CC BY 4.0; **[Vintage TV](https://sketchfab.com/3d-models/vintage-tv-54b56ce71d054d60ab31425757a45cf7)** by [Outlier Spa](https://sketchfab.com/outlier_spa), CC BY 4.0; and **[CRT TV](https://sketchfab.com/3d-models/crt-tv-9ba4baa106e64319a0b540cf0af5aa9e)** by [Timothy Ahene](https://sketchfab.com/timothyahene), labelled Sketchfab Standard. These models are not displayed in the preview. See [third-party notices](../THIRD_PARTY_NOTICES.md) for licence links; do not treat the package's Apache-2.0 label as their model licence.

## Previous monitor and pond visuals

These original assets and components remain unused by the active homepage. The previous iteration is preserved at commit `32087a2`.

The monitor, keyboard and mouse are original procedural geometry. The pond uses four original volumetric koi meshes with deforming bodies and fins. Coat patterns are generated into Canvas textures, including irregular pigment fields and subtle scales.

The pond bed is an original, deterministic 900×580 Canvas texture containing moss, silt, gravel, five irregular shaded stones and sparse reeds. Moving caustics are rendered by the water shader rather than baked into the texture. Three.js renders fish, bed, lights and shadows to an offscreen target; a second pass applies refraction and interaction-driven ripples.

The previous pond requires no Blender export, downloaded vehicle or fish model, stock pond video, or remote texture. The still fallback also uses original Canvas 2D drawing code. Software dependencies retain their own licences.

The previous Porsche model and driving assets remain in the preserved Git history; they are not runtime dependencies of this branch.

## Portfolio material

`public/resume.pdf` is the résumé supplied by Rajdeep Pandey. Written project and experience descriptions are based on that résumé and information supplied during the project. Keep factual edits tied to those sources; avoid adding unsupported metrics or outcomes.

DM Sans is provided by the installed `@fontsource-variable/dm-sans` package and can be served locally. Its licence is described in [third-party notices](../THIRD_PARTY_NOTICES.md).

## Visual inspiration

| Reference                                      | Design idea                                          |
| ---------------------------------------------- | ---------------------------------------------------- |
| [Henry Heffernan](https://henryheffernan.com/) | A physical computer as an interactive object         |
| [Shawn](https://www.shwn.design/)              | A small, lively pond with direct pointer interaction |
| [Adi Singh](https://www.adisingh.com/)         | Clear writing and a restrained portfolio layout      |

These links document inspiration. They do not imply use of those sites' code, textures, models or branding, or endorsement by their creators.
