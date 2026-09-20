export const POND_WIDTH = 900;
export const POND_HEIGHT = 580;

export type Koi = {
  x: number;
  y: number;
  heading: number;
  length: number;
  phase: number;
  speed: number;
  energy: number;
  pattern: number;
};

export type PondRipple = { x: number; y: number; age: number };

export function createKoi(): Koi[] {
  return [
    {
      x: 295,
      y: 248,
      heading: -0.48,
      length: 114,
      phase: 1.1,
      speed: 23,
      energy: 0,
      pattern: 0,
    },
    {
      x: 526,
      y: 185,
      heading: 2.45,
      length: 97,
      phase: 3.2,
      speed: 20,
      energy: 0,
      pattern: 1,
    },
    {
      x: 576,
      y: 373,
      heading: -2.5,
      length: 119,
      phase: 5.1,
      speed: 25,
      energy: 0,
      pattern: 2,
    },
    {
      x: 698,
      y: 285,
      heading: 1.58,
      length: 87,
      phase: 7.3,
      speed: 19,
      energy: 0,
      pattern: 3,
    },
  ];
}

function angleDifference(target: number, current: number) {
  return Math.atan2(Math.sin(target - current), Math.cos(target - current));
}

export function disturbPond(fish: Koi[], x: number, y: number) {
  for (const koi of fish) {
    const distance = Math.hypot(koi.x - x, koi.y - y);
    if (distance < 190) {
      const away = Math.atan2(koi.y - y, koi.x - x);
      koi.heading += angleDifference(away, koi.heading) * 0.66;
      koi.energy = Math.max(koi.energy, (1 - distance / 190) * 1.8);
    }
  }
}

export function advancePond(fish: Koi[], delta: number, time: number) {
  const dt = Math.min(Math.max(Number.isFinite(delta) ? delta : 0, 0), 0.05);
  for (const koi of fish) {
    const lookAhead = 95;
    const px = koi.x + Math.cos(koi.heading) * lookAhead;
    const py = koi.y + Math.sin(koi.heading) * lookAhead;
    let turn =
      Math.sin(time * 0.31 + koi.phase) * 0.18 + Math.sin(time * 0.67 + koi.phase * 2) * 0.11;
    if (px < 110 || px > POND_WIDTH - 105 || py < 95 || py > POND_HEIGHT - 88) {
      const target = Math.atan2(POND_HEIGHT / 2 - koi.y, POND_WIDTH / 2 - koi.x);
      turn += Math.sign(angleDifference(target, koi.heading)) * 0.82;
    }
    for (const other of fish) {
      if (other === koi) continue;
      const distance = Math.hypot(koi.x - other.x, koi.y - other.y);
      if (distance > 0 && distance < 64) {
        const away = Math.atan2(koi.y - other.y, koi.x - other.x);
        turn += Math.sign(angleDifference(away, koi.heading)) * (1 - distance / 64) * 0.8;
      }
    }
    koi.heading += turn * dt;
    koi.energy *= Math.exp(-dt * 0.9);
    const speed = koi.speed * (1 + koi.energy * 2);
    koi.x = Math.max(58, Math.min(POND_WIDTH - 58, koi.x + Math.cos(koi.heading) * speed * dt));
    koi.y = Math.max(55, Math.min(POND_HEIGHT - 55, koi.y + Math.sin(koi.heading) * speed * dt));
  }
}
