'use client';

import { useEffect, useRef, useState } from 'react';
import ThemeToggle from './theme-toggle';
import styles from './side-navigation.module.css';

const sections = [
  { id: 'home', label: 'home' },
  { id: 'work', label: 'ventures' },
  { id: 'experience', label: 'experience' },
  { id: 'achievements', label: 'milestones' },
  { id: 'contact', label: 'contact' },
] as const;

export default function SideNavigation() {
  const [active, setActive] = useState<string>('home');
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const readingLine = Math.min(window.innerHeight * 0.3, 180);
      let current: string = 'home';
      for (const { id } of sections) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= readingLine) current = id;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4)
        current = 'contact';
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggle.current?.focus();
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <aside ref={container} className={styles.sidebar} data-open={open}>
      <button
        ref={toggle}
        className={styles.toggle}
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
        aria-controls="side-navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? 'close' : 'menu'}
      </button>
      <nav id="side-navigation" className={styles.links} aria-label="Main navigation">
        {sections.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={active === id ? 'location' : undefined}
            onClick={() => setOpen(false)}
          >
            {label}
          </a>
        ))}
        <a
          className={styles.external}
          href="https://github.com/r9jdp"
          target="_blank"
          rel="noreferrer"
        >
          github
        </a>
        <a href="https://x.com/r9jdp" target="_blank" rel="noreferrer">
          X
        </a>
      </nav>
      <ThemeToggle />
    </aside>
  );
}
