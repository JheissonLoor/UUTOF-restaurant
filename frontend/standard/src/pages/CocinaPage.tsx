import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Hash, User, Package, RefreshCcw, ReceiptText } from 'lucide-react';
import { toast } from 'sonner';

import { avanzarPedido, getKitchenOrders } from '@/api/cocina';
import { formatCurrency } from '@/lib/format';
import { ErrorState } from '@/components/ErrorState';
import type { EstadoCocina, KitchenOrder, PedidoTransition } from '@/types';

interface EstadoConfig {
  estado: EstadoCocina;
  label: string;
  colorVar: string;
  transition?: PedidoTransition;
  nextLabel?: string;
}

const COLUMNS: EstadoConfig[] = [
  { estado: 'espera', label: 'En Espera', colorVar: '--status-waiting', transition: 'empezarPreparacion', nextLabel: 'Empezar preparación' },
  { estado: 'cocina', label: 'En Preparación', colorVar: '--status-in-progress', transition: 'marcarTerminado', nextLabel: 'Marcar listo' },
  { estado: 'listo', label: 'Terminado', colorVar: '--status-done' },
];

const CONFIG_BY_ESTADO = Object.fromEntries(COLUMNS.map((c) => [c.estado, c])) as Record<EstadoCocina, EstadoConfig>;

export default function CocinaPage() {
  const { data: orders, isLoading, isError, refetch } = useQuery({
    queryKey: ['cocina'],
    queryFn: getKitchenOrders,
    refetchInterval: 30000,
  });
  const [filterMesa, setFilterMesa] = useState('');

  const avanzarMutation = useMutation({
    mutationFn: ({ id, transicion }: { id: number; transicion: PedidoTransition }) => avanzarPedido(id, transicion),
    onSuccess: (_data, vars) => {
      const label = COLUMNS.find((c) => c.transition === vars.transicion)?.nextLabel ?? 'Actualizado';
      toast.success(label);
      void refetch();
    },
    onError: () => toast.error('No se pudo actualizar el pedido.'),
  });

  const all = useMemo(() => orders ?? [], [orders]);
  const uniqueMesas = useMemo(() => [...new Set(all.map((o) => o.mesa))].sort((a, b) => a - b), [all]);
  const activos = all.length;

  const move = (order: KitchenOrder) => {
    const cfg = CONFIG_BY_ESTADO[order.estado];
    if (cfg.transition) avanzarMutation.mutate({ id: order.id_pedido, transicion: cfg.transition });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-9 w-52 rounded-xl bg-muted animate-pulse mb-6" />
        <div className="grid lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }
  if (isError) return <ErrorState message="No se pudieron cargar los pedidos." onRetry={() => refetch()} />;

  const renderCard = (order: KitchenOrder) => {
    const cfg = CONFIG_BY_ESTADO[order.estado];
    return (
      <motion.div
        key={order.id_pedido}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-card rounded-2xl border p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-heading font-bold text-lg">Mesa {order.mesa}</span>
          <span
            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{ color: `hsl(var(${cfg.colorVar}))`, background: `hsl(var(${cfg.colorVar}) / 0.12)` }}
          >
            {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
          <User className="h-3 w-3" /> {order.cliente}
        </div>
        <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-1">
          <Package className="h-3 w-3 mt-0.5 shrink-0" />
          <span>{order.items.map((i) => `${i.qty}x ${i.nombre}`).join(', ')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <ReceiptText className="h-3 w-3" /> Pedido #{order.id_pedido} · {formatCurrency(order.total)}
        </div>
        {cfg.transition && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => move(order)}
            disabled={avanzarMutation.isPending}
            className="w-full py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            <RefreshCcw className="h-3 w-3" /> {cfg.nextLabel}
          </motion.button>
        )}
      </motion.div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-1">Panel de Cocina</h1>
          <p className="text-muted-foreground text-sm">{activos} pedidos activos</p>
        </div>
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={filterMesa}
            onChange={(e) => setFilterMesa(e.target.value)}
            className="pl-8 pr-4 py-2 rounded-xl border bg-card text-sm focus:ring-2 focus:ring-primary/30 outline-none appearance-none cursor-pointer"
          >
            <option value="">Todas las mesas</option>
            {uniqueMesas.map((m) => (
              <option key={m} value={m}>
                Mesa #{m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban desktop */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const colOrders = all.filter(
            (o) => o.estado === col.estado && (!filterMesa || o.mesa.toString() === filterMesa),
          );
          return (
            <div key={col.estado} className="rounded-2xl bg-muted/30 border">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: `hsl(var(${col.colorVar}))` }} />
                  <span className="text-sm font-semibold">{col.label}</span>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-background rounded-full px-2.5 py-0.5 border">
                  {colOrders.length}
                </span>
              </div>
              <div className="p-3 space-y-3 min-h-[200px]">
                <AnimatePresence>{colOrders.map(renderCard)}</AnimatePresence>
                {colOrders.length === 0 && <div className="text-center py-8 text-xs text-muted-foreground">Sin pedidos</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lista mobile */}
      <div className="lg:hidden space-y-3">
        <AnimatePresence>
          {all
            .filter((o) => !filterMesa || o.mesa.toString() === filterMesa)
            .map((order) => renderCard(order))}
        </AnimatePresence>
        {all.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Filter className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p>No hay pedidos por ahora</p>
          </div>
        )}
      </div>
    </div>
  );
}
