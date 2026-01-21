

interface logo {
  name?: string
  href?: string
  style?: string
  imgName?: string
}

export function Logo({ href = '', name = '', style = '', imgName = '' }: logo) {
  return (
    <>
      <a href={href} className="flex items-center">
        <img src={`https://res.cloudinary.com/dzlavqhid/image/upload/${imgName}.png`} className={style} alt={name} />
        <span className="self-center text-2xl font-semibold uppercase text-heading whitespace-nowrap">{name}</span>
      </a>
    </>
  )
}
