import axios from "axios";

/**
 * Mengirim notifikasi WhatsApp ke pengguna
 * @param {string} phone - Nomor telepon penerima
 * @param {string} fullName - Nama lengkap penerima
 * @param {string} status - Status pengajuan (approved/rejected)
 * @param {string} customMessage - Pesan custom (opsional)
 * @returns {Promise<Object>} Response dari API Fonnte
 */
export const sendWhatsAppNotification = async (input, p2, p3, p4) => {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    throw new Error("Konfigurasi WhatsApp tidak lengkap. Pastikan FONNTE_TOKEN sudah diatur di file .env");
  }

  // Handle various input formats (legacy positional vs new object)
  let phone, fullName, status, customMessage;

  if (typeof input === 'object' && input !== null) {
    phone = input.to || input.phone;
    fullName = input.nama || input.fullName;
    status = input.status;
    customMessage = input.message || input.customMessage;
  } else {
    phone = input;
    fullName = p2;
    status = p3;
    customMessage = p4;
  }

  // Ensure phone is string
  if (!phone) {
    console.warn('⚠️ Send WhatsApp skipped: phone number is missing');
    return null;
  }

  let formattedPhone = String(phone).trim();
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "62" + formattedPhone.slice(1);
  }

  let whatsappMessage = "";

  // Mode OTP (status === "otp")
  if (status === "otp") {
    whatsappMessage = customMessage; // langsung kirim message OTP
  }
  // Mode approved/rejected
  else {
    whatsappMessage = customMessage ||
      (status === "approved"
        ? `Halo ${fullName}! 🎉 Permohonan rekening Anda telah disetujui. Silakan kunjungi kantor cabang untuk aktivasi.`
        : `Halo ${fullName}, permohonan rekening Anda belum disetujui. Silakan hubungi cabang terdekat untuk info lebih lanjut.`);
  }

  try {
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
  } catch (err) {
    console.error('WhatsApp API Error:', err.message);
    throw err;
  }
};

