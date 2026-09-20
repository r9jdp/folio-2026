import assert from 'node:assert/strict';
import test from 'node:test';
import { advancePond, createKoi, disturbPond, POND_HEIGHT, POND_WIDTH } from '../src/lib/pond';

test('the pond remains finite and every fish stays in view over a long session', () => {
  const fish = createKoi();
  for (let frame = 0; frame < 60 * 60 * 5; frame++) {
    if (frame % 300 === 0) disturbPond(fish, 450, 290);
    advancePond(fish, 1 / 60, frame / 60);
    for (const koi of fish) {
      assert.ok(Number.isFinite(koi.heading));
      assert.ok(koi.x >= 58 && koi.x <= POND_WIDTH - 58);
      assert.ok(koi.y >= 55 && koi.y <= POND_HEIGHT - 55);
    }
  }
});

test('a tap only startles nearby fish and that burst settles', () => {
  const fish = createKoi();
  disturbPond(fish, fish[0].x + 3, fish[0].y);
  assert.ok(fish[0].energy > 1);
  assert.equal(fish[3].energy, 0);
  for (let frame = 0; frame < 600; frame++) advancePond(fish, 1 / 60, frame / 60);
  assert.ok(fish[0].energy < 0.001);
});
