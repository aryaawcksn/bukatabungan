-- Migration: Add missing fields for complete form data collection
-- Date: 2025-12-09
-- Description: Adds fields to support enhanced FormSimpel component

-- ============================================
-- 1. Add missing columns to cdd_self table
-- ============================================

ALTER TABLE cdd_self
ADD COLUMN IF NOT EXISTS rekening_untuk_sendiri BOOLEAN DEFAULT TRUE;

-- ============================================
-- 2. cdd_job table - NO CHANGES NEEDED
-- ============================================
-- Note: cdd_job table already has all required columns:
-- - rata_transaksi_per_bulan (not rata_rata_transaksi)
-- - no_telepon (not telepon_perusahaan)
-- Reference contact fields (referensi_*) are NOT stored in cdd_job table
-- They are collected in frontend but not persisted to database yet

-- ============================================
-- 3. Add missing column to account table and set default for tabungan_tipe
-- ============================================

ALTER TABLE account 
ADD COLUMN IF NOT EXISTS nominal_setoran DECIMAL(15, 2);

-- Set default value for tabungan_tipe to 'simpel' if it has NOT NULL constraint
ALTER TABLE account 
ALTER COLUMN tabungan_tipe SET DEFAULT 'simpel';

-- ============================================
-- 4. Add missing columns to bo (beneficial owner) table
-- ============================================
-- Note: Table 'bo' already exists based on database diagram
-- Adding missing columns if they don't exist

ALTER TABLE bo
ADD COLUMN IF NOT EXISTS status_pemilikan VARCHAR(100),
ADD COLUMN IF NOT EXISTS jenis_usaha VARCHAR(100),
ADD COLUMN IF NOT EXISTS status_kepemilikan VARCHAR(100),
ADD COLUMN IF NOT EXISTS persentase_saham DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS hubungan VARCHAR(100),
ADD COLUMN IF NOT EXISTS pendapatan_tahunan VARCHAR(50),
ADD COLUMN IF NOT EXISTS nomor_hp VARCHAR(20),
ADD COLUMN IF NOT EXISTS persetujuan BOOLEAN DEFAULT FALSE;

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON COLUMN cdd_self.rekening_untuk_sendiri IS 'Indicates if the account is for the applicant themselves (TRUE) or for someone else (FALSE). Beneficial owner info is only required when FALSE (for others).';

-- Note: cdd_job comments removed as columns already exist with correct names:
-- rata_transaksi_per_bulan, no_telepon
-- Reference contact fields are not stored in database

COMMENT ON COLUMN account.nominal_setoran IS 'Initial deposit amount';

COMMENT ON COLUMN bo.pendapatan_tahunan IS 'Annual income range: sd-5jt, 5-10jt, 10-25jt, 25-100jt, >100jt';
COMMENT ON COLUMN bo.persetujuan IS 'Beneficial owner approval confirmation';
