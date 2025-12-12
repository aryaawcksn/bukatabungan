-- Rollback Migration: Remove customer type and existing account number fields
-- Date: 2024-12-11

-- Remove the added columns
ALTER TABLE cdd_self 
DROP COLUMN IF EXISTS tipe_nasabah;

ALTER TABLE cdd_self 
DROP COLUMN IF EXISTS nomor_rekening_lama;