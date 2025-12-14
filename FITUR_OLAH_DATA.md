# Fitur Olah Data Dashboard

## Overview
Fitur olah data telah ditambahkan ke dashboard dengan kemampuan backup, export, dan import data permohonan dalam berbagai format.

## Lokasi Fitur
- **Frontend**: `dashboard/src/components/DataManagement.tsx`
- **Backend**: Endpoint baru di `backend/routes/pengajuanRoutes.js` dan `backend/controllers/pengajuanController.js`
- **UI**: Accordion "Olah Data" di tab "Pengaturan" dashboard

## Fitur yang Tersedia

### 1. Export Excel
- **Endpoint**: `GET /api/pengajuan/export/excel`
- **Format**: File Excel (.xlsx)
- **Konten**: Data utama permohonan untuk analisis
- **Kolom**: Kode referensi, nama, NIK, email, HP, tanggal lahir, alamat, pekerjaan, penghasilan, jenis rekening, jenis kartu, cabang, status, tanggal pengajuan

### 2. Backup JSON
- **Endpoint**: `GET /api/pengajuan/export/backup`
- **Format**: File JSON
- **Konten**: Data lengkap termasuk metadata dan relasi
- **Fitur**: Berisi semua field database dan informasi EDD

### 3. Import Data
- **Endpoint**: `POST /api/pengajuan/import`
- **Format Didukung**: JSON, Excel (.xlsx, .xls), CSV
- **Ukuran Maksimal**: 10MB
- **Fitur**: 
  - Validasi duplikasi berdasarkan kode referensi
  - Progress indicator
  - Error handling untuk data tidak valid

## Keamanan & Akses
- **Role-based Access**: 
  - Super admin: Akses semua data
  - Admin cabang: Hanya data cabang sendiri
- **Authentication**: Semua endpoint memerlukan token valid
- **File Validation**: Validasi tipe file dan ukuran

## Dependencies Baru
### Backend
- `exceljs`: Library untuk generate file Excel

### Frontend
- Menggunakan existing dependencies (Lucide icons, Sonner toast)

## Cara Penggunaan

### 1. Export Data
1. Masuk ke tab "Pengaturan" di dashboard
2. Buka accordion "Olah Data"
3. Klik tombol "Export Excel" atau "Backup JSON"
4. File akan otomatis terdownload

### 2. Import Data
1. Masuk ke tab "Pengaturan" di dashboard
2. Buka accordion "Olah Data"
3. Klik tombol "Pilih File"
4. Pilih file JSON/Excel/CSV yang valid
5. Tunggu proses import selesai

## Format File Import

### JSON Format
```json
{
  "metadata": {
    "exportedAt": "2024-12-14T10:00:00.000Z",
    "exportedBy": "admin",
    "totalRecords": 100
  },
  "data": [
    {
      "kode_referensi": "REF-001",
      "nama_lengkap": "John Doe",
      "nik": "1234567890123456",
      "email": "john@example.com",
      // ... field lainnya
    }
  ]
}
```

## Error Handling
- Validasi format file
- Validasi ukuran file
- Duplikasi data handling
- Network error handling
- Progress tracking untuk import

## UI/UX Features
- Loading states dengan spinner
- Progress bar untuk import
- Toast notifications untuk feedback
- Responsive design
- Gradient backgrounds untuk visual appeal
- Icon-based interface

## Security Notes
- File upload menggunakan memory storage (tidak disimpan di disk)
- Validasi MIME type untuk keamanan
- Rate limiting melalui existing middleware
- SQL injection protection dengan parameterized queries

## Future Enhancements
- Support untuk format CSV import
- Batch processing untuk file besar
- Scheduled backup otomatis
- Data validation rules yang lebih ketat
- Audit log untuk aktivitas import/export