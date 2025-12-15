-- Migration: Add edit audit trail for submissions
-- Date: 2025-12-15
-- Description: Add columns for tracking edits and audit trail

-- ============================================
-- 1. Add edit tracking columns to pengajuan_tabungan
-- ============================================
ALTER TABLE pengajuan_tabungan 
ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_edited_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_approved_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS original_approved_at TIMESTAMP;

-- ============================================
-- 2. Create submission_edit_history table
-- ============================================
CREATE TABLE IF NOT EXISTS submission_edit_history (
    id SERIAL PRIMARY KEY,
    pengajuan_id INTEGER NOT NULL REFERENCES pengajuan_tabungan(id) ON DELETE CASCADE,
    edited_by INTEGER NOT NULL REFERENCES users(id),
    edited_at TIMESTAMP DEFAULT NOW(),
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    edit_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. Add indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pengajuan_last_edited_by ON pengajuan_tabungan(last_edited_by);
CREATE INDEX IF NOT EXISTS idx_pengajuan_original_approved_by ON pengajuan_tabungan(original_approved_by);
CREATE INDEX IF NOT EXISTS idx_submission_edit_history_pengajuan_id ON submission_edit_history(pengajuan_id);
CREATE INDEX IF NOT EXISTS idx_submission_edit_history_edited_by ON submission_edit_history(edited_by);
CREATE INDEX IF NOT EXISTS idx_submission_edit_history_edited_at ON submission_edit_history(edited_at);

-- ============================================
-- 4. Add comments for documentation
-- ============================================
COMMENT ON COLUMN pengajuan_tabungan.last_edited_at IS 'Timestamp of last edit (only for approved submissions)';
COMMENT ON COLUMN pengajuan_tabungan.last_edited_by IS 'User who made the last edit';
COMMENT ON COLUMN pengajuan_tabungan.edit_count IS 'Number of times this submission has been edited';
COMMENT ON COLUMN pengajuan_tabungan.original_approved_by IS 'Original approver before any edits';
COMMENT ON COLUMN pengajuan_tabungan.original_approved_at IS 'Original approval timestamp before any edits';

COMMENT ON TABLE submission_edit_history IS 'Audit trail for submission edits';
COMMENT ON COLUMN submission_edit_history.pengajuan_id IS 'Reference to the edited submission';
COMMENT ON COLUMN submission_edit_history.edited_by IS 'User who made the edit';
COMMENT ON COLUMN submission_edit_history.field_name IS 'Name of the field that was edited';
COMMENT ON COLUMN submission_edit_history.old_value IS 'Previous value before edit';
COMMENT ON COLUMN submission_edit_history.new_value IS 'New value after edit';
COMMENT ON COLUMN submission_edit_history.edit_reason IS 'Reason for the edit provided by user';