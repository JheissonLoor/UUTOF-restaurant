import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, ChefHat, CheckCircle2, Utensils, Receipt, ShoppingBag, Radio } from 'lucide-react';

import { getPedido } from '@/api/pedidos';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useOrder } from '@/order/useOrder';
import { useWebSocket } from '@/realtime/useWebSocket';
import { Checkout } from '@/components/Checkout';
import { ErrorState } from '@/components/ErrorState';
import type { PedidoEstado } from '@/types';

const steps: Array<{ estado: PedidoEstado; label: string; icon: typeof Clock }> = [
  { estado: 'creado', label: 'Recibido', icon: Clock },
  { estado: 'en_cocina', label: 'En cocina', icon: ChefHat },
  { estado: 'listo', label: 'Listo', icon: CheckCircle2 },
  { estado: 'entregado', label: 'Entregado', icon: Utensils },
  { estado: 'pagado', label: 'Pagado', icon: Receipt },
];

const orderIndex: Record<PedidoEstado, number> = {
  creado: 0,
  en_cocina: 1,
  listo: 2,
  entregado: 3,
  pagado: 4,
  cancelado: -1,
};

export default function OrdersPage() {
  const { activePedidoId, setActivePedidoId, clearMesa } = useOrder();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const {
    data: pedido,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['pedido', activePedidoId],
    queryFn: () => getPedido(activePedidoId as number),
    enabled: activePedidoId !== null,
    // El WebSocket es la vía principal en vivo; el polling queda como respaldo.
    refetchInterval: (query) => {
      const estado = query.state.data?.estado;
      return estado === 'pagado' || estado === 'cancelado' ? false : 30000;
    },
  });

  const estado = pedido?.estado;
  const enVivo = activePedidoId !== null && estado !== 'pagado' && estado !== 'cancelado';
  const { lastEvent, connected } = useWebSocket(enVivo);

  useEffect(() => {
    if (!lastEvent || activePedidoId === null) return;
    if ('id_pedido' in lastEvent && lastEvent.id_pedido === activePedidoId) {
      void refetch();
    }
  }, [lastEvent, activePedidoId, refetch]);

  if (activePedidoId === null) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
          <ShoppingBag className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-bold mb-2">No tienes pedidos activos</h1>
        <p className="text-muted-foreground text-sm mb-8">Explora la carta y arma tu pedido.</p>
        <button
          onClick={() => navigate('/menu')}
          className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition shadow-md shadow-primary/20"
        >
          Ver la carta
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="h-9 w-40 rounded-xl bg-muted animate-pulse mb-6" />
        <div className="h-40 rounded-3xl bg-muted animate-pulse mb-4" />
        <div className="h-56 rounded-3xl bg-muted animate-pulse" />
      </div>
    );
  }
  if (isError || !pedido) return <ErrorState message="No se pudo cargar tu pedido." onRetry={() => refetch()} />;

  const currentIndex = orderIndex[pedido.estado];
  const cancelado = pedido.estado === 'cancelado';
  const pagado = pedido.estado === 'pagado';
  const pagoPendiente = pedido.pago_estado === 'pendiente';
  const puedePagar = !pagoPendiente && (pedido.estado === 'entregado' || pedido.estado === 'listo');

  const handleFinished = (pending: boolean) => {
    setCheckoutOpen(false);
    if (pending) {
      void refetch();
      return;
    }
    setActivePedidoId(null);
    clearMesa();
    navigate('/menu');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-1">Mi Pedido</h1>
          <p className="text-muted-foreground text-sm">
            Mesa #{pedido.id_mesa} · {pedido.items.length} platillo{pedido.items.length !== 1 ? 's' : ''}
          </p>
        </div>
        {enVivo && connected && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-status-paid bg-status-paid/10 px-3 py-1.5 rounded-full">
            <Radio className="h-3.5 w-3.5 animate-pulse" /> En vivo
          </span>
        )}
      </div>

      {/* Tracker de estado */}
      <div className="bg-card rounded-3xl border p-6 mb-4">
        {cancelado ? (
          <p className="text-center text-status-cancelled font-semibold py-4">Este pedido fue cancelado.</p>
        ) : (
          <div className="flex items-center justify-between">
            {steps.map((step, i) => {
              const done = currentIndex >= i;
              const active = currentIndex === i;
              return (
                <div key={step.estado} className="flex-1 flex flex-col items-center relative">
                  {i > 0 && (
                    <span
                      className={cn(
                        'absolute top-5 right-1/2 w-full h-0.5 -z-0',
                        currentIndex >= i ? 'bg-primary' : 'bg-border',
                      )}
                    />
                  )}
                  <motion.div
                    initial={false}
                    animate={{ scale: active ? 1.1 : 1 }}
                    className={cn(
                      'relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                      done ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground',
                    )}
                  >
                    <step.icon className="h-4 w-4" />
                  </motion.div>
                  <span className={cn('text-[11px] mt-2 text-center', done ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detalle */}
      <div className="bg-card rounded-3xl border p-6">
        <h2 className="font-heading text-lg font-semibold mb-4">Detalle</h2>
        <div className="space-y-3">
          {pedido.items.map((item) => (
            <div key={item.id_detalle} className="flex justify-between gap-3 text-sm">
              <span>
                {item.qty}x {item.nombre}
              </span>
              <span className="font-medium">{formatCurrency(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 flex justify-between font-heading text-xl font-bold">
          <span>Total</span>
          <span className="text-primary">{formatCurrency(pedido.total)}</span>
        </div>

        {pagado ? (
          <div className="mt-5 rounded-2xl bg-status-paid/10 text-status-paid text-sm font-medium px-4 py-3 text-center">
            Pedido pagado. ¡Gracias!
          </div>
        ) : pagoPendiente ? (
          <div className="mt-5 rounded-2xl bg-accent/10 text-foreground text-sm font-medium px-4 py-3 text-center">
            Pago en efectivo pendiente de verificación por el mesero.
          </div>
        ) : (
          <button
            onClick={() => setCheckoutOpen(true)}
            disabled={!puedePagar}
            className="mt-5 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {puedePagar ? 'Pagar cuenta' : 'Disponible cuando tu pedido esté listo'}
          </button>
        )}
      </div>

      {checkoutOpen && <Checkout pedido={pedido} onClose={() => setCheckoutOpen(false)} onFinished={handleFinished} />}
    </div>
  );
}
