import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { SucursalProvider } from './context/SucursalContext';
import { AdminLayout } from './layout/AdminLayout';
import { Sidebar } from './layout/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { ViewRouter } from './routing/ViewRouter';
import { useEnterpriseRealtime } from './hooks/useEnterpriseRealtime';

const enterpriseRoles = ['admin', 'dueno', 'dueño', 'gerente_sucursal'] as const;

function AdminWorkspace() {
  useEnterpriseRealtime();
  return (
    <SucursalProvider>
      <AdminLayout sidebar={<Sidebar />}>
        <ViewRouter />
      </AdminLayout>
    </SucursalProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={[...enterpriseRoles]}>
            <AdminWorkspace />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/admin/consolidado" replace />} />
      <Route path="*" element={<Navigate to="/admin/consolidado" replace />} />
    </Routes>
  );
}
