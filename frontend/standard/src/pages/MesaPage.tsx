import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, MapPin, Check } from 'lucide-react';
import { toast } from 'sonner';

import { checkinMesa, getMesas } from '@/api/pedidos';
import { cn } from '@/lib/utils';
import { useOrder } from '@/order/useOrder';
import { ErrorState } from '@/components/ErrorState';
import type { EstadoMesa, MesaPublica } from '@/types';

const estadoLabel: Record<EstadoMesa, string> = {
  libre: 'Disponible',
  ocupada: 'Ocupada',
  reservada: 'Reservada',
  lista: 'Lista',
  limpieza: 'En limpieza',
};

const estadoStyle: Record<EstadoMesa, string> = {
  libre: 'text-status-paid bg-status-paid/10',
  ocupada: 'text-status-cancelled bg-status-cancelled/10',
  reservada: 'text-status-unpaid bg-status-unpaid/10',
  lista: 'text-status-done bg-status-done/10',
  limpieza: 'text-muted-foreground bg-muted',
};

export default function MesaPage() {
  const { data: mesas, isLoading, isError, refetch } = useQuery({ queryKey: ['mesas'], queryFn: getMesas });
  const { mesa: mesaActual, setMesa } = useOrder();
  const navigate = useNavigate();

  const checkinMutation = useMutation({
    mutationFn: (idMesa: number) => checkinMesa(idMesa),
    onSuccess: (mesa) => {
      setMesa(mesa);
      toast.success(`Mesa #${mesa.numero} seleccionada`);
      navigate('/menu');
    },
    onError: () => toast.error('No se pudo seleccionar la mesa. Intenta con otra.'),
  });

  const handleSelect = (m: MesaPublica) => {
    if (m.estado !== 'libre') {
      toast.info('Esa mesa no está disponible.');
      return;
    }
    checkinMutation.mutate(m.id_mesa);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="h-9 w-48 rounded-xl bg-muted animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }
  if (isError) return <ErrorState message="No se pudieron cargar las mesas." onRetry={() => refetch()} />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold mb-1">Elige tu mesa</h1>
        <p className="text-muted-foreground text-sm">Selecciona una mesa disponible para empezar tu pedido.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {mesas?.map((m, i) => {
          const seleccionada = mesaActual?.id_mesa === m.id_mesa;
          const disponible = m.estado === 'libre';
          return (
            <motion.button
              key={m.id_mesa}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={disponible ? { scale: 1.03 } : undefined}
              whileTap={disponible ? { scale: 0.97 } : undefined}
              onClick={() => handleSelect(m)}
              disabled={!disponible || checkinMutation.isPending}
              className={cn(
                'relative text-left rounded-3xl border p-5 transition-all',
                disponible ? 'bg-card hover:shadow-lg hover:border-primary/30 cursor-pointer' : 'bg-muted/40 cursor-not-allowed opacity-70',
                seleccionada && 'border-primary ring-2 ring-primary/30',
              )}
            >
              {seleccionada && (
                <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
              <div className="font-heading text-2xl font-bold mb-1">#{m.numero}</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 capitalize">
                <MapPin className="h-3.5 w-3.5" /> {m.zona}
                <span className="mx-1">·</span>
                <Users className="h-3.5 w-3.5" /> {m.capacidad}
              </div>
              <span className={cn('inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full', estadoStyle[m.estado])}>
                {estadoLabel[m.estado]}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
