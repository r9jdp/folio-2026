import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDoomPreparation, isLevelFrameReady } from '../src/lib/doom-preparation';

test('a dark level becomes ready once its HUD is visible without extra frame updates', () => {
  const pixels = new Uint8ClampedArray(320 * 200 * 4);
  assert.equal(isLevelFrameReady(pixels, 320, 200), false);
  // Only half of the bottom has been revealed by the opening melt.
  for (let y = 168; y < 200; y++)
    for (let x = 0; x < 160; x++) pixels.fill(80, (y * 320 + x) * 4, (y * 320 + x) * 4 + 3);
  assert.equal(isLevelFrameReady(pixels, 320, 200), false);
  for (let y = 168; y < 200; y++)
    for (let x = 160; x < 320; x++) pixels.fill(80, (y * 320 + x) * 4, (y * 320 + x) * 4 + 3);
  assert.equal(isLevelFrameReady(pixels, 320, 200), true);
  // A narrow strip of the melt can remain after most of the HUD has appeared.
  for (let y = 168; y < 200; y++) pixels.fill(0, (y * 320 + 160) * 4, (y * 320 + 164) * 4);
  assert.equal(isLevelFrameReady(pixels, 320, 200), false);
  assert.equal(isLevelFrameReady(pixels, 640, 400), false);
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

test('preload, power-on and subsequent restarts share one successful preparation', async () => {
  const pending = deferred<Uint8Array>();
  let loads = 0;
  const prepare = createDoomPreparation(async () => {
    loads++;
    return pending.promise;
  });
  const preloaded = prepare();
  const powered = prepare();
  const bytes = new Uint8Array([1, 2, 3]);
  pending.resolve(bytes);
  assert.equal(await preloaded, bytes);
  assert.equal(await powered, bytes);
  assert.equal(await prepare(), bytes);
  assert.equal(loads, 1);
});

test('powering off cancels its waiter without discarding work used by the next power-on', async () => {
  const pending = deferred<string>();
  let preparationSignal!: AbortSignal;
  let report!: (message: string) => void;
  const prepare = createDoomPreparation(async (signal, progress) => {
    preparationSignal = signal;
    report = progress;
    return pending.promise;
  });
  const off = new AbortController();
  const firstProgress: string[] = [];
  const first = prepare(off.signal, (message) => firstProgress.push(message));
  const secondProgress: string[] = [];
  const second = prepare(undefined, (message) => secondProgress.push(message));
  await Promise.resolve();
  report('Downloading Doom… 50%');
  off.abort();
  await assert.rejects(first, { name: 'AbortError' });
  report('Preparing game files…');
  pending.resolve('ready');
  assert.equal(await second, 'ready');
  assert.equal(preparationSignal.aborted, false);
  assert.equal(firstProgress.includes('Preparing game files…'), false);
  assert.equal(secondProgress.includes('Preparing game files…'), true);
});

test('a failed background download is evicted so power-on can retry', async () => {
  let loads = 0;
  const prepare = createDoomPreparation(async () => {
    if (++loads === 1) throw new Error('Download failed');
    return 'ready';
  });
  await assert.rejects(prepare(), /Download failed/);
  assert.equal(await prepare(), 'ready');
  assert.equal(loads, 2);
});

test('a stalled archive worker times out, receives abort, and does not poison a retry', async () => {
  let loads = 0;
  let aborted = false;
  const prepare = createDoomPreparation(async (signal) => {
    if (++loads > 1) return 'ready';
    signal.addEventListener('abort', () => {
      aborted = true;
    });
    return new Promise<string>(() => {});
  }, 10);
  await assert.rejects(prepare(), /timed out/);
  assert.equal(aborted, true);
  assert.equal(await prepare(), 'ready');
});
