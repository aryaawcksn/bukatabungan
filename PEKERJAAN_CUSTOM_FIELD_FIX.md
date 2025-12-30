# Pekerjaan Custom Field Fix

## Problem
Field pekerjaan "lainnya" tidak muncul custom input field ketika dipilih.

## Root Cause
Inconsistency dalam value dropdown:
- Dropdown option: `{ value: 'lainnya', label: 'Lainnya' }` (lowercase)
- Logic check: `if (value === 'Lainnya')` (uppercase)

## Fix Applied
Changed dropdown option to use consistent uppercase:
```typescript
// BEFORE:
pekerjaan: [
  // ... other options
  { value: 'lainnya', label: 'Lainnya' }  // lowercase value
],

// AFTER:
pekerjaan: [
  // ... other options  
  { value: 'Lainnya', label: 'Lainnya' }  // uppercase value
],
```

## Test Scenario
1. **Load data with custom pekerjaan**: e.g., "Freelancer"
   - Should show dropdown "Lainnya" selected
   - Should show custom input with "Freelancer"

2. **Select "Lainnya" from dropdown**:
   - Custom input field should appear
   - User can type custom value

3. **Save custom pekerjaan**:
   - Should save actual custom value to database
   - Should not save "Lainnya"

## Verification
All dropdown fields now use consistent "Lainnya" (uppercase):
- ✅ `jenis_id`: "Lainnya"
- ✅ `agama`: "Lainnya" 
- ✅ `pendidikan`: "Lainnya"
- ✅ `pekerjaan`: "Lainnya" (fixed)
- ✅ `sumber_dana`: "Lainnya"
- ✅ `tujuan_pembukaan`: "Lainnya"
- ✅ `kontak_darurat_hubungan`: "Lainnya"
- ✅ `bo_jenis_id`: "Lainnya"
- ✅ `bo_sumber_dana`: "Lainnya"
- ✅ `bo_hubungan`: "Lainnya"

## Expected Behavior After Fix
When user selects "Lainnya" for pekerjaan:
1. Dropdown shows "Lainnya" selected
2. Custom input field appears below dropdown
3. User can enter custom occupation like "Freelancer", "Konsultan", etc.
4. When saved, actual custom value is stored in database
5. When loaded again, shows "Lainnya" + custom input with the actual value