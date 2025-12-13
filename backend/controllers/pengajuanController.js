import pool from "../config/db.js";
import { sendEmailNotification } from "../services/emailService.js";
import { sendWhatsAppNotification } from "../services/whatsappService.js";
import fs from 'fs';

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
    console.log("🔍 Request received at:", new Date().toISOString());

    // Log BO fields immediately
    console.log("🎯 BO Fields from request:", {
      bo_jenis_kelamin: req.body.bo_jenis_kelamin,
      bo_kewarganegaraan: req.body.bo_kewarganegaraan,
      bo_status_pernikahan: req.body.bo_status_pernikahan,
      bo_sumber_dana: req.body.bo_sumber_dana,
      bo_hubungan: req.body.bo_hubungan,
      bo_nomor_hp: req.body.bo_nomor_hp
    });

    // Write to file for debugging
    fs.writeFileSync('debug-bo.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      bo_fields: {
        bo_jenis_kelamin: req.body.bo_jenis_kelamin,
        bo_kewarganegaraan: req.body.bo_kewarganegaraan,
        bo_status_pernikahan: req.body.bo_status_pernikahan,
        bo_sumber_dana: req.body.bo_sumber_dana,
        bo_hubungan: req.body.bo_hubungan,
        bo_nomor_hp: req.body.bo_nomor_hp
      }
    }, null, 2));

    // Debug identity early
    console.log("🆔 Identity debug (early):", {
      jenis_id: req.body.jenis_id,
      jenisIdCustom: req.body.jenisIdCustom,
      alias: req.body.alias
    });

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

    // Debug alamat
    console.log("🏠 Address debug:", {
      alamat_id: alamat_id,
      alamat: alamat,
      alamat_now: alamat_now,
      alamat_domisili: alamat_domisili,
      finalAlamatId: finalAlamatId,
      finalAlamatNow: finalAlamatNow,
      isDifferent: finalAlamatNow !== finalAlamatId
    });

    // Debug identity
    console.log("🆔 Identity debug:", {
      jenis_id: jenis_id,
      jenisIdCustom: jenisIdCustom,
      finalJenisId: finalJenisId,
      alias: alias
    });

    // Debug BO data
    console.log("👤 BO Debug:", {
      rekening_untuk_sendiri: rekening_untuk_sendiri,
      bo_nama: bo_nama,
      bo_jenis_kelamin: bo_jenis_kelamin,
      bo_kewarganegaraan: bo_kewarganegaraan,
      bo_status_pernikahan: bo_status_pernikahan,
      bo_sumber_dana: bo_sumber_dana,
      bo_hubungan: bo_hubungan,
      bo_nomor_hp: bo_nomor_hp
    });


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
    console.log(`✅ Created pengajuan_tabungan ID: ${pengajuanId}`);

    // 2. Insert cdd_self
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


    console.log("📝 CDD Self values being inserted:", {
      finalNama,
      alias,
      finalJenisId,
      finalNoId
    });

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
      console.log('📋 Super admin access - showing all pengajuan');
    } else {
      // Admin cabang can only see pengajuan from their branch
      whereClause = 'WHERE p.cabang_id = $1';
      queryParams = [adminCabang];
      console.log('📋 Branch admin access - filtering by cabang:', adminCabang);
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

/**
 * Mengambil data analytics berdasarkan role
 * - Super admin: bisa lihat semua cabang
 * - Admin cabang: hanya lihat cabangnya sendiri
 */
export const getAnalyticsData = async (req, res) => {
  try {
    console.log('📊 Analytics data request received');
    console.log('📊 User:', req.user?.username, 'Role:', req.user?.role, 'Cabang:', req.user?.cabang_id);

    const userRole = req.user.role;
    const adminCabang = req.user.cabang_id;

    // Tentukan akses berdasarkan role
    let whereClause = '';
    let queryParams = [];

    // Role-based access control
    if (userRole === 'super') {
      // Super admin bisa lihat semua cabang
      console.log('📊 Super admin access - showing all branches');
    } else if (userRole === 'employement' || userRole === 'admin') {
      // Admin cabang hanya lihat cabangnya sendiri
      whereClause = 'WHERE p.cabang_id = $1';
      queryParams = [adminCabang];
      console.log('📊 Branch admin access - filtering by cabang:', adminCabang);
    } else {
      // Role tidak dikenal, default ke cabang sendiri
      whereClause = 'WHERE p.cabang_id = $1';
      queryParams = [adminCabang];
      console.log('📊 Unknown role, defaulting to branch filter:', adminCabang);
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