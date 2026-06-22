import { useState } from 'react';

import { useAuth } from '@/auth/useAuth';
import { LoginView } from '@/pages/LoginView';
import { MesaDetail } from '@/pages/MesaDetail';
import { MesasView } from '@/pages/MesasView';
import type { Mesa } from '@/types/api';

export function App(): JSX.Element {
  const { isAuthenticated, user } = useAuth();
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);

  if (!isAuthenticated) return <LoginView />;
  if (selectedMesa) return <MesaDetail mesa={selectedMesa} onBack={() => setSelectedMesa(null)} />;

  return (
    <MesasView
      meseroNombre={user?.nombre ?? 'Mesero UTTOF'}
      onOpenMesa={setSelectedMesa}
    />
  );
}
