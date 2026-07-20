import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ConsolidadoView } from '../views/ConsolidadoView';
import { InventarioView } from '../views/InventarioView';
import { PhaseShellView } from '../views/PhaseShellView';
import { SucursalesView } from '../views/SucursalesView';
import { viewDefinitions } from '../views/viewDefinitions';

const PrediccionView = lazy(async () => ({
  default: (await import('../views/PrediccionView')).PrediccionView,
}));
const ReportesView = lazy(async () => ({
  default: (await import('../views/ReportesView')).ReportesView,
}));
const MenuView = lazy(async () => ({
  default: (await import('../views/MenuView')).MenuView,
}));
const EmpleadosView = lazy(async () => ({
  default: (await import('../views/EmpleadosView')).EmpleadosView,
}));
const ConfigView = lazy(async () => ({
  default: (await import('../views/ConfigView')).ConfigView,
}));

export function ViewRouter() {
  return (
    <Routes>
      {viewDefinitions.map((view) => (
        <Route
          key={view.slug}
          path={view.slug}
          element={
            view.slug === 'consolidado'
              ? <ConsolidadoView />
              : view.slug === 'sucursales'
                ? <SucursalesView />
                : view.slug === 'inventario'
                  ? <InventarioView />
                  : view.slug === 'ia'
                    ? <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-bg2" />}><PrediccionView /></Suspense>
                    : view.slug === 'reportes'
                      ? <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-bg2" />}><ReportesView /></Suspense>
                      : view.slug === 'menu'
                        ? <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-bg2" />}><MenuView /></Suspense>
                        : view.slug === 'empleados'
                          ? <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-bg2" />}><EmpleadosView /></Suspense>
                          : view.slug === 'config'
                            ? <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-bg2" />}><ConfigView /></Suspense>
                            : view.slug === 'integraciones'
                              ? <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-bg2" />}><ConfigView initialTab="integraciones" /></Suspense>
                              : view.slug === 'marca'
                                ? <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-bg2" />}><ConfigView initialTab="marca" /></Suspense>
                : <PhaseShellView view={view} />
          }
        />
      ))}
      <Route index element={<Navigate to="consolidado" replace />} />
      <Route path="*" element={<Navigate to="consolidado" replace />} />
    </Routes>
  );
}
