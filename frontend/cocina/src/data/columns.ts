import type { BoardColumn } from '@/types';

export const columns: BoardColumn[] = [
  {
    id: 'espera',
    label: 'En espera',
    badgeLabel: 'En espera',
    accent: 'sun',
    actionLabel: 'Empezar preparación',
    actionTone: 'coral',
    nextStatus: 'cocina',
    transition: 'empezarPreparacion',
  },
  {
    id: 'cocina',
    label: 'En preparación',
    badgeLabel: 'Preparando',
    accent: 'coral',
    actionLabel: 'Marcar terminado',
    actionTone: 'mint',
    nextStatus: 'listo',
    transition: 'marcarTerminado',
  },
  {
    id: 'listo',
    label: 'Terminado',
    badgeLabel: 'Listo',
    accent: 'mint',
    actionLabel: 'Entregar a mesa',
    actionTone: 'sky',
    nextStatus: 'entregado',
    transition: 'entregarMesa',
  },
  { id: 'entregado', label: 'Por pagar', badgeLabel: 'Por pagar', accent: 'sky' },
  { id: 'pagado', label: 'Pagado', badgeLabel: 'Pagado', accent: 'plum' },
];
