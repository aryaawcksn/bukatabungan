# Import Approval Fields Fix

## Problem Identified ❌

Setelah import data, informasi approval hilang:
- `approved_by` menjadi NULL
- `approved_at` menjadi NULL  
- `rejected_by` menjadi NULL
- `rejected_at` menjadi NULL

**Root Cause**: Import function hanya mengupdate/insert field `status` tanpa menyimpan informasi approval yang terkait.

## Solution Implemented ✅

### 1. Enhanced Update Logic (Overwrite Mode)

#### Before
```javascript
const updateQuery = `
  UPDATE pengajuan_tabungan 
  SET status = $1
  WHERE id = $2
`;
```

#### After
```javascript
let updateQuery = `
  UPDATE pengajuan_tabungan 
  SET status = $1, updated_at = NOW()
`;

// Update approval fields berdasarkan status
if (newStatus === 'approved') {
  updateQuery += `, approved_at = $3, rejected_at = NULL, rejected_by = NULL`;
  if (item.approvedBy) {
    // Lookup user ID by username
    updateQuery += `, approved_by = $4`;
  }
} else if (newStatus === 'rejected') {
  updateQuery += `, rejected_at = $3, approved_at = NULL, approved_by = NULL`;
  if (item.rejectedBy) {
    // Lookup user ID by username  
    updateQuery += `, rejected_by = $4`;
  }
} else {
  // Status pending - clear all approval fields
  updateQuery += `, approved_at = NULL, approved_by = NULL, rejected_at = NULL, rejected_by = NULL`;
}
```

### 2. Enhanced Insert Logic (New Records)

#### Before
```javascript
INSERT INTO pengajuan_tabungan (cabang_id, status, created_at)
VALUES ($1, $2, $3)
```

#### After
```javascript
// Dynamic query building based on status
let insertPengajuanQuery = `
  INSERT INTO pengajuan_tabungan (cabang_id, status, created_at
`;

if (newStatus === 'approved') {
  insertPengajuanQuery += `, approved_at`;
  if (item.approvedBy) {
    insertPengajuanQuery += `, approved_by`;
  }
} else if (newStatus === 'rejected') {
  insertPengajuanQuery += `, rejected_at`;
  if (item.rejectedBy) {
    insertPengajuanQuery += `, rejected_by`;
  }
}

insertPengajuanQuery += `) VALUES (...)`;
```

### 3. Username to User ID Lookup

```javascript
// Convert username to user ID for foreign key
if (item.approvedBy) {
  const userQuery = await client.query('SELECT id FROM users WHERE username = $1', [item.approvedBy]);
  if (userQuery.rows.length > 0) {
    // Use user ID in insert/update
  }
}
```

## Data Mapping

### Export Format (What gets exported)
```json
{
  "status": "approved",
  "approved_at": "2025-12-14T10:30:00Z",
  "approvedBy": "admin_user",
  "rejected_at": null,
  "rejectedBy": null
}
```

### Import Processing
1. **Status Detection**: Check `item.status`
2. **Timestamp Handling**: Use `item.approved_at` or current date
3. **User Lookup**: Convert `item.approvedBy` username to user ID
4. **Field Clearing**: Clear opposite fields (approved vs rejected)

## Status-Based Logic

### Status: 'approved'
- ✅ Set `approved_at` (from import or current date)
- ✅ Set `approved_by` (lookup user ID by username)
- ✅ Clear `rejected_at = NULL`
- ✅ Clear `rejected_by = NULL`

### Status: 'rejected'  
- ✅ Set `rejected_at` (from import or current date)
- ✅ Set `rejected_by` (lookup user ID by username)
- ✅ Clear `approved_at = NULL`
- ✅ Clear `approved_by = NULL`

### Status: 'pending'
- ✅ Clear all approval fields to NULL
- ✅ Reset to clean pending state

## Error Handling

### Username Not Found
```javascript
const userQuery = await client.query('SELECT id FROM users WHERE username = $1', [item.approvedBy]);
if (userQuery.rows.length > 0) {
  // Use user ID
} else {
  // Skip approval user, log warning
  console.log(`⚠️ User not found: ${item.approvedBy}`);
}
```

### Missing Timestamps
```javascript
// Fallback to current date if timestamp missing
const approvedAt = item.approved_at || new Date();
```

### Invalid Status
```javascript
// Default to pending if status invalid
const newStatus = item.status || 'pending';
```

## Testing Scenarios

### Scenario 1: Import Approved Records
**Input**:
```json
{
  "status": "approved",
  "approved_at": "2025-12-14T10:30:00Z", 
  "approvedBy": "admin_user"
}
```

**Expected Result**:
- ✅ `status = 'approved'`
- ✅ `approved_at = '2025-12-14T10:30:00Z'`
- ✅ `approved_by = 123` (user ID)
- ✅ `rejected_at = NULL`
- ✅ `rejected_by = NULL`

### Scenario 2: Import Rejected Records
**Input**:
```json
{
  "status": "rejected",
  "rejected_at": "2025-12-14T11:00:00Z",
  "rejectedBy": "manager_user"  
}
```

**Expected Result**:
- ✅ `status = 'rejected'`
- ✅ `rejected_at = '2025-12-14T11:00:00Z'`
- ✅ `rejected_by = 456` (user ID)
- ✅ `approved_at = NULL`
- ✅ `approved_by = NULL`

### Scenario 3: Import Pending Records
**Input**:
```json
{
  "status": "pending"
}
```

**Expected Result**:
- ✅ `status = 'pending'`
- ✅ All approval fields = NULL

### Scenario 4: Overwrite Existing Approved Record
**Before**: Record exists with `status = 'pending'`
**Import**: `status = 'approved'`, `approvedBy = 'admin'`
**After**: Record updated with full approval info

## Backward Compatibility

### Missing Approval Fields in Import
- ✅ **Graceful handling**: If `approvedBy` missing, only set timestamp
- ✅ **Default timestamps**: Use current date if timestamp missing
- ✅ **Status priority**: Status change always works, approval info is bonus

### Old Export Format
- ✅ **Still works**: Old exports without approval fields import as pending
- ✅ **No breaking changes**: Existing import files continue to work

## Performance Impact

### Additional Queries
- **User lookup**: 1 extra query per record with approval user
- **Optimizable**: Could batch user lookups or cache user mapping
- **Minimal impact**: Only affects records with approval info

### Query Complexity
- **Dynamic queries**: Slightly more complex SQL generation
- **Parameter management**: More parameters to track
- **Still efficient**: Single query per record update/insert

## Database Consistency

### Foreign Key Integrity
- ✅ **User validation**: Only valid user IDs inserted
- ✅ **Null handling**: Graceful handling of missing users
- ✅ **Constraint compliance**: Respects all database constraints

### Data Integrity
- ✅ **Status consistency**: Approval fields match status
- ✅ **Mutual exclusion**: Can't be both approved and rejected
- ✅ **Clean states**: Pending records have no approval info

## Implementation Status

- ✅ **Update logic**: Enhanced for overwrite mode
- ✅ **Insert logic**: Enhanced for new records  
- ✅ **User lookup**: Username to ID conversion
- ✅ **Status handling**: All status types supported
- ✅ **Error handling**: Graceful fallbacks
- ✅ **Testing**: Ready for validation

## Result

Import now preserves complete approval workflow state:
- ✅ **Approved records**: Keep approval user and timestamp
- ✅ **Rejected records**: Keep rejection user and timestamp  
- ✅ **Pending records**: Clean slate with no approval info
- ✅ **Data integrity**: Consistent with manual approval workflow
- ✅ **Audit trail**: Complete history preserved through import/export cycle