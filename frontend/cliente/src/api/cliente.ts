import { apiClient } from '@/api/client';
import type {
  CartItem,
  Categoria,
  CuentaResponse,
  Dish,
  MesaSession,
  MetodoPago,
  PagoResponse,
  PagoParte,
  PedidoCreateResponse,
  PedidoPublico,
  PlatillosPage,
  ReservaPublica,
} from '@/types';

const fallbackImages = [
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=700&q=80',
  'https://images.unsplash.com/photo-1558030006-450675393462?w=700&q=80',
  'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=700&q=80',
  'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=700&q=80',
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=700&q=80',
];

const descriptions = [
  'Receta peruana de la casa, servida al momento.',
  'Sabor criollo con insumos frescos y punto exacto.',
  'Preparación especial de UTTOF para compartir.',
  'Clásico peruano con presentación contemporánea.',
];

export async function checkinMesa(idMesa: number): Promise<MesaSession> {
  const response = await apiClient.post<MesaSession>(`/mesas/${idMesa}/checkin`);
  return response.data;
}

export async function getCategorias(): Promise<Categoria[]> {
  const response = await apiClient.get<Categoria[]>('/menu/categorias');
  return response.data;
}

export async function getDishes(): Promise<Dish[]> {
  const [categorias, platillos] = await Promise.all([
    getCategorias(),
    apiClient.get<PlatillosPage>('/menu/platillos', { params: { limit: 50 } }),
  ]);
  const categoryById = new Map(categorias.map((categoria) => [categoria.id_categoria, categoria.nombre]));
  return platillos.data.data.map((platillo, index) => ({
    id_platillo: platillo.id_platillo,
    id_categoria: platillo.id_categoria,
    categoria: platillo.id_categoria ? categoryById.get(platillo.id_categoria) ?? 'Carta' : 'Carta',
    nombre: platillo.nombre,
    descripcion: descriptions[index % descriptions.length],
    precio: Number(platillo.precio),
    imagen_url: platillo.imagen_url ?? fallbackImages[index % fallbackImages.length],
    tiempo_prep: 6 + ((index + 1) % 5) * 3,
    disponible: Boolean(platillo.disponible),
  }));
}

export async function enviarPedido(idMesa: number, items: CartItem[]): Promise<PedidoCreateResponse> {
  const response = await apiClient.post<PedidoCreateResponse>('/pedidos', {
    id_mesa: idMesa,
    items: items.map((item) => ({
      id_platillo: item.id_platillo,
      qty: item.qty,
      nota: item.nota,
    })),
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
  desglose?: PagoParte[],
): Promise<PagoResponse> {
  const response = await apiClient.post<PagoResponse>('/pagos', {
    id_pedido: idPedido,
    metodo,
    monto,
    propina,
    desglose,
  });
  return response.data;
}

export async function getReservas(fecha: string): Promise<ReservaPublica[]> {
  const response = await apiClient.get<ReservaPublica[]>('/reservas', { params: { fecha } });
  return response.data;
}

export async function crearReserva(payload: { id_mesa: number; hora_reserva: string; num_personas: number; notas?: string }): Promise<ReservaPublica> {
  const response = await apiClient.post<ReservaPublica>('/reservas', payload);
  return response.data;
}

export async function crearResena(payload: { id_pedido: number; calificacion: number; comentario?: string }): Promise<void> {
  await apiClient.post('/resenas', payload);
}
