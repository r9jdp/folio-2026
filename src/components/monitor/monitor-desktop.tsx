'use client';

import { Folder, FileText, ArrowUpRight } from 'lucide-react';
import styles from './monitor.module.css';

export function MonitorDesktop({ paused }: { paused: boolean }) {
  return (
    <div className={styles.desktop}>
      <div className={styles.menuBar}>
        <strong>rp.</strong>
        <span>My little corner</span>
        <span className={styles.menuRight}>Pond / 01</span>
      </div>
      <div className={styles.pondPlaceholder} aria-label="Pond screen" data-paused={paused} />
      <nav className={styles.desktopIcons} aria-label="Desktop shortcuts">
        <a href="#work">
          <Folder size={27} strokeWidth={1.3} fill="#ece3bb" />
          <span>My work</span>
        </a>
        <a href="/resume.pdf" target="_blank" rel="noreferrer">
          <FileText size={27} strokeWidth={1.3} fill="#f4f2e7" />
          <span>Resume</span>
        </a>
      </nav>
      <a className={styles.screenNote} href="#about">
        Meet the human behind the screen <ArrowUpRight size={12} />
      </a>
    </div>
  );
}
