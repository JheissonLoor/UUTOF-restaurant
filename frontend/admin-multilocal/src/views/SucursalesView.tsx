import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/errors';
import { getMetricasConsolidado } from '../api/multilocal';
import { createSucursal, getSucursales, getSucursalesComparativa } from '../api/sucursales';
import { useAuth } from '../auth/useAuth';
import { Toast } from '../components/shared/Toast';
import { BranchCompareTable } from '../components/sucursales/BranchCompareTable';
import { BranchGrid } from '../components/sucursales/BranchGrid';
import { NuevaSucursalModal } from '../components/sucursales/NuevaSucursalModal';
import { useSucursal } from '../context/useSucursal';
import { TopBar } from '../layout/TopBar';
import type { NuevaSucursalRequest, SucursalResumen } from '../types/multilocal';

export function SucursalesView() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { setSucursal } = useSucursal();
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const branchesQuery = useQuery({ queryKey: ['sucursales'], queryFn: getSucursales });
  const performanceQuery = useQuery({
    queryKey: ['metricas', 'consolidado', '7d'],
    queryFn: () => getMetricasConsolidado('7d'),
  });
  const comparisonQuery = useQuery({
    queryKey: ['sucursales', 'comparativa'],
    queryFn: getSucursalesComparativa,
  });
  const createMutation = useMutation({
    mutationFn: createSucursal,
    onSuccess: async (branch) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sucursales'] }),
        queryClient.invalidateQueries({ queryKey: ['metricas'] }),
      ]);
      setModalOpen(false);
      setToast(`${branch.nombre} fue creada correctamente.`);
    },
  });

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const loading = branchesQuery.isPending || performanceQuery.isPending;
  const error = branchesQuery.error ?? performanceQuery.error ?? comparisonQuery.error;

  function manageBranch(branch: SucursalResumen) {
    setSucursal(branch.id_sucursal);
    navigate('/admin/menu');
  }

  return (
    <section className="animate-view-in" aria-labelledby="titulo-sucursales">
      <TopBar
        title="Sucursales"
        subtitle={`${branchesQuery.data?.length ?? '—'} locales activos en la red UTTOF`}
        titleId="titulo-sucursales"
        actions={
          usuario?.rol !== 'gerente_sucursal' ? (
            <button type="button" onClick={() => setModalOpen(true)} className="flex h-10 items-center gap-2 rounded-card bg-ink px-4 text-[13px] font-semibold text-white hover:bg-ink2">
              <Plus size={16} aria-hidden="true" />
              Nueva sucursal
            </button>
          ) : null
        }
      />

      {error ? (
        <div role="alert" className="mb-4 flex items-center justify-between rounded-card border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
          <span>{getApiErrorMessage(error)}</span>
          <button type="button" onClick={() => void Promise.all([branchesQuery.refetch(), performanceQuery.refetch(), comparisonQuery.refetch()])} className="flex h-9 items-center gap-2 rounded-card px-3 font-semibold hover:bg-danger/10">
            <RefreshCw size={15} aria-hidden="true" /> Reintentar
          </button>
        </div>
      ) : null}

      <BranchGrid branches={branchesQuery.data} performance={performanceQuery.data?.por_sucursal} loading={loading} onManage={manageBranch} />

      <div className="mb-3 mt-7 flex items-center gap-2">
        <h2 className="font-mono text-[10px] font-semibold uppercase text-ink4">Comparativa de la red</h2>
        <span className="h-px flex-1 bg-[#E7DED3]" />
      </div>
      <BranchCompareTable rows={comparisonQuery.data} loading={comparisonQuery.isPending} />

      <NuevaSucursalModal
        open={modalOpen}
        submitting={createMutation.isPending}
        error={createMutation.isError ? getApiErrorMessage(createMutation.error) : null}
        onClose={() => {
          if (!createMutation.isPending) {
            createMutation.reset();
            setModalOpen(false);
          }
        }}
        onSubmit={async (payload: NuevaSucursalRequest) => {
          await createMutation.mutateAsync(payload);
        }}
      />
      <Toast message={toast} onClose={() => setToast(null)} />
    </section>
  );
}
