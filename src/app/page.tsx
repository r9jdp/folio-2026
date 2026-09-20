import Television from '@/components/television/television';
import PortfolioContent from '@/components/portfolio-content';

export default function Home() {
  return (
    <>
      <header className="site-header">
        <a className="wordmark" href="#" aria-label="Rajdeep Pandey, home">
          rp<span>.</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="mailto:rajdeepvp273@gmail.com">
            Say hello <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>
      <Television />
      <PortfolioContent />
    </>
  );
}
