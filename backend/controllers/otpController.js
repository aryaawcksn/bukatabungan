import pool from "../config/db.js";
import { sendWhatsAppNotification } from "../utils/sendWhatsApp.js";

export const sendOtpHandler = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Nomor telepon wajib diisi"
      });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Simpan OTP
    await pool.query(
      `INSERT INTO otp_codes (phone, otp, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '3 minutes')`,
      [phone, otp]
    );

    // Kirim WhatsApp
    await sendWhatsAppNotification(
      phone,
      "",
      "otp",
      `Kode OTP Anda adalah *${otp}*.\nKode hanya berlaku 3 menit.`
    );

    return res.json({
      success: true,
      message: "OTP berhasil dikirim ke WhatsApp."
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


