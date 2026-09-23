import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { highlightText } from '@/app/utils';
import { Eyebrow } from '@/app/component';

interface LegalSection {
  heading?: string;
  text?: string[] | string;
  lists?: { header?: string; description?: string[] | string; items: string[] }[];
}

interface DbLegalPage {
  slug: string;
  titleEs: string;
  titleEn?: string | null;
  label?: string | null;
  lastUpdate?: string | null;
  keywords: string[];
  content: LegalSection[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  published: boolean;
}

async function getLegalPage(slug: string): Promise<DbLegalPage | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;
  try {
    const res = await fetch(`${apiUrl}/legal-pages/slug/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as DbLegalPage;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getLegalPage(slug);
  if (!page) return {};

  const title = page.metaTitle || `${page.titleEs} | JB.SKYLENS`;
  return {
    title,
    description: page.metaDescription || undefined,
    keywords: page.keywords?.length ? page.keywords : undefined,
    alternates: { canonical: `https://dron.joaobarres.dev/legal/${page.slug}` },
    robots: { index: page.published, follow: page.published },
  };
}

export default async function DynamicLegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getLegalPage(slug);
  if (!page) notFound();

  const t = await getTranslations('site.legal');
  const locale = await getLocale();
  const title = locale === 'en' && page.titleEn ? page.titleEn : page.titleEs;
  const keywords = page.keywords ?? [];
  const sections = (page.content ?? []).map((section, i) => ({
    ...section,
    id: `sec-${i + 1}`,
  }));
  // Only headed sections are numbered and listed in the table of contents
  const headed = sections.filter((s) => s.heading);
  const numberOf = (id: string) => String(headed.findIndex((s) => s.id === id) + 1).padStart(2, '0');
  const asArray = (v?: string[] | string) => (Array.isArray(v) ? v : v ? [v] : []);

  return (
    <div className="bg-jb-bg">
      <section className="px-6 pt-[72px] pb-9 border-b border-white/[.07]">
        <div className="max-w-[1080px] mx-auto">
          <Eyebrow className="mb-3.5">{page.label || t('eyebrow')}</Eyebrow>
          <h1 className="m-0 mb-3 font-mono text-[clamp(30px,4.2vw,46px)] leading-[1.08] font-bold tracking-[-.03em] text-white">
            {title}
          </h1>
          {page.lastUpdate && (
            <p className="m-0 font-mono text-[12.5px] text-jb-muted">
              {t('updated')}: {page.lastUpdate}
            </p>
          )}
        </div>
      </section>

      <section className="px-6 pt-12 pb-[88px]">
        <div className="max-w-[1080px] mx-auto grid gap-12 items-start lg:grid-cols-[260px_minmax(0,1fr)]">
          {headed.length > 0 && (
            <nav className="lg:sticky lg:top-24 flex flex-col gap-0.5 p-[18px] rounded-[14px] border border-white/[.08] bg-jb-card max-w-[300px]">
              <span className="mb-2 font-mono text-[10.5px] tracking-[.16em] uppercase text-jb-muted">{t('contents')}</span>
              {headed.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="text-[13.5px] text-jb-soft px-2 py-1.5 rounded-md hover:text-white hover:bg-white/[.05]"
                >
                  {numberOf(s.id)}. {s.heading}
                </a>
              ))}
            </nav>
          )}
          <div className={`min-w-0 max-w-[700px] flex flex-col gap-9 ${headed.length ? 'lg:col-start-2' : 'lg:col-span-2'}`}>
            {sections.map((s) => (
              <article key={s.id} id={s.id} className="flex flex-col gap-2.5 scroll-mt-24">
                {s.heading && (
                  <h2 className="m-0 text-xl font-bold text-white">
                    <span className="mr-2.5 font-mono text-jb-accent">{numberOf(s.id)}</span>
                    {s.heading}
                  </h2>
                )}
                {asArray(s.text).map((paragraph, i) => (
                  <p key={i} className="m-0 text-[15.5px] leading-[1.75] text-jb-soft text-pretty">
                    {highlightText(paragraph, keywords)}
                  </p>
                ))}
                {(s.lists ?? []).map((list, i) => (
                  <div key={i} className="flex flex-col gap-2 pl-1">
                    {list.header && <h3 className="m-0 text-base font-semibold text-white">{list.header}</h3>}
                    {asArray(list.description).map((d, j) => (
                      <p key={j} className="m-0 text-[15px] leading-[1.7] text-jb-soft">
                        {highlightText(d, keywords)}
                      </p>
                    ))}
                    {asArray(list.items).length > 0 && (
                      <ul className="m-0 pl-5 flex flex-col gap-1.5 list-disc marker:text-jb-accent text-[15px] leading-[1.65] text-jb-soft">
                        {asArray(list.items).map((item, j) => (
                          <li key={j}>{highlightText(item, keywords)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
