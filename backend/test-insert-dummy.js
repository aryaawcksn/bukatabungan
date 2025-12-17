import pool from "./config/db.js";

async function insertDummyData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Generate test reference code
    const kode_referensi = `TEST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    console.log('🧪 Creating dummy pengajuan with reference:', kode_referensi);
    
    // 1. Insert pengajuan_tabungan
    const pengajuanResult = await client.query(`
      INSERT INTO pengajuan_tabungan (cabang_id, status, created_at)
      VALUES (1, 'pending', NOW())
      RETURNING id
    `);
    
    const pengajuanId = pengajuanResult.rows[0].id;
    console.log('✅ Pengajuan created with ID:', pengajuanId);
    
    // 2. Insert cdd_self
    await client.query(`
      INSERT INTO cdd_self (
        pengajuan_id, kode_referensi, nama, jenis_id, no_id,
        tempat_lahir, tanggal_lahir, alamat_id, alamat_now,
        jenis_kelamin, status_kawin, agama, pendidikan, nama_ibu_kandung,
        email, no_hp, kewarganegaraan, rekening_untuk_sendiri,
        tipe_nasabah, created_at
      ) VALUES (
        $1, $2, 'John Doe Test', 'KTP', '1234567890123456',
        'Jakarta', '1990-01-01', 'Jl. Test No. 123', 'Jl. Test No. 123',
        'Laki-laki', 'Belum Kawin', 'Islam', 'S-1', 'Jane Doe',
        'test@example.com', '081234567890', 'Indonesia', true,
        'baru', NOW()
      )
    `, [pengajuanId, kode_referensi]);
    
    console.log('✅ CDD Self data inserted');
    
    // 3. Insert cdd_job
    await client.query(`
      INSERT INTO cdd_job (
        pengajuan_id, pekerjaan, gaji_per_bulan, sumber_dana,
        nama_perusahaan, alamat_perusahaan, jabatan, bidang_usaha, created_at
      ) VALUES (
        $1, 'Karyawan Swasta', '5000000', 'Gaji',
        'PT Test Company', 'Jl. Office No. 456', 'Software Engineer', 'Teknologi', NOW()
      )
    `, [pengajuanId]);
    
    console.log('✅ CDD Job data inserted');
    
    // 4. Insert account
    await client.query(`
      INSERT INTO account (
        pengajuan_id, tabungan_tipe, atm, atm_tipe,
        nominal_setoran, tujuan_pembukaan, created_at
      ) VALUES (
        $1, 'Mutiara', true, 'Gold', '50000', 'Menabung', NOW()
      )
    `, [pengajuanId]);
    
    console.log('✅ Account data inserted');
    
    await client.query('COMMIT');
    
    console.log('🎉 Dummy data created successfully!');
    console.log('📋 Test with this reference code:', kode_referensi);
    console.log('🔗 Test URL: http://localhost:5175/status/' + kode_referensi);
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating dummy data:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

insertDummyData();