import type { UserRole } from '@/types';

// Página de inicio según el rol tras iniciar sesión.
export function homeForRole(rol: UserRole | undefined): string {
  switch (rol) {
    case 'cocina':
      return '/cocina';
    case 'mesero':
      return '/mesero';
    case 'admin':
      return '/admin';
    default:
      return '/menu';
  }
}
