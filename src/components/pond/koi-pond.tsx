'use client';

import { useEffect, useRef } from 'react';
import {
  advancePond,
  createKoi,
  disturbPond,
  POND_HEIGHT as H,
  POND_WIDTH as W,
  type Koi,
  type PondRipple,
} from '@/lib/pond';
import styles from './koi-pond.module.css';

type Context = CanvasRenderingContext2D;

function randomGenerator(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let n = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    n = (n + Math.imul(n ^ (n >>> 7), 61 | n)) ^ n;
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

function ellipse(
  ctx: Context,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
  angle = 0,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2);
  ctx.fill();
}

function rock(ctx: Context, x: number, y: number, size: number, random: () => number) {
  const rotation = random() * Math.PI;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.shadowColor = 'rgba(22,38,30,.35)';
  ctx.shadowBlur = size * 0.25;
  ctx.shadowOffsetY = size * 0.22;
  const tint = 90 + Math.floor(random() * 45);
  const gradient = ctx.createLinearGradient(-size, -size, size, size);
  gradient.addColorStop(0, `rgb(${tint + 55},${tint + 55},${tint + 32})`);
  gradient.addColorStop(0.45, `rgb(${tint + 22},${tint + 30},${tint + 15})`);
  gradient.addColorStop(1, `rgb(${tint - 22},${tint - 9},${tint - 17})`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(-size * 0.88, -size * 0.23);
  ctx.bezierCurveTo(
    -size * 0.79,
    -size * 0.74,
    size * 0.22,
    -size * 0.77,
    size * 0.7,
    -size * 0.27,
  );
  ctx.bezierCurveTo(size * 1.05, size * 0.26, size * 0.33, size * 0.75, -size * 0.29, size * 0.63);
  ctx.bezierCurveTo(-size * 0.8, size * 0.56, -size, size * 0.13, -size * 0.88, -size * 0.23);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.save();
  ctx.clip();
  for (let i = 0; i < size * 6; i++) {
    ellipse(
      ctx,
      (random() * 2 - 1) * size,
      (random() * 2 - 1) * size,
      0.5 + random() * 1.8,
      0.5 + random(),
      i % 2 ? 'rgba(237,235,205,.1)' : 'rgba(27,48,33,.1)',
    );
  }
  ctx.restore();
  ctx.restore();
}

function leaf(ctx: Context, x: number, y: number, length: number, angle: number, light: boolean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const gradient = ctx.createLinearGradient(0, -length * 0.25, 0, length * 0.25);
  gradient.addColorStop(0, light ? '#89964b' : '#56704b');
  gradient.addColorStop(0.45, light ? '#667e39' : '#3e603f');
  gradient.addColorStop(1, '#314c34');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(length * 0.32, -length * 0.32, length * 0.8, -length * 0.22, length, 0);
  ctx.bezierCurveTo(length * 0.72, length * 0.27, length * 0.22, length * 0.22, 0, 0);
  ctx.fill();
  ctx.strokeStyle = 'rgba(208,215,137,.23)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(length * 0.6, -2, length * 0.97, 0);
  ctx.stroke();
  ctx.restore();
}

function createBed() {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const random = randomGenerator(1407);
  const water = ctx.createLinearGradient(0, 0, W, H);
  water.addColorStop(0, '#929975');
  water.addColorStop(0.42, '#8f9c76');
  water.addColorStop(0.75, '#718c77');
  water.addColorStop(1, '#547963');
  ctx.fillStyle = water;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 75; i++) {
    const x = random() * W;
    const y = random() * H;
    const radius = 30 + random() * 130;
    const cloud = ctx.createRadialGradient(x, y, 0, x, y, radius);
    cloud.addColorStop(0, i % 3 ? 'rgba(45,76,44,.09)' : 'rgba(199,194,130,.14)');
    cloud.addColorStop(1, 'transparent');
    ctx.fillStyle = cloud;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  for (let i = 0; i < 16000; i++) {
    const radius = 0.35 + random() * 1.7;
    ellipse(
      ctx,
      random() * W,
      random() * H,
      radius,
      radius * 0.7,
      i % 2 ? 'rgba(238,226,161,.095)' : 'rgba(33,57,39,.065)',
    );
  }
  // Sunken pebbles gather along the banks, leaving open water for the fish.
  ctx.globalAlpha = 0.56;
  for (let i = 0; i < 94; i++) {
    const side = i % 4;
    const x = side === 0 ? random() * 65 : side === 1 ? W - random() * 80 : random() * W;
    const y = side === 2 ? random() * 42 : side === 3 ? H - random() * 46 : random() * H;
    rock(ctx, x, y, 7 + random() * 20, random);
  }
  ctx.globalAlpha = 1;
  for (const [x, y, r] of [
    [7, 8, 105],
    [92, 10, 60],
    [14, 103, 62],
    [W - 12, H - 5, 118],
    [W - 108, H + 8, 64],
    [W + 4, H - 112, 51],
  ]) {
    rock(ctx, x, y, r, random);
  }
  ctx.shadowColor = 'rgba(17,43,24,.4)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 10;
  for (let i = 0; i < 31; i++) {
    const top = i < 16;
    const x = top ? 12 + random() * 80 : W - 65 + random() * 80;
    const y = top ? -14 + random() * 34 : H - random() * 40;
    leaf(
      ctx,
      x,
      y,
      35 + random() * 80,
      top ? random() * 2.2 - 0.2 : Math.PI + random() * 2,
      i % 3 === 0,
    );
  }
  ctx.shadowColor = 'transparent';
  // A small pair of water lilies, with fine radial veins.
  for (const [x, y, r, a] of [
    [92, 450, 29, 0.2],
    [132, 474, 19, -0.4],
  ]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.shadowColor = 'rgba(26,55,34,.4)';
    ctx.shadowBlur = 7;
    ctx.shadowOffsetY = 4;
    const fill = ctx.createRadialGradient(-r * 0.35, -r * 0.45, 0, 0, 0, r);
    fill.addColorStop(0, '#a1ae60');
    fill.addColorStop(1, '#54744c');
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.15);
    ctx.arc(0, 0, r, 0.48, Math.PI * 2 + 0.16);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(214,218,142,.19)';
    ctx.lineWidth = 0.65;
    for (let i = 0; i < 13; i++) {
      const angle = 0.55 + i * 0.42;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(
        Math.cos(angle + 0.15) * r * 0.55,
        Math.sin(angle + 0.15) * r * 0.55,
        Math.cos(angle) * r * 0.92,
        Math.sin(angle) * r * 0.92,
      );
      ctx.stroke();
    }
    ctx.restore();
  }
  return canvas;
}

function bodyPath(ctx: Context, bend: number) {
  ctx.beginPath();
  ctx.moveTo(49, -1);
  ctx.bezierCurveTo(49, -9, 29, -16, 11, -15);
  ctx.bezierCurveTo(-9, -14, -30, bend - 6, -46, bend - 3);
  ctx.lineTo(-48, bend + 3);
  ctx.bezierCurveTo(-28, bend + 6, -9, 15, 11, 15);
  ctx.bezierCurveTo(28, 15, 48, 9, 49, -1);
  ctx.closePath();
}

function drawKoi(ctx: Context, fish: Koi, time: number) {
  const beat = time * (2.7 + fish.energy * 2) + fish.phase;
  const bend = Math.sin(beat) * (4.5 + fish.energy * 2);
  const tail = Math.sin(beat - 0.8) * 12;
  ctx.save();
  ctx.translate(fish.x, fish.y);
  ctx.rotate(fish.heading);
  ctx.scale(fish.length / 100, fish.length / 100);
  // The offset shadow anchors the fish below the surface of the water.
  ctx.save();
  ctx.translate(7, 12);
  ctx.filter = 'blur(5px)';
  bodyPath(ctx, bend);
  ctx.fillStyle = 'rgba(22,48,37,.25)';
  ctx.fill();
  ctx.restore();
  const fins = ctx.createLinearGradient(0, -30, 0, 30);
  fins.addColorStop(0, 'rgba(242,236,200,.2)');
  fins.addColorStop(0.5, 'rgba(241,235,204,.74)');
  fins.addColorStop(1, 'rgba(240,231,196,.19)');
  ctx.fillStyle = fins;
  ctx.strokeStyle = 'rgba(234,231,199,.3)';
  ctx.lineWidth = 0.6;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(21, side * 9);
    ctx.bezierCurveTo(15, side * (28 + Math.sin(beat * 0.7) * 2), -2, side * 33, -7, side * 24);
    ctx.quadraticCurveTo(0, side * 15, 8, side * 10);
    ctx.fill();
    ctx.stroke();
    for (let ray = 0; ray < 4; ray++) {
      ctx.beginPath();
      ctx.moveTo(15, side * 11);
      ctx.lineTo(-3 + ray * 4, side * (25 - ray * 2));
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-25, bend + side * 5);
    ctx.quadraticCurveTo(-28, bend + side * 15, -39, bend + side * 13);
    ctx.lineTo(-34, bend + side * 4);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(-43, bend - 3);
  ctx.bezierCurveTo(-57, bend - 3, -63, tail - 16, -78, tail - 18);
  ctx.quadraticCurveTo(-77, tail - 5, -66, tail);
  ctx.quadraticCurveTo(-76, tail + 8, -79, tail + 18);
  ctx.bezierCurveTo(-62, tail + 16, -58, bend + 4, -43, bend + 3);
  ctx.fill();
  ctx.stroke();
  for (let ray = -3; ray <= 3; ray++) {
    ctx.beginPath();
    ctx.moveTo(-46, bend);
    ctx.quadraticCurveTo(-59, tail + ray * 2, -73, tail + ray * 4.4);
    ctx.stroke();
  }
  bodyPath(ctx, bend);
  const skin = ctx.createLinearGradient(0, -16, 0, 16);
  skin.addColorStop(0, '#bcbda4');
  skin.addColorStop(0.24, '#efedd3');
  skin.addColorStop(0.5, '#fff6dc');
  skin.addColorStop(0.79, '#dddac0');
  skin.addColorStop(1, '#969f8e');
  ctx.fillStyle = skin;
  ctx.fill();
  ctx.save();
  ctx.clip();
  const random = randomGenerator(fish.pattern * 231 + 7);
  const colors = fish.pattern === 3 ? ['#cc973f', '#b88232'] : ['#c9482c', '#d95634'];
  for (let patch = 0; patch < 5; patch++) {
    const x = 33 - patch * 17 + random() * 8;
    const y = (random() - 0.5) * 13;
    const radius = 7 + random() * 8;
    ctx.fillStyle = colors[patch % 2];
    ctx.beginPath();
    ctx.moveTo(x - radius, y);
    ctx.bezierCurveTo(
      x - radius * 0.9,
      y - radius * 1.2,
      x + radius * 0.7,
      y - radius,
      x + radius,
      y - 2,
    );
    ctx.bezierCurveTo(
      x + radius * 0.7,
      y + radius * 0.8,
      x - radius * 0.7,
      y + radius,
      x - radius,
      y,
    );
    ctx.fill();
  }
  if (fish.pattern === 1 || fish.pattern === 2) {
    for (let patch = 0; patch < 3; patch++) {
      ellipse(
        ctx,
        8 - patch * 17,
        (patch % 2 ? 1 : -1) * 7,
        5 + random() * 4,
        6 + random() * 3,
        '#3d4940',
        patch * 0.7,
      );
    }
  }
  const sheen = ctx.createLinearGradient(0, -15, 0, 15);
  sheen.addColorStop(0, 'rgba(40,68,53,.17)');
  sheen.addColorStop(0.42, 'rgba(255,252,225,.14)');
  sheen.addColorStop(0.65, 'rgba(255,252,225,.02)');
  sheen.addColorStop(1, 'rgba(39,62,45,.25)');
  ctx.fillStyle = sheen;
  ctx.fillRect(-50, -17, 105, 34);
  ctx.strokeStyle = 'rgba(246,239,201,.15)';
  ctx.lineWidth = 0.45;
  for (let x = -29; x < 23; x += 4.5) {
    for (let y = -11; y < 12; y += 4.5) {
      ctx.beginPath();
      ctx.arc(x + (y % 2) * 1.2, y, 3, -0.7, 0.7);
      ctx.stroke();
    }
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,250,217,.36)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(17, -1);
  ctx.quadraticCurveTo(-8, -2, -35, bend);
  ctx.stroke();
  for (const side of [-1, 1]) {
    ellipse(ctx, 36.5, side * 8, 2.35, 1.8, '#b7b39c', side * 0.4);
    ellipse(ctx, 37.2, side * 8.1, 1.45, 1.2, '#28352e');
    ellipse(ctx, 37.5, side * 8 - 0.4, 0.38, 0.38, '#eef0d8');
  }
  ctx.strokeStyle = 'rgba(65,75,55,.32)';
  ctx.lineWidth = 0.65;
  ctx.beginPath();
  ctx.moveTo(45, -3);
  ctx.quadraticCurveTo(48, 0, 45, 3);
  ctx.stroke();
  ctx.restore();
}

function drawSurface(ctx: Context, time: number, ripples: PondRipple[]) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  // Interlaced, irregular light filaments suggest refraction on the pond bed.
  for (let layer = 0; layer < 2; layer++) {
    ctx.lineWidth = layer ? 1.6 : 3;
    ctx.strokeStyle = layer ? 'rgba(245,247,188,.075)' : 'rgba(245,247,188,.055)';
    for (let row = -1; row < 9; row++) {
      ctx.beginPath();
      for (let x = -50; x < W + 60; x += 12) {
        const y =
          row * 86 +
          Math.sin(x / 73 + row * 1.7 + time * 0.35 + layer) * 24 +
          Math.sin(x / 31 - time * 0.2 + row) * 9;
        if (x === -50) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (let column = -1; column < 12; column++) {
      ctx.beginPath();
      for (let y = -50; y < H + 60; y += 12) {
        const x =
          column * 89 +
          Math.sin(y / 77 + column * 1.7 - time * 0.3 + layer) * 30 +
          Math.sin(y / 29 + time * 0.22) * 8;
        if (y === -50) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  const sun = ctx.createRadialGradient(255 + Math.sin(time * 0.1) * 35, 120, 0, 255, 120, 350);
  sun.addColorStop(0, 'rgba(255,241,180,.12)');
  sun.addColorStop(1, 'transparent');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  for (const ripple of ripples) {
    const fade = Math.max(0, 1 - ripple.age / 2.8);
    for (let ring = 0; ring < 3; ring++) {
      const radius = ripple.age * 70 - ring * 13;
      if (radius <= 0) continue;
      ctx.beginPath();
      ctx.ellipse(ripple.x, ripple.y, radius, radius * 0.8, 0, 0, Math.PI * 2);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = `rgba(245,246,213,${fade * 0.48})`;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(ripple.x, ripple.y + 2, radius + 1, radius * 0.8, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(30,57,46,${fade * 0.13})`;
      ctx.stroke();
    }
  }
}

export default function KoiPond({ paused }: { paused?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const refreshRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
    refreshRef.current?.();
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    const bed = createBed();
    const fish = createKoi();
    const ripples: PondRipple[] = [];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = true;
    let frame = 0;
    let time = 0;
    let previousTime = 0;
    let destroyed = false;

    const paint = () => {
      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
      ctx.drawImage(bed, 0, 0);
      for (const koi of fish) drawKoi(ctx, koi, time);
      drawSurface(ctx, time, ripples);
    };
    const isPaused = () => pausedRef.current ?? reducedMotion.matches;
    const active = () => !isPaused() && !document.hidden && inView;
    const animate = (now: number) => {
      frame = 0;
      if (destroyed || !active()) return;
      const dt = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 0;
      previousTime = now;
      time += dt;
      advancePond(fish, dt, time);
      for (const ripple of ripples) ripple.age += dt;
      while (ripples.length && ripples[0].age > 2.8) ripples.shift();
      paint();
      frame = requestAnimationFrame(animate);
    };
    const refresh = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      if (active()) frame = requestAnimationFrame(animate);
      else paint();
    };
    refreshRef.current = refresh;
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(bounds.width * dpr));
      canvas.height = Math.max(1, Math.round(bounds.height * dpr));
      paint();
    };
    const disturb = (x: number, y: number) => {
      if (ripples.length > 12) ripples.shift();
      ripples.push({
        x,
        y,
        age: isPaused() ? 0.4 : 0.01,
      });
      if (!isPaused()) disturbPond(fish, x, y);
      paint();
    };
    const pointer = (event: PointerEvent) => {
      disturb(
        (event.offsetX / Math.max(1, canvas.clientWidth)) * W,
        (event.offsetY / Math.max(1, canvas.clientHeight)) * H,
      );
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      disturb(W / 2, H / 2);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        refresh();
      },
      { threshold: 0.05 },
    );
    intersectionObserver.observe(canvas);
    document.addEventListener('visibilitychange', refresh);
    reducedMotion.addEventListener('change', refresh);
    canvas.addEventListener('pointerdown', pointer);
    canvas.addEventListener('keydown', keyboard);
    resize();
    refresh();
    return () => {
      destroyed = true;
      if (frame) cancelAnimationFrame(frame);
      refreshRef.current = null;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', refresh);
      reducedMotion.removeEventListener('change', refresh);
      canvas.removeEventListener('pointerdown', pointer);
      canvas.removeEventListener('keydown', keyboard);
    };
  }, []);

  return (
    <div className={styles.pond}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        role="button"
        tabIndex={0}
        aria-label="A quiet koi pond. Tap the water, or press Enter or Space, to make a ripple."
      >
        Four koi swim in a sunlit pond among mossy stones and water lilies.
      </canvas>
      <div className={styles.light} aria-hidden="true" />
    </div>
  );
}
