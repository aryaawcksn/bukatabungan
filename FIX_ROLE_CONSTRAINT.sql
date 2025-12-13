-- SQL untuk memperbaiki constraint role di tabel users
-- Jalankan query ini di database PostgreSQL Anda

-- 1. Cek constraint yang ada saat ini
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass AND contype = 'c';

-- 2. Drop constraint lama (ganti 'users_role_check' dengan nama constraint yang sebenarnya jika berbeda)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 3. Tambah constraint baru yang include super_admin
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('employement', 'admin_cabang', 'super_admin'));

-- 4. Verifikasi constraint baru
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass AND contype = 'c';

-- 5. Sekarang insert super admin (setelah constraint diperbaiki)
INSERT INTO users (username, password, role, cabang_id, created_at) 
VALUES (
    'superadmin', 
    '$2b$10$OUVb4RDMIlsdemihJM8i5eL29m7Dt6K3zFwFE/4fjb5HLaRSkVFle', 
    'super_admin', 
    1, -- Ganti dengan ID cabang yang ada di sistem Anda
    NOW()
);

-- 6. Verifikasi user berhasil dibuat
SELECT id, username, role, cabang_id, created_at 
FROM users 
WHERE username = 'superadmin';

/*
LANGKAH-LANGKAH:
1. Jalankan query 1 untuk cek constraint yang ada
2. Jalankan query 2 untuk drop constraint lama
3. Jalankan query 3 untuk buat constraint baru dengan super_admin
4. Jalankan query 4 untuk verifikasi constraint baru
5. Jalankan query 5 untuk insert super admin
6. Jalankan query 6 untuk verifikasi user berhasil dibuat

INFORMASI LOGIN SETELAH BERHASIL:
- Username: superadmin
- Password: superadmin123
- Role: super_admin
*/