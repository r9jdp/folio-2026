'use client';

import KoiPond from '@/components/pond/koi-pond';
import { Folder, ArrowUpRight } from 'lucide-react';
import styles from './monitor.module.css';

export function MonitorDesktop({ paused }: { paused: boolean }) {
  return (
    <div className={styles.desktop}>
      <div className={styles.menuBar}>
        <strong>rp.</strong>
        <span>My little corner</span>
        <span className={styles.menuRight}>Pond / 01</span>
      </div>
      <KoiPond paused={paused} />
      <nav className={styles.desktopIcons} aria-label="Desktop shortcuts">
        <a href="#work">
          <Folder size={27} strokeWidth={1.3} fill="#ece3bb" />
          <span>My work</span>
        </a>
      </nav>
      <a className={styles.screenNote} href="#about">
        Meet the human behind the screen <ArrowUpRight size={12} />
      </a>
    </div>
  );
}
