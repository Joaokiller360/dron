
import { getMessages } from 'next-intl/server';
import ContactClient from './ContactClient';

export async function generateMetadata() {
  const messages = await getMessages();
  return {
    title: messages.contact?.metadeta?.TitleMeta || 'Contacto | JB.SKYLENS',
    description:
      messages.contact?.metadeta?.DescriptionMeta || 'Contáctanos para servicios profesionales con drones en Ecuador. Cotizaciones para inspecciones, eventos, fotografía y video aéreo.',
    keywords: [
      messages.contact?.metadeta?.keywords
    ],
    canonical: 'https://dron.joaobarres.dev/contact',
  };
}

export default function Page() {
  return <ContactClient />;
}