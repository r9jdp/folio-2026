import Link from 'next/link';
export default function NotFound() {
  return (
    <main id="main-content" className="message-page">
      <h1>This page wandered off.</h1>
      <p>Let’s get you back to my little corner of the internet.</p>
      <Link href="/">Back home</Link>
    </main>
  );
}
