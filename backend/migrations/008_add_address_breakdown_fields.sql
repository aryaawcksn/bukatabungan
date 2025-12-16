-- ============================================
-- Migration: Add Address Breakdown Fields
-- Description: Add separate columns for better address analysis
-- ============================================

-- Add address breakdown fields to cdd_self table
ALTER TABLE cdd_self 
ADD COLUMN IF NOT EXISTS alamat_jalan TEXT,           -- Street address (Jl. Magelang No. 123, RT 02/RW 05)
ADD COLUMN IF NOT EXISTS provinsi VARCHAR(100),       -- Province
ADD COLUMN IF NOT EXISTS kota VARCHAR(100),           -- City/Regency  
ADD COLUMN IF NOT EXISTS kecamatan VARCHAR(100),      -- District
ADD COLUMN IF NOT EXISTS kelurahan VARCHAR(100);      -- Village/Sub-district

-- Add comment to explain the address structure
COMMENT ON COLUMN cdd_self.alamat_jalan IS 'Street address including RT/RW (e.g., Jl. Magelang No. 123, RT 02/RW 05)';
COMMENT ON COLUMN cdd_self.alamat_id IS 'Complete address (combination of alamat_jalan + kelurahan + kecamatan + kota + provinsi)';
COMMENT ON COLUMN cdd_self.provinsi IS 'Province name from Indonesian address API';
COMMENT ON COLUMN cdd_self.kota IS 'City/Regency name from Indonesian address API';
COMMENT ON COLUMN cdd_self.kecamatan IS 'District name from Indonesian address API';
COMMENT ON COLUMN cdd_self.kelurahan IS 'Village/Sub-district name from Indonesian address API';