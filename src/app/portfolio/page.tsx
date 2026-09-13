import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Download } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { ProjectGrid } from '@/components/project-content';
import { experience, profile } from '@/content/portfolio';
export const metadata: Metadata = { title: 'Selected work' };
export default function PortfolioPage() {
  return (
    <>
      <SiteHeader />
      <main className="standard-page" id="content">
        <section className="portfolio-intro">
          <span className="eyebrow">SOFTWARE DEVELOPER & PRODUCT BUILDER</span>
          <h1>
            Thoughtful software.
            <br />
            <span>Built for real people.</span>
          </h1>
          <p>{profile.intro}</p>
          <Link href="/" className="text-link">
            Take the scenic route
            <ArrowUpRight size={15} />
          </Link>
        </section>
        <section id="work" className="portfolio-section">
          <div className="section-heading">
            <span className="eyebrow">01 / SELECTED WORK</span>
            <h2>Ideas, shipped.</h2>
          </div>
          <ProjectGrid />
        </section>
        <section id="about" className="portfolio-section about-section">
          <div>
            <span className="eyebrow">02 / ABOUT ME</span>
            <h2>Hi, I’m Rajdeep.</h2>
            <p className="lead">I care about how software works, and how it feels to use.</p>
            <div className="skill-list">
              {profile.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
            <a href="/resume.pdf" target="_blank" rel="noreferrer" className="button secondary">
              <Download size={16} />
              Read my résumé
            </a>
          </div>
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
        </section>
        <section className="portfolio-contact">
          <span className="eyebrow">HAVE SOMETHING IN MIND?</span>
          <h2>Let’s build something.</h2>
          <a className="button primary" href={profile.github} target="_blank" rel="noreferrer">
            Find me on GitHub
            <ArrowUpRight size={16} />
          </a>
        </section>
      </main>
      <footer className="standard-footer">
        <span>RAJDEEP PANDEY · 2026</span>
        <Link href="/credits">Credits & acknowledgements</Link>
        <Link href="/">
          Back to the showroom
          <ArrowUpRight size={13} />
        </Link>
      </footer>
    </>
  );
}
