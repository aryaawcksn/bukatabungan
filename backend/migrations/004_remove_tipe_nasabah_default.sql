-- Migration: Remove default value from tipe_nasabah column
-- Date: 2024-12-11
-- Description: Remove default 'baru' value from tipe_nasabah column to allow proper value setting

-- Remove default value
ALTER TABLE cdd_self 
ALTER COLUMN tipe_nasabah DROP DEFAULT;