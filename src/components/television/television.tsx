'use client';

import { useEffect, useRef, useState } from 'react';
import { Power, Volume2, VolumeX, Maximize2, Pause, Play } from 'lucide-react';
import type { TVScene } from './television-scene';
import type { DoomRuntime } from './doom-runtime';
import { createGameInput, createMouseLook } from '@/lib/game-controls';
import styles from './television.module.css';

type Status = 'video' | 'booting' | 'ready' | 'playing' | 'error';
type Actions = {
  power: () => void;
  play: () => void;
  mute: () => void;
  toggleVideo: () => void;
  fullscreen: () => void;
};
const videoNotice = 'A little dog TV. Turn the left knob to play Doom.';

export default function Television() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const powerRef = useRef<HTMLButtonElement>(null);
  const soundRef = useRef<HTMLButtonElement>(null);
  const screenRef = useRef<HTMLButtonElement>(null);
  const actions = useRef<Actions | null>(null);
  const [status, setStatus] = useState<Status>('video');
  const [loaded, setLoaded] = useState(false);
  const [muted, setMuted] = useState(true);
  const [videoPaused, setVideoPaused] = useState(false);
  const [notice, setNotice] = useState(videoNotice);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const power = powerRef.current;
    const sound = soundRef.current;
    const screen = screenRef.current;
    if (!host || !canvas || !video || !power || !sound || !screen) return;
    let scene: TVScene | null = null;
    let runtime: DoomRuntime | null = null;
    let controller: AbortController | null = null;
    let audio: AudioContext | null = null;
    let state: Status = 'video';
    // Autoplay starts silently; Doom keeps its audible default until the user chooses mute.
    let mutePreference: boolean | null = null;
    let isVideoPaused = false;
    let disposed = false;
    let preloadIdle: number | undefined;
    let preloadTimer: number | undefined;
    const preload = () => {
      if (disposed) return;
      void import('./doom-runtime')
        .then(({ prepareDoom }) => {
          if (!disposed) return prepareDoom();
        })
        .catch(() => {
          /* Power-on retries a failed background preparation. */
        });
    };
    const input = createGameInput({
      key: (key, pressed) => runtime?.ci.sendKeyEvent(key, pressed),
      fire: (pressed) => runtime?.ci.sendMouseButton(0, pressed),
    });
    const mouseLook = createMouseLook();
    const transition = (next: Status, message: string) => {
      state = next;
      if (!disposed) {
        setStatus(next);
        setNotice(message);
      }
    };
    const releaseKeys = () => {
      input.reset();
    };
    const pause = () => {
      mouseLook.reset();
      // Focus changes during boot must not stop the frames that make Doom ready.
      if (state !== 'playing') return;
      releaseKeys();
      runtime?.pause();
      scene?.setPlaying(false);
      if (state === 'playing') transition('ready', 'Paused. Click the screen to continue.');
      if (document.pointerLockElement === host) document.exitPointerLock();
    };
    const shutDown = () => {
      pause();
      controller?.abort();
      controller = null;
      runtime?.dispose();
      runtime = null;
      if (audio) {
        void audio.close().catch(() => {});
        audio = null;
      }
      if (!disposed) {
        isVideoPaused = false;
        setVideoPaused(false);
        setMuted(mutePreference ?? true);
        scene?.setVideoMuted(mutePreference ?? true);
        scene?.setVideoPaused(false);
        scene?.setMode('video');
        transition('video', videoNotice);
      }
    };
    const boot = async () => {
      if (!scene) return;
      if (state !== 'video' && state !== 'error') {
        shutDown();
        return;
      }
      const attempt = new AbortController();
      controller = attempt;
      transition('booting', 'Tuning in… loading Doom.');
      scene.setMode('static');
      setMuted(mutePreference ?? false);
      const started = performance.now();
      const watchdog = window.setTimeout(() => {
        if (controller !== attempt || disposed) return;
        shutDown();
        transition('error', 'Doom took too long to load. Turn the power knob to retry.');
      }, 60000);
      try {
        try {
          audio = new AudioContext({ latencyHint: 'interactive' });
          void audio.resume();
        } catch {
          audio = null;
        }
        const { startDoom } = await import('./doom-runtime');
        attempt.signal.throwIfAborted();
        const game = await startDoom(attempt.signal, audio, (message) => {
          if (!disposed && controller === attempt && !attempt.signal.aborted)
            transition('booting', message);
        });
        if (attempt.signal.aborted) {
          game.dispose();
          return;
        }
        runtime = game;
        game.setMuted(mutePreference ?? false);
        await game.ready;
        const remaining = Math.max(0, 1500 - (performance.now() - started));
        if (remaining) await new Promise((resolve) => window.setTimeout(resolve, remaining));
        if (attempt.signal.aborted || disposed) return;
        scene.setFrame(game.canvas);
        scene.setMode('game');
        transition('ready', 'Doom is ready. Click the screen to play.');
      } catch (error) {
        if (attempt.signal.aborted || disposed) return;
        runtime?.dispose();
        runtime = null;
        if (audio) {
          void audio.close().catch(() => {});
          audio = null;
        }
        scene?.setVideoMuted(mutePreference ?? true);
        scene?.setMode('video');
        setMuted(mutePreference ?? true);
        transition(
          'error',
          error instanceof Error
            ? `${error.message} Turn the power knob to retry.`
            : 'Could not start Doom. Turn the power knob to retry.',
        );
      } finally {
        clearTimeout(watchdog);
      }
    };
    const play = () => {
      if (state !== 'ready' || !runtime) return;
      mouseLook.reset();
      const withoutCapture = () => {
        if (disposed || state !== 'ready' || !runtime) return;
        runtime.resume();
        scene?.setPlaying(true);
        transition('playing', 'Playing · Move the mouse over the TV to turn. Esc pauses.');
      };
      host.focus({ preventScroll: true });
      if (!host.requestPointerLock) {
        withoutCapture();
        return;
      }
      try {
        const request = host.requestPointerLock();
        request?.catch(withoutCapture);
      } catch {
        withoutCapture();
      }
    };
    const locked = () => {
      mouseLook.reset();
      if (document.pointerLockElement === host && runtime) {
        runtime.resume();
        scene?.setPlaying(true);
        transition('playing', 'Playing · Esc releases the mouse and pauses.');
      } else pause();
    };
    const keyDown = (event: KeyboardEvent) => {
      if (state !== 'playing') return;
      if (event.code === 'Escape') {
        pause();
        return;
      }
      if (input.press(event.code)) event.preventDefault();
    };
    const keyUp = (event: KeyboardEvent) => {
      if (input.release(event.code)) event.preventDefault();
    };
    const mouseMove = (event: MouseEvent) => {
      const captured = document.pointerLockElement === host;
      if (state !== 'playing' || (!captured && !host.contains(event.target as Node))) {
        mouseLook.reset();
        return;
      }
      const turn = mouseLook.move(event, captured);
      if (turn) runtime?.ci.sendMouseRelativeMotion(turn, 0);
    };
    const mouseLeave = () => {
      if (document.pointerLockElement !== host) mouseLook.reset();
    };
    const mouseDown = (event: MouseEvent) => {
      if (state !== 'playing') return;
      if (
        document.pointerLockElement !== host &&
        event.target !== canvas &&
        event.target !== host
      ) {
        pause();
        return;
      }
      if (event.button === 0) {
        event.preventDefault();
        input.fire(true);
      }
    };
    const mouseUp = () => input.fire(false);
    const visibility = () => {
      if (document.hidden) pause();
    };
    actions.current = {
      power: () => {
        void boot();
      },
      play,
      mute: () => {
        const showingVideo = state === 'video' || state === 'error';
        mutePreference = !(mutePreference ?? showingVideo);
        setMuted(mutePreference);
        scene?.setVideoMuted(mutePreference);
        runtime?.setMuted(mutePreference);
      },
      toggleVideo: () => {
        isVideoPaused = !isVideoPaused;
        setVideoPaused(isVideoPaused);
        scene?.setVideoPaused(isVideoPaused);
        if (state === 'video') setNotice(videoNotice);
      },
      fullscreen: () => {
        pause();
        const section = host.parentElement;
        if (document.fullscreenElement) void document.exitFullscreen();
        else if (section?.requestFullscreen)
          void section
            .requestFullscreen()
            .catch(() => setNotice('Fullscreen is unavailable in this browser.'));
      },
    };
    const fail = () => {
      shutDown();
      if (!disposed) {
        setLoaded(false);
        transition('error', 'The 3D TV could not load. Your portfolio is available below.');
      }
    };
    void import('./television-scene')
      .then(({ createTVScene }) => {
        if (disposed) return;
        try {
          scene = createTVScene(
            host,
            canvas,
            { power, sound, screen },
            () => {
              if (!disposed) {
                setLoaded(true);
                if (typeof window.requestIdleCallback === 'function')
                  preloadIdle = window.requestIdleCallback(preload, { timeout: 2000 });
                else preloadTimer = window.setTimeout(preload, 300);
              }
            },
            fail,
            {
              video,
              onBlocked: () => {
                if (disposed) return;
                isVideoPaused = true;
                setVideoPaused(true);
                if (state === 'video')
                  setNotice('Press Play video, or turn the left knob to play Doom.');
              },
            },
          );
        } catch {
          fail();
        }
      })
      .catch(fail);
    document.addEventListener('pointerlockchange', locked);
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
    document.addEventListener('mousemove', mouseMove);
    host.addEventListener('mouseleave', mouseLeave);
    document.addEventListener('mousedown', mouseDown);
    document.addEventListener('mouseup', mouseUp);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', pause);
    return () => {
      disposed = true;
      if (preloadIdle !== undefined) window.cancelIdleCallback(preloadIdle);
      if (preloadTimer !== undefined) window.clearTimeout(preloadTimer);
      shutDown();
      video.pause();
      actions.current = null;
      scene?.dispose();
      document.removeEventListener('pointerlockchange', locked);
      document.removeEventListener('keydown', keyDown);
      document.removeEventListener('keyup', keyUp);
      document.removeEventListener('mousemove', mouseMove);
      host.removeEventListener('mouseleave', mouseLeave);
      document.removeEventListener('mousedown', mouseDown);
      document.removeEventListener('mouseup', mouseUp);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', pause);
    };
  }, []);

  const powered = status === 'booting' || status === 'ready' || status === 'playing';
  return (
    <section
      className={styles.hero}
      aria-label="Watch my dog or play Doom on a vintage television"
      data-state={status}
    >
      <div className={styles.stage} ref={hostRef} tabIndex={-1} aria-label="Doom game controls">
        <video
          ref={videoRef}
          className={styles.videoSource}
          src="/videos/doggy.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          onError={() => {
            if (status === 'video')
              setNotice('The video couldn’t load. Turn the left knob to play Doom.');
          }}
        />
        <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
        {!loaded && status !== 'error' && <p className={styles.loading}>Loading TV…</p>}
        <button
          ref={powerRef}
          className={styles.knob}
          disabled={!loaded}
          onClick={() => actions.current?.power()}
          aria-label={powered ? 'Return to dog video' : 'Start Doom'}
          aria-pressed={powered}
          title={powered ? 'Return to dog video' : 'Start Doom'}
        >
          <span className={styles.knobHint}>
            <Power size={12} /> Power
          </span>
        </button>
        <button
          ref={soundRef}
          className={styles.knob}
          disabled={!loaded}
          onClick={() => actions.current?.mute()}
          aria-label={muted ? 'Unmute TV' : 'Mute TV'}
          aria-pressed={muted}
          title={muted ? 'Unmute' : 'Mute'}
        >
          <span className={styles.knobHint}>
            {muted ? <VolumeX size={12} /> : <Volume2 size={12} />} Sound
          </span>
        </button>
        <button
          ref={screenRef}
          className={styles.play}
          hidden={status !== 'ready'}
          onClick={() => actions.current?.play()}
          aria-label="Play Doom — capture mouse"
        >
          Click to play <span>WASD + mouse</span>
        </button>
      </div>
      <div className={styles.caption}>
        <p role="status" aria-live="polite">
          {notice}
        </p>
        {loaded && !powered && (
          <button onClick={() => actions.current?.toggleVideo()} className={styles.expand}>
            {videoPaused ? <Play size={13} /> : <Pause size={13} />}
            {videoPaused ? 'Play video' : 'Pause video'}
          </button>
        )}
        {powered && (
          <button onClick={() => actions.current?.fullscreen()} className={styles.expand}>
            <Maximize2 size={13} /> Fullscreen
          </button>
        )}
      </div>
      {powered && (
        <div className={styles.controls} aria-label="Doom keyboard and mouse controls">
          <span>
            <kbd>W A S D</kbd> Move
          </span>
          <span>
            <kbd>Mouse</kbd> Turn
          </span>
          <span>
            <kbd>Click</kbd> Fire
          </span>
          <span>
            <kbd>E</kbd> Open / use
          </span>
          <span>
            <kbd>Shift</kbd> Run
          </span>
          <span>
            <kbd>1–7</kbd> Weapons
          </span>
          <span>
            <kbd>Esc</kbd> Pause / release
          </span>
          <p>
            DOOM · Shareware episode · Keyboard and mouse required.{' '}
            <a href="/games/credits.txt" target="_blank" rel="noreferrer">
              Credits
            </a>
          </p>
        </div>
      )}
    </section>
  );
}
