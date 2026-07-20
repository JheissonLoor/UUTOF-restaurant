import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import type {
  InventarioItem,
  OrdenCompraRequest,
  SucursalResumen,
} from '../../types/multilocal';

interface OrdenCompraModalProps {
  open: boolean;
  items: InventarioItem[];
  branches: SucursalResumen[];
  initialBranch: number | 'red';
  submitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: OrdenCompraRequest) => Promise<void>;
}

export function OrdenCompraModal({
  open,
  items,
  branches,
  initialBranch,
  submitting,
  error,
  onClose,
  onSubmit,
}: OrdenCompraModalProps) {
  const firstBranch = items[0]?.id_sucursal ?? branches[0]?.id_sucursal ?? 0;
  const [branchId, setBranchId] = useState<number>(initialBranch === 'red' ? firstBranch : initialBranch);
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const branchItems = useMemo(
    () => items.filter((item) => item.id_sucursal === branchId),
    [branchId, items],
  );

  useEffect(() => {
    if (!open) return;
    const nextBranch = initialBranch === 'red' ? firstBranch : initialBranch;
    setBranchId(nextBranch);
  }, [firstBranch, initialBranch, open]);

  useEffect(() => {
    if (!open) return;
    setQuantities(
      Object.fromEntries(branchItems.map((item) => [item.id_insumo, item.sugerido])),
    );
  }, [branchId, branchItems, open]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      id_sucursal: branchId,
      items: branchItems.map((item) => ({
        id_insumo: item.id_insumo,
        cantidad: quantities[item.id_insumo] ?? item.sugerido,
      })),
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/45 p-6" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="orden-compra-titulo" onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-[640px] rounded-2xl bg-surface shadow-lift">
        <header className="flex items-center justify-between border-b border-[#E7DED3] px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-card bg-sun/15 text-sun-dark"><ShoppingCart size={19} aria-hidden="true" /></span>
            <div>
              <h2 id="orden-compra-titulo" className="font-display text-2xl font-semibold text-ink">Orden de compra</h2>
              <p className="mt-0.5 text-xs text-ink3">Insumos bajo el nivel mínimo</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar modal" title="Cerrar" className="flex h-9 w-9 items-center justify-center rounded-card text-ink4 hover:bg-bg2 hover:text-ink"><X size={18} /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-6">
          {initialBranch === 'red' ? (
            <label className="mb-5 block">
              <span className="mb-2 block text-sm font-semibold text-ink2">Sucursal</span>
              <select value={branchId} onChange={(event) => setBranchId(Number(event.target.value))} className="h-11 w-full rounded-card border border-[#DDD2C5] bg-white px-3 text-sm text-ink outline-none focus:border-coral">
                {branches.map((branch) => <option key={branch.id_sucursal} value={branch.id_sucursal}>{branch.nombre}</option>)}
              </select>
            </label>
          ) : null}

          <div className="max-h-[340px] overflow-y-auto border-y border-[#E7DED3]">
            {branchItems.map((item) => (
              <label key={item.id_insumo} className="grid grid-cols-[1fr_160px] items-center gap-4 border-b border-[#EEE6DC] py-3 last:border-0">
                <span>
                  <strong className="block text-sm font-semibold text-ink">{item.nombre}</strong>
                  <span className="text-xs text-ink4">Stock actual: {item.stock}</span>
                </span>
                <input
                  required
                  value={quantities[item.id_insumo] ?? item.sugerido}
                  onChange={(event) => setQuantities((current) => ({ ...current, [item.id_insumo]: event.target.value }))}
                  className="h-10 rounded-card border border-[#DDD2C5] px-3 text-right font-mono text-sm outline-none focus:border-coral"
                  aria-label={`Cantidad para ${item.nombre}`}
                />
              </label>
            ))}
            {branchItems.length === 0 ? <p className="py-10 text-center text-sm text-ink3">No hay insumos bajo el mínimo en esta sucursal.</p> : null}
          </div>

          {error ? <div role="alert" className="mt-4 rounded-card bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div> : null}

          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="h-10 rounded-card border border-[#DDD2C5] px-4 text-sm font-semibold text-ink2 hover:bg-bg2">Cancelar</button>
            <button type="submit" disabled={submitting || branchItems.length === 0} className="h-10 rounded-card bg-ink px-5 text-sm font-semibold text-white hover:bg-ink2 disabled:opacity-60">
              {submitting ? 'Generando...' : 'Generar orden'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
