import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { getErrorDetail } from '@/api/errors';
import { sentarComensales } from '@/api/mesas';
import { useAuth } from '@/auth/useAuth';
import { SentarComensales } from '@/components/SentarComensales';
import { AddDishes } from '@/pages/AddDishes';
import { LoginView } from '@/pages/LoginView';
import { MesaDetail } from '@/pages/MesaDetail';
import { MesasView } from '@/pages/MesasView';
import type { Mesa } from '@/types/api';

export function App(): JSX.Element {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);
  const [seatMesa, setSeatMesa] = useState<Mesa | null>(null);
  const [seatError, setSeatError] = useState<string | null>(null);
  const [mode, setMode] = useState<'mesas' | 'detalle' | 'agregar'>('mesas');

  const seatMutation = useMutation({
    mutationFn: ({ mesa, comensales }: { mesa: Mesa; comensales: number }) => sentarComensales(mesa.id_mesa, comensales),
    onSuccess: (response, variables) => {
      const openedMesa: Mesa = {
        ...variables.mesa,
        estado: 'ocupada',
        pedido_activo: {
          id_pedido: response.id_pedido,
          comensales: variables.comensales,
          abierto_en: new Date().toISOString(),
          minutos: 0,
          total: 0,
          curso_actual: 'Sin curso',
          items_count: 0,
          en_cocina: 0,
          alerta: 0,
          progreso: 'Esperando orden',
        },
      };
      setSeatMesa(null);
      setSeatError(null);
      setSelectedMesa(openedMesa);
      setMode('detalle');
      void queryClient.invalidateQueries({ queryKey: ['mesas', 'mesero'] });
    },
    onError: (error) => setSeatError(getErrorDetail(error, 'No se pudo crear el pedido')),
  });

  if (!isAuthenticated) return <LoginView />;
  if (selectedMesa && mode === 'agregar' && selectedMesa.pedido_activo) {
    return (
      <AddDishes
        mesa={selectedMesa}
        idPedido={selectedMesa.pedido_activo.id_pedido}
        onBack={() => setMode('detalle')}
        onDone={() => setMode('detalle')}
      />
    );
  }
  if (selectedMesa && mode === 'detalle') {
    return (
      <MesaDetail
        mesa={selectedMesa}
        onBack={() => {
          setSelectedMesa(null);
          setMode('mesas');
        }}
        onAddDishes={() => setMode('agregar')}
        onPaid={() => {
          setSelectedMesa(null);
          setMode('mesas');
        }}
      />
    );
  }

  return (
    <>
      <MesasView
        meseroNombre={user?.nombre ?? 'Mesero UTTOF'}
        onOpenMesa={(mesa) => {
          setSelectedMesa(mesa);
          setMode('detalle');
        }}
        onSeatMesa={(mesa) => {
          setSeatError(null);
          setSeatMesa(mesa);
        }}
      />
      <SentarComensales
        mesa={seatMesa}
        isSubmitting={seatMutation.isPending}
        errorMessage={seatError}
        onClose={() => {
          setSeatMesa(null);
          setSeatError(null);
        }}
        onConfirm={(mesa, comensales) => seatMutation.mutate({ mesa, comensales })}
      />
    </>
  );
}
