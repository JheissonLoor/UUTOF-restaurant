import type { UserRole } from '@/types/api';

export interface RolePresentation {
  label: string;
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}

export const rolePresentation: Record<UserRole, RolePresentation> = {
  admin: { label: 'Administrador', tone: 'danger' },
  mesero: { label: 'Mesero', tone: 'info' },
  cocina: { label: 'Cocina', tone: 'warning' },
  cliente: { label: 'Cliente', tone: 'success' },
};
