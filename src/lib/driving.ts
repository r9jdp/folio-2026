export type DriveInput = {
  throttle: number;
  brake: number;
  /** Positive values steer right. */
  steer: number;
};

export type DriveState = {
  /** Logical forward Z coordinate, independent of the recycled render world. */
  distance: number;
  /** Metres per second. */
  speed: number;
  /** Metres to the right of the road centre. */
  offset: number;
  /** Radians to the right of the local road tangent. */
  heading: number;
  steering: number;
  elapsed: number;
  /** A transient 0–1 guardrail contact signal for audio and visual feedback. */
  impact: number;
};

export const ROAD_HALF_WIDTH = 7.2;
export const MAX_SPEED = 72;
const BODY_HALF_WIDTH = 1.02;
const MAX_STEP = 1 / 120;
const MAX_FRAME = 0.1;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const finite = (value: number, fallback = 0) => (Number.isFinite(value) ? value : fallback);

/** Analytic road samples ensure adjacent recycled segments always share an edge. */
export function roadCenter(distance: number): number {
  const d = finite(distance);
  return 52 * Math.sin(d / 290) - 26 * Math.sin(d / 145) + 18 * Math.sin(d / 520);
}

/** Exact derivative of roadCenter; no sampled tangent discontinuities. */
export function roadSlope(distance: number): number {
  const d = finite(distance);
  return (
    (52 / 290) * Math.cos(d / 290) - (26 / 145) * Math.cos(d / 145) + (18 / 520) * Math.cos(d / 520)
  );
}

export function createDriveState(): DriveState {
  return {
    distance: 0,
    speed: 0,
    offset: 0,
    heading: 0,
    steering: 0,
    elapsed: 0,
    impact: 0,
  };
}

/**
 * Small arcade controller with speed-sensitive steering and forgiving barriers.
 * Call from a fixed-step loop; the subdivisions also bound an accidental long
 * frame. Hidden-tab time is intentionally discarded rather than caught up.
 */
export function stepDrive(state: DriveState, input: DriveInput, dt: number): void {
  if (!Number.isFinite(dt) || dt <= 0) return;

  const frame = Math.min(dt, MAX_FRAME);
  const count = Math.ceil(frame / MAX_STEP);
  const step = frame / count;
  const throttle = clamp(finite(input.throttle), 0, 1);
  const brake = clamp(finite(input.brake), 0, 1);
  const steer = clamp(finite(input.steer), -1, 1);
  const limit = ROAD_HALF_WIDTH - BODY_HALF_WIDTH;

  state.distance = Math.max(0, finite(state.distance));
  state.speed = clamp(finite(state.speed), 0, MAX_SPEED);
  state.offset = clamp(finite(state.offset), -limit, limit);
  state.heading = clamp(finite(state.heading), -0.55, 0.55);
  state.steering = clamp(finite(state.steering), -1, 1);
  state.elapsed = Math.max(0, finite(state.elapsed));
  state.impact = clamp(finite(state.impact), 0, 1);

  for (let i = 0; i < count; i += 1) {
    const previousSpeed = state.speed;
    const drive = throttle * (1 - brake) * (11.8 - 3.8 * (state.speed / MAX_SPEED));
    const resistance = state.speed > 0 ? 0.3 + state.speed * state.speed * 0.00065 : 0;
    state.speed = clamp(state.speed + (drive - brake * 23 - resistance) * step, 0, MAX_SPEED);
    state.steering += (steer - state.steering) * (1 - Math.exp(-7 * step));

    // Keep a small steering angle at high speed, while retaining low-speed turn authority.
    const maxHeading = 0.38 / (1 + state.speed / 35);
    const targetHeading = state.steering * maxHeading * (state.speed / (state.speed + 2));
    state.heading += (targetHeading - state.heading) * (1 - Math.exp(-4.2 * step));

    const tangent = Math.atan(roadSlope(state.distance));
    const worldHeading = tangent + state.heading;
    const travelled = ((previousSpeed + state.speed) / 2) * step;
    const nextDistance = state.distance + travelled * Math.cos(worldHeading);
    state.offset +=
      travelled * Math.sin(worldHeading) - (roadCenter(nextDistance) - roadCenter(state.distance));
    state.heading -= Math.atan(roadSlope(nextDistance)) - tangent;
    state.distance = nextDistance;
    state.elapsed += step;
    state.impact *= Math.exp(-4.5 * step);

    if (Math.abs(state.offset) > limit) {
      const side = Math.sign(state.offset);
      state.offset = side * limit;
      state.impact = Math.max(
        state.impact,
        clamp(state.speed / 35 + Math.abs(state.heading), 0.15, 1),
      );
      state.speed *= 1 - Math.min(0.24, 0.05 + Math.abs(state.heading) * 0.75);
      // A gentle inward deflection makes a sustained scrape recoverable.
      state.heading = -side * Math.min(0.06, Math.abs(state.heading) * 0.25);
    }
  }
}
