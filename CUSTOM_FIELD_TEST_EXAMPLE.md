# Custom Field Test Example

## Test Scenario: User dengan pendidikan custom "TK/SD"

### 1. Data di Database
```sql
-- Sebelum fix: salah
pendidikan = "Lainnya"

-- Setelah fix: benar  
pendidikan = "TK/SD"
```

### 2. Ketika Load Data (Frontend)
```typescript
// Data dari backend
fullSubmission.personalData.education = "TK/SD"

// Auto-detection logic
checkAndSetCustomField('pendidikan', 'TK/SD', 'pendidikan_custom');

// Result:
formData.pendidikan = "Lainnya"           // Dropdown shows "Lainnya"
formData.pendidikan_custom = "TK/SD"      // Custom input shows "TK/SD"
```

### 3. Ketika User Edit dan Save
```typescript
// User sees:
// Dropdown: "Lainnya" (selected)
// Custom input: "TK/SD" (editable)

// When saving:
if (formData.pendidikan === 'Lainnya' && formData.pendidikan_custom) {
  dataToSend.pendidikan = formData.pendidikan_custom; // "TK/SD"
}

// Data sent to backend:
{
  pendidikan: "TK/SD"  // NOT "Lainnya"
}
```

### 4. Backend Processing (EditController)
```javascript
// EditController receives:
editData.pendidikan = "TK/SD"

// Saves directly to database:
UPDATE cdd_self SET pendidikan = 'TK/SD' WHERE pengajuan_id = $1
```

### 5. Final Result
- Database: `pendidikan = "TK/SD"` ✅
- UI: Shows "Lainnya" selected with "TK/SD" in custom input ✅
- User can edit the custom value ✅

## Test Cases to Verify

1. **Load existing custom value**: Should show "Lainnya" + custom input with actual value
2. **Edit custom value**: Should save new custom value to database
3. **Change from custom to standard**: Should save standard value
4. **Change from standard to custom**: Should save custom value
5. **Multiple custom fields**: Should handle all custom fields correctly

## Fields That Support Custom Values
- `jenis_id` → `jenis_id_custom`
- `agama` → `agama_custom` 
- `pendidikan` → `pendidikan_custom`
- `pekerjaan` → `pekerjaan_custom`
- `sumber_dana` → `sumber_dana_custom`
- `tujuan_pembukaan` → `tujuan_pembukaan_custom`
- `kontak_darurat_hubungan` → `kontak_darurat_hubungan_custom`
- `bo_jenis_id` → `bo_jenis_id_custom`
- `bo_sumber_dana` → `bo_sumber_dana_custom`
- `bo_hubungan` → `bo_hubungan_custom`