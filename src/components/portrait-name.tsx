'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import styles from './portrait-name.module.css';

const portrait = { src: '/images/rajdeep-portrait.jpeg', alt: 'Rajdeep smiling outside a café' };

export default function PortraitName() {
  const trigger = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLSpanElement>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);

  const cancelDismiss = useCallback(() => clearTimeout(dismissTimer.current), []);
  const dismiss = useCallback(() => {
    cancelDismiss();
    setOpen(false);
  }, [cancelDismiss]);
  const reveal = () => {
    cancelDismiss();
    const bounds = trigger.current?.getBoundingClientRect();
    if (!bounds) return;
    const size = 110;
    setPosition({
      left: Math.max(
        12,
        Math.min(window.innerWidth - size - 12, bounds.left + bounds.width / 2 - size / 2),
      ),
      top: bounds.top >= size + 20 ? bounds.top - size - 8 : bounds.bottom + 8,
    });
    setOpen(true);
  };
  const leave = () => {
    cancelDismiss();
    // Allow the pointer to cross the small gap into the portrait itself.
    dismissTimer.current = setTimeout(dismiss, 120);
  };

  useEffect(() => cancelDismiss, [cancelDismiss]);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!trigger.current?.contains(target) && !card.current?.contains(target)) dismiss();
    };
    document.addEventListener('keydown', escape);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('visibilitychange', dismiss);
    window.addEventListener('scroll', dismiss, { passive: true, capture: true });
    window.addEventListener('resize', dismiss);
    window.addEventListener('blur', dismiss);
    return () => {
      document.removeEventListener('keydown', escape);
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('visibilitychange', dismiss);
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('resize', dismiss);
      window.removeEventListener('blur', dismiss);
    };
  }, [open, dismiss]);

  return (
    <>
      <button
        ref={trigger}
        className={styles.name}
        aria-expanded={open}
        aria-controls="portrait-preview"
        aria-describedby={open ? 'portrait-preview' : undefined}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') reveal();
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse') leave();
        }}
        onFocus={(event) => {
          if (event.currentTarget.matches(':focus-visible')) reveal();
        }}
        onBlur={dismiss}
        onClick={(event) => {
          if (event.detail === 0 || window.matchMedia('(hover: hover) and (pointer: fine)').matches)
            reveal();
          else if (open) dismiss();
          else reveal();
        }}
      >
        Rajdeep
      </button>
      {position &&
        createPortal(
          <div className={styles.layer} data-open={open} aria-hidden={!open}>
            <div className={styles.backdrop} aria-hidden="true" />
            <span
              ref={card}
              id="portrait-preview"
              role="tooltip"
              className={styles.card}
              style={position}
              onPointerEnter={cancelDismiss}
              onPointerLeave={leave}
            >
              <Image
                className={styles.photo}
                src={portrait.src}
                alt={portrait.alt}
                width={100}
                height={100}
                loading="eager"
              />
            </span>
          </div>,
          document.body,
        )}
    </>
  );
}
