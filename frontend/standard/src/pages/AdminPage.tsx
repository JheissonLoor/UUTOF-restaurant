import { useState } from 'react';
import { LayoutDashboard, UtensilsCrossed, Armchair, Users, Settings, BarChart3 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { MenuAdmin } from '@/pages/admin/MenuAdmin';
import { MesasAdmin } from '@/pages/admin/MesasAdmin';
import { UsuariosAdmin } from '@/pages/admin/UsuariosAdmin';
import { ConfigAdmin } from '@/pages/admin/ConfigAdmin';
import { ReportesAdmin } from '@/pages/admin/ReportesAdmin';

type TabKey = 'dashboard' | 'menu' | 'mesas' | 'usuarios' | 'reportes' | 'config';

const tabs: Array<{ key: TabKey; label: string; icon: typeof LayoutDashboard }> = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'menu', label: 'Menú', icon: UtensilsCrossed },
  { key: 'mesas', label: 'Mesas', icon: Armchair },
  { key: 'usuarios', label: 'Usuarios', icon: Users },
  { key: 'reportes', label: 'Reportes', icon: BarChart3 },
  { key: 'config', label: 'Configuración', icon: Settings },
];

export default function AdminPage() {
  const [tab, setTab] = useState<TabKey>('dashboard');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="font-heading text-3xl font-bold mb-1">Panel de Administración</h1>
      <p className="text-muted-foreground text-sm mb-6">Gestión operativa del restaurante.</p>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all',
              tab === t.key
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'bg-card border text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && <AdminDashboard />}
      {tab === 'menu' && <MenuAdmin />}
      {tab === 'mesas' && <MesasAdmin />}
      {tab === 'usuarios' && <UsuariosAdmin />}
      {tab === 'reportes' && <ReportesAdmin />}
      {tab === 'config' && <ConfigAdmin />}
    </div>
  );
}
