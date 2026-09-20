'use client';
import Link from 'next/link';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="message-page">
      <h1>Something didn’t load.</h1>
      <p>You can try again or head back home.</p>
      <button onClick={reset}>Try again</button>
      <Link href="/">Back home</Link>
    </main>
  );
}
