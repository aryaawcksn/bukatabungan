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

  let whatsappMessage = "";

  // Mode OTP (status === "otp")
  if (status === "otp") {
    whatsappMessage = customMessage; // langsung kirim message OTP
  }

  // Mode approved/rejected (lama)
  else {
    whatsappMessage = customMessage || 
      (status === "approved"
        ? `Halo ${fullName}! 🎉 Permohonan rekening Anda telah disetujui. Silakan kunjungi kantor cabang untuk aktivasi.`
        : `Halo ${fullName}, permohonan rekening Anda belum disetujui. Silakan hubungi cabang terdekat untuk info lebih lanjut.`);
  }

  // Format nomor
  let formattedPhone = phone;
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "62" + formattedPhone.slice(1);
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

