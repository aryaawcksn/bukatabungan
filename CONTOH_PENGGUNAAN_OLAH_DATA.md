# Contoh Penggunaan Fitur Olah Data

## Langkah-langkah Penggunaan

### 1. Mengakses Fitur Olah Data
1. Login ke dashboard sebagai admin
2. Klik tab "Pengaturan" di sidebar
3. Scroll ke bawah dan cari accordion "Olah Data"
4. Klik untuk membuka accordion

### 2. Export Data ke Excel
```
Klik tombol "Export Excel" → File akan terdownload otomatis
Nama file: data-permohonan-YYYY-MM-DDTHH-MM-SS.xlsx
```

**Contoh isi Excel:**
| Kode Referensi | Nama Lengkap | NIK | Email | No HP | Status |
|----------------|--------------|-----|-------|-------|--------|
| REF-001 | John Doe | 1234567890123456 | john@email.com | 081234567890 | pending |

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

### 4. Import Data
1. **Persiapkan File**
   - Format: JSON, Excel (.xlsx, .xls), atau CSV
   - Ukuran maksimal: 10MB
   - Pastikan struktur data sesuai

2. **Proses Import**
   ```
   Klik "Pilih File" → Pilih file → Tunggu progress bar → Selesai
   ```

3. **Hasil Import**
   - Toast notification akan muncul
   - Menampilkan jumlah data yang berhasil diimport
   - Data duplikasi akan di-skip otomatis

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

### Error "Format file tidak didukung"
**Solusi**: Pastikan file berformat JSON, Excel (.xlsx/.xls), atau CSV

### Error "Ukuran file terlalu besar"
**Solusi**: Pecah file menjadi beberapa bagian (max 10MB per file)

### Import gagal
**Solusi**: 
1. Periksa format data dalam file
2. Pastikan field wajib terisi
3. Cek koneksi internet

### Data tidak muncul setelah import
**Solusi**:
1. Refresh halaman dashboard
2. Periksa filter status di tabel permohonan
3. Cek role akses (admin cabang hanya lihat data cabangnya)

## Monitoring & Logging

### Log Backend
```
📊 Excel export request received
👤 User: admin_user Role: super Cabang: 1
✅ Excel export completed: 150 records exported
```

### Log Frontend
- Toast notifications untuk feedback user
- Progress indicator untuk proses import
- Error handling dengan pesan yang jelas

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