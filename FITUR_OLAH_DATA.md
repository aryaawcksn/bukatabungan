# Fitur Olah Data Dashboard

## Overview
Fitur olah data telah ditambahkan ke dashboard dengan kemampuan backup, export, import, dan delete data permohonan dalam berbagai format dengan filter tanggal.

## Lokasi Fitur
- **Frontend**: `dashboard/src/components/DataManagement.tsx`
- **Backend**: Endpoint baru di `backend/routes/pengajuanRoutes.js` dan `backend/controllers/pengajuanController.js`
- **UI**: Accordion "Olah Data" di tab "Pengaturan" dashboard

## Fitur yang Tersedia

### 1. Filter Tanggal Export
- **UI**: Toggle filter dengan date picker
- **Fitur**: Rentang tanggal mulai dan akhir
- **Berlaku untuk**: Semua jenis export (Excel & JSON)
- **Reset**: Tombol reset untuk menghapus filter

### 2. Export Excel
- **Endpoint**: `GET /api/pengajuan/export/excel`
- **Format**: File Excel (.xlsx)
- **Varian**:
  - **Data Utama**: Kolom penting untuk analisis (14 kolom)
  - **Data Lengkap**: Semua field database (50+ kolom)
- **Parameter**: 
  - `fullData=true` untuk export lengkap
  - `startDate` & `endDate` untuk filter tanggal

### 3. Backup JSON
- **Endpoint**: `GET /api/pengajuan/export/backup`
- **Format**: File JSON
- **Konten**: Data lengkap termasuk metadata dan relasi EDD
- **Parameter**: `startDate` & `endDate` untuk filter tanggal
- **Fitur**: Berisi semua field database dan informasi relasi

### 4. Import Data (ENHANCED)
- **Preview Endpoint**: `POST /api/pengajuan/import/preview`
- **Import Endpoint**: `POST /api/pengajuan/import`
- **Format Didukung**: JSON, Excel (.xlsx, .xls), CSV
- **Ukuran Maksimal**: 10MB
- **Fitur Preview**:
  - Analisis file sebelum import
  - Deteksi konflik status data
  - Breakdown per status dan cabang
  - Konfirmasi overwrite vs skip
- **Fitur Import**:
  - Mode overwrite untuk data yang sudah ada
  - Progress indicator dengan detail
  - Error handling komprehensif

### 5. Delete Data (BARU)
- **Endpoint**: `DELETE /api/pengajuan/delete/:status`
- **Status yang didukung**:
  - `pending` - Hapus data dengan status pending
  - `approved` - Hapus data dengan status disetujui
  - `rejected` - Hapus data dengan status ditolak
  - `all` - Hapus semua data
- **Parameter**: `?cabangId=X` untuk super admin pilih cabang spesifik
- **Modal Konfirmasi**:
  - **Admin Cabang**: "Hapus [Status] Cabang ini?"
  - **Super Admin**: Dropdown pilihan cabang + "Semua Cabang"
- **Keamanan**: Modal konfirmasi dengan pesan warning
- **Cascade**: Otomatis hapus data relasi (EDD, BO, dll)

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
- **Filter Tanggal**: Toggle show/hide dengan date picker
- **Export Options**: Tombol terpisah untuk data utama vs lengkap
- **Delete Confirmation**: Dialog konfirmasi dengan pesan warning
- **Loading States**: Spinner dan progress indicator
- **Toast Notifications**: Feedback real-time untuk semua operasi
- **Responsive Design**: Grid layout yang adaptif
- **Gradient Backgrounds**: Visual appeal dengan warna berbeda per section
- **Icon-based Interface**: Lucide icons untuk clarity

## Security & Access Control
- **Role-based Access**: 
  - **Super Admin**: 
    - Akses semua data dari semua cabang
    - Bisa pilih cabang spesifik untuk delete
    - Modal dengan dropdown pilihan cabang
  - **Admin Cabang**: 
    - Hanya data cabang sendiri
    - Modal konfirmasi sederhana untuk cabang sendiri
- **File Security**: Memory storage, validasi MIME type
- **Delete Protection**: 
  - Modal konfirmasi berbeda per role
  - Pesan warning yang jelas
  - Cascade deletion untuk integritas data
- **Audit Logging**: 
  - Semua aktivitas tercatat di `user_log`
  - Mencatat user, timestamp, IP address, user agent
  - Log export, import, dan delete dengan detail lengkap
- **SQL Injection Protection**: Parameterized queries
- **Rate Limiting**: Melalui existing middleware

## Technical Implementation

### Frontend Components
```typescript
// Filter tanggal dengan state management
const [showDateFilter, setShowDateFilter] = useState(false);
const [dateRange, setDateRange] = useState({
  startDate: '',
  endDate: ''
});

// Import preview state
const [showImportPreview, setShowImportPreview] = useState(false);
const [importPreviewData, setImportPreviewData] = useState(null);
const [selectedFile, setSelectedFile] = useState(null);

// Export dengan parameter
const handleExportExcel = async (fullData = false) => {
  const params = new URLSearchParams();
  if (fullData) params.append('fullData', 'true');
  if (dateRange.startDate) params.append('startDate', dateRange.startDate);
  // ...
};

// Preview import dengan analisis
const handlePreviewImport = async (file) => {
  // Analisis file dan tampilkan modal konfirmasi
};
```

### Backend Endpoints
```javascript
// Export dengan query parameters
router.get("/export/excel", verifyToken, exportToExcel);
// ?fullData=true&startDate=2024-01-01&endDate=2024-12-31

// Import dengan preview dan konfirmasi
router.post("/import/preview", verifyToken, upload.single('file'), previewImportData);
router.post("/import", verifyToken, upload.single('file'), importData);
// Body: { overwrite: 'true' } untuk mode overwrite

// Delete dengan parameter status
router.delete("/delete/:status", verifyToken, deleteDataByStatus);
// /delete/pending, /delete/approved, /delete/rejected, /delete/all
```

### Audit Logging System
```javascript
// Helper function untuk logging
export const logUserActivity = async (userId, action, description, cabangId, ipAddress, userAgent) => {
  // Insert ke tabel user_log dengan semua detail aktivitas
};

// Contoh log yang tercatat:
// - EXPORT_EXCEL: "Export Excel Data Lengkap: 150 records (2024-01-01 - 2024-12-31)"
// - EXPORT_BACKUP: "Export Backup JSON: 75 records"
// - IMPORT_DATA: "Import Data: 25 berhasil, 5 dilewati dari 30 total"
// - DELETE_DATA: "Hapus data pending: 10 records dari Cabang Utama"
```

## Database Schema Support
- **Main Table**: `pengajuan_tabungan`
- **Related Tables**: `cdd_self`, `cdd_job`, `account`, `kontak_darurat`, `beneficial_owner`
- **EDD Tables**: `edd_bank_lain`, `edd_pekerjaan_lain`
- **Cascade Deletion**: Otomatis hapus semua relasi

## Future Enhancements
- **Scheduled Exports**: Cron job untuk backup otomatis
- **Advanced Filters**: Filter berdasarkan cabang, status, dll
- **Batch Operations**: Import/delete dalam batch besar
- **Audit Logging**: Log semua aktivitas export/import/delete
- **Data Validation**: Rules yang lebih ketat untuk import
- **Email Notifications**: Notifikasi setelah operasi selesai