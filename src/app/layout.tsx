import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Rajdeep Pandey — Developer & product builder',
    template: '%s — Rajdeep Pandey',
  },
  description:
    'Software developer and product builder in Mumbai. Selected projects, experience, and a little pond on my desktop.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-content" href="#main-content">
          Skip to portfolio
        </a>
        {children}
      </body>
    </html>
  );
}
