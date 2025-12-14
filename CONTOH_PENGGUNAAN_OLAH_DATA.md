# Contoh Penggunaan Fitur Olah Data

## Langkah-langkah Penggunaan

### 1. Mengakses Fitur Olah Data
1. Login ke dashboard sebagai admin
2. Klik tab "Pengaturan" di sidebar
3. Scroll ke bawah dan cari accordion "Olah Data"
4. Klik untuk membuka accordion

### 2. Mengatur Filter Tanggal (Opsional)
1. **Tampilkan Filter**: Klik tombol "Tampilkan Filter" di section Filter Tanggal
2. **Set Tanggal Mulai**: Pilih tanggal mulai dari date picker
3. **Set Tanggal Akhir**: Pilih tanggal akhir dari date picker
4. **Reset Filter**: Klik "Reset Filter" untuk menghapus filter

```
Contoh: Filter data dari 1 Januari 2024 sampai 31 Desember 2024
Tanggal Mulai: 2024-01-01
Tanggal Akhir: 2024-12-31
```

### 3. Export Data ke Excel

#### A. Export Data Utama (Ringkas)
```
Klik tombol "Data Utama" → File akan terdownload otomatis
Nama file: data-permohonan-YYYY-MM-DDTHH-MM-SS.xlsx
```

**Kolom yang disertakan (14 kolom):**
| Kode Referensi | Nama Lengkap | NIK | Email | No HP | Tanggal Lahir | Alamat | Pekerjaan | Penghasilan | Jenis Rekening | Jenis Kartu | Cabang | Status | Tanggal Pengajuan |
|----------------|--------------|-----|-------|-------|---------------|--------|-----------|-------------|----------------|-------------|--------|--------|-------------------|
| REF-001 | John Doe | 1234567890123456 | john@email.com | 081234567890 | 01/01/1990 | Jl. Contoh No. 123 | Karyawan Swasta | 5-10jt | Tabungan Mutiara | Silver | Cabang Utama | pending | 14/12/2024 08:00 |

#### B. Export Data Lengkap (Full)
```
Klik tombol "Data Lengkap" → File akan terdownload otomatis
Nama file: full-data-YYYY-MM-DDTHH-MM-SS.xlsx
```

**Kolom yang disertakan (50+ kolom):**
- Semua data personal (nama, alias, NIK, tempat lahir, dll)
- Data pekerjaan lengkap (tempat kerja, alamat kantor, jabatan, dll)
- Data kontak darurat
- Data beneficial owner (jika ada)
- Timestamp lengkap (created, approved, rejected)

### 3. Backup Data (JSON)
```
Klik tombol "Backup JSON" → File akan terdownload otomatis
Nama file: backup-data-YYYY-MM-DDTHH-MM-SS.json
```

**Contoh struktur JSON:**
```json
{
  "metadata": {
    "exportedAt": "2024-12-14T10:30:00.000Z",
    "exportedBy": "admin_user",
    "userRole": "super",
    "totalRecords": 150,
    "version": "1.0"
  },
  "data": [
    {
      "id": 1,
      "kode_referensi": "REF-001",
      "nama_lengkap": "John Doe",
      "nik": "1234567890123456",
      "email": "john@email.com",
      "no_hp": "081234567890",
      "tanggal_lahir": "1990-01-01",
      "alamat": "Jl. Contoh No. 123",
      "pekerjaan": "Karyawan Swasta",
      "penghasilan": "5-10jt",
      "jenis_rekening": "Tabungan Mutiara",
      "jenis_kartu": "silver",
      "cabang_id": 1,
      "nama_cabang": "Cabang Utama",
      "status": "pending",
      "created_at": "2024-12-14T08:00:00.000Z",
      "edd_bank_lain": [],
      "edd_pekerjaan_lain": []
    }
  ]
}
```

### 5. Import Data (ENHANCED)

#### A. Persiapan File
- **Format**: JSON, Excel (.xlsx, .xls), atau CSV
- **Ukuran maksimal**: 10MB
- **Pastikan struktur data sesuai**

#### B. Proses Import dengan Preview
1. **Pilih File**: Klik "Pilih File" → Pilih file JSON
2. **Analisis Otomatis**: Sistem akan menganalisis file dan menampilkan preview
3. **Modal Preview**: Menampilkan detail data yang akan diimport

**Contoh Modal Preview:**
```
┌─────────────────────────────────────────────────────┐
│              Preview Import Data                    │
│                                                     │
│  📊 Summary:                                        │
│  ┌─────────┬─────────┬─────────┬─────────┐         │
│  │ Total   │ Baru    │ Sudah   │ Konflik │         │
│  │   50    │   30    │   20    │    5    │         │
│  └─────────┴─────────┴─────────┴─────────┘         │
│                                                     │
│  📈 Status: 25 pending, 15 approved, 10 rejected   │
│  🏢 Cabang: Cabang A (30), Cabang B (20)           │
│                                                     │
│  ⚠️ Konflik Status Terdeteksi:                     │
│  • John Doe (REF-001): pending → approved          │
│  • Jane Smith (REF-002): approved → rejected       │
│                                                     │
│  [Import & Timpa Konflik] [Import Hanya Baru]      │
│                    [Batal]                          │
└─────────────────────────────────────────────────────┘
```

#### C. Pilihan Import
1. **Import & Timpa Konflik**: 
   - Menimpa data yang sudah ada dengan status baru
   - Untuk data yang statusnya berubah
2. **Import Hanya Baru**: 
   - Skip data yang sudah ada
   - Hanya import data baru

#### D. Hasil Import
```
Toast: "Data berhasil diimpor: 30 baru, 5 ditimpa, 15 dilewati"
```

**Breakdown Hasil:**
- **Baru**: Data yang belum ada di database
- **Ditimpa**: Data yang sudah ada dan di-update (jika pilih overwrite)
- **Dilewati**: Data yang sudah ada dan tidak di-update

### 6. Delete Data (FITUR BARU)

#### A. Delete untuk Admin Cabang
```
Pilih salah satu tombol:
- "Hapus Pending" → Modal: "Hapus Pending Cabang ini?"
- "Hapus Disetujui" → Modal: "Hapus Disetujui Cabang ini?"  
- "Hapus Ditolak" → Modal: "Hapus Ditolak Cabang ini?"
- "Hapus Semua" → Modal: "Hapus Semua Cabang ini?"
```

**Contoh Modal Admin Cabang:**
```
┌─────────────────────────────────────┐
│        Konfirmasi Hapus Data        │
│                                     │
│ Apakah Anda yakin ingin menghapus   │
│ data pending dari cabang ini?       │
│                                     │
│ ⚠️ Tindakan ini tidak dapat         │
│    dibatalkan!                      │
│                                     │
│    [Batal]    [Ya, Hapus Data]     │
└─────────────────────────────────────┘
```

#### B. Delete untuk Super Admin
```
Pilih salah satu tombol → Modal dengan dropdown cabang
```

**Contoh Modal Super Admin:**
```
┌─────────────────────────────────────┐
│        Konfirmasi Hapus Data        │
│                                     │
│ Pilih cabang yang ingin dihapus     │
│ data pendingnya:                    │
│                                     │
│ Pilih Cabang: [Dropdown]            │
│ ┌─────────────────────────────────┐ │
│ │ Semua Cabang                    │ │
│ │ Cabang Utama                    │ │
│ │ Cabang Sleman                   │ │
│ │ Cabang Yogya                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ⚠️ Tindakan ini akan menghapus data │
│    dengan status pending dari       │
│    cabang yang dipilih!             │
│                                     │
│    [Batal]    [Ya, Hapus Data]     │
└─────────────────────────────────────┘
```

#### Proses Delete:
1. **Klik Tombol**: Pilih jenis data yang ingin dihapus
2. **Modal Konfirmasi**: 
   - Admin Cabang: Konfirmasi sederhana
   - Super Admin: Pilih cabang dari dropdown
3. **Konfirmasi**: Klik "Ya, Hapus Data"
4. **Cascade Deletion**: Sistem otomatis hapus semua data relasi
5. **Feedback**: Toast notification menampilkan jumlah data yang dihapus
6. **Auto Refresh**: Dashboard otomatis refresh setelah delete

## Contoh File Import

### Format JSON untuk Import
```json
[
  {
    "kode_referensi": "IMP-001",
    "nama_lengkap": "Jane Smith",
    "nik": "9876543210987654",
    "email": "jane@email.com",
    "no_hp": "087654321098",
    "tanggal_lahir": "1985-05-15",
    "alamat": "Jl. Import No. 456",
    "pekerjaan": "Wiraswasta",
    "penghasilan": "10-20jt",
    "jenis_rekening": "Tabungan Bisnis",
    "jenis_kartu": "gold",
    "status": "pending"
  }
]
```

## Tips & Best Practices

### 1. Export Data
- **Excel**: Gunakan untuk analisis dan laporan
- **JSON Backup**: Gunakan untuk backup lengkap dan restore

### 2. Import Data
- Selalu backup data sebelum import besar
- Test dengan file kecil terlebih dahulu
- Periksa format data sebelum import

### 3. Keamanan
- Hanya admin yang bisa akses fitur ini
- File tidak disimpan di server (memory only)
- Validasi otomatis untuk mencegah data rusak

## Troubleshooting

### Export Issues

#### Error "Gagal mengekspor data"
**Solusi**: 
1. Cek koneksi internet
2. Pastikan tidak ada filter tanggal yang invalid
3. Coba export tanpa filter tanggal terlebih dahulu

#### File Excel kosong atau error
**Solusi**:
1. Pastikan ada data dalam rentang tanggal yang dipilih
2. Coba export dengan "Data Utama" terlebih dahulu
3. Periksa role akses (admin cabang hanya bisa export data cabangnya)

### Import Issues

#### Error "Format file tidak didukung"
**Solusi**: Pastikan file berformat JSON, Excel (.xlsx/.xls), atau CSV

#### Error "Ukuran file terlalu besar"
**Solusi**: Pecah file menjadi beberapa bagian (max 10MB per file)

#### Import gagal
**Solusi**: 
1. Periksa format data dalam file
2. Pastikan field wajib terisi
3. Cek koneksi internet

### Delete Issues

#### Tombol "Hapus Semua" tidak muncul
**Solusi**: Fitur ini hanya tersedia untuk super admin

#### Error "Gagal menghapus data"
**Solusi**:
1. Pastikan memiliki hak akses yang sesuai
2. Cek apakah ada data yang sedang diproses
3. Coba refresh halaman dan ulangi

#### Data tidak terhapus setelah konfirmasi
**Solusi**:
1. Refresh halaman dashboard
2. Periksa log di console browser
3. Pastikan tidak ada error koneksi

### General Issues

#### Data tidak muncul setelah operasi
**Solusi**:
1. Refresh halaman dashboard
2. Periksa filter status di tabel permohonan
3. Cek role akses (admin cabang hanya lihat data cabangnya)
4. Clear browser cache jika perlu

## Monitoring & Logging

### Log Backend Console
```
📊 Excel export request received
👤 User: admin_user Role: super Cabang: 1
✅ Excel export completed: 150 records exported (fullData: true)
📝 Log recorded: EXPORT_EXCEL by user 123
```

### Log Database (user_log table)
```sql
INSERT INTO user_log (
  user_id, action, description, cabang_id, 
  ip_address, user_agent, performed_by, created_at
) VALUES (
  123, 
  'EXPORT_EXCEL', 
  'Export Excel Data Lengkap: 150 records (2024-01-01 - 2024-12-31)',
  1,
  '192.168.1.100',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  123,
  NOW()
);
```

### Contoh Log yang Tercatat
- **Export**: `Export Excel Data Utama: 150 records`
- **Import**: `Import Data: 25 berhasil, 5 dilewati dari 30 total`
- **Delete**: `Hapus data pending: 10 records dari Cabang Utama`

### Log Frontend
- Toast notifications untuk feedback user
- Progress indicator untuk proses import
- Error handling dengan pesan yang jelas

### Melihat Log Aktivitas
1. **API Endpoint**: `GET /api/user-logs?page=1&limit=10`
2. **Role Access**: 
   - Super admin: Semua log
   - Admin cabang: Log cabang sendiri
3. **Filter**: Berdasarkan tanggal, user, atau aktivitas

## Integrasi dengan Fitur Lain

### 1. Role-based Access
- Super admin: Akses semua data
- Admin cabang: Hanya data cabang sendiri

### 2. Real-time Updates
- Data yang diimport langsung muncul di dashboard
- Auto-refresh setelah import berhasil

### 3. Analytics Integration
- Data export bisa digunakan untuk analytics external
- Backup data mendukung disaster recovery