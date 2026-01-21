interface Colors {
  colorsPrimary?: string;
  colorsSecundary?: string;
}

export function SeparatorUp({ colorsPrimary = '', colorsSecundary = '' }: Colors) {
  return (
    <div className={`w-full h-5 sm:h-8 lg:h-12 ${colorsPrimary}`}>
      <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0 43.9999C106.667 43.9999 213.333 7.99994 320 7.99994C426.667 7.99994 533.333 43.9999 640 43.9999C746.667 43.9999 853.333 7.99994 960 7.99994C1066.67 7.99994 1173.33 43.9999 1280 43.9999C1386.67 43.9999 1440 19.0266 1440 9.01329V100H0V43.9999Z"
          className={`fill-current ${colorsSecundary}`}
        />
      </svg>
    </div>
  )
}

export function SeparatorBelow() {
  return (
    <div className="w-full h-10 sm:h-14 bg-honeydew-900">
      <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0 43.9999C106.667 43.9999 213.333 7.99994 320 7.99994C426.667 7.99994 533.333 43.9999 640 43.9999C746.667 43.9999 853.333 7.99994 960 7.99994C1066.67 7.99994 1173.33 43.9999 1280 43.9999C1386.67 43.9999 1440 19.0266 1440 9.01329V100H0V43.9999Z"
          className="fill-current text-honeydew-800"
        />
      </svg>
    </div>
  )
}