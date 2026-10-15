import { createMetadata } from '@/app/utils'
import { getLocale, getMessages } from 'next-intl/server';
import TeamsClient, { DbTeamMember } from './TeamsClient';

export async function generateMetadata() {
  const [messages, locale] = await Promise.all([getMessages(), getLocale()]);
  const meta = messages.teams?.metadeta;
  return createMetadata({
    title: meta?.TitleMeta || 'Nuestro equipo',
    description: meta?.DescriptionMeta || 'Conoce al equipo de JB.SKYLENS, especialistas en operación de drones, inspecciones técnicas y producción audiovisual aérea.',
    keywords: meta?.keywords,
    path: '/teams',
    locale,
  });
}

async function getPublishedTeamMembers(): Promise<DbTeamMember[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];
  try {
    const res = await fetch(`${apiUrl}/team-members`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function Page() {
  const dbMembers = await getPublishedTeamMembers();
  return <TeamsClient dbMembers={dbMembers} />;
}
