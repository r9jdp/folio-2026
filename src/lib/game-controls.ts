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
  // Vertical mouse motion is deliberately ignored: DOS Doom otherwise walks
  // forward/backward when you move the mouse up/down.
  return Math.max(-0.3, Math.min(0.3, movementX / 900));
}
