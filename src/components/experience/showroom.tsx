'use client';
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useState,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUpRight,
  ArrowLeft,
  RotateCcw,
  Maximize2,
  Scan,
  Play,
  Power,
} from 'lucide-react';
import { useExperience, type EntryControl } from '@/state/experience';
import Desktop from '@/components/desktop/desktop';
import { DisplayHome } from './dashboard-home';
import { SiteHeader } from '@/components/site-header';
import DrivingGame from './driving-game';
import { DriveAudio } from '@/lib/drive-audio';

const Scene = dynamic(() => import('./taycan-scene'), { ssr: false });
class SceneBoundary extends Component<
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
const compactQuery = '(max-width: 760px)';
const reducedQuery = '(prefers-reduced-motion: reduce)';
function subscribeQuery(query: string, callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}
const subscribeCompact = (callback: () => void) => subscribeQuery(compactQuery, callback);
const subscribeReduced = (callback: () => void) => subscribeQuery(reducedQuery, callback);
const getCompact = () => window.matchMedia(compactQuery).matches;
const getReduced = () => window.matchMedia(reducedQuery).matches;

export default function Showroom() {
  const displayRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);
  const entryButton = useRef<HTMLButtonElement>(null);
  const touchY = useRef<number | null>(null);
  const compact = useSyncExternalStore(subscribeCompact, getCompact, () => false);
  const reducedMotion = useSyncExternalStore(subscribeReduced, getReduced, () => false);
  const mode = useExperience((s) => s.mode);
  const maximized = useExperience((s) => s.maximized);
  const displayFocused = useExperience((s) => s.displayFocused);
  const exit = useExperience((s) => s.exit);
  const [driveAudio, setDriveAudio] = useState<DriveAudio | null>(null);
  const audioRef = useRef<DriveAudio | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  const previousMode = useRef(mode);

  useEffect(
    () => () => {
      audioRef.current?.dispose();
    },
    [],
  );
  function startDriving() {
    if (!ready || failed) return;
    const state = useExperience.getState();
    if (state.mode !== 'showroom' && state.mode !== 'desktop') return;
    audioRef.current?.dispose();
    const audio = new DriveAudio();
    audioRef.current = audio;
    void audio.unlock();
    setDriveAudio(audio);
    state.startDrive();
  }
  function returnFromDrive() {
    audioRef.current?.dispose();
    audioRef.current = null;
    setDriveAudio(null);
    useExperience.getState().returnToPortfolio();
  }
  function startEntry(control: EntryControl = 'auto') {
    if (!ready || failed) return;
    const state = useExperience.getState();
    state.enter(control);
    if (reducedMotion) state.arrive();
  }
  function scrub(delta: number) {
    if (!ready || failed) return;
    const current = useExperience.getState();
    if (
      current.mode === 'desktop' ||
      current.mode === 'driving' ||
      (current.mode === 'showroom' && delta <= 0)
    )
      return;
    if (current.mode === 'showroom') startEntry('scroll');
    const state = useExperience.getState();
    // During an automatic entry, the first gesture takes over from the rendered camera position.
    const position =
      state.entryControl === 'auto'
        ? Number(progressRef.current?.value ?? state.entryProgress)
        : state.entryProgress;
    state.seekEntry(position + delta / 1800);
  }
  useEffect(() => {
    if (mode === 'showroom' && previousMode.current !== 'showroom') {
      entryButton.current?.focus({ preventScroll: true });
    }
    previousMode.current = mode;
  }, [mode]);
  useEffect(() => {
    function onEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      const state = useExperience.getState();
      if (state.mode === 'entering') state.exit();
      else if (state.mode === 'desktop' && !state.maximized && !compact) {
        if (state.activeApp) state.closeApp();
        else if (state.displayFocused) state.focusDisplay(false);
        else state.exit();
      } else return;
      event.preventDefault();
    }
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [compact]);

  return (
    <main
      className={`showroom mode-${mode}${displayFocused ? ' display-focused' : ''}`}
      onWheel={(event) => {
        if (Math.abs(event.deltaY) < 2 || event.ctrlKey) return;
        scrub(event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 700 : 1));
      }}
      onTouchStart={(event) => {
        touchY.current =
          event.touches.length === 1 && !(event.target as HTMLElement).closest('button, a, input')
            ? event.touches[0].clientY
            : null;
      }}
      onTouchMove={(event) => {
        if (event.touches.length !== 1 || touchY.current === null) {
          touchY.current = null;
          return;
        }
        const y = event.touches[0].clientY;
        scrub((touchY.current - y) * 3);
        touchY.current = y;
      }}
      onTouchEnd={() => {
        touchY.current = null;
      }}
      onTouchCancel={() => {
        touchY.current = null;
      }}
    >
      {!failed && mode !== 'driving' && (
        <div className="scene-layer">
          <SceneBoundary onError={onError}>
            <Suspense fallback={null}>
              <Scene
                onReady={onReady}
                onError={onError}
                displayRef={displayRef}
                progressRef={progressRef}
                reducedMotion={reducedMotion}
              />
            </Suspense>
          </SceneBoundary>
        </div>
      )}
      {mode === 'driving' ? (
        <DrivingGame audio={driveAudio} reducedMotion={reducedMotion} onExit={returnFromDrive} />
      ) : failed ? (
        <section className="scene-recovery">
          <span className="eyebrow">THE PORTFOLIO IS STILL HERE</span>
          <h1>The showroom couldn’t load.</h1>
          <p>You can explore every project and experience in the standard portfolio.</p>
          <Link href="/portfolio" className="button primary">
            Open portfolio <ArrowUpRight size={17} />
          </Link>
          <button className="text-link" onClick={() => window.location.reload()}>
            Try the showroom again <RotateCcw size={15} />
          </button>
        </section>
      ) : mode === 'showroom' ? (
        <>
          <SiteHeader />
          <section className="hero-copy">
            <span className="eyebrow hero-eyebrow">
              <i /> SOFTWARE DEVELOPER &amp; PRODUCT BUILDER
            </span>
            <h1>
              Take a seat.
              <br />
              <span>Meet my work.</span>
            </h1>
            <p>
              I’m Rajdeep. I build software and products.
              <br />
              Your next destination is inside.
            </p>
            <div className="hero-actions">
              <button
                ref={entryButton}
                className="button primary"
                onClick={() => startEntry()}
                disabled={!ready}
              >
                {ready ? 'Enter the Taycan' : 'Preparing the showroom'}
                {ready ? <ArrowUpRight size={17} /> : <span className="loading-dot" />}
              </button>
              <button className="button drive-launch" onClick={startDriving} disabled={!ready}>
                <Power size={16} /> Start driving
              </button>
              <Link className="text-link skip-link" href="/portfolio">
                Just the portfolio <ArrowUpRight size={14} />
              </Link>
            </div>
          </section>
          <div className="showroom-footer">
            <div className="scene-caption">
              <span className="eyebrow">01 / THE ARRIVAL</span>
              <span>
                Porsche Taycan<span className="caption-dot">·</span>Welcome aboard.
              </span>
            </div>
            <button className="scroll-prompt" onClick={() => startEntry()} disabled={!ready}>
              <span>SCROLL TO EXPLORE</span>
              <ArrowDown size={16} />
            </button>
            <Link href="/credits" className="credits-link">
              Credits <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="scene-floor-label" aria-hidden="true">
            TAYCAN
          </div>
        </>
      ) : mode === 'entering' ? (
        <>
          <div className="entry-caption">
            <span className="eyebrow">02 / ENTER THE TAYCAN</span>
            <p>Scroll to move. Take your time.</p>
          </div>
          <div className="entry-controls">
            <button className="entry-back" onClick={exit} aria-label="Back to showroom">
              <ArrowLeft size={18} />
            </button>
            <label className="entry-scrubber">
              <span>SHOWROOM</span>
              <input
                ref={progressRef}
                type="range"
                min="0"
                max="1"
                step="0.01"
                defaultValue="0"
                aria-label="Cabin entry position"
                onChange={(event) => useExperience.getState().seekEntry(Number(event.target.value))}
              />
              <span>COCKPIT</span>
            </label>
            <button
              className="entry-continue"
              onClick={() => useExperience.getState().continueEntry()}
            >
              <Play size={14} /> Continue
            </button>
          </div>
          <Link href="/portfolio" className="entry-skip">
            Skip to portfolio <ArrowUpRight size={14} />
          </Link>
        </>
      ) : (
        <>
          {!maximized && !compact && (
            <div ref={displayRef} className="dashboard-surface">
              <DisplayHome onStartDrive={startDriving} />
            </div>
          )}
          {(maximized || compact) && (
            <div className="desktop-overlay reading-view">
              <Desktop onStartDrive={startDriving} />
            </div>
          )}
          {!maximized && !compact && (
            <div className="cockpit-footer">
              <span>
                <i /> TAYCAN / PARKED
              </span>
              <div className="cockpit-actions">
                <button className="drive-launch" onClick={startDriving}>
                  <Power size={15} /> Start driving
                </button>
                <button
                  onClick={() => useExperience.getState().focusDisplay(!displayFocused)}
                  aria-pressed={displayFocused}
                >
                  <Scan size={15} />
                  {displayFocused ? 'Cockpit view' : 'Focus display'}
                </button>
                <button onClick={() => useExperience.getState().toggleMaximized()}>
                  <Maximize2 size={14} /> Reading view
                </button>
                <button onClick={exit}>
                  <RotateCcw size={14} /> Showroom
                </button>
              </div>
            </div>
          )}
        </>
      )}
      <span className="sr-only" role="status" aria-live="polite">
        {mode === 'driving'
          ? 'Driving mode. Use W or Up to accelerate, arrows to steer, Space to brake, Escape to pause.'
          : failed
            ? 'Showroom unavailable. Open the standard portfolio.'
            : mode === 'entering'
              ? 'Entering the cabin. Scroll or use the entry slider. Press Escape to return.'
              : mode === 'desktop'
                ? 'Cockpit ready. Explore the dashboard applications.'
                : ready
                  ? 'Showroom ready.'
                  : 'Preparing 3D view.'}
      </span>
    </main>
  );
}
