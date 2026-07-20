import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fmtInteger, fmtPercent, fmtSoles } from '../../lib/format';
import type {
  ConsolidadoKpis,
  EstadoInventario,
  RendimientoSucursal,
} from '../../types/multilocal';

interface BranchPerfTableProps {
  branches?: RendimientoSucursal[];
  total?: ConsolidadoKpis;
  loading?: boolean;
}

const branchColorClasses: Record<string, string> = {
  coral: 'bg-coral',
  mint: 'bg-mint-dark',
  sky: 'bg-sky-dark',
  plum: 'bg-plum-dark',
  sun: 'bg-sun-dark',
};

const inventoryPresentation: Record<EstadoInventario, { label: string; classes: string }> = {
  ok: { label: 'OK', classes: 'bg-mint/10 text-mint-dark' },
  bajo: { label: 'Stock bajo', classes: 'bg-sun/15 text-sun-dark' },
  critico: { label: 'Crítico', classes: 'bg-danger/10 text-danger' },
};

function BranchFlag({ branch }: { branch: RendimientoSucursal }) {
  const colorClass = branchColorClasses[branch.color] ?? 'bg-plum-dark';
  return (
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-card text-xs font-bold text-white ${colorClass}`}>
      {branch.nombre.charAt(0).toUpperCase()}
    </span>
  );
}

function Occupancy({ value }: { value: number }) {
  const barClass = value >= 80 ? 'bg-coral' : value >= 60 ? 'bg-sun' : 'bg-mint';
  return (
    <span className="flex min-w-[126px] items-center gap-2.5">
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg2">
        <span
          className={`block h-full rounded-full ${barClass}`}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </span>
      <span className="w-10 text-right font-mono text-xs tabular-nums text-ink2">{fmtPercent(value)}</span>
    </span>
  );
}

function Delta({ value }: { value: number }) {
  const Icon = value > 0 ? ArrowUp : value < 0 ? ArrowDown : Minus;
  const classes = value > 0 ? 'text-mint-dark' : value < 0 ? 'text-danger' : 'text-ink3';
  return (
    <span className={`inline-flex items-center justify-end gap-1 font-mono text-xs font-semibold tabular-nums ${classes}`}>
      <Icon size={13} aria-hidden="true" />
      {value === 0 ? 'estable' : `${Math.abs(value).toFixed(0)}%`}
    </span>
  );
}

function worstInventoryState(branches: RendimientoSucursal[]): EstadoInventario {
  if (branches.some((branch) => branch.inventario_estado === 'critico')) {
    return 'critico';
  }
  if (branches.some((branch) => branch.inventario_estado === 'bajo')) {
    return 'bajo';
  }
  return 'ok';
}

function LoadingRows() {
  return (
    <>
      {[1, 2, 3].map((row) => (
        <tr key={row} className="animate-pulse border-t border-[#EEE6DC]">
          <td className="px-4 py-4"><div className="h-8 w-40 rounded bg-bg2" /></td>
          <td className="px-4 py-4"><div className="ml-auto h-4 w-20 rounded bg-bg2" /></td>
          <td className="px-4 py-4"><div className="ml-auto h-4 w-12 rounded bg-bg2" /></td>
          <td className="px-4 py-4"><div className="h-4 w-32 rounded bg-bg2" /></td>
          <td className="px-4 py-4"><div className="h-6 w-20 rounded-full bg-bg2" /></td>
          <td className="px-4 py-4"><div className="ml-auto h-4 w-16 rounded bg-bg2" /></td>
        </tr>
      ))}
    </>
  );
}

export function BranchPerfTable({ branches = [], total, loading = false }: BranchPerfTableProps) {
  const navigate = useNavigate();
  const totalInventory = worstInventoryState(branches);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E7DED3] bg-surface">
      <table className="w-full border-collapse text-left text-[13px]">
        <thead>
          <tr className="bg-[#FCF9F5] font-mono text-[9px] font-semibold uppercase text-ink4">
            <th className="px-4 py-3">Sucursal</th>
            <th className="px-4 py-3 text-right">Ingresos</th>
            <th className="px-4 py-3 text-right">Pedidos</th>
            <th className="px-4 py-3">Ocupación</th>
            <th className="px-4 py-3">Inventario</th>
            <th className="px-4 py-3 text-right">Vs. periodo anterior</th>
          </tr>
        </thead>
        <tbody>
          {loading ? <LoadingRows /> : null}
          {!loading && branches.length === 0 ? (
            <tr className="border-t border-[#EEE6DC]">
              <td colSpan={6} className="px-4 py-12 text-center text-sm text-ink3">
                No hay sucursales activas para este periodo.
              </td>
            </tr>
          ) : null}
          {!loading
            ? branches.map((branch) => {
                const inventory = inventoryPresentation[branch.inventario_estado];
                return (
                  <tr
                    key={branch.id_sucursal}
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate('/admin/sucursales')}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        navigate('/admin/sucursales');
                      }
                    }}
                    className="cursor-pointer border-t border-[#EEE6DC] transition-colors hover:bg-bg/70 focus:bg-bg/70 focus:outline-none"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <BranchFlag branch={branch} />
                        <div>
                          <strong className="block font-semibold text-ink">{branch.nombre}</strong>
                          <span className="text-[11px] text-ink4">Sucursal #{branch.id_sucursal}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold tabular-nums text-ink2">
                      {fmtSoles(branch.ingresos)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums text-ink2">
                      {fmtInteger(branch.pedidos)}
                    </td>
                    <td className="px-4 py-3.5"><Occupancy value={branch.ocupacion} /></td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${inventory.classes}`}>
                        {inventory.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right"><Delta value={branch.delta_semana} /></td>
                  </tr>
                );
              })
            : null}
          {!loading && total && branches.length > 0 ? (
            <tr className="border-t-2 border-[#DDD2C5] bg-bg/70 font-semibold">
              <td className="px-4 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-card bg-ink text-xs text-white">Σ</span>
                  <div>
                    <strong className="block text-ink">Red completa</strong>
                    <span className="text-[11px] font-normal text-ink4">{branches.length} sucursales</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-right font-mono tabular-nums">{fmtSoles(total.ingresos)}</td>
              <td className="px-4 py-4 text-right font-mono tabular-nums">{fmtInteger(total.pedidos)}</td>
              <td className="px-4 py-4"><Occupancy value={total.ocupacion} /></td>
              <td className="px-4 py-4">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[10.5px] ${inventoryPresentation[totalInventory].classes}`}>
                  {inventoryPresentation[totalInventory].label}
                </span>
              </td>
              <td className="px-4 py-4 text-right"><Delta value={total.delta.ingresos} /></td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
