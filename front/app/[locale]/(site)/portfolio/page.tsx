import { getMessages } from 'next-intl/server';
import { fetchPublic, type PublicProject } from '@/app/component';
import PortfolioClient from './PortfolioClient';

// Metadatos traducidos usando next-intl
export async function generateMetadata() {
  const messages = await getMessages();
  return {
    title: messages.portfolio?.metadeta?.TitleMeta || 'Portafolio | JB.SKYLENS',
    description:
      messages.portfolio?.metadeta?.DescriptionMeta || 'Explora el portafolio de JB.SKYLENS con proyectos reales de fotografía aérea, video con drones, eventos e inspecciones en Ecuador.',
    keywords: [
      messages.portfolio?.metadeta?.keywords
    ],
    canonical: 'https://dron.joaobarres.dev/portfolio',
  };
}

export default async function Portfolio() {
  const projects = (await fetchPublic<PublicProject[]>('/projects')) ?? [];
  return <PortfolioClient projects={projects} />;
}
