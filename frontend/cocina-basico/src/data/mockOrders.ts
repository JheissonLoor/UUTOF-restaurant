import type { BoardColumn, KitchenOrder } from '@/types';

export const columns: BoardColumn[] = [
  {
    id: 'espera',
    label: 'En espera',
    badgeLabel: 'En espera',
    accent: 'sun',
    actionLabel: 'Empezar preparacion',
    actionTone: 'coral',
    nextStatus: 'cocina',
  },
  {
    id: 'cocina',
    label: 'En preparacion',
    badgeLabel: 'Preparando',
    accent: 'coral',
    actionLabel: 'Marcar terminado',
    actionTone: 'mint',
    nextStatus: 'listo',
  },
  {
    id: 'listo',
    label: 'Terminado',
    badgeLabel: 'Listo',
    accent: 'mint',
    actionLabel: 'Entregar a mesa',
    actionTone: 'sky',
    nextStatus: 'entregado',
  },
  {
    id: 'entregado',
    label: 'Por pagar',
    badgeLabel: 'Por pagar',
    accent: 'sky',
  },
  {
    id: 'pagado',
    label: 'Pagado',
    badgeLabel: 'Pagado',
    accent: 'plum',
  },
];

export const initialOrders: KitchenOrder[] = [
  {
    id_pedido: 9,
    cliente: 'Ana Reyes',
    mesa: 8,
    estado: 'espera',
    minutos: 2,
    total: 83,
    items: [
      { qty: 1, nombre: 'Ceviche clasico', nota: 'Sin aji' },
      { qty: 2, nombre: 'Pisco sour' },
    ],
  },
  {
    id_pedido: 10,
    cliente: 'Jorge Quispe',
    mesa: 3,
    estado: 'cocina',
    minutos: 9,
    total: 136,
    items: [
      { qty: 2, nombre: 'Arroz con mariscos' },
      { qty: 1, nombre: 'Causa limena' },
      { qty: 2, nombre: 'Inca Kola' },
    ],
  },
  {
    id_pedido: 11,
    cliente: 'Lucia Torres',
    mesa: 11,
    estado: 'cocina',
    minutos: 16,
    total: 50,
    items: [
      { qty: 1, nombre: 'Pollo a la brasa', nota: 'Cliente alergico - sin sal extra' },
      { qty: 1, nombre: 'Picarones' },
    ],
  },
  {
    id_pedido: 12,
    cliente: 'Diego Ramos',
    mesa: 6,
    estado: 'listo',
    minutos: 14,
    total: 122,
    items: [
      { qty: 3, nombre: 'Tiradito de pescado' },
      { qty: 1, nombre: 'Maracuya sour' },
    ],
  },
  {
    id_pedido: 7,
    cliente: 'Carlos Lopez',
    mesa: 5,
    estado: 'entregado',
    minutos: 52,
    total: 120,
    items: [
      { qty: 2, nombre: 'Aji de gallina' },
      { qty: 2, nombre: 'Chicha morada' },
      { qty: 1, nombre: 'Suspiro a la limena' },
    ],
  },
  {
    id_pedido: 2,
    cliente: 'Maria Garcia',
    mesa: 2,
    estado: 'pagado',
    minutos: 64,
    total: 78,
    items: [
      { qty: 2, nombre: 'Papa a la huancaina' },
      { qty: 1, nombre: 'Lomo saltado' },
    ],
  },
];
