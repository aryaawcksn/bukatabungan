# Database Mismatch Fix - Export Excel

## Issue
Error saat export Excel: `column bo.pendapatan_tahun does not exist`

## Root Cause Analysis
Terdapat inkonsistensi dalam penamaan kolom dan tabel antara kode dan struktur database aktual.

## Fixes Applied

### 1. Kolom `pendapatan_tahun` vs `pendapatan_tahunan`
**Problem**: Query menggunakan `bo.pendapatan_tahun` tapi kolom sebenarnya `bo.pendapatan_tahunan`

**Fix**:
```sql
-- BEFORE (ERROR)
bo.pendapatan_tahun AS bo_pendapatan_tahun

-- AFTER (FIXED)
bo.pendapatan_tahunan AS bo_pendapatan_tahun
```

### 2. Tabel `kontak_darurat` vs `cdd_reference`
**Problem**: Inkonsistensi nama tabel untuk emergency contact

**Fix**:
```sql
-- BEFORE (INCONSISTENT)
LEFT JOIN kontak_darurat kd ON p.id = kd.pengajuan_id

-- AFTER (CONSISTENT)
LEFT JOIN cdd_reference kd ON p.id = kd.pengajuan_id
```

### 3. Kolom `status_pernikahan` vs `status_kawin`
**Problem**: Query menggunakan `cs.status_pernikahan` tapi kolom sebenarnya `cs.status_kawin`

**Fix**:
```sql
-- BEFORE (ERROR)
cs.status_pernikahan

-- AFTER (FIXED)
cs.status_kawin AS status_pernikahan
```

### 4. Kolom Address Fields
**Problem**: Inkonsistensi penamaan kolom alamat

**Fix**:
```sql
-- BEFORE (INCONSISTENT)
cs.alamat_domisili
cs.kode_pos

-- AFTER (CONSISTENT)
cs.alamat_now AS alamat_domisili
cs.kode_pos_id AS kode_pos
```

### 5. Job Fields Mapping
**Problem**: Penamaan kolom pekerjaan tidak konsisten

**Fix**:
```sql
-- BEFORE (INCONSISTENT)
cj.tempat_bekerja
cj.alamat_kantor
cj.telepon_perusahaan
cj.rata_rata_transaksi
cj.tujuan_rekening

-- AFTER (CONSISTENT)
cj.nama_perusahaan AS tempat_bekerja
cj.alamat_perusahaan AS alamat_kantor
cj.no_telepon AS telepon_perusahaan
cj.rata_transaksi_per_bulan AS rata_rata_transaksi
acc.tujuan_pembukaan AS tujuan_rekening
```

## Database Schema Verification

### Actual Table Structure (Based on Working Queries)

#### Table: `pengajuan_tabungan`
- `id`, `status`, `created_at`, `approved_at`, `rejected_at`, `cabang_id`

#### Table: `cdd_self`
- `pengajuan_id`, `kode_referensi`, `nama`, `alias`, `jenis_id`, `no_id`, `berlaku_id`
- `tempat_lahir`, `tanggal_lahir`, `alamat_id`, `kode_pos_id`, `alamat_now`
- `jenis_kelamin`, `status_kawin`, `agama`, `pendidikan`, `nama_ibu_kandung`
- `npwp`, `email`, `no_hp`, `kewarganegaraan`, `status_rumah`
- `rekening_untuk_sendiri`, `tipe_nasabah`, `nomor_rekening_lama`

#### Table: `cdd_job`
- `pengajuan_id`, `pekerjaan`, `nama_perusahaan`, `alamat_perusahaan`
- `no_telepon`, `jabatan`, `bidang_usaha`, `gaji_per_bulan`
- `sumber_dana`, `rata_transaksi_per_bulan`

#### Table: `account`
- `pengajuan_id`, `tabungan_tipe`, `atm_tipe`, `nominal_setoran`
- `tujuan_pembukaan`

#### Table: `cdd_reference` (Emergency Contact)
- `pengajuan_id`, `nama`, `no_hp`, `alamat`, `hubungan`

#### Table: `bo` (Beneficial Owner)
- `pengajuan_id`, `nama`, `alamat`, `tempat_lahir`, `tanggal_lahir`
- `jenis_kelamin`, `kewarganegaraan`, `status_pernikahan`
- `jenis_id`, `nomor_id`, `sumber_dana`, `hubungan`, `nomor_hp`
- `pekerjaan`, `pendapatan_tahunan`, `persetujuan`

#### Table: `cabang`
- `id`, `nama_cabang`

## Prevention Strategy

### 1. Use Consistent Naming
- Always refer to working queries (like `getAllPengajuan`) for column names
- Document actual database schema
- Use aliases consistently

### 2. Test Queries Incrementally
- Start with basic SELECT
- Add JOINs one by one
- Test each column addition

### 3. Reference Working Functions
- Copy query structure from functions that work
- Modify incrementally
- Don't assume column names

## Verification Commands

### Test Basic Query
```sql
SELECT p.id, p.status, cs.nama, c.nama_cabang
FROM pengajuan_tabungan p
LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
LEFT JOIN cabang c ON p.cabang_id = c.id
LIMIT 1;
```

### Test Problematic Columns
```sql
-- Test BO table
SELECT bo.pendapatan_tahunan FROM bo LIMIT 1;

-- Test cdd_self columns
SELECT cs.status_kawin, cs.alamat_now, cs.kode_pos_id FROM cdd_self cs LIMIT 1;

-- Test cdd_job columns  
SELECT cj.nama_perusahaan, cj.alamat_perusahaan, cj.no_telepon, cj.rata_transaksi_per_bulan 
FROM cdd_job cj LIMIT 1;
```

## Files Modified
- `backend/controllers/pengajuanController.js`
  - Fixed `exportToExcel` function query
  - Corrected column names and table references
  - Used consistent aliases

## Testing
After applying fixes:
1. Test export Excel (basic)
2. Test export Excel (full data)
3. Test with date filters
4. Verify all columns in exported file

## Notes
- Always use working queries as reference
- Database schema may differ from initial assumptions
- Column names in database may not match variable names in code
- Test incrementally when adding new features