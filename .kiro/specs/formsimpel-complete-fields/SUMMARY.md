# Ringkasan Perbaikan FormSimpel

## 📋 Masalah yang Diperbaiki

### ✅ 1. Validasi Hanya Berjalan Sekali
**Masalah:** NIK, Email, dan Nomor WA tidak melakukan recheck setelah validasi pertama.

**Solusi:** 
- Tambahkan error clearing di `onChange` event
- Tambahkan proper success/failure handling di `onBlur` event
- Error akan hilang saat user mulai mengetik ulang
- Error akan muncul/hilang sesuai hasil validasi terbaru

### ✅ 2. NPWP Disembunyikan untuk Simpel
**Status:** Sudah diimplementasikan (field NPWP sudah di-comment out)

### ✅ 3. Jenis Identitas dan Input Harus Serasi
**Masalah:** Label dan placeholder tidak sesuai dengan jenis identitas yang dipilih.

**Solusi:**
- Label dinamis: "NIK / KIA" untuk KTP, "Nomor Paspor" untuk Paspor, "Nomor Identitas" untuk lainnya
- Placeholder dinamis: "16 digit" untuk KTP, "6-9 karakter" untuk Paspor
- Validasi format sesuai jenis identitas sebelum async validation
- Clear input saat ganti jenis identitas

### ✅ 4. Preferensi Kartu ATM Hanya untuk Mutiara
**Status:** Sudah diimplementasikan (field ATM preference sudah di-comment out untuk Simpel)

### ✅ 5. BO Hanya Jika Rekening untuk Orang Lain
**Masalah:** Beneficial Owner selalu ditampilkan dan required.

**Solusi:**
- Tambah pertanyaan "Apakah rekening ini untuk Anda sendiri?"
- Section Beneficial Owner hanya muncul jika jawaban "Tidak" (untuk orang lain)
- Validasi BO hanya berjalan jika rekening untuk orang lain
- Data BO hanya dikirim ke backend jika rekening untuk orang lain

## 📁 File yang Diubah

### Frontend
1. `frontend/src/components/account-forms/FormSimpel.tsx`
   - Perbaikan validasi NIK, Email, Phone
   - Label dan placeholder dinamis untuk jenis identitas
   - Section kepemilikan rekening
   - Conditional rendering Beneficial Owner

2. `frontend/src/components/account-forms/types.ts`
   - Tambah field `rekeningUntukSendiri: boolean`

3. `frontend/src/components/AccountForm.tsx`
   - Tambah `rekeningUntukSendiri: true` di initial state
   - Conditional BO data di submit payload

### Backend
4. `backend/controllers/pengajuanController.js`
   - Tambah `rekening_untuk_sendiri` di request body
   - Tambah field ke INSERT `cdd_self`
   - Conditional INSERT ke tabel `bo`
   - Perbaikan nama tabel: `cdd_beneficial_owner` → `bo`
   - Perbaikan nama kolom: `pendapatan_tahun` → `pendapatan_tahunan`
   - Perbaikan LEFT JOIN query

5. `backend/migrations/001_add_missing_fields.sql`
   - Tambah kolom `rekening_untuk_sendiri` ke `cdd_self`
   - Tambah kolom ke `cdd_job` (rata_rata_transaksi, referensi_*, dll)
   - Tambah kolom ke `account` (nominal_setoran)
   - Tambah kolom ke `bo` (pendapatan_tahunan, persetujuan, dll)

## 🔧 Perbaikan Database Structure

**PENTING:** Berdasarkan diagram database yang diberikan:

- ✅ Tabel Beneficial Owner bernama `bo` (bukan `cdd_beneficial_owner`)
- ✅ Kolom pendapatan bernama `pendapatan_tahunan` (bukan `pendapatan_tahun`)
- ✅ Tabel `bo` sudah ada - migration hanya menambah kolom yang belum ada

## 🚀 Cara Menjalankan

### 1. Jalankan Migration
```bash
cd backend
psql -U username -d database_name -f migrations/001_add_missing_fields.sql
```

### 2. Restart Backend
```bash
cd backend
npm start
```

### 3. Restart Frontend
```bash
cd frontend
npm run dev
```

## ✅ Testing Checklist

### Validasi Recheck
- [ ] Masukkan NIK invalid → lihat error
- [ ] Perbaiki NIK → error hilang
- [ ] Ulangi untuk Email dan Phone

### Jenis Identitas
- [ ] Pilih KTP → label "NIK / KIA", placeholder "16 digit"
- [ ] Pilih Paspor → label "Nomor Paspor", placeholder "6-9 karakter"
- [ ] Ganti jenis identitas → input ter-clear

### Beneficial Owner
- [ ] Pilih "Ya, untuk saya sendiri" → section BO TIDAK muncul
- [ ] Pilih "Tidak, untuk orang lain" → section BO muncul
- [ ] Submit dengan "Ya" → data BO TIDAK tersimpan
- [ ] Submit dengan "Tidak" → data BO tersimpan di tabel `bo`

### Database
- [ ] Cek kolom `rekening_untuk_sendiri` ada di `cdd_self`
- [ ] Cek kolom `pendapatan_tahunan` ada di `bo`
- [ ] Cek kolom `persetujuan` ada di `bo`
- [ ] Cek data tersimpan dengan benar

## 📝 Catatan Tambahan

1. **Default Value:** `rekeningUntukSendiri` default `true` (untuk sendiri - BO tidak muncul)
2. **Backward Compatibility:** Data lama akan memiliki `rekening_untuk_sendiri = TRUE` (default)
3. **Validation:** BO validation hanya berjalan jika `rekeningUntukSendiri === false` (untuk orang lain)
4. **API Payload:** BO fields hanya dikirim jika `rekeningUntukSendiri === false` (untuk orang lain)

## 🐛 Known Issues

Tidak ada known issues saat ini. Semua perbaikan sudah disesuaikan dengan struktur database yang sebenarnya.

## 📞 Support

Jika ada masalah atau pertanyaan, silakan hubungi tim development.
