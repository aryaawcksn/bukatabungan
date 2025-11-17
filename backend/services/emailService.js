import nodemailer from "nodemailer";

/**
 * Mengirim email notifikasi ke pengguna
 * @param {string} email - Email penerima
 * @param {string} fullName - Nama lengkap penerima
 * @param {string} status - Status pengajuan (approved/rejected)
 * @param {string} customMessage - Pesan custom (opsional)
 * @returns {Promise<Object>} Info email yang terkirim
 */
export const sendEmailNotification = async (email, fullName, status, customMessage = null) => {
  // Validasi environment variables
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Konfigurasi email tidak lengkap. Pastikan SMTP_USER dan SMTP_PASS sudah diatur di file .env");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Gunakan custom message jika ada, atau default message
  const emailMessage = customMessage || (status === "approved"
    ? "Selamat! Permohonan pembukaan rekening tabungan Anda telah disetujui.\n\nSilakan kunjungi kantor cabang terdekat dengan membawa dokumen asli untuk proses aktivasi rekening.\n\nTerima kasih telah mempercayai layanan kami."
    : "Mohon maaf, permohonan pembukaan rekening tabungan Anda tidak dapat kami setujui saat ini.\n\nHal ini dikarenakan data atau dokumen yang Anda berikan belum memenuhi persyaratan.\n\nAnda dapat mengajukan permohonan kembali setelah melengkapi dokumen yang diperlukan.");

  // Convert newlines to HTML breaks
  const emailHtml = emailMessage.replace(/\n/g, '<br/>');

  const info = await transporter.sendMail({
    from: `"Bank Sleman" <${process.env.SMTP_USER}>`,
    to: email,
    subject: status === "approved"
      ? "Permohonan Rekening Anda Disetujui ✅"
      : "Permohonan Rekening Anda Ditolak ❌",
    html: `
      <h3>Halo ${fullName},</h3>
      <p>${emailHtml}</p>
      <br/>
      <small>Pesan otomatis dari sistem Bank Sleman</small>
    `,
  });

  return info;
};

