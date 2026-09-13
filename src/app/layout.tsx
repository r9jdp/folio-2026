import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'Rajdeep Pandey — Software, with intent.', template: '%s — Rajdeep Pandey' },
  description:
    'Software developer and product builder. Explore Fermeon, TryDonna, ClawIN, and the work behind them.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-content" href="/portfolio">
          Skip to the accessible portfolio
        </a>
        {children}
      </body>
    </html>
  );
}
