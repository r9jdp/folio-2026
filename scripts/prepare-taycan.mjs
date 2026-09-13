// Usage: npm run assets:prepare -- /absolute/path/to/original/scene.gltf
// Keeps source downloads outside the repository. No source assets are fetched here.
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshoptSimplifier, MeshoptEncoder } from 'meshoptimizer';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, meshopt } from '@gltf-transform/functions';

const source = process.argv[2];
if (!source)
  throw new Error('Supply the path to the original Taycan scene.gltf. See docs/assets.md.');
const bytes = await readFile(source);
const json = JSON.parse(bytes);
const hash = createHash('sha256').update(bytes);
for (const buffer of json.buffers) {
  const data = await readFile(path.resolve(path.dirname(source), buffer.uri));
  hash.update(data);
  buffer.uri = `data:application/octet-stream;base64,${data.toString('base64')}`;
}
// The source's one texture is a badge atlas. Use flat badge materials for this preview.
for (const material of json.materials ?? []) {
  if (material.pbrMetallicRoughness) delete material.pbrMetallicRoughness.baseColorTexture;
}
delete json.images;
delete json.textures;
delete json.samplers;
globalThis.ProgressEvent ??= class ProgressEvent {
  constructor(type, values) {
    Object.assign(this, { type, ...values });
  }
};
globalThis.FileReader ??= class FileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }
};
await Promise.all([MeshoptSimplifier.ready, MeshoptEncoder.ready]);
const loaded = await new GLTFLoader().parseAsync(JSON.stringify(json), '');
loaded.scene.updateMatrixWorld(true);
const body = new THREE.Group();
body.name = 'body';
const door = new THREE.Group();
door.name = 'driver_door';
const hinge = new THREE.Vector3(0.94, 0.6, 0.82);
door.position.copy(hinge);
const car = new THREE.Group();
car.name = 'taycan';
car.add(body, door);
const doorNames = new Set([
  'polySurface918_corpus1_0',
  'polySurface1036_Carbon_black1_0',
  'polySurface920_corpus1_0',
  'polySurface215_glass2_0',
  'polySurface218_Black_plastick1_0',
  'Porsche_base_Mirror_polySurface1034_MIRROR_0',
  'Porsche_base_Mirror_polySurface1034_corpus1_0',
  'Porsche_base_Mirror_polySurface1034_Black_plastick1_0',
  'pCube2_Black_plastick1_0',
]);
const batches = new Map();
let originalTriangles = 0;
function add(geometry, material, moving) {
  if (!geometry.index?.count) return;
  const compact = mergeVertices(geometry, 1e-5);
  if (moving) compact.translate(-hinge.x, -hinge.y, -hinge.z);
  const key = `${moving ? 'door' : 'body'}_${material.uuid}`;
  if (!batches.has(key)) batches.set(key, { geometries: [], material, moving });
  batches.get(key).geometries.push(compact);
}
loaded.scene.traverse((node) => {
  if (!node.isMesh) return;
  const g = node.geometry.clone();
  g.applyMatrix4(node.matrixWorld);
  for (const key of Object.keys(g.attributes))
    if (!['position', 'normal'].includes(key)) g.deleteAttribute(key);
  const material = node.material;
  material.side = THREE.DoubleSide;
  if (material.name === 'corpus1') {
    material.color.set('#bbc2c9');
    material.metalness = 0.8;
    material.roughness = 0.27;
    g.computeVertexNormals();
  }
  if (material.name === 'SKIN') {
    material.color.set('#262c31');
    material.roughness = 0.85;
  }
  if (/Black_plastick|Carbon_black|Potolok/.test(material.name)) {
    material.color.set('#15191d');
    material.roughness = 0.7;
    material.metalness = 0.05;
  }
  if (material.name === 'glass2') {
    material.color.set('#7799ae');
    material.opacity = 0.1;
    material.transparent = true;
    material.depthWrite = false;
  }
  if (material.name === 'Glass_headlight') {
    material.opacity = 0.12;
    material.transparent = true;
    material.depthWrite = false;
  }
  if (material.name === 'headlight_white_color') {
    material.color.set('#ffffff');
    material.emissive.set('#dcefff');
    material.emissiveIntensity = 2;
  }
  originalTriangles += g.index.count / 3;
  if (g.index.count > 1800) {
    const ratio = material.name === 'corpus1' ? 0.25 : 0.055;
    const error = material.name === 'corpus1' ? 0.0005 : 0.003;
    const [indices] = MeshoptSimplifier.simplify(
      g.index.array,
      g.attributes.position.array,
      3,
      Math.max(300, Math.floor((g.index.count * ratio) / 3) * 3),
      error,
    );
    g.setIndex(new THREE.BufferAttribute(indices, 1));
  }
  if (doorNames.has(node.name) || node.name === 'polySurface214_Black_plastick1_0') {
    const p = g.attributes.position,
      indices = g.index.array,
      yes = [],
      no = [];
    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i],
        b = indices[i + 1],
        c = indices[i + 2];
      const driver = p.getX(a) + p.getX(b) + p.getX(c) > 0;
      const front =
        node.name !== 'polySurface214_Black_plastick1_0' ||
        (p.getZ(a) + p.getZ(b) + p.getZ(c)) / 3 > -0.3;
      (driver && front ? yes : no).push(a, b, c);
    }
    if (yes.length) {
      const part = g.clone();
      part.setIndex(yes);
      add(part, material, true);
    }
    g.setIndex(no);
  }
  add(g, material, false);
});
let triangles = 0;
for (const { geometries, material, moving } of batches.values()) {
  const merged = mergeGeometries(geometries);
  merged.computeBoundingSphere();
  const mesh = new THREE.Mesh(merged, material);
  mesh.name = `${moving ? 'door' : 'body'}_${material.name}`;
  triangles += merged.index.count / 3;
  (moving ? door : body).add(mesh);
}
const display = new THREE.Object3D();
display.name = 'display_anchor';
display.position.set(-0.105, 0.92, 0.48);
display.rotation.set(-0.12, Math.PI, 0);
car.add(display);
const driver = new THREE.Object3D();
driver.name = 'driver_camera_anchor';
driver.position.set(-0.015, 1.015, -0.135);
car.add(driver);
const bounds = new THREE.Box3().setFromObject(car);
const exported = await new GLTFExporter().parseAsync(car, { binary: true, onlyVisible: false });
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const doc = await io.readBinary(new Uint8Array(exported));
await doc.transform(
  dedup(),
  prune({ keepLeaves: true }),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
);
await mkdir('public/models', { recursive: true });
await mkdir('assets', { recursive: true });
await io.write('public/models/taycan-preview.glb', doc);
const manifest = {
  id: 'taycan-preview',
  creator: 'Mikhail Hamanovich',
  sourceUrl: 'https://sketchfab.com/3d-models/porshe-taycan-c6004141452e4d3ab048bf0fee52666d',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  attribution: 'Porshe Taycan by Mikhail Hamanovich, adapted under CC BY 4.0.',
  sourceAcquired: '2026-09-13',
  preparedAt: new Date().toISOString(),
  sourceGeometrySha256: hash.digest('hex'),
  modifications: [
    'Offline mesh simplification',
    'Driver-door extraction and hinge from approved film',
    'Silver paint and cabin material tuning',
    'Flat badge materials without the source badge atlas',
    'Material batching, vertex quantization and Meshopt compression',
    'Display and camera anchors',
  ],
  runtimeFiles: [
    {
      path: '/models/taycan-preview.glb',
      bytes: (await stat('public/models/taycan-preview.glb')).size,
    },
  ],
  qualityTier: 'prototype',
  originalTriangles,
  triangles,
  drawMeshes: batches.size,
  bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
  limitations: [
    'Cabin close-ups and door seams need refinement',
    'Wheel and steering articulation remains pending',
    'No vehicle colliders in this preview asset',
  ],
};
await writeFile('assets/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(
  JSON.stringify({
    originalTriangles,
    triangles,
    meshes: batches.size,
    bytes: manifest.runtimeFiles[0].bytes,
  }),
);
