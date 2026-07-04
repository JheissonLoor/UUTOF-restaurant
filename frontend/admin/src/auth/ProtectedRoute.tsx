import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/auth/useAuth';
import type { UserRole } from '@/types/api';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: JSX.Element;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps): JSX.Element {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-cream-50 text-ink-700">
        <div className="rounded-lg border border-[rgba(42,30,20,0.08)] bg-white px-6 py-4 shadow-sm-soft">
          Cargando sesion...
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    return (
      <main className="grid min-h-screen place-items-center bg-cream-50 text-ink-900">
        <section className="w-full max-w-md rounded-lg border border-[rgba(42,30,20,0.08)] bg-white p-6 shadow-sm-soft">
          <h1 className="font-serif text-h1">No autorizado</h1>
          <p className="mt-2 text-sm text-ink-500">Tu rol no tiene permisos para abrir este panel.</p>
        </section>
      </main>
    );
  }

  return children;
}
