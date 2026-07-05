import { ClockIcon, HeartIcon, MinusIcon, PlusIcon } from '@/components/icons';
import { formatCurrency } from '@/lib/format';
import type { Dish } from '@/types';

interface DishCardProps {
  dish: Dish;
  qty: number;
  onAdd: (dish: Dish) => void;
  onRemove: (idPlatillo: number) => void;
}

export function DishCard({ dish, qty, onAdd, onRemove }: DishCardProps): JSX.Element {
  return (
    <article className="overflow-hidden rounded-xl border border-[rgba(31,26,20,0.08)] bg-cream-surface shadow-soft">
      <div className="relative h-36 bg-cover bg-center" style={{ backgroundImage: `url(${dish.imagen_url})` }}>
        <button type="button" className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-cream-surface/90 text-coral-600 shadow-soft" aria-label="Favorito">
          <HeartIcon filled={false} size={17} />
        </button>
        {!dish.disponible ? <span className="absolute left-3 top-3 rounded-full bg-ink-900 px-3 py-1 text-xs font-bold text-white">Agotado</span> : null}
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-[19px] font-semibold leading-tight text-ink-900">{dish.nombre}</h3>
            <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-ink-500">{dish.descripcion}</p>
          </div>
          <span className="shrink-0 font-serif text-[18px] font-bold text-coral-600">{formatCurrency(dish.precio)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="flex items-center gap-1 text-xs font-semibold text-ink-400">
            <ClockIcon size={13} />
            {dish.tiempo_prep} min
          </span>
          {qty > 0 ? (
            <div className="flex items-center gap-2">
              <button type="button" className="grid h-11 w-11 place-items-center rounded-sm bg-cream-bg2 text-ink-700" onClick={() => onRemove(dish.id_platillo)}>
                <MinusIcon size={15} />
              </button>
              <span className="w-5 text-center font-mono text-sm font-bold tnum">{qty}</span>
              <button type="button" className="grid h-11 w-11 place-items-center rounded-sm bg-coral text-white" onClick={() => onAdd(dish)}>
                <PlusIcon size={15} />
              </button>
            </div>
          ) : (
            <button type="button" disabled={!dish.disponible} className="flex min-h-11 items-center gap-2 rounded-sm bg-coral px-4 text-sm font-semibold text-white disabled:bg-ink-400" onClick={() => onAdd(dish)}>
              <PlusIcon size={15} />
              Agregar
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
