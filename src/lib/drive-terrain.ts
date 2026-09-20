import { roadCenter } from './driving';

const INNER = 8.7;
const COLUMNS = 28;
const ROW_STEP = 40;

/** Shared by the rendered terrain and the placement sampler. */
export function terrainColumn(column: number, side: number): number {
  return (
    INNER +
    Math.pow(Math.max(0, Math.min(COLUMNS, column)) / COLUMNS, 1.7) * (side === 1 ? 360 : 1300)
  );
}

export function terrainHeight(lateral: number, z: number, side: number): number {
  const rise = Math.max(0, lateral - 12);
  const waves =
    (Math.sin(z * 0.005 + lateral * 0.007) + Math.sin(z * 0.012 - lateral * 0.019) * 0.35 + 1.5) /
    2.7;
  if (side === 1)
    return (
      -0.15 +
      Math.sin(lateral * 0.038 + z * 0.011) * Math.min(3, rise * 0.05) -
      Math.pow(rise / 85, 1.8)
    );
  return (
    -0.15 +
    Math.min(260, Math.pow(rise / 7, 1.22)) * waves +
    Math.sin(z * 0.05 + lateral * 0.085) * Math.min(4, rise * 0.04)
  );
}

/**
 * Height on the actual rendered triangles, rather than the analytic surface.
 * Each cell uses indices (a, c, b), (b, c, d), with a at its near inner corner.
 * The road-relative lateral coordinate uses the same column spacing as the mesh.
 */
export function terrainSample(lateral: number, z: number, side: number): number {
  const near = Math.floor(z / ROW_STEP) * ROW_STEP;
  const v = (z - near) / ROW_STEP;
  // Terrain rows follow the chord between road samples; scenery follows the
  // analytic road. Convert its lateral coordinate into that rendered chord.
  const chordCenter = roadCenter(near) * (1 - v) + roadCenter(near + ROW_STEP) * v;
  const meshLateral = lateral + side * (roadCenter(z) - chordCenter);
  const span = side === 1 ? 360 : 1300;
  const normalized = Math.max(0, Math.min(1, (meshLateral - INNER) / span));
  const column = Math.min(COLUMNS - 1, Math.floor(Math.pow(normalized, 1 / 1.7) * COLUMNS));
  const left = terrainColumn(column, side);
  const right = terrainColumn(column + 1, side);
  const u = Math.max(0, Math.min(1, (meshLateral - left) / (right - left)));
  const a = terrainHeight(left, near, side);
  const b = terrainHeight(right, near, side);
  const c = terrainHeight(left, near + ROW_STEP, side);
  if (u + v <= 1) return a * (1 - u - v) + b * u + c * v;
  const d = terrainHeight(right, near + ROW_STEP, side);
  return b * (1 - v) + c * (1 - u) + d * (u + v - 1);
}
