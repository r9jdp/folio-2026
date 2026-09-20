import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, 'public', 'vendor', 'doom');
await mkdir(output, { recursive: true });
for (const file of ['emulators.js', 'wdosbox.js', 'wdosbox.wasm', 'wlibzip.js', 'wlibzip.wasm']) {
  await copyFile(join(root, 'node_modules/emulators/dist', file), join(output, file));
}
for (const file of ['worker-bundle.js', 'libarchive.wasm']) {
  await copyFile(join(root, 'node_modules/libarchive.js/dist', file), join(output, file));
}
await mkdir(join(root, 'public/models'), { recursive: true });
await copyFile(
  join(root, 'node_modules/@crazygl/hero-vhs-product-screen/models/belweder-ot-1782.glb'),
  join(root, 'public/models/belweder.glb'),
);
