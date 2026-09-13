import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="message-page">
      <span className="eyebrow">404 / WRONG TURN</span>
      <h1>Let’s get you back.</h1>
      <p>That page isn’t here. There’s plenty to explore in the portfolio.</p>
      <Link href="/portfolio" className="button primary">
        Explore my work
      </Link>
    </main>
  );
}
