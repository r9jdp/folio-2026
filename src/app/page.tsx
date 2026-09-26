import Television from '@/components/television/television';
import PortfolioContent from '@/components/portfolio-content';
import SideNavigation from '@/components/side-navigation';
import CursorCat from '@/components/cursor-cat';

export default function Home() {
  return (
    <div id="home" className="portfolio-shell">
      <SideNavigation />
      <div className="portfolio-body">
        <Television />
        <PortfolioContent />
      </div>
      <CursorCat />
    </div>
  );
}
