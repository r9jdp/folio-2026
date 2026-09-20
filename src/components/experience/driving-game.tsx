'use client';

import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Camera,
  CircleHelp,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { createDriveState, type DriveInput, type DriveState } from '@/lib/driving';
import type { DriveAudio } from '@/lib/drive-audio';
import { useExperience } from '@/state/experience';
import styles from './driving-game.module.css';

const DriveScene = dynamic(() => import('./drive-scene'), { ssr: false });
const recordKey = 'rajdeep-endless-drive-best-v1';
const movementKeys = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowLeft',
  'ArrowDown',
  'ArrowRight',
  'Space',
]);
type TouchControl = 'left' | 'right' | 'throttle' | 'brake';

function readBestDistance() {
  try {
    const saved = Number(localStorage.getItem(recordKey));
    return Number.isFinite(saved) && saved > 0 && saved < 1e12 ? saved : 0;
  } catch {
    return 0;
  }
}

function isInteractive(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    !!target.closest('button, a, input, textarea, select, [contenteditable="true"]')
  );
}

class DriveBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function DrivingGame({
  audio,
  reducedMotion,
  onExit,
}: {
  audio: DriveAudio | null;
  reducedMotion: boolean;
  onExit: () => void;
}) {
  const gameRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLButtonElement>(null);
  const vehicle = useRef<DriveState>(createDriveState());
  const input = useRef<DriveInput>({ throttle: 0, brake: 0, steer: 0 });
  const cruiseInput = useRef(false);
  const [cruise, setCruise] = useState(false);
  const keys = useRef(new Set<string>());
  const pointers = useRef(new Map<number, TouchControl>());
  const [telemetry, setTelemetry] = useState(() => createDriveState());
  const [best, setBest] = useState(readBestDistance);
  const record = useRef(best);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(false);
  const [audioUnavailable, setAudioUnavailable] = useState(!audio);
  const [cameraMode, setCameraMode] = useState<'chase' | 'hood'>('chase');
  const [help, setHelp] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const drivePaused = useExperience((s) => s.drivePaused);
  const paused = drivePaused || !ready || failed;

  const focusGame = useCallback(() => gameRef.current?.focus({ preventScroll: true }), []);
  const clearInput = useCallback((cancelCruise = false) => {
    if (cancelCruise) cruiseInput.current = false;
    keys.current.clear();
    pointers.current.clear();
    input.current.throttle = cruiseInput.current ? 1 : 0;
    input.current.brake = 0;
    input.current.steer = 0;
  }, []);

  const persistBest = useCallback(() => {
    record.current = Math.max(record.current, vehicle.current.distance);
    try {
      localStorage.setItem(recordKey, String(record.current));
    } catch {
      // Storage is optional; a private browsing session can still keep driving.
    }
  }, []);

  const syncInput = useCallback(() => {
    const pressed = keys.current;
    const held = new Set(pointers.current.values());
    input.current.brake =
      pressed.has('KeyS') || pressed.has('ArrowDown') || pressed.has('Space') || held.has('brake')
        ? 1
        : 0;
    if (input.current.brake && cruiseInput.current) {
      cruiseInput.current = false;
      setCruise(false);
    }
    input.current.throttle =
      cruiseInput.current || pressed.has('KeyW') || pressed.has('ArrowUp') || held.has('throttle')
        ? 1
        : 0;
    const left = pressed.has('KeyA') || pressed.has('ArrowLeft') || held.has('left');
    const right = pressed.has('KeyD') || pressed.has('ArrowRight') || held.has('right');
    input.current.steer = Number(right) - Number(left);
  }, []);

  const unlockAudio = useCallback(() => {
    if (!audio) return;
    void audio
      .unlock()
      .then((available) => setAudioUnavailable(!available))
      .catch(() => setAudioUnavailable(true));
  }, [audio]);

  const pause = useCallback(() => {
    setCruise(false);
    clearInput(true);
    persistBest();
    useExperience.getState().pauseDrive();
  }, [clearInput, persistBest]);

  const resume = useCallback(() => {
    if (!ready || failed || document.hidden) return;
    setCruise(false);
    clearInput(true);
    setHelp(false);
    unlockAudio();
    useExperience.getState().resumeDrive();
    focusGame();
  }, [clearInput, failed, focusGame, ready, unlockAudio]);

  const leave = useCallback(() => {
    clearInput(true);
    persistBest();
    void audio?.suspend();
    onExit();
  }, [audio, clearInput, onExit, persistBest]);

  const toggleSound = useCallback(() => {
    if (!audio) return;
    if (audioUnavailable && !paused) {
      setMuted(false);
      audio.setMuted(false);
      unlockAudio();
      focusGame();
      return;
    }
    const next = !muted;
    setMuted(next);
    audio.setMuted(next);
    if (!next && !paused) unlockAudio();
    focusGame();
  }, [audio, audioUnavailable, focusGame, muted, paused, unlockAudio]);

  const toggleCamera = useCallback(() => {
    setCameraMode((current) => (current === 'chase' ? 'hood' : 'chase'));
    focusGame();
  }, [focusGame]);

  const toggleCruise = useCallback(() => {
    if (paused) return;
    cruiseInput.current = !cruiseInput.current;
    setCruise(cruiseInput.current);
    syncInput();
    focusGame();
  }, [focusGame, paused, syncInput]);

  const onTelemetry = useCallback(
    (next: DriveState) => {
      setTelemetry({ ...next });
      if (next.distance > record.current) {
        record.current = next.distance;
        setBest(next.distance);
      }
      audio?.update(next.speed, input.current.throttle);
    },
    [audio],
  );

  const onReady = useCallback(() => {
    setReady(true);
    if (!document.hidden && !useExperience.getState().drivePaused) focusGame();
  }, [focusGame]);

  const onError = useCallback(() => {
    clearInput(true);
    setFailed(true);
    useExperience.getState().pauseDrive();
    void audio?.suspend();
  }, [audio, clearInput]);

  useEffect(() => {
    const interval = window.setInterval(persistBest, 10_000);
    return () => {
      window.clearInterval(interval);
      clearInput(true);
      persistBest();
    };
  }, [clearInput, persistBest]);

  useEffect(() => {
    if (!paused) return;
    clearInput(true);
    persistBest();
    if (drivePaused || failed) void audio?.suspend();
    const frame = requestAnimationFrame(() => {
      if (ready && !failed) resumeRef.current?.focus({ preventScroll: true });
      else if (failed) dialogRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [audio, clearInput, drivePaused, failed, paused, persistBest, ready]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.code === 'Tab' && (drivePaused || failed) && dialogRef.current) {
        const buttons =
          dialogRef.current.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
        return;
      }
      if (!ready || failed) return;
      // Escape works anywhere; P also resumes the pause dialog. Movement preserves focused controls.
      if (
        event.code === 'Escape' ||
        (event.code === 'KeyP' && (!isInteractive(event.target) || drivePaused))
      ) {
        if (event.repeat) return;
        event.preventDefault();
        if (drivePaused) resume();
        else pause();
        return;
      }
      if (isInteractive(event.target) || paused || useExperience.getState().drivePaused) return;
      if (movementKeys.has(event.code)) {
        event.preventDefault();
        // A held key must be released after pause or lost focus before it can drive again.
        if (event.repeat && !keys.current.has(event.code)) return;
        keys.current.add(event.code);
        syncInput();
      } else if (event.code === 'KeyC' && !event.repeat) {
        event.preventDefault();
        toggleCamera();
      } else if (event.code === 'KeyM' && !event.repeat) {
        event.preventDefault();
        toggleSound();
      }
    }
    function onKeyUp(event: KeyboardEvent) {
      if (!keys.current.delete(event.code)) return;
      syncInput();
    }
    function onVisibility() {
      if (document.hidden) pause();
    }
    function onFocus(event: FocusEvent) {
      if (isInteractive(event.target)) clearInput();
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', pause);
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('focusin', onFocus);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', pause);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('focusin', onFocus);
    };
  }, [
    clearInput,
    drivePaused,
    failed,
    pause,
    paused,
    ready,
    resume,
    syncInput,
    toggleCamera,
    toggleSound,
  ]);

  function pressTouch(event: PointerEvent<HTMLButtonElement>, control: TouchControl) {
    if (paused) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, control);
    syncInput();
  }

  function releaseTouch(event: PointerEvent<HTMLButtonElement>) {
    pointers.current.delete(event.pointerId);
    syncInput();
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }

  const showHint = !hintDismissed && telemetry.distance < 140 && ready && !paused;
  const modalVisible = drivePaused || failed;
  const speed = Math.round(telemetry.speed * 3.6);

  return (
    <div
      className={styles.game}
      ref={gameRef}
      tabIndex={-1}
      aria-label="Endless Porsche driving game"
    >
      <div className={styles.scene} aria-hidden="true">
        {!failed && (
          <DriveBoundary onError={onError}>
            <DriveScene
              state={vehicle}
              input={input}
              paused={paused}
              cameraMode={cameraMode}
              reducedMotion={reducedMotion}
              onTelemetry={onTelemetry}
              onReady={onReady}
              onError={onError}
            />
          </DriveBoundary>
        )}
      </div>
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.interface} inert={modalVisible}>
        <header className={styles.header}>
          <div className={styles.identity}>
            <span className={styles.label}>ENDLESS</span>
            <h1>Open road.</h1>
            <span className={styles.location}>PORSCHE TAYCAN · FREE DRIVE</span>
          </div>
          <nav className={styles.actions} aria-label="Driving options">
            <button className={styles.back} onClick={leave}>
              <ArrowLeft size={16} />
              <span>Back to portfolio</span>
            </button>
            <div className={styles.tools}>
              <button
                onClick={toggleSound}
                disabled={!audio}
                aria-label={
                  audioUnavailable
                    ? 'Sound unavailable'
                    : muted
                      ? 'Enable driving sound'
                      : 'Mute driving sound'
                }
                aria-pressed={!muted && !audioUnavailable}
                title={audioUnavailable ? 'Sound is unavailable in this browser' : 'Sound · M'}
              >
                {muted || audioUnavailable ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button
                onClick={toggleCamera}
                aria-label={`Switch to ${cameraMode === 'chase' ? 'hood' : 'chase'} camera`}
                title="Camera · C"
              >
                <Camera size={18} />
              </button>
              <button
                onClick={() => {
                  setHelp(true);
                  pause();
                }}
                aria-label="Driving controls"
                title="Controls"
              >
                <CircleHelp size={18} />
              </button>
              <button
                onClick={pause}
                disabled={!ready}
                aria-label="Pause driving"
                title="Pause · Esc"
              >
                <Pause size={18} />
              </button>
            </div>
          </nav>
        </header>

        <div className={styles.telemetry} aria-label="Drive statistics">
          <div className={styles.distance}>
            <span className={styles.label}>YOUR JOURNEY</span>
            <div>
              <strong>{(telemetry.distance / 1000).toFixed(2)}</strong>
              <span>KM</span>
            </div>
            <p>
              PERSONAL BEST <b>{(best / 1000).toFixed(2)} KM</b>
            </p>
          </div>
          <div className={styles.speed}>
            <button
              className={styles.cruise}
              onClick={toggleCruise}
              disabled={paused}
              aria-pressed={cruise && !paused}
              aria-label={cruise && !paused ? 'Disable cruise' : 'Enable cruise'}
              title="Keeps accelerating; steer manually. Braking cancels cruise."
            >
              <i aria-hidden="true" />
              Cruise {cruise && !paused ? 'on' : 'off'}
            </button>
            <div className={styles.driveStatus}>
              <i />
              {paused ? 'PARKED' : 'DRIVE'}
              <span>{cameraMode === 'chase' ? 'CHASE CAM' : 'HOOD CAM'}</span>
            </div>
            <div className={styles.speedReading}>
              <strong>{String(speed).padStart(3, '0')}</strong>
              <span>KM/H</span>
            </div>
            <div className={styles.speedTrack} aria-hidden="true">
              <i style={{ transform: `scaleX(${Math.min(speed / 250, 1)})` }} />
            </div>
          </div>
        </div>

        {showHint && (
          <aside className={styles.hint} aria-label="Quick driving instructions">
            <div>
              <span className={styles.label}>NOWHERE TO BE. JUST DRIVE.</span>
              <p className={styles.keyboardHint}>
                <kbd>W</kbd> accelerate <kbd>A</kbd>
                <kbd>D</kbd> steer <kbd>Space</kbd> brake
              </p>
              <p className={styles.touchHint}>
                Hold the pedals, or enable Cruise. Use the arrows to steer.
              </p>
            </div>
            <button
              onClick={() => {
                setHintDismissed(true);
                focusGame();
              }}
            >
              Got it <ArrowRight size={14} />
            </button>
          </aside>
        )}

        <div className={styles.touchControls} aria-label="Touch driving controls">
          <div className={styles.steering}>
            <button
              onPointerDown={(event) => pressTouch(event, 'left')}
              onPointerUp={releaseTouch}
              onPointerCancel={releaseTouch}
              onLostPointerCapture={releaseTouch}
              onContextMenu={(event) => event.preventDefault()}
              aria-label="Steer left"
              disabled={paused}
            >
              <ArrowLeft size={25} />
            </button>
            <button
              onPointerDown={(event) => pressTouch(event, 'right')}
              onPointerUp={releaseTouch}
              onPointerCancel={releaseTouch}
              onLostPointerCapture={releaseTouch}
              onContextMenu={(event) => event.preventDefault()}
              aria-label="Steer right"
              disabled={paused}
            >
              <ArrowRight size={25} />
            </button>
          </div>
          <div className={styles.pedals}>
            <button
              onPointerDown={(event) => pressTouch(event, 'brake')}
              onPointerUp={releaseTouch}
              onPointerCancel={releaseTouch}
              onLostPointerCapture={releaseTouch}
              onContextMenu={(event) => event.preventDefault()}
              className={styles.brake}
              aria-label="Hold to brake"
              disabled={paused}
            >
              <ArrowDown size={22} />
              <span>BRAKE</span>
            </button>
            <button
              onPointerDown={(event) => pressTouch(event, 'throttle')}
              onPointerUp={releaseTouch}
              onPointerCancel={releaseTouch}
              onLostPointerCapture={releaseTouch}
              onContextMenu={(event) => event.preventDefault()}
              className={styles.accelerator}
              aria-label="Hold to accelerate"
              disabled={paused}
            >
              <ArrowUp size={25} />
              <span>DRIVE</span>
            </button>
          </div>
        </div>
      </div>

      {!ready && !failed && (
        <div className={styles.loading} role="status">
          <span className={styles.label}>GETTING READY</span>
          <h2>The open road awaits.</h2>
          <p>Preparing your Taycan and the road ahead.</p>
        </div>
      )}

      {modalVisible && (
        <div className={styles.backdrop}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drive-dialog-title"
            aria-describedby="drive-dialog-description"
            ref={dialogRef}
            tabIndex={-1}
          >
            <span className={styles.label}>
              {failed ? 'ROAD UNAVAILABLE' : help ? 'TAKE THE WHEEL' : 'TAKE A BREATHER'}
            </span>
            <h2 id="drive-dialog-title">
              {failed ? 'Let’s head back.' : help ? 'Your road. Your pace.' : 'The road can wait.'}
            </h2>
            <p id="drive-dialog-description">
              {failed
                ? 'The 3D driving scene could not load. You can still explore the portfolio.'
                : 'Your drive is paused. Pick up exactly where you left off whenever you’re ready.'}
            </p>
            {!failed && (
              <>
                <div className={styles.pausedDistance}>
                  <strong>{(telemetry.distance / 1000).toFixed(2)}</strong>
                  <span>KM EXPLORED</span>
                </div>
                <dl className={styles.controlsList}>
                  <div>
                    <dt>Accelerate / brake</dt>
                    <dd>
                      <kbd>W</kbd>
                      <kbd>S</kbd>
                      <span>or ↑ ↓</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Steer</dt>
                    <dd>
                      <kbd>A</kbd>
                      <kbd>D</kbd>
                      <span>or ← →</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Brake</dt>
                    <dd>
                      <kbd>Space</kbd>
                    </dd>
                  </div>
                  <div>
                    <dt>Camera / sound / pause</dt>
                    <dd>
                      <kbd>C</kbd>
                      <kbd>M</kbd>
                      <kbd>Esc</kbd>
                    </dd>
                  </div>
                </dl>
                <p className={styles.touchHelp}>
                  Hold the on-screen arrows and pedals together, or enable Cruise and steer. Braking
                  cancels Cruise.
                </p>
              </>
            )}
            <div className={styles.modalActions}>
              {!failed && (
                <button
                  className={styles.primary}
                  ref={resumeRef}
                  onClick={resume}
                  disabled={!ready}
                >
                  <Play size={16} />
                  Resume driving
                </button>
              )}
              <button className={failed ? styles.primary : styles.secondary} onClick={leave}>
                <ArrowLeft size={16} />
                Back to portfolio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
