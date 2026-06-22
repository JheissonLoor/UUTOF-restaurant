import { apiClient } from '@/api/client';
import type { Pedido, PedidoItemWrite } from '@/types/api';

export async function getPedido(idPedido: number): Promise<Pedido> {
  const response = await apiClient.get<Pedido>(`/pedidos/${idPedido}`);
  return response.data;
}

export async function addPedidoItems(idPedido: number, items: PedidoItemWrite[]): Promise<Pedido> {
  const response = await apiClient.post<Pedido>(`/pedidos/${idPedido}/items`, { items });
  return response.data;
}

export async function entregarPedidoItem(idPedido: number, idDetalle: number): Promise<Pedido> {
  const response = await apiClient.patch<Pedido>(`/pedidos/${idPedido}/items/${idDetalle}/entregar`);
  return response.data;
}

export async function generarCuenta(idPedido: number): Promise<{ folio: string; qr_url: string; total: number }> {
  const response = await apiClient.post<{ folio: string; qr_url: string; total: number }>(`/pedidos/${idPedido}/cuenta`);
  return response.data;
}

export async function llamarCocina(idPedido: number): Promise<{ ok: boolean }> {
  const response = await apiClient.post<{ ok: boolean }>(`/pedidos/${idPedido}/llamar-cocina`);
  return response.data;
}
