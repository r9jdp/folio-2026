'use client';

import dynamic from 'next/dynamic';
import { Component, useState, useCallback, useSyncExternalStore, type ReactNode } from 'react';
import styles from './monitor.module.css';
import { MonitorDesktop } from './monitor-desktop';

const MonitorScene = dynamic(() => import('./monitor-scene'), { ssr: false });

function subscribeToMotion(listener: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
}
function readMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function FlatMonitor({ paused }: { paused: boolean }) {
  return (
    <div className={styles.flatMonitor}>
      <div className={styles.flatScreen}>
        <MonitorDesktop paused={paused} />
      </div>
      <div className={styles.flatChin}>
        <span>rp.</span>
        <span className={styles.led} />
      </div>
    </div>
  );
}

class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Monitor() {
  const reducedMotion = useSyncExternalStore(subscribeToMotion, readMotion, () => true);
  const [pauseOverride, setPauseOverride] = useState<boolean | null>(null);
  const paused = pauseOverride ?? reducedMotion;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);
  const handleFailure = useCallback(() => setFailed(true), []);
  const fallback = <FlatMonitor paused={paused} />;

  return (
    <section className={styles.hero} aria-label="An interactive pond on my desktop">
      <div className={styles.scene}>
        {(!ready || failed) && <div className={styles.fallback}>{fallback}</div>}
        {!failed && (
          <SceneBoundary onFailure={handleFailure}>
            <MonitorScene paused={paused} onReady={handleReady} onFailure={handleFailure} />
          </SceneBoundary>
        )}
      </div>
      <div className={styles.caption}>
        <span>Tap the water, make a ripple.</span>
        <button type="button" onClick={() => setPauseOverride(!paused)} aria-pressed={paused}>
          {paused ? 'Resume pond' : 'Pause pond'}
        </button>
      </div>
    </section>
  );
}
