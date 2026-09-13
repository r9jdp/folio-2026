'use client';
import Link from 'next/link';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="message-page">
      <span className="eyebrow">A SMALL DETOUR</span>
      <h1>Something didn’t load.</h1>
      <p>Try again, or return to the portfolio.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
      <Link href="/portfolio" className="button secondary">
        Open portfolio
      </Link>
    </main>
  );
}
