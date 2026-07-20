import { useQuery } from '@tanstack/react-query';
import { Building2, CalendarDays, Check, CreditCard } from 'lucide-react';
import { getFacturacionConfig } from '../../api/empresa';
import { getApiErrorMessage } from '../../api/errors';
import { fmtSoles } from '../../lib/format';

export function FacturacionPanel() {
  const query = useQuery({ queryKey: ['facturacion-config'], queryFn: getFacturacionConfig });
  if (query.isError) return <p role="alert" className="rounded-card bg-danger/10 px-4 py-3 text-sm text-danger">{getApiErrorMessage(query.error)}</p>;
  if (!query.data) return <div className="h-72 animate-pulse rounded-card bg-bg2" />;
  const billing = query.data;
  return (
    <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(280px,1fr)] gap-4 max-[850px]:grid-cols-1">
      <section className="rounded-card border border-[#E7DED3] bg-surface p-6 shadow-card">
        <div className="flex items-start justify-between gap-4"><div><span className="rounded-full bg-plum/10 px-2.5 py-1 font-mono text-[9px] font-semibold uppercase text-plum-dark">Plan actual</span><h2 className="mt-3 font-display text-3xl font-semibold text-ink">{billing.plan}</h2><p className="mt-1 text-sm text-ink3">Administración completa para toda tu red.</p></div><span className="flex h-12 w-12 items-center justify-center rounded-card bg-sun/15 text-sun-dark"><Check size={22} /></span></div>
        <div className="mt-6 grid grid-cols-3 gap-3 max-[700px]:grid-cols-1"><div className="rounded-card bg-bg p-4"><Building2 size={17} className="text-coral" /><strong className="mt-2 block font-display text-2xl text-ink">{billing.sucursales_facturadas}</strong><span className="text-[10px] text-ink4">Sucursales activas</span></div><div className="rounded-card bg-bg p-4"><CreditCard size={17} className="text-mint-dark" /><strong className="mt-2 block font-display text-2xl text-ink">{fmtSoles(billing.precio_por_local)}</strong><span className="text-[10px] text-ink4">Por local / mes</span></div><div className="rounded-card bg-bg p-4"><CalendarDays size={17} className="text-sky-dark" /><strong className="mt-2 block font-display text-lg text-ink">{new Date(`${billing.proxima_factura}T12:00:00`).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</strong><span className="text-[10px] text-ink4">Próxima factura</span></div></div>
      </section>
      <aside className="rounded-card border border-[#E7DED3] bg-surface p-6 shadow-card"><h3 className="font-display text-lg font-semibold text-ink">Resumen mensual</h3><div className="mt-5 space-y-3 text-xs"><div className="flex justify-between text-ink3"><span>{billing.sucursales_facturadas} locales × {fmtSoles(billing.precio_por_local)}</span><strong className="text-ink">{fmtSoles(billing.total_mensual)}</strong></div><div className="h-px bg-[#EEE6DC]" /><div className="flex items-end justify-between"><span className="font-semibold text-ink2">Total mensual</span><strong className="font-display text-2xl text-ink">{fmtSoles(billing.total_mensual)}</strong></div></div><div className="mt-6 rounded-card bg-bg p-4"><span className="text-[10px] font-semibold uppercase text-ink4">Método de pago</span><p className="mt-2 flex items-center gap-2 text-sm font-semibold text-ink"><CreditCard size={16} /> {billing.metodo_pago} terminada en {billing.ultimos4}</p></div></aside>
    </div>
  );
}
