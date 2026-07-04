import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Filter, Plus, Search, Utensils } from 'lucide-react';
import { useMemo, useState } from 'react';

import { getErrorDetail } from '@/api/errors';
import { createPlatillo, getCategorias, getPlatillos, updatePlatillo } from '@/api/menu';
import { PlatilloCard } from '@/components/menu/PlatilloCard';
import { PlatilloFormModal } from '@/components/menu/PlatilloFormModal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import type { Categoria, Platillo, PlatilloWrite } from '@/types/api';

type AvailabilityFilter = 'all' | 'available' | 'unavailable';

type ModalState =
  | { mode: 'create' }
  | {
      mode: 'edit';
      platillo: Platillo;
    };

interface UpdatePlatilloVariables {
  idPlatillo: number;
  payload: Partial<PlatilloWrite>;
  intent: 'edit' | 'toggle';
}

interface PlatilloGroup {
  categoria: Categoria | null;
  platillos: Platillo[];
}

function MenuSkeleton(): JSX.Element {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Skeleton className="h-10 w-[220px]" />
          <Skeleton className="mt-2 h-5 w-[320px]" />
        </div>
        <Skeleton className="h-10 w-[150px]" />
      </div>
      <Skeleton className="h-[92px] rounded-lg" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-[324px] rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase('es-PE');
}

function buildGroups(
  categorias: Categoria[],
  platillos: Platillo[],
  selectedCategoryId: number | undefined,
): PlatilloGroup[] {
  const categoriasToRender =
    selectedCategoryId === undefined
      ? categorias
      : categorias.filter((categoria) => categoria.id_categoria === selectedCategoryId);

  const groups: PlatilloGroup[] = categoriasToRender
    .map((categoria): PlatilloGroup => ({
      categoria,
      platillos: platillos.filter((platillo) => platillo.id_categoria === categoria.id_categoria),
    }))
    .filter((group) => group.platillos.length > 0);

  const uncategorized = platillos.filter((platillo) => platillo.id_categoria === null);
  if (uncategorized.length > 0 && selectedCategoryId === undefined) {
    groups.push({ categoria: null, platillos: uncategorized });
  }

  return groups;
}

export function MenuPage(): JSX.Element {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalState, setModalState] = useState<ModalState | null>(null);

  const selectedCategoryId = categoryFilter === 'all' ? undefined : Number(categoryFilter);

  const categoriasQuery = useQuery({
    queryKey: ['menu', 'categorias'],
    queryFn: getCategorias,
  });

  const platillosQuery = useQuery({
    queryKey: ['menu', 'platillos', selectedCategoryId ?? 'all'],
    queryFn: () => getPlatillos({ categoria_id: selectedCategoryId, limit: 50 }),
  });

  const categorias = categoriasQuery.data ?? [];
  const platillos = platillosQuery.data?.data ?? [];

  const categoriaNameById = useMemo(() => {
    return new Map(categorias.map((categoria) => [categoria.id_categoria, categoria.nombre]));
  }, [categorias]);

  const filteredPlatillos = useMemo(() => {
    const normalizedSearch = normalizeSearch(searchTerm);

    return platillos.filter((platillo) => {
      const matchesSearch = normalizedSearch === '' || normalizeSearch(platillo.nombre).includes(normalizedSearch);
      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && platillo.disponible) ||
        (availabilityFilter === 'unavailable' && !platillo.disponible);

      return matchesSearch && matchesAvailability;
    });
  }, [availabilityFilter, platillos, searchTerm]);

  const groupedPlatillos = useMemo(
    () => buildGroups(categorias, filteredPlatillos, selectedCategoryId),
    [categorias, filteredPlatillos, selectedCategoryId],
  );

  const availableCount = platillos.filter((platillo) => platillo.disponible).length;
  const unavailableCount = platillos.length - availableCount;
  const hasActiveFilters = categoryFilter !== 'all' || availabilityFilter !== 'all' || searchTerm.trim() !== '';
  const activeError = categoriasQuery.error ?? platillosQuery.error;
  const isInitialLoading = categoriasQuery.isLoading || platillosQuery.isLoading;
  const isReloading = categoriasQuery.isFetching || platillosQuery.isFetching;

  const createMutation = useMutation({
    mutationFn: createPlatillo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['menu'] });
      setModalState(null);
      showToast({ variant: 'success', title: 'Platillo creado', description: 'El menú se actualizó correctamente.' });
    },
    onError: (error) => {
      showToast({
        variant: 'error',
        title: 'No se pudo crear',
        description: getErrorDetail(error, 'Revisa los datos e intenta de nuevo.'),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ idPlatillo, payload }: UpdatePlatilloVariables) => updatePlatillo(idPlatillo, payload),
    onSuccess: async (platillo, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['menu'] });
      if (variables.intent === 'edit') {
        setModalState(null);
      }

      showToast({
        variant: 'success',
        title: variables.intent === 'toggle' ? 'Disponibilidad actualizada' : 'Platillo actualizado',
        description:
          variables.intent === 'toggle'
            ? `${platillo.nombre} ahora está ${platillo.disponible ? 'disponible' : 'agotado'}.`
            : 'Los cambios se guardaron correctamente.',
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

  function clearFilters(): void {
    setCategoryFilter('all');
    setAvailabilityFilter('all');
    setSearchTerm('');
  }

  async function handleFormSubmit(payload: PlatilloWrite): Promise<void> {
    if (modalState?.mode === 'edit') {
      await updateMutation.mutateAsync({
        idPlatillo: modalState.platillo.id_platillo,
        payload,
        intent: 'edit',
      });
      return;
    }

    await createMutation.mutateAsync(payload);
  }

  function handleToggleDisponible(platillo: Platillo): void {
    updateMutation.mutate({
      idPlatillo: platillo.id_platillo,
      payload: { disponible: !platillo.disponible },
      intent: 'toggle',
    });
  }

  function isToggling(platillo: Platillo): boolean {
    return (
      updateMutation.isPending &&
      updateMutation.variables?.intent === 'toggle' &&
      updateMutation.variables.idPlatillo === platillo.id_platillo
    );
  }

  if (isInitialLoading) {
    return <MenuSkeleton />;
  }

  if (categoriasQuery.isError || platillosQuery.isError) {
    return (
      <ErrorState
        title="No se pudo cargar el menú"
        message={getErrorDetail(activeError, 'No pudimos consultar categorías y platillos.')}
        onRetry={() => {
          void categoriasQuery.refetch();
          void platillosQuery.refetch();
        }}
      />
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-terracotta-100 text-terracotta-500">
              <Utensils aria-hidden="true" size={20} strokeWidth={1.8} />
            </div>
            <h1 className="font-serif text-[36px] font-semibold leading-tight text-ink-900">Menú</h1>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-500">
            <span>{platillos.length} platillos</span>
            <span aria-hidden="true">·</span>
            <span>{availableCount} disponibles</span>
            <span aria-hidden="true">·</span>
            <span>{unavailableCount} agotados</span>
            {isReloading ? (
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
        <Button type="button" variant="primary" onClick={() => setModalState({ mode: 'create' })}>
          <Plus aria-hidden="true" size={16} strokeWidth={1.8} />
          Nuevo platillo
        </Button>
      </div>

      <section className="mb-5 rounded-lg border border-[rgba(42,30,20,0.08)] bg-white p-4 shadow-sm-soft">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end">
          <div>
            <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="menu-search">
              Buscar
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                size={16}
                strokeWidth={1.8}
              />
              <input
                id="menu-search"
                type="search"
                value={searchTerm}
                className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] pl-9 pr-3.5 text-sm text-ink-900 placeholder:text-ink-400 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
                placeholder="Buscar por nombre"
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="menu-category">
              Categoría
            </label>
            <select
              id="menu-category"
              value={categoryFilter}
              className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="menu-availability">
              Disponibilidad
            </label>
            <select
              id="menu-availability"
              value={availabilityFilter}
              className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
              onChange={(event) => setAvailabilityFilter(event.target.value as AvailabilityFilter)}
            >
              <option value="all">Todos</option>
              <option value="available">Disponibles</option>
              <option value="unavailable">Agotados</option>
            </select>
          </div>

          <Button type="button" variant="ghost" onClick={clearFilters} disabled={!hasActiveFilters}>
            <Filter aria-hidden="true" size={15} strokeWidth={1.8} />
            Limpiar
          </Button>
        </div>
      </section>

      {platillos.length === 0 ? (
        <EmptyState
          title="Aún no hay platillos"
          description="Crea el primer platillo del catálogo para verlo en esta vista."
          action={
            <Button type="button" variant="primary" onClick={() => setModalState({ mode: 'create' })}>
              <Plus aria-hidden="true" size={16} strokeWidth={1.8} />
              Nuevo platillo
            </Button>
          }
        />
      ) : filteredPlatillos.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="No hay platillos que coincidan con los filtros activos."
          action={
            <Button type="button" variant="ghost" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        <div className="space-y-7">
          {groupedPlatillos.map((group) => (
            <section key={group.categoria?.id_categoria ?? 'sin-categoria'} className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-h2 text-ink-900">{group.categoria?.nombre ?? 'Sin categoría'}</h2>
                  <p className="text-[12.5px] text-ink-500">{group.platillos.length} platillos</p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {group.platillos.map((platillo) => (
                  <PlatilloCard
                    key={platillo.id_platillo}
                    platillo={platillo}
                    categoriaNombre={categoriaNameById.get(platillo.id_categoria ?? 0) ?? 'Sin categoría'}
                    isUpdating={isToggling(platillo)}
                    onEdit={(nextPlatillo) => setModalState({ mode: 'edit', platillo: nextPlatillo })}
                    onToggleDisponible={handleToggleDisponible}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {modalState ? (
        <PlatilloFormModal
          mode={modalState.mode}
          categorias={categorias}
          platillo={modalState.mode === 'edit' ? modalState.platillo : undefined}
          isSubmitting={createMutation.isPending || (updateMutation.isPending && updateMutation.variables?.intent === 'edit')}
          onClose={() => setModalState(null)}
          onSubmit={handleFormSubmit}
        />
      ) : null}
    </>
  );
}
