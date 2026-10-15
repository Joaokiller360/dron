import { createMetadata } from '@/app/utils';
import { getLocale, getMessages } from 'next-intl/server';
import { fetchPublic, type PublicProject } from '@/app/component';
import PortfolioClient from './PortfolioClient';

export async function generateMetadata() {
  const [messages, locale] = await Promise.all([getMessages(), getLocale()]);
  const meta = messages.portfolio?.metadeta;
  return createMetadata({
    title: meta?.TitleMeta || 'Portafolio',
    description: meta?.DescriptionMeta || 'Explora el portafolio de JB.SKYLENS con proyectos reales de fotografía aérea, video con drones, eventos e inspecciones en Ecuador.',
    keywords: meta?.keywords,
    path: '/portfolio',
    locale,
  });
}

export default async function Portfolio() {
  const projects = (await fetchPublic<PublicProject[]>('/projects')) ?? [];
  return <PortfolioClient projects={projects} />;
}
