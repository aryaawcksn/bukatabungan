-- Migration: Add atm_tipe column to account table
-- Date: 2025-12-14
-- Description: Adds atm_tipe column to store card type (Gold, Silver, Platinum) for Mutiara accounts

-- ============================================
-- Add atm_tipe column to account table
-- ============================================

ALTER TABLE account 
ADD COLUMN IF NOT EXISTS atm_tipe VARCHAR(50);

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON COLUMN account.atm_tipe IS 'Card type for Mutiara accounts: Gold, Silver, Platinum. NULL for other account types.';