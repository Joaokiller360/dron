import { createMetadata } from '@/app/utils';
import { getLocale, getMessages } from 'next-intl/server';
import ContactClient from './ContactClient';

export async function generateMetadata() {
  const [messages, locale] = await Promise.all([getMessages(), getLocale()]);
  const meta = messages.contact?.metadeta;
  return createMetadata({
    title: meta?.TitleMeta || 'Contacto',
    description: meta?.DescriptionMeta || 'Contáctanos para servicios profesionales con drones en Ecuador. Cotizaciones para inspecciones, eventos, fotografía y video aéreo.',
    keywords: meta?.keywords,
    path: '/contact',
    locale,
  });
}

export default function Page() {
  return <ContactClient />;
}