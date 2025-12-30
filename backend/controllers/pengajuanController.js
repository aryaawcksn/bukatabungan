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
      bo_jenis_id_custom,
      bo_nomor_id,
      bo_sumber_dana,
      bo_sumber_dana_custom,
      bo_hubungan,
      bo_hubungan_custom,
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
      // Process custom fields - use custom value if "Lainnya" is selected
      const finalBoJenisId = bo_jenis_id === 'Lainnya' ? bo_jenis_id_custom : bo_jenis_id;
      const finalBoSumberDana = bo_sumber_dana === 'Lainnya' ? bo_sumber_dana_custom : bo_sumber_dana;
      const finalBoHubungan = bo_hubungan === 'Lainnya' ? bo_hubungan_custom : bo_hubungan;

      console.log("🔥 About to insert BO with values:", {
        bo_jenis_kelamin,
        bo_kewarganegaraan,
        bo_status_pernikahan,
        finalBoJenisId,
        finalBoSumberDana,
        finalBoHubungan,
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
        emptyToNull(finalBoJenisId),
        emptyToNull(bo_nomor_id),
        emptyToNull(finalBoSumberDana),
        emptyToNull(finalBoHubungan),
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
        p.approval_notes,
        p.rejection_notes,
        cs.kode_referensi,
        cs.nama AS nama_lengkap,
        cs.email,
        cs.no_hp,
        acc.tabungan_tipe AS jenis_rekening,
        c.nama_cabang,
        c.alamat AS alamat_cabang
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
        statusMessage = 'Pengajuan ditolak. Anda dapat melengkapi dokumen yang dibutuhkan sebelum mencoba mengajukan kembali.';
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
        approval_notes: data.approval_notes,
        rejection_notes: data.rejection_notes,
        cabang: {
          nama_cabang: data.nama_cabang,
          alamat_cabang: data.alamat_cabang,
          telepon_cabang: null // Kolom telepon tidak tersedia di tabel cabang
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
      p.edit_count,
      p.last_edited_at,
      p.last_edited_by,
      ua.username AS "approvedBy",
        ur.username AS "rejectedBy",
        ue.username AS "lastEditedBy",
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
    LEFT JOIN users ue ON p.last_edited_by = ue.id
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
        p.approval_notes,
        p.rejection_notes,
        p.edit_count,
        p.last_edited_at,
        p.last_edited_by,
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
        ur.username AS "rejectedBy",
        ue.username AS "lastEditedBy"
      FROM pengajuan_tabungan p
      LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
      LEFT JOIN account acc ON p.id = acc.pengajuan_id
      LEFT JOIN cabang c ON p.cabang_id = c.id
      LEFT JOIN users ua ON p.approved_by = ua.id
      LEFT JOIN users ur ON p.rejected_by = ur.id
      LEFT JOIN users ue ON p.last_edited_by = ue.id
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
  const { status, sendEmail, sendWhatsApp, message, notes, isEdit, editReason, ...editData } = req.body;

  // If this is an edit request, delegate to editSubmission
  if (isEdit) {
    // Import editSubmission from editController
    const { editSubmission } = await import('./editController.js');
    req.body = { ...editData, editReason };
    return editSubmission(req, res);
  }

  try {
    // Validate status parameter
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: "Status is required" 
      });
    }

    // Validate status values
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status. Must be one of: pending, approved, rejected" 
      });
    }

    let query, values;
    const userRole = req.user.role;
    const isSuper = userRole === 'super';

    if (status === 'approved') {
      if (isSuper) {
        // Super admin can approve any application
        query = `
          UPDATE pengajuan_tabungan 
          SET status = $1, approved_by = $2, approved_at = NOW(), rejected_by = NULL, rejected_at = NULL,
              approval_notes = $3, rejection_notes = NULL
          WHERE id = $4
        RETURNING *;
        `;
        values = [status, req.user.id, notes || null, id];
      } else {
        // Regular admin can only approve applications from their branch
        query = `
          UPDATE pengajuan_tabungan 
          SET status = $1, approved_by = $2, approved_at = NOW(), rejected_by = NULL, rejected_at = NULL,
              approval_notes = $3, rejection_notes = NULL
          WHERE id = $4 AND cabang_id = $5
        RETURNING *;
        `;
        values = [status, req.user.id, notes || null, id, req.user.cabang_id];
      }
    }
    else if (status === 'rejected') {
      if (isSuper) {
        // Super admin can reject any application
        query = `
          UPDATE pengajuan_tabungan 
          SET status = $1, rejected_by = $2, rejected_at = NOW(), approved_by = NULL, approved_at = NULL,
              rejection_notes = $3, approval_notes = NULL
          WHERE id = $4
        RETURNING *;
        `;
        values = [status, req.user.id, notes || null, id];
      } else {
        // Regular admin can only reject applications from their branch
        query = `
          UPDATE pengajuan_tabungan 
          SET status = $1, rejected_by = $2, rejected_at = NOW(), approved_by = NULL, approved_at = NULL,
              rejection_notes = $3, approval_notes = NULL
          WHERE id = $4 AND cabang_id = $5
        RETURNING *;
        `;
        values = [status, req.user.id, notes || null, id, req.user.cabang_id];
      }
    } else if (status === 'pending') {
      if (isSuper) {
        // Super admin can change any application to pending
        query = `
          UPDATE pengajuan_tabungan 
          SET status = $1, approved_by = NULL, approved_at = NULL, rejected_by = NULL, rejected_at = NULL,
              approval_notes = NULL, rejection_notes = NULL
          WHERE id = $2
        RETURNING *;
        `;
        values = [status, id];
      } else {
        // Regular admin can only change applications from their branch to pending
        query = `
          UPDATE pengajuan_tabungan 
          SET status = $1, approved_by = NULL, approved_at = NULL, rejected_by = NULL, rejected_at = NULL,
              approval_notes = NULL, rejection_notes = NULL
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

    const updatedData = result.rows[0];
    console.log(`✅ Status updated successfully for ID ${id} to ${status}`);

    // Get additional data for notifications
    const detailQuery = `
      SELECT 
        cs.nama, cs.email, cs.no_hp, cs.kode_referensi,
        acc.tabungan_tipe,
        c.nama_cabang, c.alamat
      FROM pengajuan_tabungan p
      LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
      LEFT JOIN account acc ON p.id = acc.pengajuan_id
      LEFT JOIN cabang c ON p.cabang_id = c.id
      WHERE p.id = $1
    `;

    const detailResult = await pool.query(detailQuery, [id]);
    const detail = detailResult.rows[0];

    // Send notifications if requested
    if (sendEmail && detail.email) {
      try {
        await sendEmailNotification({
          to: detail.email,
          subject: `Status Pengajuan Tabungan - ${detail.kode_referensi}`,
          status: status,
          nama: detail.nama,
          kode_referensi: detail.kode_referensi,
          jenis_rekening: detail.tabungan_tipe,
          nama_cabang: detail.nama_cabang,
          alamat_cabang: detail.alamat,
          message: message || notes,
          approved_at: updatedData.approved_at,
          rejected_at: updatedData.rejected_at
        });
        console.log(`📧 Email notification sent to ${detail.email}`);
      } catch (emailErr) {
        console.error('❌ Email notification failed:', emailErr);
      }
    }

    if (sendWhatsApp && detail.no_hp) {
      try {
        await sendWhatsAppNotification({
          to: detail.no_hp,
          status: status,
          nama: detail.nama,
          kode_referensi: detail.kode_referensi,
          jenis_rekening: detail.tabungan_tipe,
          nama_cabang: detail.nama_cabang,
          message: message || notes
        });
        console.log(`📱 WhatsApp notification sent to ${detail.no_hp}`);
      } catch (waErr) {
        console.error('❌ WhatsApp notification failed:', waErr);
      }
    }

    // Log user activity
    await logUserActivity(
      req.user.id,
      'UPDATE_STATUS',
      `Update status pengajuan ${detail.kode_referensi} to ${status}`,
      req.user.cabang_id,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: `Status berhasil diubah menjadi ${status}`,
      data: updatedData
    });

  } catch (err) {
    console.error("❌ Error updating status:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Export backup data sebagai JSON - Simplified version
 */
export const exportBackup = async (req, res) => {
  try {
    console.log('💾 Backup export request received');

    const userRole = req.user.role;
    const adminCabang = req.user.cabang_id;
    const { startDate, endDate, cabangId } = req.query;

    // Query untuk mengambil data lengkap dengan edit tracking yang disederhanakan
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
        p.last_edited_by,
        cs.kode_referensi,
        cs.nama AS nama_lengkap,
        cs.alias,
        cs.jenis_id AS "identityType",
        cs.no_id AS nik,
        cs.berlaku_id,
        cs.tempat_lahir,
        cs.tanggal_lahir,
        cs.jenis_kelamin,
        cs.status_kawin AS status_pernikahan,
        cs.agama,
        cs.pendidikan,
        cs.kewarganegaraan,
        cs.nama_ibu_kandung,
        cs.npwp,
        cs.email,
        cs.no_hp,
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
        
        -- Account Info
        acc.tabungan_tipe AS jenis_rekening,
        acc.atm_tipe AS jenis_kartu,
        acc.nominal_setoran,
        acc.tujuan_pembukaan AS tujuan_rekening,
        
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
        ue.username AS "lastEditedBy"

      FROM pengajuan_tabungan p
      LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
      LEFT JOIN cdd_job job ON p.id = job.pengajuan_id
      LEFT JOIN account acc ON p.id = acc.pengajuan_id
      LEFT JOIN cdd_reference ec ON p.id = ec.pengajuan_id
      LEFT JOIN bo bo ON p.id = bo.pengajuan_id
      LEFT JOIN cabang c ON p.cabang_id = c.id
      LEFT JOIN users ua ON p.approved_by = ua.id
      LEFT JOIN users ur ON p.rejected_by = ur.id
      LEFT JOIN users ue ON p.last_edited_by = ue.id
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

    // Prepare backup data with simplified metadata
    const backupData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: req.user.username,
        userRole: userRole,
        totalRecords: result.rows.length,
        version: '3.0', // Version bump for simplified schema
        editTrackingOnly: true // Flag to indicate simplified edit tracking
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
 * Import data dari file - Simplified version (no validation for NIK, email, HP)
 */
export const importData = async (req, res) => {
  const client = await pool.connect();

  try {
    console.log('📥 Import data request received');

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
    let conflictCount = 0; // New counter for edit conflicts
    const totalRecords = importData.length;

    for (let index = 0; index < importData.length; index++) {
      const item = importData[index];

      // Update progress
      if (sessionId && index % 5 === 0) {
        const progress = 15 + Math.floor((index / totalRecords) * 70);
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
          const itemCabangId = parseInt(item.cabang_id);
          const userCabangId = parseInt(req.user.cabang_id);

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
          `SELECT p.id, p.status, p.edit_count 
           FROM pengajuan_tabungan p
           LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
           WHERE cs.kode_referensi = $1`,
          [item.kode_referensi]
        );

        if (existingCheck.rows.length > 0) {
          if (overwriteMode) {
            // Check for edit conflicts based on edit_count
            const existingId = existingCheck.rows[0].id;
            const existingEditCount = existingCheck.rows[0].edit_count || 0;
            const importEditCount = item.edit_count || 0;

            // Edit conflict detection: if database has different edit_count than import data
            if (existingEditCount !== importEditCount) {
              console.log(`⚠️ Edit conflict detected for ${item.kode_referensi}: DB count=${existingEditCount}, Import count=${importEditCount}`);
              
              // OVERWRITE: Replace all data with backup data (including edit_count)
              await client.query(`
                UPDATE pengajuan_tabungan 
                SET status = $1, 
                    approved_at = $2, 
                    rejected_at = $3,
                    edit_count = $4,
                    last_edited_at = $5,
                    last_edited_by = $6
                WHERE id = $7
              `, [
                item.status,
                item.approved_at || null,
                item.rejected_at || null,
                item.edit_count || 0, // Use backup edit_count, not increment
                item.last_edited_at || null,
                item.last_edited_by || null,
                existingId
              ]);

              // Update all related tables with backup data
              await client.query(`
                UPDATE cdd_self SET
                  nama = $1, alias = $2, jenis_id = $3, no_id = $4, berlaku_id = $5,
                  tempat_lahir = $6, tanggal_lahir = $7, alamat_id = $8, alamat_jalan = $9,
                  provinsi = $10, kota = $11, kecamatan = $12, kelurahan = $13,
                  kode_pos_id = $14, alamat_now = $15, jenis_kelamin = $16, status_kawin = $17,
                  agama = $18, pendidikan = $19, nama_ibu_kandung = $20, npwp = $21,
                  email = $22, no_hp = $23, kewarganegaraan = $24, status_rumah = $25,
                  rekening_untuk_sendiri = $26, tipe_nasabah = $27, nomor_rekening_lama = $28
                WHERE pengajuan_id = $29
              `, [
                item.nama_lengkap, item.alias, item.identityType, item.nik, item.berlaku_id,
                item.tempat_lahir, item.tanggal_lahir, item.alamat, item.alamat_jalan,
                item.provinsi, item.kota, item.kecamatan, item.kelurahan,
                item.kode_pos, item.alamat_domisili, item.jenis_kelamin, item.status_pernikahan,
                item.agama, item.pendidikan, item.nama_ibu_kandung, item.npwp,
                item.email, item.no_hp,
                item.kewarganegaraan, item.status_rumah, item.rekening_untuk_sendiri,
                item.tipe_nasabah, item.nomor_rekening_lama, existingId
              ]);

              // Update cdd_job
              await client.query(`
                UPDATE cdd_job SET
                  pekerjaan = $1, gaji_per_bulan = $2, sumber_dana = $3, rata_transaksi_per_bulan = $4,
                  nama_perusahaan = $5, alamat_perusahaan = $6, no_telepon = $7, jabatan = $8, bidang_usaha = $9
                WHERE pengajuan_id = $10
              `, [
                item.pekerjaan, item.penghasilan, item.sumber_dana, item.rata_rata_transaksi,
                item.tempat_bekerja, item.alamat_kantor, item.telepon_perusahaan, item.jabatan, 
                item.bidang_usaha || 'tidak bekerja', existingId
              ]);

              // Update account
              await client.query(`
                UPDATE account SET
                  tabungan_tipe = $1, atm = $2, atm_tipe = $3, nominal_setoran = $4, tujuan_pembukaan = $5
                WHERE pengajuan_id = $6
              `, [
                item.jenis_rekening || 'simpel', item.jenis_kartu ? 1 : 0, item.jenis_kartu || null,
                item.nominal_setoran || null, item.tujuan_rekening || null, existingId
              ]);

              // Log the conflict resolution
              console.log(`🔄 Conflict resolved for ${item.kode_referensi}: Data overwritten with backup (edit_count: ${existingEditCount} → ${item.edit_count || 0})`);
              conflictCount++;
            } else {
              // No conflict, update normally
              await client.query(`
                UPDATE pengajuan_tabungan 
                SET status = $1, 
                    approved_at = $2, 
                    rejected_at = $3,
                    edit_count = $4,
                    last_edited_at = $5,
                    last_edited_by = $6
                WHERE id = $7
              `, [
                item.status,
                item.approved_at || null,
                item.rejected_at || null,
                item.edit_count || 0,
                item.last_edited_at || null,
                item.last_edited_by || null,
                existingId
              ]);

              // Update cdd_self table
              await client.query(`
                UPDATE cdd_self 
                SET nama = $1, alias = $2, jenis_id = $3, no_id = $4, berlaku_id = $5,
                    tempat_lahir = $6, tanggal_lahir = $7, alamat_id = $8, alamat_jalan = $9,
                    provinsi = $10, kota = $11, kecamatan = $12, kelurahan = $13, kode_pos_id = $14,
                    alamat_now = $15, jenis_kelamin = $16, status_kawin = $17, agama = $18,
                    pendidikan = $19, nama_ibu_kandung = $20, npwp = $21, email = $22, no_hp = $23,
                    kewarganegaraan = $24, status_rumah = $25, rekening_untuk_sendiri = $26,
                    tipe_nasabah = $27, nomor_rekening_lama = $28
                WHERE pengajuan_id = $29
              `, [
                item.nama_lengkap, item.alias, item.identityType, item.nik, item.berlaku_id,
                item.tempat_lahir, item.tanggal_lahir, item.alamat, item.alamat_jalan,
                item.provinsi, item.kota, item.kecamatan, item.kelurahan, item.kode_pos,
                item.alamat_domisili, item.jenis_kelamin, item.status_pernikahan, item.agama,
                item.pendidikan, item.nama_ibu_kandung, item.npwp, item.email, item.no_hp,
                item.kewarganegaraan, item.status_rumah, item.rekening_untuk_sendiri,
                item.tipe_nasabah, item.nomor_rekening_lama, existingId
              ]);

              // Update cdd_job table
              await client.query(`
                UPDATE cdd_job 
                SET pekerjaan = $1, gaji_per_bulan = $2, rata_transaksi_per_bulan = $3,
                    nama_perusahaan = $4, alamat_perusahaan = $5, no_telepon = $6,
                    jabatan = $7, bidang_usaha = $8, sumber_dana = $9
                WHERE pengajuan_id = $10
              `, [
                item.pekerjaan, item.penghasilan, item.rata_rata_transaksi,
                item.tempat_bekerja, item.alamat_kantor, item.telepon_perusahaan,
                item.jabatan, item.bidang_usaha, item.sumber_dana, existingId
              ]);

              // Update account table
              await client.query(`
                UPDATE account 
                SET tabungan_tipe = $1, atm = $2, atm_tipe = $3,
                    nominal_setoran = $4, tujuan_pembukaan = $5
                WHERE pengajuan_id = $6
              `, [
                item.jenis_rekening, item.jenis_kartu ? 1 : 0, item.jenis_kartu,
                item.nominal_setoran, item.tujuan_rekening, existingId
              ]);

              // Update cdd_reference table (emergency contact)
              if (item.kontak_darurat_nama) {
                await client.query(`
                  UPDATE cdd_reference 
                  SET nama = $1, alamat = $2, no_hp = $3, hubungan = $4
                  WHERE pengajuan_id = $5
                `, [
                  item.kontak_darurat_nama, item.kontak_darurat_alamat,
                  item.kontak_darurat_hp, item.kontak_darurat_hubungan, existingId
                ]);
              }
            }

            overwrittenCount++;
            console.log(`✅ Record ${item.kode_referensi} updated (edit_count: ${item.edit_count || 0})`);
          } else {
            console.log(`⚠️ Record ${item.kode_referensi} sudah ada - dilewati`);
            skippedCount++;
          }
        } else {
          // Insert new record - simplified (no NIK/email/HP validation)

          // Generate new kode_referensi if not exists
          const kodeReferensi = item.kode_referensi || `REG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

          // Insert pengajuan_tabungan
          const pengajuanResult = await client.query(`
            INSERT INTO pengajuan_tabungan (
              cabang_id, status, created_at, approved_at, rejected_at,
              edit_count, last_edited_at, last_edited_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
          `, [
            targetCabangId,
            item.status || 'pending',
            item.created_at || new Date(),
            item.approved_at || null,
            item.rejected_at || null,
            item.edit_count || 0,
            item.last_edited_at || null,
            item.last_edited_by || null
          ]);

          const newPengajuanId = pengajuanResult.rows[0].id;

          // Insert cdd_self - simplified
          await client.query(`
            INSERT INTO cdd_self (
              pengajuan_id, kode_referensi, nama, alias, jenis_id, no_id, berlaku_id,
              tempat_lahir, tanggal_lahir, alamat_id, alamat_jalan, provinsi, kota, 
              kecamatan, kelurahan, kode_pos_id, alamat_now, jenis_kelamin, status_kawin,
              agama, pendidikan, nama_ibu_kandung, npwp, email, no_hp, kewarganegaraan,
              status_rumah, rekening_untuk_sendiri, tipe_nasabah, nomor_rekening_lama,
              created_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
              $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
            )
          `, [
            newPengajuanId, kodeReferensi, item.nama_lengkap, item.alias, item.identityType,
            item.nik, item.berlaku_id, item.tempat_lahir, item.tanggal_lahir, item.alamat,
            item.alamat_jalan, item.provinsi, item.kota, item.kecamatan, item.kelurahan,
            item.kode_pos, item.alamat_domisili, item.jenis_kelamin, item.status_pernikahan,
            item.agama, item.pendidikan, item.nama_ibu_kandung, item.npwp,
            item.email, // Use actual email from import data
            item.no_hp, // Use actual phone from import data
            item.kewarganegaraan, item.status_rumah, item.rekening_untuk_sendiri,
            item.tipe_nasabah, item.nomor_rekening_lama, item.created_at || new Date()
          ]);

          // Insert cdd_job
          await client.query(`
            INSERT INTO cdd_job (
              pengajuan_id, pekerjaan, gaji_per_bulan, rata_transaksi_per_bulan,
              nama_perusahaan, alamat_perusahaan, no_telepon,
              jabatan, bidang_usaha, sumber_dana, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
          `, [
            newPengajuanId, item.pekerjaan, item.penghasilan, item.rata_rata_transaksi,
            item.tempat_bekerja, item.alamat_kantor, item.telepon_perusahaan,
            item.jabatan, item.bidang_usaha, item.sumber_dana
          ]);

          // Insert account
          await client.query(`
            INSERT INTO account (
              pengajuan_id, tabungan_tipe, atm, atm_tipe,
              nominal_setoran, tujuan_pembukaan, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
          `, [
            newPengajuanId, item.jenis_rekening, item.jenis_kartu ? 1 : 0, item.jenis_kartu,
            item.nominal_setoran, item.tujuan_rekening
          ]);

          // Insert cdd_reference (emergency contact)
          if (item.kontak_darurat_nama) {
            await client.query(`
              INSERT INTO cdd_reference (
                pengajuan_id, nama, alamat, no_hp, hubungan, created_at
              ) VALUES ($1, $2, $3, $4, $5, NOW())
            `, [
              newPengajuanId, item.kontak_darurat_nama, item.kontak_darurat_alamat,
              item.kontak_darurat_hp, item.kontak_darurat_hubungan
            ]);
          }

          importedCount++;
          console.log(`✅ Record ${kodeReferensi} imported (edit_count: ${item.edit_count || 0})`);
        }

      } catch (itemErr) {
        console.error(`❌ Error processing record ${index + 1}:`, itemErr.message);
        skippedCount++;
      }
    }

    await client.query('COMMIT');

    if (sessionId) {
      updateImportProgress(sessionId, 100, 'Import selesai!');
    }

    const summary = {
      success: true,
      message: 'Import data selesai',
      summary: {
        total: totalRecords,
        imported: importedCount,
        overwritten: overwrittenCount,
        conflicts: conflictCount, // New field for edit conflicts
        skipped: skippedCount
      }
    };

    console.log('✅ Import completed:', summary);

    // Log aktivitas import
    await logUserActivity(
      req.user.id,
      'IMPORT_DATA',
      `Import Data: ${importedCount} new, ${overwrittenCount} updated, ${conflictCount} conflicts, ${skippedCount} skipped`,
      req.user.cabang_id,
      req.ip,
      req.get('User-Agent')
    );

    res.json(summary);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Import error:', err);

    if (sessionId) {
      updateImportProgress(sessionId, 0, `Error: ${err.message}`);
    }

    res.status(500).json({
      success: false,
      message: 'Gagal mengimport data',
      error: err.message
    });
  } finally {
    client.release();
  }
};

// Add other missing functions from old controller
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
        p.edit_count,
        p.last_edited_at,
        p.last_edited_by,
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
        ur.username AS "rejectedBy",
        ue.username AS "lastEditedBy"
        
      FROM pengajuan_tabungan p
      LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
      LEFT JOIN cdd_job job ON p.id = job.pengajuan_id
      LEFT JOIN account acc ON p.id = acc.pengajuan_id
      LEFT JOIN cdd_reference ec ON p.id = ec.pengajuan_id
      LEFT JOIN bo bo ON p.id = bo.pengajuan_id
      LEFT JOIN cabang c ON p.cabang_id = c.id
      LEFT JOIN users ua ON p.approved_by = ua.id
      LEFT JOIN users ur ON p.rejected_by = ur.id
      LEFT JOIN users ue ON p.last_edited_by = ue.id
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
        nama_perusahaan: result.rows[0].nama_perusahaan,
        edit_count: result.rows[0].edit_count,
        last_edited_at: result.rows[0].last_edited_at
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

    // Edit conflict detection - check for existing records with different edit_count
    for (const item of importData) {
      const kodeReferensi = item.kode_referensi;

      if (kodeReferensi) {
        try {
          const existingQuery = await pool.query(
            `SELECT p.status, cs.kode_referensi, p.edit_count, cs.nama
             FROM cdd_self cs
             JOIN pengajuan_tabungan p ON cs.pengajuan_id = p.id
             WHERE cs.kode_referensi = $1 
             LIMIT 1`,
            [kodeReferensi]
          );

          if (existingQuery.rows.length > 0) {
            const existing = existingQuery.rows[0];
            const existingEditCount = existing.edit_count || 0;
            const importEditCount = item.edit_count || 0;

            // Check for edit count conflict
            if (existingEditCount !== importEditCount) {
              analysis.conflicts.push({
                kode_referensi: kodeReferensi,
                nama_lengkap: item.nama_lengkap,
                currentEditCount: existingEditCount,
                importEditCount: importEditCount,
                message: `Data akan ditimpa: DB edit_count=${existingEditCount} → Import edit_count=${importEditCount}`
              });
            }

            analysis.existingRecords.push({
              kode_referensi: kodeReferensi,
              nama_lengkap: item.nama_lengkap,
              currentStatus: existing.status,
              newStatus: item.status,
              hasEditConflict: existingEditCount !== importEditCount
            });
          } else {
            analysis.newRecords.push({
              kode_referensi: kodeReferensi,
              nama_lengkap: item.nama_lengkap,
              status: item.status
            });
          }
        } catch (queryErr) {
          console.error(`❌ Error checking existing record for ${kodeReferensi}:`, queryErr);
        }
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