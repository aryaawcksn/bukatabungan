# FormSimpel Fixes Applied

## Date: 2025-12-09

## ⚠️ IMPORTANT: Database Structure Correction

Based on the actual database diagram provided, the following corrections were made:
- Beneficial Owner table is named `bo` (not `cdd_beneficial_owner`)
- Field name in `bo` table is `pendapatan_tahunan` (not `pendapatan_tahun`)
- Table `bo` already exists in the database

## Problems Fixed

### 1. ✅ Validation only runs once and doesn't recheck (NIK, Email, Phone)

**Solution:** Added error clearing on `onChange` events for NIK, Email, and Phone fields, and proper error clearing on successful validation in `onBlur` handlers.

**Changes:**
- `frontend/src/components/account-forms/FormSimpel.tsx`:
  - NIK field: Added error clearing in `onChange` and proper success/failure handling in `onBlur`
  - Email field: Added error clearing in `onChange` and proper success/failure handling in `onBlur`
  - Phone field: Added error clearing in `onChange` and proper success/failure handling in `onBlur`

### 2. ✅ NPWP hidden for Simpel

**Status:** Already implemented (NPWP field is commented out in FormSimpel)

### 3. ✅ Identity type and input fields must be consistent

**Solution:** Made the identity number field label and placeholder dynamic based on selected identity type. Also added format validation before async NIK validation.

**Changes:**
- `frontend/src/components/account-forms/FormSimpel.tsx`:
  - Changed "Jenis Identitas" select option from "KTP" to "KTP / KIA" for clarity
  - Made the identity number field label dynamic: "NIK / KIA" for KTP, "Nomor Paspor" for Passport, "Nomor Identitas" for others
  - Made placeholder dynamic based on identity type
  - Added format validation before async validation
  - Clear identity number when identity type changes

### 4. ✅ ATM preference only for Mutiara

**Status:** Already implemented (ATM preference field is commented out in FormSimpel)

### 5. ✅ Beneficial Owner only if user selects account for others

**Solution:** Added a new field `rekeningUntukSendiri` (boolean) to track if the account is for the user themselves. The Beneficial Owner section is now conditionally rendered only when this is FALSE (account for others, not for self).

**Changes:**

#### Database Migration
- `backend/migrations/001_add_missing_fields.sql`:
  - Added `rekening_untuk_sendiri BOOLEAN DEFAULT TRUE` column to `cdd_self` table
  - Added missing columns to `bo` table (beneficial owner): `persetujuan`, `pendapatan_tahunan`, etc.
  - Added documentation comments explaining the field purposes
  - **Note**: Uses existing `bo` table (not creating new `cdd_beneficial_owner` table)

#### TypeScript Types
- `frontend/src/components/account-forms/types.ts`:
  - Added `rekeningUntukSendiri: boolean` field to `AccountFormData` interface

#### Frontend Component
- `frontend/src/components/account-forms/FormSimpel.tsx`:
  - Added "Kepemilikan Rekening" section with radio buttons to select if account is for self or others
  - Wrapped Beneficial Owner section in conditional rendering: `{formData.rekeningUntukSendiri === false && (...)}` 
  - Updated beneficial owner validation to only run when `rekeningUntukSendiri` is FALSE (for others)
  - Added `formData.rekeningUntukSendiri` to validation useEffect dependencies

#### Form State
- `frontend/src/components/AccountForm.tsx`:
  - Added `rekeningUntukSendiri: true` to initial form state (defaults to true - for self)
  - Added `rekening_untuk_sendiri: data.rekeningUntukSendiri` to submit data
  - Made beneficial owner fields conditional in submit data (only sent if `rekeningUntukSendiri` is FALSE - for others)

#### Backend Controller
- `backend/controllers/pengajuanController.js`:
  - Added `rekening_untuk_sendiri = true` to destructured request body
  - Added `rekening_untuk_sendiri` column to `cdd_self` INSERT query
  - Added `rekening_untuk_sendiri` value to query parameters
  - Updated beneficial owner insert condition: `if (rekening_untuk_sendiri === false && bo_nama)` (only for others)
  - **Fixed table name**: Changed `cdd_beneficial_owner` to `bo` in INSERT query
  - **Fixed column name**: Changed `pendapatan_tahun` to `pendapatan_tahunan` in INSERT and SELECT queries
  - **Fixed JOIN**: Updated LEFT JOIN from `cdd_beneficial_owner` to `bo` in SELECT query

## Summary

All 5 problems have been addressed:

1. **Validation recheck**: Fields now clear errors on change and properly handle success/failure on blur
2. **NPWP hidden**: Already implemented
3. **Identity fields consistency**: Labels and placeholders now match the selected identity type
4. **ATM preference**: Already limited to appropriate account types
5. **Beneficial Owner conditional**: Now only shown and required when account is for the user themselves

## Testing Recommendations

1. Test NIK/Email/Phone validation:
   - Enter invalid value → see error
   - Correct the value → error should clear
   - Enter valid value → no error should appear

2. Test identity type selection:
   - Select KTP → label shows "NIK / KIA", placeholder "16 digit"
   - Select Paspor → label shows "Nomor Paspor", placeholder "6-9 karakter"
   - Select Lainnya → label shows "Nomor Identitas", generic placeholder

3. Test Beneficial Owner conditional:
   - Select "Ya, untuk saya sendiri" → BO section should NOT appear
   - Select "Tidak, untuk orang lain" → BO section should appear
   - Submit with "Ya" selected → BO data should NOT be saved
   - Submit with "Tidak" selected → BO data should be saved

4. Run database migration to add the new `rekening_untuk_sendiri` column
