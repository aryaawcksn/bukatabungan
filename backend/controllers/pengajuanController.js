import pool from "../config/db.js";
import { sendEmailNotification } from "../services/emailService.js";
import { sendWhatsAppNotification } from "../services/whatsappService.js";

/**
 * Cek apakah kolom status ada di tabel pengajuan_tabungan
 */
const checkStatusColumn = async () => {
  try {
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pengajuan_tabungan' AND column_name = 'status'
    `);
    return checkColumn.rows.length > 0;
  } catch (err) {
    return false;
  }
};

/**
 * Membuat pengajuan baru
 */
export const createPengajuan = async (req, res) => {
  try {
    console.log("📥 Received request body:", JSON.stringify(req.body, null, 2));

    const {
      nama_lengkap,
      nik,
      email,
      no_hp,
      tanggal_lahir,
      alamat,
      provinsi,
      kota,
      kode_pos,
      pekerjaan,
      penghasilan,
      cabang_id,
      foto_ktp,
      foto_selfie,
      // Field baru
      jenis_kelamin,
      status_pernikahan,
      status_perkawinan, // Support both naming from frontend
      nama_ibu_kandung,
      kewarganegaraan,
      tempat_bekerja,
      alamat_kantor,
      sumber_dana,
      tujuan_rekening,
      kontak_darurat_nama,
      kontak_darurat_hp,
      setuju_data,
      jenis_rekening,
    } = req.body;

    // Validasi field required
    if (!nama_lengkap || !nik || !email || !no_hp || !tanggal_lahir ||
      !alamat || !provinsi || !kota || !kode_pos || !cabang_id) {
      console.error("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Field wajib tidak lengkap. Pastikan nama, NIK, email, no HP, tanggal lahir, alamat, provinsi, kota, dan kode pos sudah diisi."
      });
    }

    // dukung beberapa nama field dari frontend
    const jenis_kartu =
      req.body.jenis_kartu ||
      req.body.card_type ||
      req.body.cardType ||
      "debit";


    // Normalize status_pernikahan (support both naming)
    const statusPernikahan = status_pernikahan || status_perkawinan;

    // Normalize setuju_data (convert 'Ya'/'Tidak' to boolean if needed)
    let setujuDataValue = setuju_data;
    if (typeof setuju_data === 'string') {
      setujuDataValue = setuju_data === 'Ya' || setuju_data === 'true' || setuju_data === true;
    } else if (setuju_data === undefined || setuju_data === null) {
      setujuDataValue = false;
    }

    // Generate kode referensi unik
    const kode_referensi = `REF-${Math.floor(Math.random() * 1000000)}`;

    // Cek apakah kolom status ada di tabel
    const hasStatusColumn = await checkStatusColumn();
    console.log("📊 Has status column:", hasStatusColumn);

    const cabangCheck = await pool.query(
      "SELECT is_active FROM cabang WHERE id = $1",
      [cabang_id]
    );

    if (cabangCheck.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Cabang tidak valid" });
    }

    if (!cabangCheck.rows[0].is_active) {
      return res.status(403).json({ success: false, message: "Cabang sedang maintenance" });
    }

    // Query SQL dengan semua field sesuai schema database
    let query = `
      INSERT INTO pengajuan_tabungan 
      (
        kode_referensi,
        nama_lengkap,
        nik,
        email,
        no_hp,
        tanggal_lahir,
        alamat,
        provinsi,
        kota,
        kode_pos,
        pekerjaan,
        penghasilan,
        jenis_kartu,
        cabang_id,
        status,
        foto_ktp,
        foto_selfie,
        jenis_rekening,
        jenis_kelamin,
        setuju_data,
        kontak_darurat_hp,
        kontak_darurat_nama,
        tujuan_rekening,
        sumber_dana,
        alamat_kantor,
        tempat_bekerja,
        kewarganegaraan,
        nama_ibu_kandung,
        status_pernikahan
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
        $16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29
      )
      RETURNING *;
    `;
    let values = [
      kode_referensi,          // $1
      nama_lengkap,            // $2
      nik,                     // $3
      email,                   // $4
      no_hp,                   // $5
      tanggal_lahir,           // $6
      alamat,                  // $7
      provinsi,                // $8
      kota,                    // $9
      kode_pos,                // $10
      pekerjaan,               // $11
      penghasilan,             // $12
      jenis_kartu,             // $13
      cabang_id,      // $14
      req.body.status || "pending",  // $15 - status
      foto_ktp,                // $16
      foto_selfie,             // $17
      jenis_rekening,          // $18
      jenis_kelamin,           // $19
      setujuDataValue,         // $20 - setuju_data
      kontak_darurat_hp,       // $21
      kontak_darurat_nama,     // $22
      tujuan_rekening,         // $23
      sumber_dana,             // $24
      alamat_kantor,           // $25
      tempat_bekerja,          // $26
      kewarganegaraan,         // $27
      nama_ibu_kandung,        // $28
      statusPernikahan         // $29 - status_pernikahan
    ];

    console.log("🔍 Executing query with", values.length, "parameters");
    console.log("📝 Query:", query.substring(0, 200) + "...");

    const result = await pool.query(query, values);

    console.log("✅ Data berhasil disimpan dengan ID:", result.rows[0]?.id);
    console.log("📋 Kode referensi:", kode_referensi);

    res.json({
      success: true,
      message: "Data berhasil disimpan",
      kode_referensi,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error creating pengajuan:", err);
    console.error("❌ Error details:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
      constraint: err.constraint,
      table: err.table,
      column: err.column
    });

    // Berikan error message yang lebih informatif
    let errorMessage = err.message;
    if (err.code === '23505') { // Unique violation
      errorMessage = "Data dengan NIK atau email ini sudah terdaftar";
    } else if (err.code === '23502') { // Not null violation
      errorMessage = `Field wajib tidak boleh kosong: ${err.column || 'unknown'}`;
    } else if (err.code === '23503') { // Foreign key violation
      errorMessage = "Data referensi tidak valid";
    } else if (err.code === '42P01') { // Undefined table
      errorMessage = "Tabel tidak ditemukan. Pastikan database sudah di-setup dengan benar.";
    } else if (err.code === '42703') { // Undefined column
      errorMessage = `Kolom tidak ditemukan: ${err.column || 'unknown'}. Pastikan migrasi database sudah dijalankan.`;
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        code: err.code,
        detail: err.detail,
        constraint: err.constraint
      } : undefined
    });
  }
};

/**
 * Mengambil satu pengajuan berdasarkan ID
 */
export const getPengajuanById = async (req, res) => {
  try {
    const { id } = req.params;
    const adminCabang = req.user.cabang_id; // cabang dari token login

    // Cek apakah kolom status ada
    const hasStatusColumn = await checkStatusColumn();

    // Query dengan kolom foto_ktp dan foto_selfie, termasuk approved/rejected info, plus field baru
    const query = hasStatusColumn
      ? `
        SELECT 
          p.id,
          p.kode_referensi,
          p.nama_lengkap,
          p.nik,
          p.email,
          p.no_hp,
          p.tanggal_lahir,
          p.alamat,
          p.provinsi,
          p.kota,
          p.kode_pos,
          p.pekerjaan,
          p.penghasilan,
          p.cabang_id AS cabang_pengambilan,
          c.nama_cabang,
          p.jenis_kartu,
          p.jenis_rekening,
          COALESCE(p.status, 'pending') AS status,
          p.foto_ktp,
          p.foto_selfie,
          p.jenis_kelamin,
          p.status_pernikahan,
          p.nama_ibu_kandung,
          p.kewarganegaraan,
          p.tempat_bekerja,
          p.alamat_kantor,
          p.sumber_dana,
          p.tujuan_rekening,
          p.kontak_darurat_nama,
          p.kontak_darurat_hp,
          p.setuju_data,
          p.created_at,
          p.approved_by,
          p.approved_at,
          p.rejected_by,
          p.rejected_at
        FROM pengajuan_tabungan p
        LEFT JOIN cabang c ON p.cabang_id = c.id
        WHERE p.id = $1 AND p.cabang_id = $2;
      `
      : `
        SELECT 
          p.id,
          p.kode_referensi,
          p.nama_lengkap,
          p.nik,
          p.email,
          p.no_hp,
          p.tanggal_lahir,
          p.alamat,
          p.provinsi,
          p.kota,
          p.kode_pos,
          p.pekerjaan,
          p.penghasilan,
          p.cabang_id AS cabang_pengambilan,
          c.nama_cabang,
          p.jenis_kartu,
          p.jenis_rekening,
          'pending' AS status,
          p.foto_ktp,
          p.foto_selfie,
          p.jenis_kelamin,
          p.status_pernikahan,
          p.nama_ibu_kandung,
          p.kewarganegaraan,
          p.tempat_bekerja,
          p.alamat_kantor,
          p.sumber_dana,
          p.tujuan_rekening,
          p.kontak_darurat_nama,
          p.kontak_darurat_hp,
          p.setuju_data,
          p.created_at,
          p.approved_by,
          p.approved_at,
          p.rejected_by,
          p.rejected_at
        FROM pengajuan_tabungan p
        LEFT JOIN cabang c ON p.cabang_id = c.id
        WHERE p.id = $1 AND p.cabang_id = $2;
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
    const adminCabang = req.user.cabang_id; // cabang dari token login

    // Cek apakah kolom status ada
    const hasStatusColumn = await checkStatusColumn();
    console.log("📊 getAllPengajuan - Has status column:", hasStatusColumn);
    console.log("📊 getAllPengajuan - Admin cabang:", adminCabang);

    // Query dengan kolom foto_ktp dan foto_selfie, termasuk approved/rejected info, plus field baru
    const query = hasStatusColumn
      ? `
        SELECT 
          p.id,
          p.kode_referensi,
          p.nama_lengkap,
          p.nik,
          p.email,
          p.no_hp,
          p.tanggal_lahir,
          p.alamat,
          p.provinsi,
          p.kota,
          p.kode_pos,
          p.pekerjaan,
          p.penghasilan,
          p.cabang_id AS cabang_pengambilan,
          c.nama_cabang,
          p.jenis_kartu,
          p.jenis_rekening,
          COALESCE(p.status, 'pending') AS status,
          p.foto_ktp,
          p.foto_selfie,
          p.jenis_kelamin,
          p.status_pernikahan,
          p.nama_ibu_kandung,
          p.kewarganegaraan,
          p.tempat_bekerja,
          p.alamat_kantor,
          p.sumber_dana,
          p.tujuan_rekening,
          p.kontak_darurat_nama,
          p.kontak_darurat_hp,
          p.setuju_data,
          p.created_at,
          p.approved_by,
          p.approved_at,
          p.rejected_by,
          p.rejected_at
        FROM pengajuan_tabungan p
        LEFT JOIN cabang c ON p.cabang_id = c.id
        WHERE p.cabang_id = $1
        ORDER BY p.created_at DESC;
      `
      : `
        SELECT 
          p.id,
          p.kode_referensi,
          p.nama_lengkap,
          p.nik,
          p.email,
          p.no_hp,
          p.tanggal_lahir,
          p.alamat,
          p.provinsi,
          p.kota,
          p.kode_pos,
          p.pekerjaan,
          p.penghasilan,
          p.cabang_id AS cabang_pengambilan,
          c.nama_cabang,
          p.jenis_kartu,
          p.jenis_rekening,
          'pending' AS status,
          p.foto_ktp,
          p.foto_selfie,
          p.jenis_kelamin,
          p.status_pernikahan,
          p.nama_ibu_kandung,
          p.kewarganegaraan,
          p.tempat_bekerja,
          p.alamat_kantor,
          p.sumber_dana,
          p.tujuan_rekening,
          p.kontak_darurat_nama,
          p.kontak_darurat_hp,
          p.setuju_data,
          p.created_at,
          p.approved_by,
          p.approved_at,
          p.rejected_by,
          p.rejected_at
        FROM pengajuan_tabungan p
        LEFT JOIN cabang c ON p.cabang_id = c.id
        WHERE p.cabang_id = $1
        ORDER BY p.created_at DESC;
      `;

    const result = await pool.query(query, [adminCabang]);

    console.log("📊 getAllPengajuan - Total rows:", result.rows.length);
    if (result.rows.length > 0) {
      console.log("📊 Sample row fields:", Object.keys(result.rows[0]));
      console.log("📊 Sample row (first 3):", {
        id: result.rows[0].id,
        nama_lengkap: result.rows[0].nama_lengkap,
        jenis_kelamin: result.rows[0].jenis_kelamin,
        status_pernikahan: result.rows[0].status_pernikahan,
        tempat_bekerja: result.rows[0].tempat_bekerja,
        sumber_dana: result.rows[0].sumber_dana
      });
    }

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
 */
export const updatePengajuanStatus = async (req, res) => {
  const { id } = req.params;
  const { status, sendEmail, sendWhatsApp, message } = req.body;
  const adminUsername = req.user?.username || 'Unknown'; // Ambil username dari token

  console.log("REQUEST BODY:", req.body);
  console.log("sendEmail:", sendEmail, "sendWhatsApp:", sendWhatsApp, "message:", message);
  console.log("Admin yang melakukan aksi:", adminUsername);

  try {
    // Update status di database dengan informasi siapa yang approve/reject
    let query, values;
    if (status === 'approved') {
      query = `
          UPDATE pengajuan_tabungan 
          SET status = $1, approved_by = $2, approved_at = NOW(), rejected_by = NULL, rejected_at = NULL
          WHERE id = $3 AND cabang_id = $4
          RETURNING *;
        `;
      values = [status, adminUsername, id, req.user.cabang_id];
    }
    else if (status === 'rejected') {
      query = `
        UPDATE pengajuan_tabungan 
        SET status = $1, rejected_by = $2, rejected_at = NOW(), approved_by = NULL, approved_at = NULL
        WHERE id = $3 AND cabang_id = $4 
        RETURNING *;
      `;
      values = [status, adminUsername, id, req.user.cabang_id];
    } else {
      // Jika status pending, reset semua approval/rejection info
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
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

    const user = result.rows[0];
    const fullName = user.nama_lengkap;
    const email = user.email;
    const phone = user.no_hp;

    // Kirim Email (kalau dipilih)
    if (sendEmail) {
      try {
        await sendEmailNotification(email, fullName, status, message);
        console.log("✅ Email berhasil dikirim ke:", email);
      } catch (emailError) {
        console.error("❌ Error saat mengirim email:", emailError.message);
        // Jangan gagalkan seluruh request jika email gagal
      }
    }

    // Kirim WhatsApp (kalau dipilih)
    if (sendWhatsApp) {
      try {
        const response = await sendWhatsAppNotification(phone, fullName, status, message);
        if (response?.status) {
          console.log("✅ WhatsApp berhasil dikirim ke:", phone, "ID:", response.id);
        } else {
          console.error("❌ Gagal mengirim WhatsApp:", response);
        }
      } catch (whatsappError) {
        console.error("❌ Error saat mengirim WhatsApp:", whatsappError.message);
        // Jangan gagalkan seluruh request jika WhatsApp gagal
      }
    }

    res.json({ success: true, message: "Status diperbarui dan notifikasi dikirim" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

