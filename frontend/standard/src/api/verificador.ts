import { apiClient } from '@/api/client';
import type { PagoPendiente, PagoResponse } from '@/types';

export async function getPagosPendientes(): Promise<PagoPendiente[]> {
  const response = await apiClient.get<PagoPendiente[]>('/pagos/pendientes');
  return response.data;
}

export async function verificarPago(idTransaccion: number, recibido: number): Promise<PagoResponse> {
  const response = await apiClient.post<PagoResponse>(`/pagos/${idTransaccion}/verificar`, { recibido });
  return response.data;
}
