import assert from 'node:assert/strict';
import { test } from 'node:test';
import { terrainColumn, terrainHeight, terrainSample } from '../src/lib/drive-terrain';
import { roadCenter } from '../src/lib/driving';

test('terrain samples match mesh vertices and both indexed triangle interiors', () => {
  for (const side of [-1, 1]) {
    assert.equal(terrainColumn(0, side), 8.7);
    assert.equal(terrainColumn(28, side), 8.7 + (side === 1 ? 360 : 1300));
    for (const z of [-240, 0, 1080, 1_000_000]) {
      for (let column = 0; column <= 28; column += 1) {
        const lateral = terrainColumn(column, side);
        assert.ok(
          Math.abs(terrainSample(lateral, z, side) - terrainHeight(lateral, z, side)) < 1e-9,
        );
      }
      const left = terrainColumn(8, side);
      const right = terrainColumn(9, side);
      const a = terrainHeight(left, z, side);
      const b = terrainHeight(right, z, side);
      const c = terrainHeight(left, z + 40, side);
      const d = terrainHeight(right, z + 40, side);
      // A barycentric point in the mesh has a chord-interpolated world X.
      // Convert that world point back to the API's road-relative lateral value.
      const firstLateral =
        left +
        (right - left) * 0.2 -
        side * (roadCenter(z + 12) - (roadCenter(z) * 0.7 + roadCenter(z + 40) * 0.3));
      const secondLateral =
        left +
        (right - left) * 0.8 -
        side * (roadCenter(z + 28) - (roadCenter(z) * 0.3 + roadCenter(z + 40) * 0.7));
      const first = terrainSample(firstLateral, z + 12, side);
      const second = terrainSample(secondLateral, z + 28, side);
      assert.ok(Math.abs(first - (a * 0.5 + b * 0.2 + c * 0.3)) < 1e-9);
      assert.ok(Math.abs(second - (b * 0.3 + c * 0.2 + d * 0.5)) < 1e-9);
    }
  }
});

test('placement heights stay continuous across triangle, row, and column boundaries', () => {
  const epsilon = 1e-6;
  for (const side of [-1, 1]) {
    const left = terrainColumn(8, side);
    const right = terrainColumn(9, side);
    const lateral = left + (right - left) * 0.3;
    for (const z of [-80, 0, 1_040, 10_000_000]) {
      const rowBefore = terrainSample(lateral, z - epsilon, side);
      const rowAfter = terrainSample(lateral, z + epsilon, side);
      assert.ok(Math.abs(rowAfter - rowBefore) < 1e-5);
      const diagonalZ = z + 28;
      const diagonalLateral =
        lateral - side * (roadCenter(diagonalZ) - (roadCenter(z) * 0.3 + roadCenter(z + 40) * 0.7));
      const columnLateral =
        right -
        side * (roadCenter(z + 17) - (roadCenter(z) * (23 / 40) + roadCenter(z + 40) * (17 / 40)));
      assert.ok(
        Math.abs(
          terrainSample(diagonalLateral, diagonalZ - epsilon, side) -
            terrainSample(diagonalLateral, diagonalZ + epsilon, side),
        ) < 1e-5,
      );
      assert.ok(
        Math.abs(
          terrainSample(columnLateral - epsilon, z + 17, side) -
            terrainSample(columnLateral + epsilon, z + 17, side),
        ) < 1e-5,
      );
    }
  }
});
