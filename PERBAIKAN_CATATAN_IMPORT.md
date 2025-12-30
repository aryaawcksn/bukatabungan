# Perbaikan Masalah Catatan dan Sinkronisasi Import

## Masalah yang Diperbaiki

1. **Catatan tidak tersinkronisasi saat import**
   - Data di DB sudah ada catatan (approval_notes/rejection_notes)
   - Data import pending belum ada catatan
   - Setelah import, catatan hilang karena tidak ditimpa dengan benar

2. **Status tidak terdeteksi dengan baik di preview**
   - Preview import tidak mendeteksi perubahan status dengan akurat
   - Konflik edit tidak menampilkan informasi lengkap tentang perubahan

3. **Export Excel tidak menyertakan catatan**
   - Export data utama dan data lengkap tidak menyertakan approval_notes dan rejection_notes
   - Backup JSON sudah include catatan, tapi Excel export belum

## Perubahan yang Dilakukan

### 1. Backend - pengajuanController.js

#### A. Perbaikan Fungsi Import (Mode Overwrite)
```javascript
// Sebelum: Update pengajuan_tabungan tanpa approval_notes dan rejection_notes
await client.query(`
  UPDATE pengajuan_tabungan 
  SET status = $1, 
      approved_at = $2, 
      rejected_at = $3,
      edit_count = $4,
      last_edited_at = $5,
      last_edited_by = $6
  WHERE id = $7
`, [...]);

// Sesudah: Update dengan approval_notes dan rejection_notes
await client.query(`
  UPDATE pengajuan_tabungan 
  SET status = $1, 
      approved_at = $2, 
      rejected_at = $3,
      approval_notes = $4,
      rejection_notes = $5,
      edit_count = $6,
      last_edited_at = $7,
      last_edited_by = $8
  WHERE id = $9
`, [
  item.status,
  item.approved_at || null,
  item.rejected_at || null,
  item.approval_notes || null,  // ✅ DITAMBAHKAN
  item.rejection_notes || null, // ✅ DITAMBAHKAN
  item.edit_count || 0,
  item.last_edited_at || null,
  item.last_edited_by || null,
  existingId
]);
```

#### B. Perbaikan Fungsi Insert Record Baru
```javascript
// Sebelum: Insert tanpa approval_notes dan rejection_notes
INSERT INTO pengajuan_tabungan (
  cabang_id, status, created_at, approved_at, rejected_at,
  edit_count, last_edited_at, last_edited_by
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)

// Sesudah: Insert dengan approval_notes dan rejection_notes
INSERT INTO pengajuan_tabungan (
  cabang_id, status, created_at, approved_at, rejected_at,
  approval_notes, rejection_notes,  // ✅ DITAMBAHKAN
  edit_count, last_edited_at, last_edited_by
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
```

#### C. Perbaikan Fungsi Export Backup
```javascript
// Ditambahkan approval_notes dan rejection_notes ke query export
SELECT 
  p.id,
  p.status,
  p.created_at,
  p.approved_at,
  p.rejected_at,
  p.approval_notes,    // ✅ DITAMBAHKAN
  p.rejection_notes,   // ✅ DITAMBAHKAN
  p.cabang_id,
  ...
```

#### D. Perbaikan Fungsi Export Excel
```javascript
// Query export Excel ditambahkan catatan
SELECT 
  p.id,
  p.status,
  p.created_at,
  p.approved_at,
  p.rejected_at,
  p.approval_notes,    // ✅ DITAMBAHKAN
  p.rejection_notes,   // ✅ DITAMBAHKAN
  ...

// Header Excel ditambahkan kolom catatan (untuk kedua mode)
// Full Data Export:
{ header: 'Catatan Persetujuan', key: 'approval_notes', width: 30 },
{ header: 'Catatan Penolakan', key: 'rejection_notes', width: 30 },

// Standard Export:
{ header: 'Catatan Persetujuan', key: 'approval_notes', width: 30 },
{ header: 'Catatan Penolakan', key: 'rejection_notes', width: 30 },

// Data Excel ditambahkan catatan
const baseData = {
  // ... data lainnya
  approval_notes: row.approval_notes || '',
  rejection_notes: row.rejection_notes || '',
};
```

#### E. Perbaikan Fungsi Preview Import
```javascript
// Sebelum: Hanya cek edit_count
const existingQuery = await pool.query(
  `SELECT p.status, cs.kode_referensi, p.edit_count, cs.nama
   FROM cdd_self cs
   JOIN pengajuan_tabungan p ON cs.pengajuan_id = p.id
   WHERE cs.kode_referensi = $1`,
  [kodeReferensi]
);

// Sesudah: Cek status, edit_count, dan catatan
const existingQuery = await pool.query(
  `SELECT p.status, p.approval_notes, p.rejection_notes, cs.kode_referensi, p.edit_count, cs.nama
   FROM cdd_self cs
   JOIN pengajuan_tabungan p ON cs.pengajuan_id = p.id
   WHERE cs.kode_referensi = $1`,
  [kodeReferensi]
);

// Deteksi konflik yang lebih lengkap
const hasEditConflict = existingEditCount !== importEditCount;
const hasStatusChange = existing.status !== item.status;
const hasNotesChange = (existing.approval_notes !== (item.approval_notes || null)) || 
                      (existing.rejection_notes !== (item.rejection_notes || null));
```

### 2. Frontend - DataManagement.tsx

#### A. Perbaikan Tampilan Konflik
- Menampilkan informasi perubahan status
- Menampilkan informasi perubahan edit count
- Menampilkan informasi perubahan catatan
- Pesan konflik yang lebih informatif

#### B. Penambahan Section "Data yang Akan Diperbarui"
- Menampilkan existing records dengan detail perubahan
- Indikator visual untuk jenis perubahan (status, edit count, catatan)
- Informasi yang lebih jelas tentang apa yang akan berubah

## Hasil Perbaikan

### ✅ Masalah Catatan Teratasi
- Catatan (approval_notes/rejection_notes) sekarang tersimpan dan tersinkronisasi dengan benar
- Data import akan mempertahankan atau memperbarui catatan sesuai data backup
- Tidak ada lagi kehilangan catatan saat import

### ✅ Export Excel Sudah Include Catatan
- Export data utama (standard) sekarang menyertakan kolom "Catatan Persetujuan" dan "Catatan Penolakan"
- Export data lengkap (full) juga menyertakan kedua kolom catatan
- Konsisten dengan export backup JSON yang sudah menyertakan catatan

### ✅ Deteksi Status Lebih Akurat
- Preview import sekarang mendeteksi perubahan status dengan benar
- Menampilkan informasi lengkap tentang perubahan yang akan terjadi
- Konflik ditampilkan dengan detail yang jelas

### ✅ UI/UX Lebih Informatif
- Preview menampilkan breakdown yang lebih detail
- Pengguna dapat melihat dengan jelas apa yang akan berubah
- Indikator visual untuk berbagai jenis perubahan

## Testing yang Disarankan

1. **Test Export Excel:**
   - Export data utama dan verifikasi kolom catatan ada
   - Export data lengkap dan verifikasi kolom catatan ada
   - Pastikan catatan yang ada di DB muncul di Excel

2. **Test Skenario Catatan:**
   - Export data yang sudah ada catatan
   - Import data tersebut dalam mode overwrite
   - Verifikasi catatan tetap ada dan sesuai

3. **Test Skenario Status:**
   - Export data dengan status 'approved' + catatan
   - Ubah status di backup menjadi 'rejected' + catatan baru
   - Import dan verifikasi status + catatan berubah

4. **Test Preview:**
   - Upload file backup dengan berbagai skenario konflik
   - Verifikasi preview menampilkan informasi yang akurat
   - Pastikan semua jenis perubahan terdeteksi

## Catatan Teknis

- Perubahan backward compatible - tidak merusak data existing
- Semua field catatan menggunakan `|| null` untuk handle undefined/empty values
- Query menggunakan parameter binding untuk keamanan
- UI responsive dan user-friendly untuk berbagai ukuran layar
- Excel export sekarang konsisten dengan backup JSON dalam hal kelengkapan data