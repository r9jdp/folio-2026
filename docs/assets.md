# Assets and references

## Runtime visuals

The monitor, keyboard and mouse are original procedural geometry. The pond uses four original volumetric koi meshes with deforming bodies and fins. Coat patterns are generated into Canvas textures, including irregular pigment fields and subtle scales.

The pond bed is an original, deterministic 900×580 Canvas texture containing moss, silt, gravel, five irregular shaded stones and sparse reeds. Moving caustics are rendered by the water shader rather than baked into the texture. Three.js renders fish, bed, lights and shadows to an offscreen target; a second pass applies refraction and interaction-driven ripples.

No Blender export, downloaded vehicle or fish model, stock pond video, remote texture or new external visual asset is required. The still fallback also uses original Canvas 2D drawing code. Software dependencies retain their own licences.

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
