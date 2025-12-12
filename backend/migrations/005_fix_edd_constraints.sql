-- Migration: Fix EDD constraints
-- Date: 2025-12-11
-- Description: Remove unnecessary foreign key constraints to edd table

-- ============================================
-- 1. Drop unnecessary foreign key constraints
-- ============================================

-- Drop constraint from edd_bank_lain that references edd table
ALTER TABLE edd_bank_lain 
DROP CONSTRAINT IF EXISTS fk_bank_lain_edd;

-- Drop constraint from edd_pekerjaan_lain that references edd table  
ALTER TABLE edd_pekerjaan_lain 
DROP CONSTRAINT IF EXISTS fk_usaha_edd;

-- ============================================
-- 2. Make edd_id nullable since we don't need it to reference edd table
-- ============================================

ALTER TABLE edd_bank_lain 
ALTER COLUMN edd_id DROP NOT NULL;

ALTER TABLE edd_pekerjaan_lain 
ALTER COLUMN edd_id DROP NOT NULL;