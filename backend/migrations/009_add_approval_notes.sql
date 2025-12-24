-- Migration: Add approval/rejection notes to pengajuan_tabungan table
-- Date: 2025-12-24
-- Description: Adds fields to store approval/rejection reasons and notes

-- ============================================
-- Add approval/rejection notes columns
-- ============================================

ALTER TABLE pengajuan_tabungan
ADD COLUMN IF NOT EXISTS approval_notes TEXT,
ADD COLUMN IF NOT EXISTS rejection_notes TEXT;

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON COLUMN pengajuan_tabungan.approval_notes IS 'Notes/reasons provided when approving the application';
COMMENT ON COLUMN pengajuan_tabungan.rejection_notes IS 'Notes/reasons provided when rejecting the application';