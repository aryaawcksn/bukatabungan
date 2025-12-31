# BO Fields Debug Summary

## Issue
BO kewarganegaraan and status pernikahan fields are not showing up in the edit submission dialog, even though they have values in the form detail dialog.

## Root Cause Analysis

### 1. Data Flow Investigation
- **Backend**: Fields `bo_kewarganegaraan` and `bo_status_pernikahan` are correctly stored and retrieved
- **DashboardPage Mapping**: `rekening_untuk_sendiri` is mapped to `accountInfo.isForSelf`
- **Edit Dialog**: BO fields are only visible when `formData.rekening_untuk_sendiri === false`

### 2. Potential Issues Identified
1. **Boolean Conversion**: `rekening_untuk_sendiri` might not be converting correctly from backend
2. **Field Clearing Logic**: BO fields might be getting cleared when `rekening_untuk_sendiri` is true
3. **Data Loading Timing**: BO data might not be loading before the conditional rendering check

## Debug Changes Made

### 1. Enhanced Console Logging
```typescript
console.log('🔍 BO data from backend:', {
  rekening_untuk_sendiri: data.data.rekening_untuk_sendiri,
  bo_nama: data.data.bo_nama,
  bo_alamat: data.data.bo_alamat,
  bo_kewarganegaraan: data.data.bo_kewarganegaraan,
  bo_status_pernikahan: data.data.bo_status_pernikahan,
  beneficialOwner: fullSubmission.beneficialOwner
});
```

### 2. Final Form Data Logging
```typescript
console.log('🔍 Final form data loaded:', {
  rekening_untuk_sendiri: fullFormData.rekening_untuk_sendiri,
  bo_kewarganegaraan: fullFormData.bo_kewarganegaraan,
  bo_status_pernikahan: fullFormData.bo_status_pernikahan,
  bo_nama: fullFormData.bo_nama
});
```

### 3. Added Undo Button for rekening_untuk_sendiri
- Added undo functionality for the "Rekening untuk sendiri" radio button field
- This allows users to revert changes and potentially restore BO field visibility

## Expected Behavior
1. When `rekening_untuk_sendiri` is `false`, BO fields should be visible and populated
2. BO kewarganegaraan and status pernikahan should show their values from the database
3. Fields should have proper change tracking and undo functionality

## Testing Steps
1. Open edit dialog for a submission that has BO data
2. Check browser console for the debug logs
3. Verify that `rekening_untuk_sendiri` is `false` when BO data exists
4. Confirm that BO fields are visible and populated with correct values
5. Test undo functionality for the rekening_untuk_sendiri field

## Next Steps
1. Test the edit dialog with a submission that has BO data
2. Check console logs to see actual data values
3. If `rekening_untuk_sendiri` is incorrectly `true`, investigate the boolean conversion
4. If fields are still not visible, check the conditional rendering logic