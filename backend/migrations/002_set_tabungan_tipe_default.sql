-- Migration: Set default value for tabungan_tipe column
-- Date: 2025-12-09
-- Description: Sets default value to 'simpel' for tabungan_tipe to handle NOT NULL constraint

ALTER TABLE account 
ALTER COLUMN tabungan_tipe SET DEFAULT 'simpel';

-- Add comment
COMMENT ON COLUMN account.tabungan_tipe IS 'Account type (simpel, tabunganku, etc). Defaults to simpel.';
