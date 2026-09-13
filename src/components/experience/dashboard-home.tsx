'use client';
import {
  BriefcaseBusiness,
  UserRound,
  History,
  Send,
  LayoutGrid,
  Maximize2,
  BatteryMedium,
} from 'lucide-react';
import { useExperience } from '@/state/experience';
import { projects } from '@/content/portfolio';
import type { AppId } from '@/content/apps';

const apps = [
  { id: 'work', title: 'My work', icon: BriefcaseBusiness },
  { id: 'about', title: 'About me', icon: UserRound },
  { id: 'experience', title: 'Experience', icon: History },
  { id: 'contact', title: 'Contact', icon: Send },
] as const;

export function DisplayHome() {
  const openApp = useExperience((s) => s.openApp);
  const expand = useExperience((s) => s.toggleMaximized);
  function launch(id: AppId) {
    openApp(id);
    expand();
  }
  return (
    <section className="pcm-display" aria-label="Dashboard portfolio apps">
      <header className="pcm-statusbar">
        <span>
          <LayoutGrid size={24} /> HOME
        </span>
        <span className="pcm-profile">RAJDEEP PANDEY</span>
        <span>
          <b>P</b>
          <BatteryMedium size={29} />
        </span>
      </header>
      <div className="pcm-heading">
        <h2>Your next destination.</h2>
        <span>SOFTWARE · PRODUCTS · IDEAS</span>
      </div>
      <nav className="pcm-apps" aria-label="Portfolio applications">
        {apps.map(({ id, title, icon: Icon }) => (
          <button key={id} onClick={() => launch(id)}>
            <Icon size={43} strokeWidth={1.25} />
            <span>{title}</span>
          </button>
        ))}
      </nav>
      <footer className="pcm-footer">
        <div className="pcm-projects">
          {projects.map((project) => (
            <button key={project.slug} onClick={() => launch(project.slug)}>
              {project.name}
            </button>
          ))}
        </div>
        <button className="pcm-expand" onClick={expand} aria-label="Expand dashboard display">
          <Maximize2 size={23} />
          <span>Expand</span>
        </button>
      </footer>
    </section>
  );
}
