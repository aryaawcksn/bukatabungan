import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface OtpModalProps {
  open: boolean;
  onClose: () => void;
  phone: string;
  onVerified: () => void;
}

export default function OtpModal({ open, onClose, phone, onVerified }: OtpModalProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleVerify = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://bukatabungan-production.up.railway.app/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "OTP salah");

        // ❌ OTP salah atau expired → reset state proses OTP
        // ❌ OTP salah atau expired → Jangan reset state agar user bisa coba lagi
        // localStorage.removeItem("otpInProgress");
        // localStorage.removeItem("pendingSubmitData");
        // localStorage.removeItem("currentPhone");

      } else {
        // ✔ OTP valid
        onVerified();
      }
    } catch {
      setError("Gagal verifikasi OTP");
    }

    setLoading(false);
  };

  const handleCancel = () => {
    // ❌ User batalkan OTP → hapus state OTP
    localStorage.removeItem("otpInProgress");
    localStorage.removeItem("pendingSubmitData");
    localStorage.removeItem("currentPhone");

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-xl w-[380px]">
        <h2 className="text-lg font-semibold mb-3">Verifikasi OTP</h2>
        <p className="text-sm text-gray-600 mb-4">
          Kode OTP telah dikirim ke WhatsApp <strong>{phone}</strong>
        </p>

        <Input
          placeholder="Masukkan kode OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="mb-3"
        />

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <div className="flex gap-3">
          <Button className="w-full" onClick={handleVerify} disabled={loading}>
            {loading ? "Memverifikasi..." : "Verifikasi"}
          </Button>

          <Button variant="secondary" onClick={handleCancel}>
            Batal
          </Button>
        </div>
      </div>
    </div>
  );
}
