import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
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
  const selected = 'belweder-ot-1782.glb';
  await copyFile(join(packageRoot, 'models', selected), join(destination, selected));
  // This preview only offers the CC0 Belweder. Alias unused variants so the
  // bundler does not redistribute models with different upstream licences.
  const stagePath = join(packageRoot, 'dist', 'VhsScreenStage.js');
  let stage = await readFile(stagePath, 'utf8');
  for (const [name, file] of [
    ['crtTvUrl', 'crt-tv'],
    ['littleTvUrl', 'little-tv'],
    ['vintageTvUrl', 'vintage-tv-1'],
  ]) {
    const original = `const ${name} = new URL('./models/${file}.glb', import.meta.url).href;`;
    const replacement = `const ${name} = belwederUrl; // Portfolio preview: use only the CC0 model.`;
    if (!stage.includes(original) && !stage.includes(replacement))
      throw new Error(`Unexpected CrazyGL asset declaration: ${name}`);
    stage = stage.replace(original, replacement);
  }
  await writeFile(stagePath, stage);
}
