import {
  Boxes,
  Building2,
  ChartNoAxesCombined,
  LayoutDashboard,
  Link2,
  Menu,
  Palette,
  Settings,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
  premium?: boolean;
  badge?: 'sucursales';
}

export interface NavigationGroup {
  label?: string;
  items: NavigationItem[];
}

export const navigationGroups: NavigationGroup[] = [
  {
    items: [
      { label: 'Vista consolidada', path: '/admin/consolidado', icon: LayoutDashboard },
      { label: 'Sucursales', path: '/admin/sucursales', icon: Building2, badge: 'sucursales' },
      { label: 'Predicción IA', path: '/admin/ia', icon: Sparkles, premium: true },
      { label: 'Inventario', path: '/admin/inventario', icon: Boxes, premium: true },
      { label: 'Reportes', path: '/admin/reportes', icon: ChartNoAxesCombined, premium: true },
    ],
  },
  {
    label: 'Por sucursal',
    items: [
      { label: 'Menú', path: '/admin/menu', icon: Menu },
      { label: 'Empleados', path: '/admin/empleados', icon: Users },
      { label: 'Configuración', path: '/admin/config', icon: Settings },
    ],
  },
  {
    label: 'Integraciones',
    items: [
      { label: 'API y conectores', path: '/admin/integraciones', icon: Link2, premium: true },
      { label: 'Marca blanca', path: '/admin/marca', icon: Palette, premium: true },
    ],
  },
];
