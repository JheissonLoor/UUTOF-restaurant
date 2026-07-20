import { Navigate, Route, Routes } from 'react-router-dom';
import { ConsolidadoView } from '../views/ConsolidadoView';
import { PhaseShellView } from '../views/PhaseShellView';
import { SucursalesView } from '../views/SucursalesView';
import { viewDefinitions } from '../views/viewDefinitions';

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
                : <PhaseShellView view={view} />
          }
        />
      ))}
      <Route index element={<Navigate to="consolidado" replace />} />
      <Route path="*" element={<Navigate to="consolidado" replace />} />
    </Routes>
  );
}
