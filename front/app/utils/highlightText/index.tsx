import React from "react"

export type keywordLink = Record<string, string>

export function highlightText(
  text: string,
  keywords: string[] = ["JB.SKYLNES - DRON"],
  KeywordLink?: keywordLink
): React.ReactNode {
  const escaped = keywords.map(k =>
    k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  )

  const regex = new RegExp(`(${escaped.join("|")})`, "gi")

  return text.split(regex).map((part, index) => {
    const keyword = keywords.find(
      k => k.toLowerCase() === part.toLowerCase()
    )

    if (!keyword) return part

    const href = KeywordLink?.[keyword]

    return href ? (
      <a
        key={index}
        href={href}
        className="font-semibold underline text-honeydew-700"
      >
        {part}
      </a>
    ) : (
      <span
        key={index}
        className="font-semibold"
      >
        {part}
      </span>
    )
  })
}