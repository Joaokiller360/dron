'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Eyebrow, ContactForm, useContactInfo } from '@/app/component'

const channelLabel = 'font-mono text-[11px] tracking-[.14em] uppercase text-jb-muted';
const channelRow = 'flex justify-between gap-3 px-5 py-[18px] bg-jb-card text-jb-text';

export default function ContactClient() {
  const t = useTranslations('site.contact');
  const faqs = t.raw('faqs') as { q: string; a: string }[];
  const [faq, setFaq] = useState(0);
  const contact = useContactInfo();

  return (
    <div className="bg-jb-bg">
      <section className="px-6 pt-20 pb-[88px] jb-glow">
        <div className="max-w-[1180px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-14">
          <div className="flex flex-col min-w-0 gap-7">
            <div>
              <Eyebrow className="mb-3.5">{t('eyebrow')}</Eyebrow>
              <h1 className="m-0 mb-4 font-mono text-[clamp(32px,4.4vw,50px)] leading-[1.06] font-bold tracking-[-.03em] text-white text-balance">
                {t('title')}
              </h1>
              <p className="m-0 text-[17px] leading-[1.65] text-jb-soft max-w-[460px]">{t('intro')}</p>
            </div>
            <div className="flex flex-col gap-px bg-white/[.08] rounded-[14px] overflow-hidden border border-white/[.08]">
              <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" className={`${channelRow} hover:bg-jb-well hover:text-jb-text`}>
                <span className={channelLabel}>{t('whatsapp')}</span>
                <span className="text-[14.5px]">{contact.phone}</span>
              </a>
              <a href={`mailto:${contact.email}`} className={`${channelRow} hover:bg-jb-well hover:text-jb-text`}>
                <span className={channelLabel}>{t('email')}</span>
                <span className="text-[14.5px] break-all">{contact.email}</span>
              </a>
              <div className={channelRow}>
                <span className={channelLabel}>{t('base')}</span>
                <span className="text-[14.5px]">{t('baseValue')}</span>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <ContactForm variant="full" />
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-jb-band border-t border-white/[.06]">
        <div className="max-w-[820px] mx-auto">
          <h2 className="m-0 mb-7 font-mono text-[clamp(24px,3.2vw,34px)] font-bold tracking-[-.02em] text-white">
            {t('faqTitle')}
          </h2>
          <div className="flex flex-col gap-2.5">
            {faqs.map((f, i) => {
              const isOpen = faq === i;
              return (
                <div key={f.q} className="rounded-xl border border-white/[.09] bg-jb-card overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setFaq(isOpen ? -1 : i)}
                    className="w-full flex justify-between items-center gap-4 px-5 py-[18px] bg-transparent border-0 text-white text-[15.5px] font-semibold text-left cursor-pointer"
                  >
                    <span>{f.q}</span>
                    <span className="flex-none font-mono text-lg text-jb-accent">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <p className="m-0 px-5 pb-[18px] text-[14.5px] leading-[1.6] text-jb-soft">{f.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
