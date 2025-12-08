import pool from "../config/db.js";
import { sendWhatsAppNotification } from "../utils/sendWhatsApp.js";

export const sendOtpHandler = async (req, res) => {
  try {
    const { pengajuan_id } = req.body;

    if (!pengajuan_id) {
      return res.status(400).json({
        success: false,
        message: "pengajuan_id wajib dikirim"
      });
    }

    // ✅ Ambil nomor HP dari cdd_self
    const phoneRes = await pool.query(
      `SELECT no_hp 
       FROM cdd_self 
       WHERE pengajuan_id = $1 
       LIMIT 1`,
      [pengajuan_id]
    );

    if (phoneRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Nomor HP tidak ditemukan untuk pengajuan ini"
      });
    }

    const phone = phoneRes.rows[0].no_hp;

    // ✅ Generate OTP 6 digit
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Simpan OTP
    await pool.query(
      `INSERT INTO otp_codes (phone, otp, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '3 minutes')`,
      [phone, otp]
    );

    // ✅ Kirim WhatsApp
    await sendWhatsAppNotification(
      phone,
      "",
      "otp",
      `Kode OTP Anda adalah *${otp}*.\nKode hanya berlaku 3 menit.`
    );

    return res.json({
      success: true,
      message: "OTP berhasil dikirim",
      phone // optional untuk debug
    });

  } catch (err) {
    console.error("Error sendOtpHandler:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal mengirim OTP"
    });
  }
};


export const verifyOtpHandler = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Nomor dan OTP wajib diisi"
      });
    }

    const check = await pool.query(
      `SELECT id FROM otp_codes
       WHERE phone = $1
         AND otp = $2
         AND expires_at > NOW()
       ORDER BY id DESC
       LIMIT 1`,
      [phone, otp]
    );

    if (check.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP salah atau sudah kadaluwarsa"
      });
    }

    // ✅ Hapus semua OTP untuk nomor ini
    await pool.query(
      `DELETE FROM otp_codes WHERE phone = $1`,
      [phone]
    );

    return res.json({
      success: true,
      message: "OTP valid"
    });

  } catch (err) {
    console.error("Error verifyOtpHandler:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal memverifikasi OTP"
    });
  }
};


