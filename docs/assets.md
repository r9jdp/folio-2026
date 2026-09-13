# Assets and visual reference

The approved reference film lives at `docs/reference/taycan-concept.mp4`. It is reference material, not a video used as the website background. The film contains scripted UI and game footage; the website uses actual React interactions and a real 3D scene.

The runtime model is `public/models/taycan-preview.glb`. The original source download stays outside the checkout. Its source, licence, geometry checksum, preparation steps, dimensions, triangle count, byte size and known limitations are recorded in `assets/manifest.json`.

## Rebuild the model

Install the locked development dependencies, obtain the attributed source model, then run:

```sh
npm run assets:prepare -- /absolute/path/to/original/scene.gltf
```

Keep the source `scene.bin` beside the glTF. This script reads those supplied files; it does not download assets. It simplifies geometry offline, separates the driver door using the film's mesh knowledge, applies a hinge, batches materials, preserves display/camera anchors, and exports Meshopt-compressed GLB. The source badge atlas is omitted for this preview. The script updates the runtime asset and manifest.

The current export has 287,727 triangles and 27 draw meshes, at 1,993,256 bytes. It is a prototype quality tier. Body simplification is intentionally gentler than cabin simplification. Door seams, cabin close-ups, steering/wheel articulation and collision geometry still need work.

## Screen integration

The current desktop is a responsive DOM overlay over the settled cabin camera, with close/maximize controls. Its CSS screen frame is a first integration step. A physically anchored dashboard surface, camera/screen alignment at different aspect ratios and occlusion are pending. Named `display_anchor` and `driver_camera_anchor` nodes exist for that work.

The entry animation currently starts from the Enter button or a downward wheel gesture and plays a fixed camera path. Continuous scroll scrubbing is pending. Reduced-motion visitors enter the full-width desktop without the camera animation. The standard `/portfolio` route bypasses 3D entirely.

## Third-party content

See `THIRD_PARTY_NOTICES.md`. The source model and reference film are not evidence of Porsche endorsement. Do not treat the code's eventual licence as relicensing assets. No game runtime, WAD, engine binary or recorded audio is served by the application.
