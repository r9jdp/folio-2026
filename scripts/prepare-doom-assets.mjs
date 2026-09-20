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
for (const [packageName, name] of [
  ['emulators', 'GPL-2.0.txt'],
  ['libarchive.js', 'libarchive-js-MIT.txt'],
  ['fflate', 'fflate-MIT.txt'],
  ['comlink', 'comlink-Apache-2.0.txt'],
  ['@crazygl/hero-vhs-product-screen', 'CrazyGL-Apache-2.0.txt'],
]) {
  await copyFile(join(root, 'node_modules', packageName, 'LICENSE'), join(output, name));
}
await mkdir(join(root, 'public/models'), { recursive: true });
await copyFile(
  join(root, 'node_modules/@crazygl/hero-vhs-product-screen/models/belweder-ot-1782.glb'),
  join(root, 'public/models/belweder.glb'),
);
