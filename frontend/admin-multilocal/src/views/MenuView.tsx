import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '../api/errors';
import { createPlatilloMultilocal, deletePlatilloMultilocal, getCategoriasMenu, getMenuMultilocal, updatePlatilloMultilocal } from '../api/operacion';
import { MenuManager } from '../components/menu/MenuManager';
import { BranchSelector } from '../components/shared/BranchSelector';
import { Toast } from '../components/shared/Toast';
import { useSucursal } from '../context/useSucursal';
import { TopBar } from '../layout/TopBar';
import type { MenuMultilocalItem, PlatilloMultilocalCreate, PlatilloMultilocalPatch } from '../types/multilocal';

type MenuMutation =
  | { type: 'create'; payload: PlatilloMultilocalCreate }
  | { type: 'update'; item: MenuMultilocalItem; payload: PlatilloMultilocalPatch }
  | { type: 'delete'; item: MenuMultilocalItem };

export function MenuView() {
  const queryClient = useQueryClient();
  const { sucursalActiva, sucursales } = useSucursal();
  const [toast, setToast] = useState<string | null>(null);
  const branchId = sucursalActiva === 'red' ? undefined : sucursalActiva;
  const menuQuery = useQuery({ queryKey: ['menu-multilocal', sucursalActiva], queryFn: () => getMenuMultilocal(branchId) });
  const categoriesQuery = useQuery({ queryKey: ['menu-categorias'], queryFn: getCategoriasMenu, staleTime: 300_000 });
  const mutation = useMutation({
    mutationFn: async (request: MenuMutation) => {
      if (request.type === 'create') return createPlatilloMultilocal(request.payload);
      if (request.type === 'update') return updatePlatilloMultilocal(request.item.id_platillo, request.payload);
      await deletePlatilloMultilocal(request.item.id_platillo, request.item.id_sucursal);
      return null;
    },
    onSuccess: (_, request) => {
      setToast(request.type === 'create' ? 'Platillo creado.' : request.type === 'delete' ? 'Platillo retirado.' : 'Platillo actualizado.');
      void queryClient.invalidateQueries({ queryKey: ['menu-multilocal'] });
    },
  });

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const error = menuQuery.isError ? menuQuery.error : categoriesQuery.isError ? categoriesQuery.error : mutation.isError ? mutation.error : null;
  return (
    <section className="animate-view-in" aria-labelledby="titulo-menu">
      <TopBar title="Menú" subtitle="Gestiona la carta, precios y disponibilidad por sucursal" titleId="titulo-menu" actions={<BranchSelector />} />
      {error ? <p role="alert" className="mb-3 rounded-card border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">{getApiErrorMessage(error)}</p> : null}
      <MenuManager
        items={menuQuery.data}
        categories={categoriesQuery.data ?? []}
        branches={sucursales}
        activeBranch={sucursalActiva}
        loading={menuQuery.isPending || categoriesQuery.isPending}
        saving={mutation.isPending}
        onCreate={async (payload) => { await mutation.mutateAsync({ type: 'create', payload }); }}
        onUpdate={(item, payload) => mutation.mutate({ type: 'update', item, payload })}
        onDelete={(item) => mutation.mutate({ type: 'delete', item })}
      />
      <Toast message={toast} onClose={() => setToast(null)} />
    </section>
  );
}
