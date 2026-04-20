'use client'

import React, { JSX, useEffect, useState } from 'react'

export default function Year(): JSX.Element {
  // mostramos el "año actual" (por ejemplo si es 2026 mostramos 2026)
  const [year, setYear] = useState<number>(() => new Date().getFullYear())

  useEffect(() => {
    // calcular ms hasta el inicio del próximo año (1 de enero, 00:00:00)
    const now = new Date()
    const startNextYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0)
    const msUntilNextYear = startNextYear.getTime() - now.getTime()

    // cuando llegue el inicio del nuevo año actualizamos el año mostrado
    const timer = setTimeout(() => {
      setYear(new Date().getFullYear())
      // no es necesario reprogramar aquí; el efecto se ejecuta de nuevo al volver a montar
    }, msUntilNextYear + 1000) // pequeño buffer de 1s

    return () => clearTimeout(timer)
  }, [])

  return <span>{year}</span>
}