# Migraciones Backend

En una base nueva ejecutar, en orden:

```powershell
Get-Content .\app\db\migrations.sql | mysql -u uttof_user -p uttof_db
Get-Content .\app\db\003_mesero_app.sql | mysql -u uttof_user -p uttof_db
Get-Content .\app\db\004_kds_premium.sql | mysql -u uttof_user -p uttof_db
Get-Content .\app\db\005_pago_efectivo_pendiente.sql | mysql -u uttof_user -p uttof_db
python -m app.db.seed
```

`003_mesero_app.sql` agrega exclusivamente los campos definidos por el contrato de la App Mesero: asignacion, zona, comensales, curso y estado por item.

`004_kds_premium.sql` agrega los campos operativos usados por el KDS Premium.

`005_pago_efectivo_pendiente.sql` permite registrar el pago en efectivo solicitado por el cliente y verificarlo posteriormente desde la App Mesero. Tambien guarda el desglose de pagos mixtos.
