import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projects } from '@/content/portfolio';
import { SiteHeader } from '@/components/site-header';
import { BackToWork, ProjectDetail } from '@/components/project-content';
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return { title: project?.name ?? 'Project not found', description: project?.summary };
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  return (
    <>
      <SiteHeader />
      <main className="case-study-page">
        <BackToWork />
        <ProjectDetail project={project} />
      </main>
    </>
  );
}
