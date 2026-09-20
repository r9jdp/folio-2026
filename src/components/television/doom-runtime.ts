import type { CommandInterface, Emulators, InitFsEntry } from 'emulators';
import { unzipSync } from 'fflate';

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
    script.src = `${ASSETS}emulators.js`;
    script.onload = () =>
      window.emulators
        ? resolve(window.emulators)
        : reject(new Error('Game engine did not initialize.'));
    script.onerror = () => reject(new Error('Could not load the game engine.'));
    document.head.append(script);
  }).catch((error) => {
    emulatorScript = null;
    throw error;
  }));
}

// The original shareware archive is served unchanged. Installation happens
// in browser memory; no commercial WAD or extracted game files are hosted.
async function installShareware(signal: AbortSignal): Promise<InitFsEntry[]> {
  const response = await fetch('/games/doom19s.zip', { signal });
  if (!response.ok) throw new Error('Could not load Doom shareware.');
  const archiveBytes = await response.arrayBuffer();
  const hash = Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', archiveBytes)),
    (value) => value.toString(16).padStart(2, '0'),
  ).join('');
  if (hash !== ARCHIVE_HASH) throw new Error('The game download failed its integrity check.');
  const zip = unzipSync(new Uint8Array(archiveBytes));
  const parts = [zip['DOOMS_19.1'], zip['DOOMS_19.2']];
  if (parts.some((part) => !part)) throw new Error('The shareware archive is incomplete.');
  const lha = new Uint8Array(parts[0].length + parts[1].length);
  lha.set(parts[0]);
  lha.set(parts[1], parts[0].length);
  const { Archive } = await import('libarchive.js');
  Archive.init({ workerUrl: `${ASSETS}worker-bundle.js` });
  signal.throwIfAborted();
  const archive = await Archive.open(new File([lha], 'doom.lha'));
  let rejectCancelled: (reason: unknown) => void;
  const cancelled = new Promise<never>((_, reject) => {
    rejectCancelled = reject;
  });
  const cancel = () => rejectCancelled(signal.reason);
  signal.addEventListener('abort', cancel, { once: true });
  try {
    signal.throwIfAborted();
    const files: Record<string, File> = await Promise.race([archive.extractFiles(), cancelled]);
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
    signal.removeEventListener('abort', cancel);
    await archive.close();
  }
}

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
): Promise<DoomRuntime> {
  const [emulators, files] = await Promise.all([loadEmulator(), installShareware(signal)]);
  signal.throwIfAborted();
  emulators.pathPrefix = ASSETS;
  const ci = await emulators.dosboxWorker([
    { dosboxConf, jsdosConf: { version: '8' } },
    ...files,
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
  let gameFrames = 0;
  let readyDone = false;
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
    // Let Doom finish its opening melt transition before freezing the preview.
    if (canvas.width === 320 && canvas.height === 200 && ++gameFrames >= 70 && !readyDone) {
      readyDone = true;
      clearTimeout(timeout);
      ci.pause();
      resolveReady();
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
      if (disposed) return;
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
