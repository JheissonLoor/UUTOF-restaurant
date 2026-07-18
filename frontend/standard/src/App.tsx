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
import OrdersPage from '@/pages/OrdersPage';
import NotFound from '@/pages/NotFound';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/menu" replace />;
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
        <Route
          path="/menu"
          element={
            <ProtectedRoute>
              <MenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mesa"
          element={
            <ProtectedRoute>
              <MesaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-pedidos"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
