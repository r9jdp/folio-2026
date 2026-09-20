export type LoadingProgress = (message: string) => void;

/** The unmodified shareware level reveals its grey HUD last during the opening melt. */
export function isLevelFrameReady(rgba: Uint8ClampedArray, width: number, height: number) {
  if (width !== 320 || height !== 200 || rgba.length !== width * height * 4) return false;
  let visible = 0;
  let samples = 0;
  // Avoid rounded edge pixels and the dark weapon slots. The lower HUD background
  // spans the image even when the scene above it is dark or completely still.
  for (let x = 16; x < 304; x += 4) {
    let columnVisible = false;
    for (let y = 190; y < 198; y += 2) {
      const i = (y * width + x) * 4;
      if (rgba[i] + rgba[i + 1] + rgba[i + 2] > 36) {
        visible++;
        columnVisible = true;
      }
      samples++;
    }
    if (!columnVisible) return false;
  }
  return visible / samples > 0.9;
}

/** Cancel one caller without cancelling preparation shared with another power-on. */
export function withAbort<T>(work: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return work;
  if (signal.aborted) {
    void work.catch(() => {});
    return Promise.reject(signal.reason);
  }
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason);
    signal.addEventListener('abort', abort, { once: true });
    work.then(
      (value) => {
        signal.removeEventListener('abort', abort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener('abort', abort);
        reject(error);
      },
    );
  });
}

/** One bounded preparation per page, reused by preloading and subsequent sessions. */
export function createDoomPreparation<T>(
  load: (signal: AbortSignal, report: LoadingProgress) => Promise<T>,
  timeoutMs = 45000,
) {
  type Entry = { work: Promise<T>; message: string; listeners: Set<LoadingProgress> };
  let cached: Entry | undefined;
  return (signal?: AbortSignal, onProgress?: LoadingProgress): Promise<T> => {
    if (signal?.aborted) return Promise.reject(signal.reason);
    if (!cached) {
      const controller = new AbortController();
      const entry: Entry = {
        work: Promise.resolve(null as T),
        message: 'Preparing Doom…',
        listeners: new Set<LoadingProgress>(),
      };
      const timeout = setTimeout(
        () => controller.abort(new Error('Game preparation timed out.')),
        timeoutMs,
      );
      const work = Promise.resolve().then(() =>
        load(controller.signal, (message) => {
          entry.message = message;
          entry.listeners.forEach((listener) => listener(message));
        }),
      );
      entry.work = withAbort(work, controller.signal)
        .catch((error) => {
          controller.abort(error);
          if (cached === entry) cached = undefined;
          throw error;
        })
        .finally(() => clearTimeout(timeout));
      cached = entry;
    }
    const entry = cached;
    if (onProgress) {
      entry.listeners.add(onProgress);
      onProgress(entry.message);
    }
    return withAbort(entry.work, signal).finally(() => {
      if (onProgress) entry.listeners.delete(onProgress);
    });
  };
}
