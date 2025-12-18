# Implementasi Sistem Captcha untuk Keamanan

## Overview
Sistem captcha telah diimplementasikan untuk melindungi aplikasi dari otomatisasi ilegal dan serangan bot pada tiga area utama:
1. **Dashboard Login** - Melindungi akses admin
2. **Status Tracking** - Melindungi pengecekan status pengajuan
3. **Form Submission** - Melindungi pengajuan formulir baru

## Fitur Keamanan

### 1. Math Captcha
- Menggunakan perhitungan matematika sederhana (penjumlahan, pengurangan, perkalian)
- Jawaban numerik yang mudah dipahami manusia tapi sulit untuk bot
- Token unik untuk setiap captcha yang dibuat

### 2. Rate Limiting
- **Login**: Maksimal 5 percobaan per 15 menit
- **Status Check**: Maksimal 10 percobaan per 5 menit  
- **Form Submission**: Maksimal 3 percobaan per 10 menit
- **Captcha Generation**: Maksimal 20 permintaan per 15 menit

### 3. Deteksi Aktivitas Mencurigakan
- Deteksi user agent bot (crawler, scraper, automation tools)
- Deteksi permintaan berlebihan dalam waktu singkat
- Otomatis memerlukan captcha jika aktivitas mencurigakan terdeteksi

### 4. Session Management
- Captcha memiliki masa berlaku 10 menit
- Maksimal 3 percobaan per captcha
- Token captcha dihapus setelah verifikasi berhasil

## Implementasi Backend

### Files yang Dibuat:
- `backend/utils/captcha.js` - Logika captcha dan rate limiting
- `backend/routes/captchaRoutes.js` - API endpoints untuk captcha
- `backend/middleware/captchaMiddleware.js` - Middleware untuk proteksi route

### API Endpoints:
- `GET /api/captcha/generate` - Generate captcha baru
- `POST /api/captcha/verify` - Verifikasi jawaban captcha

### Protected Routes:
- `POST /api/auth/login` - Login dengan captcha setelah 2 percobaan gagal
- `POST /api/pengajuan` - Form submission dengan captcha wajib
- `GET /api/pengajuan/status/:code` - Status check dengan rate limiting

## Implementasi Frontend

### Components yang Dibuat:
- `frontend/src/components/Captcha.tsx` - Komponen captcha untuk frontend
- `dashboard/src/components/Captcha.tsx` - Komponen captcha untuk dashboard
- `dashboard/src/components/LoginForm.tsx` - Form login dengan captcha

### Integrasi:
- **AccountForm.tsx**: Captcha ditampilkan di step 5 (review) sebelum submit
- **StatusCheck.tsx**: Captcha ditampilkan jika rate limit terlampaui
- **LoginForm.tsx**: Captcha ditampilkan setelah beberapa percobaan login gagal

## Cara Kerja

### 1. Dashboard Login
```typescript
// Captcha diperlukan jika:
// - Lebih dari 2 percobaan login gagal
// - Aktivitas mencurigakan terdeteksi
// - Rate limit terlampaui

const loginData = {
  username,
  password,
  ...(requireCaptcha && {
    captchaToken: captchaData.token,
    captchaAnswer: captchaData.answer
  })
};
```

### 2. Form Submission
```typescript
// Captcha selalu diperlukan untuk form submission
// Ditampilkan di step 5 (review) sebelum submit

const submitData = {
  // ... form data
  ...(requireCaptcha && {
    captchaToken: captchaData.token,
    captchaAnswer: captchaData.answer
  })
};
```

### 3. Status Check
```typescript
// Captcha diperlukan jika rate limit terlampaui
// 10 permintaan per 5 menit per IP

if (response.status === 429) {
  setRequireCaptcha(true);
}
```

## Konfigurasi Rate Limiting

### Login Protection:
- **Threshold**: 5 percobaan per 15 menit
- **Captcha Required**: Setelah 2 percobaan gagal
- **Lockout**: 15 menit setelah 5 percobaan gagal

### Status Check Protection:
- **Threshold**: 10 permintaan per 5 menit
- **Response**: HTTP 429 dengan pesan error

### Form Submission Protection:
- **Threshold**: 3 percobaan per 10 menit
- **Captcha**: Selalu diperlukan
- **Additional**: Deteksi aktivitas mencurigakan

## Keamanan Tambahan

### 1. IP-based Tracking
- Semua rate limiting berdasarkan IP address
- Mendukung proxy dengan `trust proxy` setting

### 2. User Agent Analysis
- Deteksi bot berdasarkan user agent string
- Blacklist untuk tools automation umum

### 3. Temporal Analysis
- Deteksi permintaan terlalu cepat (>10 per menit)
- Automatic cleanup data lama

### 4. Token Security
- Token captcha menggunakan crypto.randomBytes
- Tidak dapat diprediksi atau di-bruteforce

## Monitoring & Maintenance

### Cleanup Otomatis:
- Captcha data dibersihkan setiap 10 menit
- Rate limit data dibersihkan setiap 1 jam
- Activity tracking dibersihkan setiap 1 jam

### Logging:
- Semua percobaan login dicatat
- Aktivitas mencurigakan dicatat
- Rate limit violations dicatat

## Testing

### Manual Testing:
1. **Login**: Coba login dengan password salah 3x untuk memicu captcha
2. **Status Check**: Refresh halaman status >10x dalam 5 menit
3. **Form Submit**: Captcha selalu muncul di step 5

### Automated Testing:
- Test rate limiting dengan multiple requests
- Test captcha generation dan verification
- Test suspicious activity detection

## Troubleshooting

### Captcha Tidak Muncul:
- Periksa network requests ke `/api/captcha/generate`
- Periksa console untuk error JavaScript
- Pastikan backend captcha routes aktif

### Rate Limit Terlalu Ketat:
- Adjust nilai di `captchaMiddleware.js`
- Sesuaikan dengan kebutuhan traffic normal

### False Positive Bot Detection:
- Review pattern di `detectSuspiciousActivity`
- Whitelist user agent yang legitimate

## Kesimpulan

Sistem captcha ini memberikan perlindungan berlapis:
1. **Preventive**: Mencegah akses otomatis dengan captcha
2. **Detective**: Mendeteksi pola aktivitas mencurigakan  
3. **Responsive**: Rate limiting untuk membatasi abuse
4. **User-Friendly**: Math captcha yang mudah untuk manusia

Implementasi ini efektif melindungi dari:
- ✅ Bot automation
- ✅ Brute force attacks  
- ✅ Spam submissions
- ✅ Scraping attempts
- ✅ DDoS attacks (basic level)

Sistem dapat disesuaikan lebih lanjut berdasarkan pola traffic dan kebutuhan keamanan spesifik.