-- Migration: Add unique constraint to bo table for pengajuan_id
-- Date: 2025-12-16
-- Description: Adds unique constraint to bo.pengajuan_id to enable proper UPSERT operations

-- ============================================
-- 1. Add unique constraint to bo table
-- ============================================

-- First, remove any duplicate records if they exist
-- Keep only the most recent record for each pengajuan_id
DELETE FROM bo 
WHERE id NOT IN (
    SELECT MAX(id) 
    FROM bo 
    GROUP BY pengajuan_id
);

-- Add unique constraint on pengajuan_id
ALTER TABLE bo 
ADD CONSTRAINT bo_pengajuan_id_unique UNIQUE (pengajuan_id);

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON CONSTRAINT bo_pengajuan_id_unique ON bo IS 'Ensures one BO record per submission, enables UPSERT operations';