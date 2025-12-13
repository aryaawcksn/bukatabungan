-- SQL untuk membuat user Super Admin
-- Jalankan query ini di database PostgreSQL Anda

-- 1. Insert Super Admin User
INSERT INTO users (username, password, role, cabang_id, created_at) 
VALUES (
    'superadmin', 
    '$2b$10$OUVb4RDMIlsdemihJM8i5eL29m7Dt6K3zFwFE/4fjb5HLaRSkVFle', 
    'super_admin', 
    1, -- Ganti dengan ID cabang yang ada di sistem Anda
    NOW()
);

-- 2. Verifikasi user berhasil dibuat
SELECT id, username, role, cabang_id, created_at 
FROM users 
WHERE username = 'superadmin';

-- 3. Lihat semua cabang yang tersedia (untuk referensi cabang_id)
SELECT id, nama_cabang, is_active 
FROM cabang 
ORDER BY id;

/*
INFORMASI LOGIN:
- Username: superadmin
- Password: superadmin123
- Role: super_admin

CATATAN:
1. Pastikan cabang_id (dalam contoh ini: 1) sudah ada di tabel cabang
2. Jika cabang_id 1 tidak ada, ganti dengan ID cabang yang valid
3. Super admin bisa mengakses semua cabang dan semua fitur
4. Password sudah di-hash dengan bcrypt (salt rounds: 10)

TESTING:
1. Login dengan kredensial di atas
2. Cek apakah bisa lihat analytics semua cabang
3. Cek apakah bisa manage user dengan role super_admin
4. Cek apakah bisa assign user ke cabang mana saja
*/