# Migraciones Backend

En una base nueva ejecutar, en orden:

```powershell
Get-Content .\app\db\migrations.sql | mysql -u uttof_user -p uttof_db
Get-Content .\app\db\003_mesero_app.sql | mysql -u uttof_user -p uttof_db
python -m app.db.seed
```

`003_mesero_app.sql` agrega exclusivamente los campos definidos por el contrato de la App Mesero: asignacion, zona, comensales, curso y estado por item.
