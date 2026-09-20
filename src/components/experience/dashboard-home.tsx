'use client';
import { useEffect, useRef } from 'react';
import {
  BriefcaseBusiness,
  UserRound,
  History,
  Send,
  LayoutGrid,
  Maximize2,
  ArrowUpRight,
  ArrowLeft,
  ChevronRight,
  Download,
  Power,
} from 'lucide-react';
import { useExperience } from '@/state/experience';
import { projects, profile, experience } from '@/content/portfolio';
import { applications } from '@/content/apps';

const apps = [
  { id: 'work', title: 'Work', icon: BriefcaseBusiness },
  { id: 'about', title: 'About', icon: UserRound },
  { id: 'experience', title: 'Experience', icon: History },
  { id: 'contact', title: 'Contact', icon: Send },
] as const;

export function DisplayHome({ onStartDrive }: { onStartDrive: () => void }) {
  const activeApp = useExperience((s) => s.activeApp);
  const openApp = useExperience((s) => s.openApp);
  const closeApp = useExperience((s) => s.closeApp);
  const expand = useExperience((s) => s.toggleMaximized);
  const title = applications.find((app) => app.id === activeApp)?.title ?? 'Home';
  const project = projects.find((item) => item.slug === activeApp);
  const body = useRef<HTMLDivElement>(null);
  const home = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (activeApp) body.current?.focus({ preventScroll: true });
  }, [activeApp]);
  function goHome() {
    closeApp();
    home.current?.focus({ preventScroll: true });
  }
  return (
    <section className="pcm-display" aria-label="Taycan portfolio display">
      <nav className="pcm-rail" aria-label="Dashboard navigation">
        <button
          ref={home}
          onClick={goHome}
          aria-label="Display home"
          aria-current={!activeApp ? 'page' : undefined}
        >
          <LayoutGrid size={28} />
        </button>
        {apps.map(({ id, title: label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => openApp(id)}
            aria-label={label}
            aria-current={activeApp === id || (id === 'work' && project) ? 'page' : undefined}
          >
            <Icon size={27} strokeWidth={1.5} />
          </button>
        ))}
        <button onClick={expand} aria-label="Open reading view">
          <Maximize2 size={25} />
        </button>
      </nav>
      <div className="pcm-main">
        <header className="pcm-statusbar">
          <span>{activeApp ? title : 'HOME'}</span>
          <span className="pcm-profile">RAJDEEP PANDEY</span>
          <span className="pcm-park">
            <i /> PARKED
          </span>
        </header>
        <div ref={body} className="pcm-content" tabIndex={-1}>
          {!activeApp ? (
            <>
              <div className="pcm-heading">
                <h2>Welcome aboard.</h2>
                <span>SOFTWARE &amp; PRODUCTS</span>
              </div>
              <div className="pcm-apps">
                {apps.map(({ id, title: label, icon: Icon }) => (
                  <button key={id} onClick={() => openApp(id)}>
                    <Icon size={45} strokeWidth={1.3} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <div className="pcm-project-shortcuts" aria-label="Featured projects">
                {projects.map((item) => (
                  <button key={item.slug} onClick={() => openApp(item.slug)}>
                    {item.name}
                    <ArrowUpRight size={19} />
                  </button>
                ))}
              </div>
            </>
          ) : project ? (
            <article className="pcm-project-detail">
              <div className="pcm-project-intro">
                <span className={`pcm-mark mini-${project.slug}`}>{project.mark}</span>
                <div>
                  <span className="pcm-kicker">{project.category}</span>
                  <h2>{project.name}</h2>
                </div>
              </div>
              <p>{project.summary}</p>
              <div className="pcm-content-actions">
                <a href={project.url} target="_blank" rel="noreferrer">
                  Visit project <ArrowUpRight size={20} />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <button onClick={expand}>
                  Read case study <Maximize2 size={19} />
                </button>
              </div>
            </article>
          ) : activeApp === 'work' ? (
            <div className="pcm-work-list">
              {projects.map((item) => (
                <button key={item.slug} onClick={() => openApp(item.slug)}>
                  <span className={`pcm-mark mini-${item.slug}`}>{item.mark}</span>
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.category}</small>
                  </span>
                  <ChevronRight size={25} />
                </button>
              ))}
            </div>
          ) : activeApp === 'about' ? (
            <article className="pcm-copy">
              <span className="pcm-kicker">THE PERSON BEHIND THE WHEEL</span>
              <h2>Hi, I’m Rajdeep.</h2>
              <p>{profile.intro}</p>
              <div className="pcm-skills">
                {profile.skills.slice(0, 4).map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </article>
          ) : activeApp === 'experience' ? (
            <div className="pcm-experience">
              {experience.map((job) => (
                <button key={job.company} onClick={expand} aria-label={`Read about ${job.company}`}>
                  <span>
                    <strong>{job.company}</strong>
                    <small>{job.role}</small>
                  </span>
                  <span>{job.period}</span>
                  <ChevronRight size={22} />
                </button>
              ))}
            </div>
          ) : (
            <article className="pcm-copy">
              <span className="pcm-kicker">LET’S BUILD SOMETHING</span>
              <h2>A good place to start.</h2>
              <p>Have an idea, a question, or a problem worth solving?</p>
              <div className="pcm-content-actions">
                <a href={profile.github} target="_blank" rel="noreferrer">
                  GitHub <ArrowUpRight size={20} />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <a href="/resume.pdf" target="_blank" rel="noreferrer">
                  Résumé <Download size={20} />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </article>
          )}
        </div>
        <footer className="pcm-footer">
          {activeApp ? (
            <button onClick={goHome}>
              <ArrowLeft size={21} /> Home
            </button>
          ) : (
            <button className="pcm-start-drive" onClick={onStartDrive}>
              <Power size={22} /> Start driving
            </button>
          )}
          <button onClick={expand}>
            Reading view <Maximize2 size={20} />
          </button>
        </footer>
      </div>
    </section>
  );
}
