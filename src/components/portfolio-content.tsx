const selectedWork = [
  {
    name: 'Fermeon',
    category: 'AI memory',
    href: 'https://www.fermeon.xyz/',
    description:
      'I built a shared memory layer that carries useful context between ChatGPT, Claude, Gemini, and other AI tools. Fewer repeated explanations, more continuity.',
    note: '12th of 467 launches on Product Hunt.',
  },
  {
    name: 'TryDonna',
    category: 'Agent-to-agent hiring',
    href: 'https://www.trydonna.net/',
    description:
      'As a founding engineer, I built a hiring system where AI agents represent candidates and recruiters, learn their preferences, and explore opportunities together.',
    note: '8th of 250+ launches on Product Hunt’s YC collaboration day.',
  },
  {
    name: 'ClawIN',
    category: 'A network for AI agents',
    href: 'https://www.clawin.xyz/',
    description:
      'A place for AI agents to discover one another, communicate, and collaborate. I built the product and the infrastructure for agents to connect.',
    note: 'More than 250 users on its first day.',
  },
] as const;

const experience = [
  {
    company: 'Barclays',
    role: 'Summer Intern, Technology',
    period: 'Jun–Aug 2026',
    description:
      'I migrated deployment pipelines from TeamCity to GitLab CI, aligned configurations with engineering standards, and brought the migrated services into production.',
  },
  {
    company: 'Milnr AI Labs',
    role: 'Founder',
    period: '2025–Apr 2026',
    description:
      'I built AI products around persistent memory, multi-agent orchestration, and developer tools, including Fermeon.',
  },
  {
    company: 'TryDonna',
    role: 'Founding Engineer',
    period: 'Mar–Apr 2026',
    description:
      'I developed agent-to-agent hiring workflows and adaptive AI personas for candidates and recruiters.',
  },
  {
    company: 'DCB Bank',
    role: 'Business Intelligence Intern',
    period: 'May–Oct 2025',
    description:
      'I worked on fraud detection and AI document processing, built a system for 40,000+ loan PDFs, and reduced manual verification work by 95% across loan workflows.',
  },
] as const;

const achievements = [
  {
    title: 'Top 6 · OpenAI Codex Hackathon',
    description:
      'Built a multi-agent system in VS Code with parallel Codex execution and isolated Git worktrees, in under six hours.',
  },
  {
    title: 'Winner · Paytm AI Hackathon',
    description: 'Hosted in Mumbai with Sarvam AI, Logitech, and HackCulture.',
  },
  {
    title: 'Silver · Unstoppable Hackathon',
    description:
      'Shipped fixes in live blockchain repositories during the 33-hour open-source track.',
  },
  {
    title: 'First runner-up · Fynd Hacktimus',
    description: 'Built an AI pricing system using XGBoost and automated strategy generation.',
  },
  {
    title: 'Top 100 · ZS Campus Beats',
    description: 'Selected among the top 100 teams nationwide.',
  },
] as const;

export default function PortfolioContent() {
  return (
    <main id="main-content" className="portfolio-content">
      <section id="about" className="intro" aria-labelledby="intro-heading">
        <p className="intro-kicker">Software developer &amp; product builder · Mumbai</p>
        <h1 id="intro-heading">Rajdeep Pandey</h1>
        <div className="intro-copy">
          <p>
            I build AI systems, tools for developers, and products that turn an idea into something
            people can use.
          </p>
          <p>
            I’ve founded Milnr AI Labs, built at TryDonna, and worked on engineering problems at
            Barclays and DCB Bank. Here’s a little of what I’ve been making.
          </p>
        </div>
        <nav className="inline-links" aria-label="Find me online">
          <a href="https://github.com/r9jdp" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/rajdeep-pandey-bb8a682ab/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
          <a href="/resume.pdf" target="_blank" rel="noreferrer">
            Resume
          </a>
          <a href="mailto:rajdeepvp273@gmail.com">Email</a>
        </nav>
      </section>

      <section id="work" className="text-section" aria-labelledby="work-heading">
        <h2 id="work-heading" className="section-heading">
          Selected work
        </h2>
        <div className="project-list">
          {selectedWork.map((project) => (
            <article className="project-entry" key={project.name}>
              <div className="entry-heading">
                <h3>
                  <a href={project.href} target="_blank" rel="noreferrer">
                    {project.name} <span aria-hidden="true">↗</span>
                  </a>
                </h3>
                <p className="entry-meta">{project.category}</p>
              </div>
              <p className="entry-copy">{project.description}</p>
              <p className="entry-meta">{project.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="experience" className="text-section" aria-labelledby="experience-heading">
        <h2 id="experience-heading" className="section-heading">
          Where I’ve been
        </h2>
        <div className="experience-list">
          {experience.map((job) => (
            <article className="experience-entry" key={job.company}>
              <div className="entry-heading">
                <h3>{job.company}</h3>
                <p className="entry-meta">{job.period}</p>
              </div>
              <p className="entry-meta">{job.role}</p>
              <p className="entry-copy">{job.description}</p>
            </article>
          ))}
          <article className="experience-entry">
            <div className="entry-heading">
              <h3>Computer Society of India, KJSCE</h3>
              <p className="entry-meta">Jul 2024–Jan 2026</p>
            </div>
            <p className="entry-meta">Tech Head</p>
            <p className="entry-copy">
              I led development of an event platform used by 1,000+ students and a national
              hackathon platform used by 2,000+ participants.
            </p>
          </article>
        </div>
      </section>

      <section id="achievements" className="text-section" aria-labelledby="achievements-heading">
        <h2 id="achievements-heading" className="section-heading">
          A few milestones
        </h2>
        <ul className="achievement-list">
          {achievements.map((achievement) => (
            <li key={achievement.title}>
              <h3>{achievement.title}</h3>
              <p className="entry-copy">{achievement.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer id="contact" className="contact-section">
        <h2 className="section-heading">Let’s make something useful.</h2>
        <p className="entry-copy">
          Have an interesting idea, a question, or just want to say hello?
        </p>
        <a href="mailto:rajdeepvp273@gmail.com">rajdeepvp273@gmail.com ↗</a>
      </footer>
    </main>
  );
}
