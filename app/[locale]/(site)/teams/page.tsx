import { createMetadata } from '@/app/utils'
import { getMessages } from 'next-intl/server';
import TeamsClient from './TeamsClient';

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

export default function Page() {
  return <TeamsClient />;
}
