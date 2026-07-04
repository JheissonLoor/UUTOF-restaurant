import type { MesaEstado } from '@/types/api';

export interface MesaStatePresentation {
  label: string;
  cardClasses: string;
  iconClasses: string;
  dotClasses: string;
}

export const mesaStatePresentation: Record<MesaEstado, MesaStatePresentation> = {
  libre: {
    label: 'Libre',
    cardClasses: 'border-sage-500 bg-sage-100/70 hover:bg-sage-100',
    iconClasses: 'bg-white/75 text-sage-600',
    dotClasses: 'bg-sage-500',
  },
  ocupada: {
    label: 'Ocupada',
    cardClasses: 'border-terracotta-500 bg-terracotta-100/70 hover:bg-terracotta-100',
    iconClasses: 'bg-white/75 text-terracotta-600',
    dotClasses: 'bg-terracotta-500',
  },
  reservada: {
    label: 'Reservada',
    cardClasses: 'border-saffron-500 bg-saffron-100/70 hover:bg-saffron-100',
    iconClasses: 'bg-white/75 text-saffron-600',
    dotClasses: 'bg-saffron-500',
  },
  limpieza: {
    label: 'Limpieza',
    cardClasses: 'border-ink-400 bg-cream-100 hover:bg-cream-200',
    iconClasses: 'bg-white/75 text-ink-500',
    dotClasses: 'bg-ink-400',
  },
};
