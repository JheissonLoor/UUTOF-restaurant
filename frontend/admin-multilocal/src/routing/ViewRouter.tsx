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
                : <PhaseShellView view={view} />
          }
        />
      ))}
      <Route index element={<Navigate to="consolidado" replace />} />
      <Route path="*" element={<Navigate to="consolidado" replace />} />
    </Routes>
  );
}
