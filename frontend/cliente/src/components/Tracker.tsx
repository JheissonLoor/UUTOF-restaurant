import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getPedido } from '@/api/cliente';
import { CloseIcon, FlameIcon, CheckIcon, ClockIcon, BellIcon } from '@/components/icons';
import { ErrorState } from '@/components/ui/ErrorState';
import { useWebSocket } from '@/realtime/useWebSocket';
import { formatCurrency, formatOrderFolio } from '@/lib/format';
import type { PedidoEstado, PedidoPublico } from '@/types';

const stages = [
  { key: 'recibido', label: 'Pedido recibido', detail: 'Cocina lo está revisando' },
  { key: 'preparando', label: 'En preparación', detail: 'Tu chef está cocinando' },
  { key: 'listo', label: 'Listo', detail: 'Listo en pase' },
  { key: 'servido', label: 'Servido en mesa', detail: 'Buen provecho' },
];

function stageFromStatus(status: PedidoEstado): number {
  if (status === 'creado') return 0;
  if (status === 'en_cocina') return 1;
  if (status === 'listo') return 2;
  if (status === 'entregado' || status === 'pagado') return 3;
  return 0;
}

export function Tracker({ idPedido, onClose, onCheckout }: { idPedido: number | null; onClose: () => void; onCheckout: (pedido: PedidoPublico) => void }): JSX.Element | null {
  const [elapsed, setElapsed] = useState(0);
  const ws = useWebSocket(idPedido !== null);
  const pedidoQuery = useQuery({
    queryKey: ['cliente', 'pedido', idPedido],
    queryFn: () => getPedido(idPedido ?? 0),
    enabled: idPedido !== null,
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (!idPedido) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [idPedido]);

  useEffect(() => {
    if (!ws.lastEvent || !idPedido || !('id_pedido' in ws.lastEvent) || ws.lastEvent.id_pedido !== idPedido) return;
    void pedidoQuery.refetch();
  }, [idPedido, pedidoQuery, ws.lastEvent]);

  const pedido = pedidoQuery.data;
  const activeStage = pedido ? stageFromStatus(pedido.estado) : 0;
  const minutes = Math.floor(elapsed / 60);
  const eta = useMemo(() => Math.max(0, 18 - minutes), [minutes]);

  if (idPedido === null) return null;

  return (
    <>
      <button type="button" className="fixed inset-0 z-50 bg-ink-900/35" onClick={onClose} aria-label="Cerrar tracking" />
      <aside className="fixed inset-x-0 bottom-0 z-[60] mx-auto max-h-[92dvh] max-w-[440px] overflow-y-auto rounded-t-2xl bg-cream-surface shadow-[0_-18px_48px_-18px_rgba(31,26,20,0.45)] animate-pop-in" data-screen-label="07 Tracking en vivo">
        <header className="flex items-start gap-3 border-b border-[rgba(31,26,20,0.08)] px-4 py-4">
          <div className="grid h-12 w-12 place-items-center rounded-md bg-coral-50 text-coral-600">
            <FlameIcon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs font-bold text-coral-600">{formatOrderFolio(idPedido)}</p>
            <h2 className="font-serif text-[24px] font-semibold">{activeStage >= 3 ? 'Pedido servido' : 'Tu pedido está en camino'}</h2>
          </div>
          <button type="button" className="grid h-11 w-11 place-items-center rounded-sm bg-cream-bg2 text-ink-500" onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        </header>

        <div className="p-4">
          {pedidoQuery.isError ? <ErrorState message="No se pudo cargar el pedido." onRetry={() => void pedidoQuery.refetch()} /> : null}

          <div className="rounded-xl bg-ink-900 p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/55">Tiempo</p>
                <div className="font-mono text-2xl font-bold tnum">{minutes}:{String(elapsed % 60).padStart(2, '0')}</div>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/55">{activeStage >= 3 ? 'Estado' : 'ETA'}</p>
                <div className="font-serif text-2xl font-semibold">{activeStage >= 3 ? 'Listo' : `${eta} min`}</div>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-coral transition-all" style={{ width: `${((activeStage + 1) / stages.length) * 100}%` }} />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {stages.map((stage, index) => {
              const done = index < activeStage;
              const active = index === activeStage;
              return (
                <div key={stage.key} className={`flex items-center gap-3 rounded-lg border p-3 ${active ? 'border-coral bg-coral-50' : 'border-[rgba(31,26,20,0.08)] bg-cream-bg'}`}>
                  <div className={`grid h-9 w-9 place-items-center rounded-full ${done ? 'bg-mint text-white' : active ? 'bg-coral text-white' : 'bg-cream-surface text-ink-400'}`}>
                    {done ? <CheckIcon size={15} /> : active ? <ClockIcon size={15} /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-ink-900">{stage.label}</div>
                    <div className="text-xs text-ink-500">{stage.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {pedido ? (
            <section className="mt-5 rounded-xl border border-[rgba(31,26,20,0.08)] bg-cream-bg p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-serif text-xl font-semibold">Resumen</h3>
                <span className="font-serif text-xl font-bold text-coral-600">{formatCurrency(pedido.total)}</span>
              </div>
              <div className="space-y-2">
                {pedido.items.map((item) => (
                  <div key={item.id_detalle} className="flex justify-between gap-3 text-sm">
                    <span className="text-ink-700">{item.qty}x {item.nombre}</span>
                    <span className="text-ink-500">{item.estado_item === 'ready' ? 'Listo' : item.estado_item === 'delivered' ? 'Servido' : 'Cocina'}</span>
                  </div>
                ))}
              </div>
              {pedido.pago_estado === 'pendiente' ? (
                <div className="mt-4 rounded-md bg-sun-50 px-4 py-3 text-center text-sm font-semibold text-sun-600">
                  Pago en efectivo pendiente de verificación por el mesero
                </div>
              ) : activeStage >= 3 && pedido.estado !== 'pagado' ? (
                <button type="button" className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-coral px-4 text-sm font-semibold text-white" onClick={() => onCheckout(pedido)}>
                  <BellIcon size={16} />
                  Pedir la cuenta
                </button>
              ) : null}
            </section>
          ) : null}
        </div>
      </aside>
    </>
  );
}
