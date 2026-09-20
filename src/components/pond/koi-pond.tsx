'use client';

import { useEffect, useRef } from 'react';
import { advancePond, createKoi, disturbPond, POND_WIDTH as W, POND_HEIGHT as H } from '@/lib/pond';
import { createPondRenderer, type PondRenderer, type WaterRipple } from './pond-renderer';
import { createPondBed } from './pond-bed';
import styles from './koi-pond.module.css';

export default function KoiPond({ paused }: { paused?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const refreshRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
    refreshRef.current?.();
  }, [paused]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const fallback = fallbackRef.current;
    if (!host || !canvas || !fallback) return;
    const fish = createKoi();
    const ripples: WaterRipple[] = [];
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let graphics: PondRenderer | null = null;
    let frame = 0;
    let time = 0;
    let previousTime = 0;
    let inView = true;
    let destroyed = false;
    let lastPointerTime = -1;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let fallbackBed: HTMLCanvasElement | null = null;
    const isPaused = () => pausedRef.current ?? preference.matches;
    const active = () => !isPaused() && inView && !document.hidden && !!graphics;

    const paintFallback = () => {
      const ctx = fallback.getContext('2d');
      if (!ctx) return;
      fallbackBed ??= createPondBed();
      fallback.width = W;
      fallback.height = H;
      ctx.drawImage(fallbackBed, 0, 0);
      for (const koi of fish) {
        ctx.save();
        ctx.translate(koi.x, koi.y);
        ctx.rotate(koi.heading);
        ctx.scale(koi.length / 100, koi.length / 100);
        const skin = ctx.createLinearGradient(0, -13, 0, 13);
        skin.addColorStop(0, '#a3af9d');
        skin.addColorStop(0.4, '#f7ebc7');
        skin.addColorStop(1, '#8b9f85');
        ctx.fillStyle = skin;
        ctx.beginPath();
        ctx.moveTo(43, 0);
        ctx.bezierCurveTo(34, -20, -10, -14, -45, 0);
        ctx.bezierCurveTo(-10, 14, 34, 20, 43, 0);
        ctx.fill();
        ctx.fillStyle = 'rgba(230,226,196,.65)';
        ctx.beginPath();
        ctx.moveTo(-38, 0);
        ctx.lineTo(-64, -14);
        ctx.quadraticCurveTo(-55, 0, -64, 14);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = koi.pattern === 3 ? '#cd9e37' : '#cb562f';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(26 - i * 19, 0, 8, 8 - i, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      for (const ripple of ripples) {
        ctx.strokeStyle = 'rgba(226,243,211,.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, 32, 0, Math.PI * 2);
        ctx.stroke();
      }
    };
    const paint = () => {
      if (graphics) graphics.render(time, fish, ripples);
      else paintFallback();
    };
    const fallbackMode = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      const previousGraphics = graphics;
      graphics = null;
      previousGraphics?.dispose();
      canvas.hidden = true;
      fallback.hidden = false;
      host.dataset.renderer = 'still';
      paintFallback();
    };
    const animate = (now: number) => {
      frame = 0;
      if (destroyed || !active()) return;
      const dt = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 0;
      previousTime = now;
      time += dt;
      advancePond(fish, dt, time);
      for (const ripple of ripples) ripple.age += dt;
      while (ripples.length && ripples[0].age > 3.6) ripples.shift();
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
      graphics?.resize(Math.max(1, host.clientWidth), Math.max(1, host.clientHeight));
      paint();
    };
    const addDisturbance = (x: number, y: number, strength: number) => {
      if (ripples.length >= 12) ripples.shift();
      ripples.push({ x, y, age: isPaused() ? 0.35 : 0, strength });
      if (!isPaused() && graphics) disturbPond(fish, x, y, strength);
      paint();
    };
    const pointerDown = (event: PointerEvent) => {
      const x = (event.offsetX / Math.max(1, host.clientWidth)) * W;
      const y = (event.offsetY / Math.max(1, host.clientHeight)) * H;
      const touchesFish = fish.some((koi) => Math.hypot(koi.x - x, koi.y - y) < koi.length * 0.48);
      addDisturbance(x, y, touchesFish ? 1 : 0.42);
      lastPointerX = x;
      lastPointerY = y;
      lastPointerTime = event.timeStamp;
      host.focus({ preventScroll: true });
    };
    const pointerMove = (event: PointerEvent) => {
      const x = (event.offsetX / Math.max(1, host.clientWidth)) * W;
      const y = (event.offsetY / Math.max(1, host.clientHeight)) * H;
      const nearby = fish.some((koi) => Math.hypot(koi.x - x, koi.y - y) < koi.length * 0.4);
      host.style.cursor = nearby ? 'pointer' : 'crosshair';
      if (
        event.buttons === 0 ||
        event.timeStamp - lastPointerTime < 90 ||
        Math.hypot(x - lastPointerX, y - lastPointerY) < 18
      )
        return;
      addDisturbance(x, y, nearby ? 0.45 : 0.18);
      lastPointerTime = event.timeStamp;
      lastPointerX = x;
      lastPointerY = y;
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      if (!event.repeat) addDisturbance(W / 2, H / 2, 0.7);
    };
    // Assistive technologies can activate a button with click alone.
    const assistiveClick = (event: MouseEvent) => {
      if (event.detail === 0) addDisturbance(W / 2, H / 2, 0.7);
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      if (!destroyed) fallbackMode();
    };
    try {
      graphics = createPondRenderer(canvas);
      host.dataset.renderer = 'water';
      fallback.hidden = true;
      canvas.hidden = false;
    } catch {
      fallbackMode();
    }
    canvas.addEventListener('webglcontextlost', contextLost);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        refresh();
      },
      { threshold: 0.05 },
    );
    intersectionObserver.observe(host);
    document.addEventListener('visibilitychange', refresh);
    preference.addEventListener('change', refresh);
    host.addEventListener('pointerdown', pointerDown);
    host.addEventListener('pointermove', pointerMove);
    host.addEventListener('keydown', keyboard);
    host.addEventListener('click', assistiveClick);
    resize();
    refresh();
    return () => {
      destroyed = true;
      if (frame) cancelAnimationFrame(frame);
      refreshRef.current = null;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', refresh);
      preference.removeEventListener('change', refresh);
      host.removeEventListener('pointerdown', pointerDown);
      host.removeEventListener('pointermove', pointerMove);
      host.removeEventListener('keydown', keyboard);
      host.removeEventListener('click', assistiveClick);
      canvas.removeEventListener('webglcontextlost', contextLost);
      graphics?.dispose();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={styles.pond}
      role="button"
      tabIndex={0}
      aria-label="A quiet koi pond. Tap the water, or press Enter or Space, to make a ripple."
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <canvas ref={fallbackRef} className={styles.canvas} aria-hidden="true" hidden />
    </div>
  );
}
