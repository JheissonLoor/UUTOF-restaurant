import { apiClient } from '@/api/client';
import type {
  CartItem,
  CuentaResponse,
  MesaPublica,
  MesaSession,
  MetodoPago,
  PagoResponse,
  PedidoCreateResponse,
  PedidoPublico,
} from '@/types';

export async function getMesas(): Promise<MesaPublica[]> {
  const response = await apiClient.get<MesaPublica[]>('/mesas');
  return response.data;
}

export async function checkinMesa(idMesa: number): Promise<MesaSession> {
  const response = await apiClient.post<MesaPublica>(`/mesas/${idMesa}/checkin`);
  const { id_mesa, numero, zona, capacidad } = response.data;
  return { id_mesa, numero, zona, capacidad };
}

export async function enviarPedido(idMesa: number, items: CartItem[]): Promise<PedidoCreateResponse> {
  const response = await apiClient.post<PedidoCreateResponse>('/pedidos', {
    id_mesa: idMesa,
    items: items.map((item) => ({ id_platillo: item.id_platillo, qty: item.cantidad })),
  });
  return response.data;
}

export async function getPedido(idPedido: number): Promise<PedidoPublico> {
  const response = await apiClient.get<PedidoPublico>(`/pedidos/${idPedido}`);
  return response.data;
}

export async function pedirCuenta(idPedido: number): Promise<CuentaResponse> {
  const response = await apiClient.post<CuentaResponse>(`/pedidos/${idPedido}/cuenta`);
  return response.data;
}

export async function registrarPago(
  idPedido: number,
  metodo: MetodoPago,
  monto: number,
  propina: number,
): Promise<PagoResponse> {
  const response = await apiClient.post<PagoResponse>('/pagos', {
    id_pedido: idPedido,
    metodo,
    monto,
    propina,
    recibido: metodo === 'efectivo' ? monto + propina : undefined,
  });
  return response.data;
}

export async function crearResena(payload: {
  id_pedido: number;
  calificacion: number;
  comentario?: string;
}): Promise<void> {
  await apiClient.post('/resenas', payload);
}
