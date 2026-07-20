import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { RolUsuario } from '../types/api';
import { useAuth } from './useAuth';

interface ProtectedRouteProps extends PropsWithChildren {
  allowedRoles: RolUsuario[];
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { usuario, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-ink3">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-bg2 border-t-coral" />
        <span className="sr-only">Validando sesión</span>
      </div>
    );
  }

  if (!isAuthenticated || !usuario) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(usuario.rol)) {
    return <Navigate to="/login" replace state={{ unauthorized: true }} />;
  }

  return children;
}
