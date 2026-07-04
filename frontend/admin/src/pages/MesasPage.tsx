import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { RefreshCw, Table2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { getErrorDetail } from '@/api/errors';
import { getMesas, updateMesaEstado } from '@/api/mesas';
import { MesaCard } from '@/components/mesas/MesaCard';
import { MesaDetailModal } from '@/components/mesas/MesaDetailModal';
import { mesaStatePresentation } from '@/components/mesas/mesaPresentation';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import type { Mesa, MesaEstado } from '@/types/api';

type MesaFilter = 'all' | MesaEstado;

interface UpdateMesaVariables {
  idMesa: number;
  estado: MesaEstado;
}

const filters: Array<{ value: MesaFilter; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'libre', label: 'Libres' },
  { value: 'ocupada', label: 'Ocupadas' },
  { value: 'reservada', label: 'Reservadas' },
  { value: 'limpieza', label: 'Limpieza' },
];

function MesasSkeleton(): JSX.Element {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Skeleton className="h-10 w-[220px]" />
          <Skeleton className="mt-2 h-5 w-[300px]" />
        </div>
        <Skeleton className="h-10 w-[124px]" />
      </div>
      <Skeleton className="h-[58px] rounded-lg" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-[220px] rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function MesasPage(): JSX.Element {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [activeFilter, setActiveFilter] = useState<MesaFilter>('all');
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);

  const mesasQuery = useQuery({
    queryKey: ['mesas'],
    queryFn: getMesas,
    refetchInterval: 30000,
  });

  const mesas = mesasQuery.data ?? [];
  const visibleMesas = useMemo(
    () => (activeFilter === 'all' ? mesas : mesas.filter((mesa) => mesa.estado === activeFilter)),
    [activeFilter, mesas],
  );

  const counts = useMemo(() => {
    const nextCounts: Record<MesaEstado, number> = {
      libre: 0,
      ocupada: 0,
      reservada: 0,
      limpieza: 0,
    };

    for (const mesa of mesas) {
      nextCounts[mesa.estado] += 1;
    }

    return nextCounts;
  }, [mesas]);

  const updateMutation = useMutation({
    mutationFn: ({ idMesa, estado }: UpdateMesaVariables) => updateMesaEstado(idMesa, estado),
    onSuccess: async (mesa) => {
      await queryClient.invalidateQueries({ queryKey: ['mesas'] });
      setSelectedMesa(null);
      showToast({
        variant: 'success',
        title: 'Estado actualizado',
        description: `Mesa ${mesa.numero} ahora está ${mesaStatePresentation[mesa.estado].label.toLocaleLowerCase('es-PE')}.`,
      });
    },
    onError: (error) => {
      showToast({
        variant: 'error',
        title: 'No se pudo guardar',
        description: getErrorDetail(error, 'Intenta nuevamente en unos segundos.'),
      });
    },
  });

  async function handleUpdateState(estado: MesaEstado): Promise<void> {
    if (!selectedMesa) return;
    await updateMutation.mutateAsync({ idMesa: selectedMesa.id_mesa, estado });
  }

  if (mesasQuery.isLoading) {
    return <MesasSkeleton />;
  }

  if (mesasQuery.isError) {
    return (
      <ErrorState
        title="No se pudieron cargar las mesas"
        message={getErrorDetail(mesasQuery.error, 'No pudimos consultar la distribución actual del restaurante.')}
        onRetry={() => {
          void mesasQuery.refetch();
        }}
      />
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-sky-100 text-sky-500">
              <Table2 aria-hidden="true" size={20} strokeWidth={1.8} />
            </div>
            <h1 className="font-serif text-[36px] font-semibold leading-tight text-ink-900">Mesas</h1>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-500">
            <span>{mesas.length} mesas</span>
            <span aria-hidden="true">·</span>
            <span>{counts.ocupada} ocupadas</span>
            <span aria-hidden="true">·</span>
            <span>{counts.libre} libres</span>
            {mesasQuery.isFetching ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5 text-sage-500">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage-500" />
                  Actualizando
                </span>
              </>
            ) : null}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          loading={mesasQuery.isFetching}
          onClick={() => {
            void mesasQuery.refetch();
          }}
        >
          <RefreshCw aria-hidden="true" size={15} strokeWidth={1.8} />
          Actualizar
        </Button>
      </div>

      <section className="mb-5 rounded-lg border border-[rgba(42,30,20,0.08)] bg-white p-3 shadow-sm-soft">
        <div className="scrollbar-none flex gap-2 overflow-x-auto" aria-label="Filtrar mesas por estado">
          {filters.map((filter) => {
            const count = filter.value === 'all' ? mesas.length : counts[filter.value];
            const isActive = activeFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                className={clsx(
                  'inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-[13px] font-medium transition',
                  isActive ? 'bg-cream-100 text-ink-900' : 'text-ink-500 hover:bg-cream-50 hover:text-ink-700',
                )}
                aria-pressed={isActive}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-ink-500 shadow-sm-soft tnum">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {mesas.length === 0 ? (
        <EmptyState
          title="Aún no hay mesas"
          description="El catálogo de mesas está vacío. Agrega mesas desde la configuración inicial del backend."
        />
      ) : visibleMesas.length === 0 ? (
        <EmptyState
          title="Sin mesas en este estado"
          description="Selecciona otro filtro para revisar la distribución actual."
          action={
            <Button type="button" variant="ghost" onClick={() => setActiveFilter('all')}>
              Ver todas
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleMesas.map((mesa) => (
            <MesaCard key={mesa.id_mesa} mesa={mesa} onOpen={setSelectedMesa} />
          ))}
        </div>
      )}

      {selectedMesa ? (
        <MesaDetailModal
          mesa={selectedMesa}
          isSubmitting={updateMutation.isPending}
          onClose={() => setSelectedMesa(null)}
          onSubmit={handleUpdateState}
        />
      ) : null}
    </>
  );
}
