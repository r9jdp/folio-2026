'use client';
import { useEffect, useRef, type RefObject } from 'react';
import Link from 'next/link';
import {
  BriefcaseBusiness,
  UserRound,
  History,
  Send,
  Minimize2,
  X,
  ArrowUpRight,
  Download,
  ArrowLeft,
  LayoutGrid,
  ChevronRight,
  Power,
} from 'lucide-react';
import { useExperience } from '@/state/experience';
import { applications, type AppId } from '@/content/apps';
import { experience, profile, projects } from '@/content/portfolio';
import { ProjectDetail, ProjectGrid } from '@/components/project-content';

const mainApps = [
  { id: 'work', title: 'Work', icon: BriefcaseBusiness },
  { id: 'about', title: 'About', icon: UserRound },
  { id: 'experience', title: 'Experience', icon: History },
  { id: 'contact', title: 'Contact', icon: Send },
] as const;

function AppContent({
  activeApp,
  contentRef,
}: {
  activeApp: AppId;
  contentRef: RefObject<HTMLDivElement | null>;
}) {
  const openApp = useExperience((s) => s.openApp);
  const project = projects.find((p) => p.slug === activeApp);
  return (
    <div className="window-content" ref={contentRef} tabIndex={-1}>
      {project ? (
        <ProjectDetail project={project} />
      ) : activeApp === 'work' ? (
        <>
          <div className="section-heading">
            <span className="eyebrow">A FEW THINGS I’VE BUILT</span>
            <h2>Ideas, shipped.</h2>
            <p>From a first question to something you can use.</p>
          </div>
          <ProjectGrid onOpen={openApp} />
        </>
      ) : activeApp === 'about' ? (
        <>
          <span className="eyebrow">THE PERSON BEHIND THE WHEEL</span>
          <h2>Hi, I’m Rajdeep.</h2>
          <p className="lead">{profile.intro}</p>
          <p className="body-copy">
            I care about both sides of making software: the systems underneath and the experience
            someone has using them.
          </p>
          <div className="skill-list">
            {profile.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
          <a href="/resume.pdf" target="_blank" rel="noreferrer" className="button secondary">
            <Download size={16} />
            Read my résumé
          </a>
        </>
      ) : activeApp === 'experience' ? (
        <>
          <span className="eyebrow">LEARNING BY BUILDING</span>
          <h2>Out in the real world.</h2>
          <div className="experience-list">
            {experience.map((job) => (
              <article key={job.company}>
                <span className="eyebrow">{job.period}</span>
                <h3>{job.company}</h3>
                <p className="job-role">{job.role}</p>
                <p>{job.detail}</p>
              </article>
            ))}
          </div>
        </>
      ) : (
        <>
          <span className="eyebrow">GOOD THINGS START WITH A CONVERSATION</span>
          <h2>Let’s build something.</h2>
          <p className="lead">Have an idea, a question, or a problem worth solving?</p>
          <a href={profile.github} target="_blank" rel="noreferrer" className="contact-link">
            Find me on GitHub <ArrowUpRight size={28} />
          </a>
          <a href="/resume.pdf" target="_blank" rel="noreferrer" className="text-link">
            Contact details in my résumé <ArrowUpRight size={15} />
          </a>
        </>
      )}
    </div>
  );
}

export default function Desktop({ onStartDrive }: { onStartDrive: () => void }) {
  const { activeApp, maximized, openApp, closeApp, toggleMaximized, exit } = useExperience();
  const content = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const title = applications.find((app) => app.id === activeApp)?.title ?? 'Home';
  useEffect(() => {
    if (activeApp) {
      content.current?.scrollTo(0, 0);
      content.current?.focus({ preventScroll: true });
    } else launcher.current?.focus({ preventScroll: true });
  }, [activeApp]);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        if (useExperience.getState().activeApp) closeApp();
        else if (useExperience.getState().maximized) useExperience.getState().toggleMaximized();
        event.preventDefault();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeApp]);
  return (
    <section
      className={`desktop-shell ${maximized ? 'is-maximized' : ''}`}
      aria-label="Portfolio display reading view"
    >
      <div className="desktop-topbar">
        <span className="desktop-brand">
          <LayoutGrid size={14} />
          RAJDEEP<span>/</span>PORTFOLIO
        </span>
        <span className="desktop-status">
          <i />
          PARKED · EXPLORE FREELY
        </span>
        <div className="display-top-actions">
          <button onClick={onStartDrive} className="desktop-exit drive-launch">
            <Power size={14} /> Start driving
          </button>
          {maximized && (
            <button onClick={toggleMaximized} className="desktop-exit">
              <Minimize2 size={14} />
              Back to cockpit
            </button>
          )}
          <button onClick={exit} className="desktop-exit">
            <ArrowLeft size={13} />
            Showroom
          </button>
        </div>
      </div>
      <div className="desktop-main">
        <aside className="desktop-sidebar">
          <span className="eyebrow">PORTFOLIO</span>
          {mainApps.map(({ id, title: label, icon: Icon }) => (
            <button
              key={id}
              className={activeApp === id ? 'active' : ''}
              onClick={() => openApp(id)}
              ref={id === 'work' ? launcher : undefined}
            >
              <Icon size={17} />
              {label}
              {activeApp === id && <ChevronRight size={13} />}
            </button>
          ))}
          <span className="eyebrow sidebar-project-label">PRODUCTS</span>
          {projects.map((p) => (
            <button
              key={p.slug}
              onClick={() => openApp(p.slug)}
              className={activeApp === p.slug ? 'active' : ''}
            >
              <span className={`mini-mark mini-${p.slug}`}>{p.mark}</span>
              {p.name}
            </button>
          ))}
          <div className="sidebar-bottom">
            <span className="small-status">PERSONAL PORTFOLIO</span>
            <span>Made to be explored.</span>
          </div>
        </aside>
        {activeApp ? (
          <section className="app-window" aria-label={`${title} window`}>
            <div className="window-titlebar">
              <div className="window-breadcrumb">
                Portfolio <ChevronRight size={12} />
                <strong>{title}</strong>
              </div>
              <div className="window-controls">
                <button aria-label="Display home" onClick={closeApp}>
                  <X size={16} />
                </button>
              </div>
            </div>
            <AppContent activeApp={activeApp} contentRef={content} />
          </section>
        ) : (
          <div className="desktop-empty">
            <span className="eyebrow">WELCOME ABOARD</span>
            <h2>Choose a destination.</h2>
            <button className="button primary" onClick={() => openApp('work')}>
              Explore my work
              <ArrowUpRight size={17} />
            </button>
          </div>
        )}
      </div>
      <div className="desktop-bottom">
        <span>RAJDEEP PANDEY / SELECTED WORK</span>
        <Link href="/portfolio">
          Open standard portfolio
          <ArrowUpRight size={12} />
        </Link>
      </div>
    </section>
  );
}
