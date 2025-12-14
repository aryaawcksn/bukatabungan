# Contoh Preview Import Data

## Overview
Fitur preview import memungkinkan admin untuk melihat detail data yang akan diimport sebelum benar-benar mengeksekusi import, termasuk deteksi konflik status.

## Flow Proses Import

### 1. Upload File
```
User: Klik "Pilih File" → Pilih file JSON
System: Otomatis analisis file dan tampilkan preview
```

### 2. Analisis Data
Backend akan menganalisis:
- **Total Records**: Jumlah data dalam file
- **Data Baru**: Data yang belum ada di database
- **Data Existing**: Data yang sudah ada (berdasarkan kode_referensi)
- **Konflik Status**: Data existing dengan status berbeda

### 3. Modal Preview
Menampilkan informasi lengkap sebelum import

## Contoh Skenario

### Skenario 1: Import Tanpa Konflik
**File JSON:**
```json
[
  {
    "kode_referensi": "NEW-001",
    "nama_lengkap": "Ahmad Budi",
    "status": "pending",
    "cabang_id": 1
  },
  {
    "kode_referensi": "NEW-002", 
    "nama_lengkap": "Siti Aisyah",
    "status": "pending",
    "cabang_id": 1
  }
]
```

**Preview Modal:**
```
┌─────────────────────────────────────┐
│        Preview Import Data          │
│                                     │
│ 📊 Summary:                         │
│ Total: 2 | Baru: 2 | Konflik: 0    │
│                                     │
│ 📈 Status: 2 pending                │
│ 🏢 Cabang: Cabang Utama (2)         │
│                                     │
│ ✅ Tidak ada konflik terdeteksi     │
│                                     │
│        [Lanjutkan Import]           │
│             [Batal]                 │
└─────────────────────────────────────┘
```

### Skenario 2: Import dengan Konflik Status
**File JSON:**
```json
[
  {
    "kode_referensi": "REF-001", // Sudah ada di DB dengan status "pending"
    "nama_lengkap": "John Doe",
    "status": "approved", // Berbeda dengan DB
    "cabang_id": 1
  },
  {
    "kode_referensi": "REF-002", // Sudah ada di DB dengan status "approved"
    "nama_lengkap": "Jane Smith", 
    "status": "rejected", // Berbeda dengan DB
    "cabang_id": 1
  },
  {
    "kode_referensi": "NEW-003", // Data baru
    "nama_lengkap": "Bob Wilson",
    "status": "pending",
    "cabang_id": 2
  }
]
```

**Preview Modal:**
```
┌─────────────────────────────────────────────────────┐
│              Preview Import Data                    │
│                                                     │
│ 📊 Summary:                                         │
│ Total: 3 | Baru: 1 | Sudah Ada: 2 | Konflik: 2    │
│                                                     │
│ 📈 Status: 1 pending, 1 approved, 1 rejected       │
│ 🏢 Cabang: Cabang Utama (2), Cabang Sleman (1)     │
│                                                     │
│ ⚠️ Konflik Status Terdeteksi:                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ John Doe (REF-001)                              │ │
│ │ pending → approved                              │ │
│ │                                                 │ │
│ │ Jane Smith (REF-002)                            │ │
│ │ approved → rejected                             │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Pilihan Import:                                     │
│ [Import & Timpa Data yang Konflik]                 │
│ [Import Hanya Data Baru (Skip Konflik)]            │
│                    [Batal]                          │
└─────────────────────────────────────────────────────┘
```

## Hasil Import Berdasarkan Pilihan

### Pilihan 1: Import & Timpa Konflik
```
Hasil:
- 1 data baru ditambahkan (Bob Wilson)
- 2 data existing ditimpa (John Doe, Jane Smith)
- 0 data dilewati

Toast: "Data berhasil diimpor: 1 baru, 2 ditimpa, 0 dilewati"

Log: "Import Data (Overwrite): 1 baru, 2 ditimpa, 0 dilewati dari 3 total"
```

### Pilihan 2: Import Hanya Data Baru
```
Hasil:
- 1 data baru ditambahkan (Bob Wilson)
- 0 data existing ditimpa
- 2 data dilewati (John Doe, Jane Smith)

Toast: "Data berhasil diimpor: 1 baru, 0 ditimpa, 2 dilewati"

Log: "Import Data: 1 berhasil, 2 dilewati dari 3 total"
```

## Response API Preview

### Endpoint: `POST /api/pengajuan/import/preview`

**Response Success:**
```json
{
  "success": true,
  "analysis": {
    "totalRecords": 3,
    "statusBreakdown": {
      "pending": 1,
      "approved": 1,
      "rejected": 1
    },
    "cabangBreakdown": {
      "Cabang Utama": 2,
      "Cabang Sleman": 1
    },
    "existingRecords": [
      {
        "kode_referensi": "REF-001",
        "nama_lengkap": "John Doe",
        "currentStatus": "pending",
        "newStatus": "approved",
        "willOverwrite": true
      },
      {
        "kode_referensi": "REF-002",
        "nama_lengkap": "Jane Smith", 
        "currentStatus": "approved",
        "newStatus": "rejected",
        "willOverwrite": true
      }
    ],
    "newRecords": [
      {
        "kode_referensi": "NEW-003",
        "nama_lengkap": "Bob Wilson",
        "status": "pending"
      }
    ],
    "conflicts": [
      {
        "kode_referensi": "REF-001",
        "nama_lengkap": "John Doe",
        "currentStatus": "pending", 
        "newStatus": "approved"
      },
      {
        "kode_referensi": "REF-002",
        "nama_lengkap": "Jane Smith",
        "currentStatus": "approved",
        "newStatus": "rejected"
      }
    ]
  },
  "message": "Preview data berhasil dianalisis"
}
```

## Use Cases

### 1. Sinkronisasi Data Antar Cabang
- Admin pusat export data dari cabang A
- Import ke cabang B dengan preview untuk cek konflik
- Pilih overwrite jika ingin sinkronisasi status terbaru

### 2. Restore Backup
- Import file backup lama
- Preview menunjukkan data mana yang berubah sejak backup
- Pilih overwrite untuk restore ke status backup

### 3. Migrasi Data
- Import data dari sistem lama
- Preview menunjukkan duplikasi dan konflik
- Pilih strategi import yang sesuai

### 4. Update Batch Status
- Import file dengan status yang diupdate
- Preview menunjukkan perubahan status yang akan terjadi
- Konfirmasi sebelum apply perubahan

## Error Handling

### File Format Error
```json
{
  "success": false,
  "message": "Format JSON tidak valid",
  "error": "Unexpected token in JSON"
}
```

### Empty File Error
```json
{
  "success": false, 
  "message": "Data import kosong atau format tidak valid"
}
```

### Database Error
```json
{
  "success": false,
  "message": "Gagal menganalisis data import",
  "error": "Connection timeout"
}
```

## Best Practices

### 1. Selalu Preview Dulu
- Jangan langsung import tanpa preview
- Periksa konflik dan breakdown data
- Pastikan data sesuai ekspektasi

### 2. Backup Sebelum Overwrite
- Export data existing sebelum import overwrite
- Simpan backup untuk rollback jika diperlukan

### 3. Test dengan Data Kecil
- Test import dengan file kecil dulu
- Verifikasi hasil sebelum import data besar

### 4. Monitor Log
- Periksa log aktivitas setelah import
- Pastikan jumlah data sesuai ekspektasi