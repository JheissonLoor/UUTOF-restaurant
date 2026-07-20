export interface ViewDefinition {
  slug: string;
  title: string;
  subtitle: string;
}

export const viewDefinitions: ViewDefinition[] = [
  {
    slug: 'consolidado',
    title: 'Vista consolidada',
    subtitle: 'Rendimiento general de toda la red · Lima',
  },
  {
    slug: 'sucursales',
    title: 'Sucursales',
    subtitle: 'Administra y compara el desempeño de tus locales',
  },
  {
    slug: 'ia',
    title: 'Predicción IA',
    subtitle: 'Pronóstico de demanda y recomendaciones para la operación',
  },
  {
    slug: 'inventario',
    title: 'Inventario',
    subtitle: 'Stock, alertas y abastecimiento por sucursal',
  },
  {
    slug: 'reportes',
    title: 'Reportes',
    subtitle: 'Informes consolidados y exportables de la red',
  },
  {
    slug: 'menu',
    title: 'Menú',
    subtitle: 'Gestiona la carta, precios y disponibilidad por sucursal',
  },
  {
    slug: 'empleados',
    title: 'Empleados',
    subtitle: 'Roles, accesos y operación del personal por sucursal',
  },
  {
    slug: 'config',
    title: 'Configuración',
    subtitle: 'Preferencias generales y facturación de la red',
  },
  {
    slug: 'integraciones',
    title: 'API y conectores',
    subtitle: 'Integraciones empresariales y credenciales de acceso',
  },
  {
    slug: 'marca',
    title: 'Marca blanca',
    subtitle: 'Identidad visual aplicada a las experiencias de tu restaurante',
  },
];

export function getViewDefinition(slug: string): ViewDefinition {
  return viewDefinitions.find((view) => view.slug === slug) ?? viewDefinitions[0];
}
