import { useAuth } from '@/auth/useAuth';
import { LoginView } from '@/pages/LoginView';
import { MesasView } from '@/pages/MesasView';

export function App(): JSX.Element {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <LoginView />;

  return <MesasView meseroNombre={user?.nombre ?? 'Mesero UTTOF'} />;
}
