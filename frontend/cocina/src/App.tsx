import { useAuth } from '@/auth/useAuth';
import { CocinaBoard } from '@/pages/CocinaBoard';
import { LoginView } from '@/pages/LoginView';

export function App(): JSX.Element {
  const { isAuthenticated, logout, user } = useAuth();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return <CocinaBoard user={user} onLogout={logout} />;
}
