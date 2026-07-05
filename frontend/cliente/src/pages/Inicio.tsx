import { useQuery } from '@tanstack/react-query';

import { getDishes } from '@/api/cliente';
import { ArrowIcon, BagIcon, CalendarIcon, MenuIcon, SparkIcon } from '@/components/icons';
import { formatCurrency, greeting } from '@/lib/format';
import type { AppTab, Dish } from '@/types';

export function Inicio({ onTabChange, onAddDish }: { onTabChange: (tab: AppTab) => void; onAddDish: (dish: Dish) => void }): JSX.Element {
  const dishesQuery = useQuery({ queryKey: ['cliente', 'dishes'], queryFn: getDishes });
  const featured = (dishesQuery.data ?? []).slice(0, 4);

  return (
    <div className="space-y-6" data-screen-label="02 Inicio">
      <section className="relative overflow-hidden rounded-2xl bg-ink-900 p-5 text-white shadow-soft">
        <div className="absolute right-[-46px] top-[-46px] h-36 w-36 rounded-full bg-coral/40 blur-2xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
            <span className="h-2 w-2 rounded-full bg-mint" />
            {greeting()}
          </span>
          <h1 className="mt-4 font-serif text-[34px] font-semibold leading-[1.04]">
            Hola, comensal
            <br />
            bienvenido a UTTOF
          </h1>
          <p className="mt-3 max-w-[280px] text-sm leading-6 text-white/68">Ordena directo a cocina, sigue tu pedido y paga al final cuando estés listo.</p>
          <div className="mt-5 flex gap-2">
            <button type="button" className="flex min-h-11 items-center gap-2 rounded-sm bg-coral px-4 text-sm font-semibold text-white" onClick={() => onTabChange('menu')}>
              <MenuIcon size={16} />
              Ver carta
            </button>
            <button type="button" className="flex min-h-11 items-center gap-2 rounded-sm bg-white/10 px-4 text-sm font-semibold text-white" onClick={() => onTabChange('reservar')}>
              <CalendarIcon size={16} />
              Reservar
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <button type="button" className="rounded-xl bg-cream-surface p-4 text-left shadow-soft" onClick={() => onTabChange('menu')}>
          <BagIcon className="text-coral-600" size={22} />
          <div className="mt-3 font-serif text-xl font-semibold">Pedido móvil</div>
          <p className="mt-1 text-xs text-ink-500">Va directo a cocina.</p>
        </button>
        <button type="button" className="rounded-xl bg-cream-surface p-4 text-left shadow-soft" onClick={() => onTabChange('pedidos')}>
          <SparkIcon className="text-mint-600" size={22} />
          <div className="mt-3 font-serif text-xl font-semibold">Tracking vivo</div>
          <p className="mt-1 text-xs text-ink-500">Recibido a servido.</p>
        </button>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold">Recomendados</h2>
            <p className="text-sm text-ink-500">Carta peruana en soles</p>
          </div>
          <button type="button" className="flex items-center gap-1 text-sm font-semibold text-coral-600" onClick={() => onTabChange('menu')}>
            Ver todo <ArrowIcon size={14} />
          </button>
        </div>
        <div className="scrollbar-none flex gap-3 overflow-x-auto pb-2">
          {featured.map((dish) => (
            <article key={dish.id_platillo} className="w-[210px] shrink-0 overflow-hidden rounded-xl bg-cream-surface shadow-soft">
              <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${dish.imagen_url})` }} />
              <div className="p-3">
                <h3 className="font-serif text-lg font-semibold leading-tight">{dish.nombre}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-serif text-lg font-bold text-coral-600">{formatCurrency(dish.precio)}</span>
                  <button type="button" className="min-h-10 rounded-sm bg-coral-50 px-3 text-xs font-semibold text-coral-600" onClick={() => onAddDish(dish)}>
                    Agregar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
