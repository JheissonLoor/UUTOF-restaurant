import { ArrowRight, MapPin } from 'lucide-react';
import { fmtInteger, fmtPercent, fmtSoles } from '../../lib/format';
import type { RendimientoSucursal, SucursalResumen } from '../../types/multilocal';

interface BranchCardProps {
  branch: SucursalResumen;
  performance?: RendimientoSucursal;
  onManage: (branch: SucursalResumen) => void;
}

const colorClasses: Record<string, string> = {
  coral: 'bg-coral',
  mint: 'bg-mint-dark',
  sky: 'bg-sky-dark',
  plum: 'bg-plum-dark',
  sun: 'bg-sun-dark',
};

const inventoryClasses = {
  ok: 'bg-mint/10 text-mint-dark',
  bajo: 'bg-sun/15 text-sun-dark',
  critico: 'bg-danger/10 text-danger',
};

export function BranchCard({ branch, performance, onManage }: BranchCardProps) {
  const branchColor = colorClasses[branch.color] ?? 'bg-plum-dark';
  const inventoryState = performance?.inventario_estado ?? 'ok';
  const inventoryLabel = { ok: 'Inventario OK', bajo: 'Stock bajo', critico: 'Stock crítico' }[inventoryState];

  return (
    <article className="rounded-2xl border border-[#E7DED3] bg-surface p-5 transition-shadow hover:shadow-card">
      <header className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-card text-sm font-bold text-white ${branchColor}`}>
          {branch.nombre.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h2 className="truncate font-display text-xl font-semibold text-ink">{branch.nombre}</h2>
          <p className="mt-1 flex items-start gap-1.5 text-xs leading-5 text-ink3">
            <MapPin size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{branch.direccion}</span>
          </p>
        </div>
      </header>

      <div className="my-5 grid grid-cols-3 divide-x divide-[#EEE6DC] border-y border-[#EEE6DC] py-4">
        <div className="pr-3">
          <p className="font-mono text-[9px] font-semibold uppercase text-ink4">Ingresos 7d</p>
          <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-ink2">
            {fmtSoles(performance?.ingresos ?? 0)}
          </p>
        </div>
        <div className="px-3">
          <p className="font-mono text-[9px] font-semibold uppercase text-ink4">Pedidos</p>
          <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-ink2">
            {fmtInteger(performance?.pedidos ?? 0)}
          </p>
        </div>
        <div className="pl-3">
          <p className="font-mono text-[9px] font-semibold uppercase text-ink4">Ocupación</p>
          <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-ink2">
            {fmtPercent(performance?.ocupacion ?? 0)}
          </p>
        </div>
      </div>

      <footer className="flex items-center justify-between gap-3">
        <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${inventoryClasses[inventoryState]}`}>
          {inventoryLabel}
        </span>
        <button
          type="button"
          onClick={() => onManage(branch)}
          className="flex h-9 items-center gap-1.5 rounded-card px-3 text-xs font-semibold text-coral-dark transition-colors hover:bg-coral/10"
        >
          Administrar
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      </footer>
    </article>
  );
}
