# Captcha Implementation - Math Based

## Overview
Implementasi captcha menggunakan matematika sederhana tanpa dependency eksternal untuk menghindari masalah deployment.

## Alur Captcha

### 1. Frontend Request Captcha
```
GET /api/captcha/generate
```

### 2. Backend Generate Math Problem
- Random math operation (+, -, ×)
- Angka kecil (1-10) untuk kemudahan user
- Generate unique sessionId
- Store answer dengan sessionId

### 3. Frontend Display Question
- Tampilkan soal matematika
- User input jawaban
- Tombol refresh untuk soal baru

### 4. Frontend Submit Login
```
POST /api/auth/login
{
  username: string,
  password: string,
  captchaSessionId: string,
  captchaInput: string
}
```

### 5. Backend Validate
- Validasi captcha sebelum cek login
- Session one-time use
- Auto-delete setelah validasi
- Expire 5 menit

## Files Modified

### Backend
- `backend/controllers/captchaController.js` - Math captcha generator & validator
- `backend/routes/captchaRoutes.js` - Captcha routes
- `backend/controllers/authController.js` - Add captcha validation to login
- `backend/index.js` - Register captcha routes
- `backend/package.json` - No canvas dependency

### Frontend
- `dashboard/src/LoginPage.tsx` - Math captcha UI

## Security Features

1. **Session-based**: Setiap captcha punya sessionId unik
2. **One-time use**: Session dihapus setelah validasi
3. **Expiry**: Session expire setelah 5 menit
4. **Server-side validation**: Jawaban tidak pernah dikirim ke client
5. **Auto-refresh**: Captcha di-refresh otomatis jika salah

## Deployment Notes

### Why Math Captcha?
- **No Dependencies**: Tidak perlu canvas atau library native
- **Deployment Friendly**: Tidak ada masalah dengan native modules
- **User Friendly**: Lebih mudah untuk user
- **Accessible**: Screen reader friendly
- **Lightweight**: Tidak ada image processing

### Previous Issue
Canvas dependency menyebabkan deployment error karena:
- Native module compilation
- package-lock.json sync issues
- Platform-specific binaries

### Solution
Menggunakan math captcha yang:
- Pure JavaScript
- No native dependencies
- Easy to deploy
- Works everywhere

## Example Captchas

```
3 + 5 = ?  (answer: 8)
7 - 2 = ?  (answer: 5)
4 × 3 = ?  (answer: 12)
```

## Testing

### Local Testing
1. Start backend: `cd backend && npm start`
2. Start dashboard: `cd dashboard && npm run dev`
3. Try login with captcha

### Production
- No special configuration needed
- Works on all platforms
- No build-time dependencies

## Future Improvements

1. Add more operation types
2. Configurable difficulty
3. Rate limiting per IP
4. Captcha attempt tracking
5. Alternative captcha types (text-based)
