# Deployment Guide - FormSimpel Fixes

## 🎯 Pre-Deployment Checklist

- [ ] Backup database
- [ ] Review all code changes
- [ ] Test in development environment
- [ ] Verify migration script
- [ ] Check environment variables

## 📦 Deployment Steps

### Step 1: Backup Database

```bash
# PostgreSQL backup
pg_dump -U username -d database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# Atau menggunakan pg_dump dengan compression
pg_dump -U username -d database_name | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Step 2: Pull Latest Code

```bash
# Pull dari repository
git pull origin main

# Atau jika menggunakan branch tertentu
git checkout feature/formsimpel-fixes
git pull origin feature/formsimpel-fixes
```

### Step 3: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 4: Run Database Migration

```bash
cd backend

# Jalankan migration
psql -U your_username -d your_database -f migrations/001_add_missing_fields.sql

# Atau jika menggunakan migration tool
npm run migrate
```

### Step 5: Verify Migration

```bash
# Cek kolom baru di cdd_self
psql -U username -d database -c "
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'cdd_self' 
AND column_name = 'rekening_untuk_sendiri';
"

# Cek kolom baru di bo
psql -U username -d database -c "
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bo' 
AND column_name IN ('pendapatan_tahunan', 'persetujuan');
"

# Cek kolom baru di cdd_job
psql -U username -d database -c "
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cdd_job' 
AND column_name IN ('rata_rata_transaksi', 'telepon_perusahaan', 'referensi_nama');
"

# Cek kolom baru di account
psql -U username -d database -c "
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'account' 
AND column_name = 'nominal_setoran';
"
```

### Step 6: Build Frontend

```bash
cd frontend

# Build production
npm run build

# Hasil build ada di folder dist/
```

### Step 7: Restart Services

```bash
# Restart backend (tergantung setup)
# Jika menggunakan PM2:
pm2 restart backend

# Jika menggunakan systemd:
sudo systemctl restart backend-service

# Jika manual:
cd backend
npm start

# Deploy frontend (tergantung hosting)
# Jika menggunakan Vercel/Netlify, push ke repository akan auto-deploy
# Jika manual, copy folder dist/ ke web server
```

## 🧪 Post-Deployment Testing

### 1. Smoke Test

```bash
# Test backend health
curl http://your-backend-url/health

# Test frontend
curl http://your-frontend-url
```

### 2. Functional Test

#### Test Validasi
1. Buka form Simpel
2. Input NIK invalid → harus muncul error
3. Perbaiki NIK → error harus hilang
4. Ulangi untuk Email dan Phone

#### Test Identity Type
1. Pilih "KTP" → label harus "NIK / KIA"
2. Pilih "Paspor" → label harus "Nomor Paspor"
3. Ganti jenis identitas → input harus ter-clear

#### Test Beneficial Owner
1. Pilih "Ya, untuk saya sendiri" → section BO harus TIDAK muncul
2. Submit form
3. Cek database: tidak ada data BO untuk pengajuan ini

4. Buat pengajuan baru
5. Pilih "Tidak, untuk orang lain" → section BO harus muncul
6. Isi semua field BO
7. Submit form
8. Cek database: data BO harus tersimpan di tabel `bo`

### 3. Database Verification

```sql
-- Cek data terbaru
SELECT 
  p.id,
  p.kode_referensi,
  cs.nama,
  cs.rekening_untuk_sendiri,
  bo.nama AS bo_nama,
  bo.pendapatan_tahunan
FROM pengajuan_tabungan p
LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
LEFT JOIN bo ON p.id = bo.pengajuan_id
ORDER BY p.created_at DESC
LIMIT 5;
```

## 🔄 Rollback Plan

Jika terjadi masalah, ikuti langkah berikut:

### Step 1: Restore Code

```bash
# Kembali ke commit sebelumnya
git log --oneline  # Cari commit hash sebelum changes
git checkout <commit-hash>

# Atau revert changes
git revert <commit-hash>
```

### Step 2: Rollback Database

```bash
# Jalankan rollback script
cd backend
psql -U username -d database -f migrations/001_add_missing_fields_rollback.sql

# Atau restore dari backup
psql -U username -d database < backup_file.sql
```

### Step 3: Restart Services

```bash
# Restart backend
pm2 restart backend

# Rebuild dan deploy frontend
cd frontend
npm run build
# Deploy sesuai hosting
```

## 📊 Monitoring

### Metrics to Watch

1. **Error Rate**
   - Monitor backend error logs
   - Check frontend console errors
   - Track failed form submissions

2. **Performance**
   - Form load time
   - Validation response time
   - Database query performance

3. **User Behavior**
   - Form completion rate
   - Validation error frequency
   - BO section usage (Ya vs Tidak)

### Log Locations

```bash
# Backend logs
tail -f backend/logs/app.log

# PM2 logs
pm2 logs backend

# Database logs
tail -f /var/log/postgresql/postgresql-*.log
```

## 🚨 Emergency Contacts

- **Backend Developer:** [Contact Info]
- **Frontend Developer:** [Contact Info]
- **Database Admin:** [Contact Info]
- **DevOps:** [Contact Info]

## 📝 Deployment Checklist

### Pre-Deployment
- [x] Code reviewed
- [x] Tests passed
- [x] Database backup created
- [x] Migration script verified
- [x] Rollback plan prepared

### During Deployment
- [ ] Code pulled/deployed
- [ ] Dependencies installed
- [ ] Migration executed
- [ ] Migration verified
- [ ] Services restarted
- [ ] Frontend built and deployed

### Post-Deployment
- [ ] Smoke tests passed
- [ ] Functional tests passed
- [ ] Database verification done
- [ ] Monitoring active
- [ ] Team notified
- [ ] Documentation updated

## 📅 Deployment Schedule

**Recommended Time:** Off-peak hours (e.g., 2 AM - 4 AM)

**Estimated Duration:** 30-45 minutes

**Maintenance Window:** 1 hour

## 🎉 Success Criteria

Deployment is successful when:
- ✅ All migrations applied without errors
- ✅ Backend starts without errors
- ✅ Frontend loads correctly
- ✅ All functional tests pass
- ✅ No critical errors in logs
- ✅ Database queries return expected results
- ✅ Form submissions work correctly

## 📞 Support

For deployment issues:
1. Check this guide first
2. Review error logs
3. Contact team lead
4. Escalate to DevOps if needed
