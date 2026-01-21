'use client'

export default function About() {
  return (
    <>
      <div className="bg-honeydew-900 dark:bg-honeydew-800 py-8 sm:py-16 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid space-y-4 text-center mb-10">
            <span className="text-2xl sm:text-4xl font-mono font-bold sm:my-1 gradient-text uppercase">
              Un poco de nosotros
            </span>
          </div>

          <div className="bg-honeydew-800 dark:bg-honeydew-900 rounded-2xl p-6 sm:p-14 shadow-lg text-sm sm:text-2xl sm:text-justify text-justify">
            <span>
              JB SkyLens es una operadora de drones independiente en Ecuador 🇪🇨, especializada en contenido aéreo profesional. Con más de 50 proyectos realizados, ofrezco tomas dinámicas y de alta calidad para eventos, producciones, inspecciones y promoción turística.
            </span>
            <br /><br />
            <span>
              Ideal para operar con precisión en espacios urbanos, costeros y portuarios. Mi enfoque combina seguridad, creatividad y rapidez en la entrega, adaptándome a las necesidades de cada cliente.
            </span>
            <br /><br />
            <span>
              JB SkyLens sigue creciendo, incorporando nuevas tecnologías y ampliando servicios para brindar soluciones aéreas innovadoras en todo tipo de proyectos.
            </span>
          </div>
        </div>
      </div>
    </>
  )
}