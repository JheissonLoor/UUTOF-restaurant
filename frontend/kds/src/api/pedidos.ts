import { apiClient } from '@/api/client'
import type { BackendKitchenOrder, KitchenTicket, PedidoTransition } from '@/types/api'

const ESTADOS_KDS = 'espera,cocina,listo'
const DEFAULT_TARGET_SECONDS = 18 * 60

function toTicketStatus(status: BackendKitchenOrder['estado']): KitchenTicket['estado'] {
  if (status === 'espera') return 'new'
  if (status === 'listo') return 'ready'
  return 'cooking'
}

function detectOrigen(cliente: string): KitchenTicket['origen'] {
  return cliente.toLowerCase().includes('cliente') ? 'app_cliente' : 'mesero'
}

export function mapOrderToTicket(order: BackendKitchenOrder): KitchenTicket {
  const minutes = Math.max(0, Number(order.minutos) || 0)
  const createdAt = new Date(Date.now() - minutes * 60_000)
  const baseStatus = toTicketStatus(order.estado)
  const elapsed = Math.floor((Date.now() - createdAt.getTime()) / 1000)
  const estado = baseStatus !== 'ready' && elapsed > DEFAULT_TARGET_SECONDS * 0.95 ? 'urgent' : baseStatus

  return {
    id_pedido: order.id_pedido,
    num: order.num ?? order.id_pedido,
    mesa: `Mesa ${order.mesa}`,
    origen: order.origen ?? detectOrigen(order.cliente),
    mesero: order.mesero ?? order.cliente,
    estado,
    estado_backend: order.estado,
    creado_en: order.creado_en ?? createdAt.toISOString(),
    elapsed_seg: order.elapsed_seg ?? minutes * 60,
    target_seg: order.target_seg ?? DEFAULT_TARGET_SECONDS,
    pausado: Boolean(order.pausado),
    alerta_insumo: false,
    total: Number(order.total),
    items: order.items.map((item, index) => ({
      id: `${order.id_pedido}-${item.id_detalle ?? index}`,
      id_detalle: item.id_detalle ?? undefined,
      qty: item.qty,
      nombre: item.nombre,
      modificadores: item.modificadores ?? [],
      nota: item.nota ?? null,
      alergenos: item.alergenos ?? [],
      done: Boolean(item.listo) || item.estado_item === 'ready' || item.estado_item === 'delivered' || order.estado === 'listo',
    })),
  }
}

export async function getTicketsActivos(): Promise<KitchenTicket[]> {
  const response = await apiClient.get<BackendKitchenOrder[]>('/pedidos', {
    params: { estado: ESTADOS_KDS },
  })
  return response.data.map(mapOrderToTicket)
}

export async function marcarItem(idPedido: number, idDetalle: number, listo: boolean): Promise<KitchenTicket> {
  const response = await apiClient.patch<BackendKitchenOrder>(`/pedidos/${idPedido}/items/${idDetalle}`, { listo })
  return mapOrderToTicket(response.data)
}

export async function avanzarEstado(idPedido: number, transicion: PedidoTransition): Promise<KitchenTicket> {
  const response = await apiClient.patch<BackendKitchenOrder>(`/pedidos/${idPedido}/estado`, {
    transicion,
  })
  return mapOrderToTicket(response.data)
}

export async function pausarTicket(idPedido: number, pausado: boolean): Promise<KitchenTicket> {
  const response = await apiClient.patch<BackendKitchenOrder>(`/pedidos/${idPedido}/pausar`, { pausado })
  return mapOrderToTicket(response.data)
}

export async function reportarInsumo(idPedido: number, idDetalle: number, nota: string): Promise<void> {
  await apiClient.post(`/pedidos/${idPedido}/reportar-insumo`, { id_detalle: idDetalle, nota })
}
