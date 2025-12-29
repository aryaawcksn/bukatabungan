-- Migration: Simplify edit audit trail
-- Date: 2025-12-29
-- Description: Menyederhanakan audit trail untuk edit data, menghapus audit kompleks dan validasi yang tidak diperlukan

-- ============================================
-- 1. Drop complex audit trail table
-- ============================================
DROP TABLE IF EXISTS submission_edit_history CASCADE;

-- ============================================
-- 2. Simplify pengajuan_tabungan edit tracking
-- ============================================
-- Keep only essential edit tracking columns
ALTER TABLE pengajuan_tabungan 
DROP COLUMN IF EXISTS original_approved_by,
DROP COLUMN IF EXISTS original_approved_at;

-- Ensure we have the simplified columns
ALTER TABLE pengajuan_tabungan 
ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_edited_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0;

-- ============================================
-- 3. Add comments for simplified tracking
-- ============================================
COMMENT ON COLUMN pengajuan_tabungan.last_edited_at IS 'Timestamp of last edit';
COMMENT ON COLUMN pengajuan_tabungan.last_edited_by IS 'User who made the last edit';
COMMENT ON COLUMN pengajuan_tabungan.edit_count IS 'Number of times this submission has been edited (0 = no edit, >0 = has been edited)';

-- ============================================
-- 4. Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pengajuan_last_edited_by ON pengajuan_tabungan(last_edited_by);
CREATE INDEX IF NOT EXISTS idx_pengajuan_edit_count ON pengajuan_tabungan(edit_count);

-- ============================================
-- 5. Update existing data to set edit_count = 0 for unedited submissions
-- ============================================
UPDATE pengajuan_tabungan 
SET edit_count = 0 
WHERE edit_count IS NULL;