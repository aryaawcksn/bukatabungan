import axios from "axios";

/**
 * Mengirim notifikasi WhatsApp ke pengguna
 * @param {string} phone - Nomor telepon penerima
 * @param {string} fullName - Nama lengkap penerima
 * @param {string} status - Status pengajuan (approved/rejected)
 * @param {string} customMessage - Pesan custom (opsional)
 * @returns {Promise<Object>} Response dari API Fonnte
 */
export const sendWhatsAppNotification = async (phone, fullName, status, customMessage = null) => {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    throw new Error("Konfigurasi WhatsApp tidak lengkap. Pastikan FONNTE_TOKEN sudah diatur di file .env");
  }

  // Gunakan custom message jika ada, atau default message
  const whatsappMessage = customMessage || (status === "approved"
    ? `Halo ${fullName}! 🎉 Permohonan rekening Anda telah disetujui. Silakan kunjungi kantor cabang untuk aktivasi.`
    : `Halo ${fullName}, permohonan rekening Anda belum disetujui. Silakan hubungi cabang terdekat untuk info lebih lanjut.`);

  // Format nomor: +62
  let formattedPhone = phone;
  if (phone.startsWith("0")) {
    formattedPhone = "62" + phone.slice(1);
  }

  const response = await axios.post(
    "https://api.fonnte.com/send",
    {
      target: formattedPhone,
      message: whatsappMessage,
    },
    {
      headers: { Authorization: token },
    }
  );

  return response.data;
};

