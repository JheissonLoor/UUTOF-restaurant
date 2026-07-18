import { apiClient } from '@/api/client';
import type { KitchenOrder, PedidoTransition } from '@/types';

const ESTADOS_COCINA = 'espera,cocina,listo,entregado,pagado';

export async function getKitchenOrders(): Promise<KitchenOrder[]> {
  const response = await apiClient.get<KitchenOrder[]>('/pedidos', {
    params: { estado: ESTADOS_COCINA },
  });
  return response.data;
}

export async function avanzarPedido(idPedido: number, transicion: PedidoTransition): Promise<KitchenOrder> {
  const response = await apiClient.patch<KitchenOrder>(`/pedidos/${idPedido}/estado`, { transicion });
  return response.data;
}
