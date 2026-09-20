'use client';

import dynamic from 'next/dynamic';
import { Component, useState, type ReactNode } from 'react';
import styles from './monitor.module.css';
import { MonitorDesktop } from './monitor-desktop';

const MonitorScene = dynamic(() => import('./monitor-scene'), { ssr: false });

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
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function Monitor() {
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const fallback = <FlatMonitor paused={paused} />;

  return (
    <section className={styles.hero} aria-label="An interactive pond on my desktop">
      <div className={styles.scene}>
        {(!ready || failed) && <div className={styles.fallback}>{fallback}</div>}
        {!failed && (
          <SceneBoundary fallback={fallback}>
            <MonitorScene
              paused={paused}
              onReady={() => setReady(true)}
              onFailure={() => setFailed(true)}
            />
          </SceneBoundary>
        )}
      </div>
      <div className={styles.caption}>
        <span>A little space to slow down.</span>
        <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused}>
          {paused ? 'Resume pond' : 'Pause pond'}
        </button>
      </div>
    </section>
  );
}
