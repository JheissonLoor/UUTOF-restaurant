import { apiClient } from '@/api/client';
import type { PagoRequest, PagoResponse } from '@/types/api';

export async function registrarPago(payload: PagoRequest): Promise<PagoResponse> {
  const response = await apiClient.post<PagoResponse>('/pagos', payload);
  return response.data;
}
