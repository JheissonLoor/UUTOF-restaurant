import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getMisPedidos } from '@/api/cliente';
import { getErrorDetail } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { BagIcon, ClockIcon } from '@/components/icons';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatLimaDateTime, formatOrderFolio } from '@/lib/format';
import type { PedidoEstado } from '@/types';

type PedidoFilter = 'todos' | 'activos' | 'historial';

const activeStates = new Set<PedidoEstado>(['creado', 'en_cocina', 'listo', 'entregado']);

const statusPresentation: Record<PedidoEstado, { label: string; className: string }> = {
  creado: { label: 'Recibido', className: 'bg-sun-50 text-sun-600' },
  en_cocina: { label: 'En cocina', className: 'bg-coral-50 text-coral-600' },
  listo: { label: 'Listo', className: 'bg-mint-50 text-mint-600' },
  entregado: { label: 'Servido', className: 'bg-mint-50 text-mint-600' },
  pagado: { label: 'Pagado', className: 'bg-cream-bg2 text-ink-500' },
  cancelado: { label: 'Cancelado', className: 'bg-coral-50 text-coral-600' },
};

export function Pedidos({ onOpenMenu, onTrack }: { onOpenMenu: () => void; onTrack: (idPedido: number) => void }): JSX.Element {
  const { user, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<PedidoFilter>('todos');
  const pedidosQuery = useQuery({
    queryKey: ['cliente', 'pedidos', 'mios', user?.id_usuario],
    queryFn: getMisPedidos,
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });

  const pedidos = useMemo(() => {
    const all = pedidosQuery.data ?? [];
    if (filter === 'activos') return all.filter((pedido) => activeStates.has(pedido.estado));
    if (filter === 'historial') return all.filter((pedido) => !activeStates.has(pedido.estado));
    return all;
  }, [filter, pedidosQuery.data]);

  return (
    <div className="space-y-5" data-screen-label="06 Pedidos">
      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-[32px] font-semibold leading-tight">Mis pedidos</h1>
            <p className="mt-1 text-sm text-ink-500">Sigue tus pedidos en tiempo real y consulta tu historial.</p>
          </div>
          {pedidosQuery.isFetching && !pedidosQuery.isLoading ? <span className="pb-1 text-xs text-ink-400">Actualizando...</span> : null}
        </div>
      </section>

      <div className="flex gap-2">
        {(['todos', 'activos', 'historial'] as const).map((item) => (
          <button key={item} type="button" className={`min-h-11 rounded-full px-4 text-sm font-semibold capitalize ${filter === item ? 'bg-coral text-white' : 'bg-cream-surface text-ink-500'}`} onClick={() => setFilter(item)}>
            {item}
          </button>
        ))}
      </div>

      {pedidosQuery.isLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : null}

      {pedidosQuery.isError ? (
        <ErrorState
          message={getErrorDetail(pedidosQuery.error, 'No se pudieron cargar tus pedidos.')}
          onRetry={() => void pedidosQuery.refetch()}
        />
      ) : null}

      {!pedidosQuery.isLoading && !pedidosQuery.isError && pedidos.length > 0 ? (
        <div className="space-y-3">
          {pedidos.map((pedido) => {
            const status = statusPresentation[pedido.estado];
            const isActive = activeStates.has(pedido.estado);
            const itemCount = pedido.items.reduce((total, item) => total + item.qty, 0);
            return (
              <article key={pedido.id_pedido} className="rounded-xl border border-[rgba(31,26,20,0.08)] bg-cream-surface p-4 shadow-soft">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-coral-50 text-coral-600">
                    <BagIcon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-xl font-semibold">{formatOrderFolio(pedido.id_pedido)}</h2>
                    <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                      <ClockIcon size={12} />
                      {formatLimaDateTime(pedido.creado_en)} · Mesa {pedido.id_mesa}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[rgba(31,26,20,0.08)] pt-3 text-sm">
                  <span className="text-ink-500">
                    {itemCount} {itemCount === 1 ? 'plato' : 'platos'}
                  </span>
                  <span className="font-serif text-xl font-semibold text-ink-900">{formatCurrency(pedido.total)}</span>
                </div>

                <button type="button" className={`mt-3 min-h-11 w-full rounded-sm px-4 text-sm font-semibold ${isActive ? 'bg-coral text-white' : 'bg-cream-bg2 text-ink-700'}`} onClick={() => onTrack(pedido.id_pedido)}>
                  {isActive ? 'Seguir en vivo' : 'Ver detalle'}
                </button>
              </article>
            );
          })}
        </div>
      ) : null}

      {!pedidosQuery.isLoading && !pedidosQuery.isError && pedidos.length === 0 ? (
        <EmptyState
          title={filter === 'historial' ? 'Historial vacio' : filter === 'activos' ? 'No hay pedidos activos' : 'Aun no tienes pedidos'}
          body={filter === 'historial' ? 'Tus pedidos pagados apareceran aqui.' : 'Cuando envies un pedido aparecera aqui con su seguimiento y cuenta.'}
          action={<button type="button" className="min-h-11 rounded-sm bg-coral px-4 text-sm font-semibold text-white" onClick={onOpenMenu}>Ver carta</button>}
        />
      ) : null}
    </div>
  );
}
