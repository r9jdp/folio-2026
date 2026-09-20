import assert from 'node:assert/strict';
import test from 'node:test';
import { advancePond, createKoi, disturbPond, POND_HEIGHT, POND_WIDTH } from '../src/lib/pond';

test('touching a fish changes its stimulus without snapping its visible pose', () => {
  const fish = createKoi();
  const before = { ...fish[0] };
  disturbPond(fish, fish[0].x + 3, fish[0].y);
  assert.ok(fish[0].stimulusStrength > 0.9);
  for (const key of ['x', 'y', 'heading', 'currentSpeed', 'tailPhase', 'bend', 'energy'] as const) {
    assert.equal(fish[0][key], before[key], key);
  }
  assert.equal(fish[3].stimulusStrength, 0);
  advancePond(fish, 1 / 60, 0);
  assert.ok(fish[0].energy > 0);
  for (let frame = 0; frame < 900; frame++) advancePond(fish, 1 / 60, frame / 60);
  assert.ok(fish[0].energy < 0.0001);
});

test('touch responses keep turn, acceleration and body strokes continuous', () => {
  const fish = createKoi();
  const dt = 1 / 120;
  for (let frame = 0; frame < 120 * 35; frame++) {
    if (frame % 100 === 0) disturbPond(fish, fish[0].x + 8, fish[0].y - 4);
    const previous = fish.map((koi) => ({ ...koi }));
    advancePond(fish, dt, frame * dt);
    fish.forEach((koi, index) => {
      const before = previous[index];
      assert.ok(Math.abs(koi.turnRate - before.turnRate) <= 1.45 * dt + 1e-10);
      assert.ok(Math.abs(koi.currentSpeed - before.currentSpeed) <= 30 * dt + 1e-10);
      assert.ok(Math.abs(koi.heading - before.heading) <= 1.05 * dt + 1e-10);
      assert.ok(koi.tailPhase > before.tailPhase);
      assert.ok(koi.tailPhase - before.tailPhase < 0.1);
      assert.ok(Math.hypot(koi.x - before.x, koi.y - before.y) <= koi.currentSpeed * dt + 1e-8);
    });
  }
});

test('the pond remains finite and every fish stays in view during a long disturbed session', () => {
  const fish = createKoi();
  for (let frame = 0; frame < 60 * 60 * 5; frame++) {
    if (frame % 300 === 0) {
      const target = fish[(frame / 300) % fish.length];
      disturbPond(fish, target.x + 20, target.y - 8, 1.5);
    }
    advancePond(fish, 1 / 60, frame / 60);
    for (const koi of fish) {
      for (const value of Object.values(koi)) assert.ok(Number.isFinite(value));
      assert.ok(koi.x >= 58 && koi.x <= POND_WIDTH - 58, `x = ${koi.x}`);
      assert.ok(koi.y >= 55 && koi.y <= POND_HEIGHT - 55, `y = ${koi.y}`);
    }
  }
});

test('the same touches give the same trajectories at 30, 60 and 120 frames per second', () => {
  const simulations = [30, 60, 120].map((fps) => {
    const fish = createKoi();
    for (let frame = 0; frame < fps * 30; frame++) {
      if (frame % (fps * 3) === 0) disturbPond(fish, 390, 260);
      advancePond(fish, 1 / fps, frame / fps);
    }
    return fish;
  });
  for (const fish of simulations.slice(1)) {
    fish.forEach((koi, index) => {
      const expected = simulations[0][index];
      assert.ok(Math.hypot(koi.x - expected.x, koi.y - expected.y) < 0.00001);
      assert.ok(Math.abs(koi.heading - expected.heading) < 0.00001);
      assert.ok(Math.abs(koi.tailPhase - expected.tailPhase) < 0.00001);
    });
  }
});

test('pausing and invalid time steps do not advance the pose or stroke', () => {
  const fish = createKoi();
  const before = structuredClone(fish);
  for (const delta of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    advancePond(fish, delta, 1e8);
  }
  assert.deepEqual(fish, before);
  disturbPond(fish, Number.NaN, 10);
  disturbPond(fish, 10, Number.POSITIVE_INFINITY);
  disturbPond(fish, 10, 10, Number.NaN);
  assert.deepEqual(fish, before);
});
