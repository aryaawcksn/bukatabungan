-- Migration: Add EDD (Enhanced Due Diligence) tables
-- Date: 2025-12-11
-- Description: Adds edd_bank_lain and edd_pekerjaan_lain tables for enhanced form data

-- ============================================
-- 1. Create edd_bank_lain table
-- ============================================
CREATE TABLE IF NOT EXISTS edd_bank_lain (
    id SERIAL PRIMARY KEY,
    edd_id INTEGER NOT NULL,
    pengajuan_id INTEGER NOT NULL REFERENCES pengajuan_tabungan(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    jenis_rekening VARCHAR(50) NOT NULL,
    nomor_rekening VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. Create edd_pekerjaan_lain table  
-- ============================================
CREATE TABLE IF NOT EXISTS edd_pekerjaan_lain (
    id SERIAL PRIMARY KEY,
    edd_id INTEGER NOT NULL,
    pengajuan_id INTEGER NOT NULL REFERENCES pengajuan_tabungan(id) ON DELETE CASCADE,
    jenis_usaha VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. Add indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_edd_bank_lain_pengajuan_id ON edd_bank_lain(pengajuan_id);
CREATE INDEX IF NOT EXISTS idx_edd_bank_lain_edd_id ON edd_bank_lain(edd_id);
CREATE INDEX IF NOT EXISTS idx_edd_pekerjaan_lain_pengajuan_id ON edd_pekerjaan_lain(pengajuan_id);
CREATE INDEX IF NOT EXISTS idx_edd_pekerjaan_lain_edd_id ON edd_pekerjaan_lain(edd_id);

-- ============================================
-- 4. Add comments for documentation
-- ============================================
COMMENT ON TABLE edd_bank_lain IS 'Enhanced Due Diligence - Additional bank account information';
COMMENT ON COLUMN edd_bank_lain.edd_id IS 'EDD identifier for grouping related records';
COMMENT ON COLUMN edd_bank_lain.pengajuan_id IS 'Reference to main application';
COMMENT ON COLUMN edd_bank_lain.bank_name IS 'Name of the bank';
COMMENT ON COLUMN edd_bank_lain.jenis_rekening IS 'Type of account (Tabungan, Giro, etc.)';
COMMENT ON COLUMN edd_bank_lain.nomor_rekening IS 'Account number';

COMMENT ON TABLE edd_pekerjaan_lain IS 'Enhanced Due Diligence - Additional employment/business information';
COMMENT ON COLUMN edd_pekerjaan_lain.edd_id IS 'EDD identifier for grouping related records';
COMMENT ON COLUMN edd_pekerjaan_lain.pengajuan_id IS 'Reference to main application';
COMMENT ON COLUMN edd_pekerjaan_lain.jenis_usaha IS 'Type of business/employment';