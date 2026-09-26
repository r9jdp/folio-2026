import type { Metadata } from 'next';
import { themeBootstrap } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Rajdeep | Software engineer & founder',
    template: '%s | Rajdeep',
  },
  description:
    'Software engineer and founder in Mumbai. Selected work, experience, and achievements.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script id="portfolio-theme" dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <a className="skip-content" href="#main-content">
          Skip to portfolio
        </a>
        {children}
      </body>
    </html>
  );
}
