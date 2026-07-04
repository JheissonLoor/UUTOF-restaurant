import clsx from 'clsx';

import type { Categoria } from '@/types/api';

interface CategoryTabsProps {
  categorias: Categoria[];
  activeId: number | null;
  onChange: (id: number | null) => void;
}

export function CategoryTabs({ categorias, activeId, onChange }: CategoryTabsProps): JSX.Element {
  return (
    <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 py-3" role="tablist" aria-label="Categorias">
      <button
        type="button"
        role="tab"
        aria-selected={activeId === null}
        className={clsx(
          'h-10 shrink-0 rounded-full px-4 text-xs font-semibold transition',
          activeId === null ? 'bg-ink-900 text-white shadow-md-soft' : 'bg-white text-ink-500',
        )}
        onClick={() => onChange(null)}
      >
        Todos
      </button>
      {categorias.map((categoria) => (
        <button
          key={categoria.id_categoria}
          type="button"
          role="tab"
          aria-selected={activeId === categoria.id_categoria}
          className={clsx(
            'h-10 shrink-0 rounded-full px-4 text-xs font-semibold transition',
            activeId === categoria.id_categoria ? 'bg-ink-900 text-white shadow-md-soft' : 'bg-white text-ink-500',
          )}
          onClick={() => onChange(categoria.id_categoria)}
        >
          {categoria.nombre}
        </button>
      ))}
    </div>
  );
}
