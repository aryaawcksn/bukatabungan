-- Migration: Fix EDD tables structure
-- Date: 2025-12-11
-- Description: Add missing pengajuan_id columns and constraints to EDD tables

-- ============================================
-- 1. Add pengajuan_id column to edd_bank_lain
-- ============================================
ALTER TABLE edd_bank_lain 
ADD COLUMN IF NOT EXISTS pengajuan_id BIGINT;

-- Add foreign key constraint (check if not exists first)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_edd_bank_lain_pengajuan'
    ) THEN
        ALTER TABLE edd_bank_lain 
        ADD CONSTRAINT fk_edd_bank_lain_pengajuan 
        FOREIGN KEY (pengajuan_id) REFERENCES pengajuan_tabungan(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- 2. Add pengajuan_id column to edd_pekerjaan_lain
-- ============================================
ALTER TABLE edd_pekerjaan_lain 
ADD COLUMN IF NOT EXISTS pengajuan_id BIGINT;

-- Add foreign key constraint (check if not exists first)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_edd_pekerjaan_lain_pengajuan'
    ) THEN
        ALTER TABLE edd_pekerjaan_lain 
        ADD CONSTRAINT fk_edd_pekerjaan_lain_pengajuan 
        FOREIGN KEY (pengajuan_id) REFERENCES pengajuan_tabungan(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- 3. Add created_at and updated_at columns if missing
-- ============================================
ALTER TABLE edd_bank_lain 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

ALTER TABLE edd_pekerjaan_lain 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ============================================
-- 4. Update constraints to make required fields NOT NULL
-- ============================================
ALTER TABLE edd_bank_lain 
ALTER COLUMN bank_name SET NOT NULL,
ALTER COLUMN jenis_rekening SET NOT NULL,
ALTER COLUMN nomor_rekening SET NOT NULL;

ALTER TABLE edd_pekerjaan_lain 
ALTER COLUMN jenis_usaha SET NOT NULL;

-- ============================================
-- 5. Add indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_edd_bank_lain_pengajuan_id ON edd_bank_lain(pengajuan_id);
CREATE INDEX IF NOT EXISTS idx_edd_bank_lain_edd_id ON edd_bank_lain(edd_id);
CREATE INDEX IF NOT EXISTS idx_edd_pekerjaan_lain_pengajuan_id ON edd_pekerjaan_lain(pengajuan_id);
CREATE INDEX IF NOT EXISTS idx_edd_pekerjaan_lain_edd_id ON edd_pekerjaan_lain(edd_id);