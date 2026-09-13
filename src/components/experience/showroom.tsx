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
import { ArrowDown, ArrowUpRight, ArrowLeft, RotateCcw, Maximize2 } from 'lucide-react';
import { useExperience } from '@/state/experience';
import Desktop from '@/components/desktop/desktop';
import { DisplayHome } from './dashboard-home';
import { SiteHeader } from '@/components/site-header';
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
function subscribeCompact(callback: () => void) {
  const query = window.matchMedia(compactQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}
function getCompactSnapshot() {
  return window.matchMedia(compactQuery).matches;
}
export default function Showroom() {
  const displayRef = useRef<HTMLDivElement>(null);
  const compact = useSyncExternalStore(subscribeCompact, getCompactSnapshot, () => false);
  const mode = useExperience((s) => s.mode);
  const maximized = useExperience((s) => s.maximized);
  const enter = useExperience((s) => s.enter);
  const arrive = useExperience((s) => s.arrive);
  const exit = useExperience((s) => s.exit);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  function startEntry() {
    if (!ready || failed) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      enter();
      arrive();
    } else {
      enter();
    }
  }
  useEffect(() => {
    function onEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && useExperience.getState().mode === 'entering') exit();
    }
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [exit]);
  return (
    <main
      className={`showroom mode-${mode}`}
      onWheel={(event) => {
        if (event.deltaY > 15 && mode === 'showroom') startEntry();
      }}
    >
      <div className="scene-layer">
        <SceneBoundary onError={onError}>
          <Suspense fallback={null}>
            <Scene onReady={onReady} displayRef={displayRef} />
          </Suspense>
        </SceneBoundary>
      </div>
      {mode === 'showroom' && (
        <>
          <SiteHeader />
          <section className="hero-copy">
            <span className="eyebrow hero-eyebrow">
              <i />
              SOFTWARE DEVELOPER & PRODUCT BUILDER
            </span>
            <h1>
              Engineering.
              <br />
              <span>With intent.</span>
            </h1>
            <p>
              I’m Rajdeep. I build thoughtful software.
              <br />
              Come inside. Let me show you around.
            </p>
            <div className="hero-actions">
              <button className="button primary" onClick={startEntry} disabled={!ready || failed}>
                {failed
                  ? 'Showroom unavailable'
                  : ready
                    ? 'Enter the cockpit'
                    : 'Preparing the showroom'}
                {ready && !failed && <ArrowUpRight size={17} />}
                {!ready && !failed && <span className="loading-dot" />}
              </button>
              <Link className="text-link skip-link" href="/portfolio">
                Just the portfolio
                <ArrowRightIcon />
              </Link>
            </div>
            {failed && (
              <p role="status" className="scene-error">
                The 3D view couldn’t load. Your portfolio is ready through the link above.
              </p>
            )}
          </section>
          <div className="showroom-footer">
            <div className="scene-caption">
              <span className="eyebrow">01 / THE ARRIVAL</span>
              <span>
                Porsche Taycan<span className="caption-dot">·</span>A different way in.
              </span>
            </div>
            <button className="scroll-prompt" onClick={startEntry} disabled={!ready || failed}>
              <span>SCROLL TO ENTER</span>
              <ArrowDown size={16} />
            </button>
            <Link href="/credits" className="credits-link">
              Credits
              <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="scene-floor-label" aria-hidden="true">
            TAYCAN
          </div>
        </>
      )}
      {mode === 'entering' && (
        <>
          <div className="entry-caption">
            <span className="eyebrow">02 / MAKE YOURSELF AT HOME</span>
            <p>Your work. A new perspective.</p>
          </div>
          <button className="button entry-cancel" onClick={exit}>
            <ArrowLeft size={15} />
            Back to showroom
          </button>
          <Link href="/portfolio" className="entry-skip">
            Skip to portfolio
            <ArrowUpRight size={14} />
          </Link>
        </>
      )}
      {mode === 'desktop' && !maximized && !compact && (
        <div ref={displayRef} className="dashboard-surface">
          <DisplayHome />
        </div>
      )}
      {mode === 'desktop' && (maximized || compact) && (
        <div className="desktop-overlay reading-view">
          <Desktop />
        </div>
      )}
      {mode === 'desktop' && !maximized && !compact && (
        <div className="cockpit-footer">
          <span>
            <i />
            PARKED / PORTFOLIO
          </span>
          <button onClick={() => useExperience.getState().toggleMaximized()}>
            <Maximize2 size={14} />
            Expand display
          </button>
          <button onClick={exit}>
            <RotateCcw size={13} />
            Return to showroom
          </button>
        </div>
      )}
      <span className="sr-only" role="status" aria-live="polite">
        {mode === 'entering'
          ? 'Entering the cabin. Press Escape to return.'
          : mode === 'desktop'
            ? 'Portfolio desktop ready.'
            : ready
              ? 'Showroom ready.'
              : 'Preparing 3D view.'}
      </span>
    </main>
  );
}
function ArrowRightIcon() {
  return <ArrowUpRight size={14} />;
}
