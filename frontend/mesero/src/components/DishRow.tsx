import { Minus, Plus } from 'lucide-react';

import type { Platillo } from '@/types/api';

interface DishRowProps {
  platillo: Platillo;
  qty: number;
  onIncrement: (platillo: Platillo) => void;
  onDecrement: (idPlatillo: number) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value);
}

function initials(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function DishRow({ platillo, qty, onIncrement, onDecrement }: DishRowProps): JSX.Element {
  return (
    <article className="flex gap-3 border-b border-[rgba(31,26,20,0.08)] bg-white px-4 py-3 last:border-b-0">
      <div className="grid h-[68px] w-[68px] shrink-0 place-items-center overflow-hidden rounded-[14px] bg-cream-100 text-sm font-semibold text-terracotta-600">
        {platillo.imagen_url ? (
          <img src={platillo.imagen_url} alt="" className="h-full w-full object-cover" />
        ) : (
          initials(platillo.nombre)
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-ink-900">{platillo.nombre}</h3>
            <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-4 text-ink-500">
              Preparacion peruana de la casa, lista para enviar a cocina.
            </p>
          </div>
          <span className="shrink-0 font-serif text-[15px] font-semibold text-terracotta-600">
            {formatCurrency(platillo.precio)}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="rounded-full bg-cream-100 px-2 py-1 text-[10.5px] font-semibold text-ink-500">
            12-18 min
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={`Quitar ${platillo.nombre}`}
              disabled={qty === 0}
              className="grid h-11 w-11 place-items-center rounded-full border border-[rgba(31,26,20,0.12)] bg-white text-ink-700 disabled:opacity-35"
              onClick={() => onDecrement(platillo.id_platillo)}
            >
              <Minus aria-hidden="true" size={16} />
            </button>
            <span className="w-6 text-center text-sm font-semibold tnum">{qty}</span>
            <button
              type="button"
              aria-label={`Agregar ${platillo.nombre}`}
              disabled={!platillo.disponible}
              className="grid h-11 w-11 place-items-center rounded-full bg-terracotta-500 text-white shadow-md-soft disabled:opacity-35"
              onClick={() => onIncrement(platillo)}
            >
              <Plus aria-hidden="true" size={17} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
