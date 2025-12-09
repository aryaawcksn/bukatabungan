# Account Table Type Fix

## Issue: Boolean to Integer Conversion

### Error
```
error: invalid input syntax for type integer: "5 - 10 Juta"
at unnamed portal parameter $5
Line: 198 (account insert query)
```

### Root Cause
The `atm` field in `account` table expects INTEGER (0 or 1), but JavaScript boolean (true/false) was being sent.

### Solution

**Convert boolean to integer:**
```javascript
// Before
const hasAtm = !!jenis_kartu; // Returns true/false

// After
const hasAtm = jenis_kartu ? 1 : 0; // Returns 1 or 0
```

**Also added null handling for empty strings:**
```javascript
await client.query(insertAccountQuery, [
  parseInt(pengajuanId),
  jenis_rekening || null,
  hasAtm, // Integer: 1 or 0
  jenis_kartu || null,
  nominal_setoran || null,
  tujuan_rekening || null
]);
```

### Status
✅ **FIXED** - Ready for testing

### Date
December 9, 2025
