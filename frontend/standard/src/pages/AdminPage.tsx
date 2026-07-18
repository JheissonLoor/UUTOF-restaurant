import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Armchair,
  Receipt,
  Clock,
  AlertTriangle,
} from 'lucide-react';

import { getDashboard } from '@/api/reportes';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ErrorState } from '@/components/ErrorState';
import type { DashboardResponse } from '@/types';

function deltaPct(actual: number, anterior: number): number {
  if (!anterior) return actual > 0 ? 100 : 0;
  return ((actual - anterior) / anterior) * 100;
}

function Delta({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-semibold',
        up ? 'text-status-paid' : 'text-status-cancelled',
      )}
    >
      {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-3xl border p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </span>
        {children}
      </div>
      <p className="text-2xl font-heading font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function IngresosChart({ data }: { data: DashboardResponse['ingresos_por_dia'] }) {
  const max = Math.max(1, ...data.esta_semana, ...data.semana_anterior);
  return (
    <div className="bg-card rounded-3xl border p-6">
      <h2 className="font-heading text-lg font-semibold mb-1">Ingresos por día</h2>
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-primary" /> Esta semana
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-muted-foreground/30" /> Semana anterior
        </span>
      </div>
      <div className="flex items-end justify-between gap-2 h-44">
        {data.labels.map((label, i) => (
          <div key={label + i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <div className="w-full flex items-end justify-center gap-1 h-full">
              <div
                className="w-1/2 max-w-[14px] rounded-t bg-muted-foreground/25"
                style={{ height: `${(data.semana_anterior[i] / max) * 100}%` }}
                title={formatCurrency(data.semana_anterior[i] ?? 0)}
              />
              <div
                className="w-1/2 max-w-[14px] rounded-t bg-primary"
                style={{ height: `${(data.esta_semana[i] / max) * 100}%` }}
                title={formatCurrency(data.esta_semana[i] ?? 0)}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="h-9 w-56 rounded-xl bg-muted animate-pulse mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-3xl bg-muted animate-pulse" />
      </div>
    );
  }
  if (isError || !data) return <ErrorState message="No se pudo cargar el panel." onRetry={() => refetch()} />;

  const { hoy, distribucion, ingresos_por_dia, top_platillos, pagos_por_tipo, actividad, alertas } = data;
  const maxDist = Math.max(1, ...distribucion.map((d) => d.count));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold mb-1">Panel de Administración</h1>
        <p className="text-muted-foreground text-sm">Resumen operativo de hoy.</p>
      </div>

      {alertas.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {alertas.map((a, i) => (
            <div key={i} className="bg-status-unpaid/10 text-status-unpaid rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">{a.title}</p>
                <p className="text-xs opacity-80">{a.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <StatCard icon={DollarSign} label="Ingresos hoy" value={formatCurrency(hoy.ingresos)}>
            <Delta value={deltaPct(hoy.ingresos, hoy.ingresos_ayer)} />
          </StatCard>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StatCard icon={ShoppingBag} label="Pedidos hoy" value={String(hoy.pedidos)}>
            <Delta value={deltaPct(hoy.pedidos, hoy.pedidos_ayer)} />
          </StatCard>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard
            icon={Armchair}
            label={`Ocupación · ${hoy.mesas_ocupadas}/${hoy.mesas_totales} mesas`}
            value={`${hoy.mesas_totales ? Math.round((hoy.mesas_ocupadas / hoy.mesas_totales) * 100) : 0}%`}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatCard icon={Receipt} label="Ticket promedio" value={formatCurrency(hoy.ticket_promedio)}>
            <Delta value={deltaPct(hoy.ticket_promedio, hoy.ticket_promedio_ayer)} />
          </StatCard>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <IngresosChart data={ingresos_por_dia} />
        </div>

        {/* Distribución de pedidos */}
        <div className="bg-card rounded-3xl border p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Pedidos por estado</h2>
          <div className="space-y-3">
            {distribucion.map((d) => (
              <div key={d.key}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{d.label}</span>
                  <span className="font-medium">{d.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(d.count / maxDist) * 100}%` }} />
                </div>
              </div>
            ))}
            {distribucion.length === 0 && <p className="text-sm text-muted-foreground">Sin pedidos aún.</p>}
          </div>
          <div className="mt-5 pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" /> {hoy.pedidos_pendientes} pedido{hoy.pedidos_pendientes !== 1 ? 's' : ''} pendiente
            {hoy.pedidos_pendientes !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top platillos */}
        <div className="bg-card rounded-3xl border p-6 lg:col-span-2">
          <h2 className="font-heading text-lg font-semibold mb-4">Top platillos</h2>
          <div className="space-y-4">
            {top_platillos.map((p, i) => (
              <div key={p.id_platillo} className="flex items-center gap-4">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium truncate">{p.nombre}</span>
                    <span className="text-muted-foreground shrink-0 ml-2">{p.cantidad}u</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, p.pct)}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {top_platillos.length === 0 && <p className="text-sm text-muted-foreground">Sin datos de ventas.</p>}
          </div>
        </div>

        {/* Pagos por tipo */}
        <div className="bg-card rounded-3xl border p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Pagos por tipo</h2>
          <div className="space-y-3">
            {pagos_por_tipo.map((p) => (
              <div key={p.name} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium capitalize">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.sub}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-muted-foreground">{p.pct.toFixed(0)}%</p>
                </div>
              </div>
            ))}
            {pagos_por_tipo.length === 0 && <p className="text-sm text-muted-foreground">Sin pagos registrados.</p>}
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      {actividad.length > 0 && (
        <div className="bg-card rounded-3xl border p-6 mt-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Actividad reciente</h2>
          <div className="space-y-3">
            {actividad.map((a, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <span className="flex-1">
                  <span className="font-medium">{a.who}</span> {a.what}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">{a.when}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
