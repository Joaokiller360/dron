interface LayoutProps {
  style?: string;
  children: React.ReactNode;
}

export function Templets({ children, style }: LayoutProps) {
  return (
    <main className={`min-h-[calc(90vh-64px-96px)] w-full flex items-center justify-center px-6 py-28 ${style}`}>
      {children}
    </main>
  )
}

interface TitleProps {
  style?: string;
  children: React.ReactNode;
  title?: string
}

export function TitleProject({ children, style, title = '' }: TitleProps) {
  return (
    <div className="grid">
      <div className={`${style}`}>{title}</div>
      <div>
        {children}
      </div>
    </div>
  )
}