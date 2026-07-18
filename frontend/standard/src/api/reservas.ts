import { apiClient } from '@/api/client';
import type { ReservaCreateRequest, ReservaPublica } from '@/types';

export async function getReservas(fecha: string): Promise<ReservaPublica[]> {
  const response = await apiClient.get<ReservaPublica[]>('/reservas', { params: { fecha } });
  return response.data;
}

export async function crearReserva(payload: ReservaCreateRequest): Promise<ReservaPublica> {
  const response = await apiClient.post<ReservaPublica>('/reservas', payload);
  return response.data;
}
