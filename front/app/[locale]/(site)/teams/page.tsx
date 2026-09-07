import { createMetadata } from '@/app/utils'
import { getMessages } from 'next-intl/server';
import TeamsClient, { DbTeamMember } from './TeamsClient';

export async function generateMetadata() {
  const messages = await getMessages();
  return createMetadata({
    title: messages.teams?.metadeta?.TitleMeta || 'Equipo',
    description:
      messages.teams?.metadeta?.DescriptionMeta,
    keywords: [
      messages.teams?.metadeta?.keywords,
    ],
    canonical: 'https://dron.joaobarres.dev/teams',
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
