import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// CrazyGL 0.1.1 publishes its models at the package root, but its compiled
// renderer resolves them relative to dist/. Keep fresh installs reproducible.
const packageRoot = dirname(
  dirname(fileURLToPath(import.meta.resolve('@crazygl/hero-vhs-product-screen'))),
);
const metadata = JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8'));
if (metadata.version === '0.1.1') {
  const destination = join(packageRoot, 'dist', 'models');
  await mkdir(destination, { recursive: true });
  for (const model of ['belweder-ot-1782', 'crt-tv', 'little-tv', 'vintage-tv-1']) {
    await copyFile(join(packageRoot, 'models', `${model}.glb`), join(destination, `${model}.glb`));
  }
}
