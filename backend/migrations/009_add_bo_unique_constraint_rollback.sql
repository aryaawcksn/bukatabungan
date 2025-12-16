-- Rollback Migration: Remove unique constraint from bo table
-- Date: 2025-12-16
-- Description: Removes unique constraint from bo.pengajuan_id

-- ============================================
-- 1. Remove unique constraint from bo table
-- ============================================

ALTER TABLE bo 
DROP CONSTRAINT IF EXISTS bo_pengajuan_id_unique;