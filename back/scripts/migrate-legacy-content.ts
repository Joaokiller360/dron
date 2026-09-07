/**
 * One-off migration: copies the hardcoded content that used to live in
 * front/app/[locale]/(site)/{portfolio,teams,clients}/* into the database,
 * so it becomes admin-manageable instead of hardcoded. Safe to re-run
 * (upserts by slug).
 *
 * Run with: npx ts-node scripts/migrate-legacy-content.ts
 */
import { PrismaClient, ProjectCategory } from '@prisma/client';

const prisma = new PrismaClient();

const CLOUDINARY_IMG = (id: string) =>
  `https://res.cloudinary.com/dzlavqhid/image/upload/${id}.jpg`;
const CLOUDINARY_VIDEO = (id: string) =>
  `https://res.cloudinary.com/dzlavqhid/video/upload/${id}.mp4`;
const CLOUDINARY_VIDEO_THUMB = (id: string) =>
  `https://res.cloudinary.com/dzlavqhid/video/upload/${id}.jpg`;

interface TeamSeed {
  slug: string;
  name: string;
  role: string;
  photoUrl: string;
  links: { platform: string; url: string }[];
}

interface ClientSeed {
  slug: string;
  name: string;
  organization: string;
  photoUrl: string;
  links: { platform: string; url: string }[];
}

interface ProjectSeed {
  slug: string;
  category: ProjectCategory;
  titleEs: string;
  descriptionEs?: string;
  coverUrl: string;
  href: string;
  mediaUrls?: string[];
}

const teamMembers: TeamSeed[] = [
  {
    slug: 'joao-barres',
    name: 'Joao Barres',
    role: 'Piloto',
    photoUrl: CLOUDINARY_IMG('pilot'),
    links: [{ platform: 'instagram', url: 'https://www.instagram.com/joao_barres' }],
  },
  {
    slug: 'camara-esme',
    name: 'Camara.Esme',
    role: 'Filmaker',
    photoUrl: CLOUDINARY_IMG('camaraEsme'),
    links: [{ platform: 'instagram', url: 'https://www.instagram.com/camara.esme' }],
  },
];

const clients: ClientSeed[] = [
  {
    slug: 'marina-ecovida',
    name: 'Marina Ecovida',
    organization: 'Grandes Marcas',
    photoUrl: CLOUDINARY_IMG('marina'),
    links: [
      { platform: 'instagram', url: 'https://www.instagram.com/marinaecovida' },
      {
        platform: 'whatsapp',
        url: 'https://api.whatsapp.com/message/SI7RZTHBYV3AK1?autoload=1&app_absent=0&utm_source=ig',
      },
    ],
  },
  {
    slug: 'vida-pura-beach',
    name: 'Vida Pura Beach',
    organization: 'Grandes Marcas',
    photoUrl: CLOUDINARY_IMG('vida-pura'),
    links: [{ platform: 'instagram', url: 'https://www.instagram.com/marinaecovida' }],
  },
  {
    slug: 'rumbeke-music-entertainment',
    name: 'Rumbeke Music Entertainment',
    organization: 'Grandes Marcas',
    photoUrl: CLOUDINARY_IMG('rumbeke'),
    links: [{ platform: 'instagram', url: 'https://www.instagram.com/rumbekemusicentertainment' }],
  },
  {
    slug: 'fundacion-corazones-descalzos',
    name: 'Fundación Corazones Descalzos',
    organization: 'Documentales',
    photoUrl: CLOUDINARY_IMG('corazones-descalzos'),
    links: [{ platform: 'instagram', url: 'https://www.instagram.com/fundacionph3' }],
  },
  {
    slug: 'television-central-de-china-cctv',
    name: 'Televisión Central de China (CCTV)',
    organization: 'Televisión',
    photoUrl: CLOUDINARY_IMG('cgtn'),
    links: [
      {
        platform: 'website',
        url: 'https://espanol.cgtn.com/news/2025-03-18/1901813188407869441/index.html?sfnsn=wa',
      },
    ],
  },
  {
    slug: 'prefectura-de-esmeraldas',
    name: 'Prefectura de Esmeraldas',
    organization: 'Gobierno',
    photoUrl: CLOUDINARY_IMG('prefectura-esmeraldas'),
    links: [{ platform: 'instagram', url: 'https://www.instagram.com/esmeraldasprefectura' }],
  },
  {
    slug: 'alcaldia-de-esmeraldas',
    name: 'Alcaldía de Esmeraldas',
    organization: 'Gobierno',
    photoUrl: CLOUDINARY_IMG('alcaldia-esmeraldas'),
    links: [{ platform: 'instagram', url: 'https://www.instagram.com/' }],
  },
];

const projects: ProjectSeed[] = [
  {
    slug: 'marina-sounset-session-vol-4',
    category: ProjectCategory.EVENTOS,
    titleEs: 'Marina Sounset - Session Vol. 4',
    descriptionEs: 'Jaun Fernando Velazco',
    coverUrl: CLOUDINARY_VIDEO_THUMB('juan-fernando'),
    href: 'https://www.instagram.com/reel/DS7quC9DdTr/?igsh=MTZpMHI1cHlzZmxwNw==',
    mediaUrls: [CLOUDINARY_VIDEO('juan-fernando')],
  },
  {
    slug: 'halloween-concert-party',
    category: ProjectCategory.EVENTOS,
    titleEs: 'Halloween - CONCERT PARTY',
    descriptionEs: 'Magic Juan',
    coverUrl: CLOUDINARY_VIDEO_THUMB('magic-juan'),
    href: 'https://www.instagram.com/reel/DQnVl9ijDO-/?igsh=MTVucHQ2M3B6aGQyMw==',
    mediaUrls: [CLOUDINARY_VIDEO('magic-juan')],
  },
  {
    slug: 'marina-sounset-session-vol-3',
    category: ProjectCategory.EVENTOS,
    titleEs: 'Marina Sounset - Session Vol. 3',
    descriptionEs: 'Verde 70',
    coverUrl: CLOUDINARY_VIDEO_THUMB('verde-70'),
    href: 'https://www.instagram.com/reel/DNMlByMx6FD/?igsh=dDNsMDI5eXhhcnpt',
    mediaUrls: [CLOUDINARY_VIDEO('verde-70')],
  },
  {
    slug: 'marina-sounset-session-vol-2',
    category: ProjectCategory.EVENTOS,
    titleEs: 'Marina Sounset - Session Vol. 2',
    descriptionEs: 'Tercer Mundo + AU-D',
    coverUrl: CLOUDINARY_IMG('marina'),
    href: 'https://www.instagram.com/reel/DJ0QWdJJl2V/?igsh=MXBtZ2Rod3I5NDAzaw==',
    mediaUrls: [CLOUDINARY_VIDEO('tercerMundo-auD')],
  },
  {
    slug: 'green-and-white',
    category: ProjectCategory.EVENTOS,
    titleEs: 'Green AND White',
    descriptionEs: 'Vida Pura Beach',
    coverUrl: CLOUDINARY_IMG('vida-pura'),
    href: 'https://www.instagram.com/reel/DMWlNidNaUA/?igsh=ZXZiN2dwaWIybWQ0',
  },
  {
    slug: 'paolo-plaza',
    category: ProjectCategory.EVENTOS,
    titleEs: 'Paolo Plaza',
    descriptionEs: 'Vida Pura Beach',
    coverUrl: CLOUDINARY_IMG('vida-pura'),
    href: 'https://www.instagram.com/reel/DB97gJdPqBT/?igsh=MWcxcmRmeWE2dTEwYQ==',
  },
  {
    slug: 'rumbeke-2025',
    category: ProjectCategory.EVENTOS,
    titleEs: 'Rumbeke 2025',
    descriptionEs: 'Rumbeke Music Entertainment',
    coverUrl: CLOUDINARY_IMG('rumbeke'),
    href: 'https://www.instagram.com/reel/DNcNE8zN1O9/?igsh=ODl2YmV4Y2wwYXNk',
  },
  {
    slug: 'rumbeke-carnaval-2025',
    category: ProjectCategory.EVENTOS,
    titleEs: 'Rumbeke Carnaval 2025',
    descriptionEs: 'Rumbeke Music Entertainment',
    coverUrl: CLOUDINARY_VIDEO_THUMB('rumbeke-2025'),
    href: 'https://www.instagram.com/reel/C-jf6zPxlXs/?igsh=cGYxZnFhc2t3ODB1',
    mediaUrls: [CLOUDINARY_VIDEO('rumbeke-2025')],
  },
  {
    slug: 'aloha-fest-2025',
    category: ProjectCategory.EVENTOS,
    titleEs: 'ALOHA FEST 2025',
    descriptionEs: 'ALOHA FEST',
    coverUrl: CLOUDINARY_VIDEO_THUMB('aloha-feste-2025'),
    href: 'https://www.instagram.com/reel/DG4qghKOlPh/?utm_source=ig_web_copy_link',
    mediaUrls: [CLOUDINARY_VIDEO('aloha-feste-2025')],
  },
  {
    slug: 'corazones-descalzos',
    category: ProjectCategory.PRODUCCION,
    titleEs: 'Corazones Descalzos',
    descriptionEs: 'Fundación Corazones Descalzos',
    coverUrl: CLOUDINARY_VIDEO_THUMB('corazones-descalzos'),
    href: 'https://www.instagram.com/reel/DS8appVjfKH/?igsh=MTl4dWV6OHZ2c3o0Zg==',
    mediaUrls: [CLOUDINARY_VIDEO('corazones-descalzos')],
  },
  {
    slug: 'television-central-de-china-cctv',
    category: ProjectCategory.PRODUCCION,
    titleEs: 'Televisión Central de China (CCTV)',
    descriptionEs: 'CGTN Español',
    coverUrl: CLOUDINARY_IMG('cgtn'),
    href: 'https://espanol.cgtn.com/news/2025-03-18/1901813188407869441/index.html?sfnsn=wa',
  },
  {
    slug: 'prefectura-de-esmeraldas-provincializacion',
    category: ProjectCategory.PRODUCCION,
    titleEs: 'Prefectura de Esmeraldas',
    descriptionEs: 'Gobierno',
    coverUrl: CLOUDINARY_VIDEO_THUMB('provincializacion-esmeralda'),
    href: 'https://www.instagram.com/reel/DRgImsmibaa/?utm_source=ig_web_button_share_sheet&igsh=MzRlODBiNWFlZA==',
    mediaUrls: [CLOUDINARY_VIDEO('provincializacion-esmeralda')],
  },
  {
    slug: 'elvis-crespo',
    category: ProjectCategory.PRODUCCION,
    titleEs: 'Elvis Crespo',
    descriptionEs: 'Alcaldía de Esmeraldas',
    coverUrl: CLOUDINARY_VIDEO_THUMB('elvis-crespo'),
    href: 'https://www.instagram.com/reel/DNA-zXrx9i8/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
    mediaUrls: [CLOUDINARY_VIDEO('elvis-crespo')],
  },
];

async function main() {
  for (const [i, m] of teamMembers.entries()) {
    await prisma.teamMember.upsert({
      where: { slug: m.slug },
      update: {},
      create: { ...m, sortOrder: i } as any,
    });
  }
  console.log(`Team members: ${teamMembers.length}`);

  for (const [i, c] of clients.entries()) {
    await prisma.client.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, sortOrder: i } as any,
    });
  }
  console.log(`Clients: ${clients.length}`);

  for (const [i, p] of projects.entries()) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, mediaUrls: p.mediaUrls ?? [], sortOrder: i },
    });
  }
  console.log(`Projects: ${projects.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
