import * as THREE from 'three';
import type { Koi } from '@/lib/pond';

const RINGS = 28;
const SIDES = 20;
const HEAD = 47;
const BODY_LENGTH = 95;
const TAU = Math.PI * 2;

type Fin = {
  group: THREE.Group;
  x: number;
  y: number;
  z: number;
  side: number;
  kind: 'pectoral' | 'pelvic' | 'tail';
};

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function softNoise(seed: number) {
  const random = seeded(seed);
  const grid = Float32Array.from({ length: 1024 }, random);
  return (x: number, y: number) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const sx = x - ix;
    const sy = y - iy;
    const tx = sx * sx * (3 - 2 * sx);
    const ty = sy * sy * (3 - 2 * sy);
    const get = (gx: number, gy: number) => grid[((gy & 31) << 5) + (gx & 31)];
    return THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(get(ix, iy), get(ix + 1, iy), tx),
      THREE.MathUtils.lerp(get(ix, iy + 1), get(ix + 1, iy + 1), tx),
      ty,
    );
  };
}

/** Original coat texture: irregular pigment fields over a restrained scale pattern. */
function makeCoat(pattern: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 384;
  const context = canvas.getContext('2d');
  if (!context) return null;
  const image = context.createImageData(canvas.width, canvas.height);
  const noise = softNoise(5483 + pattern * 2917);
  const color = new THREE.Color();
  const pale = new THREE.Color('#edead6');
  const red = new THREE.Color(pattern === 1 ? '#d8601e' : '#cb4428');
  const black = new THREE.Color('#34382f');
  const gold = new THREE.Color('#d5a64c');
  const patch = (u: number, v: number, x: number, y: number, w: number, h: number) =>
    Math.exp(-(((u - x) / w) ** 2 + ((v - y) / h) ** 2));

  // Work in sRGB here; CanvasTexture performs the single sRGB-to-linear conversion.
  for (let y = 0; y < canvas.height; y++) {
    const v = y / canvas.height;
    for (let x = 0; x < canvas.width; x++) {
      const u = x / canvas.width;
      const grain = noise(u * 49, v * 24);
      const irregularity = noise(u * 19, v * 13) * 0.32 + noise(u * 41, v * 31) * 0.09;
      const back = Math.max(0, Math.cos((v - 0.5) * TAU));
      color.copy(pale);
      if (pattern === 0) {
        const pigment =
          patch(u, v, 0.12, 0.47, 0.115, 0.15) +
          patch(u, v, 0.39, 0.54, 0.125, 0.18) +
          patch(u, v, 0.65, 0.44, 0.13, 0.15);
        color.lerp(red, THREE.MathUtils.smoothstep(pigment + irregularity, 0.55, 0.63));
      } else if (pattern === 1) {
        color.lerp(gold, 0.35 + 0.48 * back);
        color.lerp(red, THREE.MathUtils.smoothstep(back + irregularity, 0.4, 0.8) * 0.88);
        const white = patch(u, v, 0.49, 0.55, 0.085, 0.16);
        color.lerp(pale, THREE.MathUtils.smoothstep(white - irregularity, 0.37, 0.48) * 0.75);
      } else if (pattern === 2) {
        const dark =
          patch(u, v, 0.29, 0.46, 0.11, 0.19) +
          patch(u, v, 0.68, 0.52, 0.115, 0.18) +
          patch(u, v, 0.84, 0.41, 0.09, 0.1);
        const pigment = patch(u, v, 0.08, 0.53, 0.12, 0.17) + patch(u, v, 0.48, 0.55, 0.115, 0.18);
        color.lerp(red, THREE.MathUtils.smoothstep(pigment + irregularity, 0.6, 0.68));
        color.lerp(black, THREE.MathUtils.smoothstep(dark + irregularity, 0.59, 0.66));
      } else {
        color.lerp(gold, 0.46 + back * 0.48);
        const dark = patch(u, v, 0.33, 0.5, 0.1, 0.14) + patch(u, v, 0.65, 0.49, 0.14, 0.13);
        color.lerp(black, THREE.MathUtils.smoothstep(dark + irregularity, 0.7, 0.78) * 0.82);
      }
      const light = 0.94 + grain * 0.06;
      const i = (y * canvas.width + x) * 4;
      image.data[i] = Math.round(THREE.MathUtils.clamp(color.r * light, 0, 1) ** (1 / 2.2) * 255);
      image.data[i + 1] = Math.round(
        THREE.MathUtils.clamp(color.g * light, 0, 1) ** (1 / 2.2) * 255,
      );
      image.data[i + 2] = Math.round(
        THREE.MathUtils.clamp(color.b * light, 0, 1) ** (1 / 2.2) * 255,
      );
      image.data[i + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  // Fine overlapping crescents follow the longitudinal growth of real koi scales.
  // Low contrast keeps the markings legible at small screen sizes.
  context.lineWidth = 0.9;
  for (let row = 0; row < 33; row++) {
    for (let col = 8; col < 77; col++) {
      const x = col * 9.5 + (row % 2) * 4.75;
      const y = row * 12;
      context.strokeStyle = 'rgba(45,43,28,0.10)';
      context.beginPath();
      context.ellipse(x, y, 7.4, 6.3, 0, -0.88, 0.88);
      context.stroke();
      context.strokeStyle = 'rgba(255,252,217,0.12)';
      context.beginPath();
      context.ellipse(x - 0.7, y - 0.7, 7.4, 6.3, 0, -0.88, 0.88);
      context.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

const profile = [
  [0, 1.5, 1.2],
  [0.045, 5.2, 3.6],
  [0.14, 10.0, 6.8],
  [0.3, 13.4, 9.0],
  [0.43, 12.9, 8.8],
  [0.6, 9.7, 6.5],
  [0.78, 5.2, 3.8],
  [0.94, 2.0, 1.9],
  [1, 1.1, 1.4],
];

function crossSection(t: number) {
  let index = 1;
  while (index < profile.length - 1 && t > profile[index][0]) index++;
  const a = profile[index - 1];
  const b = profile[index];
  let mix = THREE.MathUtils.clamp((t - a[0]) / (b[0] - a[0]), 0, 1);
  mix = mix * mix * (3 - 2 * mix);
  return [THREE.MathUtils.lerp(a[1], b[1], mix), THREE.MathUtils.lerp(a[2], b[2], mix)];
}

function fanGeometry(outline: number[][]) {
  const geometry = new THREE.BufferGeometry();
  const vertices = [0, 0, 0];
  const indices: number[] = [];
  for (const [x, y] of outline) vertices.push(x, y, 0.32 * Math.sin((-x / 26) * Math.PI));
  for (let index = 1; index < outline.length; index++) indices.push(0, index, index + 1);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** A small volumetric fish in local coordinates; +X is its head and +Z its back. */
export function createKoiModel(pattern: number) {
  const group = new THREE.Group();
  const texture = makeCoat(pattern);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    color: texture ? 0xffffff : 0xddb87a,
    roughness: 0.36,
    metalness: 0.025,
  });
  const bodyGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array((RINGS + 1) * (SIDES + 1) * 3);
  const uvs = new Float32Array((RINGS + 1) * (SIDES + 1) * 2);
  const indices: number[] = [];
  const radii = Array.from({ length: RINGS + 1 }, (_, ring) => crossSection(ring / RINGS));
  for (let ring = 0; ring <= RINGS; ring++) {
    for (let side = 0; side <= SIDES; side++) {
      const index = ring * (SIDES + 1) + side;
      uvs[index * 2] = ring / RINGS;
      uvs[index * 2 + 1] = side / SIDES;
      if (ring < RINGS && side < SIDES) {
        const next = index + SIDES + 1;
        indices.push(index, next, index + 1, next, next + 1, index + 1);
      }
    }
  }
  bodyGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage),
  );
  bodyGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  bodyGeometry.setIndex(indices);
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.castShadow = true;
  body.receiveShadow = true;
  body.frustumCulled = false;
  group.add(body);

  const finMaterial = new THREE.MeshStandardMaterial({
    color: pattern === 1 || pattern === 3 ? 0xd1ad69 : 0xd8d6b8,
    roughness: 0.57,
    transparent: true,
    opacity: 0.63,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const rayMaterial = new THREE.LineBasicMaterial({
    color: pattern === 1 || pattern === 3 ? 0xb48d54 : 0xb8b9a0,
    transparent: true,
    opacity: 0.36,
    depthWrite: false,
  });
  const fins: Fin[] = [];
  const finGeometries: THREE.BufferGeometry[] = [];
  const pectoral = [
    [-1, 2],
    [-3, 7],
    [-7, 11.8],
    [-11, 13],
    [-15, 12.2],
    [-17, 9],
    [-15, 6],
    [-11, 3],
    [-5, 1],
  ];
  const tail = [
    [-3, 2],
    [-7, 5],
    [-14, 9],
    [-24, 13.5],
    [-26, 12.5],
    [-23, 8],
    [-18, 3],
    [-15, 0],
    [-18, -3],
    [-23, -8],
    [-26, -12.5],
    [-24, -13.5],
    [-14, -9],
    [-7, -5],
    [-3, -2],
  ];

  function addFin(x: number, y: number, z: number, side: number, kind: Fin['kind']) {
    const finGroup = new THREE.Group();
    const outline = kind === 'tail' ? tail : pectoral;
    const geometry = fanGeometry(outline);
    finGeometries.push(geometry);
    finGroup.add(new THREE.Mesh(geometry, finMaterial));
    const rays: number[] = [];
    for (const [px, py] of outline) {
      if (Math.abs(py) < 2) continue;
      rays.push(-1, 0, 0.15, px * 0.48, py * 0.45, 0.7);
      rays.push(px * 0.48, py * 0.45, 0.7, px * 0.94, py * 0.94, 0.2);
    }
    const rayGeometry = new THREE.BufferGeometry();
    rayGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rays, 3));
    finGeometries.push(rayGeometry);
    finGroup.add(new THREE.LineSegments(rayGeometry, rayMaterial));
    finGroup.scale.set(1, side, 1);
    if (kind === 'pelvic') finGroup.scale.multiplyScalar(0.6);
    group.add(finGroup);
    fins.push({ group: finGroup, x, y, z, side, kind });
  }
  addFin(16, 10.8, -1.8, 1, 'pectoral');
  addFin(16, -10.8, -1.8, -1, 'pectoral');
  addFin(-14, 7.8, -1.2, 1, 'pelvic');
  addFin(-14, -7.8, -1.2, -1, 'pelvic');
  addFin(HEAD - BODY_LENGTH, 0, 0.25, 1, 'tail');

  // Eyes remain small and lateral: the back carries the visual focus.
  const eyeGeometry = new THREE.SphereGeometry(1.25, 10, 8);
  const eyeMaterial = new THREE.MeshStandardMaterial({
    color: 0x111914,
    roughness: 0.18,
  });
  const glintGeometry = new THREE.SphereGeometry(0.32, 6, 4);
  const glintMaterial = new THREE.MeshBasicMaterial({ color: 0xe9eee4 });
  const features: {
    object: THREE.Object3D;
    x: number;
    y: number;
    z: number;
  }[] = [];
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye.scale.set(0.9, 1, 0.68);
    group.add(eye);
    features.push({ object: eye, x: 36.3, y: side * 7.3, z: 4.5 });
    const glint = new THREE.Mesh(glintGeometry, glintMaterial);
    group.add(glint);
    features.push({ object: glint, x: 36.8, y: side * 7.05, z: 5.28 });
  }

  const detailMaterial = new THREE.LineBasicMaterial({
    color: 0x746b52,
    transparent: true,
    opacity: 0.24,
  });
  const detailGeometries: THREE.BufferGeometry[] = [];
  for (const side of [-1, 1]) {
    const points = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      points.push(
        new THREE.Vector3(27 - Math.sin(t * Math.PI) * 2.7, side * (5.1 + t * 5.8), 7.4 - t * 3.2),
      );
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    detailGeometries.push(geometry);
    group.add(new THREE.Line(geometry, detailMaterial));
  }
  // A slender dorsal membrane is visible as a raised ridge, not an oversized sail.
  const dorsalGeometry = new THREE.BufferGeometry();
  const dorsalPositions = new Float32Array(14 * 3);
  const dorsalIndices: number[] = [];
  for (let i = 0; i < 6; i++) {
    dorsalIndices.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  }
  dorsalGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(dorsalPositions, 3).setUsage(THREE.DynamicDrawUsage),
  );
  dorsalGeometry.setIndex(dorsalIndices);
  const dorsal = new THREE.Mesh(dorsalGeometry, finMaterial);
  dorsal.frustumCulled = false;
  group.add(dorsal);

  function update(fish: Koi) {
    const phase = fish.tailPhase;
    const bend = THREE.MathUtils.clamp(fish.bend, -1, 1);
    const effort = THREE.MathUtils.clamp(fish.currentSpeed / Math.max(1, fish.speed), 0, 2.6);
    const amplitude = 1.35 + effort * 0.62 + fish.energy * 0.65;
    // Positive world heading is clockwise in this coordinate system, so bend is inverted.
    const spine = (x: number) => {
      const t = THREE.MathUtils.clamp((HEAD - x) / BODY_LENGTH, 0, 1.28);
      const envelope = t * t;
      return -bend * 19 * envelope + Math.sin(phase - t * 4.4) * amplitude * envelope;
    };
    const tangent = (x: number) => Math.atan2(spine(x + 0.5) - spine(x - 0.5), 1);
    for (let ring = 0; ring <= RINGS; ring++) {
      const t = ring / RINGS;
      const x = HEAD - t * BODY_LENGTH;
      const y = spine(x);
      const angle = tangent(x);
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      const [width, height] = radii[ring];
      for (let side = 0; side <= SIDES; side++) {
        const around = (side / SIDES) * TAU - Math.PI / 2;
        const lateral = Math.cos(around) * width;
        const vertical = Math.sin(around) * height;
        const index = (ring * (SIDES + 1) + side) * 3;
        positions[index] = x - lateral * sin;
        positions[index + 1] = y + lateral * cos;
        // A flatter belly, a rounder back and a softly raised shoulder.
        positions[index + 2] = vertical * (vertical < 0 ? 0.7 : 1) + Math.sin(t * Math.PI) * 0.7;
      }
    }
    bodyGeometry.attributes.position.needsUpdate = true;
    bodyGeometry.computeVertexNormals();

    for (const fin of fins) {
      const angle = tangent(fin.x);
      fin.group.position.set(
        fin.x - fin.y * Math.sin(angle),
        spine(fin.x) + fin.y * Math.cos(angle),
        fin.z,
      );
      fin.group.rotation.z = angle;
      if (fin.kind === 'tail') {
        fin.group.rotation.z += Math.sin(phase - 4.85) * 0.16;
        fin.group.rotation.x = Math.sin(phase - 4) * 0.04;
      } else {
        fin.group.rotation.z +=
          fin.side * (Math.sin(phase * 0.55 + fin.side * 0.4) * 0.055 + Math.abs(bend) * 0.035);
        fin.group.rotation.x = Math.sin(phase * 0.7 + fin.side * 0.7) * 0.12;
      }
    }
    for (const feature of features) {
      const angle = tangent(feature.x);
      feature.object.position.set(
        feature.x - feature.y * Math.sin(angle),
        spine(feature.x) + feature.y * Math.cos(angle),
        feature.z,
      );
    }
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const x = 14 - t * 45;
      const bodyT = (HEAD - x) / BODY_LENGTH;
      const z = crossSection(bodyT)[1] + 0.55;
      const height = Math.sin(Math.PI * t) * 4.7;
      dorsalPositions.set(
        [x, spine(x), z, x - 2, spine(x) + Math.sin(phase - t) * 0.3, z + height],
        i * 6,
      );
    }
    dorsalGeometry.attributes.position.needsUpdate = true;
    dorsalGeometry.computeVertexNormals();
  }

  function dispose() {
    bodyGeometry.dispose();
    bodyMaterial.dispose();
    texture?.dispose();
    for (const geometry of finGeometries) geometry.dispose();
    finMaterial.dispose();
    rayMaterial.dispose();
    eyeGeometry.dispose();
    eyeMaterial.dispose();
    glintGeometry.dispose();
    glintMaterial.dispose();
    detailMaterial.dispose();
    for (const geometry of detailGeometries) geometry.dispose();
    dorsalGeometry.dispose();
  }

  return { group, update, dispose };
}
