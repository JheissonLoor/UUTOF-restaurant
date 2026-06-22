import clsx from 'clsx';

import type { Mesa } from '@/types/api';

export type MesaFilter = 'todas' | 'ocupadas' | 'atencion' | 'libres';

interface FilterTabsProps {
  activeFilter: MesaFilter;
  mesas: Mesa[];
  onChange: (filter: MesaFilter) => void;
}

export function FilterTabs({ activeFilter, mesas, onChange }: FilterTabsProps): JSX.Element {
  const filters: Array<{ id: MesaFilter; label: string; count: number }> = [
    { id: 'todas', label: 'Todas', count: mesas.length },
    { id: 'ocupadas', label: 'Ocupadas', count: mesas.filter((mesa) => mesa.estado === 'ocupada').length },
    {
      id: 'atencion',
      label: 'Atencion',
      count: mesas.filter((mesa) => mesa.estado === 'lista' || (mesa.pedido_activo?.alerta ?? 0) > 0).length,
    },
    { id: 'libres', label: 'Libres', count: mesas.filter((mesa) => mesa.estado === 'libre').length },
  ];

  return (
    <nav className="scrollbar-none flex shrink-0 gap-1.5 overflow-x-auto px-4 py-3" aria-label="Filtrar mesas">
      {filters.map((filter) => {
        const active = filter.id === activeFilter;
        return (
          <button
            key={filter.id}
            type="button"
            aria-pressed={active}
            className={clsx(
              'inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-medium transition active:scale-[0.97]',
              active
                ? 'border-ink-900 bg-ink-900 text-white'
                : 'border-[rgba(31,26,20,0.16)] bg-white text-ink-700',
            )}
            onClick={() => onChange(filter.id)}
          >
            {filter.label}
            <span className={clsx(
              'rounded-full px-1.5 py-0.5 text-[10.5px] font-bold tnum',
              active ? 'bg-terracotta-500 text-white' : 'bg-cream-100 text-ink-900',
            )}>
              {filter.count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
