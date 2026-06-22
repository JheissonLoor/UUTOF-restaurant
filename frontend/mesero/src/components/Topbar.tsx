import { Search } from 'lucide-react';
import { useMemo } from 'react';

import type { Mesa } from '@/types/api';

interface TopbarProps {
  meseroNombre: string;
  mesas: Mesa[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

function displayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Mesero';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0]}.`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function Topbar({ meseroNombre, mesas, searchTerm, onSearchChange }: TopbarProps): JSX.Element {
  const stats = useMemo(() => {
    const ventas = mesas.reduce((total, mesa) => total + (mesa.pedido_activo?.total ?? 0), 0);
    const activas = mesas.filter((mesa) => mesa.estado !== 'libre').length;
    const comensales = mesas.reduce((total, mesa) => total + (mesa.pedido_activo?.comensales ?? 0), 0);
    return { ventas, activas, comensales };
  }, [mesas]);

  return (
    <header className="shrink-0 border-b border-[rgba(31,26,20,0.08)] bg-white px-5 pb-3 pt-[max(52px,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-500">Buenas tardes</div>
          <div className="truncate font-serif text-[22px] font-medium leading-tight text-ink-900">{displayName(meseroNombre)}</div>
        </div>
        <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1.5 text-[11.5px] font-semibold text-sage-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage-500" />
          Turno · 4h 12m
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-md border border-[rgba(31,26,20,0.08)] bg-cream-50 px-3 py-2.5">
          <div className="truncate font-serif text-[19px] font-medium leading-none text-ink-900 tnum">{formatCurrency(stats.ventas)}</div>
          <div className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.02em] text-ink-500">Ventas turno</div>
        </div>
        <div className="rounded-md border border-[rgba(31,26,20,0.08)] bg-cream-50 px-3 py-2.5">
          <div className="font-serif text-[19px] font-medium leading-none text-ink-900 tnum">
            {stats.activas}<span className="ml-1 text-[13px] text-ink-400">/{mesas.length}</span>
          </div>
          <div className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.02em] text-ink-500">Mesas</div>
        </div>
        <div className="rounded-md border border-[rgba(31,26,20,0.08)] bg-cream-50 px-3 py-2.5">
          <div className="font-serif text-[19px] font-medium leading-none text-ink-900 tnum">{stats.comensales}</div>
          <div className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.02em] text-ink-500">Comensales</div>
        </div>
      </div>

      <div className="relative mt-3">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={16} strokeWidth={1.8} />
        <input
          type="search"
          value={searchTerm}
          aria-label="Buscar mesa, orden o cuenta"
          placeholder="Buscar mesa, orden o cuenta..."
          className="h-11 w-full rounded-[11px] border border-[rgba(31,26,20,0.16)] bg-white pl-10 pr-3.5 text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
    </header>
  );
}
