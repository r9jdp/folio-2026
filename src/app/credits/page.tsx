import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
export default function CreditsPage() {
  return (
    <>
      <SiteHeader />
      <main className="case-study-page credits-page">
        <span className="eyebrow">BUILT WITH GOOD COMPANY</span>
        <h1>Credits.</h1>
        <h2>Porsche Taycan model</h2>
        <p>
          “Porshe Taycan” by <a href="https://sketchfab.com/mihailhamanovich">Mikhail Hamanovich</a>
          , licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
        </p>
        <p>
          Adaptations include geometry simplification, material changes, a driver-door hinge,
          display anchors, material batching and compression.{' '}
          <a href="https://sketchfab.com/3d-models/porshe-taycan-c6004141452e4d3ab048bf0fee52666d">
            View the original model.
          </a>
        </p>
        <p>This is Rajdeep’s independent portfolio. Porsche does not sponsor or endorse it.</p>
        <h2>Interface and rendering</h2>
        <p>
          Original portfolio interface, built with Next.js, React, Three.js, React Three Fiber and
          Drei. Icons by Lucide.
        </p>
        <Link href="/" className="button secondary">
          Return to showroom
        </Link>
      </main>
    </>
  );
}
