import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, UtensilsCrossed } from 'lucide-react';
import { useMemo, useState } from 'react';

import { getErrorDetail } from '@/api/errors';
import { getMesas } from '@/api/mesas';
import { FilterTabs, type MesaFilter } from '@/components/FilterTabs';
import { MesaCard } from '@/components/MesaCard';
import { NuevaOrdenButton } from '@/components/NuevaOrdenButton';
import { Topbar } from '@/components/Topbar';
import { useWebSocket } from '@/realtime/useWebSocket';
import type { Mesa, WSEvent } from '@/types/api';

interface MesasViewProps {
  meseroNombre: string;
  onOpenMesa?: (mesa: Mesa) => void;
}

function matchesFilter(mesa: Mesa, filter: MesaFilter): boolean {
  if (filter === 'ocupadas') return mesa.estado === 'ocupada';
  if (filter === 'atencion') return mesa.estado === 'lista' || (mesa.pedido_activo?.alerta ?? 0) > 0;
  if (filter === 'libres') return mesa.estado === 'libre';
  return true;
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase('es-PE');
}

function updateFromRealtime(mesas: Mesa[], event: WSEvent): Mesa[] {
  return mesas.map((mesa) => {
    if ('id_mesa' in event && mesa.id_mesa !== event.id_mesa) return mesa;

    if (event.tipo === 'pedido.listo') {
      return {
        ...mesa,
        estado: 'lista',
        pedido_activo: mesa.pedido_activo
          ? { ...mesa.pedido_activo, alerta: 1, progreso: 'Plato listo en pase' }
          : mesa.pedido_activo,
      };
    }
    if (event.tipo === 'pedido.pagado_app') {
      const { pedido_activo: _pedidoActivo, ...mesaLibre } = mesa;
      return { ...mesaLibre, estado: 'libre' };
    }
    if (event.tipo === 'mesa.checkin') return { ...mesa, estado: 'ocupada' };
    return mesa;
  });
}

function MesaGridSkeleton(): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-3" aria-label="Cargando mesas">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-[150px] animate-shimmer rounded-lg bg-[linear-gradient(90deg,#F4ECE0_0%,#FAF6F0_48%,#F4ECE0_100%)] bg-[length:200%_100%]" />
      ))}
    </div>
  );
}

export function MesasView({ meseroNombre, onOpenMesa }: MesasViewProps): JSX.Element {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<MesaFilter>('todas');
  const [searchTerm, setSearchTerm] = useState('');

  const mesasQuery = useQuery({
    queryKey: ['mesas', 'mesero'],
    queryFn: getMesas,
    refetchInterval: 20000,
  });

  useWebSocket({
    onEvent: (event) => {
      queryClient.setQueryData<Mesa[]>(['mesas', 'mesero'], (current) => current ? updateFromRealtime(current, event) : current);
    },
  });

  const mesas = mesasQuery.data ?? [];
  const visibleMesas = useMemo(() => {
    const search = normalizeSearch(searchTerm);
    return mesas.filter((mesa) => {
      const zone = mesa.zona ?? '';
      const orderId = mesa.pedido_activo?.id_pedido.toString() ?? '';
      const matchesSearch = search === ''
        || mesa.numero.toString().includes(search)
        || zone.includes(search)
        || orderId.includes(search);
      return matchesSearch && matchesFilter(mesa, activeFilter);
    });
  }, [activeFilter, mesas, searchTerm]);

  function showAvailableTables(): void {
    setSearchTerm('');
    setActiveFilter('libres');
  }

  return (
    <main className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-cream-50 text-ink-900" data-screen-label="01 Mesas">
      <Topbar meseroNombre={meseroNombre} mesas={mesas} searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <FilterTabs activeFilter={activeFilter} mesas={mesas} onChange={setActiveFilter} />

      <section className="scrollbar-none flex-1 overflow-y-auto px-4 pb-24 pt-1" aria-live="polite">
        {mesasQuery.isLoading ? <MesaGridSkeleton /> : null}

        {mesasQuery.isError ? (
          <div className="rounded-lg border border-wine-100 bg-white p-5 text-center shadow-sm-soft">
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-wine-100 text-wine-500">
              <RefreshCw aria-hidden="true" size={19} />
            </div>
            <h2 className="mt-3 font-serif text-h2">No pudimos cargar tus mesas</h2>
            <p className="mt-1 text-sm text-ink-500">{getErrorDetail(mesasQuery.error, 'Revisa la conexion e intenta nuevamente.')}</p>
            <button type="button" className="mt-4 h-11 rounded-md bg-ink-900 px-5 text-sm font-semibold text-white" onClick={() => void mesasQuery.refetch()}>
              Reintentar
            </button>
          </div>
        ) : null}

        {mesasQuery.isSuccess && mesas.length === 0 ? (
          <div className="grid min-h-[260px] place-items-center rounded-lg border border-dashed border-[rgba(31,26,20,0.16)] bg-white px-6 text-center">
            <div>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-cream-100 text-ink-400">
                <UtensilsCrossed aria-hidden="true" size={21} />
              </div>
              <h2 className="mt-3 font-serif text-h2">No tienes mesas en este turno</h2>
              <p className="mt-1 text-sm text-ink-500">Cuando te asignen una mesa aparecera aqui.</p>
            </div>
          </div>
        ) : null}

        {mesasQuery.isSuccess && mesas.length > 0 && visibleMesas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[rgba(31,26,20,0.16)] bg-white px-6 py-10 text-center">
            <h2 className="font-serif text-h2">Sin resultados</h2>
            <p className="mt-1 text-sm text-ink-500">No hay mesas que coincidan con la busqueda o filtro.</p>
          </div>
        ) : null}

        {visibleMesas.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {visibleMesas.map((mesa) => <MesaCard key={mesa.id_mesa} mesa={mesa} onOpen={onOpenMesa} />)}
          </div>
        ) : null}
      </section>

      <NuevaOrdenButton disabled={!mesas.some((mesa) => mesa.estado === 'libre')} onClick={showAvailableTables} />
    </main>
  );
}
