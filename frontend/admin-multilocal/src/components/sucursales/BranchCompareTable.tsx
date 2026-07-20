import { Star } from 'lucide-react';
import { fmtInteger, fmtPercent, fmtSoles } from '../../lib/format';
import type { SucursalComparativa } from '../../types/multilocal';

interface BranchCompareTableProps {
  rows?: SucursalComparativa[];
  loading?: boolean;
}

const flagClasses: Record<string, string> = {
  coral: 'bg-coral',
  mint: 'bg-mint-dark',
  sky: 'bg-sky-dark',
  plum: 'bg-plum-dark',
  sun: 'bg-sun-dark',
};

export function BranchCompareTable({ rows = [], loading = false }: BranchCompareTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E7DED3] bg-surface">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="bg-[#FCF9F5] text-left font-mono text-[9px] font-semibold uppercase text-ink4">
            <th className="px-4 py-3">Sucursal</th>
            <th className="px-4 py-3 text-right">Ingresos 7d</th>
            <th className="px-4 py-3 text-right">Ticket promedio</th>
            <th className="px-4 py-3 text-right">Reseñas</th>
            <th className="px-4 py-3 text-right">Empleados</th>
            <th className="px-4 py-3 text-right">Margen</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? [1, 2, 3].map((row) => (
                <tr key={row} className="animate-pulse border-t border-[#EEE6DC]">
                  {[150, 80, 80, 56, 40, 48].map((width, index) => (
                    <td key={index} className="px-4 py-4">
                      <div className="ml-auto h-4 rounded bg-bg2 first:ml-0" style={{ width }} />
                    </td>
                  ))}
                </tr>
              ))
            : null}
          {!loading && rows.length === 0 ? (
            <tr className="border-t border-[#EEE6DC]">
              <td colSpan={6} className="px-4 py-10 text-center text-ink3">
                No hay información comparativa disponible.
              </td>
            </tr>
          ) : null}
          {!loading
            ? rows.map((row) => (
                <tr key={row.id_sucursal} className="border-t border-[#EEE6DC] text-ink2">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-card text-xs font-bold text-white ${flagClasses[row.color] ?? 'bg-plum-dark'}`}>
                        {row.nombre.charAt(0).toUpperCase()}
                      </span>
                      <strong className="font-semibold text-ink">{row.nombre}</strong>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-semibold tabular-nums">
                    {fmtSoles(row.ingresos_semana)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums">
                    {fmtSoles(row.ticket_promedio)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {row.resenas_promedio === null ? (
                      <span className="text-ink4">—</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                        <Star size={13} className="fill-sun text-sun" aria-hidden="true" />
                        {row.resenas_promedio.toFixed(1)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums">
                    {fmtInteger(row.empleados)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums">
                    {row.margen_pct === null ? <span className="text-ink4">—</span> : fmtPercent(row.margen_pct)}
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </div>
  );
}
