-- Rollback Migration: Remove atm_tipe column from account table
-- Date: 2025-12-14
-- Description: Removes atm_tipe column if needed

-- ============================================
-- Remove atm_tipe column from account table
-- ============================================

ALTER TABLE account 
DROP COLUMN IF EXISTS atm_tipe;