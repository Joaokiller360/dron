
import { ScrollBottonEffect } from '@/app/utils'

interface Banner {
  label?: string
  title?: string
  description?: string
}

export default function Banner({ label = '', title = '', description = '' }: Banner) {
  return (
    <>
      {label ? (
        <>
          <section className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <section className="grid mb-10 space-y-4 text-center">

              <ScrollBottonEffect>
                <div className="mx-10 font-mono text-sm font-light lg:text-lg gradient-text">
                  <span>- </span>
                  <span className="uppercase">
                    {label}
                  </span>
                  <span> -</span>
                </div>
              </ScrollBottonEffect>

              <ScrollBottonEffect>
                <h1 className="my-5 font-mono text-4xl font-bold uppercase gradient-text">
                  {title}
                </h1>
              </ScrollBottonEffect>
              <ScrollBottonEffect>
                <span className="mx-10 font-mono text-sm font-light lg:text-lg gradient-text">
                  {description}
                </span>
              </ScrollBottonEffect>
            </section>
          </section>
        </>
      ) : (
        title && (
          <>
            <section className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <section className="grid mb-10 space-y-4 text-center">
                <ScrollBottonEffect>
                  <div className="mx-10 font-mono text-sm font-light lg:text-lg gradient-text">
                    <span>- </span>
                    <span className="uppercase">
                      {label}
                    </span>
                    <span> -</span>
                  </div>
                </ScrollBottonEffect>

                <ScrollBottonEffect>
                  <span className="my-5 font-mono text-4xl font-bold uppercase gradient-text">
                    {title}
                  </span>
                </ScrollBottonEffect>
              </section>
            </section>
          </>
        )
      )}
    </>
  )
}
