import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, MapPin } from 'lucide-react';
import { toast } from 'sonner';

import { cambiarEstadoMesa } from '@/api/admin';
import { getMesas } from '@/api/pedidos';
import { cn } from '@/lib/utils';
import { ErrorState } from '@/components/ErrorState';
import type { EstadoMesa } from '@/types';

const ESTADOS: EstadoMesa[] = ['libre', 'ocupada', 'reservada', 'lista', 'limpieza'];

const estadoStyle: Record<EstadoMesa, string> = {
  libre: 'text-status-paid bg-status-paid/10',
  ocupada: 'text-status-cancelled bg-status-cancelled/10',
  reservada: 'text-status-unpaid bg-status-unpaid/10',
  lista: 'text-status-done bg-status-done/10',
  limpieza: 'text-muted-foreground bg-muted',
};

export function MesasAdmin() {
  const queryClient = useQueryClient();
  const { data: mesas, isLoading, isError, refetch } = useQuery({ queryKey: ['mesas'], queryFn: getMesas });

  const estadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoMesa }) => cambiarEstadoMesa(id, estado),
    onSuccess: () => {
      toast.success('Estado actualizado');
      void queryClient.invalidateQueries({ queryKey: ['mesas'] });
    },
    onError: () => toast.error('No se pudo cambiar el estado.'),
  });

  if (isLoading) return <div className="max-w-4xl h-64 rounded-3xl bg-muted animate-pulse" />;
  if (isError || !mesas) return <ErrorState message="No se pudieron cargar las mesas." onRetry={() => refetch()} />;

  return (
    <div className="max-w-4xl">
      <h2 className="font-heading text-xl font-semibold mb-4">Mesas · {mesas.length}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mesas.map((m) => (
          <div key={m.id_mesa} className="bg-card rounded-3xl border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-heading text-2xl font-bold">#{m.numero}</span>
              <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize', estadoStyle[m.estado])}>
                {m.estado}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 capitalize">
              <MapPin className="h-3.5 w-3.5" /> {m.zona}
              <span className="mx-1">·</span>
              <Users className="h-3.5 w-3.5" /> {m.capacidad}
            </div>
            <select
              value={m.estado}
              onChange={(e) => estadoMutation.mutate({ id: m.id_mesa, estado: e.target.value as EstadoMesa })}
              className="w-full px-4 py-2.5 rounded-2xl border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none capitalize"
            >
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
