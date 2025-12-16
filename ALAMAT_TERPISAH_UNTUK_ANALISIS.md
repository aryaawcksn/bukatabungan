# Solusi Alamat Terpisah untuk Analisis Data

## 🎯 Masalah yang Diselesaikan

Anda khawatir bahwa menggabungkan alamat jalan dengan data dropdown ke dalam satu kolom akan menyulitkan analisis data nantinya. Solusi ini memisahkan data alamat menjadi kolom-kolom terpisah untuk memudahkan analisis.

## 🏗️ Struktur Database Baru

### Kolom Alamat yang Ditambahkan ke Tabel `cdd_self`:

1. **`alamat_jalan`** (TEXT) - Alamat jalan, RT/RW (contoh: "Jl. Magelang No. 123, RT 02/RW 05")
2. **`provinsi`** (VARCHAR(100)) - Nama provinsi dari API Indonesia
3. **`kota`** (VARCHAR(100)) - Nama kota/kabupaten dari API Indonesia  
4. **`kecamatan`** (VARCHAR(100)) - Nama kecamatan dari API Indonesia
5. **`kelurahan`** (VARCHAR(100)) - Nama kelurahan/desa dari API Indonesia

### Kolom yang Sudah Ada (Tetap Dipertahankan):

- **`alamat_id`** - Alamat lengkap gabungan (untuk kompatibilitas)
- **`alamat_now`** - Alamat domisili
- **`kode_pos_id`** - Kode pos

## 📊 Keuntungan untuk Analisis Data

### ✅ Sekarang Anda Bisa Analisis:

1. **Per Provinsi** - Berapa nasabah dari setiap provinsi
2. **Per Kota/Kabupaten** - Distribusi nasabah per kota
3. **Per Kecamatan** - Analisis lebih detail per kecamatan
4. **Per Kelurahan** - Analisis paling detail per kelurahan
5. **Pola Alamat Jalan** - Analisis RT/RW, nama jalan, dll

### 📈 Contoh Query Analisis:

```sql
-- Jumlah nasabah per provinsi
SELECT provinsi, COUNT(*) as jumlah_nasabah 
FROM cdd_self 
GROUP BY provinsi 
ORDER BY jumlah_nasabah DESC;

-- Top 10 kota dengan nasabah terbanyak
SELECT kota, COUNT(*) as jumlah_nasabah 
FROM cdd_self 
GROUP BY kota 
ORDER BY jumlah_nasabah DESC 
LIMIT 10;

-- Distribusi nasabah per kecamatan di kota tertentu
SELECT kecamatan, COUNT(*) as jumlah_nasabah 
FROM cdd_self 
WHERE kota = 'SLEMAN' 
GROUP BY kecamatan 
ORDER BY jumlah_nasabah DESC;
```

## 🔄 Cara Kerja Sistem

### Untuk WNI (Warga Negara Indonesia):
1. User input alamat jalan → disimpan di `alamat_jalan`
2. User pilih Provinsi → disimpan di `provinsi`
3. User pilih Kota → disimpan di `kota`
4. User pilih Kecamatan → disimpan di `kecamatan`
5. User pilih Kelurahan → disimpan di `kelurahan`
6. Sistem gabungkan semua → disimpan di `alamat_id` (alamat lengkap)

### Untuk Non-WNI:
1. User input alamat → disimpan di `alamat_jalan` dan `alamat_id`
2. Kolom provinsi, kota, kecamatan, kelurahan = kosong

## 📁 File yang Dimodifikasi

### 1. Database Migration:
- `backend/migrations/008_add_address_breakdown_fields.sql` ✅ BARU

### 2. Backend Controller:
- `backend/controllers/pengajuanController.js` ✅ UPDATED
  - Menambahkan field alamat baru ke destructuring
  - Update query INSERT untuk menyimpan data terpisah

### 3. Frontend Types:
- `frontend/src/components/account-forms/types.ts` ✅ UPDATED
  - Menambahkan field: `alamatJalan`, `kecamatan`, `kelurahan`

### 4. Frontend Forms:
- `frontend/src/components/account-forms/FormSimpel.tsx` ✅ UPDATED
- `frontend/src/components/account-forms/FormMutiara.tsx` ✅ UPDATED
  - Update `updateFullAddress()` untuk menyimpan data terpisah
  - Menyimpan alamat jalan, provinsi, kota, kecamatan, kelurahan secara terpisah

### 5. Form Handler:
- `frontend/src/components/AccountForm.tsx` ✅ UPDATED
  - Menambahkan field baru ke `formData` initialization
  - Update `submitData` untuk mengirim data alamat terpisah

## 🎉 Hasil Akhir

### ✅ Yang Tersimpan di Database:

| Field | Contoh Data | Kegunaan |
|-------|-------------|----------|
| `alamat_jalan` | "Jl. Magelang No. 123, RT 02/RW 05" | Analisis pola jalan/RT/RW |
| `provinsi` | "DI YOGYAKARTA" | Analisis per provinsi |
| `kota` | "SLEMAN" | Analisis per kota |
| `kecamatan` | "Mlati" | Analisis per kecamatan |
| `kelurahan` | "Tirtoadi" | Analisis per kelurahan |
| `alamat_id` | "Jl. Magelang No. 123, RT 02/RW 05, Tirtoadi, Mlati, Sleman, DI Yogyakarta" | Alamat lengkap untuk tampilan |

### ✅ Keuntungan:
1. **Data Terstruktur** - Setiap komponen alamat tersimpan terpisah
2. **Analisis Mudah** - Bisa query per provinsi, kota, kecamatan, kelurahan
3. **Kompatibilitas** - Alamat lengkap tetap tersedia di `alamat_id`
4. **Fleksibilitas** - Bisa analisis dari level provinsi sampai RT/RW

### ✅ Status:
- ✅ Database migration berhasil
- ✅ Backend controller updated
- ✅ Frontend forms updated  
- ✅ Types definition updated
- ✅ No syntax errors
- ✅ Siap untuk testing dan analisis data

Sekarang Anda memiliki struktur data yang optimal untuk analisis geografis nasabah! 🎯