import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { AppShell } from '@/components/AppShell';
import { ConfigPage } from '@/pages/ConfigPage';
import { DashboardPage } from '@/pages/Dashboard';
import { EmpleadosPage } from '@/pages/EmpleadosPage';
import { LoginPage } from '@/pages/Login';
import { MenuPage } from '@/pages/MenuPage';
import { MesasPage } from '@/pages/MesasPage';
import { ReportesPage } from '@/pages/ReportesPage';
import { ReservasPage } from '@/pages/ReservasPage';
import type { UserRole } from '@/types/api';

const adminOnly: UserRole[] = ['admin'];

function adminRoute(page: JSX.Element): JSX.Element {
  return <ProtectedRoute allowedRoles={adminOnly}>{page}</ProtectedRoute>;
}

export function App(): JSX.Element {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={adminRoute(<AppShell />)}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/mesas" element={<MesasPage />} />
          <Route path="/reservas" element={<ReservasPage />} />
          <Route path="/empleados" element={<EmpleadosPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
          <Route path="/config" element={<ConfigPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
