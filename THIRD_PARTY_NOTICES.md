# Third-party notices

## Taycan model

**Porshe Taycan** by **Mikhail Hamanovich**.

- Original: https://sketchfab.com/3d-models/porshe-taycan-c6004141452e4d3ab048bf0fee52666d
- Creator: https://sketchfab.com/mihailhamanovich
- Licence: Creative Commons Attribution 4.0 International — https://creativecommons.org/licenses/by/4.0/
- Runtime adaptation: `public/models/taycan-preview.glb`.
- Modifications: offline simplification, paint/cabin material adjustments, omitted badge texture, driver-door extraction and pivot, display/camera anchors, material batching, quantization and Meshopt compression.
- Exact provenance and geometry measurements: `assets/manifest.json`.

Credit is also shown on the website's `/credits` page. This independent portfolio is not sponsored or endorsed by Porsche.

## Reference film

`docs/reference/taycan-concept.mp4` is the approved concept made in this project. It uses the above attributed car, original interface design and synthesized sound. It includes a short local capture of Doom, the 1993 game by id Software, using Cornelius Diekmann's WebAssembly port at https://github.com/diekmann/wasm-fizzbuzz/tree/51a7030bea563d96027301a36619c17347b9270d/doom. The film is a visual reference; no standalone Doom engine or game data is included or served by this app.

## Fonts and software

DM Sans is distributed through `@fontsource-variable/dm-sans` under the SIL Open Font License. It is bundled locally rather than fetched from Google Fonts at runtime. Lucide icons and all software dependencies retain their respective notices and licences in their installed packages. See the package lockfile for exact versions.

The supplied résumé belongs to Rajdeep Pandey and is served at `/resume.pdf` for the local portfolio. Review contact details before a public release.
