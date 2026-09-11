# Migraciones Backend

En una base nueva ejecutar, en orden:

```powershell
Get-Content .\app\db\migrations.sql | mysql -u uttof_user -p uttof_db
Get-Content .\app\db\003_mesero_app.sql | mysql -u uttof_user -p uttof_db
Get-Content .\app\db\004_kds_premium.sql | mysql -u uttof_user -p uttof_db
Get-Content .\app\db\005_pago_efectivo_pendiente.sql | mysql -u uttof_user -p uttof_db
Get-Content .\app\db\006_cliente_onboarding_qr.sql | mysql -u uttof_user -p uttof_db
Get-Content .\app\db\007_multilocal_base.sql | mysql -u uttof_user -p uttof_db
Get-Content .\app\db\008_inventario_multilocal.sql | mysql -u uttof_user -p uttof_db
Get-Content .\app\db\009_ia_multilocal.sql | mysql -u uttof_user -p uttof_db
Get-Content .\app\db\010_operacion_multilocal.sql | mysql -u uttof_user -p uttof_db
Get-Content .\app\db\011_config_empresa.sql | mysql -u uttof_user -p uttof_db
python -m app.db.seed
```

`003_mesero_app.sql` agrega exclusivamente los campos definidos por el contrato de la App Mesero: asignacion, zona, comensales, curso y estado por item.

`004_kds_premium.sql` agrega los campos operativos usados por el KDS Premium.

`005_pago_efectivo_pendiente.sql` permite registrar el pago en efectivo solicitado por el cliente y verificarlo posteriormente desde la App Mesero. Tambien guarda el desglose de pagos mixtos.

`006_cliente_onboarding_qr.sql` incorpora sesiones invitadas, preferencias, QR seguros de mesa y QR de reserva.

`007_multilocal_base.sql` crea las sucursales y agrega el ámbito de sucursal a usuarios, mesas e insumos.

`008_inventario_multilocal.sql` agrega inventario y órdenes de compra por local.

`009_ia_multilocal.sql` registra las decisiones tomadas sobre recomendaciones operativas.

`010_operacion_multilocal.sql` habilita carta y personal por sucursal.

`011_config_empresa.sql` agrega integraciones, API keys, configuración general, marca y facturación de la red.

Las migraciones se ejecutan una sola vez y en orden numérico. Después se usa `python -m app.db.seed` para crear datos de demostración sin borrar información existente.
