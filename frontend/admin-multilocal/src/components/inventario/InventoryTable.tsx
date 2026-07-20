import type { EstadoInventario, InventarioItem } from '../../types/multilocal';

interface InventoryTableProps {
  items?: InventarioItem[];
  loading?: boolean;
}

const branchClasses: Record<string, string> = {
  coral: 'bg-coral/10 text-coral-dark',
  mint: 'bg-mint/10 text-mint-dark',
  sky: 'bg-sky/10 text-sky-dark',
  plum: 'bg-plum/10 text-plum-dark',
  sun: 'bg-sun/15 text-sun-dark',
};

const statusClasses: Record<EstadoInventario, string> = {
  ok: 'bg-mint/10 text-mint-dark',
  bajo: 'bg-sun/15 text-sun-dark',
  critico: 'bg-danger/10 text-danger',
};

const statusLabels: Record<EstadoInventario, string> = {
  ok: 'Saludable',
  bajo: 'Bajo',
  critico: 'Crítico',
};

function LevelBar({ item }: { item: InventarioItem }) {
  const color = item.estado === 'critico' ? 'bg-danger' : item.estado === 'bajo' ? 'bg-sun' : 'bg-mint';
  return (
    <span className="flex min-w-[150px] items-center gap-2.5">
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg2">
        <span className={`block h-full rounded-full ${color}`} style={{ width: `${Math.min(Math.max(item.nivel_pct, 0), 100)}%` }} />
      </span>
      <span className="w-10 text-right font-mono text-xs tabular-nums">{item.nivel_pct.toFixed(0)}%</span>
    </span>
  );
}

export function InventoryTable({ items = [], loading = false }: InventoryTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E7DED3] bg-surface">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="bg-[#FCF9F5] text-left font-mono text-[9px] font-semibold uppercase text-ink4">
            <th className="px-4 py-3">Insumo</th>
            <th className="px-4 py-3">Sucursal</th>
            <th className="px-4 py-3">Nivel</th>
            <th className="px-4 py-3 text-right">Stock</th>
            <th className="px-4 py-3 text-center">Estado</th>
            <th className="px-4 py-3 text-right">Compra sugerida</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? [1, 2, 3, 4, 5].map((row) => (
                <tr key={row} className="animate-pulse border-t border-[#EEE6DC]">
                  {[160, 80, 150, 70, 70, 80].map((width, index) => (
                    <td key={index} className="px-4 py-4"><div className="h-4 rounded bg-bg2" style={{ width }} /></td>
                  ))}
                </tr>
              ))
            : null}
          {!loading && items.length === 0 ? (
            <tr className="border-t border-[#EEE6DC]">
              <td colSpan={6} className="px-4 py-12 text-center text-sm text-ink3">
                No hay inventario registrado para esta selección.
              </td>
            </tr>
          ) : null}
          {!loading
            ? items.map((item) => (
                <tr
                  key={`${item.id_sucursal}-${item.id_insumo}`}
                  id={item.estado === 'critico' ? `inventario-critico-${item.id_sucursal}-${item.id_insumo}` : undefined}
                  className={`border-t border-[#EEE6DC] text-ink2 ${item.estado === 'critico' ? 'bg-danger/[0.025]' : ''}`}
                >
                  <td className="px-4 py-3.5">
                    <strong className="block font-semibold text-ink">{item.nombre}</strong>
                    {item.descripcion ? <span className="mt-0.5 block text-[11px] text-ink4">{item.descripcion}</span> : null}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${branchClasses[item.color] ?? branchClasses.plum}`}>
                      {item.sucursal}
                    </span>
                  </td>
                  <td className="px-4 py-3.5"><LevelBar item={item} /></td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums">{item.stock}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${statusClasses[item.estado]}`}>
                      {statusLabels[item.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-semibold tabular-nums text-ink2">
                    {item.sugerido}
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </div>
  );
}
