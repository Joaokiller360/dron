interface LegalPageProps {
  title?: string
  subtitle?: string
  lastUpdate?: string
  label?: string
  content: Section[]
  keyword?: string[]
}

interface Section {
  heading?: string
  text?: string[]
  lists?: LegalList[]
}

interface LegalList {
  header?: string
  description?: string[]
  items: string[]
}

import Banner from "../banner"
import { ScrollRevealEffect, SectionCard, highlightText, ScrollBottonEffect } from "@/app/utils"
import { desc } from "framer-motion/client"
import { useTranslations } from "next-intl";

export default function LegalPage({
  title,
  label,
  lastUpdate,
  content,
  keyword = [],
}: LegalPageProps) {

  const t = useTranslations('legalPage.section');

  return (
    <>
      <Banner label={label} title={title} />

      <section className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <section className="space-y-6">
          <SectionCard style="bg-honeydew-800 dark:bg-honeydew-900">
            {content.map((section, index) => (
              <div key={`${section.heading}-${index}`}>
                <ScrollRevealEffect key={index}>
                  {/* Heading */}
                  {section.heading && (
                    <h2 className="pt-4 text-2xl font-semibold uppercase text-heading">
                      {section.heading}
                    </h2>
                  )}

                  {/* Text */}
                  {section.text && (
                    <div className="space-y-3 text-muted">
                      {section.text.map((paragraph, i) => (
                        <p className="text-xl" key={i}>
                          {highlightText(paragraph, keyword)}
                        </p>
                      ))}
                    </div>
                  )}
                </ScrollRevealEffect>

                {/* Lists */}
                {section.lists && (
                  <div className="pt-2 pl-5 space-y-4">
                    {section.lists.map((list, i) => (
                      <ScrollRevealEffect key={i}>
                        <div className="space-y-2">
                          {list.header && (
                            <h3 className="text-xl font-semibold text-heading">
                              {list.header}
                            </h3>
                          )}

                          <div className="pl-3">
                            
                             {(Array.isArray(list.description) ? list.description : []).map((desc, h) => (
                              <p className="pl-2 text-lg text-muted" key={h}>
                                {highlightText(desc, keyword)}
                              </p>
                            ))}

                            <ul className="pl-6 space-y-2 list-disc text-muted">
                              {list.items.map((item, j) => (
                                <li key={j}>
                                  {highlightText(item, keyword)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </ScrollRevealEffect>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <ScrollBottonEffect>
              {lastUpdate && (
                <p className="mt-6 text-sm font-bold text-muted">
                  {`${t('lastUpdate')}`}:{" "}
                  <span className="underline underline-offset-4">
                    {lastUpdate}
                  </span>
                </p>
              )}
            </ScrollBottonEffect>

          </SectionCard>
        </section>
      </section>
    </>
  )
}
