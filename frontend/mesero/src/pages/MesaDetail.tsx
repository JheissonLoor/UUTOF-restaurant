import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, MoreHorizontal, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { getErrorDetail } from '@/api/errors';
import { registrarPago } from '@/api/pagos';
import { entregarPedidoItem, getPedido, llamarCocina } from '@/api/pedidos';
import { DetailFooter } from '@/components/DetailFooter';
import { OrderCard } from '@/components/OrderCard';
import { OrderItem } from '@/components/OrderItem';
import { PaySuccess } from '@/components/PaySuccess';
import { QuickActions } from '@/components/QuickActions';
import { PaySheet } from '@/components/sheets/PaySheet';
import type { Mesa, MetodoPago, PedidoItem } from '@/types/api';

interface MesaDetailProps {
  mesa: Mesa;
  onBack: () => void;
  onAddDishes: () => void;
  onPaid: () => void;
}

const zoneLabels = {
  salon: 'Salon',
  terraza: 'Terraza',
  barra: 'Barra',
  privado: 'Privado',
} as const;

export function MesaDetail({ mesa, onBack, onAddDishes, onPaid }: MesaDetailProps): JSX.Element {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [showPaySuccess, setShowPaySuccess] = useState(false);
  const idPedido = mesa.pedido_activo?.id_pedido;

  const pedidoQuery = useQuery({
    queryKey: ['pedido', idPedido],
    queryFn: () => getPedido(idPedido as number),
    enabled: typeof idPedido === 'number',
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const deliveryMutation = useMutation({
    mutationFn: ({ idDetalle }: { idDetalle: number }) => entregarPedidoItem(idPedido as number, idDetalle),
    onSuccess: (pedido) => {
      queryClient.setQueryData(['pedido', idPedido], pedido);
      void queryClient.invalidateQueries({ queryKey: ['mesas', 'mesero'] });
      setToast('Plato marcado como entregado');
    },
    onError: (error) => {
      setToast(getErrorDetail(error, 'No se pudo marcar la entrega'));
    },
  });

  const callKitchenMutation = useMutation({
    mutationFn: () => llamarCocina(idPedido as number),
    onSuccess: () => setToast('Mensaje enviado a cocina'),
    onError: (error) => setToast(getErrorDetail(error, 'No se pudo contactar a cocina')),
  });

  const payMutation = useMutation({
    mutationFn: ({ metodo, propina, recibido }: { metodo: MetodoPago; propina: number; recibido?: number }) => {
      if (!pedidoQuery.data) throw new Error('Pedido no cargado');
      return registrarPago({
        id_pedido: pedidoQuery.data.id_pedido,
        metodo,
        monto: pedidoQuery.data.total,
        propina,
        recibido,
      });
    },
    onSuccess: () => {
      setIsPayOpen(false);
      setShowPaySuccess(true);
      void queryClient.invalidateQueries({ queryKey: ['mesas', 'mesero'] });
    },
    onError: (error) => setToast(getErrorDetail(error, 'No se pudo registrar el pago')),
  });

  const summary = useMemo(() => {
    const items = pedidoQuery.data?.items ?? [];
    return {
      platos: items.length,
      unidades: items.reduce((total, item) => total + item.qty, 0),
    };
  }, [pedidoQuery.data]);

  function handleDeliver(item: PedidoItem): void {
    deliveryMutation.mutate({ idDetalle: item.id_detalle });
  }

  const subtitle = `${mesa.zona ? zoneLabels[mesa.zona] : 'Sin zona'} - ${mesa.pedido_activo?.comensales ?? 0} comensales - ${mesa.pedido_activo?.minutos ?? 0} min`;
  const puedeCobrar = pedidoQuery.data?.estado === 'listo' || pedidoQuery.data?.estado === 'entregado';

  return (
    <main className="relative flex h-[100dvh] flex-col overflow-hidden bg-cream-50 text-ink-900" data-screen-label="02 Detalle">
      <header className="flex shrink-0 items-center gap-3 border-b border-[rgba(31,26,20,0.08)] bg-white px-4 pb-3 pt-[max(52px,env(safe-area-inset-top))]">
        <button type="button" aria-label="Volver a mesas" className="grid h-11 w-11 shrink-0 place-items-center rounded-[11px] bg-cream-50 text-ink-700" onClick={onBack}>
          <ArrowLeft aria-hidden="true" size={19} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-[22px] font-semibold leading-tight">Mesa {mesa.numero}</h1>
          <p className="truncate text-xs text-ink-500">{subtitle}</p>
        </div>
        <button type="button" disabled aria-label="Mas acciones" className="grid h-11 w-11 shrink-0 place-items-center rounded-[11px] bg-cream-50 text-ink-400 disabled:opacity-50">
          <MoreHorizontal aria-hidden="true" size={19} />
        </button>
      </header>

      <section className="scrollbar-none flex-1 overflow-y-auto px-4 pb-28 pt-3">
        {!idPedido ? (
          <div className="rounded-lg border border-wine-100 bg-white p-5 text-center text-sm text-wine-500">Esta mesa no tiene un pedido activo.</div>
        ) : null}

        {pedidoQuery.isLoading ? (
          <div className="space-y-3">
            <div className="h-[132px] animate-shimmer rounded-[18px] bg-[linear-gradient(90deg,#EADFCD_0%,#F4ECE0_48%,#EADFCD_100%)] bg-[length:200%_100%]" />
            <div className="h-[86px] animate-shimmer rounded-[14px] bg-[linear-gradient(90deg,#F4ECE0_0%,#FAF6F0_48%,#F4ECE0_100%)] bg-[length:200%_100%]" />
            <div className="h-[220px] animate-shimmer rounded-lg bg-[linear-gradient(90deg,#F4ECE0_0%,#FAF6F0_48%,#F4ECE0_100%)] bg-[length:200%_100%]" />
          </div>
        ) : null}

        {pedidoQuery.isError ? (
          <div className="rounded-lg border border-wine-100 bg-white p-5 text-center shadow-sm-soft">
            <RefreshCw aria-hidden="true" className="mx-auto text-wine-500" size={22} />
            <h2 className="mt-3 font-serif text-h2">No pudimos cargar el pedido</h2>
            <p className="mt-1 text-sm text-ink-500">{getErrorDetail(pedidoQuery.error, 'Reintenta la consulta.')}</p>
            <button type="button" className="mt-4 h-11 rounded-md bg-ink-900 px-5 text-sm font-semibold text-white" onClick={() => void pedidoQuery.refetch()}>Reintentar</button>
          </div>
        ) : null}

        {pedidoQuery.data ? (
          <div className="space-y-3.5">
            <OrderCard mesa={mesa} pedido={pedidoQuery.data} />
            <QuickActions
              onCallKitchen={() => callKitchenMutation.mutate()}
              isCallingKitchen={callKitchenMutation.isPending}
            />

            <div className="flex items-center justify-between gap-3 pt-1">
              <h2 className="font-serif text-[17px] font-semibold">Orden actual</h2>
              <span className="text-[11.5px] text-ink-500">{summary.platos} platos - {summary.unidades} unidades</span>
            </div>

            <section className="overflow-hidden rounded-lg border border-[rgba(31,26,20,0.08)] bg-white">
              {pedidoQuery.data.items.length > 0 ? pedidoQuery.data.items.map((item) => (
                <OrderItem
                  key={item.id_detalle}
                  item={item}
                  isDelivering={deliveryMutation.isPending && deliveryMutation.variables?.idDetalle === item.id_detalle}
                  onDeliver={handleDeliver}
                />
              )) : (
                <div className="px-5 py-8 text-center text-sm text-ink-500">La orden todavia no tiene platillos.</div>
              )}
            </section>
          </div>
        ) : null}
      </section>

      <DetailFooter onAddDishes={onAddDishes} onCharge={puedeCobrar ? () => setIsPayOpen(true) : undefined} />

      <PaySheet
        open={isPayOpen}
        pedido={pedidoQuery.data ?? null}
        isSubmitting={payMutation.isPending}
        onClose={() => setIsPayOpen(false)}
        onConfirm={(payload) => payMutation.mutate(payload)}
      />

      <PaySuccess open={showPaySuccess} onDone={onPaid} />

      <div className={`pointer-events-none absolute bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-ink-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg-soft transition ${toast ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`} role="status">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-sage-500"><Check aria-hidden="true" size={12} strokeWidth={3} /></span>
        {toast}
      </div>
    </main>
  );
}
