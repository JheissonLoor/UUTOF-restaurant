import { Link, NavLink, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, LogOut, ShoppingBag } from 'lucide-react';

import { useAuth } from '@/auth/useAuth';
import { useOrder } from '@/order/useOrder';
import { cn } from '@/lib/utils';

const links = [
  { to: '/menu', label: 'Carta' },
  { to: '/mesa', label: 'Mesa' },
  { to: '/reservar', label: 'Reservar' },
  { to: '/mis-pedidos', label: 'Mis Pedidos' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useOrder();
  const navigate = useNavigate();

  const navLinks = user?.rol === 'admin' ? [...links, { to: '/admin', label: 'Admin' }] : links;

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
          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'relative text-sm font-medium px-3 py-2 rounded-xl transition',
                    isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  )
                }
              >
                <span className="inline-flex items-center gap-1.5">
                  {link.label === 'Mis Pedidos' && <ShoppingBag className="h-3.5 w-3.5" />}
                  {link.label}
                  {link.to === '/mis-pedidos' && cartCount > 0 && (
                    <span className="ml-0.5 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </span>
              </NavLink>
            ))}
            <span className="hidden md:inline text-sm text-muted-foreground ml-1">{user?.nombre}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border hover:bg-muted transition ml-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
