import { Navigate, Route, Routes } from 'react-router-dom';
import { PhaseShellView } from '../views/PhaseShellView';
import { viewDefinitions } from '../views/viewDefinitions';

export function ViewRouter() {
  return (
    <Routes>
      {viewDefinitions.map((view) => (
        <Route key={view.slug} path={view.slug} element={<PhaseShellView view={view} />} />
      ))}
      <Route index element={<Navigate to="consolidado" replace />} />
      <Route path="*" element={<Navigate to="consolidado" replace />} />
    </Routes>
  );
}
