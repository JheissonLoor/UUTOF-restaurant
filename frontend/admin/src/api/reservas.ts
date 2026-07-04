import { addDays, formatISO } from 'date-fns';

import { apiClient } from '@/api/client';
import type { Reserva } from '@/types/api';

export async function getReservas(fecha: string): Promise<Reserva[]> {
  const response = await apiClient.get<Reserva[]>('/reservas', {
    params: { fecha },
  });
  return response.data;
}

export async function getReservasSemana(inicioSemana: Date): Promise<Reserva[]> {
  const requests = Array.from({ length: 7 }, (_, index) => {
    const fecha = formatISO(addDays(inicioSemana, index), { representation: 'date' });
    return getReservas(fecha);
  });

  const reservasPorDia = await Promise.all(requests);
  return reservasPorDia.flat();
}
