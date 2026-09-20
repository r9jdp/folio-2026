import PortraitName from './portrait-name';

type Product = {
  name: string;
  category?: string;
  href?: string;
  description?: string;
  note?: string;
};

const milnrProducts: Product[] = [
  {
    name: 'Fermeon',
    category: 'AI memory',
    href: 'https://www.fermeon.xyz/',
    description:
      'I built a shared memory layer that carries useful context between ChatGPT, Claude, Gemini, and other AI tools. Fewer repeated explanations, more continuity.',
    note: '250 active users · 12th of 467 launches on Product Hunt.',
  },
  {
    name: 'Meetly',
    category: 'Event networking',
    href: 'https://mymeetly.xyz',
    description:
      'I built an AI-powered event networking platform that matches attendees in real time and uses Wi-Fi fingerprinting and directional navigation to help them find each other inside a venue. First deployed at Draper Startup House.',
    note: 'Built in 3 days · 800+ users in 2 weeks · Sold to a startup house.',
  },
  {
    name: 'ClawIN',
    category: 'Social network for OpenClaw agents',
    href: 'https://www.clawin.xyz/',
    description:
      'I built a social network for OpenClaw agents. People create LinkedIn-style profiles for their own agents, which can then connect with agents owned by other people.',
    note: 'More than 250 users on its first day.',
  },
];

const experience = [
  {
    company: 'Barclays',
    role: 'Summer Intern, Technology',
    period: 'Jun–Aug 2026',
    description:
      'I migrated deployment pipelines from TeamCity to GitLab CI, aligned configurations with engineering standards, and brought the migrated services into production.',
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
        <p className="intro-kicker">Software engineer &amp; founder · Mumbai</p>
        <h1 id="intro-heading">
          <PortraitName />
        </h1>
        <div className="intro-copy">
          <p>
            <strong>6x Hackathon Winner</strong> ·{' '}
            <span className="intro-handwritten">Founder</span> of <strong>multiple products</strong>{' '}
            · Shipped <strong>2 products</strong> for <strong>DCB Bank</strong> with{' '}
            <strong className="intro-handwritten">~$1M/quarter</strong> in estimated savings
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
          <a href="mailto:rajdeepvp273@gmail.com">Email</a>
        </nav>
      </section>

      <section id="work" className="text-section" aria-labelledby="work-heading">
        <h2 id="work-heading" className="section-heading">
          Founder’s journey
        </h2>
        <div className="venture-list">
          <article className="venture-entry" aria-labelledby="milnr-heading">
            <div className="entry-heading venture-heading">
              <h3 id="milnr-heading">Milnr AI Lab</h3>
              <p className="entry-meta">Founder · 2025–Apr 2026</p>
            </div>
            <p className="entry-copy">
              I founded Milnr AI Lab, where we created multiple AI products, including Fermeon,
              Meetly, and ClawIN.
            </p>
            <div className="venture-products" role="group" aria-label="Products from Milnr AI Lab">
              <p className="products-label">Products we built</p>
              <div className="project-list">
                {milnrProducts.map((project) => (
                  <article className="project-entry" key={project.name}>
                    <div className="entry-heading">
                      <h4>
                        {project.href ? (
                          <a href={project.href} target="_blank" rel="noreferrer">
                            {project.name} <span aria-hidden="true">↗</span>
                          </a>
                        ) : (
                          project.name
                        )}
                      </h4>
                      {project.category && <p className="entry-meta">{project.category}</p>}
                    </div>
                    {project.description && <p className="entry-copy">{project.description}</p>}
                    {project.note && <p className="entry-meta">{project.note}</p>}
                  </article>
                ))}
              </div>
            </div>
          </article>
          <article className="venture-entry" aria-labelledby="trydonna-heading">
            <div className="entry-heading venture-heading">
              <h3 id="trydonna-heading">
                <a href="https://www.trydonna.net/" target="_blank" rel="noreferrer">
                  TryDonna <span aria-hidden="true">↗</span>
                </a>
              </h3>
              <p className="entry-meta">Founder · Mar–Apr 2026</p>
            </div>
            <p className="venture-category">Agent-to-agent hiring</p>
            <p className="entry-copy">
              I founded TryDonna, an agentic hiring platform where candidates and recruiters each
              have their own AI agent with all required context, automating the hiring process
              through direct agent-to-agent interaction rather than manual human shortlisting.
            </p>
            <p className="entry-meta">
              8th of 250+ launches on Product Hunt’s YC collaboration day.
            </p>
          </article>
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
