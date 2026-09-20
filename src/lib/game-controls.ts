// GLFW-compatible key IDs expected by js-dos, not browser keyCode values.
export const GAME_KEYS: Readonly<Record<string, number>> = {
  KeyW: 87,
  KeyA: 65,
  KeyS: 83,
  KeyD: 68,
  KeyE: 69,
  Space: 69,
  ShiftLeft: 340,
  ShiftRight: 344,
  ControlLeft: 341,
  ControlRight: 345,
  ArrowLeft: 263,
  ArrowRight: 262,
  ArrowUp: 265,
  ArrowDown: 264,
  Enter: 257,
  Tab: 258,
  Digit1: 49,
  Digit2: 50,
  Digit3: 51,
  Digit4: 52,
  Digit5: 53,
  Digit6: 54,
  Digit7: 55,
};

export function mouseTurn(movementX: number) {
  // js-dos relative motion takes pixel deltas, not normalized coordinates.
  // Keep vertical input zero at the caller: classic Doom otherwise walks with it.
  return Number.isFinite(movementX) ? Math.max(-200, Math.min(200, movementX)) : 0;
}

export function createMouseLook() {
  let previousX: number | null = null;
  return {
    move(event: { clientX: number; movementX: number }, locked: boolean) {
      if (locked) {
        previousX = null;
        return mouseTurn(event.movementX);
      }
      // Embedded browsers can report movementX=0 even when clientX changes.
      const delta = previousX === null ? 0 : event.clientX - previousX;
      previousX = event.clientX;
      return mouseTurn(delta);
    },
    reset() {
      previousX = null;
    },
  };
}

type InputSink = { key: (key: number, pressed: boolean) => void; fire: (pressed: boolean) => void };
type InputClock = {
  now: () => number;
  later: (fn: () => void, delay: number) => ReturnType<typeof setTimeout>;
  cancel: typeof clearTimeout;
};

/** Keep aliases, short clicks and focus loss consistent with Doom's 35 Hz input polling. */
export function createGameInput(
  sink: InputSink,
  clock: InputClock = {
    now: () => performance.now(),
    later: (fn, delay) => setTimeout(fn, delay),
    cancel: (timer) => clearTimeout(timer),
  },
) {
  const held = new Set<string>();
  let firing = false;
  let fireStarted = 0;
  let releaseTimer: ReturnType<typeof setTimeout> | undefined;
  const stopFire = () => {
    clock.cancel(releaseTimer);
    releaseTimer = undefined;
    if (firing) sink.fire(false);
    firing = false;
  };
  return {
    press(code: string) {
      const key = GAME_KEYS[code];
      if (key === undefined) return false;
      if (!held.has(code)) {
        const alreadyPressed = [...held].some((other) => GAME_KEYS[other] === key);
        held.add(code);
        if (!alreadyPressed) sink.key(key, true);
      }
      return true;
    },
    release(code: string) {
      if (!held.delete(code)) return false;
      const key = GAME_KEYS[code];
      if (![...held].some((other) => GAME_KEYS[other] === key)) sink.key(key, false);
      return true;
    },
    fire(pressed: boolean) {
      if (pressed) {
        clock.cancel(releaseTimer);
        releaseTimer = undefined;
        if (!firing) {
          fireStarted = clock.now();
          firing = true;
          sink.fire(true);
        }
      } else if (firing) {
        clock.cancel(releaseTimer);
        releaseTimer = clock.later(stopFire, Math.max(0, 50 - (clock.now() - fireStarted)));
      }
    },
    reset() {
      for (const key of new Set([...held].map((code) => GAME_KEYS[code]))) sink.key(key, false);
      held.clear();
      stopFire();
    },
  };
}
