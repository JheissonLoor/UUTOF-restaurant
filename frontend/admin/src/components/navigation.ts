import {
  CalendarDays,
  LayoutDashboard,
  LineChart,
  MenuSquare,
  Settings,
  Table2,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface AdminTab {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const tabs: AdminTab[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Menú', path: '/menu', icon: MenuSquare },
  { label: 'Mesas', path: '/mesas', icon: Table2 },
  { label: 'Reservas', path: '/reservas', icon: CalendarDays },
  { label: 'Usuarios', path: '/empleados', icon: Users },
  { label: 'Reportes', path: '/reportes', icon: LineChart },
  { label: 'Config.', path: '/config', icon: Settings },
];
