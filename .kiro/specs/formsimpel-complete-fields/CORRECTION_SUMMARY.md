# Koreksi Logika Beneficial Owner

## 📝 Perubahan Logika

### ❌ Logika Sebelumnya (SALAH)
- BO muncul ketika `rekeningUntukSendiri === true` (untuk sendiri)
- BO disimpan ketika rekening untuk pemohon sendiri

### ✅ Logika Sekarang (BENAR)
- BO muncul ketika `rekeningUntukSendiri === false` (untuk orang lain)
- BO disimpan ketika rekening untuk orang lain

## 🎯 Penjelasan

**Beneficial Owner** adalah pemilik manfaat sebenarnya dari rekening. Informasi ini diperlukan ketika:
- Rekening dibuka untuk **orang lain** (bukan untuk pemohon sendiri)
- Pemohon bertindak sebagai **wali/kuasa** untuk membuka rekening atas nama orang lain
- Perlu diketahui siapa **pemilik sebenarnya** dari rekening tersebut

**Contoh Kasus:**
1. **Untuk Sendiri** (`rekeningUntukSendiri = true`)
   - Pemohon: Budi
   - Rekening atas nama: Budi
   - BO diperlukan? **TIDAK** (karena pemohon = pemilik)

2. **Untuk Orang Lain** (`rekeningUntukSendiri = false`)
   - Pemohon: Budi (orang tua)
   - Rekening atas nama: Anak Budi (yang masih kecil)
   - BO diperlukan? **YA** (perlu tahu siapa pemilik sebenarnya = Anak Budi)

## 🔧 File yang Diubah

### 1. Frontend Component
**File:** `frontend/src/components/account-forms/FormSimpel.tsx`

```typescript
// SEBELUM
{formData.rekeningUntukSendiri && (
  <div>Beneficial Owner Section</div>
)}

// SESUDAH
{formData.rekeningUntukSendiri === false && (
  <div>Beneficial Owner Section</div>
)}
```

### 2. Validation Logic
**File:** `frontend/src/components/account-forms/FormSimpel.tsx`

```typescript
// SEBELUM
if (formData.rekeningUntukSendiri) {
  const boErrors = validateBeneficialOwner();
  return { ...next, ...boErrors };
}

// SESUDAH
if (formData.rekeningUntukSendiri === false) {
  const boErrors = validateBeneficialOwner();
  return { ...next, ...boErrors };
}
```

### 3. Backend Controller
**File:** `backend/controllers/pengajuanController.js`

```javascript
// SEBELUM
if (rekening_untuk_sendiri && bo_nama) {
  // Insert BO data
}

// SESUDAH
if (rekening_untuk_sendiri === false && bo_nama) {
  // Insert BO data
}
```

### 4. Form Submission
**File:** `frontend/src/components/AccountForm.tsx`

```typescript
// SEBELUM
bo_nama: data.rekeningUntukSendiri ? data.boNama : undefined,

// SESUDAH
bo_nama: data.rekeningUntukSendiri === false ? data.boNama : undefined,
```

### 5. Migration Comment
**File:** `backend/migrations/001_add_missing_fields.sql`

```sql
-- SEBELUM
COMMENT ON COLUMN cdd_self.rekening_untuk_sendiri IS 
'... Beneficial owner info is only required when TRUE.';

-- SESUDAH
COMMENT ON COLUMN cdd_self.rekening_untuk_sendiri IS 
'... Beneficial owner info is only required when FALSE (for others).';
```

## ✅ Testing Checklist (Updated)

### Skenario 1: Rekening untuk Sendiri
- [ ] Pilih "Ya, untuk saya sendiri"
- [ ] Section Beneficial Owner **TIDAK** muncul
- [ ] Isi form lainnya dan submit
- [ ] Cek database: `rekening_untuk_sendiri = TRUE`
- [ ] Cek database: **TIDAK** ada data di tabel `bo` untuk pengajuan ini

### Skenario 2: Rekening untuk Orang Lain
- [ ] Pilih "Tidak, untuk orang lain"
- [ ] Section Beneficial Owner **MUNCUL**
- [ ] Isi semua field BO (required)
- [ ] Submit form
- [ ] Cek database: `rekening_untuk_sendiri = FALSE`
- [ ] Cek database: **ADA** data di tabel `bo` untuk pengajuan ini

## 📊 Database Verification

```sql
-- Test Case 1: Rekening untuk sendiri (BO tidak ada)
SELECT 
  p.id,
  p.kode_referensi,
  cs.nama,
  cs.rekening_untuk_sendiri,
  bo.nama AS bo_nama
FROM pengajuan_tabungan p
LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
LEFT JOIN bo ON p.id = bo.pengajuan_id
WHERE cs.rekening_untuk_sendiri = TRUE
ORDER BY p.created_at DESC
LIMIT 5;
-- Expected: bo_nama should be NULL

-- Test Case 2: Rekening untuk orang lain (BO ada)
SELECT 
  p.id,
  p.kode_referensi,
  cs.nama,
  cs.rekening_untuk_sendiri,
  bo.nama AS bo_nama,
  bo.pendapatan_tahunan
FROM pengajuan_tabungan p
LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
LEFT JOIN bo ON p.id = bo.pengajuan_id
WHERE cs.rekening_untuk_sendiri = FALSE
ORDER BY p.created_at DESC
LIMIT 5;
-- Expected: bo_nama should have value
```

## 🎯 Summary

| Kondisi | BO Section | BO Validation | BO Data Saved |
|---------|-----------|---------------|---------------|
| **Untuk Sendiri** (TRUE) | ❌ Tidak muncul | ❌ Tidak berjalan | ❌ Tidak disimpan |
| **Untuk Orang Lain** (FALSE) | ✅ Muncul | ✅ Berjalan | ✅ Disimpan |

## 📝 Catatan Penting

1. **Default Value:** `rekeningUntukSendiri` default `TRUE` (untuk sendiri)
   - Artinya: Secara default, BO section TIDAK muncul
   - User harus explicitly pilih "Tidak" untuk menampilkan BO section

2. **Backward Compatibility:** Data lama akan memiliki `rekening_untuk_sendiri = TRUE`
   - Artinya: Data lama dianggap rekening untuk pemohon sendiri
   - Tidak ada BO data untuk pengajuan lama (sesuai dengan kondisi sebelumnya)

3. **Validation:** BO validation hanya berjalan jika `rekeningUntukSendiri === false`
   - Semua field BO menjadi required jika section muncul
   - Jika section tidak muncul, tidak ada validasi BO

4. **API Payload:** BO fields hanya dikirim jika `rekeningUntukSendiri === false`
   - Backend hanya menyimpan BO data jika kondisi terpenuhi
   - Menghindari data BO yang tidak perlu

## ✅ Status

- [x] Frontend component updated
- [x] Validation logic updated
- [x] Backend controller updated
- [x] Form submission updated
- [x] Migration comment updated
- [x] All documentation updated

Semua perubahan sudah selesai dan konsisten! 🎉
