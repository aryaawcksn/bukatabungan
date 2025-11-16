# Backend Server - Buka Tabungan

## Cara Menjalankan Backend

1. **Install dependencies** (jika belum):
   ```bash
   npm install
   ```

2. **Pastikan PostgreSQL berjalan** dan database `bukutabungan` sudah dibuat

3. **Buat file `.env`** (jika belum ada) dengan konfigurasi:
   ```
   PG_USER=postgres
   PG_HOST=localhost
   PG_DATABASE=bukutabungan
   PG_PASSWORD=12345
   PG_PORT=5432
   PORT=5000
   
   # Konfigurasi Email (Gmail)
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   
   # Konfigurasi WhatsApp (opsional)
   FONNTE_TOKEN=your-fonnte-token
   ```

   **Cara mendapatkan Gmail App Password:**
   1. Aktifkan 2-Step Verification di akun Google Anda
   2. Buka https://myaccount.google.com/apppasswords
   3. Pilih "Mail" dan "Other (Custom name)"
   4. Masukkan nama (contoh: "Bank Sleman App")
   5. Copy password yang dihasilkan dan masukkan ke `SMTP_PASS`

4. **Jalankan server**:
   ```bash
   npm start
   ```

   Atau:
   ```bash
   node index.js
   ```

5. **Server akan berjalan di**: `http://localhost:5000`

## Endpoints yang Tersedia

- `GET /api/cek-koneksi` - Test koneksi database
- `POST /api/pengajuan` - Submit form pengajuan tabungan
- `GET /api/pengajuan` - Ambil semua pengajuan
- `PUT /api/pengajuan/:id` - Update status pengajuan

## Troubleshooting

Jika mendapatkan error 404:
- Pastikan backend server sudah berjalan
- Cek apakah port 5000 tidak digunakan aplikasi lain
- Pastikan database PostgreSQL berjalan dan kredensial benar

