import React from "react"

export function highlightText(
  text: string,
  keywords: string[] = ["JB.SKYLNES - DRON"]
): React.ReactNode {
  const escaped = keywords.map(k =>
    k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  )

  const regex = new RegExp(`(${escaped.join("|")})`, "gi")

  return text.split(regex).map((part, index) =>
    keywords.some(
      keyword => keyword.toLowerCase() === part.toLowerCase()
    ) ? (
      <span
        key={index}
        className="font-semibold text-primary"
      >
        {part}
      </span>
    ) : (
      part
    )
  )
}