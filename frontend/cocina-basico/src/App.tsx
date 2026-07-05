import { useAuth } from '@/auth/useAuth';
import { Topbar } from '@/components/Topbar';
import { CocinaBoard } from '@/pages/CocinaBoard';
import { LoginView } from '@/pages/LoginView';

export function App(): JSX.Element {
  const { isAuthenticated, logout, user } = useAuth();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-cream-bg text-ink-900">
      <Topbar user={user} onLogout={logout} />
      <CocinaBoard />
    </div>
  );
}
