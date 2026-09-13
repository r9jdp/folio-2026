import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { profile } from '@/content/portfolio';
export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="wordmark" aria-label="Rajdeep Pandey, home">
        r<span className="wordmark-dot">.</span>
        <span className="wordmark-name">RAJDEEP PANDEY</span>
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/portfolio#work">Work</Link>
        <Link href="/portfolio#about">About</Link>
        <a href={profile.github} target="_blank" rel="noreferrer">
          GitHub
          <ArrowUpRight size={13} />
        </a>
      </nav>
    </header>
  );
}
