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
      cabang_pengambilan,
      foto_ktp,
      foto_selfie,
    } = req.body;

    // dukung beberapa nama field dari frontend
    const jenis_kartu = req.body.jenis_kartu || req.body.card_type || req.body.cardType;

    // Generate kode referensi unik
    const kode_referensi = `REF-${Math.floor(Math.random() * 1000000)}`;

    // Cek apakah kolom status ada di tabel
    const hasStatusColumn = await checkStatusColumn();

    // Query SQL dengan kolom foto_ktp dan foto_selfie
    let query, values;
    if (hasStatusColumn) {
      query = `
        INSERT INTO pengajuan_tabungan 
        (kode_referensi, nama_lengkap, nik, email, no_hp, tanggal_lahir, alamat, provinsi, kota, kode_pos, pekerjaan, penghasilan, cabang_pengambilan, jenis_kartu, status, foto_ktp, foto_selfie)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        RETURNING *;
      `;
      values = [
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
        cabang_pengambilan,
        jenis_kartu,
        req.body.status || "pending",
        foto_ktp,
        foto_selfie,
      ];
    } else {
      query = `
        INSERT INTO pengajuan_tabungan 
        (kode_referensi, nama_lengkap, nik, email, no_hp, tanggal_lahir, alamat, provinsi, kota, kode_pos, pekerjaan, penghasilan, cabang_pengambilan, jenis_kartu, foto_ktp, foto_selfie)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        RETURNING *;
      `;
      values = [
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
        cabang_pengambilan,
        jenis_kartu,
        foto_ktp,
        foto_selfie,
      ];
    }

    const result = await pool.query(query, values);

    res.json({
      success: true,
      message: "Data berhasil disimpan",
      kode_referensi,
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Mengambil semua pengajuan berdasarkan cabang admin
 */
export const getAllPengajuan = async (req, res) => {
  try {
    const adminCabang = req.user.cabang; // cabang dari token login

    // Cek apakah kolom status ada
    const hasStatusColumn = await checkStatusColumn();

    // Query dengan kolom foto_ktp dan foto_selfie, termasuk approved/rejected info
    const query = hasStatusColumn
      ? `
        SELECT 
          id,
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
          cabang_pengambilan,
          jenis_kartu,
          COALESCE(status, 'pending') AS status,
          foto_ktp,
          foto_selfie,
          created_at,
          approved_by,
          approved_at,
          rejected_by,
          rejected_at
        FROM pengajuan_tabungan
        WHERE cabang_pengambilan = $1
        ORDER BY created_at DESC;
      `
      : `
        SELECT 
          id,
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
          cabang_pengambilan,
          jenis_kartu,
          'pending' AS status,
          foto_ktp,
          foto_selfie,
          created_at,
          approved_by,
          approved_at,
          rejected_by,
          rejected_at
        FROM pengajuan_tabungan
        WHERE cabang_pengambilan = $1
        ORDER BY created_at DESC;
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
        WHERE id = $3 
        RETURNING *;
      `;
      values = [status, adminUsername, id];
    } else if (status === 'rejected') {
      query = `
        UPDATE pengajuan_tabungan 
        SET status = $1, rejected_by = $2, rejected_at = NOW(), approved_by = NULL, approved_at = NULL
        WHERE id = $3 
        RETURNING *;
      `;
      values = [status, adminUsername, id];
    } else {
      // Jika status pending, reset semua approval/rejection info
      query = `
        UPDATE pengajuan_tabungan 
        SET status = $1, approved_by = NULL, approved_at = NULL, rejected_by = NULL, rejected_at = NULL
        WHERE id = $2 
        RETURNING *;
      `;
      values = [status, id];
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

