import { apiClient } from '@/api/client';
import type { Mesa, MesaEstado, MesaQr } from '@/types/api';

export async function getMesas(): Promise<Mesa[]> {
  const response = await apiClient.get<Mesa[]>('/mesas');
  return response.data;
}

export async function updateMesaEstado(idMesa: number, estado: MesaEstado): Promise<Mesa> {
  const response = await apiClient.patch<Mesa>(`/mesas/${idMesa}/estado`, { estado });
  return response.data;
}

export async function getMesaQr(idMesa: number): Promise<MesaQr> {
  const response = await apiClient.get<MesaQr>(`/mesas/${idMesa}/qr`);
  return response.data;
}
