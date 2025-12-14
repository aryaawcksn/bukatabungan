# Cross-Cabang Import Debug Fix

## Problem Identified ❌

Admin cabang tidak bisa import data cabang sendiri:
- **Admin Godean** import data **Godean** → Terdeteksi sebagai cross-cabang ❌
- **Super Admin** import data **Godean** → Terdeteksi sebagai cabang Godean ✅

## Root Cause Analysis 🔍

### Suspected Issue: Type Mismatch
```javascript
// Comparison yang bermasalah
if (item.cabang_id !== req.user.cabang_id) {
  // Ini bisa jadi:
  // "2" !== 2 → true (string vs number)
  // 2 !== 2 → false (number vs number)
}
```

### Data Type Investigation
- **item.cabang_id**: Kemungkinan string dari JSON
- **req.user.cabang_id**: Kemungkinan number dari database
- **Comparison**: `"2" !== 2` selalu `true`

## Solution Implemented ✅

### 1. Type-Safe Comparison

#### Before (Buggy)
```javascript
if (req.user.role !== 'super' && item.cabang_id && item.cabang_id !== req.user.cabang_id) {
  // Type mismatch bisa terjadi
}
```

#### After (Fixed)
```javascript
if (req.user.role !== 'super' && item.cabang_id) {
  // Convert both to numbers for proper comparison
  const itemCabangId = parseInt(item.cabang_id);
  const userCabangId = parseInt(req.user.cabang_id);
  
  if (itemCabangId !== userCabangId) {
    // Now comparing number vs number
  }
}
```

### 2. Enhanced Debug Logging

#### User Info Logging
```javascript
console.log('👤 User:', req.user?.username, 'Role:', req.user?.role, 'Cabang ID:', req.user?.cabang_id, 'Type:', typeof req.user?.cabang_id);
```

#### Comparison Logging
```javascript
console.log('🔍 Cross-cabang check:', {
  itemCabangId,
  userCabangId,
  itemCabangIdType: typeof item.cabang_id,
  userCabangIdType: typeof req.user.cabang_id,
  itemCabangIdRaw: item.cabang_id,
  userCabangIdRaw: req.user.cabang_id,
  isDifferent: itemCabangId !== userCabangId
});
```

### 3. Applied to Both Functions

#### Preview Function (previewImportData)
- ✅ Type-safe comparison
- ✅ Debug logging
- ✅ Proper cross-cabang detection

#### Import Function (importData)  
- ✅ Type-safe comparison
- ✅ Debug logging
- ✅ Proper validation logic

## Expected Debug Output

### Scenario 1: Admin Godean Import Godean Data
```
👤 User: godean1 Role: admin Cabang ID: 2 Type: number

🔍 Cross-cabang check: {
  itemCabangId: 2,
  userCabangId: 2,
  itemCabangIdType: "string",
  userCabangIdType: "number", 
  itemCabangIdRaw: "2",
  userCabangIdRaw: 2,
  isDifferent: false  ← Should be false now!
}
```

### Scenario 2: Admin Godean Import Utama Data
```
👤 User: godean1 Role: admin Cabang ID: 2 Type: number

🔍 Cross-cabang check: {
  itemCabangId: 1,
  userCabangId: 2,
  itemCabangIdType: "string",
  userCabangIdType: "number",
  itemCabangIdRaw: "1", 
  userCabangIdRaw: 2,
  isDifferent: true  ← Should be true (correct cross-cabang)
}
```

### Scenario 3: Super Admin Import Any Data
```
👤 User: superadmin Role: super Cabang ID: 1 Type: number

// No cross-cabang check for super admin
// Should import successfully regardless of cabang_id
```

## Testing Checklist

### Test Cases to Verify

#### ✅ Admin Cabang - Same Cabang
- **User**: Admin Godean (cabang_id: 2)
- **Data**: Godean data (cabang_id: "2" or 2)
- **Expected**: Import successful, no cross-cabang warning

#### ✅ Admin Cabang - Different Cabang  
- **User**: Admin Godean (cabang_id: 2)
- **Data**: Utama data (cabang_id: "1" or 1)
- **Expected**: Cross-cabang warning, data skipped

#### ✅ Super Admin - Any Cabang
- **User**: Super Admin (cabang_id: 1)
- **Data**: Any cabang data
- **Expected**: Import successful, no restrictions

#### ✅ Mixed Data
- **User**: Admin Godean (cabang_id: 2)
- **Data**: Mix of Godean + Utama data
- **Expected**: Godean data imported, Utama data skipped with warning

## Data Type Sources

### Where Types Come From

#### item.cabang_id (from JSON)
```json
{
  "cabang_id": "2",  ← String from JSON
  "nama_lengkap": "John Doe"
}
```

#### req.user.cabang_id (from database/JWT)
```javascript
// From database query or JWT payload
user.cabang_id = 2;  ← Number from database
```

### Type Conversion Strategy
```javascript
// Always convert to numbers for comparison
const itemCabangId = parseInt(item.cabang_id);    // "2" → 2
const userCabangId = parseInt(req.user.cabang_id); // 2 → 2

// Now safe to compare
if (itemCabangId !== userCabangId) {
  // Reliable comparison
}
```

## Error Prevention

### Null/Undefined Handling
```javascript
// Safe parsing with fallback
const itemCabangId = parseInt(item.cabang_id) || 0;
const userCabangId = parseInt(req.user.cabang_id) || 0;
```

### NaN Handling
```javascript
// Check for valid numbers
if (isNaN(itemCabangId) || isNaN(userCabangId)) {
  console.log('⚠️ Invalid cabang_id detected');
  // Handle gracefully
}
```

## Implementation Status

- ✅ **Preview Function**: Fixed type comparison
- ✅ **Import Function**: Fixed type comparison  
- ✅ **Debug Logging**: Added comprehensive logging
- ✅ **Type Safety**: parseInt() conversion added
- ✅ **Both Paths**: Preview and import both fixed

## Next Steps

1. **Test with real data**: Use actual export/import cycle
2. **Monitor logs**: Check debug output for type confirmation
3. **Verify behavior**: Ensure admin cabang can import own data
4. **Clean up logs**: Remove debug logs after confirmation
5. **Document findings**: Update team on type handling best practices

## Expected Result

After this fix:
- ✅ **Admin Godean** can import **Godean data** successfully
- ✅ **Admin Godean** gets warning for **non-Godean data**  
- ✅ **Super Admin** can import **any data** without restrictions
- ✅ **Type safety** prevents false positive cross-cabang detection
- ✅ **Debug logs** provide clear visibility into comparison logic