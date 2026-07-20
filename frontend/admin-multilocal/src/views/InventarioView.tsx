import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, ShoppingCart } from 'lucide-react';
import { getApiErrorMessage } from '../api/errors';
import { createOrdenCompra, getInventario } from '../api/inventario';
import { InventoryAlertBar } from '../components/inventario/InventoryAlertBar';
import { InventoryTable } from '../components/inventario/InventoryTable';
import { OrdenCompraModal } from '../components/inventario/OrdenCompraModal';
import { BranchSelector } from '../components/shared/BranchSelector';
import { Toast } from '../components/shared/Toast';
import { useSucursal } from '../context/useSucursal';
import { TopBar } from '../layout/TopBar';
import type { OrdenCompraRequest } from '../types/multilocal';

export function InventarioView() {
  const queryClient = useQueryClient();
  const { sucursalActiva, sucursales } = useSucursal();
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const branchId = sucursalActiva === 'red' ? undefined : sucursalActiva;
  const query = useQuery({
    queryKey: ['inventario', sucursalActiva],
    queryFn: () => getInventario(branchId),
  });
  const orderMutation = useMutation({
    mutationFn: createOrdenCompra,
    onSuccess: (order) => {
      setModalOpen(false);
      setToast(`Orden #${order.id_orden} generada correctamente.`);
      void queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
  });
  const lowItems = useMemo(
    () => (query.data ?? []).filter((item) => item.estado !== 'ok'),
    [query.data],
  );

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function scrollToCritical() {
    document.querySelector<HTMLElement>('[id^="inventario-critico-"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <section className="animate-view-in" aria-labelledby="titulo-inventario">
      <TopBar
        title="Inventario"
        subtitle="Stock y abastecimiento de toda la red"
        titleId="titulo-inventario"
        actions={
          <>
            <BranchSelector />
            <button type="button" disabled={lowItems.length === 0} onClick={() => setModalOpen(true)} className="flex h-10 items-center gap-2 rounded-card bg-ink px-4 text-[13px] font-semibold text-white hover:bg-ink2 disabled:opacity-50">
              <ShoppingCart size={16} aria-hidden="true" /> Generar orden
            </button>
          </>
        }
      />

      {query.isError ? (
        <div role="alert" className="mb-4 flex items-center justify-between rounded-card border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
          <span>{getApiErrorMessage(query.error)}</span>
          <button type="button" onClick={() => void query.refetch()} className="flex h-9 items-center gap-2 rounded-card px-3 font-semibold hover:bg-danger/10"><RefreshCw size={15} /> Reintentar</button>
        </div>
      ) : null}

      {!query.isPending ? <InventoryAlertBar items={query.data ?? []} onShowCritical={scrollToCritical} /> : null}
      <InventoryTable items={query.data} loading={query.isPending} />

      <OrdenCompraModal
        open={modalOpen}
        items={lowItems}
        branches={sucursales}
        initialBranch={sucursalActiva}
        submitting={orderMutation.isPending}
        error={orderMutation.isError ? getApiErrorMessage(orderMutation.error) : null}
        onClose={() => {
          if (!orderMutation.isPending) {
            orderMutation.reset();
            setModalOpen(false);
          }
        }}
        onSubmit={async (payload: OrdenCompraRequest) => {
          await orderMutation.mutateAsync(payload);
        }}
      />
      <Toast message={toast} onClose={() => setToast(null)} />
    </section>
  );
}
