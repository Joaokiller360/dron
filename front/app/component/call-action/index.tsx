import { Button, SeparatorUp, ScrollBottonEffect } from '@/app/utils'

interface CallActionProps {
  text?: string
  style?: string
  styleSPrimary?: string
  styleSSecundary?: string
  buttonColor?: string
  textColor?: string
  background?: string
  buttonhref?: string
  buttonText?: string
}

export default function CallAction({
  text = '',
  style = '',
  styleSPrimary = '',
  styleSSecundary = '',
  buttonColor = '',
  textColor = '',
  background = '',
  buttonhref = '',
  buttonText = ''
}: CallActionProps) {
  return (
    <>
      <SeparatorUp
        colorsPrimary={styleSPrimary}
        colorsSecundary={styleSSecundary}
      />

      <section
        className={`mx-auto flex justify-center px-4 py-16 ${style}`}
      >
        <ScrollBottonEffect>
          <div
            className={`${background} w-full max-w-5xl rounded-2xl p-6 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center`}
          >
            {/* Texto */}
            <div className={`${textColor} text-center`}>
              <span className="block font-semibold leading-snug">
                {text}
              </span>
            </div>

            {/* Botón */}
            <div className="flex justify-center">
              <Button
                href={buttonhref}
                text={buttonText}
                style={buttonColor}
              />
            </div>
          </div>
        </ScrollBottonEffect>
      </section>
    </>
  )
}
