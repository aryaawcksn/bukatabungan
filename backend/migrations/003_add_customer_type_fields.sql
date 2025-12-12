-- Migration: Add customer type and existing account number fields
-- Date: 2024-12-11
-- Description: Add fields to support new/existing customer selection and account number for existing customers

-- Add customer type field to cdd_self table
ALTER TABLE cdd_self 
ADD COLUMN tipe_nasabah VARCHAR(20) DEFAULT 'baru' CHECK (tipe_nasabah IN ('baru', 'lama'));

-- Add existing account number field for existing customers
ALTER TABLE cdd_self 
ADD COLUMN nomor_rekening_lama VARCHAR(50);

-- Add comment for documentation
COMMENT ON COLUMN cdd_self.tipe_nasabah IS 'Tipe nasabah: baru atau lama';
COMMENT ON COLUMN cdd_self.nomor_rekening_lama IS 'Nomor rekening yang sudah ada untuk nasabah lama';