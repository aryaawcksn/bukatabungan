import pool from "../config/db.js";
import { sendEmailNotification } from "../services/emailService.js";
import { sendWhatsAppNotification } from "../services/whatsappService.js";

/**
 * Helper function to convert empty strings to null
 * This is needed because PostgreSQL doesn't accept empty strings for date/numeric fields
 */
const emptyToNull = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
};

/**
 * Membuat pengajuan baru dengan schema database baru (Multi-table)
 */
export const createPengajuan = async (req, res) => {
  const client = await pool.connect();

  try {
    console.log("📥 Received request body:", JSON.stringify(req.body, null, 2));

    const {
      // Data Diri (cdd_self)
      nama,
      nama_lengkap, // fallback
      alias,
      jenis_id = 'KTP',
      no_id,
      nik, // fallback for no_id
      berlaku_id,
      tempat_lahir,
      tanggal_lahir,
      alamat_id,
      alamat, // fallback for alamat_id
      kode_pos_id,
      kode_pos, // fallback
      alamat_now,
      alamat_domisili, // fallback for alamat_now
      jenis_kelamin,
      status_kawin,
      status_pernikahan, // fallback
      agama,
      pendidikan,
      nama_ibu_kandung,
      npwp,
      email,
      no_hp,
      kewarganegaraan,
      status_rumah,

      // Pekerjaan (cdd_job)
      pekerjaan,
      penghasilan, // gaji_per_bulan
      sumber_dana,
      rata_rata_transaksi,
      nama_perusahaan,
      tempat_bekerja, // fallback
      alamat_kantor, // alamat_perusahaan
      telepon_perusahaan,
      jabatan,
      bidang_usaha,
      referensi_nama,
      referensi_alamat,
      referensi_telepon,
      referensi_hubungan,

      // Account
      jenis_rekening, // tabungan_tipe
      nominal_setoran,
      jenis_kartu, // atm_tipe
      tujuan_rekening, // tujuan_pembukaan

      // Kontak Darurat (cdd_reference)
      kontak_darurat_nama,
      kontak_darurat_hp,
      kontak_darurat_hubungan,

      // Account ownership
      rekening_untuk_sendiri = true,

      // Beneficial Owner
      bo_nama,
      bo_alamat,
      bo_tempat_lahir,
      bo_tanggal_lahir,
      bo_jenis_id,
      bo_nomor_id,
      bo_pekerjaan,
      bo_pendapatan_tahun,
      bo_persetujuan,

      // System
      cabang_id
    } = req.body;

    // Normalisasi value utama
    const finalNama = nama || nama_lengkap;
    const finalNoId = no_id || nik;
    const finalAlamatId = alamat_id || alamat;
    const finalKodePosId = kode_pos_id || kode_pos;
    const finalAlamatNow = alamat_now || alamat_domisili || finalAlamatId;
    const finalStatusKawin = status_kawin || status_pernikahan;
    const finalNamaPerusahaan = nama_perusahaan || tempat_bekerja;
    const finalAlamatPerusahaan = alamat_kantor; // asumsi nama field di frontend
    const finalGaji = penghasilan;

    // Validasi field required
    if (!finalNama || !finalNoId || !email || !no_hp || !tanggal_lahir || !cabang_id) {
      console.error("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Field wajib tidak lengkap (Nama, NIK, Email, HP, Tgl Lahir, Cabang)."
      });
    }

    // Generate Request ID / Kode Referensi
    const kode_referensi = `REG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await client.query('BEGIN');

    // 1. Insert Parent: pengajuan_tabungan
    // Note: status default null/pending. phone disimpan di root juga untuk easy access.
    const insertPengajuanQuery = `
      INSERT INTO pengajuan_tabungan (cabang_id, status, created_at)
      VALUES ($1, 'pending', NOW())
      RETURNING id
    `;
    const pengajuanRes = await client.query(insertPengajuanQuery, [cabang_id]);
    const pengajuanId = pengajuanRes.rows[0].id;
    console.log(`✅ Created pengajuan_tabungan ID: ${pengajuanId}`);

    // 2. Insert cdd_self
    const insertCddSelfQuery = `
      INSERT INTO cdd_self (
        pengajuan_id, kode_referensi, nama, alias, jenis_id, no_id, berlaku_id,
        tempat_lahir, tanggal_lahir, alamat_id, kode_pos_id, alamat_now,
        jenis_kelamin, status_kawin, agama, pendidikan, nama_ibu_kandung,
        npwp, email, no_hp, kewarganegaraan, status_rumah, rekening_untuk_sendiri, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, NOW()
      )
    `;
    const cddSelfValues = [
      pengajuanId, kode_referensi, finalNama, emptyToNull(alias), jenis_id, finalNoId, emptyToNull(berlaku_id),
      tempat_lahir, tanggal_lahir, finalAlamatId, finalKodePosId, finalAlamatNow,
      jenis_kelamin, finalStatusKawin, agama, pendidikan, nama_ibu_kandung,
      emptyToNull(npwp), email, no_hp, kewarganegaraan, status_rumah, rekening_untuk_sendiri
    ];
    await client.query(insertCddSelfQuery, cddSelfValues);

    // 3. Insert cdd_job
    const insertCddJobQuery = `
      INSERT INTO cdd_job (
        pengajuan_id, pekerjaan, gaji_per_bulan, sumber_dana, rata_rata_transaksi,
        nama_perusahaan, alamat_perusahaan, telepon_perusahaan, jabatan, bidang_usaha,
        referensi_nama, referensi_alamat, referensi_telepon, referensi_hubungan, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
    `;
    const cddJobValues = [
      pengajuanId, pekerjaan, finalGaji, sumber_dana, emptyToNull(rata_rata_transaksi),
      emptyToNull(finalNamaPerusahaan), emptyToNull(finalAlamatPerusahaan), emptyToNull(telepon_perusahaan), 
      emptyToNull(jabatan), emptyToNull(bidang_usaha),
      emptyToNull(referensi_nama), emptyToNull(referensi_alamat), emptyToNull(referensi_telepon), emptyToNull(referensi_hubungan)
    ];
    await client.query(insertCddJobQuery, cddJobValues);

    // 4. Insert account
    const insertAccountQuery = `
      INSERT INTO account (
        pengajuan_id, tabungan_tipe, atm, atm_tipe,
        nominal_setoran, tujuan_pembukaan, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;
    // ATM logic: jika jenis_kartu ada, asumsikan ATM yes.
    const hasAtm = !!jenis_kartu;
    await client.query(insertAccountQuery, [
      pengajuanId, jenis_rekening, hasAtm, jenis_kartu, nominal_setoran, tujuan_rekening
    ]);

    // 5. Insert cdd_reference (Emergency Contact)
    if (kontak_darurat_nama) {
      const insertRefQuery = `
        INSERT INTO cdd_reference (
          pengajuan_id, nama, no_hp, hubungan, created_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `;
      await client.query(insertRefQuery, [
        pengajuanId, kontak_darurat_nama, kontak_darurat_hp, kontak_darurat_hubungan
      ]);
    }

    // 6. Insert beneficial owner (only if account is for others, NOT for self, and BO data is provided)
    if (rekening_untuk_sendiri === false && bo_nama) {
      const insertBoQuery = `
        INSERT INTO bo (
          pengajuan_id, nama, alamat, tempat_lahir, tanggal_lahir,
          jenis_id, nomor_id, pekerjaan, pendapatan_tahunan, persetujuan, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      `;
      await client.query(insertBoQuery, [
        pengajuanId, bo_nama, bo_alamat, emptyToNull(bo_tempat_lahir), emptyToNull(bo_tanggal_lahir),
        emptyToNull(bo_jenis_id), emptyToNull(bo_nomor_id), emptyToNull(bo_pekerjaan), 
        emptyToNull(bo_pendapatan_tahun), bo_persetujuan
      ]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: "Pengajuan berhasil disimpan",
      kode_referensi,
      data: {
        id: pengajuanId,
        kode_referensi
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Error creating pengajuan:", err);

    let errorMessage = err.message;
    // Simple error mapping
    if (err.code === '23505') errorMessage = "Data duplikat terdeteksi (NIK/Email/HP mungkin sudah ada).";

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? err : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * Mengambil satu pengajuan berdasarkan ID
 * Melakukan JOIN ke tabel-tabel terkait
 */
export const getPengajuanById = async (req, res) => {
  try {
    const { id } = req.params;
    const adminCabang = req.user.cabang_id; // cabang dari token login (jika admin)

    // Note: Kita gunakan LEFT JOIN agar jika component data hilang, data utama tetap muncul
    // Alias disesuaikan agar frontend tidak perlu banyak perubahan
    const query = `
      SELECT
    p.id,
      p.status,
      p.created_at,
      p.approved_at,
      p.rejected_at,
      ua.username AS "approvedBy",
        ur.username AS "rejectedBy",
          --Self Data
    cs.kode_referensi,
      cs.nama AS nama_lengkap,
        cs.no_id AS nik,
          cs.email,
          cs.no_hp,
          cs.tempat_lahir,
          cs.tanggal_lahir,
          cs.alamat_id AS alamat, --KTP address
    cs.alamat_now AS alamat_domisili,
      cs.kode_pos_id AS kode_pos,
        cs.jenis_kelamin,
        cs.status_kawin AS status_pernikahan,
          cs.agama,
          cs.pendidikan,
          cs.nama_ibu_kandung,
          cs.npwp,
          cs.kewarganegaraan,
          cs.status_rumah,
          --Job Data
    cj.pekerjaan,
      cj.gaji_per_bulan AS penghasilan,
        cj.sumber_dana,
        cj.rata_rata_transaksi,
        cj.nama_perusahaan AS tempat_bekerja,
          cj.alamat_perusahaan AS alamat_kantor,
            cj.telepon_perusahaan,
            cj.jabatan,
            cj.bidang_usaha,
            cj.referensi_nama,
            cj.referensi_alamat,
            cj.referensi_telepon,
            cj.referensi_hubungan,
            --Account Data
    acc.tabungan_tipe AS jenis_rekening,
      acc.nominal_setoran,
      acc.atm_tipe AS jenis_kartu,
        acc.tujuan_pembukaan AS tujuan_rekening,
          --Ref Data
    cref.nama AS kontak_darurat_nama,
      cref.no_hp AS kontak_darurat_hp,
        cref.hubungan AS kontak_darurat_hubungan,
          --Beneficial Owner Data
    cbo.nama AS bo_nama,
      cbo.alamat AS bo_alamat,
        cbo.tempat_lahir AS bo_tempat_lahir,
        cbo.tanggal_lahir AS bo_tanggal_lahir,
          cbo.jenis_id AS bo_jenis_id,
          cbo.nomor_id AS bo_nomor_id,
          cbo.pekerjaan AS bo_pekerjaan,
          cbo.pendapatan_tahunan AS bo_pendapatan_tahun,
          cbo.persetujuan AS bo_persetujuan,
          --Cabang info
    p.cabang_id,
      c.nama_cabang
      FROM pengajuan_tabungan p
      LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
      LEFT JOIN cdd_job cj ON p.id = cj.pengajuan_id
      LEFT JOIN account acc ON p.id = acc.pengajuan_id
      LEFT JOIN cdd_reference cref ON p.id = cref.pengajuan_id
      LEFT JOIN bo cbo ON p.id = cbo.pengajuan_id
      LEFT JOIN cabang c ON p.cabang_id = c.id
      LEFT JOIN users ua ON p.approved_by = ua.id
      LEFT JOIN users ur ON p.rejected_by = ur.id
      WHERE p.id = $1 AND p.cabang_id = $2
      `;

    const result = await pool.query(query, [id, adminCabang]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Pengajuan tidak ditemukan" });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Mengambil semua pengajuan berdasarkan cabang admin
 */
export const getAllPengajuan = async (req, res) => {
  try {
    const adminCabang = req.user.cabang_id;

    // Query list usually needs fewer fields
    const query = `
      SELECT 
        p.id,
        p.status,
        p.created_at,
        p.approved_at,
        p.rejected_at,
        cs.kode_referensi,
        cs.nama AS nama_lengkap,
        cs.no_hp,
        cs.email,
        acc.tabungan_tipe AS jenis_rekening,
        c.nama_cabang,
        ua.username AS "approvedBy",
        ur.username AS "rejectedBy"
      FROM pengajuan_tabungan p
      LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
      LEFT JOIN account acc ON p.id = acc.pengajuan_id
      LEFT JOIN cabang c ON p.cabang_id = c.id
      LEFT JOIN users ua ON p.approved_by = ua.id
      LEFT JOIN users ur ON p.rejected_by = ur.id
      WHERE p.cabang_id = $1
      ORDER BY p.created_at DESC
    `;

    const result = await pool.query(query, [adminCabang]);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update status pengajuan dan kirim notifikasi
 * (Logic update status masih sama, hanya target tabel yg perlu dipastikan 'pengajuan_tabungan')
 */
export const updatePengajuanStatus = async (req, res) => {
  const { id } = req.params;
  const { status, sendEmail, sendWhatsApp, message } = req.body;

  try {
    let query, values;

    if (status === 'approved') {
      query = `
        UPDATE pengajuan_tabungan 
        SET status = $1, approved_by = $2, approved_at = NOW(), rejected_by = NULL, rejected_at = NULL
        WHERE id = $3 AND cabang_id = $4
    RETURNING *;
    `;
      values = [status, req.user.id, id, req.user.cabang_id];
    }
    else if (status === 'rejected') {
      query = `
        UPDATE pengajuan_tabungan 
        SET status = $1, rejected_by = $2, rejected_at = NOW(), approved_by = NULL, approved_at = NULL
        WHERE id = $3 AND cabang_id = $4
    RETURNING *;
    `;
      values = [status, req.user.id, id, req.user.cabang_id];
    } else {
      query = `
        UPDATE pengajuan_tabungan 
        SET status = $1, approved_by = NULL, approved_at = NULL, rejected_by = NULL, rejected_at = NULL
        WHERE id = $2 AND cabang_id = $3
    RETURNING *;
    `;
      values = [status, id, req.user.cabang_id];
    }

    const result = await pool.query(query, values);

    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: "Data tidak ditemukan atau akses ditolak" });

    // Ambil data user untuk notifikasi
    const userDetails = await pool.query(
      'SELECT nama, email, no_hp FROM cdd_self WHERE pengajuan_id = $1',
      [id]
    );

    if (userDetails.rows.length > 0) {
      const { nama, email, no_hp } = userDetails.rows[0];

      if (sendEmail && email)
        sendEmailNotification(email, nama, status, message).catch(e => console.error("Email fail:", e.message));

      if (sendWhatsApp && no_hp)
        sendWhatsAppNotification(no_hp, nama, status, message).catch(e => console.error("WA fail:", e.message));
    }

    res.json({ success: true, message: "Status diperbarui dan notifikasi dikirim" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

