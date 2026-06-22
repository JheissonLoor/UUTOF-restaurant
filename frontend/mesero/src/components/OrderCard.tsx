import { ChefHat, Clock3, Users } from 'lucide-react';

import type { Mesa, Pedido } from '@/types/api';

interface OrderCardProps {
  mesa: Mesa;
  pedido: Pedido;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function openingTime(isoDate: string | undefined): string {
  if (!isoDate) return '--:--';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function OrderCard({ mesa, pedido }: OrderCardProps): JSX.Element {
  const active = mesa.pedido_activo;

  return (
    <section className="rounded-[18px] bg-[linear-gradient(135deg,#1F1A14,#2C2519)] px-[18px] py-4 text-white shadow-md-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-white/70">Orden #{pedido.id_pedido}</div>
          <div className="mt-1 font-serif text-[32px] font-semibold leading-none tracking-normal tnum">{formatCurrency(pedido.total)}</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-white/70">Curso actual</div>
          <div className="mt-1 font-serif text-sm font-semibold">{active?.curso_actual ?? 'Sin curso'}</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11.5px] text-white/85">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
          <Clock3 aria-hidden="true" size={12} />
          {openingTime(active?.abierto_en)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
          <Users aria-hidden="true" size={12} />
          {pedido.comensales} personas
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
          <ChefHat aria-hidden="true" size={12} />
          {active?.en_cocina ?? 0} en cocina
        </span>
      </div>
    </section>
  );
}
