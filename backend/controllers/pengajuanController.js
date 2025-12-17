import pool from "../config/db.js";
import { sendEmailNotification } from "../services/emailService.js";
import { sendWhatsAppNotification } from "../services/whatsappService.js";
import { logUserActivity } from "./userLogController.js";

// In-memory progress store (in production, use Redis or database)
const importProgressStore = new Map();

/**
 * Update import progress
 */
const updateImportProgress = (sessionId, progress, message) => {
  importProgressStore.set(sessionId, {
    progress: Math.min(100, Math.max(0, progress)),
    message,
    timestamp: new Date()
  });
  // Progress tracking (removed verbose logging)
};

/**
 * Get import progress
 */
export const getImportProgress = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const progress = importProgressStore.get(sessionId);

    if (!progress) {
      return res.json({
        progress: 0,
        message: 'Session tidak ditemukan'
      });
    }

    res.json(progress);
  } catch (err) {
    console.error('❌ Get progress error:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil progress'
    });
  }
};

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
    // Request received (removed verbose logging)

    // Debug file creation removed

    // Identity processing

    const {
      // Data Diri (cdd_self)
      nama,
      nama_lengkap, // fallback
      alias,
      jenis_id = 'KTP',
      jenisIdCustom, // custom identity type from form
      no_id,
      nik, // fallback for no_id
      berlaku_id,
      tempat_lahir,
      tanggal_lahir,
      alamat_id,
      alamat, // fallback for alamat_id
      alamat_jalan, // street address (RT/RW)
      provinsi, // province from dropdown
      kota, // city from dropdown  
      kecamatan, // district from dropdown
      kelurahan, // village from dropdown
      kode_pos_id,
      kode_pos, // fallback
      alamat_now,
      alamat_domisili, // fallback for alamat_now
      jenis_kelamin,
      status_kawin,
      status_pernikahan, // fallback
      status_perkawinan, // additional fallback from form
      agama,
      pendidikan,
      nama_ibu_kandung,
      npwp,
      email,
      no_hp,
      kewarganegaraan,
      status_rumah,

      // Customer Type
      tipe_nasabah,
      nomor_rekening_lama,

      // Pekerjaan (cdd_job)
      pekerjaan,
      penghasilan, // gaji_per_bulan
      gaji_per_bulan, // additional field from form
      sumber_dana,
      rata_rata_transaksi,
      nama_perusahaan,
      tempat_bekerja, // fallback
      alamat_kantor, // alamat_perusahaan
      alamat_perusahaan, // additional field from form
      telepon_perusahaan,
      jabatan,
      bidang_usaha,


      // Account
      jenis_rekening, // tabungan_tipe
      tabungan_tipe, // additional field from form
      nominal_setoran,
      jenis_kartu, // atm_tipe
      card_type, // additional field from form
      tujuan_rekening, // tujuan_pembukaan
      tujuan_pembukaan, // additional field from form

      // Kontak Darurat (cdd_reference)
      kontak_darurat_nama,
      kontak_darurat_hp,
      kontak_darurat_alamat,
      kontak_darurat_hubungan,

      // Account ownership
      rekening_untuk_sendiri = true,

      // Beneficial Owner
      bo_nama,
      bo_alamat,
      bo_tempat_lahir,
      bo_tanggal_lahir,
      bo_jenis_kelamin,
      bo_kewarganegaraan,
      bo_status_pernikahan,
      bo_jenis_id,
      bo_nomor_id,
      bo_sumber_dana,
      bo_hubungan,
      bo_nomor_hp,
      bo_pekerjaan,
      bo_pendapatan_tahun,
      bo_persetujuan,

      // EDD Bank Lain (array of objects)
      edd_bank_lain,

      // EDD Pekerjaan Lain (array of objects)
      edd_pekerjaan_lain,

      // System
      cabang_id,
      cabang_pengambilan // additional field from form
    } = req.body;

    // Normalisasi value utama
    const finalNama = nama || nama_lengkap;
    const finalNoId = no_id || nik;
    const finalAlamatId = alamat_id || alamat;
    const finalKodePosId = kode_pos_id || kode_pos;
    const finalAlamatNow = alamat_now || alamat_domisili || finalAlamatId;
    const finalStatusKawin = status_kawin || status_pernikahan || status_perkawinan;
    const finalNamaPerusahaan = nama_perusahaan || tempat_bekerja;
    const finalAlamatPerusahaan = alamat_kantor || alamat_perusahaan;
    const finalGaji = penghasilan || gaji_per_bulan;
    const finalTipeNasabah = tipe_nasabah || 'baru';
    const finalCabangId = cabang_id || cabang_pengambilan;
    const finalJenisId = jenis_id === 'Lainnya' ? jenisIdCustom : jenis_id;

    // Data processing

    // Debug BO data
    // BO data processing


    // Validasi field required
    if (!finalNama || !finalNoId || !email || !no_hp || !tanggal_lahir || !finalCabangId) {
      console.error("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Field wajib tidak lengkap (Nama, NIK, Email, HP, Tgl Lahir, Cabang)."
      });
    }

    // Set default for jenis_rekening if empty (tabungan_tipe has NOT NULL constraint)
    const finalJenisRekening = jenis_rekening || tabungan_tipe || 'simpel';
    const finalJenisKartu = jenis_kartu || card_type;
    const finalTujuanRekening = tujuan_rekening || tujuan_pembukaan;

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
    const pengajuanRes = await client.query(insertPengajuanQuery, [parseInt(finalCabangId)]);
    const pengajuanId = pengajuanRes.rows[0].id;
    // Pengajuan created successfully

    // 2. Insert cdd_self
    const insertCddSelfQuery = `
      INSERT INTO cdd_self (
        pengajuan_id, kode_referensi, nama, alias, jenis_id, no_id, berlaku_id,
        tempat_lahir, tanggal_lahir, alamat_id, alamat_jalan, provinsi, kota, kecamatan, kelurahan, kode_pos_id, alamat_now,
        jenis_kelamin, status_kawin, agama, pendidikan, nama_ibu_kandung,
        npwp, email, no_hp, kewarganegaraan, status_rumah, rekening_untuk_sendiri,
        tipe_nasabah, nomor_rekening_lama, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22,
        $23, $24, $25, $26, $27, $28,
        $29, $30, NOW()
      )
    `;
    const cddSelfValues = [
      parseInt(pengajuanId), // Ensure pengajuan_id is integer
      kode_referensi,
      finalNama,
      emptyToNull(alias),
      finalJenisId,
      finalNoId,
      emptyToNull(berlaku_id), // NULL means "seumur hidup"
      tempat_lahir,
      tanggal_lahir,
      finalAlamatId,
      emptyToNull(alamat_jalan),
      emptyToNull(provinsi),
      emptyToNull(kota),
      emptyToNull(kecamatan),
      emptyToNull(kelurahan),
      finalKodePosId,
      finalAlamatNow,
      jenis_kelamin,
      finalStatusKawin,
      agama,
      pendidikan,
      nama_ibu_kandung,
      emptyToNull(npwp),
      email,
      no_hp,
      kewarganegaraan,
      status_rumah,
      rekening_untuk_sendiri,
      finalTipeNasabah,
      emptyToNull(nomor_rekening_lama)
    ];

    await client.query(insertCddSelfQuery, cddSelfValues);

    // 3. Insert cdd_job
    // Note: Using actual column names from database schema
    // rata_transaksi_per_bulan (not rata_rata_transaksi)
    // no_telepon (not telepon_perusahaan)
    // Reference contact fields are NOT in cdd_job table, they should be stored elsewhere or ignored
    const insertCddJobQuery = `
      INSERT INTO cdd_job (
        pengajuan_id, pekerjaan, gaji_per_bulan, sumber_dana, rata_transaksi_per_bulan,
        nama_perusahaan, alamat_perusahaan, no_telepon, jabatan, bidang_usaha, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    `;
    const cddJobValues = [
      parseInt(pengajuanId), // Ensure pengajuan_id is integer
      pekerjaan,
      finalGaji,
      sumber_dana,
      emptyToNull(rata_rata_transaksi),
      emptyToNull(finalNamaPerusahaan),
      emptyToNull(finalAlamatPerusahaan),
      emptyToNull(telepon_perusahaan),
      emptyToNull(jabatan),
      bidang_usaha || 'tidak bekerja'
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
    // Convert boolean to integer for PostgreSQL (true=1, false=0)
    const hasAtm = finalJenisKartu ? 1 : 0;
    await client.query(insertAccountQuery, [
      parseInt(pengajuanId), // Ensure pengajuan_id is integer
      finalJenisRekening, // Default to 'simpel' if empty, NOT NULL constraint
      hasAtm, // Integer: 1 or 0
      finalJenisKartu || null, // Use null if empty
      nominal_setoran || null, // Keep as string (VARCHAR in DB)
      finalTujuanRekening || null // Use null if empty
    ]);

    // 5. Insert cdd_reference (Emergency Contact)
    console.log("📞 Emergency Contact Debug:", {
      kontak_darurat_nama,
      kontak_darurat_alamat,
      kontak_darurat_hp,
      kontak_darurat_hubungan
    });

    if (kontak_darurat_nama) {
      const insertRefQuery = `
        INSERT INTO cdd_reference (
          pengajuan_id, nama, alamat, no_hp, hubungan, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
      `;
      await client.query(insertRefQuery, [
        parseInt(pengajuanId), // Ensure pengajuan_id is integer
        kontak_darurat_nama,
        emptyToNull(kontak_darurat_alamat),
        kontak_darurat_hp,
        kontak_darurat_hubungan
      ]);
    }

    // 6. Insert beneficial owner (only if account is for others, NOT for self, and BO data is provided)
    if (rekening_untuk_sendiri === false && bo_nama) {
      console.log("🔥 About to insert BO with values:", {
        bo_jenis_kelamin,
        bo_kewarganegaraan,
        bo_status_pernikahan,
        bo_sumber_dana,
        bo_hubungan,
        bo_nomor_hp
      });

      const insertBoQuery = `
        INSERT INTO bo (
          pengajuan_id, nama, alamat, tempat_lahir, tanggal_lahir,
          jenis_kelamin, kewarganegaraan, status_pernikahan,
          jenis_id, nomor_id, sumber_dana, hubungan, nomor_hp,
          pekerjaan, pendapatan_tahunan, persetujuan, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      `;
      await client.query(insertBoQuery, [
        parseInt(pengajuanId), // Ensure pengajuan_id is integer
        bo_nama,
        bo_alamat,
        emptyToNull(bo_tempat_lahir),
        emptyToNull(bo_tanggal_lahir),
        emptyToNull(bo_jenis_kelamin),
        emptyToNull(bo_kewarganegaraan),
        emptyToNull(bo_status_pernikahan),
        emptyToNull(bo_jenis_id),
        emptyToNull(bo_nomor_id),
        emptyToNull(bo_sumber_dana),
        emptyToNull(bo_hubungan),
        emptyToNull(bo_nomor_hp),
        emptyToNull(bo_pekerjaan),
        emptyToNull(bo_pendapatan_tahun),
        bo_persetujuan
      ]);
    }

    // 7. Insert EDD Bank Lain (if provided)
    console.log("🏦 EDD Bank Lain data:", JSON.stringify(edd_bank_lain, null, 2));
    if (edd_bank_lain && Array.isArray(edd_bank_lain) && edd_bank_lain.length > 0) {
      console.log(`📝 Inserting ${edd_bank_lain.length} EDD Bank Lain records`);
      for (let i = 0; i < edd_bank_lain.length; i++) {
        const bank = edd_bank_lain[i];
        console.log(`🏦 Processing bank ${i + 1}:`, bank);
        if (bank.bank_name && bank.jenis_rekening && bank.nomor_rekening) {
          const insertEddBankQuery = `
            INSERT INTO edd_bank_lain (
              edd_id, pengajuan_id, bank_name, jenis_rekening, nomor_rekening, created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())
          `;
          await client.query(insertEddBankQuery, [
            i + 1, // edd_id as sequence number
            parseInt(pengajuanId),
            bank.bank_name,
            bank.jenis_rekening,
            bank.nomor_rekening
          ]);
          console.log(`✅ EDD Bank ${i + 1} inserted successfully`);
        } else {
          console.log(`❌ EDD Bank ${i + 1} skipped - missing required fields`);
        }
      }
    } else {
      console.log("ℹ️ No EDD Bank Lain data to insert");
    }

    // 8. Insert EDD Pekerjaan Lain (if provided)
    console.log("💼 EDD Pekerjaan Lain data:", JSON.stringify(edd_pekerjaan_lain, null, 2));
    if (edd_pekerjaan_lain && Array.isArray(edd_pekerjaan_lain) && edd_pekerjaan_lain.length > 0) {
      console.log(`📝 Inserting ${edd_pekerjaan_lain.length} EDD Pekerjaan Lain records`);
      for (let i = 0; i < edd_pekerjaan_lain.length; i++) {
        const pekerjaan = edd_pekerjaan_lain[i];
        console.log(`💼 Processing job ${i + 1}:`, pekerjaan);
        if (pekerjaan.jenis_usaha) {
          const insertEddPekerjaanQuery = `
            INSERT INTO edd_pekerjaan_lain (
              edd_id, pengajuan_id, jenis_usaha, created_at
            ) VALUES ($1, $2, $3, NOW())
          `;
          await client.query(insertEddPekerjaanQuery, [
            i + 1, // edd_id as sequence number
            parseInt(pengajuanId),
            pekerjaan.jenis_usaha
          ]);
          console.log(`✅ EDD Pekerjaan ${i + 1} inserted successfully`);
        } else {
          console.log(`❌ EDD Pekerjaan ${i + 1} skipped - missing jenis_usaha`);
        }
      }
    } else {
      console.log("ℹ️ No EDD Pekerjaan Lain data to insert");
    }

    await client.query('COMMIT');

    // Get branch name for response
    const branchQuery = await client.query('SELECT nama_cabang FROM cabang WHERE id = $1', [parseInt(finalCabangId)]);
    const namaCabang = branchQuery.rows[0]?.nama_cabang || 'Cabang tidak ditemukan';

    res.status(201).json({
      success: true,
      message: "Pengajuan berhasil disimpan",
      kode_referensi,
      data: {
        id: pengajuanId,
        kode_referensi,
        nama_cabang: namaCabang
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
 * Mengambil status pengajuan berdasarkan kode referensi (public route)
 */
export const getStatusByReferenceCode = async (req, res) => {
  try {
    const { referenceCode } = req.params;

    const query = `
      SELECT
        p.id,
        p.status,
        p.created_at,
        p.approved_at,
        p.rejected_at,
        cs.kode_referensi,
        cs.nama AS nama_lengkap,
        cs.email,
        cs.no_hp,
        acc.tabungan_tipe AS jenis_rekening,
        c.nama_cabang,
        c.alamat AS alamat_cabang,
        c.telepon AS telepon_cabang
      FROM pengajuan_tabungan p
      LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
      LEFT JOIN account acc ON p.id = acc.pengajuan_id
      LEFT JOIN cabang c ON p.cabang_id = c.id
      WHERE cs.kode_referensi = $1
    `;

    const result = await pool.query(query, [referenceCode]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Nomor registrasi tidak ditemukan" 
      });
    }

    const data = result.rows[0];
    
    // Format status message
    let statusMessage = '';
    let statusColor = '';
    
    switch (data.status) {
      case 'pending':
        statusMessage = 'Pengajuan sedang dalam proses verifikasi';
        statusColor = 'yellow';
        break;
      case 'approved':
        statusMessage = 'Pengajuan telah disetujui. Silakan datang ke cabang untuk pengambilan buku tabungan.';
        statusColor = 'green';
        break;
      case 'rejected':
        statusMessage = 'Pengajuan ditolak. Silakan hubungi cabang untuk informasi lebih lanjut.';
        statusColor = 'red';
        break;
      default:
        statusMessage = 'Status tidak diketahui';
        statusColor = 'gray';
    }

    res.json({
      success: true,
      data: {
        kode_referensi: data.kode_referensi,
        nama_lengkap: data.nama_lengkap,
        jenis_rekening: data.jenis_rekening,
        status: data.status,
        statusMessage,
        statusColor,
        created_at: data.created_at,
        approved_at: data.approved_at,
        rejected_at: data.rejected_at,
        cabang: {
          nama_cabang: data.nama_cabang,
          alamat_cabang: data.alamat_cabang,
          telepon_cabang: data.telepon_cabang
        }
      }
    });

  } catch (err) {
    console.error("❌ Error getting status by reference code:", err);
    res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan saat mengambil status pengajuan" 
    });
  }
};

/**
 * Mengambil satu pengajuan berdasarkan ID
 * Melakukan JOIN ke tabel-tabel terkait
 */
export const getPengajuanById = async (req, res) => {
  try {
    const { id } = req.params;
    const { cabang_id: adminCabang, role: userRole } = req.user;

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
        cs.alias,
        cs.jenis_id AS "identityType",
        cs.no_id AS nik,
        cs.berlaku_id,
          cs.email,
          cs.no_hp,
          cs.tempat_lahir,
          cs.tanggal_lahir,
          cs.alamat_id AS alamat, --KTP address (combined)
          cs.alamat_jalan, --Street address
          cs.provinsi, --Province
          cs.kota, --City
          cs.kecamatan, --District
          cs.kelurahan, --Village
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
          cs.tipe_nasabah,
          cs.nomor_rekening_lama,
          cs.rekening_untuk_sendiri,
          --Job Data
    cj.pekerjaan,
      cj.gaji_per_bulan AS penghasilan,
        cj.sumber_dana,
        cj.rata_transaksi_per_bulan AS rata_rata_transaksi,
        cj.nama_perusahaan AS tempat_bekerja,
          cj.alamat_perusahaan AS alamat_kantor,
            cj.no_telepon AS telepon_perusahaan,
            cj.jabatan,
            cj.bidang_usaha,

            --Account Data
    acc.tabungan_tipe AS jenis_rekening,
      acc.nominal_setoran,
      acc.atm_tipe AS jenis_kartu,
        acc.tujuan_pembukaan AS tujuan_rekening,
        
          --Ref Data
    cref.nama AS kontak_darurat_nama,
      cref.no_hp AS kontak_darurat_hp,
      cref.alamat AS kontak_darurat_alamat,
        cref.hubungan AS kontak_darurat_hubungan,
          --Beneficial Owner Data
    cbo.nama AS bo_nama,
      cbo.alamat AS bo_alamat,
        cbo.tempat_lahir AS bo_tempat_lahir,
        cbo.tanggal_lahir AS bo_tanggal_lahir,
          cbo.jenis_kelamin AS bo_jenis_kelamin,
          cbo.kewarganegaraan AS bo_kewarganegaraan,
          cbo.status_pernikahan AS bo_status_pernikahan,
          cbo.jenis_id AS bo_jenis_id,
          cbo.nomor_id AS bo_nomor_id,
          cbo.sumber_dana AS bo_sumber_dana,
          cbo.hubungan AS bo_hubungan,
          cbo.nomor_hp AS bo_nomor_hp,
          cbo.pekerjaan AS bo_pekerjaan,
          cbo.pendapatan_tahunan AS bo_pendapatan_tahun,
          cbo.persetujuan AS bo_persetujuan,
          --Cabang info
    p.cabang_id,
      c.nama_cabang,
      --EDD Bank Lain (aggregated as JSON)
      COALESCE(
        (SELECT JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', ebl.id,
            'edd_id', ebl.edd_id,
            'bank_name', ebl.bank_name,
            'jenis_rekening', ebl.jenis_rekening,
            'nomor_rekening', ebl.nomor_rekening,
            'created_at', ebl.created_at
          )
        ) FROM edd_bank_lain ebl WHERE ebl.pengajuan_id = p.id),
        '[]'::json
      ) AS edd_bank_lain,
      --EDD Pekerjaan Lain (aggregated as JSON)
      COALESCE(
        (SELECT JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', epl.id,
            'edd_id', epl.edd_id,
            'jenis_usaha', epl.jenis_usaha,
            'created_at', epl.created_at
          )
        ) FROM edd_pekerjaan_lain epl WHERE epl.pengajuan_id = p.id),
        '[]'::json
      ) AS edd_pekerjaan_lain
      FROM pengajuan_tabungan p
    LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
    LEFT JOIN cdd_job cj ON p.id = cj.pengajuan_id
    LEFT JOIN account acc ON p.id = acc.pengajuan_id
    LEFT JOIN cdd_reference cref ON p.id = cref.pengajuan_id
    LEFT JOIN bo cbo ON p.id = cbo.pengajuan_id
    LEFT JOIN cabang c ON p.cabang_id = c.id
    LEFT JOIN users ua ON p.approved_by = ua.id
    LEFT JOIN users ur ON p.rejected_by = ur.id
      WHERE p.id = $1${userRole === 'super' ? '' : ' AND p.cabang_id = $2'}
      `;

    const queryParams = userRole === 'super' ? [id] : [id, adminCabang];
    const result = await pool.query(query, queryParams);

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
 * Mengambil semua pengajuan berdasarkan role
 * - Super admin: semua cabang
 * - Admin cabang: hanya cabangnya
 */
export const getAllPengajuan = async (req, res) => {
  try {
    const { cabang_id: adminCabang, role: userRole } = req.user;

    // Role-based access control
    let whereClause = '';
    let queryParams = [];

    if (userRole === 'super') {
      // Super admin can see all pengajuan
      // Super admin access
    } else {
      // Admin cabang can only see pengajuan from their branch
      whereClause = 'WHERE p.cabang_id = $1';
      queryParams = [adminCabang];
      // Branch admin access
    }

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
        cs.alias,
        cs.jenis_id AS "identityType",
        cs.no_id AS nik,
        cs.no_hp,
        cs.email,
        cs.tempat_lahir,
        cs.kewarganegaraan,
        cs.tipe_nasabah,
        cs.nomor_rekening_lama,
        cs.rekening_untuk_sendiri,
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
      ${whereClause}
      ORDER BY p.created_at DESC
    `;

    const result = await pool.query(query, queryParams);

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
  const { status, sendEmail, sendWhatsApp, message, isEdit, editReason, ...editData } = req.body;

  // If this is an edit request, delegate to editSubmission
  if (isEdit) {
    req.body = { ...editData, editReason };
    return editSubmission(req, res);
  }

  try {
    let query, values;
    const userRole = req.user.role;
    const isSuper = userRole === 'super';

    if (status === 'approved') {
      if (isSuper) {
        // Super admin can approve any application
        query = `
          UPDATE pengajuan_tabungan 
          SET status = $1, approved_by = $2, approved_at = NOW(), rejected_by = NULL, rejected_at = NULL
          WHERE id = $3
        RETURNING *;
        `;
        values = [status, req.user.id, id];
      } else {
        // Regular admin can only approve applications from their branch
        query = `
          UPDATE pengajuan_tabungan 
          SET status = $1, approved_by = $2, approved_at = NOW(), rejected_by = NULL, rejected_at = NULL
          WHERE id = $3 AND cabang_id = $4
        RETURNING *;
        `;
        values = [status, req.user.id, id, req.user.cabang_id];
      }
    }
    else if (status === 'rejected') {
      if (isSuper) {
        // Super admin can reject any application
        query = `
          UPDATE pengajuan_tabungan 
          SET status = $1, rejected_by = $2, rejected_at = NOW(), approved_by = NULL, approved_at = NULL
          WHERE id = $3
        RETURNING *;
        `;
        values = [status, req.user.id, id];
      } else {
        // Regular admin can only reject applications from their branch
        query = `
          UPDATE pengajuan_tabungan 
          SET status = $1, rejected_by = $2, rejected_at = NOW(), approved_by = NULL, approved_at = NULL
          WHERE id = $3 AND cabang_id = $4
        RETURNING *;
        `;
        values = [status, req.user.id, id, req.user.cabang_id];
      }
    } else {
      if (isSuper) {
        // Super admin can change any application to pending
        query = `
          UPDATE pengajuan_tabungan 
          SET status = $1, approved_by = NULL, approved_at = NULL, rejected_by = NULL, rejected_at = NULL
          WHERE id = $2
        RETURNING *;
        `;
        values = [status, id];
      } else {
        // Regular admin can only change applications from their branch to pending
        query = `
          UPDATE pengajuan_tabungan 
          SET status = $1, approved_by = NULL, approved_at = NULL, rejected_by = NULL, rejected_at = NULL
          WHERE id = $2 AND cabang_id = $3
        RETURNING *;
        `;
        values = [status, id, req.user.cabang_id];
      }
    }

    // Log for debugging
    console.log(`🔄 Status update attempt:`, {
      id,
      status,
      userRole,
      userId: req.user.id,
      userCabang: req.user.cabang_id,
      isSuper
    });

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      console.log(`❌ Status update failed: No rows affected for ID ${id}`);
      return res.status(404).json({ success: false, message: "Data tidak ditemukan atau akses ditolak" });
    }

    console.log(`✅ Status update successful for ID ${id}`);

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

/**
 * Mengambil data analytics berdasarkan role
 * - Super admin: bisa lihat semua cabang
 * - Admin cabang: hanya lihat cabangnya sendiri
 */
export const getAnalyticsData = async (req, res) => {
  try {
    // Analytics data request processing

    const userRole = req.user.role;
    const adminCabang = req.user.cabang_id;

    // Tentukan akses berdasarkan role
    let whereClause = '';
    let queryParams = [];

    // Role-based access control
    if (userRole === 'super') {
      // Super admin bisa lihat semua cabang
      // Super admin access
    } else if (userRole === 'employement' || userRole === 'admin') {
      // Admin cabang hanya lihat cabangnya sendiri
      whereClause = 'WHERE p.cabang_id = $1';
      queryParams = [adminCabang];
      // Branch admin access
    } else {
      // Role tidak dikenal, default ke cabang sendiri
      whereClause = 'WHERE p.cabang_id = $1';
      queryParams = [adminCabang];
      // Unknown role, using branch filter
    }

    const query = `
      SELECT 
        p.id,
        p.status,
        p.created_at,
        p.approved_at,
        p.rejected_at,
        p.cabang_id,
        cs.kode_referensi,
        cs.nama AS nama_lengkap,
        cs.alias,
        cs.jenis_id AS "identityType",
        cs.no_id AS nik,
        cs.berlaku_id,
        cs.no_hp,
        cs.email,
        cs.tempat_lahir,
        cs.tanggal_lahir,
        cs.jenis_kelamin,
        cs.status_kawin AS status_pernikahan,
        cs.agama,
        cs.pendidikan,
        cs.kewarganegaraan,
        cs.nama_ibu_kandung,
        cs.npwp,
        cs.status_rumah,
        cs.tipe_nasabah,
        cs.nomor_rekening_lama,
        cs.alamat_id AS alamat,
        cs.alamat_jalan,
        cs.provinsi,
        cs.kota,
        cs.kecamatan,
        cs.kelurahan,
        cs.alamat_now AS alamat_domisili,
        cs.kode_pos_id AS kode_pos,
        cs.rekening_untuk_sendiri,
        
        -- Job Info
        job.pekerjaan,
        job.gaji_per_bulan AS penghasilan,
        job.nama_perusahaan AS tempat_bekerja,
        job.nama_perusahaan,
        job.alamat_perusahaan AS alamat_kantor,
        job.alamat_perusahaan,
        job.no_telepon AS telepon_perusahaan,
        job.no_telepon,
        job.jabatan,
        job.bidang_usaha,
        job.sumber_dana,
        job.rata_transaksi_per_bulan AS rata_rata_transaksi,
        job.rata_transaksi_per_bulan,
        acc.tujuan_pembukaan AS tujuan_rekening,
        
        -- Account Info
        acc.tabungan_tipe AS jenis_rekening,
        acc.atm_tipe AS jenis_kartu,
        acc.nominal_setoran,
        
        -- Emergency Contact
        ec.nama AS kontak_darurat_nama,
        ec.no_hp AS kontak_darurat_hp,
        ec.alamat AS kontak_darurat_alamat,
        ec.hubungan AS kontak_darurat_hubungan,
        
        -- Beneficial Owner
        bo.nama AS bo_nama,
        bo.alamat AS bo_alamat,
        bo.tempat_lahir AS bo_tempat_lahir,
        bo.tanggal_lahir AS bo_tanggal_lahir,
        bo.jenis_kelamin AS bo_jenis_kelamin,
        bo.kewarganegaraan AS bo_kewarganegaraan,
        bo.status_pernikahan AS bo_status_pernikahan,
        bo.jenis_id AS bo_jenis_id,
        bo.nomor_id AS bo_nomor_id,
        bo.sumber_dana AS bo_sumber_dana,
        bo.hubungan AS bo_hubungan,
        bo.nomor_hp AS bo_nomor_hp,
        bo.pekerjaan AS bo_pekerjaan,
        bo.pendapatan_tahunan AS bo_pendapatan_tahun,
        bo.persetujuan AS bo_persetujuan,
        
        -- Branch Info
        c.nama_cabang,
        
        -- Approval Info
        ua.username AS "approvedBy",
        ur.username AS "rejectedBy"
        
      FROM pengajuan_tabungan p
      LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
      LEFT JOIN cdd_job job ON p.id = job.pengajuan_id
      LEFT JOIN account acc ON p.id = acc.pengajuan_id
      LEFT JOIN cdd_reference ec ON p.id = ec.pengajuan_id
      LEFT JOIN bo bo ON p.id = bo.pengajuan_id
      LEFT JOIN cabang c ON p.cabang_id = c.id
      LEFT JOIN users ua ON p.approved_by = ua.id
      LEFT JOIN users ur ON p.rejected_by = ur.id
      ${whereClause}
      ORDER BY p.created_at DESC
    `;

    const result = await pool.query(query, queryParams);

    // Log untuk debugging
    console.log(`📊 Analytics query executed for user role: ${userRole}, cabang: ${adminCabang}`);
    console.log(`📊 Returned ${result.rows.length} records`);

    // Debug info for first record
    if (result.rows.length > 0) {
      console.log('📊 [DEBUG] Sample record (first):', {
        id: result.rows[0].id,
        penghasilan: result.rows[0].penghasilan,
        pekerjaan: result.rows[0].pekerjaan,
        jabatan: result.rows[0].jabatan,
        nama_perusahaan: result.rows[0].nama_perusahaan
      });
    }

    res.json({
      success: true,
      data: result.rows,
      meta: {
        total: result.rows.length,
        userRole: userRole,
        accessLevel: whereClause ? 'cabang' : 'all'
      }
    });
  } catch (err) {
    console.error('❌ Analytics query error:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data analytics',
      error: err.message
    });
  }
};

/**
 * Mengambil cabang untuk analytics berdasarkan role
 * - Super admin: semua cabang
 * - Admin cabang: hanya cabangnya sendiri
 */
export const getAllCabangForAnalytics = async (req, res) => {
  try {
    console.log('🏦 Analytics cabang request received');
    console.log('🏦 User:', req.user?.username, 'Role:', req.user?.role, 'Cabang:', req.user?.cabang_id);

    const userRole = req.user.role;
    const adminCabang = req.user.cabang_id;

    let query = "SELECT id, nama_cabang, is_active, created_at FROM cabang";
    let queryParams = [];

    // Role-based access control
    if (userRole === 'super') {
      // Super admin bisa lihat semua cabang
      console.log('🏦 Super admin access - showing all branches');
    } else if (userRole === 'employement' || userRole === 'admin') {
      // Admin cabang hanya lihat cabangnya sendiri
      query += " WHERE id = $1";
      queryParams = [adminCabang];
      console.log('🏦 Branch admin access - filtering by cabang:', adminCabang);
    } else {
      // Role tidak dikenal, default ke cabang sendiri
      query += " WHERE id = $1";
      queryParams = [adminCabang];
      console.log('🏦 Unknown role, defaulting to branch filter:', adminCabang);
    }

    query += " ORDER BY id ASC";

    const result = await pool.query(query, queryParams);

    console.log(`🏦 Cabang analytics query for role: ${userRole}, returned ${result.rows.length} branches`);

    res.json({
      success: true,
      data: result.rows,
      meta: {
        total: result.rows.length,
        userRole: userRole,
        accessLevel: queryParams.length > 0 ? 'cabang' : 'all'
      }
    });
  } catch (err) {
    console.error('❌ Cabang analytics query error:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data cabang untuk analytics',
      error: err.message
    });
  }
};

/**
 * Export data permohonan ke Excel
 */
/**
 * Export data permohonan ke Excel
 */
export const exportToExcel = async (req, res) => {
  try {
    // Import ExcelJS
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.default.Workbook();
    const worksheet = workbook.addWorksheet('Data Permohonan');

    console.log('📊 Excel export request received');
    console.log('👤 User:', req.user?.username, 'Role:', req.user?.role, 'Cabang:', req.user?.cabang_id);
    console.log('🔍 Query params:', req.query);

    const userRole = req.user.role;
    const adminCabang = req.user.cabang_id;
    const { fullData, startDate, endDate, cabangId } = req.query;

    // Query berdasarkan role - menggunakan struktur yang sudah terbukti bekerja dari getAllPengajuan
    let query = `
      SELECT 
        p.id,
        p.status,
        p.created_at,
        p.approved_at,
        p.rejected_at,
        cs.kode_referensi,
        cs.nama AS nama_lengkap,
        cs.alias,
        cs.jenis_id AS "identityType",
        cs.no_id AS nik,
        cs.berlaku_id,
        cs.email,
        cs.no_hp,
        cs.tempat_lahir,
        cs.tanggal_lahir,
        cs.jenis_kelamin,
        cs.status_kawin AS status_pernikahan,
        cs.agama,
        cs.pendidikan,
        cs.kewarganegaraan,
        cs.nama_ibu_kandung,
        cs.npwp,
        cs.alamat_id AS alamat,
        cs.alamat_jalan,
        cs.provinsi,
        cs.kota,
        cs.kecamatan,
        cs.kelurahan,
        cs.alamat_now AS alamat_domisili,
        cs.kode_pos_id AS kode_pos,
        cs.status_rumah,
        cs.tipe_nasabah,
        cs.nomor_rekening_lama,
        cs.rekening_untuk_sendiri,
        cj.pekerjaan,
        cj.nama_perusahaan AS tempat_bekerja,
        cj.alamat_perusahaan AS alamat_kantor,
        cj.no_telepon AS telepon_perusahaan,
        cj.jabatan,
        cj.bidang_usaha,
        cj.gaji_per_bulan AS penghasilan,
        cj.sumber_dana,
        cj.rata_transaksi_per_bulan AS rata_rata_transaksi,
        acc.tujuan_pembukaan AS tujuan_rekening,
        acc.tabungan_tipe AS jenis_rekening,
        acc.atm_tipe AS jenis_kartu,
        acc.nominal_setoran,
        kd.nama AS kontak_darurat_nama,
        kd.no_hp AS kontak_darurat_hp,
        kd.alamat AS kontak_darurat_alamat,
        kd.hubungan AS kontak_darurat_hubungan,
        bo.nama AS bo_nama,
        bo.alamat AS bo_alamat,
        bo.tempat_lahir AS bo_tempat_lahir,
        bo.tanggal_lahir AS bo_tanggal_lahir,
        bo.jenis_kelamin AS bo_jenis_kelamin,
        bo.kewarganegaraan AS bo_kewarganegaraan,
        bo.status_pernikahan AS bo_status_pernikahan,
        bo.jenis_id AS bo_jenis_id,
        bo.nomor_id AS bo_nomor_id,
        bo.sumber_dana AS bo_sumber_dana,
        bo.hubungan AS bo_hubungan,
        bo.nomor_hp AS bo_nomor_hp,
        bo.pekerjaan AS bo_pekerjaan,
        bo.pendapatan_tahunan AS bo_pendapatan_tahun,
        bo.persetujuan AS bo_persetujuan,
        c.nama_cabang
      FROM pengajuan_tabungan p
      LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
      LEFT JOIN cdd_job cj ON p.id = cj.pengajuan_id
      LEFT JOIN account acc ON p.id = acc.pengajuan_id
      LEFT JOIN cdd_reference kd ON p.id = kd.pengajuan_id
      LEFT JOIN bo bo ON p.id = bo.pengajuan_id
      LEFT JOIN cabang c ON p.cabang_id = c.id
    `;

    let queryParams = [];
    let whereConditions = [];

    // Role-based filtering
    if (userRole !== 'super') {
      whereConditions.push(`p.cabang_id = $${queryParams.length + 1}`);
      queryParams.push(adminCabang);
    }

    // Date range filtering
    if (startDate) {
      whereConditions.push(`p.created_at >= $${queryParams.length + 1}`);
      queryParams.push(startDate);
    }
    if (endDate) {
      whereConditions.push(`p.created_at <= $${queryParams.length + 1}`);
      queryParams.push(endDate + ' 23:59:59');
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += " ORDER BY p.created_at DESC";

    const result = await pool.query(query, queryParams);

    // Setup header Excel berdasarkan fullData
    if (fullData === 'true') {
      // Full data export - semua kolom
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Kode Referensi', key: 'kode_referensi', width: 20 },
        { header: 'Nama Lengkap', key: 'nama_lengkap', width: 25 },
        { header: 'Alias', key: 'alias', width: 20 },
        { header: 'Jenis ID', key: 'identityType', width: 15 },
        { header: 'NIK', key: 'nik', width: 20 },
        { header: 'Berlaku ID', key: 'berlaku_id', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'No HP', key: 'no_hp', width: 15 },
        { header: 'Tempat Lahir', key: 'tempat_lahir', width: 20 },
        { header: 'Tanggal Lahir', key: 'tanggal_lahir', width: 15 },
        { header: 'Jenis Kelamin', key: 'jenis_kelamin', width: 15 },
        { header: 'Status Pernikahan', key: 'status_pernikahan', width: 18 },
        { header: 'Agama', key: 'agama', width: 15 },
        { header: 'Pendidikan', key: 'pendidikan', width: 20 },
        { header: 'Kewarganegaraan', key: 'kewarganegaraan', width: 18 },
        { header: 'Nama Ibu Kandung', key: 'nama_ibu_kandung', width: 25 },
        { header: 'NPWP', key: 'npwp', width: 20 },
        { header: 'Alamat', key: 'alamat', width: 30 },
        { header: 'Alamat Domisili', key: 'alamat_domisili', width: 30 },
        { header: 'Kode Pos', key: 'kode_pos', width: 12 },
        { header: 'Status Rumah', key: 'status_rumah', width: 15 },
        { header: 'Tipe Nasabah', key: 'tipe_nasabah', width: 15 },
        { header: 'Nomor Rekening Lama', key: 'nomor_rekening_lama', width: 20 },
        { header: 'Pekerjaan', key: 'pekerjaan', width: 20 },
        { header: 'Tempat Bekerja', key: 'tempat_bekerja', width: 25 },
        { header: 'Alamat Kantor', key: 'alamat_kantor', width: 30 },
        { header: 'Telepon Perusahaan', key: 'telepon_perusahaan', width: 18 },
        { header: 'Jabatan', key: 'jabatan', width: 20 },
        { header: 'Bidang Usaha', key: 'bidang_usaha', width: 20 },
        { header: 'Penghasilan', key: 'penghasilan', width: 20 },
        { header: 'Sumber Dana', key: 'sumber_dana', width: 20 },
        { header: 'Rata-rata Transaksi', key: 'rata_rata_transaksi', width: 20 },
        { header: 'Tujuan Rekening', key: 'tujuan_rekening', width: 20 },
        { header: 'Jenis Rekening', key: 'jenis_rekening', width: 20 },
        { header: 'Jenis Kartu', key: 'jenis_kartu', width: 15 },
        { header: 'Nominal Setoran', key: 'nominal_setoran', width: 18 },
        { header: 'Rekening Untuk Sendiri', key: 'rekening_untuk_sendiri', width: 22 },
        { header: 'Kontak Darurat Nama', key: 'kontak_darurat_nama', width: 25 },
        { header: 'Kontak Darurat HP', key: 'kontak_darurat_hp', width: 18 },
        { header: 'Kontak Darurat Alamat', key: 'kontak_darurat_alamat', width: 30 },
        { header: 'Kontak Darurat Hubungan', key: 'kontak_darurat_hubungan', width: 22 },
        { header: 'BO Nama', key: 'bo_nama', width: 25 },
        { header: 'BO Alamat', key: 'bo_alamat', width: 30 },
        { header: 'BO Tempat Lahir', key: 'bo_tempat_lahir', width: 20 },
        { header: 'BO Tanggal Lahir', key: 'bo_tanggal_lahir', width: 18 },
        { header: 'BO Jenis Kelamin', key: 'bo_jenis_kelamin', width: 18 },
        { header: 'BO Kewarganegaraan', key: 'bo_kewarganegaraan', width: 20 },
        { header: 'BO Status Pernikahan', key: 'bo_status_pernikahan', width: 22 },
        { header: 'BO Jenis ID', key: 'bo_jenis_id', width: 15 },
        { header: 'BO Nomor ID', key: 'bo_nomor_id', width: 20 },
        { header: 'BO Sumber Dana', key: 'bo_sumber_dana', width: 18 },
        { header: 'BO Hubungan', key: 'bo_hubungan', width: 15 },
        { header: 'BO Nomor HP', key: 'bo_nomor_hp', width: 15 },
        { header: 'BO Pekerjaan', key: 'bo_pekerjaan', width: 20 },
        { header: 'BO Pendapatan Tahun', key: 'bo_pendapatan_tahun', width: 20 },
        { header: 'BO Persetujuan', key: 'bo_persetujuan', width: 15 },
        { header: 'Cabang', key: 'nama_cabang', width: 20 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Tanggal Pengajuan', key: 'created_at', width: 20 },
        { header: 'Tanggal Disetujui', key: 'approved_at', width: 20 },
        { header: 'Tanggal Ditolak', key: 'rejected_at', width: 20 },
      ];
    } else {
      // Standard export - kolom utama saja
      worksheet.columns = [
        { header: 'Kode Referensi', key: 'kode_referensi', width: 20 },
        { header: 'Nama Lengkap', key: 'nama_lengkap', width: 25 },
        { header: 'NIK', key: 'nik', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'No HP', key: 'no_hp', width: 15 },
        { header: 'Tanggal Lahir', key: 'tanggal_lahir', width: 15 },
        { header: 'Alamat', key: 'alamat', width: 30 },
        { header: 'Pekerjaan', key: 'pekerjaan', width: 20 },
        { header: 'Penghasilan', key: 'penghasilan', width: 20 },
        { header: 'Jenis Rekening', key: 'jenis_rekening', width: 20 },
        { header: 'Jenis Kartu', key: 'jenis_kartu', width: 15 },
        { header: 'Cabang', key: 'nama_cabang', width: 20 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Tanggal Pengajuan', key: 'created_at', width: 20 },
      ];
    }

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F3FF' }
    };

    // Add data
    result.rows.forEach(row => {
      const baseData = {
        kode_referensi: row.kode_referensi,
        nama_lengkap: row.nama_lengkap,
        nik: row.nik,
        email: row.email,
        no_hp: row.no_hp,
        tanggal_lahir: row.tanggal_lahir ? new Date(row.tanggal_lahir).toLocaleDateString('id-ID') : '',
        alamat: row.alamat,
        pekerjaan: row.pekerjaan,
        penghasilan: row.penghasilan,
        jenis_rekening: row.jenis_rekening,
        jenis_kartu: row.jenis_kartu,
        nama_cabang: row.nama_cabang,
        status: row.status,
        created_at: row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '',
      };

      if (fullData === 'true') {
        // Add all fields for full export
        worksheet.addRow({
          ...baseData,
          id: row.id,
          alias: row.alias || '',
          identityType: row.identityType || '',
          berlaku_id: row.berlaku_id ? new Date(row.berlaku_id).toLocaleDateString('id-ID') : '',
          tempat_lahir: row.tempat_lahir || '',
          jenis_kelamin: row.jenis_kelamin || '',
          status_pernikahan: row.status_pernikahan || '',
          agama: row.agama || '',
          pendidikan: row.pendidikan || '',
          kewarganegaraan: row.kewarganegaraan || '',
          nama_ibu_kandung: row.nama_ibu_kandung || '',
          npwp: row.npwp || '',
          alamat_domisili: row.alamat_domisili || '',
          kode_pos: row.kode_pos || '',
          status_rumah: row.status_rumah || '',
          tipe_nasabah: row.tipe_nasabah || '',
          nomor_rekening_lama: row.nomor_rekening_lama || '',
          tempat_bekerja: row.tempat_bekerja || '',
          alamat_kantor: row.alamat_kantor || '',
          telepon_perusahaan: row.telepon_perusahaan || '',
          jabatan: row.jabatan || '',
          bidang_usaha: row.bidang_usaha || '',
          sumber_dana: row.sumber_dana || '',
          rata_rata_transaksi: row.rata_rata_transaksi || '',
          tujuan_rekening: row.tujuan_rekening || '',
          nominal_setoran: row.nominal_setoran || '',
          rekening_untuk_sendiri: row.rekening_untuk_sendiri ? 'Ya' : 'Tidak',
          kontak_darurat_nama: row.kontak_darurat_nama || '',
          kontak_darurat_hp: row.kontak_darurat_hp || '',
          kontak_darurat_alamat: row.kontak_darurat_alamat || '',
          kontak_darurat_hubungan: row.kontak_darurat_hubungan || '',
          bo_nama: row.bo_nama || '',
          bo_alamat: row.bo_alamat || '',
          bo_tempat_lahir: row.bo_tempat_lahir || '',
          bo_tanggal_lahir: row.bo_tanggal_lahir ? new Date(row.bo_tanggal_lahir).toLocaleDateString('id-ID') : '',
          bo_jenis_kelamin: row.bo_jenis_kelamin || '',
          bo_kewarganegaraan: row.bo_kewarganegaraan || '',
          bo_status_pernikahan: row.bo_status_pernikahan || '',
          bo_jenis_id: row.bo_jenis_id || '',
          bo_nomor_id: row.bo_nomor_id || '',
          bo_sumber_dana: row.bo_sumber_dana || '',
          bo_hubungan: row.bo_hubungan || '',
          bo_nomor_hp: row.bo_nomor_hp || '',
          bo_pekerjaan: row.bo_pekerjaan || '',
          bo_pendapatan_tahun: row.bo_pendapatan_tahun || '',
          bo_persetujuan: row.bo_persetujuan ? 'Ya' : 'Tidak',
          approved_at: row.approved_at ? new Date(row.approved_at).toLocaleString('id-ID') : '',
          rejected_at: row.rejected_at ? new Date(row.rejected_at).toLocaleString('id-ID') : '',
        });
      } else {
        worksheet.addRow(baseData);
      }
    });

    // Set response headers
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const prefix = fullData === 'true' ? 'full-data' : 'data-permohonan';
    const filename = `${prefix}-${timestamp}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

    console.log(`✅ Excel export completed: ${result.rows.length} records exported (fullData: ${fullData})`);

    // Log aktivitas export
    const exportType = fullData === 'true' ? 'Data Lengkap' : 'Data Utama';
    const dateFilter = startDate || endDate ? ` (${startDate || 'awal'} - ${endDate || 'akhir'})` : '';
    await logUserActivity(
      req.user.id,
      'EXPORT_EXCEL',
      `Export Excel ${exportType}: ${result.rows.length} records${dateFilter}`,
      req.user.cabang_id,
      req.ip,
      req.get('User-Agent')
    );

  } catch (err) {
    console.error('❌ Excel export error:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal mengekspor data ke Excel',
      error: err.message
    });
  }
};

/**
 * Export backup data sebagai JSON
 */
/**
 * Export backup data sebagai JSON
 */
export const exportBackup = async (req, res) => {
  try {
    console.log('💾 Backup export request received');
    console.log('👤 User:', req.user?.username, 'Role:', req.user?.role, 'Cabang:', req.user?.cabang_id);
    console.log('🔍 Query params:', req.query);

    const userRole = req.user.role;
    const adminCabang = req.user.cabang_id;
    const { startDate, endDate, cabangId } = req.query;

    // Query untuk mengambil data lengkap dengan JOIN
    // Note: Menggunakan query yang mirip dengan getPengajuanById tapi untuk banyak row
    let query = `
      SELECT 
        p.id,
        p.status,
        p.created_at,
        p.approved_at,
        p.rejected_at,
        p.cabang_id,
        p.edit_count,
        p.last_edited_at,
        cs.kode_referensi,
        cs.nama AS nama_lengkap,
        cs.alias,
        cs.jenis_id AS "identityType",
        cs.no_id AS nik,
        cs.berlaku_id,
        cs.no_hp,
        cs.email,
        cs.tempat_lahir,
        cs.tanggal_lahir,
        cs.jenis_kelamin,
        cs.status_kawin AS status_pernikahan,
        cs.agama,
        cs.pendidikan,
        cs.kewarganegaraan,
        cs.nama_ibu_kandung,
        cs.npwp,
        cs.status_rumah,
        cs.tipe_nasabah,
        cs.nomor_rekening_lama,
        cs.alamat_id AS alamat,
        cs.alamat_jalan,
        cs.provinsi,
        cs.kota,
        cs.kecamatan,
        cs.kelurahan,
        cs.alamat_now AS alamat_domisili,
        cs.kode_pos_id AS kode_pos,
        cs.rekening_untuk_sendiri,
        
        -- Job Info
        job.pekerjaan,
        job.gaji_per_bulan AS penghasilan,
        job.nama_perusahaan AS tempat_bekerja,
        job.alamat_perusahaan AS alamat_kantor,
        job.no_telepon AS telepon_perusahaan,
        job.jabatan,
        job.bidang_usaha,
        job.sumber_dana,
        job.rata_transaksi_per_bulan AS rata_rata_transaksi,
        acc.tujuan_pembukaan AS tujuan_rekening,
        
        -- Account Info
        acc.tabungan_tipe AS jenis_rekening,
        acc.atm_tipe AS jenis_kartu,
        acc.nominal_setoran,
        
        -- Emergency Contact
        ec.nama AS kontak_darurat_nama,
        ec.no_hp AS kontak_darurat_hp,
        ec.alamat AS kontak_darurat_alamat,
        ec.hubungan AS kontak_darurat_hubungan,
        
        -- Beneficial Owner
        bo.nama AS bo_nama,
        bo.alamat AS bo_alamat,
        bo.tempat_lahir AS bo_tempat_lahir,
        bo.tanggal_lahir AS bo_tanggal_lahir,
        bo.jenis_kelamin AS bo_jenis_kelamin,
        bo.kewarganegaraan AS bo_kewarganegaraan,
        bo.status_pernikahan AS bo_status_pernikahan,
        bo.jenis_id AS bo_jenis_id,
        bo.nomor_id AS bo_nomor_id,
        bo.sumber_dana AS bo_sumber_dana,
        bo.hubungan AS bo_hubungan,
        bo.nomor_hp AS bo_nomor_hp,
        bo.pekerjaan AS bo_pekerjaan,
        bo.pendapatan_tahunan AS bo_pendapatan_tahun,
        bo.persetujuan AS bo_persetujuan,
        
        -- Branch Info
        c.nama_cabang,
        
        -- Approval Info
        ua.username AS "approvedBy",
        ur.username AS "rejectedBy",

        -- EDD Bank Lain (JSON Aggregated)
        COALESCE(
          (SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ebl.id,
              'edd_id', ebl.edd_id,
              'bank_name', ebl.bank_name,
              'jenis_rekening', ebl.jenis_rekening,
              'nomor_rekening', ebl.nomor_rekening,
              'created_at', ebl.created_at
            )
          ) FROM edd_bank_lain ebl WHERE ebl.pengajuan_id = p.id),
          '[]'::json
        ) AS edd_bank_lain,
        
        -- EDD Pekerjaan Lain (JSON Aggregated)
        COALESCE(
          (SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', epl.id,
              'edd_id', epl.edd_id,
              'jenis_usaha', epl.jenis_usaha,
              'created_at', epl.created_at
            )
          ) FROM edd_pekerjaan_lain epl WHERE epl.pengajuan_id = p.id),
          '[]'::json
        ) AS edd_pekerjaan_lain

      FROM pengajuan_tabungan p
      LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
      LEFT JOIN cdd_job job ON p.id = job.pengajuan_id
      LEFT JOIN account acc ON p.id = acc.pengajuan_id
      LEFT JOIN cdd_reference ec ON p.id = ec.pengajuan_id
      LEFT JOIN bo bo ON p.id = bo.pengajuan_id
      LEFT JOIN cabang c ON p.cabang_id = c.id
      LEFT JOIN users ua ON p.approved_by = ua.id
      LEFT JOIN users ur ON p.rejected_by = ur.id
    `;

    let queryParams = [];
    let whereConditions = [];

    // Role-based filtering
    if (userRole !== 'super') {
      whereConditions.push(`p.cabang_id = $${queryParams.length + 1}`);
      queryParams.push(adminCabang);
    }

    // Date range filtering
    if (startDate) {
      whereConditions.push(`p.created_at >= $${queryParams.length + 1}`);
      queryParams.push(startDate);
    }
    if (endDate) {
      whereConditions.push(`p.created_at <= $${queryParams.length + 1}`);
      queryParams.push(endDate + ' 23:59:59');
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += " ORDER BY p.created_at DESC";

    const result = await pool.query(query, queryParams);

    // Prepare backup data
    const backupData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: req.user.username,
        userRole: userRole,
        totalRecords: result.rows.length,
        version: '2.0' // Version bump for new schema
      },
      data: result.rows
    };

    // Set response headers
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `backup-data-${timestamp}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.json(backupData);

    console.log(`✅ Backup export completed: ${result.rows.length} records exported`);

    // Log aktivitas backup
    const dateFilter = startDate || endDate ? ` (${startDate || 'awal'} - ${endDate || 'akhir'})` : '';
    await logUserActivity(
      req.user.id,
      'EXPORT_BACKUP',
      `Export Backup JSON: ${result.rows.length} records${dateFilter}`,
      req.user.cabang_id,
      req.ip,
      req.get('User-Agent')
    );

  } catch (err) {
    console.error('❌ Backup export error:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat backup data',
      error: err.message
    });
  }
};

/**
 * Preview import data untuk konfirmasi sebelum import
 */
export const previewImportData = async (req, res) => {
  try {
    console.log('👀 Preview import data request received');
    console.log('👤 User:', req.user?.username, 'Role:', req.user?.role, 'Cabang ID:', req.user?.cabang_id, 'Type:', typeof req.user?.cabang_id);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File tidak ditemukan'
      });
    }

    const file = req.file;
    let importData;

    // Parse file berdasarkan tipe
    if (file.mimetype === 'application/json') {
      const fileContent = file.buffer.toString('utf8');
      const parsedData = JSON.parse(fileContent);

      // Jika format backup dengan metadata
      if (parsedData.metadata && parsedData.data) {
        importData = parsedData.data;
      } else if (Array.isArray(parsedData)) {
        importData = parsedData;
      } else {
        throw new Error('Format JSON tidak valid');
      }
    } else {
      throw new Error('Format file tidak didukung untuk preview. Gunakan JSON.');
    }

    if (!Array.isArray(importData) || importData.length === 0) {
      throw new Error('Data import kosong atau format tidak valid');
    }

    // Analisis data yang akan diimport
    const analysis = {
      totalRecords: importData.length,
      statusBreakdown: {},
      cabangBreakdown: {},
      existingRecords: [],
      newRecords: [],
      conflicts: [],
      crossCabangWarnings: []
    };

    // Analisis status dan cabang
    importData.forEach(item => {
      const status = item.status || 'pending';
      const cabangId = item.cabang_id || req.user.cabang_id;

      // Check for cross-cabang import (admin cabang only)
      if (req.user.role !== 'super' && item.cabang_id) {
        // Convert both to numbers for proper comparison
        const itemCabangId = parseInt(item.cabang_id);
        const userCabangId = parseInt(req.user.cabang_id);

        console.log('🔍 Cross-cabang check:', {
          itemCabangId,
          userCabangId,
          itemCabangIdType: typeof item.cabang_id,
          userCabangIdType: typeof req.user.cabang_id,
          itemCabangIdRaw: item.cabang_id,
          userCabangIdRaw: req.user.cabang_id,
          isDifferent: itemCabangId !== userCabangId
        });

        if (itemCabangId !== userCabangId) {
          analysis.crossCabangWarnings.push({
            kode_referensi: item.kode_referensi,
            nama_lengkap: item.nama_lengkap,
            originalCabang: item.cabang_id,
            userCabang: req.user.cabang_id
          });
        }
      }

      analysis.statusBreakdown[status] = (analysis.statusBreakdown[status] || 0) + 1;
      analysis.cabangBreakdown[cabangId] = (analysis.cabangBreakdown[cabangId] || 0) + 1;
    });

    // Simple conflict detection - check for existing NIK/no_id with pending/approved status
    for (const item of importData) {
      const nikToCheck = item.no_id || item.nik;
      
      if (nikToCheck) {
        try {
          const existingQuery = await pool.query(
            `SELECT p.status, cs.kode_referensi
             FROM cdd_self cs
             JOIN pengajuan_tabungan p ON cs.pengajuan_id = p.id
             WHERE cs.no_id = $1 
             LIMIT 1`,
            [nikToCheck]
          );

          if (existingQuery.rows.length > 0) {
            const existing = existingQuery.rows[0];
            const isBlocked = ['pending', 'approved'].includes(existing.status);

            if (isBlocked) {
              // Status conflict - existing submission blocks import
              analysis.conflicts.push({
                kode_referensi: existing.kode_referensi || item.kode_referensi,
                nama_lengkap: item.nama_lengkap || item.nama,
                no_id: nikToCheck,
                currentStatus: existing.status,
                newStatus: item.status || 'pending',
                message: `NIK sudah ada dengan status ${existing.status}`
              });
            } else {
              // Can replace rejected submission
              analysis.existingRecords.push({
                kode_referensi: existing.kode_referensi || item.kode_referensi,
                nama_lengkap: item.nama_lengkap || item.nama,
                no_id: nikToCheck,
                currentStatus: existing.status,
                newStatus: item.status || 'pending'
              });
            }
          } else {
            // New record
            analysis.newRecords.push({
              kode_referensi: item.kode_referensi || `NEW-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              nama_lengkap: item.nama_lengkap || item.nama,
              no_id: nikToCheck,
              status: item.status || 'pending'
            });
          }
        } catch (err) {
          console.error(`Error checking NIK ${nikToCheck}:`, err);
          // Treat as new record if error
          analysis.newRecords.push({
            kode_referensi: item.kode_referensi || `NEW-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            nama_lengkap: item.nama_lengkap || item.nama,
            no_id: nikToCheck,
            status: item.status || 'pending'
          });
        }
      } else {
        // No NIK, treat as new record
        analysis.newRecords.push({
          kode_referensi: item.kode_referensi || `NEW-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          nama_lengkap: item.nama_lengkap || item.nama,
          status: item.status || 'pending'
        });
      }
    }

    // Get cabang names untuk breakdown
    const cabangIds = Object.keys(analysis.cabangBreakdown);
    if (cabangIds.length > 0) {
      const cabangQuery = `SELECT id, nama_cabang FROM cabang WHERE id IN (${cabangIds.map((_, i) => `$${i + 1}`).join(',')})`;
      const cabangResult = await pool.query(cabangQuery, cabangIds);

      const cabangNames = {};
      cabangResult.rows.forEach(row => {
        cabangNames[row.id] = row.nama_cabang;
      });

      // Replace cabang IDs with names
      const namedCabangBreakdown = {};
      Object.entries(analysis.cabangBreakdown).forEach(([id, count]) => {
        const name = cabangNames[id] || `Cabang ${id}`;
        namedCabangBreakdown[name] = count;
      });
      analysis.cabangBreakdown = namedCabangBreakdown;
    }

    console.log(`✅ Preview completed: ${analysis.totalRecords} total, ${analysis.newRecords.length} new, ${analysis.existingRecords.length} existing, ${analysis.conflicts.length} conflicts`);

    res.json({
      success: true,
      analysis: analysis,
      message: 'Preview data berhasil dianalisis'
    });

  } catch (err) {
    console.error('❌ Preview import error:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal menganalisis data import',
      error: err.message
    });
  }
};

/**
 * Import data dari file
 */
export const importData = async (req, res) => {
  const client = await pool.connect();

  try {
    console.log('📥 Import data request received');
    console.log('👤 User:', req.user?.username, 'Role:', req.user?.role, 'Cabang ID:', req.user?.cabang_id, 'Type:', typeof req.user?.cabang_id);
    console.log('🔄 Overwrite mode:', req.body.overwrite);

    const sessionId = req.body.sessionId;
    if (sessionId) {
      updateImportProgress(sessionId, 5, 'Memulai proses import...');
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File tidak ditemukan'
      });
    }

    const file = req.file;
    let importData;

    // Parse file berdasarkan tipe
    if (file.mimetype === 'application/json') {
      const fileContent = file.buffer.toString('utf8');
      const parsedData = JSON.parse(fileContent);

      // Jika format backup dengan metadata
      if (parsedData.metadata && parsedData.data) {
        importData = parsedData.data;
      } else if (Array.isArray(parsedData)) {
        importData = parsedData;
      } else {
        throw new Error('Format JSON tidak valid');
      }
    } else {
      throw new Error('Format file tidak didukung. Gunakan JSON untuk import.');
    }

    if (!Array.isArray(importData) || importData.length === 0) {
      throw new Error('Data import kosong atau format tidak valid');
    }

    if (sessionId) {
      updateImportProgress(sessionId, 10, `File berhasil diparse. Ditemukan ${importData.length} records.`);
    }

    await client.query('BEGIN');

    const overwriteMode = req.body.overwrite === 'true';
    let importedCount = 0;
    let skippedCount = 0;
    let overwrittenCount = 0;
    const totalRecords = importData.length;

    for (let index = 0; index < importData.length; index++) {
      const item = importData[index];

      // Update progress
      if (sessionId && index % 5 === 0) { // Update every 5 records to avoid spam
        const progress = 15 + Math.floor((index / totalRecords) * 70); // 15% to 85%
        const message = overwriteMode
          ? `Memproses record ${index + 1}/${totalRecords} (Mode: Replace)`
          : `Memproses record ${index + 1}/${totalRecords} (Mode: Add New)`;
        updateImportProgress(sessionId, progress, message);
      }

      try {
        // Role-based access control untuk cabang_id
        let targetCabangId = item.cabang_id || req.user.cabang_id;

        // Admin cabang hanya bisa import ke cabang mereka sendiri
        if (req.user.role !== 'super' && item.cabang_id) {
          // Convert both to numbers for proper comparison
          const itemCabangId = parseInt(item.cabang_id);
          const userCabangId = parseInt(req.user.cabang_id);

          console.log('🔍 Import cabang check:', {
            itemCabangId,
            userCabangId,
            itemCabangIdType: typeof item.cabang_id,
            userCabangIdType: typeof req.user.cabang_id,
            isDifferent: itemCabangId !== userCabangId
          });

          if (itemCabangId !== userCabangId) {
            console.log(`⚠️ Admin cabang ${req.user.cabang_id} mencoba import data cabang ${item.cabang_id} - dilewati`);
            skippedCount++;
            continue;
          }
        }

        // Pastikan admin cabang hanya import ke cabang mereka
        if (req.user.role !== 'super') {
          targetCabangId = req.user.cabang_id;
        }

        // Cek apakah data sudah ada berdasarkan kode_referensi
        const existingCheck = await client.query(
          `SELECT p.id, p.status 
           FROM pengajuan_tabungan p
           LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
           WHERE cs.kode_referensi = $1`,
          [item.kode_referensi]
        );

        if (existingCheck.rows.length > 0) {
          if (overwriteMode) {
            // Update data yang sudah ada dengan semua field approval
            const pengajuanId = existingCheck.rows[0].id;
            const newStatus = item.status || 'pending';

            let updateQuery = `
              UPDATE pengajuan_tabungan 
              SET status = $1
            `;
            let updateParams = [newStatus];
            let paramIndex = 1;

            // Update approval fields berdasarkan status
            if (newStatus === 'approved') {
              updateQuery += `, approved_at = $${++paramIndex}, rejected_at = NULL, rejected_by = NULL`;
              updateParams.push(item.approved_at || new Date());

              if (item.approvedBy) {
                // Cari user ID berdasarkan username
                const userQuery = await client.query('SELECT id FROM users WHERE username = $1', [item.approvedBy]);
                if (userQuery.rows.length > 0) {
                  updateQuery += `, approved_by = $${++paramIndex}`;
                  updateParams.push(userQuery.rows[0].id);
                }
              }
            } else if (newStatus === 'rejected') {
              updateQuery += `, rejected_at = $${++paramIndex}, approved_at = NULL, approved_by = NULL`;
              updateParams.push(item.rejected_at || new Date());

              if (item.rejectedBy) {
                // Cari user ID berdasarkan username
                const userQuery = await client.query('SELECT id FROM users WHERE username = $1', [item.rejectedBy]);
                if (userQuery.rows.length > 0) {
                  updateQuery += `, rejected_by = $${++paramIndex}`;
                  updateParams.push(userQuery.rows[0].id);
                }
              }
            } else {
              // Status pending - clear approval fields
              updateQuery += `, approved_at = NULL, approved_by = NULL, rejected_at = NULL, rejected_by = NULL`;
            }

            updateQuery += ` WHERE id = $${++paramIndex}`;
            updateParams.push(pengajuanId);

            await client.query(updateQuery, updateParams);

            overwrittenCount++;
            continue; // Skip the insert part
          } else {
            skippedCount++;
            continue;
          }
        }

        // Validasi data sebelum insert
        if (!item.nama_lengkap || !item.kode_referensi) {
          console.log(`⚠️ Skipping item with missing required data:`, {
            kode_referensi: item.kode_referensi,
            nama_lengkap: item.nama_lengkap
          });
          skippedCount++;
          continue;
        }

        console.log(`📝 Inserting item:`, {
          kode_referensi: item.kode_referensi,
          nama_lengkap: item.nama_lengkap,
          targetCabangId,
          status: item.status || 'pending'
        });

        // Insert data baru (Multi-table insert) dengan approval fields
        const newStatus = item.status || 'pending';
        let insertPengajuanQuery = `
          INSERT INTO pengajuan_tabungan (
            cabang_id, status, created_at
        `;
        let insertParams = [targetCabangId, newStatus, item.created_at || new Date()];
        let paramIndex = 3;

        // Tambahkan approval fields berdasarkan status
        if (newStatus === 'approved') {
          insertPengajuanQuery += `, approved_at`;
          insertParams.push(item.approved_at || new Date());
          paramIndex++;

          if (item.approvedBy) {
            // Cari user ID berdasarkan username
            const userQuery = await client.query('SELECT id FROM users WHERE username = $1', [item.approvedBy]);
            if (userQuery.rows.length > 0) {
              insertPengajuanQuery += `, approved_by`;
              insertParams.push(userQuery.rows[0].id);
              paramIndex++;
            }
          }
        } else if (newStatus === 'rejected') {
          insertPengajuanQuery += `, rejected_at`;
          insertParams.push(item.rejected_at || new Date());
          paramIndex++;

          if (item.rejectedBy) {
            // Cari user ID berdasarkan username
            const userQuery = await client.query('SELECT id FROM users WHERE username = $1', [item.rejectedBy]);
            if (userQuery.rows.length > 0) {
              insertPengajuanQuery += `, rejected_by`;
              insertParams.push(userQuery.rows[0].id);
              paramIndex++;
            }
          }
        }

        insertPengajuanQuery += `) VALUES (`;
        for (let i = 1; i <= insertParams.length; i++) {
          insertPengajuanQuery += `$${i}`;
          if (i < insertParams.length) insertPengajuanQuery += ', ';
        }
        insertPengajuanQuery += `) RETURNING id`;

        const pengajuanRes = await client.query(insertPengajuanQuery, insertParams);
        const pengajuanId = pengajuanRes.rows[0].id;

        // Insert cdd_self
        const insertCddSelfQuery = `
          INSERT INTO cdd_self (
            pengajuan_id, kode_referensi, nama, alias, jenis_id, no_id, berlaku_id,
            tempat_lahir, tanggal_lahir, alamat_id, kode_pos_id, alamat_now,
            jenis_kelamin, status_kawin, agama, pendidikan, nama_ibu_kandung,
            npwp, email, no_hp, kewarganegaraan, status_rumah, rekening_untuk_sendiri,
            tipe_nasabah, nomor_rekening_lama, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11, $12,
            $13, $14, $15, $16, $17,
            $18, $19, $20, $21, $22, $23,
            $24, $25, NOW()
          )
        `;

        // Prepare safe values with proper defaults
        const cddSelfValues = [
          pengajuanId,
          item.kode_referensi || `IMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          item.nama_lengkap || 'Unknown',
          item.alias || null,
          item.identityType || item.jenis_id || 'KTP',
          item.nik || item.no_id || 'UNKNOWN',
          item.berlaku_id || null,
          item.tempat_lahir || 'Unknown',
          item.tanggal_lahir || null,
          item.alamat || item.alamat_id || 'Unknown',
          item.kode_pos || item.kode_pos_id || '00000',
          item.alamat_domisili || item.alamat_now || item.alamat || item.alamat_id || 'Unknown',
          item.jenis_kelamin || 'L',
          item.status_pernikahan || item.status_kawin || 'Belum Kawin',
          item.agama || 'Islam',
          item.pendidikan || 'SMA',
          item.nama_ibu_kandung || 'Unknown',
          item.npwp || null,
          item.email || 'unknown@example.com',
          item.no_hp || '08000000000',
          item.kewarganegaraan || 'WNI',
          item.status_rumah || 'Milik Sendiri',
          item.rekening_untuk_sendiri !== false,
          item.tipe_nasabah || 'baru',
          item.nomor_rekening_lama || null
        ];

        await client.query(insertCddSelfQuery, cddSelfValues);

        // Insert cdd_job
        const insertCddJobQuery = `
          INSERT INTO cdd_job (
            pengajuan_id, pekerjaan, gaji_per_bulan, sumber_dana, rata_transaksi_per_bulan,
            nama_perusahaan, alamat_perusahaan, no_telepon, jabatan, bidang_usaha, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        `;

        await client.query(insertCddJobQuery, [
          pengajuanId,
          item.pekerjaan || 'Tidak Bekerja',
          item.penghasilan || item.gaji_per_bulan || '0',
          item.sumber_dana || 'Gaji',
          item.rata_rata_transaksi || item.rata_transaksi_per_bulan || '0',
          item.tempat_bekerja || item.nama_perusahaan || 'Tidak Ada',
          item.alamat_kantor || item.alamat_perusahaan || 'Tidak Ada',
          item.telepon_perusahaan || item.no_telepon || null,
          item.jabatan || 'Tidak Ada',
          item.bidang_usaha || 'Lainnya'
        ]);

        // Insert account
        const insertAccountQuery = `
          INSERT INTO account (
            pengajuan_id, tabungan_tipe, atm, atm_tipe,
            nominal_setoran, tujuan_pembukaan, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `;

        await client.query(insertAccountQuery, [
          pengajuanId,
          item.jenis_rekening || 'simpel',
          item.jenis_kartu ? 1 : 0,
          item.jenis_kartu || null,
          item.nominal_setoran || null,
          item.tujuan_rekening || ''
        ]);

        // Insert cdd_reference (Emergency Contact)
        if (item.kontak_darurat_nama) {
          const insertRefQuery = `
            INSERT INTO cdd_reference (
              pengajuan_id, nama, alamat, no_hp, hubungan, created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())
          `;
          await client.query(insertRefQuery, [
            pengajuanId,
            item.kontak_darurat_nama,
            item.kontak_darurat_alamat || '',
            item.kontak_darurat_hp || '',
            item.kontak_darurat_hubungan || ''
          ]);
        }

        // Insert BO (Beneficial Owner)
        if (item.rekening_untuk_sendiri === false && item.bo_nama) {
          const insertBoQuery = `
            INSERT INTO bo (
              pengajuan_id, nama, alamat, tempat_lahir, tanggal_lahir,
              jenis_kelamin, kewarganegaraan, status_pernikahan,
              jenis_id, nomor_id, sumber_dana, hubungan, nomor_hp,
              pekerjaan, pendapatan_tahunan, persetujuan, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
          `;
          await client.query(insertBoQuery, [
            pengajuanId,
            item.bo_nama,
            item.bo_alamat || '',
            item.bo_tempat_lahir || '',
            item.bo_tanggal_lahir || null,
            item.bo_jenis_kelamin || '',
            item.bo_kewarganegaraan || '',
            item.bo_status_pernikahan || '',
            item.bo_jenis_id || '',
            item.bo_nomor_id || '',
            item.bo_sumber_dana || '',
            item.bo_hubungan || '',
            item.bo_nomor_hp || '',
            item.bo_pekerjaan || '',
            item.bo_pendapatan_tahun || '',
            item.bo_persetujuan === true
          ]);
        }

        importedCount++;
      } catch (itemError) {
        console.error('❌ Error importing item:', {
          kode_referensi: item.kode_referensi,
          nama_lengkap: item.nama_lengkap,
          error: itemError.message,
          code: itemError.code,
          detail: itemError.detail,
          hint: itemError.hint,
          position: itemError.position
        });

        // If this is the first error, it will abort the transaction
        if (itemError.code !== '25P02') {
          console.error('🔥 ORIGINAL ERROR (not transaction abort):', itemError);
        }

        skippedCount++;
      }
    }

    await client.query('COMMIT');

    if (sessionId) {
      updateImportProgress(sessionId, 90, 'Menyimpan perubahan ke database...');
    }

    console.log(`✅ Import completed: ${importedCount} imported, ${overwrittenCount} overwritten, ${skippedCount} skipped`);

    // Log aktivitas import
    const roleInfo = req.user.role === 'super' ? 'Super Admin' : `Admin Cabang ${req.user.cabang_id}`;
    const logDescription = overwriteMode
      ? `Import Data (Overwrite) oleh ${roleInfo}: ${importedCount} baru, ${overwrittenCount} ditimpa, ${skippedCount} dilewati dari ${importData.length} total`
      : `Import Data oleh ${roleInfo}: ${importedCount} berhasil, ${skippedCount} dilewati dari ${importData.length} total`;

    await logUserActivity(
      req.user.id,
      'IMPORT_DATA',
      logDescription,
      req.user.cabang_id,
      req.ip,
      req.get('User-Agent')
    );

    if (sessionId) {
      updateImportProgress(sessionId, 100, `Import selesai! ${importedCount} berhasil, ${overwrittenCount} ditimpa, ${skippedCount} dilewati.`);

      // Clean up progress after 30 seconds
      setTimeout(() => {
        importProgressStore.delete(sessionId);
      }, 30000);
    }

    res.json({
      success: true,
      message: `Import berhasil diselesaikan`,
      imported: importedCount,
      overwritten: overwrittenCount,
      skipped: skippedCount,
      total: importData.length
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Import error:', err);

    const sessionId = req.body.sessionId;
    if (sessionId) {
      updateImportProgress(sessionId, 0, `Error: ${err.message}`);
      // Clean up progress after 10 seconds on error
      setTimeout(() => {
        importProgressStore.delete(sessionId);
      }, 10000);
    }

    res.status(500).json({
      success: false,
      message: 'Gagal mengimpor data',
      error: err.message
    });
  } finally {
    client.release();
  }
};
/**
 * Delete data berdasarkan status
 */
export const deleteDataByStatus = async (req, res) => {
  const client = await pool.connect();

  try {
    console.log('🗑️ Delete data request received');
    console.log('👤 User:', req.user?.username, 'Role:', req.user?.role, 'Cabang:', req.user?.cabang_id);
    console.log('🎯 Status to delete:', req.params.status);
    console.log('🏢 Cabang filter:', req.query.cabangId);

    const userRole = req.user.role;
    const adminCabang = req.user.cabang_id;
    const { status } = req.params;
    const { cabangId } = req.query;

    // Validasi status
    const validStatuses = ['all', 'pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid'
      });
    }

    await client.query('BEGIN');

    // Build query berdasarkan status dan role
    let whereConditions = [];
    let queryParams = [];

    // Role-based filtering
    if (userRole === 'super') {
      // Super admin bisa pilih cabang atau semua
      if (cabangId && cabangId !== 'all') {
        whereConditions.push(`cabang_id = $${queryParams.length + 1}`);
        queryParams.push(parseInt(cabangId));
      }
      // Jika cabangId = 'all' atau tidak ada, tidak ada filter cabang (hapus semua)
    } else {
      // Admin cabang hanya bisa hapus data cabangnya sendiri
      whereConditions.push(`cabang_id = $${queryParams.length + 1}`);
      queryParams.push(adminCabang);
    }

    // Status filtering
    if (status !== 'all') {
      whereConditions.push(`status = $${queryParams.length + 1}`);
      queryParams.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // First, get count of records to be deleted
    const countQuery = `SELECT COUNT(*) as count FROM pengajuan_tabungan ${whereClause}`;
    const countResult = await client.query(countQuery, queryParams);
    const recordCount = parseInt(countResult.rows[0].count);

    if (recordCount === 0) {
      await client.query('ROLLBACK');
      return res.json({
        success: true,
        message: 'Tidak ada data yang ditemukan untuk dihapus',
        deletedCount: 0
      });
    }

    // Get IDs of records to be deleted for cascade deletion
    const idsQuery = `SELECT id FROM pengajuan_tabungan ${whereClause}`;
    const idsResult = await client.query(idsQuery, queryParams);
    const recordIds = idsResult.rows.map(row => row.id);

    // Delete related records first (to handle foreign key constraints)
    if (recordIds.length > 0) {
      const idPlaceholders = recordIds.map((_, index) => `$${index + 1}`).join(',');

      // Delete from related tables
      await client.query(`DELETE FROM edd_bank_lain WHERE pengajuan_id IN (${idPlaceholders})`, recordIds);
      await client.query(`DELETE FROM edd_pekerjaan_lain WHERE pengajuan_id IN (${idPlaceholders})`, recordIds);
      await client.query(`DELETE FROM bo WHERE pengajuan_id IN (${idPlaceholders})`, recordIds);
      await client.query(`DELETE FROM cdd_reference WHERE pengajuan_id IN (${idPlaceholders})`, recordIds);
      await client.query(`DELETE FROM account WHERE pengajuan_id IN (${idPlaceholders})`, recordIds);
      await client.query(`DELETE FROM cdd_job WHERE pengajuan_id IN (${idPlaceholders})`, recordIds);
      await client.query(`DELETE FROM cdd_self WHERE pengajuan_id IN (${idPlaceholders})`, recordIds);
    }

    // Finally, delete from main table
    const deleteQuery = `DELETE FROM pengajuan_tabungan ${whereClause}`;
    const deleteResult = await client.query(deleteQuery, queryParams);

    await client.query('COMMIT');

    const statusText = {
      all: 'semua data',
      pending: 'data dengan status pending',
      approved: 'data dengan status disetujui',
      rejected: 'data dengan status ditolak'
    };

    // Get cabang name for response message
    let cabangInfo = '';
    if (userRole === 'super' && cabangId && cabangId !== 'all') {
      const cabangQuery = await pool.query('SELECT nama_cabang FROM cabang WHERE id = $1', [cabangId]);
      if (cabangQuery.rows.length > 0) {
        cabangInfo = ` dari ${cabangQuery.rows[0].nama_cabang}`;
      }
    } else if (userRole !== 'super') {
      const cabangQuery = await pool.query('SELECT nama_cabang FROM cabang WHERE id = $1', [adminCabang]);
      if (cabangQuery.rows.length > 0) {
        cabangInfo = ` dari ${cabangQuery.rows[0].nama_cabang}`;
      }
    }

    console.log(`✅ Delete completed: ${recordCount} records deleted (status: ${status}, cabang: ${cabangId || 'current'})`);

    // Log aktivitas delete
    const statusTextForLog = {
      all: 'semua data',
      pending: 'data pending',
      approved: 'data disetujui',
      rejected: 'data ditolak'
    };

    let logDescription = `Hapus ${statusTextForLog[status]}: ${recordCount} records`;
    if (userRole === 'super' && cabangId && cabangId !== 'all') {
      const cabangQuery = await pool.query('SELECT nama_cabang FROM cabang WHERE id = $1', [cabangId]);
      if (cabangQuery.rows.length > 0) {
        logDescription += ` dari ${cabangQuery.rows[0].nama_cabang}`;
      }
    } else if (userRole === 'super' && (!cabangId || cabangId === 'all')) {
      logDescription += ' dari semua cabang';
    }

    await logUserActivity(
      req.user.id,
      'DELETE_DATA',
      logDescription,
      req.user.cabang_id,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: `Berhasil menghapus ${statusText[status]}${cabangInfo}`,
      deletedCount: recordCount,
      status: status,
      cabangId: cabangId || 'current'
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Delete error:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data',
      error: err.message
    });
  } finally {
    client.release();
  }
};

/**
 * Edit submission data (only for approved submissions)
 */
export const editSubmission = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { editReason, ...editData } = req.body;
    const { cabang_id: adminCabang, role: userRole, id: userId } = req.user;

    console.log('✏️ Edit submission request:', {
      submissionId: id,
      userId,
      userRole,
      editReason,
      fieldsToEdit: Object.keys(editData)
    });

    // Check if submission exists and is approved
    const submissionQuery = `
      SELECT p.*, cs.kode_referensi, cs.nama
      FROM pengajuan_tabungan p
      LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
      WHERE p.id = $1 ${userRole === 'super' ? '' : 'AND p.cabang_id = $2'}
    `;
    
    const queryParams = userRole === 'super' ? [id] : [id, adminCabang];
    const submissionResult = await client.query(submissionQuery, queryParams);

    if (submissionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission tidak ditemukan atau tidak memiliki akses'
      });
    }

    const submission = submissionResult.rows[0];

    // Only allow editing approved submissions
    if (submission.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Hanya submission yang sudah disetujui yang dapat diedit'
      });
    }

    await client.query('BEGIN');

    // Store original approval info if this is the first edit
    if (!submission.original_approved_by) {
      await client.query(`
        UPDATE pengajuan_tabungan 
        SET original_approved_by = approved_by, original_approved_at = approved_at
        WHERE id = $1
      `, [id]);
    }

    // Get current data for comparison
    const currentDataQuery = `
      SELECT 
        cs.*, cj.*, acc.*, cref.nama as ref_nama, cref.no_hp as ref_no_hp, 
        cref.alamat as ref_alamat, cref.hubungan as ref_hubungan,
        bo.nama as bo_nama, bo.alamat as bo_alamat, bo.tempat_lahir as bo_tempat_lahir,
        bo.tanggal_lahir as bo_tanggal_lahir, bo.jenis_kelamin as bo_jenis_kelamin,
        bo.kewarganegaraan as bo_kewarganegaraan, bo.status_pernikahan as bo_status_pernikahan,
        bo.jenis_id as bo_jenis_id, bo.nomor_id as bo_nomor_id, bo.sumber_dana as bo_sumber_dana,
        bo.hubungan as bo_hubungan, bo.nomor_hp as bo_nomor_hp, bo.pekerjaan as bo_pekerjaan,
        bo.pendapatan_tahunan as bo_pendapatan_tahun, bo.persetujuan as bo_persetujuan
      FROM cdd_self cs
      LEFT JOIN cdd_job cj ON cs.pengajuan_id = cj.pengajuan_id
      LEFT JOIN account acc ON cs.pengajuan_id = acc.pengajuan_id
      LEFT JOIN cdd_reference cref ON cs.pengajuan_id = cref.pengajuan_id
      LEFT JOIN bo bo ON cs.pengajuan_id = bo.pengajuan_id
      WHERE cs.pengajuan_id = $1
    `;

    const currentData = await client.query(currentDataQuery, [id]);
    const current = currentData.rows[0];

    // Field mapping for different tables
    const fieldMapping = {
      // cdd_self fields
      nama: { table: 'cdd_self', column: 'nama', current: current.nama },
      alias: { table: 'cdd_self', column: 'alias', current: current.alias },
      jenis_id: { table: 'cdd_self', column: 'jenis_id', current: current.jenis_id },
      no_id: { table: 'cdd_self', column: 'no_id', current: current.no_id },
      berlaku_id: { table: 'cdd_self', column: 'berlaku_id', current: current.berlaku_id },
      tempat_lahir: { table: 'cdd_self', column: 'tempat_lahir', current: current.tempat_lahir },
      tanggal_lahir: { table: 'cdd_self', column: 'tanggal_lahir', current: current.tanggal_lahir },
      alamat_id: { table: 'cdd_self', column: 'alamat_id', current: current.alamat_id },
      alamat_jalan: { table: 'cdd_self', column: 'alamat_jalan', current: current.alamat_jalan },
      provinsi: { table: 'cdd_self', column: 'provinsi', current: current.provinsi },
      kota: { table: 'cdd_self', column: 'kota', current: current.kota },
      kecamatan: { table: 'cdd_self', column: 'kecamatan', current: current.kecamatan },
      kelurahan: { table: 'cdd_self', column: 'kelurahan', current: current.kelurahan },
      kode_pos_id: { table: 'cdd_self', column: 'kode_pos_id', current: current.kode_pos_id },
      alamat_now: { table: 'cdd_self', column: 'alamat_now', current: current.alamat_now },
      jenis_kelamin: { table: 'cdd_self', column: 'jenis_kelamin', current: current.jenis_kelamin },
      status_kawin: { table: 'cdd_self', column: 'status_kawin', current: current.status_kawin },
      agama: { table: 'cdd_self', column: 'agama', current: current.agama },
      pendidikan: { table: 'cdd_self', column: 'pendidikan', current: current.pendidikan },
      nama_ibu_kandung: { table: 'cdd_self', column: 'nama_ibu_kandung', current: current.nama_ibu_kandung },
      npwp: { table: 'cdd_self', column: 'npwp', current: current.npwp },
      email: { table: 'cdd_self', column: 'email', current: current.email },
      no_hp: { table: 'cdd_self', column: 'no_hp', current: current.no_hp },
      kewarganegaraan: { table: 'cdd_self', column: 'kewarganegaraan', current: current.kewarganegaraan },
      status_rumah: { table: 'cdd_self', column: 'status_rumah', current: current.status_rumah },
      
      // cdd_job fields
      pekerjaan: { table: 'cdd_job', column: 'pekerjaan', current: current.pekerjaan },
      gaji_per_bulan: { table: 'cdd_job', column: 'gaji_per_bulan', current: current.gaji_per_bulan },
      sumber_dana: { table: 'cdd_job', column: 'sumber_dana', current: current.sumber_dana },
      rata_transaksi_per_bulan: { table: 'cdd_job', column: 'rata_transaksi_per_bulan', current: current.rata_transaksi_per_bulan },
      nama_perusahaan: { table: 'cdd_job', column: 'nama_perusahaan', current: current.nama_perusahaan },
      alamat_perusahaan: { table: 'cdd_job', column: 'alamat_perusahaan', current: current.alamat_perusahaan },
      no_telepon: { table: 'cdd_job', column: 'no_telepon', current: current.no_telepon },
      jabatan: { table: 'cdd_job', column: 'jabatan', current: current.jabatan },
      bidang_usaha: { table: 'cdd_job', column: 'bidang_usaha', current: current.bidang_usaha },
      
      // account fields
      tabungan_tipe: { table: 'account', column: 'tabungan_tipe', current: current.tabungan_tipe },
      atm_tipe: { table: 'account', column: 'atm_tipe', current: current.atm_tipe },
      nominal_setoran: { table: 'account', column: 'nominal_setoran', current: current.nominal_setoran },
      tujuan_pembukaan: { table: 'account', column: 'tujuan_pembukaan', current: current.tujuan_pembukaan },
      
      // cdd_reference fields
      kontak_darurat_nama: { table: 'cdd_reference', column: 'nama', current: current.ref_nama },
      kontak_darurat_hp: { table: 'cdd_reference', column: 'no_hp', current: current.ref_no_hp },
      kontak_darurat_alamat: { table: 'cdd_reference', column: 'alamat', current: current.ref_alamat },
      kontak_darurat_hubungan: { table: 'cdd_reference', column: 'hubungan', current: current.ref_hubungan },
      
      // cdd_self BO-related fields
      rekening_untuk_sendiri: { table: 'cdd_self', column: 'rekening_untuk_sendiri', current: current.rekening_untuk_sendiri },
      
      // bo fields
      bo_nama: { table: 'bo', column: 'nama', current: current.bo_nama },
      bo_alamat: { table: 'bo', column: 'alamat', current: current.bo_alamat },
      bo_tempat_lahir: { table: 'bo', column: 'tempat_lahir', current: current.bo_tempat_lahir },
      bo_tanggal_lahir: { table: 'bo', column: 'tanggal_lahir', current: current.bo_tanggal_lahir },
      bo_jenis_kelamin: { table: 'bo', column: 'jenis_kelamin', current: current.bo_jenis_kelamin },
      bo_kewarganegaraan: { table: 'bo', column: 'kewarganegaraan', current: current.bo_kewarganegaraan },
      bo_status_pernikahan: { table: 'bo', column: 'status_pernikahan', current: current.bo_status_pernikahan },
      bo_jenis_id: { table: 'bo', column: 'jenis_id', current: current.bo_jenis_id },
      bo_nomor_id: { table: 'bo', column: 'nomor_id', current: current.bo_nomor_id },
      bo_sumber_dana: { table: 'bo', column: 'sumber_dana', current: current.bo_sumber_dana },
      bo_hubungan: { table: 'bo', column: 'hubungan', current: current.bo_hubungan },
      bo_nomor_hp: { table: 'bo', column: 'nomor_hp', current: current.bo_nomor_hp },
      bo_pekerjaan: { table: 'bo', column: 'pekerjaan', current: current.bo_pekerjaan },
      bo_pendapatan_tahun: { table: 'bo', column: 'pendapatan_tahunan', current: current.bo_pendapatan_tahun }
    };

    const editHistory = [];
    const tableUpdates = {};

    // Helper function to process field values
    const processFieldValue = (fieldName, value) => {
      // Handle null, undefined, or non-string values
      if (value === null || value === undefined) {
        return null;
      }
      
      // Handle boolean values (like rekening_untuk_sendiri)
      if (typeof value === 'boolean') {
        return value;
      }
      
      // Handle number values
      if (typeof value === 'number') {
        return value;
      }
      
      // Convert to string for processing
      const stringValue = String(value);
      
      // Handle date fields - convert empty string to null
      const dateFields = ['tanggal_lahir', 'berlaku_id', 'bo_tanggal_lahir'];
      if (dateFields.includes(fieldName)) {
        return stringValue && stringValue.trim() !== '' ? stringValue : null;
      }
      
      // Handle currency/numeric fields - remove formatting and validate
      const currencyFields = ['rata_transaksi_per_bulan', 'nominal_setoran']; // Removed gaji_per_bulan - it's a dropdown, not currency
      if (currencyFields.includes(fieldName)) {
        if (!stringValue || stringValue.trim() === '') return null;
        
        // Remove "Rp", dots, commas, and spaces, keep only numbers
        const cleanValue = stringValue.replace(/[Rp\s\.,]/g, '');
        if (!cleanValue) return null;
        
        // Convert to number and validate range for NUMERIC(18,2)
        const numericValue = parseFloat(cleanValue);
        if (isNaN(numericValue)) return null;
        
        // Maximum value for NUMERIC(18,2) is 9999999999999999.99 (16 digits before decimal)
        const maxValue = 9999999999999999.99;
        if (numericValue > maxValue) {
          console.warn(`⚠️ Value ${numericValue} exceeds maximum for ${fieldName}, capping at ${maxValue}`);
          return maxValue.toString();
        }
        
        return cleanValue;
      }
      
      // Handle BO pendapatan_tahun separately (it's a string field, not numeric)
      if (fieldName === 'bo_pendapatan_tahun') {
        return stringValue && stringValue.trim() !== '' ? stringValue : null;
      }
      
      // Fields with NOT NULL constraints - provide defaults
      const requiredFields = {
        'pekerjaan': 'Tidak Bekerja',
        'bidang_usaha': 'Lainnya',
        'nama': 'Unknown',
        'no_id': 'UNKNOWN',
        'email': 'unknown@example.com',
        'no_hp': '08000000000',
        'gaji_per_bulan': '< 3 Juta', // Default salary range for NOT NULL constraint
        'sumber_dana': 'Lainnya', // Default income source
        'jenis_kelamin': 'Laki-laki', // Default gender
        'agama': 'Islam', // Default religion
        'kewarganegaraan': 'Indonesia', // Default citizenship
        'tempat_lahir': 'Unknown', // Default birth place
        'alamat_id': 'Unknown' // Default address
      };
      
      if (requiredFields[fieldName]) {
        return stringValue && stringValue.trim() !== '' ? stringValue : requiredFields[fieldName];
      }
      
      // Handle other empty strings
      return stringValue && stringValue.trim() !== '' ? stringValue : null;
    };

    // Process each field to edit
    for (const [fieldName, rawValue] of Object.entries(editData)) {
      const fieldInfo = fieldMapping[fieldName];
      
      if (!fieldInfo) {
        console.log(`⚠️ Unknown field: ${fieldName}`);
        continue;
      }

      const oldValue = fieldInfo.current;
      const newValue = processFieldValue(fieldName, rawValue);
      
      console.log(`🔍 Processing field ${fieldName}: "${rawValue}" -> "${newValue}" (was: "${oldValue}")`);
      
      // Only update if value actually changed
      if (String(oldValue || '') !== String(newValue || '')) {
        // Group updates by table
        if (!tableUpdates[fieldInfo.table]) {
          tableUpdates[fieldInfo.table] = {};
        }
        tableUpdates[fieldInfo.table][fieldInfo.column] = newValue;

        // Record for audit trail
        editHistory.push({
          field_name: fieldName,
          old_value: oldValue,
          new_value: newValue
        });
      }
    }

    if (editHistory.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Tidak ada perubahan yang terdeteksi'
      });
    }

    // Execute table updates
    for (const [tableName, updates] of Object.entries(tableUpdates)) {
      // Skip BO table here - it will be handled separately with UPSERT
      if (tableName === 'bo') continue;
      
      const setClause = Object.keys(updates).map((col, idx) => `${col} = $${idx + 2}`).join(', ');
      const values = [id, ...Object.values(updates)];
      
      const updateQuery = `UPDATE ${tableName} SET ${setClause} WHERE pengajuan_id = $1`;
      await client.query(updateQuery, values);
    }

    // Special handling for BO table - use UPSERT now that unique constraint exists
    if (tableUpdates.bo) {
      const updates = tableUpdates.bo;
      const columns = Object.keys(updates);
      const placeholders = columns.map((_, idx) => `$${idx + 2}`).join(', ');
      const updateClause = columns.map(col => `${col} = EXCLUDED.${col}`).join(', ');
      
      console.log('🔍 BO Updates:', updates);
      
      // Use INSERT ... ON CONFLICT now that unique constraint exists
      const upsertQuery = `
        INSERT INTO bo (pengajuan_id, ${columns.join(', ')}) 
        VALUES ($1, ${placeholders})
        ON CONFLICT (pengajuan_id) 
        DO UPDATE SET ${updateClause}
      `;
      const values = [id, ...Object.values(updates)];
      
      console.log('🔍 BO UPSERT Query:', upsertQuery);
      console.log('🔍 BO UPSERT Values:', values);
      
      await client.query(upsertQuery, values);
    }

    // Special handling: Delete BO record if rekening_untuk_sendiri is changed to true
    if (tableUpdates.cdd_self && tableUpdates.cdd_self.rekening_untuk_sendiri === true) {
      console.log('🗑️ Deleting BO record because rekening_untuk_sendiri is now true');
      
      // Delete the BO record for this pengajuan_id
      const deleteBoQuery = 'DELETE FROM bo WHERE pengajuan_id = $1';
      const deleteResult = await client.query(deleteBoQuery, [id]);
      
      console.log('🗑️ BO deletion result:', deleteResult.rowCount, 'rows deleted');
      
      // Also add to edit history that BO data was cleared
      editHistory.push({
        field_name: 'bo_data_cleared',
        old_value: 'BO data existed',
        new_value: 'BO data cleared (account for self)'
      });
    }

    // Insert audit trail records
    for (const edit of editHistory) {
      await client.query(`
        INSERT INTO submission_edit_history 
        (pengajuan_id, edited_by, field_name, old_value, new_value, edit_reason)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [id, userId, edit.field_name, edit.old_value, edit.new_value, editReason]);
    }

    // Update main submission record
    await client.query(`
      UPDATE pengajuan_tabungan 
      SET last_edited_at = NOW(), 
          last_edited_by = $1, 
          edit_count = COALESCE(edit_count, 0) + 1
      WHERE id = $2
    `, [userId, id]);

    await client.query('COMMIT');

    // Log activity
    await logUserActivity(
      userId,
      'EDIT_SUBMISSION',
      `Edit submission ${submission.kode_referensi} (${submission.nama}): ${editHistory.length} fields changed`,
      adminCabang,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'Submission berhasil diedit',
      changedFields: editHistory.length,
      editHistory: editHistory.map(h => ({
        field: h.field_name,
        oldValue: h.old_value,
        newValue: h.new_value
      }))
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Edit submission error:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal mengedit submission',
      error: err.message
    });
  } finally {
    client.release();
  }
};

/**
 * Get edit history for a submission
 */
export const getEditHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { cabang_id: adminCabang, role: userRole } = req.user;

    // Check access to submission
    const accessQuery = `
      SELECT p.id, cs.kode_referensi, cs.nama
      FROM pengajuan_tabungan p
      LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
      WHERE p.id = $1 ${userRole === 'super' ? '' : 'AND p.cabang_id = $2'}
    `;
    
    const accessParams = userRole === 'super' ? [id] : [id, adminCabang];
    const accessResult = await pool.query(accessQuery, accessParams);

    if (accessResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission tidak ditemukan atau tidak memiliki akses'
      });
    }

    // Get edit history
    const historyQuery = `
      SELECT 
        seh.*,
        u.username as edited_by_username,
        u.username as edited_by_name
      FROM submission_edit_history seh
      LEFT JOIN users u ON seh.edited_by = u.id
      WHERE seh.pengajuan_id = $1
      ORDER BY seh.edited_at DESC
    `;

    const historyResult = await pool.query(historyQuery, [id]);

    // Get submission info with original approver
    const submissionQuery = `
      SELECT 
        p.*,
        ua_orig.username as original_approved_by_username,
        ua_orig.username as original_approved_by_name,
        ua_curr.username as current_approved_by_username,
        ua_curr.username as current_approved_by_name,
        ue.username as last_edited_by_username,
        ue.username as last_edited_by_name
      FROM pengajuan_tabungan p
      LEFT JOIN users ua_orig ON p.original_approved_by = ua_orig.id
      LEFT JOIN users ua_curr ON p.approved_by = ua_curr.id
      LEFT JOIN users ue ON p.last_edited_by = ue.id
      WHERE p.id = $1
    `;

    const submissionResult = await pool.query(submissionQuery, [id]);
    const submission = submissionResult.rows[0];

    res.json({
      success: true,
      data: {
        submission: {
          id: submission.id,
          status: submission.status,
          edit_count: submission.edit_count || 0,
          last_edited_at: submission.last_edited_at,
          last_edited_by: {
            username: submission.last_edited_by_username,
            nama: submission.last_edited_by_name
          },
          original_approved_by: {
            username: submission.original_approved_by_username,
            nama: submission.original_approved_by_name,
            approved_at: submission.original_approved_at
          },
          current_approved_by: {
            username: submission.current_approved_by_username,
            nama: submission.current_approved_by_name,
            approved_at: submission.approved_at
          }
        },
        history: historyResult.rows
      }
    });

  } catch (err) {
    console.error('❌ Get edit history error:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil riwayat edit',
      error: err.message
    });
  }
};