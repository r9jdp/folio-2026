import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createGameInput } from '../src/lib/game-controls';

test('pause releases simultaneous movement and fire, then resume accepts fresh input', () => {
  const events: [number | string, boolean][] = [];
  const input = createGameInput({
    key: (key, down) => events.push([key, down]),
    fire: (down) => events.push(['fire', down]),
  });
  input.press('KeyW');
  input.press('KeyD');
  input.press('ShiftLeft');
  input.press('KeyW');
  input.fire(true);
  input.reset();
  input.press('KeyW');
  assert.deepEqual(events, [
    [87, true],
    [68, true],
    [340, true],
    ['fire', true],
    [87, false],
    [68, false],
    [340, false],
    ['fire', false],
    [87, true],
  ]);
  input.reset();
});

test('releasing one use-key alias does not release the other held alias', () => {
  const events: [number, boolean][] = [];
  const input = createGameInput({ key: (key, down) => events.push([key, down]), fire: () => {} });
  assert.equal(input.press('KeyQ'), false);
  input.press('KeyE');
  input.press('Space');
  input.release('KeyE');
  assert.deepEqual(events, [[69, true]]);
  input.release('Space');
  assert.deepEqual(events, [
    [69, true],
    [69, false],
  ]);
});

test('a short click survives a Doom tick; pausing cancels its pending release', () => {
  const events: boolean[] = [];
  let now = 0;
  let queued: (() => void) | undefined;
  let delay = 0;
  const input = createGameInput(
    { key: () => {}, fire: (down) => events.push(down) },
    {
      now: () => now,
      later: (fn, ms) => {
        queued = fn;
        delay = ms;
        return 1 as unknown as ReturnType<typeof setTimeout>;
      },
      cancel: () => {
        queued = undefined;
      },
    },
  );
  input.fire(true);
  now = 5;
  input.fire(false);
  assert.equal(delay, 45);
  assert.deepEqual(events, [true]);
  queued!();
  assert.deepEqual(events, [true, false]);
  input.fire(true);
  input.fire(false);
  input.reset();
  assert.equal(queued, undefined);
  assert.deepEqual(events, [true, false, true, false]);
});
