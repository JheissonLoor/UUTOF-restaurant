import { Bell, LogOut, Search, Settings, UserCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { CommandPalette } from '@/components/CommandPalette';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAuth } from '@/auth/useAuth';

function getInitials(name: string): string {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'U';
}

export function Topbar(): JSX.Element {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const displayName = user?.nombre ?? 'Administrador';
  const initials = useMemo(() => getInitials(displayName), [displayName]);

  function handleLogout(): void {
    logout();
    setIsLogoutOpen(false);
    navigate('/login', { replace: true });
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-[rgba(42,30,20,0.08)] bg-white px-4 text-ink-900 sm:px-7">
        <Link to="/dashboard" className="flex items-center gap-2.5 text-ink-900" aria-label="Ir al dashboard">
          <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-gradient-to-br from-terracotta-400 to-terracotta-600 font-serif text-base font-bold text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_2px_6px_rgba(233,75,51,0.35)]">
            U
          </span>
          <span className="font-serif text-[16px] font-semibold tracking-normal">UTTOF</span>
        </Link>

        <div className="ml-2 hidden items-center gap-2 rounded-full border border-[rgba(42,30,20,0.08)] bg-cream-100 px-2.5 py-1 text-[13px] font-medium text-ink-700 lg:inline-flex">
          <Settings aria-hidden="true" size={13} strokeWidth={1.8} />
          Administración
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md text-ink-500 transition hover:bg-cream-100 hover:text-ink-900"
            aria-label="Buscar"
            title="Buscar"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search aria-hidden="true" size={18} strokeWidth={1.8} />
          </button>

          <div className="relative">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-md text-ink-500 transition hover:bg-cream-100 hover:text-ink-900"
              aria-label="Notificaciones"
              title="Notificaciones"
              aria-expanded={isNotificationsOpen}
              onClick={() => {
                setIsNotificationsOpen((current) => !current);
                setIsUserMenuOpen(false);
              }}
            >
              <Bell aria-hidden="true" size={18} strokeWidth={1.8} />
            </button>
            {isNotificationsOpen ? (
              <div className="absolute right-0 top-11 w-[320px] rounded-lg border border-[rgba(42,30,20,0.08)] bg-white p-3 shadow-lg-soft">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="font-serif text-h2">Notificaciones</h2>
                  <span className="text-xs text-ink-500">0 nuevas</span>
                </div>
                <div className="rounded-md bg-cream-100 px-4 py-6 text-center text-sm text-ink-500">
                  No hay notificaciones nuevas.
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md text-ink-500 transition hover:bg-cream-100 hover:text-ink-900"
            aria-label="Configuración"
            title="Configuración"
            onClick={() => navigate('/config')}
          >
            <Settings aria-hidden="true" size={18} strokeWidth={1.8} />
          </button>

          <div className="relative">
            <button
              type="button"
              className="ml-1 flex items-center gap-2 rounded-full px-1 py-1 pr-2.5 text-left transition hover:bg-cream-100"
              aria-label="Menu de usuario"
              aria-expanded={isUserMenuOpen}
              onClick={() => {
                setIsUserMenuOpen((current) => !current);
                setIsNotificationsOpen(false);
              }}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-terracotta-500 text-[13px] font-semibold text-white">
                {initials}
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-[13px] font-medium text-ink-900">{displayName}</span>
                <span className="-mt-0.5 block text-[12px] text-ink-500">Administración</span>
              </span>
            </button>
            {isUserMenuOpen ? (
              <div className="absolute right-0 top-12 w-[220px] rounded-lg border border-[rgba(42,30,20,0.08)] bg-white p-2 shadow-lg-soft">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-ink-700 transition hover:bg-cream-100 hover:text-ink-900"
                  onClick={() => {
                    navigate('/empleados');
                    setIsUserMenuOpen(false);
                  }}
                >
                  <UserCircle aria-hidden="true" size={16} strokeWidth={1.8} />
                  Mi perfil
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-ink-700 transition hover:bg-cream-100 hover:text-ink-900"
                  onClick={() => {
                    navigate('/config');
                    setIsUserMenuOpen(false);
                  }}
                >
                  <Settings aria-hidden="true" size={16} strokeWidth={1.8} />
                  Configuración
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-terracotta-600 transition hover:bg-terracotta-50"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsLogoutOpen(true);
                  }}
                >
                  <LogOut aria-hidden="true" size={16} strokeWidth={1.8} />
                  Cerrar sesión
                </button>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md text-ink-500 transition hover:bg-cream-100 hover:text-ink-900"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            onClick={() => setIsLogoutOpen(true)}
          >
            <LogOut aria-hidden="true" size={18} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {isSearchOpen ? <CommandPalette onClose={() => setIsSearchOpen(false)} /> : null}

      {isLogoutOpen ? (
        <ConfirmModal
          title="Cerrar sesión"
          description="Se cerrará tu sesión en este navegador."
          confirmLabel="Cerrar sesión"
          cancelLabel="Cancelar"
          onConfirm={handleLogout}
          onCancel={() => setIsLogoutOpen(false)}
        />
      ) : null}
    </>
  );
}
