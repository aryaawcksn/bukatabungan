# Database Structure Corrections

## Tanggal: 2025-12-09

## Struktur Database yang Benar

Berdasarkan diagram database yang diberikan, berikut adalah struktur tabel yang sebenarnya digunakan:

### Tabel Utama

1. **pengajuan_tabungan** - Tabel induk untuk semua pengajuan
2. **cdd_self** - Data diri pemohon
3. **cdd_job** - Data pekerjaan dan keuangan
4. **account** - Konfigurasi rekening
5. **cdd_reference** - Kontak darurat/referensi
6. **bo** - Beneficial Owner (BUKAN `cdd_beneficial_owner`)
7. **cabang** - Data cabang bank

### Tabel `bo` (Beneficial Owner)

Struktur tabel yang ada di database:

```sql
CREATE TABLE bo (
  id SERIAL PRIMARY KEY,
  pengajuan_id INTEGER REFERENCES pengajuan_tabungan(id),
  nama VARCHAR(255),
  alamat TEXT,
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  jenis_id VARCHAR(20),
  nomor_id VARCHAR(50),
  pekerjaan VARCHAR(100),
  -- Kolom yang ditambahkan oleh migration:
  pendapatan_tahunan VARCHAR(50),  -- BUKAN pendapatan_tahun
  persetujuan BOOLEAN,
  created_at TIMESTAMP
);
```

### Tabel `cdd_self`

Kolom yang ditambahkan:

```sql
ALTER TABLE cdd_self
ADD COLUMN rekening_untuk_sendiri BOOLEAN DEFAULT TRUE;
```

Field ini menentukan apakah rekening untuk pemohon sendiri (TRUE) atau untuk orang lain (FALSE). Beneficial Owner info hanya diperlukan jika FALSE (untuk orang lain).

## Perubahan yang Dilakukan

### 1. Migration File (`backend/migrations/001_add_missing_fields.sql`)

**SEBELUM:**
```sql
CREATE TABLE IF NOT EXISTS cdd_beneficial_owner (...)
```

**SESUDAH:**
```sql
ALTER TABLE bo
ADD COLUMN IF NOT EXISTS pendapatan_tahunan VARCHAR(50),
ADD COLUMN IF NOT EXISTS persetujuan BOOLEAN DEFAULT FALSE;
```

### 2. Controller (`backend/controllers/pengajuanController.js`)

**SEBELUM:**
```javascript
INSERT INTO cdd_beneficial_owner (
  pengajuan_id, nama, alamat, tempat_lahir, tanggal_lahir,
  jenis_id, nomor_id, pekerjaan, pendapatan_tahun, persetujuan, created_at
) VALUES (...)
```

**SESUDAH:**
```javascript
INSERT INTO bo (
  pengajuan_id, nama, alamat, tempat_lahir, tanggal_lahir,
  jenis_id, nomor_id, pekerjaan, pendapatan_tahunan, persetujuan, created_at
) VALUES (...)
```

**JOIN Query - SEBELUM:**
```javascript
LEFT JOIN cdd_beneficial_owner cbo ON p.id = cbo.pengajuan_id
```

**JOIN Query - SESUDAH:**
```javascript
LEFT JOIN bo cbo ON p.id = cbo.pengajuan_id
```

## Catatan Penting

1. ✅ Tabel `bo` sudah ada di database - tidak perlu membuat tabel baru
2. ✅ Nama kolom adalah `pendapatan_tahunan` bukan `pendapatan_tahun`
3. ✅ Migration hanya menambahkan kolom yang belum ada ke tabel `bo`
4. ✅ Controller sudah diperbaiki untuk menggunakan nama tabel dan kolom yang benar

## Cara Menjalankan Migration

```bash
# Masuk ke direktori backend
cd backend

# Jalankan migration (sesuaikan dengan setup database Anda)
psql -U your_username -d your_database -f migrations/001_add_missing_fields.sql
```

Atau jika menggunakan migration tool:

```bash
npm run migrate
```

## Verifikasi

Setelah migration, verifikasi dengan query:

```sql
-- Cek kolom baru di cdd_self
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cdd_self' 
AND column_name = 'rekening_untuk_sendiri';

-- Cek kolom baru di bo
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bo' 
AND column_name IN ('pendapatan_tahunan', 'persetujuan');

-- Cek kolom baru di cdd_job
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cdd_job' 
AND column_name IN ('rata_rata_transaksi', 'telepon_perusahaan', 'referensi_nama');
```
