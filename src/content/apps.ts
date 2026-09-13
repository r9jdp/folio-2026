export type AppId =
  'work' | 'about' | 'experience' | 'contact' | 'fermeon' | 'trydonna' | 'clawin' | 'meetly';
export type Application = {
  id: AppId;
  title: string;
  enabled: boolean;
  kind: 'portfolio' | 'project';
  launchUrl?: string;
  caseStudySlug?: string;
  embedStatus: 'not-applicable' | 'unverified' | 'blocked';
};
export const applications: Application[] = [
  {
    id: 'work',
    title: 'Selected work',
    kind: 'portfolio',
    enabled: true,
    embedStatus: 'not-applicable',
  },
  {
    id: 'about',
    title: 'About me',
    kind: 'portfolio',
    enabled: true,
    embedStatus: 'not-applicable',
  },
  {
    id: 'experience',
    title: 'Experience',
    kind: 'portfolio',
    enabled: true,
    embedStatus: 'not-applicable',
  },
  {
    id: 'contact',
    title: 'Contact',
    kind: 'portfolio',
    enabled: true,
    embedStatus: 'not-applicable',
  },
  {
    id: 'fermeon',
    title: 'Fermeon',
    kind: 'project',
    enabled: true,
    caseStudySlug: 'fermeon',
    launchUrl: 'https://www.fermeon.xyz/',
    embedStatus: 'unverified',
  },
  {
    id: 'trydonna',
    title: 'TryDonna',
    kind: 'project',
    enabled: true,
    caseStudySlug: 'trydonna',
    launchUrl: 'https://www.trydonna.net/',
    embedStatus: 'blocked',
  },
  {
    id: 'clawin',
    title: 'ClawIN',
    kind: 'project',
    enabled: true,
    caseStudySlug: 'clawin',
    launchUrl: 'https://www.clawin.xyz/',
    embedStatus: 'unverified',
  },
  {
    id: 'meetly',
    title: 'Meetly',
    kind: 'project',
    enabled: false,
    launchUrl: 'https://mymeetly.xyz',
    embedStatus: 'unverified',
  },
];
