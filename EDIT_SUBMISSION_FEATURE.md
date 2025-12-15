# Fitur Edit Submission dengan Audit Trail

## Overview
Fitur ini memungkinkan admin untuk mengedit data submission yang sudah disetujui (approved) dengan sistem audit trail yang lengkap untuk melacak semua perubahan.

## Fitur Utama

### 1. Edit Data Submission
- **Akses**: Hanya submission dengan status "approved" yang bisa diedit
- **UI**: Modal dialog dengan form edit yang user-friendly
- **Validasi**: Wajib mengisi alasan edit sebelum menyimpan
- **Fields yang bisa diedit**:
  - Data Pribadi (nama, alamat, kontak, dll)
  - Informasi Pekerjaan
  - Kontak Darurat
  - Data Rekening

### 2. Audit Trail Lengkap
- **Tracking**: Setiap perubahan field dicatat dengan detail
- **History**: Riwayat lengkap siapa, kapan, dan apa yang diubah
- **Original Approver**: Menyimpan data approver asli sebelum edit
- **Edit Counter**: Menghitung berapa kali submission diedit

### 3. UI/UX Design
- **Inline Edit**: Icon pensil di setiap field (opsi future)
- **Modal Edit**: Dialog besar dengan form lengkap
- **History View**: Tab terpisah untuk melihat riwayat edit
- **Visual Diff**: Tampilan before/after untuk setiap perubahan

## Database Schema

### Tabel Baru: `submission_edit_history`
```sql
CREATE TABLE submission_edit_history (
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
```

### Kolom Baru di `pengajuan_tabungan`
```sql
ALTER TABLE pengajuan_tabungan ADD COLUMN:
- last_edited_at TIMESTAMP
- last_edited_by INTEGER REFERENCES users(id)
- edit_count INTEGER DEFAULT 0
- original_approved_by INTEGER REFERENCES users(id)
- original_approved_at TIMESTAMP
```

## API Endpoints

### 1. Edit Submission
```
PUT /api/pengajuan/:id/edit
```
**Body:**
```json
{
  "nama": "Nama Baru",
  "email": "email@baru.com",
  "editReason": "Koreksi data sesuai dokumen terbaru"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Submission berhasil diedit",
  "changedFields": 2,
  "editHistory": [
    {
      "field": "nama",
      "oldValue": "Nama Lama",
      "newValue": "Nama Baru"
    }
  ]
}
```

### 2. Get Edit History
```
GET /api/pengajuan/:id/history
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submission": {
      "id": 123,
      "status": "approved",
      "edit_count": 2,
      "original_approved_by": {
        "username": "admin1",
        "nama": "Admin Pertama",
        "approved_at": "2025-01-01T10:00:00Z"
      },
      "last_edited_by": {
        "username": "admin2",
        "nama": "Admin Kedua"
      }
    },
    "history": [
      {
        "id": 1,
        "field_name": "nama",
        "old_value": "Nama Lama",
        "new_value": "Nama Baru",
        "edit_reason": "Koreksi sesuai KTP",
        "edited_at": "2025-01-02T14:30:00Z",
        "edited_by_username": "admin2",
        "edited_by_name": "Admin Kedua"
      }
    ]
  }
}
```

## Frontend Components

### 1. EditSubmissionDialog
**Path**: `dashboard/src/components/edit-submission-dialog.tsx`

**Features**:
- Modal dialog dengan 2 mode: Edit & History
- Form edit dengan validasi
- History viewer dengan visual diff
- Loading states dan error handling

**Props**:
```typescript
interface EditSubmissionDialogProps {
  submission: FormSubmission;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

### 2. FormDetailDialog (Updated)
**Path**: `dashboard/src/components/form-detail-dialog.tsx`

**New Features**:
- Tombol "Edit Data" untuk submission approved
- Integrasi dengan EditSubmissionDialog

## Backend Implementation

### 1. Controller Functions
**Path**: `backend/controllers/pengajuanController.js`

**New Functions**:
- `editSubmission()`: Handle edit request dengan audit trail
- `getEditHistory()`: Ambil riwayat edit submission

### 2. Routes
**Path**: `backend/routes/pengajuanRoutes.js`

**New Routes**:
```javascript
router.put("/:id/edit", verifyToken, editSubmission);
router.get("/:id/history", verifyToken, getEditHistory);
```

## Security & Permissions

### 1. Role-Based Access
- **Super Admin**: Bisa edit submission dari semua cabang
- **Admin Cabang**: Hanya bisa edit submission dari cabangnya sendiri
- **Status Check**: Hanya submission "approved" yang bisa diedit

### 2. Audit Trail
- Semua perubahan dicatat dengan timestamp
- User yang melakukan edit dicatat
- Alasan edit wajib diisi
- Original approver tetap tersimpan

## Usage Flow

### 1. Admin Flow
1. Buka detail submission yang sudah approved
2. Klik tombol "Edit Data"
3. Modal edit terbuka dengan form lengkap
4. Isi alasan edit (wajib)
5. Edit field yang diperlukan
6. Klik "Simpan Perubahan"
7. Data tersimpan dengan audit trail

### 2. History View
1. Buka EditSubmissionDialog
2. Default tampil history view
3. Lihat status approval original vs current
4. Lihat riwayat semua perubahan
5. Setiap perubahan menampilkan:
   - Field yang diubah
   - Nilai lama vs baru
   - Siapa yang edit
   - Kapan diedit
   - Alasan edit

## Status Display Logic

### Original vs Current Approver
```
Status: "Disetujui oleh Admin A pada 1 Jan 2025"
↓ (setelah edit)
Status: "Disetujui oleh Admin A pada 1 Jan 2025, diedit oleh Admin B pada 2 Jan 2025"
```

### Edit Counter
```
Badge: "2 kali diedit"
```

## Migration

### 1. Database Migration
**File**: `backend/migrations/007_add_edit_audit_trail.sql`

**Run Command**:
```bash
node backend/run-migration.js
```

### 2. Verification
Setelah migration, cek:
- Tabel `submission_edit_history` terbuat
- Kolom baru di `pengajuan_tabungan` ada
- Index untuk performa sudah terpasang

## Testing

### 1. Manual Testing
1. Login sebagai admin
2. Buka submission yang approved
3. Test edit functionality
4. Verify audit trail tersimpan
5. Test history view
6. Test role-based access

### 2. Edge Cases
- Edit submission yang belum approved (should fail)
- Edit tanpa alasan (should fail)
- Edit dengan user berbeda cabang (should fail for non-super)
- Edit field yang sama berkali-kali

## Future Enhancements

### 1. Inline Edit Mode
- Icon pensil di setiap field
- Edit langsung tanpa modal
- Save per field

### 2. Bulk Edit
- Edit multiple submissions sekaligus
- Batch audit trail

### 3. Advanced History
- Visual diff dengan highlight
- Export history to PDF
- Filter history by date/user

### 4. Notifications
- Email notification saat data diedit
- WhatsApp notification untuk perubahan penting

## Troubleshooting

### 1. Common Issues
- **Migration gagal**: Cek koneksi database
- **Edit button tidak muncul**: Cek status submission (harus approved)
- **History kosong**: Cek apakah pernah ada edit sebelumnya

### 2. Debug Tips
- Cek console browser untuk error frontend
- Cek log backend untuk error API
- Verify database schema dengan query manual

## Conclusion

Fitur edit submission dengan audit trail ini memberikan fleksibilitas untuk koreksi data sambil menjaga transparansi dan akuntabilitas. Semua perubahan tercatat dengan detail lengkap, memungkinkan tracking yang akurat untuk keperluan audit dan compliance.