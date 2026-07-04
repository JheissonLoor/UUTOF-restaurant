import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, RefreshCw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { getErrorDetail } from '@/api/errors';
import { getCategorias, getPlatillos } from '@/api/menu';
import { addPedidoItems } from '@/api/pedidos';
import { CategoryTabs } from '@/components/CategoryTabs';
import { DishRow } from '@/components/DishRow';
import { FloatingCart } from '@/components/FloatingCart';
import type { Mesa, Platillo } from '@/types/api';

interface AddDishesProps {
  mesa: Mesa;
  idPedido: number;
  onBack: () => void;
  onDone: () => void;
}

interface CartItem {
  platillo: Platillo;
  qty: number;
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase('es-PE');
}

export function AddDishes({ mesa, idPedido, onBack, onDone }: AddDishesProps): JSX.Element {
  const queryClient = useQueryClient();
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<Record<number, CartItem>>({});
  const [toast, setToast] = useState<string | null>(null);

  const categoriasQuery = useQuery({
    queryKey: ['menu', 'categorias'],
    queryFn: getCategorias,
  });

  const platillosQuery = useQuery({
    queryKey: ['menu', 'platillos', categoriaId],
    queryFn: () => getPlatillos(categoriaId ?? undefined),
  });

  const submitMutation = useMutation({
    mutationFn: () => addPedidoItems(
      idPedido,
      Object.values(cart).map((item) => ({
        id_platillo: item.platillo.id_platillo,
        qty: item.qty,
      })),
    ),
    onSuccess: (pedido) => {
      queryClient.setQueryData(['pedido', idPedido], pedido);
      void queryClient.invalidateQueries({ queryKey: ['mesas', 'mesero'] });
      setToast('Pedido enviado a cocina');
      window.setTimeout(onDone, 650);
    },
    onError: (error) => setToast(getErrorDetail(error, 'No se pudo enviar a cocina')),
  });

  const platillos = platillosQuery.data?.data ?? [];
  const visiblePlatillos = useMemo(() => {
    const search = normalizeSearch(searchTerm);
    return platillos.filter((platillo) => search === '' || platillo.nombre.toLocaleLowerCase('es-PE').includes(search));
  }, [platillos, searchTerm]);

  const totals = useMemo(() => Object.values(cart).reduce(
    (acc, item) => ({
      count: acc.count + item.qty,
      total: acc.total + item.qty * item.platillo.precio,
    }),
    { count: 0, total: 0 },
  ), [cart]);

  function increment(platillo: Platillo): void {
    setCart((current) => {
      const previous = current[platillo.id_platillo];
      return {
        ...current,
        [platillo.id_platillo]: {
          platillo,
          qty: previous ? previous.qty + 1 : 1,
        },
      };
    });
  }

  function decrement(idPlatillo: number): void {
    setCart((current) => {
      const previous = current[idPlatillo];
      if (!previous) return current;
      if (previous.qty <= 1) {
        const next = { ...current };
        delete next[idPlatillo];
        return next;
      }
      return {
        ...current,
        [idPlatillo]: { ...previous, qty: previous.qty - 1 },
      };
    });
  }

  return (
    <main className="relative flex h-[100dvh] flex-col overflow-hidden bg-cream-50 text-ink-900" data-screen-label="03 Agregar platillos">
      <header className="shrink-0 border-b border-[rgba(31,26,20,0.08)] bg-white px-4 pb-3 pt-[max(52px,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Volver al detalle" className="grid h-11 w-11 shrink-0 place-items-center rounded-[11px] bg-cream-50 text-ink-700" onClick={onBack}>
            <ArrowLeft aria-hidden="true" size={19} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-[22px] font-semibold leading-tight">Agregar platillos</h1>
            <p className="truncate text-xs text-ink-500">Mesa {mesa.numero} - Pedido #{idPedido}</p>
          </div>
        </div>
        <label className="mt-3 flex h-11 items-center gap-2 rounded-[14px] bg-cream-50 px-3 text-ink-500">
          <Search aria-hidden="true" size={17} />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar platillo"
            className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-ink-900 placeholder:text-ink-400 focus:ring-0"
          />
        </label>
      </header>

      <CategoryTabs categorias={categoriasQuery.data ?? []} activeId={categoriaId} onChange={setCategoriaId} />

      <section className="scrollbar-none flex-1 overflow-y-auto px-4 pb-28">
        {platillosQuery.isLoading ? (
          <div className="overflow-hidden rounded-lg bg-white">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-[94px] animate-shimmer border-b border-cream-100 bg-[linear-gradient(90deg,#F4ECE0_0%,#FAF6F0_48%,#F4ECE0_100%)] bg-[length:200%_100%]" />
            ))}
          </div>
        ) : null}

        {platillosQuery.isError ? (
          <div className="rounded-lg border border-wine-100 bg-white p-5 text-center shadow-sm-soft">
            <RefreshCw aria-hidden="true" className="mx-auto text-wine-500" size={22} />
            <h2 className="mt-3 font-serif text-h2">No pudimos cargar el menu</h2>
            <p className="mt-1 text-sm text-ink-500">{getErrorDetail(platillosQuery.error, 'Reintenta la consulta.')}</p>
            <button type="button" className="mt-4 h-11 rounded-md bg-ink-900 px-5 text-sm font-semibold text-white" onClick={() => void platillosQuery.refetch()}>Reintentar</button>
          </div>
        ) : null}

        {platillosQuery.isSuccess && visiblePlatillos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[rgba(31,26,20,0.16)] bg-white px-6 py-10 text-center">
            <h2 className="font-serif text-h2">Sin platillos</h2>
            <p className="mt-1 text-sm text-ink-500">No hay resultados para esta categoria o busqueda.</p>
          </div>
        ) : null}

        {visiblePlatillos.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-[rgba(31,26,20,0.08)] bg-white shadow-sm-soft">
            {visiblePlatillos.map((platillo) => (
              <DishRow
                key={platillo.id_platillo}
                platillo={platillo}
                qty={cart[platillo.id_platillo]?.qty ?? 0}
                onIncrement={increment}
                onDecrement={decrement}
              />
            ))}
          </div>
        ) : null}
      </section>

      <FloatingCart
        count={totals.count}
        total={totals.total}
        isSubmitting={submitMutation.isPending}
        onSubmit={() => submitMutation.mutate()}
      />

      <div className={`pointer-events-none absolute bottom-24 left-1/2 z-40 flex -translate-x-1/2 whitespace-nowrap rounded-full bg-ink-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg-soft transition ${toast ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`} role="status">
        {toast}
      </div>
    </main>
  );
}
