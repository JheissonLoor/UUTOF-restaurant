import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AdminLayout } from './layout/AdminLayout';
import { Sidebar } from './layout/Sidebar';
import { LoginPage } from './pages/LoginPage';

const enterpriseRoles = ['admin', 'dueno', 'dueño', 'gerente_sucursal'] as const;

function ConsolidadoBase() {
  return (
    <AdminLayout sidebar={<Sidebar />}>
      <section className="animate-view-in">
        <p className="font-mono text-xs font-semibold uppercase text-coral">UTTOF Multilocal</p>
        <h1 className="mt-3 font-display text-[34px] font-bold text-ink">Vista consolidada</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink3">
          El espacio operativo está listo para incorporar los módulos de la red.
        </p>
      </section>
    </AdminLayout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin/consolidado"
        element={
          <ProtectedRoute allowedRoles={[...enterpriseRoles]}>
            <ConsolidadoBase />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/admin/consolidado" replace />} />
      <Route path="*" element={<Navigate to="/admin/consolidado" replace />} />
    </Routes>
  );
}
