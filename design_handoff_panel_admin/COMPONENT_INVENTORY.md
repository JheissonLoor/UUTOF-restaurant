# Component Inventory — Panel Admin

> Lista exhaustiva de componentes React a construir.
> Construir en este orden. Después de cada uno, screenshot + OK del usuario.

---

## 🟢 Fase A — Cimientos (1ra sesión)

### A1. Setup del proyecto

- `vite.config.ts` con alias `@/` → `src/`
- `tailwind.config.ts` (usar el provisto en este handoff)
- `src/styles/globals.css` con `@tailwind base/components/utilities` + variables CSS para fuentes
- Importar Google Fonts en `index.html`

### A2. API Client

`src/api/client.ts`
- Axios instance con baseURL `import.meta.env.VITE_API_URL`
- Interceptor request: añade `Authorization: Bearer <token>` desde localStorage
- Interceptor response: si 401, intenta refresh; si falla, logout

`src/api/auth.ts`
- `login(email, password)`
- `refresh(token)`
- `logout()`

`src/api/reportes.ts`
- `getDashboard()`

`src/types/api.ts`
- Todos los tipos del `DATA_CONTRACT.md`

### A3. Auth Context

`src/auth/AuthContext.tsx`
- Provider con `user`, `login()`, `logout()`, `isAuthenticated`
- Persiste en localStorage
- Refresh automático al cargar la app si hay refresh_token

`src/auth/ProtectedRoute.tsx`
- HOC que redirige a `/login` si no hay user
- Si hay user pero rol incorrecto, muestra "No autorizado"

`src/auth/useAuth.ts`
- Hook helper

### A4. Routing

`src/App.tsx`
- BrowserRouter con rutas:
  - `/login` → Login (público)
  - `/` → redirect a `/dashboard`
  - `/dashboard` → Dashboard (protected, rol admin)
  - `/menu` → MenuPage (protected)
  - `/mesas` → MesasPage (protected)
  - `/reservas` → ReservasPage (protected)
  - `/empleados` → EmpleadosPage (protected)
  - `/reportes` → ReportesPage (protected)
  - `/config` → ConfigPage (protected)

---

## 🔵 Fase B — Pantallas base (2da sesión)

### B1. Login screen

`src/pages/Login.tsx`
- Layout centrado, fondo cream-50
- Card 400px con logo + título "UTTOF — Administración"
- Form: email + password + botón "Iniciar sesión"
- Validación inline (zod + react-hook-form recomendado)
- Loading state en submit
- Error inline si credenciales inválidas

### B2. Layout principal

`src/components/Topbar.tsx`
- Spec sección 6.1 del DESIGN_SPEC
- Brand + role-pill + actions
- Dropdown user + dropdown notificaciones

`src/components/TabNav.tsx`
- Spec sección 6.2 del DESIGN_SPEC
- 7 tabs (Dashboard, Menú, Mesas, Reservas, Usuarios, Reportes, Config)
- Underline animada
- Counts dinámicos desde el dashboard

`src/components/AppShell.tsx`
- Wrap de Topbar + TabNav + `<Outlet />` (react-router)
- `<main>` con max-width 1440px, padding 28px

---

## 🟡 Fase C — Dashboard (3ra sesión)

### C1. Componentes átomos

`src/components/ui/Card.tsx`
- Card genérico con head/body/foot slots
- Spec sección 6.4

`src/components/ui/StatCard.tsx`
- Spec sección 6.3
- Props: label, value, unit, icon, iconVariant, delta, deltaLabel, spark, sparkColor
- Animación de conteo al cargar

`src/components/ui/DeltaBadge.tsx`
- Pill con flecha + porcentaje
- 3 variantes: up / down / flat

`src/components/ui/Avatar.tsx`
- Redondo con iniciales o imagen
- Tamaños: sm (24), md (32), lg (40)

`src/components/ui/Pill.tsx`
- Badge pill con texto + opcional icono

`src/components/ui/Button.tsx`
- Variants: primary, ghost, icon
- Tamaños: sm, md, lg
- Estados: default, hover, disabled, loading (spinner)

### C2. Charts

`src/components/charts/Sparkline.tsx`
- Mini area chart con Recharts
- Sin ejes ni labels

`src/components/charts/AreaChart.tsx`
- Recharts AreaChart
- 2 series con leyenda
- Gradient fill

`src/components/charts/Donut.tsx`
- Recharts PieChart con innerRadius
- Legend al lado

`src/components/charts/Heatmap.tsx`
- Grid 7×24 cells
- Color interpolado según valor
- Tooltips con día/hora/cantidad

### C3. Bloques del dashboard

`src/pages/Dashboard.tsx`
- useQuery `getDashboard` con refetch cada 30s
- Layout grid sección 8

`src/components/dashboard/StatsRow.tsx`
- 4 stat cards (Ingresos, Pedidos, Mesas, Ticket)

`src/components/dashboard/RevenueChart.tsx`
- Hero number + AreaChart + leyenda + selector de periodo

`src/components/dashboard/TopPlatillos.tsx`
- Lista con barras de progreso

`src/components/dashboard/DistribucionPedidos.tsx`
- Donut chart + leyenda con counts

`src/components/dashboard/PagosPorTipo.tsx`
- 3 cards con icono + nombre + amount + barra %

`src/components/dashboard/ActivityFeed.tsx`
- Lista de eventos con avatares por tipo
- Auto-refresh cada 30s con animación fade-in en nuevos

`src/components/dashboard/HeatmapPedidos.tsx`
- Wrapper de Heatmap con título y leyenda

`src/components/dashboard/AlertsBanner.tsx`
- Banner sticky con alertas urgentes
- Botones "Resolver" y "Posponer"

### C4. Estados globales

`src/components/ui/Skeleton.tsx`
- Componente reutilizable con shimmer animation

`src/components/ui/EmptyState.tsx`
- Ilustración + título + descripción + CTA opcional

`src/components/ui/ErrorState.tsx`
- Icono ⚠️ + mensaje + botón "Reintentar"

`src/components/ui/Toast.tsx` + provider
- bottom-right
- 4 variantes (success, warning, error, info)
- auto-dismiss 3s

---

## 🟠 Fase D — Otros tabs (4ta sesión en adelante)

### D1. Menú
- `MenuPage.tsx` con filtros + grid
- `PlatilloCard.tsx`
- `PlatilloFormModal.tsx`

### D2. Mesas
- `MesasPage.tsx` con grid visual de estado
- `MesaCard.tsx`
- `MesaDetailModal.tsx`

### D3. Reservas
- `ReservasPage.tsx` con vista calendario semanal
- `ReservaCard.tsx`
- `ReservaFormModal.tsx`

### D4. Usuarios
- `EmpleadosPage.tsx` con tabla
- `UsuarioRow.tsx`
- `UsuarioFormModal.tsx`

### D5. Reportes
- `ReportesPage.tsx` con filtros + 4 charts grandes
- `ExportPDFButton.tsx`

### D6. Configuración
- `ConfigPage.tsx` con tabs internas
- Forms con react-hook-form

---

## 📦 Dependencias mínimas

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.7",
    "@tanstack/react-query": "^5.20.0",
    "recharts": "^2.10.0",
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "date-fns": "^3.3.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.1.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "@tailwindcss/forms": "^0.5.7",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

---

## ✅ Checklist final antes de cerrar

- [ ] Login funciona con backend real
- [ ] Refresh automático del JWT funciona
- [ ] Dashboard muestra datos reales
- [ ] Refetch cada 30s funciona
- [ ] Todos los charts renderizan sin errores
- [ ] Estados loading/empty/error implementados en cada bloque
- [ ] Toast funciona en las 4 variantes
- [ ] Navegación entre tabs sin recargar
- [ ] Logout limpia localStorage y redirect
- [ ] Responsive: testear en 1280px, 1440px, 1920px
- [ ] Lighthouse score > 90 en performance
- [ ] Cero `any` en TypeScript
- [ ] Cero warnings en consola
