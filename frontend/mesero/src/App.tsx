import { useAuth } from '@/auth/useAuth';
import { LoginView } from '@/pages/LoginView';

export function App(): JSX.Element {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <LoginView />;

  return (
    <main className="h-[100dvh] overflow-hidden bg-cream-50 text-ink-900">
      <div className="grid h-full place-items-center px-6 text-center">
        <div>
          <div className="font-serif text-h1">UTTOF Mesero</div>
          <p className="mt-2 text-sm text-ink-500">Cargando mesas del turno...</p>
        </div>
      </div>
    </main>
  );
}
