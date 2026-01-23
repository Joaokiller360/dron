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
  description?: string
  items: string[]
}

import Banner from "../banner"
import { SectionCard, highlightText } from "@/app/utils"

export default function LegalPage({
  title,
  label,
  subtitle,
  lastUpdate,
  content,
  keyword = [],
}: LegalPageProps) {
  return (
    <>
      <Banner label={label} title={title} description={subtitle} />

      <section className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <section className="space-y-6">
          <SectionCard style="bg-honeydew-800 dark:bg-honeydew-900">
            {content.map((section, index) => (
              <div key={`${section.heading}-${index}`}>
                {/* Heading */}
                {section.heading && (
                  <h2 className="pt-4 text-2xl font-semibold text-heading">
                    {section.heading}
                  </h2>
                )}

                {/* Text */}
                {section.text && (
                  <div className="space-y-3 text-muted">
                    {section.text.map((paragraph, i) => (
                      <p key={i}>
                        {highlightText(paragraph, keyword)}
                      </p>
                    ))}
                  </div>
                )}

                {/* Lists */}
                {section.lists && (
                  <div className="pt-2 pl-5 space-y-4">
                    {section.lists.map((list, i) => (
                      <div key={i} className="space-y-2">
                        {list.header && (
                          <h3 className="text-xl font-semibold text-heading">
                            {list.header}
                          </h3>
                        )}

                        <div className="pl-3">
                          {list.description && (
                            <p className="text-lg text-muted">
                              {highlightText(list.description, keyword)}
                            </p>
                          )}

                          <ul className="pl-6 space-y-2 list-disc text-muted">
                            {list.items.map((item, j) => (
                              <li key={j}>
                                {highlightText(item, keyword)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {lastUpdate && (
              <p className="mt-6 text-sm font-bold text-muted">
                Última actualización:{" "}
                <span className="underline underline-offset-4">
                  {lastUpdate}
                </span>
              </p>
            )}
          </SectionCard>
        </section>
      </section>
    </>
  )
}
