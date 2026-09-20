import type { CommandInterface, Emulators, InitFileEntry } from 'emulators';
import { unzipSync } from 'fflate';
import {
  createDoomPreparation,
  isLevelFrameReady,
  withAbort,
  type LoadingProgress,
} from '../../lib/doom-preparation';

declare global {
  interface Window {
    emulators?: Emulators;
  }
}

const ASSETS = '/vendor/doom/';
const ARCHIVE_HASH = 'cacf0142b31ca1af00796b4a0339e07992ac5f21bc3f81e7532fe1b5e1b486e6';
let emulatorScript: Promise<Emulators> | null = null;
function loadEmulator(): Promise<Emulators> {
  if (window.emulators) return Promise.resolve(window.emulators);
  return (emulatorScript ??= new Promise<Emulators>((resolve, reject) => {
    const script = document.createElement('script');
    const fail = () => {
      clearTimeout(timeout);
      script.remove();
      reject(new Error('Could not load the game engine.'));
    };
    const timeout = window.setTimeout(fail, 30000);
    script.src = `${ASSETS}emulators.js`;
    script.onload = () => {
      clearTimeout(timeout);
      if (window.emulators) resolve(window.emulators);
      else reject(new Error('Game engine did not initialize.'));
    };
    script.onerror = fail;
    document.head.append(script);
  }).catch((error) => {
    emulatorScript = null;
    throw error;
  }));
}

// The original shareware archive is served unchanged. Installation happens
// in browser memory; no commercial WAD or extracted game files are hosted.
async function installShareware(
  signal: AbortSignal,
  report: LoadingProgress,
): Promise<InitFileEntry[]> {
  report('Downloading Doom…');
  const response = await fetch('/games/doom19s.zip', { signal });
  if (!response.ok) throw new Error('Could not load Doom shareware.');
  const chunks: Uint8Array[] = [];
  let received = 0;
  let lastPercent = -1;
  const reader = response.body?.getReader();
  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.byteLength;
        // Known length of the original, hash-verified shareware distribution.
        const percent = Math.min(100, Math.floor((received / 2450688) * 100));
        if (percent !== lastPercent) {
          report(`Downloading Doom… ${percent}%`);
          lastPercent = percent;
        }
      }
    } finally {
      reader.releaseLock();
    }
  } else {
    const bytes = new Uint8Array(await response.arrayBuffer());
    chunks.push(bytes);
    received = bytes.byteLength;
  }
  const archiveBytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    archiveBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  report('Checking game files…');
  const hash = Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', archiveBytes)),
    (value) => value.toString(16).padStart(2, '0'),
  ).join('');
  if (hash !== ARCHIVE_HASH) throw new Error('The game download failed its integrity check.');
  signal.throwIfAborted();
  const zip = unzipSync(archiveBytes);
  const parts = [zip['DOOMS_19.1'], zip['DOOMS_19.2']];
  if (parts.some((part) => !part)) throw new Error('The shareware archive is incomplete.');
  const lha = new Uint8Array(parts[0].length + parts[1].length);
  lha.set(parts[0]);
  lha.set(parts[1], parts[0].length);
  const { Archive } = await import('libarchive.js');
  signal.throwIfAborted();
  report('Preparing game files…');
  // Own the worker before Archive.open so cancellation also covers WASM startup.
  const worker = new Worker(`${ASSETS}worker-bundle.js`, { type: 'module' });
  Archive.init({ getWorker: () => worker });
  let failWorker: (event: ErrorEvent) => void;
  const failed = new Promise<never>((_, reject) => {
    failWorker = () => reject(new Error('Could not prepare game files.'));
    worker.addEventListener('error', failWorker, { once: true });
  });
  try {
    const archive = await withAbort(
      Promise.race([Archive.open(new File([lha], 'doom.lha')), failed]),
      signal,
    );
    const files: Record<string, File> = await withAbort(
      Promise.race([archive.extractFiles(), failed]),
      signal,
    );
    signal.throwIfAborted();
    return await Promise.all(
      Object.entries(files)
        .filter(([, file]) => file instanceof File)
        .map(async ([path, file]) => ({
          path,
          contents: new Uint8Array(await file.arrayBuffer()),
        })),
    );
  } finally {
    worker.removeEventListener('error', failWorker!);
    worker.terminate();
  }
}

export const prepareDoom = createDoomPreparation(async (signal, report) => {
  const engine = loadEmulator().then(async (emulators) => {
    emulators.pathPrefix = ASSETS;
    // Fetch runtime binaries while the game archive is downloaded/unpacked.
    await Promise.all(
      ['wdosbox.js', 'wdosbox.wasm', 'wlibzip.js', 'wlibzip.wasm'].map(async (file) => {
        const response = await fetch(`${ASSETS}${file}`, { signal, cache: 'force-cache' });
        if (!response.ok) throw new Error('Could not download the game engine.');
        await response.arrayBuffer();
      }),
    );
    return emulators;
  });
  const [emulators, files] = await Promise.all([engine, installShareware(signal, report)]);
  report('Game files ready.');
  return { emulators, files };
});

const dosboxConf = `[sdl]
autolock=false
[dosbox]
memsize=16
machine=svga_s3
[render]
frameskip=0
aspect=false
[cpu]
core=auto
cycles=fixed 24000
[mixer]
rate=22050
blocksize=512
prebuffer=20
[sblaster]
sbtype=sb16
sbbase=220
irq=7
dma=1
hdma=5
[autoexec]
@echo off
mount c .
c:
doom.exe -config PORTFO.CFG -warp 1 1 -skill 2
exit
`;

const controlsConfig = `mouse_sensitivity 5
sfx_volume 8
music_volume 5
show_messages 1
key_right 77
key_left 75
key_up 17
key_down 31
key_strafeleft 30
key_straferight 32
key_fire 29
key_use 18
key_strafe 56
key_speed 42
use_mouse 1
mouseb_fire 0
mouseb_strafe -1
mouseb_forward -1
use_joystick 0
screenblocks 10
detaillevel 0
snd_channels 8
snd_musicdevice 3
snd_sfxdevice 3
snd_sbport 544
snd_sbirq 7
snd_sbdma 1
snd_mport 816
`;

export type DoomRuntime = {
  canvas: HTMLCanvasElement;
  ci: CommandInterface;
  ready: Promise<void>;
  resume: () => void;
  pause: () => void;
  setMuted: (muted: boolean) => void;
  dispose: () => void;
};

export async function startDoom(
  signal: AbortSignal,
  audio: AudioContext | null,
  report: LoadingProgress = () => {},
): Promise<DoomRuntime> {
  const { emulators, files } = await prepareDoom(signal, report);
  signal.throwIfAborted();
  report('Starting Doom…');
  const ci = await emulators.dosboxWorker([
    { dosboxConf, jsdosConf: { version: '8' } },
    // The emulator may transfer buffers to its worker. Keep our cached originals intact.
    ...files.map(({ path, contents }) => ({ path, contents: new Uint8Array(contents) })),
    { path: 'PORTFO.CFG', contents: new TextEncoder().encode(controlsConfig) },
  ]);
  if (signal.aborted) {
    await ci.exit();
    signal.throwIfAborted();
  }
  const canvas = document.createElement('canvas');
  canvas.width = ci.width() || 320;
  canvas.height = ci.height() || 200;
  const context = canvas.getContext('2d')!;
  let pixels = context.createImageData(canvas.width, canvas.height);
  let disposed = false;
  let active = false;
  let readyDone = false;
  let readyTimer: number | undefined;
  let nextAudio = 0;
  const gain = audio?.createGain();
  gain?.connect(audio!.destination);
  if (gain) gain.gain.value = 0;
  const scheduled = new Set<AudioBufferSourceNode>();
  let resolveReady: () => void;
  let rejectReady: (reason: Error) => void;
  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  // A consumer may still be waiting for the minimum static sequence.
  void ready.catch(() => {});
  const timeout = window.setTimeout(
    () => rejectReady(new Error('Doom took too long to start. Try powering the TV on again.')),
    45000,
  );
  ci.events().onFrameSize((width, height) => {
    if (disposed) return;
    canvas.width = width;
    canvas.height = height;
    pixels = context.createImageData(width, height);
    if (width === 320 && height === 200 && !readyDone) report('Opening the first level…');
  });
  ci.events().onFrame((rgb, rgba) => {
    if (disposed) return;
    if (rgba) pixels.data.set(rgba);
    else if (rgb)
      for (let from = 0, to = 0; from < rgb.length; from += 3, to += 4) {
        pixels.data[to] = rgb[from];
        pixels.data[to + 1] = rgb[from + 1];
        pixels.data[to + 2] = rgb[from + 2];
        pixels.data[to + 3] = 255;
      }
    context.putImageData(pixels, 0, 0);
    // Frame callbacks can be sparse in a still scene. Wait for the actual HUD,
    // not an arbitrary frame count that can leave the TV on static for seconds.
    if (
      !readyDone &&
      readyTimer === undefined &&
      isLevelFrameReady(pixels.data, canvas.width, canvas.height)
    ) {
      readyTimer = window.setTimeout(() => {
        if (disposed) return;
        readyDone = true;
        clearTimeout(timeout);
        ci.pause();
        resolveReady();
      }, 150);
    }
  });
  ci.events().onSoundPush((samples) => {
    if (!audio || !gain || disposed || !active || audio.state !== 'running') return;
    if (nextAudio > audio.currentTime + 0.18) return;
    const buffer = audio.createBuffer(1, samples.length, ci.soundFrequency() || 22050);
    buffer.copyToChannel(new Float32Array(samples), 0);
    const source = audio.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);
    scheduled.add(source);
    source.onended = () => {
      scheduled.delete(source);
      source.disconnect();
    };
    nextAudio = Math.max(nextAudio, audio.currentTime + 0.025);
    source.start(nextAudio);
    nextAudio += buffer.duration;
  });
  const clearAudio = () => {
    for (const source of scheduled) {
      source.stop();
      source.disconnect();
    }
    scheduled.clear();
    nextAudio = 0;
  };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    active = false;
    clearTimeout(timeout);
    clearTimeout(readyTimer);
    clearAudio();
    gain?.disconnect();
    signal.removeEventListener('abort', dispose);
    rejectReady(new DOMException('TV powered off.', 'AbortError'));
    void ci.exit();
  };
  signal.addEventListener('abort', dispose, { once: true });
  return {
    canvas,
    ci,
    ready,
    resume() {
      if (disposed) return;
      active = true;
      void audio?.resume();
      ci.resume();
    },
    pause() {
      if (disposed || !readyDone) return;
      active = false;
      ci.pause();
      clearAudio();
    },
    setMuted(muted) {
      if (gain) gain.gain.value = muted ? 0 : 0.55;
    },
    dispose,
  };
}
