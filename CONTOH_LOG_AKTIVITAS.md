# Contoh Log Aktivitas Fitur Olah Data

## Overview
Semua aktivitas export, import, dan delete data akan tercatat dalam tabel `user_log` dengan detail lengkap untuk audit trail.

## Struktur Log yang Tercatat

### Informasi Dasar
- **User ID**: ID user yang melakukan aktivitas
- **Action**: Jenis aktivitas (EXPORT_EXCEL, EXPORT_BACKUP, IMPORT_DATA, DELETE_DATA)
- **Description**: Deskripsi detail aktivitas
- **Cabang ID**: ID cabang user
- **IP Address**: Alamat IP user
- **User Agent**: Browser/device information
- **Timestamp**: Waktu aktivitas dilakukan
- **Performed By**: ID user yang melakukan (sama dengan User ID)

## Contoh Log Berdasarkan Aktivitas

### 1. Export Excel - Data Utama
```json
{
  "user_id": 123,
  "action": "EXPORT_EXCEL",
  "description": "Export Excel Data Utama: 150 records",
  "cabang_id": 1,
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "performed_by": 123,
  "created_at": "2024-12-14 10:30:00"
}
```

### 2. Export Excel - Data Lengkap dengan Filter Tanggal
```json
{
  "user_id": 123,
  "action": "EXPORT_EXCEL",
  "description": "Export Excel Data Lengkap: 75 records (2024-01-01 - 2024-12-31)",
  "cabang_id": 1,
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "performed_by": 123,
  "created_at": "2024-12-14 10:35:00"
}
```

### 3. Export Backup JSON
```json
{
  "user_id": 456,
  "action": "EXPORT_BACKUP",
  "description": "Export Backup JSON: 200 records",
  "cabang_id": 2,
  "ip_address": "192.168.1.101",
  "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "performed_by": 456,
  "created_at": "2024-12-14 11:00:00"
}
```

### 4. Export Backup dengan Filter Tanggal
```json
{
  "user_id": 456,
  "action": "EXPORT_BACKUP",
  "description": "Export Backup JSON: 50 records (2024-06-01 - 2024-06-30)",
  "cabang_id": 2,
  "ip_address": "192.168.1.101",
  "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "performed_by": 456,
  "created_at": "2024-12-14 11:05:00"
}
```

### 5. Import Data Berhasil
```json
{
  "user_id": 789,
  "action": "IMPORT_DATA",
  "description": "Import Data: 25 berhasil, 5 dilewati dari 30 total",
  "cabang_id": 3,
  "ip_address": "192.168.1.102",
  "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
  "performed_by": 789,
  "created_at": "2024-12-14 14:20:00"
}
```

### 6. Import Data Tanpa Skip
```json
{
  "user_id": 789,
  "action": "IMPORT_DATA",
  "description": "Import Data: 15 berhasil, 0 dilewati dari 15 total",
  "cabang_id": 3,
  "ip_address": "192.168.1.102",
  "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
  "performed_by": 789,
  "created_at": "2024-12-14 14:25:00"
}
```

### 7. Delete Data - Admin Cabang
```json
{
  "user_id": 321,
  "action": "DELETE_DATA",
  "description": "Hapus data pending: 10 records",
  "cabang_id": 1,
  "ip_address": "192.168.1.103",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "performed_by": 321,
  "created_at": "2024-12-14 15:00:00"
}
```

### 8. Delete Data - Super Admin (Cabang Spesifik)
```json
{
  "user_id": 1,
  "action": "DELETE_DATA",
  "description": "Hapus data ditolak: 5 records dari Cabang Sleman",
  "cabang_id": 1,
  "ip_address": "192.168.1.104",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "performed_by": 1,
  "created_at": "2024-12-14 15:30:00"
}
```

### 9. Delete Data - Super Admin (Semua Cabang)
```json
{
  "user_id": 1,
  "action": "DELETE_DATA",
  "description": "Hapus semua data: 50 records dari semua cabang",
  "cabang_id": 1,
  "ip_address": "192.168.1.104",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "performed_by": 1,
  "created_at": "2024-12-14 16:00:00"
}
```

## Cara Melihat Log

### 1. Melalui API Endpoint
```
GET /api/user-logs?page=1&limit=10
```

### 2. Role-based Access
- **Super Admin**: Bisa melihat semua log dari semua cabang
- **Admin Cabang**: Hanya bisa melihat log dari cabang sendiri

### 3. Contoh Response API
```json
{
  "success": true,
  "data": [
    {
      "id": 1001,
      "action": "EXPORT_EXCEL",
      "description": "Export Excel Data Lengkap: 150 records (2024-01-01 - 2024-12-31)",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "created_at": "2024-12-14T10:35:00.000Z",
      "target_username": "admin_cabang_1",
      "performed_by": "admin_cabang_1",
      "nama_cabang": "Cabang Utama"
    }
  ],
  "page": 1,
  "limit": 10
}
```

## Kegunaan Log untuk Audit

### 1. Tracking Aktivitas
- Siapa yang melakukan export/import/delete
- Kapan aktivitas dilakukan
- Dari mana (IP address) aktivitas dilakukan
- Berapa banyak data yang diproses

### 2. Security Monitoring
- Deteksi aktivitas mencurigakan
- Tracking akses tidak sah
- Monitoring bulk operations

### 3. Compliance & Reporting
- Audit trail untuk regulasi
- Laporan aktivitas user
- Tracking perubahan data

### 4. Troubleshooting
- Debug masalah import/export
- Tracking data yang hilang
- Investigasi error

## Best Practices

### 1. Log Retention
- Simpan log minimal 1 tahun
- Archive log lama secara berkala
- Backup log untuk disaster recovery

### 2. Monitoring
- Set up alerts untuk aktivitas bulk delete
- Monitor failed import attempts
- Track unusual export patterns

### 3. Privacy
- Jangan log data sensitif dalam description
- Anonymize IP address jika diperlukan
- Comply dengan regulasi data protection