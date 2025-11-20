import axios from "axios";

export const sendWhatsAppNotification = async (phone, fullName, status, message = null) => {
  const token = process.env.FONNTE_TOKEN;

  let formattedPhone = phone;
  if (phone.startsWith("0")) {
    formattedPhone = "62" + phone.slice(1);
  }

  const finalMessage = message || "Kode OTP Anda.";

  const response = await axios.post(
    "https://api.fonnte.com/send",
    {
      target: formattedPhone,
      message: finalMessage
    },
    { headers: { Authorization: token } }
  );

  return response.data;
};
