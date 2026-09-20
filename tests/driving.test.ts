import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createDriveState,
  MAX_SPEED,
  ROAD_HALF_WIDTH,
  roadCenter,
  roadSlope,
  stepDrive,
  type DriveInput,
  type DriveState,
} from '../src/lib/driving';

const neutral: DriveInput = { throttle: 0, brake: 0, steer: 0 };
const accelerating: DriveInput = { throttle: 1, brake: 0, steer: 0 };
function advance(state: DriveState, input: DriveInput, seconds: number, hz = 120) {
  for (let i = 0; i < Math.round(seconds * hz); i += 1) stepDrive(state, input, 1 / hz);
}

test('a parked car stays still, then throttle makes forward progress within the speed limit', () => {
  const state = createDriveState();
  advance(state, neutral, 2);
  assert.equal(state.distance, 0);
  assert.equal(state.speed, 0);
  advance(state, accelerating, 15);
  assert.ok(state.distance > 400);
  assert.ok(state.speed > 60 && state.speed <= MAX_SPEED);
  assert.ok(Math.abs(state.elapsed - 17) < 1e-9);
});

test('braking takes priority over throttle and never engages reverse', () => {
  const state = createDriveState();
  advance(state, accelerating, 4);
  const before = { ...state };
  advance(state, { throttle: 1, brake: 1, steer: 0 }, 4);
  assert.equal(state.speed, 0);
  assert.ok(state.distance > before.distance);
  const stoppedAt = state.distance;
  advance(state, { throttle: 0, brake: 1, steer: 0 }, 3);
  assert.equal(state.speed, 0);
  assert.equal(state.distance, stoppedAt);
});

test('releasing throttle coasts down instead of freezing or increasing speed', () => {
  const state = createDriveState();
  advance(state, accelerating, 4);
  const before = { ...state };
  advance(state, neutral, 3);
  assert.ok(state.speed > 0 && state.speed < before.speed);
  assert.ok(state.distance > before.distance);
});

test('positive steering moves right and releasing it centers the steering', () => {
  const state = createDriveState();
  state.speed = 22;
  advance(state, { ...neutral, steer: 1 }, 0.7);
  assert.ok(state.offset > 1);
  assert.ok(state.heading > 0);
  assert.ok(state.steering > 0.95);
  advance(state, neutral, 1.5);
  assert.ok(Math.abs(state.steering) < 0.001);
  assert.ok(Math.abs(state.heading) < 0.02);
});

test('guardrail contact slows the car and permits steering back onto the road', () => {
  const state = createDriveState();
  state.offset = ROAD_HALF_WIDTH - 1.04;
  state.speed = 55;
  state.heading = 0.2;
  state.steering = 1;
  stepDrive(state, { ...accelerating, steer: 1 }, 1 / 120);
  assert.ok(state.impact > 0);
  assert.ok(state.speed < 55);
  assert.ok(state.offset < ROAD_HALF_WIDTH - 1);
  const edge = state.offset;
  advance(state, { ...accelerating, steer: -1 }, 1.1);
  assert.ok(state.offset < edge - 1);
  assert.ok(state.impact < 0.1);
});

test('a long session has finite bounded state and never runs out of road', () => {
  const state = createDriveState();
  for (let i = 0; i < 120 * 60 * 20; i += 1) {
    const previousDistance = state.distance;
    const steer = Math.sin(i / 190) * 0.55;
    stepDrive(state, { throttle: 1, brake: i % 1500 < 35 ? 0.4 : 0, steer }, 1 / 120);
    assert.ok(Object.values(state).every(Number.isFinite));
    assert.ok(state.distance >= previousDistance);
    assert.ok(state.speed >= 0 && state.speed <= MAX_SPEED);
    assert.ok(Math.abs(state.offset) <= ROAD_HALF_WIDTH - 1);
    assert.ok(state.impact >= 0 && state.impact <= 1);
    assert.ok(Math.abs(state.heading) < 0.55);
  }
  assert.ok(state.distance > 20_000);
  assert.ok(Math.abs(state.elapsed - 1_200) < 1e-6);
});

test('road samples share continuous segment boundaries and accurate bounded tangents', () => {
  for (const origin of [0, 256, 4096, 99_840, 1_000_000, 10_000_000]) {
    const boundary = origin + 128;
    const epsilon = 0.01;
    const before = roadCenter(boundary - epsilon);
    const after = roadCenter(boundary + epsilon);
    const numericalSlope = (after - before) / (2 * epsilon);
    assert.ok(Math.abs(after - before) < 0.008);
    assert.ok(Math.abs(numericalSlope - roadSlope(boundary)) < 1e-7);
    assert.ok(Math.abs(roadSlope(boundary)) < 0.4);
    assert.equal(roadCenter(origin + 128), roadCenter(boundary));
  }
});

test('fixed-step subdivision gives equivalent results across 30, 60, and 120 Hz frames', () => {
  const states = [30, 60, 120].map((hz) => {
    const state = createDriveState();
    advance(state, accelerating, 5, hz);
    advance(state, { ...accelerating, steer: 0.3 }, 2, hz);
    advance(state, { ...neutral, brake: 0.5, steer: -0.2 }, 2, hz);
    return state;
  });
  for (const state of states.slice(1)) {
    for (const key of Object.keys(state) as (keyof DriveState)[]) {
      assert.ok(
        Math.abs(state[key] - states[0][key]) < 1e-9,
        `${key} changed with render frequency`,
      );
    }
  }
});

test('invalid inputs are ignored or clamped, and a suspended frame cannot teleport', () => {
  const state = createDriveState();
  for (const dt of [0, -1, NaN, Infinity]) stepDrive(state, accelerating, dt);
  assert.deepEqual(state, createDriveState());
  stepDrive(state, { throttle: NaN, brake: Infinity, steer: -Infinity }, 1 / 60);
  assert.equal(state.speed, 0);
  assert.equal(state.steering, 0);

  const normal = createDriveState();
  const bounded = createDriveState();
  stepDrive(normal, accelerating, 0.1);
  stepDrive(bounded, { throttle: 900, brake: -100, steer: NaN }, 60);
  assert.deepEqual(normal, bounded);
  assert.ok(bounded.elapsed <= 0.1000001);
  assert.ok(bounded.distance < 0.1);
  assert.ok(Number.isFinite(roadCenter(NaN)));
  assert.ok(Number.isFinite(roadSlope(Infinity)));
});

test('corrupted state values recover without leaking NaN into rendering', () => {
  const state: DriveState = {
    distance: Infinity,
    speed: NaN,
    offset: Infinity,
    heading: NaN,
    steering: Infinity,
    elapsed: NaN,
    impact: Infinity,
  };
  stepDrive(state, accelerating, 1 / 120);
  assert.ok(Object.values(state).every(Number.isFinite));
  assert.ok(state.distance >= 0 && state.speed >= 0);
});
