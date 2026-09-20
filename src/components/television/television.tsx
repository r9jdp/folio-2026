'use client';

import dynamic from 'next/dynamic';
import styles from './television.module.css';

const VintageTV = dynamic(() => import('@crazygl/hero-vhs-product-screen'), {
  ssr: false,
  loading: () => <p className={styles.loading}>Loading TV…</p>,
});

export default function Television() {
  return (
    <section className={styles.hero} aria-label="Vintage television preview">
      <VintageTV
        className={styles.television}
        tvModel="belweder-ot-1782"
        modelScale={1.08}
        modelTilt={-3}
        monitorX={-0.32}
        monitorY={0}
        backgroundColor="#ffffff"
        screenMedia=""
        contentType="custom"
        content=""
        heading=""
        subheading=""
        glitchFrequency={0}
        glitchIntensity={0}
        turnOnAnimation={false}
        pointerParallax={0.35}
      />
    </section>
  );
}
