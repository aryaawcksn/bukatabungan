-- Rollback Migration: Remove fields added for complete form data collection
-- Date: 2025-12-09
-- Description: Rolls back changes from 001_add_missing_fields.sql

-- ============================================
-- 1. Remove columns from bo (beneficial owner) table
-- ============================================

ALTER TABLE bo
DROP COLUMN IF EXISTS status_pemilikan,
DROP COLUMN IF EXISTS jenis_usaha,
DROP COLUMN IF EXISTS status_kepemilikan,
DROP COLUMN IF EXISTS persentase_saham,
DROP COLUMN IF EXISTS hubungan,
DROP COLUMN IF EXISTS pendapatan_tahunan,
DROP COLUMN IF EXISTS nomor_hp,
DROP COLUMN IF EXISTS persetujuan;

-- ============================================
-- 2. Remove column from account table
-- ============================================

ALTER TABLE account 
DROP COLUMN IF EXISTS nominal_setoran;

-- ============================================
-- 3. cdd_job table - NO ROLLBACK NEEDED
-- ============================================
-- No columns were added to cdd_job table

-- ============================================
-- 4. Remove column from cdd_self table
-- ============================================

ALTER TABLE cdd_self
DROP COLUMN IF EXISTS rekening_untuk_sendiri;
