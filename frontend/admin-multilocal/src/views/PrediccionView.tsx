import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { applyRecommendation, getPrediccion } from '../api/prediccion';
import { getApiErrorMessage } from '../api/errors';
import { ForecastBanner } from '../components/prediccion/ForecastBanner';
import { ForecastChart } from '../components/prediccion/ForecastChart';
import { RecommendationList } from '../components/prediccion/RecommendationList';
import { BranchSelector } from '../components/shared/BranchSelector';
import { Toast } from '../components/shared/Toast';
import { useSucursal } from '../context/useSucursal';
import { TopBar } from '../layout/TopBar';
import type { AccionRecomendacion, RecomendacionIa } from '../types/multilocal';

interface RecommendationMutation {
  item: RecomendacionIa;
  action: AccionRecomendacion;
}

export function PrediccionView() {
  const queryClient = useQueryClient();
  const { sucursalActiva, sucursales } = useSucursal();
  const [toast, setToast] = useState<string | null>(null);
  const branchId = sucursalActiva === 'red' ? undefined : sucursalActiva;
  const query = useQuery({
    queryKey: ['prediccion', sucursalActiva],
    queryFn: () => getPrediccion(branchId),
  });
  const mutation = useMutation({
    mutationFn: ({ item, action }: RecommendationMutation) => applyRecommendation(item.id, action, branchId),
    onSuccess: (result) => {
      setToast(result.accion === 'aceptar' ? 'Recomendación aplicada.' : 'Recomendación descartada.');
      void queryClient.invalidateQueries({ queryKey: ['prediccion', sucursalActiva] });
    },
  });
  const scopeLabel = useMemo(() => {
    if (sucursalActiva === 'red') return 'toda la red';
    return sucursales.find((branch) => branch.id_sucursal === sucursalActiva)?.nombre ?? 'sucursal';
  }, [sucursalActiva, sucursales]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return (
    <section className="animate-view-in" aria-labelledby="titulo-prediccion">
      <TopBar
        title="Predicción IA"
        subtitle="Pronóstico de demanda y recomendaciones para la operación"
        titleId="titulo-prediccion"
        actions={<BranchSelector />}
      />

      {query.isError ? (
        <div role="alert" className="mb-4 flex items-center justify-between rounded-card border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
          <span>{getApiErrorMessage(query.error)}</span>
          <button type="button" onClick={() => void query.refetch()} className="flex h-9 items-center gap-2 rounded-card px-3 font-semibold hover:bg-danger/10">
            <RefreshCw size={15} aria-hidden="true" /> Reintentar
          </button>
        </div>
      ) : null}

      <ForecastBanner
        modelo={query.data?.modelo ?? 'v2.4'}
        confianza={query.data?.confianza ?? 0}
        picos={query.data?.picos ?? []}
        recalculadoEn={query.data?.recalculado_en ?? ''}
        loading={query.isPending}
      />
      <div className="mt-4 grid grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)] gap-4 max-[1050px]:grid-cols-1">
        <ForecastChart data={query.data?.pronostico} loading={query.isPending} scopeLabel={scopeLabel} />
        <RecommendationList
          items={query.data?.recomendaciones}
          loading={query.isPending}
          pendingId={mutation.isPending ? mutation.variables?.item.id : null}
          onAction={(item, action) => mutation.mutate({ item, action })}
        />
      </div>
      {mutation.isError ? (
        <p role="alert" className="mt-3 text-right text-xs text-danger">{getApiErrorMessage(mutation.error)}</p>
      ) : null}
      <Toast message={toast} onClose={() => setToast(null)} />
    </section>
  );
}
