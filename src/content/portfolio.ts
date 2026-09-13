export const profile = {
  name: 'Rajdeep Pandey',
  role: 'Software developer & product builder',
  intro:
    'I turn ideas into software people can actually use. Building across the web, AI, and everything in between.',
  github: 'https://github.com/r9jdp',
  skills: ['React', 'Next.js', 'TypeScript', 'Python', 'AI systems', 'Product engineering'],
};

export const projects = [
  {
    slug: 'fermeon',
    name: 'Fermeon',
    category: 'AI · PRODUCT',
    year: '01',
    color: '#b7e8cd',
    tagline: 'Your context. Across every conversation.',
    summary: 'Persistent AI memory across tools, built to keep useful context with you.',
    problem: 'Moving between AI tools often means explaining your context all over again.',
    approach:
      'A shared memory layer that helps context follow you across ChatGPT, Claude and Gemini.',
    contribution: 'Product development and launch.',
    url: 'https://www.fermeon.xyz/',
    mark: 'F',
  },
  {
    slug: 'trydonna',
    name: 'TryDonna',
    category: 'AI · HIRING',
    year: '02',
    color: '#c8baf4',
    tagline: 'A different conversation about hiring.',
    summary:
      'An exploration of agent-to-agent hiring and how AI can connect people with opportunities.',
    problem: 'Hiring involves matching the needs of both people and teams.',
    approach: 'Agent-to-agent conversations as a different way to explore that match.',
    contribution: 'Product development and launch.',
    url: 'https://www.trydonna.net/',
    mark: 'd',
  },
  {
    slug: 'clawin',
    name: 'ClawIN',
    category: 'AI · NETWORKS',
    year: '03',
    color: '#f3be9f',
    tagline: 'A network for a new kind of participant.',
    summary:
      'A network built for AI agents, exploring connection beyond a conventional social feed.',
    problem:
      'AI agents introduce new questions about how participants discover and connect with one another.',
    approach: 'A dedicated network designed around AI agents.',
    contribution: 'Product development and launch.',
    url: 'https://www.clawin.xyz/',
    mark: 'C',
  },
] as const;
export type Project = (typeof projects)[number];
export const experience = [
  {
    company: 'Barclays',
    role: 'Software Engineering Intern',
    period: 'Summer 2026',
    detail: 'Engineering experience in financial services, including CI/CD migration.',
  },
  {
    company: 'Milnr AI Labs',
    role: 'Founder',
    period: '2025 – April 2026',
    detail: 'Building and launching AI products for real users.',
  },
  {
    company: 'DCB Bank',
    role: 'AI & Software Engineering',
    period: '2025',
    detail: 'Work spanning fraud detection and AI document processing.',
  },
];
