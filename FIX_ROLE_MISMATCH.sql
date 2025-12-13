-- Fix role mismatch: update 'super' to 'super_admin'

-- 1. Update constraint untuk include 'super_admin' (bukan 'super')
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('employement', 'admin_cabang', 'super_admin'));

-- 2. Update user yang role-nya 'super' menjadi 'super_admin'
UPDATE users 
SET role = 'super_admin' 
WHERE role = 'super';

-- 3. Verifikasi perubahan
SELECT id, username, role, cabang_id 
FROM users 
WHERE username = 'superadmin';

-- 4. Cek constraint baru
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass AND contype = 'c';

/*
HASIL YANG DIHARAPKAN:
- Role superadmin berubah dari 'super' ke 'super_admin'
- Constraint check sekarang allow: 'employement', 'admin_cabang', 'super_admin'
- Kode backend akan recognize role 'super_admin' dengan benar
*/