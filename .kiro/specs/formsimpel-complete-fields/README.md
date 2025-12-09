# FormSimpel Complete Fields - Implementation Guide

## 📚 Dokumentasi

Proyek ini berisi perbaikan dan peningkatan untuk FormSimpel component dalam sistem pembukaan rekening tabungan Bank Sleman.

### File Dokumentasi

1. **[SUMMARY.md](./SUMMARY.md)** - Ringkasan lengkap semua perbaikan
2. **[FIXES_APPLIED.md](./FIXES_APPLIED.md)** - Detail teknis setiap perbaikan
3. **[DATABASE_CORRECTIONS.md](./DATABASE_CORRECTIONS.md)** - Koreksi struktur database
4. **[design.md](./design.md)** - Dokumen desain sistem
5. **[tasks.md](./tasks.md)** - Daftar task implementasi

## 🎯 Masalah yang Diperbaiki

### 1. ✅ Validasi Recheck
Validasi NIK, Email, dan Phone sekarang berjalan ulang setiap kali user mengubah input.

### 2. ✅ NPWP Hidden
Field NPWP disembunyikan untuk account type Simpel.

### 3. ✅ Identity Type Consistency
Label dan placeholder input identitas menyesuaikan dengan jenis identitas yang dipilih.

### 4. ✅ ATM Preference
Preferensi kartu ATM hanya ditampilkan untuk account type yang sesuai.

### 5. ✅ Conditional Beneficial Owner
Section Beneficial Owner hanya muncul jika rekening untuk orang lain (BUKAN untuk pemohon sendiri).

## 🗄️ Struktur Database

### Tabel yang Dimodifikasi

```
cdd_self
├── rekening_untuk_sendiri (BOOLEAN) ← BARU

cdd_job
├── rata_rata_transaksi (VARCHAR) ← BARU
├── telepon_perusahaan (VARCHAR) ← BARU
├── referensi_nama (VARCHAR) ← BARU
├── referensi_alamat (TEXT) ← BARU
├── referensi_telepon (VARCHAR) ← BARU
└── referensi_hubungan (VARCHAR) ← BARU

account
└── nominal_setoran (DECIMAL) ← BARU

bo (beneficial owner)
├── pendapatan_tahunan (VARCHAR) ← BARU
└── persetujuan (BOOLEAN) ← BARU
```

## 🚀 Quick Start

### 1. Jalankan Migration

```bash
cd backend
psql -U your_username -d your_database -f migrations/001_add_missing_fields.sql
```

### 2. Restart Services

```bash
# Backend
cd backend
npm start

# Frontend (terminal baru)
cd frontend
npm run dev
```

### 3. Test

Buka browser dan akses form pembukaan rekening Simpel:
- http://localhost:5173/product/simpel (atau port yang sesuai)

## 🧪 Testing Checklist

### Validasi
- [ ] NIK: Input invalid → error muncul
- [ ] NIK: Perbaiki → error hilang
- [ ] Email: Test validasi format dan uniqueness
- [ ] Phone: Test validasi format dan uniqueness

### Identity Type
- [ ] Pilih KTP → Label "NIK / KIA"
- [ ] Pilih Paspor → Label "Nomor Paspor"
- [ ] Ganti type → Input ter-clear

### Beneficial Owner
- [ ] Pilih "Ya" (untuk sendiri) → Section BO TIDAK muncul
- [ ] Pilih "Tidak" (untuk orang lain) → Section BO muncul
- [ ] Submit dengan "Ya" → Data BO TIDAK tersimpan
- [ ] Submit dengan "Tidak" → Data BO tersimpan

## 📋 File Changes Summary

### Frontend
- `frontend/src/components/account-forms/FormSimpel.tsx` - Main form component
- `frontend/src/components/account-forms/types.ts` - TypeScript types
- `frontend/src/components/AccountForm.tsx` - Parent form component

### Backend
- `backend/controllers/pengajuanController.js` - API controller
- `backend/migrations/001_add_missing_fields.sql` - Database migration
- `backend/migrations/001_add_missing_fields_rollback.sql` - Rollback script

## ⚠️ Important Notes

### Database Table Names
- ✅ Beneficial Owner table: `bo` (NOT `cdd_beneficial_owner`)
- ✅ Column name: `pendapatan_tahunan` (NOT `pendapatan_tahun`)

### Default Values
- `rekening_untuk_sendiri` defaults to `TRUE` (for self - BO not required)
- Existing records will have `TRUE` after migration (no BO data needed)

### Backward Compatibility
- All changes are backward compatible
- Existing data remains intact
- New fields have sensible defaults

## 🐛 Troubleshooting

### Migration Fails
```bash
# Check if tables exist
psql -U username -d database -c "\dt"

# Check current schema
psql -U username -d database -c "\d cdd_self"
psql -U username -d database -c "\d bo"
```

### Validation Not Working
1. Clear browser cache
2. Check browser console for errors
3. Verify backend is running
4. Check network tab for API responses

### Data Not Saving
1. Check database connection
2. Verify migration ran successfully
3. Check backend logs for errors
4. Verify all required fields are filled

## 📞 Support

Untuk pertanyaan atau masalah:
1. Cek dokumentasi di folder ini
2. Review error logs (browser console & backend logs)
3. Hubungi tim development

## 📝 Version History

- **v1.0.0** (2025-12-09) - Initial implementation
  - Fixed validation recheck
  - Added conditional BO section
  - Fixed identity type consistency
  - Database structure corrections

## 🔗 Related Documents

- [Design Document](./design.md) - Detailed system design
- [Tasks](./tasks.md) - Implementation tasks
- [Database Corrections](./DATABASE_CORRECTIONS.md) - DB structure fixes
