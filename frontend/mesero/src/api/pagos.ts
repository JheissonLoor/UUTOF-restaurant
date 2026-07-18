import { apiClient } from '@/api/client';
import type { PagoPendiente, PagoRequest, PagoResponse } from '@/types/api';

export async function registrarPago(payload: PagoRequest): Promise<PagoResponse> {
  const response = await apiClient.post<PagoResponse>('/pagos', payload);
  return response.data;
}

export async function getPagosPendientes(): Promise<PagoPendiente[]> {
  const response = await apiClient.get<PagoPendiente[]>('/pagos/pendientes');
  return response.data.map((pago) => ({
    ...pago,
    monto: Number(pago.monto),
    propina: Number(pago.propina),
    total: Number(pago.total),
  }));
}

export async function verificarPagoEfectivo(idTransaccion: number, recibido: number): Promise<PagoResponse> {
  const response = await apiClient.post<PagoResponse>(`/pagos/${idTransaccion}/verificar`, { recibido });
  return response.data;
}
