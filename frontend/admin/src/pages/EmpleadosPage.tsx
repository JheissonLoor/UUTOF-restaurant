import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Filter, Plus, RefreshCw, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { getErrorDetail } from '@/api/errors';
import { createUsuario, getUsuarios, updateUsuario } from '@/api/usuarios';
import { UsuarioFormModal, type UsuarioFormSubmit } from '@/components/usuarios/UsuarioFormModal';
import { UsuarioRow } from '@/components/usuarios/UsuarioRow';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import type { UserRole, Usuario } from '@/types/api';

type RoleFilter = 'all' | UserRole;
type ModalState = { mode: 'create' } | { mode: 'edit'; usuario: Usuario };

const roleOptions: Array<{ value: RoleFilter; label: string }> = [
  { value: 'all', label: 'Todos los roles' },
  { value: 'admin', label: 'Administradores' },
  { value: 'mesero', label: 'Meseros' },
  { value: 'cocina', label: 'Cocina' },
  { value: 'cliente', label: 'Clientes' },
];

function UsuariosSkeleton(): JSX.Element {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Skeleton className="h-10 w-[220px]" />
          <Skeleton className="mt-2 h-5 w-[300px]" />
        </div>
        <Skeleton className="h-10 w-[150px]" />
      </div>
      <Skeleton className="h-[74px] rounded-lg" />
      <Skeleton className="h-[320px] rounded-lg" />
    </div>
  );
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase('es-PE');
}

export function EmpleadosPage(): JSX.Element {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalState, setModalState] = useState<ModalState | null>(null);

  const selectedRole = roleFilter === 'all' ? undefined : roleFilter;
  const usuariosQuery = useInfiniteQuery({
    queryKey: ['usuarios', selectedRole ?? 'all'],
    queryFn: ({ pageParam }) => getUsuarios({ rol: selectedRole, limit: 50, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });

  const usuarios = useMemo(() => usuariosQuery.data?.pages.flatMap((page) => page.data) ?? [], [usuariosQuery.data]);
  const visibleUsuarios = useMemo(() => {
    const normalizedSearch = normalizeSearch(searchTerm);
    if (normalizedSearch === '') return usuarios;

    return usuarios.filter((usuario) => {
      return normalizeSearch(usuario.nombre).includes(normalizedSearch) || normalizeSearch(usuario.email).includes(normalizedSearch);
    });
  }, [searchTerm, usuarios]);

  const createMutation = useMutation({
    mutationFn: createUsuario,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setModalState(null);
      showToast({ variant: 'success', title: 'Usuario creado', description: 'El nuevo acceso ya está disponible.' });
    },
    onError: (error) => {
      showToast({ variant: 'error', title: 'No se pudo crear', description: getErrorDetail(error, 'Revisa los datos e intenta de nuevo.') });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ idUsuario, payload }: Extract<UsuarioFormSubmit, { mode: 'edit' }>) => updateUsuario(idUsuario, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setModalState(null);
      showToast({ variant: 'success', title: 'Usuario actualizado', description: 'Los cambios se guardaron correctamente.' });
    },
    onError: (error) => {
      showToast({ variant: 'error', title: 'No se pudo guardar', description: getErrorDetail(error, 'Intenta nuevamente en unos segundos.') });
    },
  });

  async function handleSubmit(data: UsuarioFormSubmit): Promise<void> {
    if (data.mode === 'create') {
      await createMutation.mutateAsync(data.payload);
      return;
    }
    await updateMutation.mutateAsync(data);
  }

  function clearFilters(): void {
    setRoleFilter('all');
    setSearchTerm('');
  }

  if (usuariosQuery.isLoading) {
    return <UsuariosSkeleton />;
  }

  if (usuariosQuery.isError) {
    return (
      <ErrorState
        title="No se pudieron cargar los usuarios"
        message={getErrorDetail(usuariosQuery.error, 'No pudimos consultar la plantilla del restaurante.')}
        onRetry={() => {
          void usuariosQuery.refetch();
        }}
      />
    );
  }

  const hasActiveFilters = roleFilter !== 'all' || searchTerm.trim() !== '';
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-sky-100 text-sky-500">
              <Users aria-hidden="true" size={20} strokeWidth={1.8} />
            </div>
            <h1 className="font-serif text-[36px] font-semibold leading-tight text-ink-900">Usuarios</h1>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-500">
            <span>{usuarios.length} usuarios cargados</span>
            {usuariosQuery.isFetching ? (
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
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="ghost" loading={usuariosQuery.isFetching} onClick={() => void usuariosQuery.refetch()}>
            <RefreshCw aria-hidden="true" size={15} strokeWidth={1.8} />
            Actualizar
          </Button>
          <Button type="button" variant="primary" onClick={() => setModalState({ mode: 'create' })}>
            <Plus aria-hidden="true" size={16} strokeWidth={1.8} />
            Nuevo usuario
          </Button>
        </div>
      </div>

      <section className="mb-5 rounded-lg border border-[rgba(42,30,20,0.08)] bg-white p-4 shadow-sm-soft">
        <div className="grid gap-3 lg:grid-cols-[1fr_240px_auto] lg:items-end">
          <div>
            <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="usuarios-search">
              Buscar
            </label>
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={16} strokeWidth={1.8} />
              <input
                id="usuarios-search"
                type="search"
                value={searchTerm}
                className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] pl-9 pr-3.5 text-sm text-ink-900 placeholder:text-ink-400 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
                placeholder="Buscar por nombre o email"
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-label uppercase text-ink-500" htmlFor="usuarios-role">
              Rol
            </label>
            <select
              id="usuarios-role"
              value={roleFilter}
              className="h-10 w-full rounded-md border border-[rgba(42,30,20,0.14)] px-3.5 text-sm text-ink-900 transition focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100"
              onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
            >
              {roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
          </div>

          <Button type="button" variant="ghost" disabled={!hasActiveFilters} onClick={clearFilters}>
            <Filter aria-hidden="true" size={15} strokeWidth={1.8} />
            Limpiar
          </Button>
        </div>
      </section>

      {usuarios.length === 0 ? (
        <EmptyState
          title="Aún no hay usuarios"
          description="Crea el primer acceso para comenzar a gestionar el equipo."
          action={<Button type="button" variant="primary" onClick={() => setModalState({ mode: 'create' })}><Plus aria-hidden="true" size={16} strokeWidth={1.8} />Nuevo usuario</Button>}
        />
      ) : visibleUsuarios.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="No hay usuarios que coincidan con los filtros activos."
          action={<Button type="button" variant="ghost" onClick={clearFilters}>Limpiar filtros</Button>}
        />
      ) : (
        <section className="overflow-hidden rounded-lg border border-[rgba(42,30,20,0.08)] bg-white shadow-sm-soft">
          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full border-collapse text-left">
              <thead className="bg-cream-50 text-label uppercase text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Contacto</th>
                  <th className="px-4 py-3 font-semibold">Rol</th>
                  <th className="px-4 py-3 font-semibold">Alta</th>
                  <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>{visibleUsuarios.map((usuario) => <UsuarioRow key={usuario.id_usuario} usuario={usuario} onEdit={(nextUsuario) => setModalState({ mode: 'edit', usuario: nextUsuario })} />)}</tbody>
            </table>
          </div>
          {usuariosQuery.hasNextPage ? (
            <div className="border-t border-dashed border-[rgba(42,30,20,0.08)] p-4 text-center">
              <Button type="button" loading={usuariosQuery.isFetchingNextPage} onClick={() => void usuariosQuery.fetchNextPage()}>
                Cargar más
              </Button>
            </div>
          ) : null}
        </section>
      )}

      {modalState ? (
        <UsuarioFormModal
          mode={modalState.mode}
          usuario={modalState.mode === 'edit' ? modalState.usuario : undefined}
          isSubmitting={isSubmitting}
          onClose={() => setModalState(null)}
          onSubmit={handleSubmit}
        />
      ) : null}
    </>
  );
}
