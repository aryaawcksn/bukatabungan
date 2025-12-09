# Database Migrations

This directory contains SQL migration files for database schema changes.

## Running Migrations

Migrations need to be run manually against your PostgreSQL database. You can use `psql` or any PostgreSQL client.

### Using psql

```bash
# Run migration
psql $DATABASE_URL -f migrations/001_add_missing_fields.sql

# Rollback migration (if needed)
psql $DATABASE_URL -f migrations/001_add_missing_fields_rollback.sql
```

### Using PostgreSQL client

Connect to your database and execute the SQL file contents.

## Migration Files

### 001_add_missing_fields.sql

Adds support for enhanced FormSimpel component fields:

- **cdd_job table**: Adds `rata_rata_transaksi`, `telepon_perusahaan`, and reference contact fields
- **account table**: Adds `nominal_setoran` for initial deposit amount
- **cdd_beneficial_owner table**: Creates new table for beneficial owner information

### 001_add_missing_fields_rollback.sql

Rolls back the changes from `001_add_missing_fields.sql`.

## Notes

- All migrations use `IF NOT EXISTS` / `IF EXISTS` clauses to be idempotent
- The beneficial owner table includes a foreign key constraint to `pengajuan_tabungan`
- An index is created on `pengajuan_id` in the beneficial owner table for performance
