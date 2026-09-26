'use client';

import { useEffect, useRef } from 'react';
import styles from './cursor-cat.module.css';

// Adapted from adryd's MIT-licensed Oneko. See public/oneko/LICENSE.txt.
const sprites = {
  idle: [[-3, -3]],
  alert: [[-7, -3]],
  scratchSelf: [
    [-5, 0],
    [-6, 0],
    [-7, 0],
  ],
  scratchWallN: [
    [0, 0],
    [0, -1],
  ],
  scratchWallS: [
    [-7, -1],
    [-6, -2],
  ],
  scratchWallE: [
    [-2, -2],
    [-2, -3],
  ],
  scratchWallW: [
    [-4, 0],
    [-4, -1],
  ],
  tired: [[-3, -2]],
  sleeping: [
    [-2, 0],
    [-2, -1],
  ],
  N: [
    [-1, -2],
    [-1, -3],
  ],
  NE: [
    [0, -2],
    [0, -3],
  ],
  E: [
    [-3, 0],
    [-3, -1],
  ],
  SE: [
    [-5, -1],
    [-5, -2],
  ],
  S: [
    [-6, -3],
    [-7, -2],
  ],
  SW: [
    [-5, -3],
    [-6, -1],
  ],
  W: [
    [-4, -2],
    [-4, -3],
  ],
  NW: [
    [-1, 0],
    [-1, -1],
  ],
} as const;

type Pose = keyof typeof sprites;
type IdlePose = 'sleeping' | 'scratchSelf' | `scratchWall${'N' | 'S' | 'E' | 'W'}`;

export default function CursorCat() {
  const cat = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = cat.current;
    if (!element) return;

    const pointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 761px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const game = document.querySelector(
      '[aria-label="Ambient video and Doom on a vintage television"]',
    );
    let x = 32;
    let y = 32;
    let targetX = x;
    let targetY = y;
    let frameCount = 0;
    let idleTicks = 0;
    let idlePose: IdlePose | null = null;
    let idleFrame = 0;
    let animation = 0;
    let lastTick = 0;
    let pointerInside = true;
    let needsRestSpot = false;
    let disposed = false;

    const setSprite = (pose: Pose, frame = 0) => {
      const frames = sprites[pose];
      const [column, row] = frames[frame % frames.length];
      element.style.backgroundPosition = `${column * 32}px ${row * 32}px`;
      element.dataset.pose = pose;
    };
    const position = () => {
      x = Math.min(Math.max(16, x), Math.max(16, window.innerWidth - 16));
      y = Math.min(Math.max(16, y), Math.max(16, window.innerHeight - 16));
      element.style.transform = `translate3d(${Math.round(x - 16)}px, ${Math.round(y - 16)}px, 0)`;
    };
    const resetIdle = () => {
      idlePose = null;
      idleFrame = 0;
    };
    const findRestSpot = () => {
      // Measure only when the pointer leaves or the page moves, never each frame.
      const obstacles = Array.from(
        document.querySelectorAll(
          'h1, h2, h3, h4, h5, h6, p, a, button, li, img, video, canvas, iframe, input, textarea, [role="img"]',
        ),
      )
        .filter((node) => getComputedStyle(node).visibility !== 'hidden')
        .flatMap((node) => Array.from(node.getClientRects()))
        .filter(
          (rect) => rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight,
        );
      let best = { x, y };
      let bestScore = Infinity;
      let mostClearance = -1;
      let fallback = best;
      for (let cy = 32; cy <= innerHeight - 32; cy += 48) {
        for (let cx = 32; cx <= innerWidth - 32; cx += 48) {
          const clearance = obstacles.reduce(
            (closest, rect) =>
              Math.min(
                closest,
                Math.hypot(
                  Math.max(rect.left - cx, 0, cx - rect.right),
                  Math.max(rect.top - cy, 0, cy - rect.bottom),
                ),
              ),
            Infinity,
          );
          if (clearance > mostClearance) {
            mostClearance = clearance;
            fallback = { x: cx, y: cy };
          }
          // Allow space for the whole sprite plus breathing room around content.
          const travel = Math.hypot(cx - x, cy - y);
          if (clearance < 40 || travel < 80) continue;
          const score = travel - Math.min(clearance, 96);
          if (score < bestScore) {
            bestScore = score;
            best = { x: cx, y: cy };
          }
        }
      }
      const destination = bestScore < Infinity ? best : fallback;
      targetX = destination.x;
      targetY = destination.y;
      needsRestSpot = false;
    };
    const idle = () => {
      idleTicks += 1;
      // The original Oneko occasionally scratches or curls up after settling.
      if (idleTicks > 10 && !idlePose && Math.floor(Math.random() * 200) === 0) {
        const choices: IdlePose[] = ['sleeping', 'scratchSelf'];
        if (x < 32) choices.push('scratchWallW');
        if (y < 32) choices.push('scratchWallN');
        if (x > window.innerWidth - 32) choices.push('scratchWallE');
        if (y > window.innerHeight - 32) choices.push('scratchWallS');
        idlePose = choices[Math.floor(Math.random() * choices.length)];
      }
      if (idlePose === 'sleeping') {
        setSprite(idleFrame < 8 ? 'tired' : 'sleeping', Math.floor(idleFrame / 4));
        if (++idleFrame > 192) resetIdle();
      } else if (idlePose) {
        setSprite(idlePose, idleFrame);
        if (++idleFrame > 9) resetIdle();
      } else {
        setSprite('idle');
      }
    };
    const tick = () => {
      frameCount += 1;
      if (!pointerInside && needsRestSpot) findRestSpot();
      const dx = targetX - x;
      const dy = targetY - y;
      const distance = Math.hypot(dx, dy);
      if (distance < (pointerInside ? 48 : 1)) {
        if (pointerInside) idle();
        else {
          idleTicks += 1;
          setSprite('idle');
        }
        return;
      }
      resetIdle();
      if (idleTicks > 1) {
        setSprite('alert');
        idleTicks = Math.min(idleTicks, 7) - 1;
        return;
      }
      let direction = dy / distance < -0.5 ? 'N' : '';
      direction += dy / distance > 0.5 ? 'S' : '';
      direction += dx / distance < -0.5 ? 'W' : '';
      direction += dx / distance > 0.5 ? 'E' : '';
      setSprite(direction as Pose, frameCount);
      const step = Math.min(10, distance);
      x += (dx / distance) * step;
      y += (dy / distance) * step;
      position();
    };
    const animate = (time: number) => {
      animation = 0;
      if (disposed) return;
      if (!lastTick) lastTick = time;
      if (time - lastTick >= 100) {
        // Never catch up missed ticks after returning to a hidden tab.
        lastTick = time;
        tick();
      }
      animation = requestAnimationFrame(animate);
    };
    const refresh = () => {
      const visible =
        !disposed &&
        pointer.matches &&
        !reducedMotion.matches &&
        !document.hidden &&
        !document.pointerLockElement &&
        !document.fullscreenElement &&
        game?.getAttribute('data-state') !== 'playing';
      element.hidden = !visible;
      if (!visible) {
        cancelAnimationFrame(animation);
        animation = 0;
        lastTick = 0;
        return;
      }
      position();
      if (!animation) animation = requestAnimationFrame(animate);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      targetX = event.clientX;
      targetY = event.clientY;
      pointerInside = true;
      needsRestSpot = false;
      refresh();
    };
    const leave = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.relatedTarget !== null || !pointerInside) return;
      pointerInside = false;
      needsRestSpot = true;
      resetIdle();
      refresh();
    };
    const layoutChanged = () => {
      if (!pointerInside) needsRestSpot = true;
      refresh();
    };
    const gameObserver = new MutationObserver(refresh);
    if (game) gameObserver.observe(game, { attributes: true, attributeFilter: ['data-state'] });
    pointer.addEventListener('change', refresh);
    reducedMotion.addEventListener('change', refresh);
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerout', leave);
    document.addEventListener('visibilitychange', refresh);
    document.addEventListener('pointerlockchange', refresh);
    document.addEventListener('fullscreenchange', refresh);
    window.addEventListener('resize', layoutChanged);
    window.addEventListener('scroll', layoutChanged, { passive: true });
    setSprite('idle');
    refresh();

    return () => {
      disposed = true;
      cancelAnimationFrame(animation);
      element.hidden = true;
      gameObserver.disconnect();
      pointer.removeEventListener('change', refresh);
      reducedMotion.removeEventListener('change', refresh);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerout', leave);
      document.removeEventListener('visibilitychange', refresh);
      document.removeEventListener('pointerlockchange', refresh);
      document.removeEventListener('fullscreenchange', refresh);
      window.removeEventListener('resize', layoutChanged);
      window.removeEventListener('scroll', layoutChanged);
    };
  }, []);

  return <div id="cursor-cat" ref={cat} className={styles.cat} aria-hidden="true" hidden />;
}
