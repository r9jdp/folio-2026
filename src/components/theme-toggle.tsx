'use client';

import { useEffect, useRef, useSyncExternalStore, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { THEME_STORAGE_KEY, type Theme } from '@/lib/theme';
import styles from './theme-toggle.module.css';

const themeEvent = 'folio-theme-change';
const readTheme = (): Theme =>
  document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
const serverTheme = (): Theme => 'dark';

function subscribeTheme(onChange: () => void) {
  const storageChanged = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
    document.documentElement.dataset.theme = event.newValue === 'light' ? 'light' : 'dark';
    onChange();
  };
  window.addEventListener(themeEvent, onChange);
  window.addEventListener('storage', storageChanged);
  return () => {
    window.removeEventListener(themeEvent, onChange);
    window.removeEventListener('storage', storageChanged);
  };
}

function clearReveal() {
  const root = document.documentElement;
  delete root.dataset.themeTransition;
  for (const property of ['--theme-x', '--theme-y', '--theme-radius'])
    root.style.removeProperty(property);
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
  const activeTransition = useRef<ViewTransition | null>(null);

  useEffect(
    () => () => {
      activeTransition.current?.skipTransition();
      activeTransition.current = null;
      clearReveal();
    },
    [],
  );

  const toggleTheme = (event: MouseEvent<HTMLButtonElement>) => {
    // A second click during the reveal must not start a competing snapshot.
    if (activeTransition.current) return;
    const root = document.documentElement;
    const next: Theme = readTheme() === 'dark' ? 'light' : 'dark';
    const apply = () => {
      flushSync(() => {
        root.dataset.theme = next;
        window.dispatchEvent(new Event(themeEvent));
      });
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Storage can be unavailable; the current page still changes theme.
      }
    };

    if (
      !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      event.detail === 0
    ) {
      apply();
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const radius = Math.ceil(
      Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)),
    );
    root.style.setProperty('--theme-x', `${x}px`);
    root.style.setProperty('--theme-y', `${y}px`);
    root.style.setProperty('--theme-radius', `${radius}px`);
    root.dataset.themeTransition = 'active';

    try {
      const transition = document.startViewTransition(apply);
      activeTransition.current = transition;
      // A hidden document or browser interruption may skip the animation.
      void transition.ready.catch(() => {});
      void transition.finished
        .catch(() => {})
        .finally(() => {
          if (activeTransition.current !== transition) return;
          activeTransition.current = null;
          clearReveal();
        });
    } catch {
      clearReveal();
      apply();
    }
  };

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      aria-pressed={theme === 'dark'}
    >
      {theme === 'light' ? 'dark mode' : 'light mode'}
    </button>
  );
}
