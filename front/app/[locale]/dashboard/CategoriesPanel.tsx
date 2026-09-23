'use client'

import { useState, FormEvent } from 'react';
import { Tags, Plus, Check, X, Pencil } from 'lucide-react';
import { Category, CategoryType, CATEGORY_TYPES, errorMessage, reorder } from './lib/api';
import { useCollection } from './lib/useCollection';
import { Card, ConfirmDelete, ErrorNote, MoveButtons, PanelHeader, SkeletonList, btn, iconBtnCls, inputCls, useToast } from './ui';

const TYPE_LABELS: Record<CategoryType, { title: string; hint: string }> = {
  PROJECT: { title: 'Proyectos', hint: 'Filtros del portafolio' },
  CLIENT: { title: 'Clientes', hint: 'Grupos de /clients' },
  SERVICE: { title: 'Servicios', hint: 'Opcional para servicios simples' },
};

function Column({
  type,
  items,
  onCreate,
  onRename,
  onDelete,
  onMove,
}: {
  type: CategoryType;
  items: Category[];
  onCreate: (type: CategoryType, name: string) => Promise<boolean>;
  onRename: (c: Category, name: string) => Promise<boolean>;
  onDelete: (c: Category) => void;
  onMove: (type: CategoryType, id: string, dir: -1 | 1) => void;
}) {
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim() && (await onCreate(type, name.trim()))) setName('');
  };
  const saveEdit = async (e: FormEvent, c: Category) => {
    e.preventDefault();
    if (editName.trim() && (await onRename(c, editName.trim()))) setEditId(null);
  };

  return (
    <Card className="flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <h2 className="m-0 text-[15px] font-bold text-white">
          {TYPE_LABELS[type].title} <span className="ml-1 font-medium text-jb-muted">{items.length}</span>
        </h2>
        <p className="mt-0.5 mb-0 text-[12.5px] text-jb-muted">{TYPE_LABELS[type].hint}</p>
      </div>
      <ul className="flex-1 p-0 px-2 m-0 list-none">
        {items.map((c, i) => (
          <li key={c.id} className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/[.03]">
            {editId === c.id ? (
              <form onSubmit={(e) => saveEdit(e, c)} className="flex flex-1 gap-1">
                <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} aria-label="Nuevo nombre" className={`${inputCls} py-1.5`} />
                <button type="submit" aria-label="Guardar" className={iconBtnCls}>
                  <Check size={15} />
                </button>
                <button type="button" aria-label="Cancelar" onClick={() => setEditId(null)} className={iconBtnCls}>
                  <X size={15} />
                </button>
              </form>
            ) : (
              <>
                <span className="flex-1 text-[14px] text-jb-text truncate">{c.name}</span>
                <MoveButtons first={i === 0} last={i === items.length - 1} onUp={() => onMove(type, c.id, -1)} onDown={() => onMove(type, c.id, 1)} />
                <button
                  type="button"
                  title="Renombrar"
                  aria-label="Renombrar"
                  onClick={() => {
                    setEditId(c.id);
                    setEditName(c.name);
                  }}
                  className={iconBtnCls}
                >
                  <Pencil size={14} />
                </button>
                <ConfirmDelete onConfirm={() => onDelete(c)} />
              </>
            )}
          </li>
        ))}
        {items.length === 0 && <li className="px-2 py-3 text-[13px] text-jb-muted">Sin categorías.</li>}
      </ul>
      <form onSubmit={add} className="flex gap-2 p-3 mt-2 border-t border-white/[.07]">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nueva categoría" aria-label={`Nueva categoría de ${TYPE_LABELS[type].title}`} className={`${inputCls} py-2`} />
        <button type="submit" disabled={!name.trim()} className={`${btn.primary} px-3`} aria-label="Crear">
          <Plus size={16} />
        </button>
      </form>
    </Card>
  );
}

export default function CategoriesPanel() {
  const toast = useToast();
  const { items, setItems, loading, error, create, update, remove } = useCollection<Category>('/categories', {
    live: 'categories',
  });

  const byType = (type: CategoryType) => items.filter((c) => c.type === type).sort((a, b) => a.sortOrder - b.sortOrder);

  const onCreate = async (type: CategoryType, name: string) => {
    try {
      await create({ type, name });
      toast.success('Categoría creada');
      return true;
    } catch (err) {
      toast.error(errorMessage(err, 'No se pudo crear la categoría.'));
      return false;
    }
  };
  const onRename = async (c: Category, name: string) => {
    try {
      await update(c.id, { name });
      toast.success('Categoría renombrada');
      return true;
    } catch (err) {
      toast.error(errorMessage(err, 'No se pudo renombrar.'));
      return false;
    }
  };
  const onDelete = async (c: Category) => {
    try {
      await remove(c.id);
      toast.success('Categoría eliminada');
    } catch (err) {
      toast.error(errorMessage(err, 'No se pudo eliminar: puede que tenga elementos asignados.'));
    }
  };
  // Reorders within one type; sortOrder is only compared between same-type categories
  const onMove = async (type: CategoryType, id: string, dir: -1 | 1) => {
    const list = byType(type);
    const i = list.findIndex((c) => c.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    const previous = items;
    const order = new Map(list.map((c, k) => [c.id, k]));
    setItems(items.map((c) => (order.has(c.id) ? { ...c, sortOrder: order.get(c.id)! } : c)));
    try {
      await reorder('categories', list.map((c) => c.id));
    } catch (err) {
      setItems(previous);
      toast.error(errorMessage(err, 'No se pudo reordenar.'));
    }
  };

  return (
    <div>
      <PanelHeader
        title="Categorías"
        count={items.length}
        subtitle="Agrupan proyectos, clientes y servicios. También puedes crearlas desde cada formulario."
      />
      {error && <ErrorNote>{error}</ErrorNote>}
      {loading ? (
        <SkeletonList rows={3} />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {CATEGORY_TYPES.map((type) => (
            <Column key={type} type={type} items={byType(type)} onCreate={onCreate} onRename={onRename} onDelete={onDelete} onMove={onMove} />
          ))}
        </div>
      )}
      {!loading && items.length === 0 && (
        <p className="mt-4 text-[13px] text-jb-muted inline-flex items-center gap-2">
          <Tags size={14} /> Crea al menos una categoría antes de añadir proyectos o clientes.
        </p>
      )}
    </div>
  );
}
