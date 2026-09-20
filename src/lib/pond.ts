export const POND_WIDTH = 900;
export const POND_HEIGHT = 580;

export type Koi = {
  x: number;
  y: number;
  heading: number;
  length: number;
  phase: number;
  /** Comfortable swimming speed, in pond pixels per second. */
  speed: number;
  energy: number;
  pattern: number;
  currentSpeed: number;
  turnRate: number;
  /** Integrated stroke phase. Never multiply wall time by a changing frequency. */
  tailPhase: number;
  bend: number;
  velocityX: number;
  velocityY: number;
  stimulusX: number;
  stimulusY: number;
  stimulusStrength: number;
};

export type PondRipple = { x: number; y: number; age: number };

const STEP = 1 / 120;
const clocks = new WeakMap<Koi[], { remainder: number; time: number }>();

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function smoothstep(start: number, end: number, value: number) {
  const t = clamp((value - start) / (end - start), 0, 1);
  return t * t * (3 - 2 * t);
}

export function createKoi(): Koi[] {
  return [
    {
      x: 295,
      y: 248,
      heading: -0.48,
      length: 114,
      phase: 1.1,
      speed: 21,
      pattern: 0,
    },
    {
      x: 526,
      y: 185,
      heading: 2.45,
      length: 97,
      phase: 3.2,
      speed: 18,
      pattern: 1,
    },
    {
      x: 576,
      y: 373,
      heading: -2.5,
      length: 119,
      phase: 5.1,
      speed: 23,
      pattern: 2,
    },
    {
      x: 698,
      y: 285,
      heading: 1.58,
      length: 87,
      phase: 7.3,
      speed: 19,
      pattern: 3,
    },
  ].map((fish) => ({
    ...fish,
    energy: 0,
    currentSpeed: fish.speed,
    turnRate: 0,
    tailPhase: fish.phase,
    bend: 0,
    velocityX: Math.cos(fish.heading) * fish.speed,
    velocityY: Math.sin(fish.heading) * fish.speed,
    stimulusX: fish.x,
    stimulusY: fish.y,
    stimulusStrength: 0,
  }));
}

function angleDifference(target: number, current: number) {
  return Math.atan2(Math.sin(target - current), Math.cos(target - current));
}

/** A touch creates a remembered disturbance; the following steps move the fish. */
export function disturbPond(fish: Koi[], x: number, y: number, strength = 1) {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(strength)) return;
  const intensity = clamp(strength, 0, 1.5);
  for (const koi of fish) {
    const distance = Math.hypot(koi.x - x, koi.y - y);
    const response = (1 - smoothstep(12, 168, distance)) * intensity;
    if (response <= 0 || response < koi.stimulusStrength * 0.7) continue;
    koi.stimulusX = x;
    koi.stimulusY = y;
    koi.stimulusStrength = Math.max(koi.stimulusStrength, response);
  }
}

function stepPond(fish: Koi[], time: number) {
  // All fish read the same positions. Array order cannot bias avoidance.
  const positions = fish.map(({ x, y }) => ({ x, y }));
  for (let index = 0; index < fish.length; index++) {
    const koi = fish[index];
    const forwardX = Math.cos(koi.heading);
    const forwardY = Math.sin(koi.heading);
    const wander =
      Math.sin(time * 0.24 + koi.phase) * 0.27 + Math.sin(time * 0.43 + koi.phase * 1.7) * 0.13;
    let targetX = Math.cos(koi.heading + wander);
    let targetY = Math.sin(koi.heading + wander);

    // Predict the next body length instead of bouncing off an invisible wall.
    const lookAhead = 64 + koi.currentSpeed * 1.6;
    const projectedX = (koi.x + forwardX * lookAhead - POND_WIDTH / 2) / 353;
    const projectedY = (koi.y + forwardY * lookAhead - POND_HEIGHT / 2) / 211;
    const projectedRadius = Math.hypot(projectedX, projectedY);
    const edge = smoothstep(0.62, 1.16, projectedRadius);
    const boundaryWeight = edge * 3.8;
    if (projectedRadius > 0.001) {
      targetX -= (projectedX / projectedRadius) * boundaryWeight;
      targetY -= (projectedY / projectedRadius) * boundaryWeight;
    }

    for (let otherIndex = 0; otherIndex < fish.length; otherIndex++) {
      if (otherIndex === index) continue;
      const dx = koi.x - positions[otherIndex].x;
      const dy = koi.y - positions[otherIndex].y;
      const distance = Math.hypot(dx, dy);
      const personalSpace = (koi.length + fish[otherIndex].length) * 0.43;
      if (distance < 0.001 || distance >= personalSpace) continue;
      const separation = (1 - smoothstep(16, personalSpace, distance)) * 0.48;
      targetX += (dx / distance) * separation;
      targetY += (dy / distance) * separation;
    }

    if (koi.stimulusStrength > 0.001) {
      const dx = koi.x - koi.stimulusX;
      const dy = koi.y - koi.stimulusY;
      const distance = Math.hypot(dx, dy);
      // An exact head tap retains a little forward motion instead of choosing
      // an undefined escape direction. Boundary avoidance retains priority.
      const awayX = distance > 0.01 ? dx / distance : forwardX;
      const awayY = distance > 0.01 ? dy / distance : forwardY;
      const response = koi.stimulusStrength * (1 - edge * 0.72) * 2.7;
      targetX += awayX * response;
      targetY += awayY * response;
    }

    let error = angleDifference(Math.atan2(targetY, targetX), koi.heading);
    // Near a U-turn, avoid alternating left/right decisions as a goal passes
    // directly behind the fish. Angular velocity provides the turning memory.
    if (Math.abs(error) > 2.5 && Math.abs(koi.turnRate) > 0.08) {
      error = Math.abs(error) * Math.sign(koi.turnRate);
    }
    const desiredTurnRate = clamp(error * 1.45, -1.05, 1.05);
    const angularAcceleration = clamp((desiredTurnRate - koi.turnRate) * 3.2, -1.45, 1.45);
    koi.turnRate += angularAcceleration * STEP;
    koi.heading += koi.turnRate * STEP;

    // The response rises over several frames, then settles into a long glide.
    koi.energy += (koi.stimulusStrength - koi.energy) * (1 - Math.exp(-STEP * 5));
    koi.stimulusStrength *= Math.exp(-STEP * 1.15);
    const glide =
      0.91 + 0.09 * Math.sin(time * 0.33 + koi.phase) + 0.05 * Math.sin(time * 0.71 + koi.phase);
    const desiredSpeed = koi.speed * (glide + koi.energy * 1.65) * (1 - edge * 0.2);
    const acceleration = clamp((desiredSpeed - koi.currentSpeed) * 1.65, -21, 30);
    koi.currentSpeed = Math.max(0, koi.currentSpeed + acceleration * STEP);
    koi.velocityX = Math.cos(koi.heading) * koi.currentSpeed;
    koi.velocityY = Math.sin(koi.heading) * koi.currentSpeed;
    koi.x += koi.velocityX * STEP;
    koi.y += koi.velocityY * STEP;

    koi.bend += (clamp(koi.turnRate / 1.05, -1, 1) - koi.bend) * (1 - Math.exp(-STEP * 3.5));
    koi.tailPhase += (2.1 + koi.currentSpeed * 0.074 + koi.energy * 0.7) * STEP;
  }
}

/** The fixed clock keeps trajectory and stroke timing consistent at 30–120 Hz. */
export function advancePond(fish: Koi[], delta: number, time: number) {
  // Wall time can jump when a tab is hidden. Only visible simulation time is used.
  void time;
  if (!Number.isFinite(delta) || delta <= 0) return;
  let clock = clocks.get(fish);
  if (!clock) {
    clock = { remainder: 0, time: 0 };
    clocks.set(fish, clock);
  }
  clock.remainder += Math.min(delta, 0.1);
  while (clock.remainder + 1e-10 >= STEP) {
    stepPond(fish, clock.time);
    clock.time += STEP;
    clock.remainder = Math.max(0, clock.remainder - STEP);
  }
}
