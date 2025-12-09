-- Migration: Add missing fields for complete form data collection
-- Date: 2025-12-09
-- Description: Adds fields to support enhanced FormSimpel component

-- ============================================
-- 1. Add missing columns to cdd_self table
-- ============================================

ALTER TABLE cdd_self
ADD COLUMN IF NOT EXISTS rekening_untuk_sendiri BOOLEAN DEFAULT TRUE;

-- ============================================
-- 2. Add missing columns to cdd_job table
-- ============================================
-- Note: alias, jenis_id, berlaku_id already exist in cdd_self based on controller code

ALTER TABLE cdd_job 
ADD COLUMN IF NOT EXISTS rata_rata_transaksi VARCHAR(50),
ADD COLUMN IF NOT EXISTS telepon_perusahaan VARCHAR(20),
ADD COLUMN IF NOT EXISTS referensi_nama VARCHAR(255),
ADD COLUMN IF NOT EXISTS referensi_alamat TEXT,
ADD COLUMN IF NOT EXISTS referensi_telepon VARCHAR(20),
ADD COLUMN IF NOT EXISTS referensi_hubungan VARCHAR(100);

-- ============================================
-- 3. Add missing column to account table
-- ============================================

ALTER TABLE account 
ADD COLUMN IF NOT EXISTS nominal_setoran DECIMAL(15, 2);

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

COMMENT ON COLUMN cdd_job.rata_rata_transaksi IS 'Average monthly transaction amount range';
COMMENT ON COLUMN cdd_job.telepon_perusahaan IS 'Company/institution phone number';
COMMENT ON COLUMN cdd_job.referensi_nama IS 'Reference contact name';
COMMENT ON COLUMN cdd_job.referensi_alamat IS 'Reference contact address';
COMMENT ON COLUMN cdd_job.referensi_telepon IS 'Reference contact phone number';
COMMENT ON COLUMN cdd_job.referensi_hubungan IS 'Relationship to reference contact';

COMMENT ON COLUMN account.nominal_setoran IS 'Initial deposit amount';

COMMENT ON COLUMN bo.pendapatan_tahunan IS 'Annual income range: sd-5jt, 5-10jt, 10-25jt, 25-100jt, >100jt';
COMMENT ON COLUMN bo.persetujuan IS 'Beneficial owner approval confirmation';
