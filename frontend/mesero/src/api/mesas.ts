import { apiClient } from '@/api/client';
import type { Mesa, MesaApiResponse, MesaEstado } from '@/types/api';

function normalizeMesa(mesa: MesaApiResponse): Mesa {
  return {
    ...mesa,
    zona: mesa.zona ?? null,
  };
}

export async function getMesas(): Promise<Mesa[]> {
  const response = await apiClient.get<MesaApiResponse[]>('/mesas', {
    params: { mesero_id: 'me' },
  });
  return response.data.map(normalizeMesa);
}

export async function updateMesaEstado(idMesa: number, estado: MesaEstado): Promise<Mesa> {
  const response = await apiClient.patch<MesaApiResponse>(`/mesas/${idMesa}/estado`, { estado });
  return normalizeMesa(response.data);
}

export async function sentarComensales(idMesa: number, comensales: number): Promise<{ id_pedido: number }> {
  const response = await apiClient.post<{ id_pedido: number }>(`/mesas/${idMesa}/sentar`, { comensales });
  return response.data;
}
