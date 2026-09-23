'use client'

import { useState, type DragEvent } from 'react';

/**
 * Drag & drop reordering for list rows (HTML5 drag, desktop). Spread
 * `itemProps(id, index)` on each row and read `itemState` for the visuals;
 * `onMove` receives the dragged id and its new index.
 */
export function useDragSort(onMove: (id: string, toIndex: number) => void, enabled = true) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const reset = () => {
    setDragId(null);
    setOverIndex(null);
  };

  const itemProps = (id: string, index: number) =>
    enabled
      ? {
          draggable: true,
          onDragStart: (e: DragEvent) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', id);
            setDragId(id);
          },
          onDragOver: (e: DragEvent) => {
            if (!dragId) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (overIndex !== index) setOverIndex(index);
          },
          onDrop: (e: DragEvent) => {
            e.preventDefault();
            if (dragId && dragId !== id) onMove(dragId, index);
            reset();
          },
          onDragEnd: reset,
        }
      : {};

  const itemState = (id: string, index: number) => ({
    dragging: dragId === id,
    dropTarget: dragId !== null && dragId !== id && overIndex === index,
  });

  return { itemProps, itemState, enabled };
}
