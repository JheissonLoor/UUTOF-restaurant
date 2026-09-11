import { apiClient } from '@/api/client';
import type { Reserva } from '@/types/api';


export async function validarReserva(tokenOFolio: string): Promise<Reserva> {
  const response = await apiClient.post<Reserva>('/reservas/validar-qr', {
    token_o_folio: tokenOFolio,
  });
  return response.data;
}
