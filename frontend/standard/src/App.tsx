import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import type { ReactNode } from 'react';

import Navbar from '@/components/Navbar';
import { useAuth } from '@/auth/useAuth';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import MenuPage from '@/pages/MenuPage';
import MesaPage from '@/pages/MesaPage';
import ReservaPage from '@/pages/ReservaPage';
import OrdersPage from '@/pages/OrdersPage';
import CocinaPage from '@/pages/CocinaPage';
import MeseroPage from '@/pages/MeseroPage';
import AdminPage from '@/pages/AdminPage';
import NotFound from '@/pages/NotFound';
import { homeForRole } from '@/lib/roles';
import type { UserRole } from '@/types';

function ProtectedRoute({ children, role }: { children: ReactNode; role?: UserRole }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.rol !== role) return <Navigate to={homeForRole(user?.rol)} replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) return <Navigate to={homeForRole(user?.rol)} replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/registro"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Cliente */}
        <Route
          path="/menu"
          element={
            <ProtectedRoute role="cliente">
              <MenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mesa"
          element={
            <ProtectedRoute role="cliente">
              <MesaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservar"
          element={
            <ProtectedRoute role="cliente">
              <ReservaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-pedidos"
          element={
            <ProtectedRoute role="cliente">
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        {/* Cocina */}
        <Route
          path="/cocina"
          element={
            <ProtectedRoute role="cocina">
              <CocinaPage />
            </ProtectedRoute>
          }
        />

        {/* Mesero / verificación */}
        <Route
          path="/mesero"
          element={
            <ProtectedRoute role="mesero">
              <MeseroPage />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
