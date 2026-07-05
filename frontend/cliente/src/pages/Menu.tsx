import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getDishes } from '@/api/cliente';
import { DishCard } from '@/components/DishCard';
import { BagIcon, SearchIcon } from '@/components/icons';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import type { Dish } from '@/types';

interface CartLike {
  items: Array<{ id_platillo: number; qty: number }>;
  count: number;
  addDish: (dish: Dish) => void;
  removeDish: (idPlatillo: number) => void;
}

export function MenuPage({ cart, onOpenCart }: { cart: CartLike; onOpenCart: () => void }): JSX.Element {
  const [category, setCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const dishesQuery = useQuery({ queryKey: ['cliente', 'dishes'], queryFn: getDishes });

  const dishes = useMemo(() => dishesQuery.data ?? [], [dishesQuery.data]);
  const categories = useMemo(() => ['Todos', ...Array.from(new Set(dishes.map((dish) => dish.categoria)))], [dishes]);
  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return dishes.filter((dish) => {
      const matchesCategory = category === 'Todos' || dish.categoria === category;
      const matchesSearch = normalized === '' || `${dish.nombre} ${dish.descripcion}`.toLowerCase().includes(normalized);
      return matchesCategory && matchesSearch;
    });
  }, [category, dishes, search]);

  return (
    <div className="space-y-5" data-screen-label="04 Menu">
      <section>
        <h1 className="font-serif text-[32px] font-semibold leading-tight">Carta</h1>
        <p className="mt-1 text-sm text-ink-500">Elige platos y envíalos directo a cocina.</p>
      </section>

      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" size={17} />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar ceviche, lomo, bebidas..." className="h-12 w-full rounded-lg border border-[rgba(31,26,20,0.1)] bg-cream-surface pl-11 pr-4 text-sm shadow-soft focus:border-coral focus:ring-coral-50" />
      </div>

      <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button key={item} type="button" className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold ${category === item ? 'border-coral bg-coral text-white' : 'border-[rgba(31,26,20,0.08)] bg-cream-surface text-ink-500'}`} onClick={() => setCategory(item)}>
            {item}
          </button>
        ))}
      </div>

      {dishesQuery.isLoading ? (
        <div className="grid gap-4">
          {[0, 1, 2].map((item) => <CardSkeleton key={item} />)}
        </div>
      ) : null}

      {dishesQuery.isError ? <ErrorState message="No se pudo cargar la carta." onRetry={() => void dishesQuery.refetch()} /> : null}

      {!dishesQuery.isLoading && !dishesQuery.isError ? (
        <div className="grid gap-4">
          {filtered.map((dish) => {
            const qty = cart.items.find((item) => item.id_platillo === dish.id_platillo)?.qty ?? 0;
            return <DishCard key={dish.id_platillo} dish={dish} qty={qty} onAdd={cart.addDish} onRemove={cart.removeDish} />;
          })}
        </div>
      ) : null}

      {cart.count > 0 ? (
        <button type="button" className="fixed bottom-24 left-1/2 z-40 flex min-h-12 w-[calc(100%-2rem)] max-w-[408px] -translate-x-1/2 items-center justify-center gap-2 rounded-md bg-coral px-4 text-sm font-semibold text-white shadow-[0_12px_34px_-14px_rgba(233,75,51,0.9)]" onClick={onOpenCart}>
          <BagIcon size={17} />
          Ver pedido ({cart.count})
        </button>
      ) : null}
    </div>
  );
}
