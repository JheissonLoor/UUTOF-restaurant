# UTTOF - Plataforma SOA para Gestion de Restaurante

UTTOF es un proyecto academico de Arquitectura de Software orientado a la gestion operativa de un restaurante peruano. El sistema usa una arquitectura SOA sobre un monolito modular, con backend en FastAPI, base de datos MySQL y frontends independientes para administracion, mesero, cocina y cliente.

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
  standard/
  admin/
  cliente/
  kds/
  mesero/
  cocina/

docs/
  arquitectura.html

design_handoff_cocina_basico/
design_handoff_cocina_pro/
design_handoff_cliente/
design_handoff_kds/
design_handoff_mesero/
design_handoff_panel_admin/
```

## Modelo De Planes

UTTOF se organiza en tres niveles comerciales. Todos comparten el mismo backend, pero cada frontend expone solamente las funciones de su plan.

| Plan | Precio de referencia | Experiencia | Implementacion actual |
| --- | ---: | --- | --- |
| Estandar | S/ 99 | Una sola aplicacion para Cliente, Verificador, Cocina y Admin | `frontend/standard` |
| Operacion Pro | S/ 249 | Aplicaciones dedicadas para cada area operativa | `frontend/admin`, `frontend/mesero`, `frontend/cliente`, `frontend/cocina` |
| Multi-local | S/ 599 | Operacion avanzada, tiempo real y administracion de varias sedes | `frontend/kds` como primer modulo premium |

El tablero simple del plan Estandar vive dentro de `frontend/standard`; la cocina dedicada del plan Operacion Pro vive en `frontend/cocina`.

## Roles

El backend maneja cuatro roles tecnicos:

| Rol | Responsabilidad |
| --- | --- |
| `admin` | Gestiona dashboard, menu, mesas, usuarios, reportes y configuracion. |
| `mesero` | En Estandar actua como Verificador; en Pro gestiona mesas, pedidos y cobros. |
| `cocina` | Atiende el tablero simple, la cocina dedicada Pro o el KDS Multi-local. |
| `cliente` | Realiza check-in, consulta la carta, envia pedidos, sigue estados, paga, reserva y registra resenas. |

## Funcionalidades Implementadas

Backend:

- Health check en `/health`.
- Autenticacion JWT: register, login y refresh.
- RBAC por rol.
- Usuarios: listar, obtener y actualizar.
- Menu: categorias, platillos, creacion y actualizacion.
- Mesas: listado, estado, check-in y sentar comensales.
- Pedidos: listado para cocina, cambio de estado por flujo, detalle, creacion desde cliente, agregar items, llamar cocina, marcar item entregado y generar cuenta.
- Pagos compartidos: tarjeta, Yape, efectivo y mixto. En Estandar se muestran tarjeta, Yape y efectivo; el pago dividido queda reservado para Multi-local.
- Verificacion de efectivo: bandeja por mesas asignadas, monto recibido, cambio, confirmacion atomica y liberacion de mesa.
- Reservas y resenas para la experiencia del cliente.
- Reportes: dashboard y ventas.
- Configuracion base del restaurante.
- WebSocket base para eventos realtime con admin, mesero, cocina y cliente.

Frontend Estandar (`frontend/standard`):

- Una URL para los cuatro perfiles, con redireccion por rol despues del login.
- Cliente: carta, carrito, check-in, pedido, seguimiento por polling, pago, reserva y resena.
- Verificador: cobros en efectivo pendientes, confirmacion del monto recibido y calculo de cambio.
- Cocina: kanban claro de tres estados, avance del pedido completo y polling cada 30 segundos.
- Admin: dashboard, menu, mesas, usuarios, reportes por rango y configuracion.
- No expone pagos divididos, exportaciones, cronometros de urgencia ni KDS en tiempo real.

Operacion Pro - Frontend Admin:

- Login protegido por rol admin.
- Dashboard conectado al backend.
- Navegacion principal.
- Modulos de menu, mesas, reservas, empleados, reportes y configuracion.
- Estados de carga, error y vacio en pantallas principales.

Operacion Pro - Frontend Mesero:

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
- Verificar pagos en efectivo solicitados desde la App Cliente.
- Generar una cuenta QR vinculada al folio del pedido.
- Liberar mesa despues del pago.

Operacion Pro - Frontend Cocina Dedicada (`frontend/cocina`):

- Login para rol cocina o admin.
- Tablero kanban claro con columnas: en espera, en preparacion, terminado, por pagar y pagado.
- Polling cada 15 segundos contra el backend real.
- Avance manual del pedido completo: empezar preparacion, marcar terminado y entregar a mesa.
- Indicador del origen del pedido, progreso por platillos y urgencia visual despues de 20 minutos.
- Estadisticas del turno y filtro por mesa.
- Filtros por estado con contador.
- Estados de carga, error, vacio y toast de confirmacion.

Multi-local - KDS Premium:

- Tema oscuro de alto contraste para monitor de cocina o tablet horizontal.
- Login para rol cocina o admin.
- Topbar con marca, reloj, cocinero activo y metricas.
- Board conectado al backend real con tickets activos.
- Vista en tarjetas y vista en lista.
- Filtros por activos, nuevos, en cocina, urgentes y listos.
- Cronometro visual por ticket con limite legible `99:59+` para pedidos antiguos.
- Urgencia visual automatica por tiempo de preparacion.
- Marcado individual de platillos dentro de cada ticket.
- Avance de ticket completo a listo y entregado.
- Pausa y reanudacion de tickets.
- Reporte de falta de insumo desde el ticket.
- Sonido opcional de aviso ante eventos nuevos.
- Modo pantalla completa.
- WebSocket con reconexion automatica, resaltado de tickets y refetch ante eventos de pedido.
- Estados de carga, error, vacio y confirmaciones visuales.

Operacion Pro - Frontend Cliente:

- Entrada walk-in con escaneo QR mediante la camara y confirmacion real de mesa.
- Sesion automatica de cliente demo con JWT y refresh.
- Carta publica conectada al backend real.
- Carrito persistente en navegador por mesa.
- Pedido directo a cocina usando `POST /v1/pedidos`.
- Tracking del pedido con WebSocket y fallback por polling.
- Checkout postpago con tarjeta, Yape o efectivo.
- Reserva simple y registro de resena.
- Estados de carga, error, vacio y confirmaciones visuales.

## Pendiente

- Completar Multi-local: inventario, varias sedes, exportaciones, pagos divididos, fidelizacion y modo offline.
- Cambio de mesa.
- Pruebas automatizadas mas amplias.
- Despliegue en infraestructura publica.

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
Get-Content .\app\db\004_kds_premium.sql | mysql -u uttof_user -p uttof_db
Get-Content .\app\db\005_pago_efectivo_pendiente.sql | mysql -u uttof_user -p uttof_db
python -m app.db.seed
```

Si usas XAMPP y `mysql` no esta en PATH:

```powershell
Get-Content .\database\init_db.sql | C:\xampp\mysql\bin\mysql.exe -u root -p
Get-Content .\app\db\migrations.sql | C:\xampp\mysql\bin\mysql.exe -u uttof_user -p uttof_db
Get-Content .\app\db\003_mesero_app.sql | C:\xampp\mysql\bin\mysql.exe -u uttof_user -p uttof_db
Get-Content .\app\db\004_kds_premium.sql | C:\xampp\mysql\bin\mysql.exe -u uttof_user -p uttof_db
Get-Content .\app\db\005_pago_efectivo_pendiente.sql | C:\xampp\mysql\bin\mysql.exe -u uttof_user -p uttof_db
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

## Levantar Plan Estandar

```powershell
cd "C:\Users\jheis\OneDrive\Desktop\UTTOF - Restaurant\frontend\standard"
npm.cmd install
npm.cmd run dev
```

URL:

```text
http://127.0.0.1:5178
```

## Levantar Operacion Pro - Admin

```powershell
cd "C:\Users\jheis\OneDrive\Desktop\UTTOF - Restaurant\frontend\admin"
npm.cmd install
npm.cmd run dev
```

URL:

```text
http://127.0.0.1:5173
```

## Levantar Operacion Pro - Mesero

```powershell
cd "C:\Users\jheis\OneDrive\Desktop\UTTOF - Restaurant\frontend\mesero"
npm.cmd install
npm.cmd run dev
```

URL:

```text
http://127.0.0.1:5174
```

## Levantar Operacion Pro - Cocina Dedicada

```powershell
cd "C:\Users\jheis\OneDrive\Desktop\UTTOF - Restaurant\frontend\cocina"
npm.cmd install
npm.cmd run dev
```

URL:

```text
http://127.0.0.1:5175
```

## Levantar Operacion Pro - Cliente

```powershell
cd "C:\Users\jheis\OneDrive\Desktop\UTTOF - Restaurant\frontend\cliente"
npm.cmd install
npm.cmd run dev
```

URL:

```text
http://127.0.0.1:5176
```

## Levantar Multi-local - KDS Premium

```powershell
cd "C:\Users\jheis\OneDrive\Desktop\UTTOF - Restaurant\frontend\kds"
npm.cmd install
npm.cmd run dev
```

URL:

```text
http://127.0.0.1:5177
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

Cliente:
cliente@uttof.pe
cliente123
```

## Validaciones Ejecutadas

```powershell
cd backend
.\.venv\Scripts\python.exe -m compileall -q app

cd frontend/admin
npm.cmd run build

cd frontend/mesero
npm.cmd run build

cd frontend/cocina
npm.cmd run build

cd frontend/cliente
npm.cmd run lint
npm.cmd run build

cd frontend/kds
npm.cmd run lint
npm.cmd run build

cd frontend/standard
npm.cmd run lint
npm.cmd run build
```
