/**
 * One-off: migrate the 2 hardcoded /legal/* pages into the DB so they become
 * editable from the dashboard. Reads the current copy straight from the front
 * i18n bundle (Spanish) so nothing is retyped. Idempotent (upsert by slug).
 *
 *   npx ts-node prisma/seed-legal-pages.ts
 */
import { PrismaClient, Prisma } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const messages = require('../../front/translate/es.json');

const prisma = new PrismaClient();

type RawSection = {
  subTitle?: string;
  text?: string | string[];
  lists?: {
    header?: string;
    description?: string | string[];
    items?: string[];
  }[];
};

const toArr = (v?: string | string[]) =>
  v === undefined ? undefined : Array.isArray(v) ? v : [v];

function transform(content: Record<string, RawSection>) {
  return Object.values(content).map((s) => ({
    heading: s.subTitle,
    text: toArr(s.text) ?? [],
    ...(s.lists && {
      lists: s.lists.map((l) => ({
        header: l.header ?? '',
        description: toArr(l.description) ?? [],
        items: l.items ?? [],
      })),
    }),
  }));
}

const PAGES = [
  {
    slug: 'terms-and-conditions',
    i18n: messages.legal.terms,
    metaTitle: 'Términos y Condiciones | JB.SKYLENS',
    metaDescription:
      'Consulta los términos y condiciones de JB.SKYLENS, empresa especializada en servicios profesionales con drones en Ecuador.',
    sortOrder: 0,
  },
  {
    slug: 'privacy-policies',
    i18n: messages.legal.privacy,
    metaTitle: 'Política de Privacidad | JB.SKYLENS',
    metaDescription:
      'Consulta la política de privacidad de JB.SKYLENS, empresa especializada en servicios profesionales con drones en Ecuador.',
    sortOrder: 1,
  },
];

async function main() {
  for (const p of PAGES) {
    const data = {
      slug: p.slug,
      titleEs: p.i18n.title as string,
      label: (p.i18n.label as string) ?? null,
      lastUpdate: (p.i18n.lastUpdate as string) ?? null,
      keywords: (p.i18n.keywords as string[]) ?? [],
      content: transform(p.i18n.content) as unknown as Prisma.InputJsonValue,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      published: true,
      sortOrder: p.sortOrder,
    };
    await prisma.legalPage.upsert({
      where: { slug: p.slug },
      update: data,
      create: data,
    });
    console.log(`✓ ${p.slug} (${(data.content as unknown[]).length} secciones)`);
  }
  console.log(`\nSeeded ${PAGES.length} legal pages.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
