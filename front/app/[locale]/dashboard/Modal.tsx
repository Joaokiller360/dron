'use client'

import { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

/**
 * Dashboard modal shell: fixed overlay, click-outside / Esc to close, body
 * scroll locked while open. Pass the <form> (or any content) as children.
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  size = 'lg',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const width = { md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size];

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center p-4 overflow-y-auto bg-[rgba(4,12,8,.8)] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${width} my-8 rounded-[20px] border border-white/[.1] bg-jb-card text-jb-text shadow-[0_30px_80px_rgba(0,0,0,.55)] animate-jb-fade`}
      >
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-white/[.07] sm:px-7">
          <div className="flex items-center gap-3.5">
            {icon && (
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[rgba(52,209,122,.12)] text-jb-accent shrink-0">
                {icon}
              </div>
            )}
            <div>
              {subtitle && (
                <span className="font-mono text-[10.5px] tracking-[.16em] uppercase text-jb-mint">{subtitle}</span>
              )}
              <h2 className="m-0 text-lg font-bold text-white">{title}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-jb-soft hover:text-white hover:bg-white/[.08] transition shrink-0"
          >
            <X size={17} />
          </button>
        </div>
        <div className="px-6 py-6 sm:px-7">{children}</div>
      </div>
    </div>
  );
}
