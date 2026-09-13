import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { projects, type Project } from '@/content/portfolio';
import type { CSSProperties } from 'react';

export function ProjectMark({ project }: { project: Project }) {
  return (
    <span
      className={`project-mark mark-${project.slug}`}
      style={{ '--project-color': project.color } as CSSProperties}
    >
      {project.mark}
    </span>
  );
}
export function ProjectGrid({ onOpen }: { onOpen?: (slug: Project['slug']) => void }) {
  return (
    <div className="project-grid">
      {projects.map((project, index) => (
        <article
          key={project.slug}
          className={`project-card project-${project.slug}`}
          style={{ '--project-color': project.color } as CSSProperties}
        >
          <div className="project-card-top">
            <span className="eyebrow">{project.category}</span>
            <span className="project-number">{project.year}</span>
          </div>
          <ProjectMark project={project} />
          <div className="project-card-copy">
            <h3>{project.name}</h3>
            <p>{project.summary}</p>
          </div>
          {onOpen ? (
            <button
              className="project-open"
              onClick={() => onOpen(project.slug)}
              aria-label={`Explore ${project.name}`}
            >
              <span>Explore project</span>
              <ArrowUpRight size={18} />
            </button>
          ) : (
            <Link className="project-open" href={`/projects/${project.slug}`}>
              <span>Explore project</span>
              <ArrowUpRight size={18} />
            </Link>
          )}
          {index === 0 && (
            <div className="memory-orbit" aria-hidden="true">
              <i />
              <i />
              <i />
              <span />
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
export function ProjectDetail({ project }: { project: Project }) {
  return (
    <article
      className="project-detail"
      style={{ '--project-color': project.color } as CSSProperties}
    >
      <div className="project-detail-heading">
        <ProjectMark project={project} />
        <span className="eyebrow">{project.category}</span>
      </div>
      <h1>{project.name}</h1>
      <p className="detail-tagline">{project.tagline}</p>
      <p className="detail-summary">{project.summary}</p>
      <div className="detail-columns">
        <section>
          <span className="eyebrow">THE PROBLEM</span>
          <p>{project.problem}</p>
        </section>
        <section>
          <span className="eyebrow">THE APPROACH</span>
          <p>{project.approach}</p>
        </section>
      </div>
      <div className="project-contribution">
        <span className="eyebrow">MY CONTRIBUTION</span>
        <p>{project.contribution}</p>
      </div>
      <a href={project.url} target="_blank" rel="noreferrer" className="button primary">
        Visit {project.name}
        <ArrowUpRight size={16} />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </article>
  );
}
export function BackToWork() {
  return (
    <Link href="/portfolio#work" className="text-link">
      <ArrowRight size={15} className="back-arrow" />
      Back to selected work
    </Link>
  );
}
