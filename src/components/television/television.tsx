'use client';

import { useEffect, useRef, useState } from 'react';
import { Power, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import type { TVScene } from './television-scene';
import type { DoomRuntime } from './doom-runtime';
import { createGameInput, createMouseLook } from '@/lib/game-controls';
import styles from './television.module.css';

type Status = 'off' | 'booting' | 'ready' | 'playing' | 'error';
type Actions = { power: () => void; play: () => void; mute: () => void; fullscreen: () => void };

export default function Television() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const powerRef = useRef<HTMLButtonElement>(null);
  const soundRef = useRef<HTMLButtonElement>(null);
  const screenRef = useRef<HTMLButtonElement>(null);
  const actions = useRef<Actions | null>(null);
  const [status, setStatus] = useState<Status>('off');
  const [loaded, setLoaded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [notice, setNotice] = useState('Turn the left knob. There’s a game in here.');

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const power = powerRef.current;
    const sound = soundRef.current;
    const screen = screenRef.current;
    if (!host || !canvas || !power || !sound || !screen) return;
    let scene: TVScene | null = null;
    let runtime: DoomRuntime | null = null;
    let controller: AbortController | null = null;
    let audio: AudioContext | null = null;
    let state: Status = 'off';
    let isMuted = false;
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
      scene?.setMode('off');
      transition('off', 'Turn the left knob. There’s a game in here.');
    };
    const boot = async () => {
      if (!scene) return;
      if (state !== 'off' && state !== 'error') {
        shutDown();
        return;
      }
      const attempt = new AbortController();
      controller = attempt;
      transition('booting', 'Tuning in… loading Doom.');
      scene.setMode('static');
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
        game.setMuted(isMuted);
        await game.ready;
        const remaining = Math.max(0, 1500 - (performance.now() - started));
        if (remaining) await new Promise((resolve) => window.setTimeout(resolve, remaining));
        if (attempt.signal.aborted || disposed) return;
        scene.setFrame(game.canvas);
        scene.setMode('game');
        transition('ready', 'Nuclear Plant · Enemies nearby. Click the screen to play.');
      } catch (error) {
        if (attempt.signal.aborted || disposed) return;
        runtime?.dispose();
        runtime = null;
        if (audio) {
          void audio.close().catch(() => {});
          audio = null;
        }
        scene?.setMode('off');
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
        isMuted = !isMuted;
        setMuted(isMuted);
        runtime?.setMuted(isMuted);
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
      aria-label="Play Doom on a vintage television"
      data-state={status}
    >
      <div className={styles.stage} ref={hostRef} tabIndex={-1} aria-label="Doom game controls">
        <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
        {!loaded && status !== 'error' && <p className={styles.loading}>Loading TV…</p>}
        <button
          ref={powerRef}
          className={styles.knob}
          disabled={!loaded}
          onClick={() => actions.current?.power()}
          aria-label={powered ? 'Turn TV off' : 'Turn TV on'}
          aria-pressed={powered}
          title={powered ? 'Power off' : 'Power on'}
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
            DOOM · Nuclear Plant · Normal difficulty · Keyboard and mouse required.{' '}
            <a href="/games/credits.txt" target="_blank" rel="noreferrer">
              Credits
            </a>
          </p>
        </div>
      )}
    </section>
  );
}
