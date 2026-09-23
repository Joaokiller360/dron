'use client'

import { useState, type DragEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { iconBtnCls } from './ui';

/**
 * Bento grid of cards whose order is the order on the site. The first item is
 * the featured, larger card. On desktop cards are dragged to a new position;
 * every card also has previous/next buttons (touch screens, keyboard).
 */
export default function BentoGrid<T extends { id: string }>({
  items,
  onMove,
  reorderable = true,
  renderCard,
}: {
  items: T[];
  /** Move an item to a new index (0-based) */
  onMove: (id: string, toIndex: number) => void;
  /** false while the list is filtered: positions would be ambiguous */
  reorderable?: boolean;
  renderCard: (item: T, ctx: CardContext) => ReactNode;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const reset = () => {
    setDragId(null);
    setOverIndex(null);
  };

  return (
    <ul className="grid grid-cols-1 min-[520px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 [grid-auto-flow:dense] gap-3 p-0 m-0 list-none">
      {items.map((item, index) => {
        const featured = reorderable && index === 0 && items.length > 2;
        const dragging = dragId === item.id;
        const target = overIndex === index && dragId !== null && !dragging;
        const drag = reorderable
          ? {
              draggable: true,
              onDragStart: (e: DragEvent) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', item.id);
                setDragId(item.id);
              },
              onDragOver: (e: DragEvent) => {
                if (!dragId) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (overIndex !== index) setOverIndex(index);
              },
              onDrop: (e: DragEvent) => {
                e.preventDefault();
                if (dragId && dragId !== item.id) onMove(dragId, index);
                reset();
              },
              onDragEnd: reset,
            }
          : {};
        return (
          <li
            key={item.id}
            {...drag}
            className={`relative min-w-0 rounded-2xl transition ${featured ? 'min-[520px]:col-span-2 min-[520px]:row-span-2' : ''} ${
              dragging ? 'opacity-40' : ''
            } ${target ? 'ring-2 ring-jb-accent ring-offset-2 ring-offset-jb-bg' : ''}`}
          >
            {renderCard(item, {
              index,
              featured,
              reorderable,
              first: index === 0,
              last: index === items.length - 1,
              onPrev: () => onMove(item.id, index - 1),
              onNext: () => onMove(item.id, index + 1),
            })}
          </li>
        );
      })}
    </ul>
  );
}

export interface CardContext {
  index: number;
  featured: boolean;
  reorderable: boolean;
  first: boolean;
  last: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/** Card shell: cover on top (click opens), position badge, title, meta and actions */
export function BentoCard({
  ctx,
  cover,
  title,
  meta,
  pills,
  actions,
  dimmed,
  onOpen,
}: {
  ctx: CardContext;
  cover: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  pills?: ReactNode;
  actions: ReactNode;
  dimmed?: boolean;
  onOpen: () => void;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden border rounded-2xl border-white/[.08] bg-jb-card transition hover:border-white/[.18]">
      <div className={`relative overflow-hidden bg-jb-well ${ctx.featured ? 'aspect-[16/10] min-[520px]:aspect-auto min-[520px]:flex-1 min-[520px]:min-h-[220px]' : 'aspect-[16/10]'}`}>
        <button type="button" onClick={onOpen} aria-label="Editar" className={`absolute inset-0 w-full h-full p-0 border-0 cursor-pointer ${dimmed ? 'opacity-50' : ''}`}>
          {cover}
        </button>
        {ctx.reorderable && (
          <>
            <span className="absolute top-2 left-2 pointer-events-none inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm font-mono text-[11px] font-semibold text-white">
              #{ctx.index + 1}
              {ctx.featured && <span className="text-jb-mint">· Destacado</span>}
            </span>
            <span
              title="Arrastra para cambiar el orden"
              className="absolute top-2 right-2 hidden [@media(pointer:fine)]:inline-flex items-center justify-center w-7 h-7 rounded-md bg-black/60 backdrop-blur-sm text-white/80 cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={15} />
            </span>
          </>
        )}
      </div>
      <div className={`flex flex-col gap-2 px-3.5 pt-3 pb-2.5 ${dimmed ? '[&>button]:opacity-60' : ''}`}>
        <button type="button" onClick={onOpen} className="p-0 text-left bg-transparent border-0 cursor-pointer min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className={`font-semibold text-white truncate max-w-full ${ctx.featured ? 'text-[16px]' : 'text-[14.5px]'}`}>{title}</span>
            {pills}
          </span>
          {meta && <span className="block mt-0.5 text-[12.5px] text-jb-muted truncate">{meta}</span>}
        </button>
        <div className="flex items-center justify-between gap-1 pt-2 border-t border-white/[.06]">
          {ctx.reorderable ? (
            <span className="inline-flex">
              <button type="button" title="Mover antes" aria-label="Mover antes" disabled={ctx.first} onClick={ctx.onPrev} className={iconBtnCls}>
                <ChevronLeft size={16} />
              </button>
              <button type="button" title="Mover después" aria-label="Mover después" disabled={ctx.last} onClick={ctx.onNext} className={iconBtnCls}>
                <ChevronRight size={16} />
              </button>
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-center justify-end gap-0.5">{actions}</span>
        </div>
      </div>
    </div>
  );
}
