import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, LogOut } from 'lucide-react';

import { useAuth } from '@/auth/useAuth';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-lg border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={isAuthenticated ? '/menu' : '/'} className="inline-flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold">UTTOF</span>
          <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full">
            Estándar
          </span>
        </Link>

        {isAuthenticated && (
          <nav className="flex items-center gap-3">
            <Link to="/menu" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
              Carta
            </Link>
            <span className="hidden sm:inline text-sm text-muted-foreground">{user?.nombre}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border hover:bg-muted transition"
            >
              <LogOut className="h-4 w-4" /> Salir
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
