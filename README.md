# UTTOF - Plataforma SOA para Gestion de Restaurante

UTTOF es un proyecto academico de Arquitectura de Software orientado a la gestion operativa de un restaurante peruano. El sistema usa una arquitectura SOA sobre un monolito modular, con backend en FastAPI, base de datos MySQL y frontends independientes para administracion, mesero y cocina.

## Stack

- Backend: Python 3.11, FastAPI, SQLAlchemy async, MySQL/MariaDB.
- Frontend: React 18, TypeScript, Vite, Tailwind CSS.
- Seguridad: JWT, bcrypt y RBAC por rol.
- Realtime: WebSocket para eventos de pedidos y mesas.
- Localizacion: Peru, moneda PEN, formato visual `S/`, zona horaria `America/Lima`.

## Arquitectura

El backend esta organizado como monolito modular con separacion SOA:

- `utilidad`: autenticacion, RBAC, configuracion, realtime y soporte transversal.
- `entidad`: usuario, menu, mesa, pedido, reserva y pago.
- `tarea`: flujos de reporte y procesos de negocio.

Cada modulo principal sigue estructura hexagonal:

```text
dominio/
aplicacion/
infraestructura/
```

## Estructura Del Proyecto

```text
backend/
  app/
    gateway/
    utilidad/
    entidad/
    tarea/
    db/
  database/
  requirements.txt

frontend/
  admin/
  mesero/
  cocina-basico/

docs/
  arquitectura.html

design_handoff_cocina_basico/
design_handoff_mesero/
design_handoff_panel_admin/
```

## Roles

Actualmente el sistema maneja 4 roles:

| Rol | Descripcion |
| --- | --- |
| `admin` | Gestiona dashboard, menu, mesas, reservas, usuarios, reportes y configuracion. |
| `mesero` | Gestiona mesas asignadas, pedidos, platos listos y cobros. |
| `cocina` | Rol preparado para KDS/cocina. |
| `cliente` | Rol preparado para app cliente y check-in QR. |

## Funcionalidades Implementadas

Backend:

- Health check en `/health`.
- Autenticacion JWT: register, login y refresh.
- RBAC por rol.
- Usuarios: listar, obtener y actualizar.
- Menu: categorias, platillos, creacion y actualizacion.
- Mesas: listado, estado, check-in y sentar comensales.
- Pedidos: listado para cocina, cambio de estado por flujo, detalle, agregar items, llamar cocina, marcar item entregado y generar cuenta.
- Pagos: registro de pago, cambio para efectivo, cierre de pedido y liberacion de mesa.
- Reportes: dashboard y ventas.
- Configuracion base del restaurante.
- WebSocket base para eventos realtime.

Frontend Admin:

- Login protegido por rol admin.
- Dashboard conectado al backend.
- Navegacion principal.
- Modulos de menu, mesas, reservas, empleados, reportes y configuracion.
- Estados de carga, error y vacio en pantallas principales.

Frontend Mesero:

- Login del mesero.
- Lista de mesas asignadas.
- Filtros por todas, ocupadas, atencion y libres.
- Detalle de mesa y pedido.
- Marcar item listo como entregado.
- Llamar cocina.
- Sentar comensales en mesa libre.
- Agregar platillos al pedido.
- Enviar platos a cocina.
- Cobrar cuenta con tarjeta, efectivo o Yape.
- Liberar mesa despues del pago.

Frontend Cocina Basico:

- Login para rol cocina o admin.
- Tablero kanban claro con columnas: en espera, en preparacion, terminado, por pagar y pagado.
- Polling cada 20 segundos contra el backend real.
- Avance manual del pedido completo: empezar preparacion, marcar terminado y entregar a mesa.
- Filtros por estado con contador.
- Estados de carga, error, vacio y toast de confirmacion.

## Pendiente

- App Cocina/KDS Premium.
- App Cliente.
- Division avanzada de cuenta.
- Cambio de mesa.
- QR de cuenta completo para pago desde app cliente.
- Realtime completo entre cocina, mesero, cliente y admin.
- Pruebas automatizadas mas amplias.
- Despliegue.

## Configuracion Inicial

Requisitos locales:

- Python 3.11.
- Node.js.
- MySQL/MariaDB o XAMPP.

Crear `.env` del backend:

```powershell
cd "C:\Users\jheis\OneDrive\Desktop\UTTOF - Restaurant\backend"
copy .env.example .env
```

Crear base de datos:

```powershell
Get-Content .\database\init_db.sql | mysql -u root -p
Get-Content .\app\db\migrations.sql | mysql -u uttof_user -p uttof_db
Get-Content .\app\db\003_mesero_app.sql | mysql -u uttof_user -p uttof_db
python -m app.db.seed
```

Si usas XAMPP y `mysql` no esta en PATH:

```powershell
Get-Content .\database\init_db.sql | C:\xampp\mysql\bin\mysql.exe -u root -p
```

## Levantar Backend

```powershell
cd "C:\Users\jheis\OneDrive\Desktop\UTTOF - Restaurant\backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

URLs:

- API: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/health`

## Levantar Panel Admin

```powershell
cd "C:\Users\jheis\OneDrive\Desktop\UTTOF - Restaurant\frontend\admin"
npm.cmd install
npm.cmd run dev
```

URL:

```text
http://127.0.0.1:5173
```

## Levantar App Mesero

```powershell
cd "C:\Users\jheis\OneDrive\Desktop\UTTOF - Restaurant\frontend\mesero"
npm.cmd install
npm.cmd run dev
```

URL:

```text
http://127.0.0.1:5174
```

## Levantar Panel Cocina Basico

```powershell
cd "C:\Users\jheis\OneDrive\Desktop\UTTOF - Restaurant\frontend\cocina-basico"
npm.cmd install
npm.cmd run dev
```

URL:

```text
http://127.0.0.1:5175
```

## Credenciales Demo

```text
Admin:
admin@uttof.pe
admin123

Mesero:
mesero@uttof.pe
mesero123

Cocina:
cocina@uttof.pe
cocina123
```

## Validaciones Ejecutadas

```powershell
cd backend
.\.venv\Scripts\python.exe -m compileall -q app

cd frontend/admin
npm.cmd run build

cd frontend/mesero
npm.cmd run build

cd frontend/cocina-basico
npm.cmd run build
```
