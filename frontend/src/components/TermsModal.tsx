import React from 'react';
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function TermsModal({ open, onClose }: TermsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-emerald-900">Syarat dan Ketentuan</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto text-gray-600 space-y-4 leading-relaxed text-sm">
          <p>
            Selamat datang di layanan pembukaan rekening online Bank Sleman. Harap membaca syarat dan ketentuan berikut dengan saksama sebelum melanjutkan proses pendaftaran.
          </p>

          <h3 className="font-bold text-gray-800 text-base mt-4">1. Persyaratan Umum</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Calon nasabah adalah Warga Negara Indonesia (WNI).</li>
            <li>Memiliki Kartu Tanda Penduduk (KTP) yang masih berlaku.</li>
            <li>Berusia minimal 17 tahun (untuk rekening perorangan dewasa).</li>
            <li>Untuk rekening SimPel, calon nasabah berstatus pelajar dan diwakili oleh orang tua/wali jika belum memiliki KTP.</li>
            <li>Tidak sedang masuk dalam daftar hitam nasional perbankan.</li>
          </ul>

          <h3 className="font-bold text-gray-800 text-base mt-4">2. Data dan Dokumen</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nasabah wajib memberikan data yang benar, akurat, dan terbaru.</li>
            <li>Nasabah wajib mengunggah foto KTP yang jelas dan terbaca.</li>
            <li>Bank Sleman berhak menolak pengajuan jika data atau dokumen dinilai tidak valid atau mencurigakan.</li>
          </ul>

          <h3 className="font-bold text-gray-800 text-base mt-4">3. Verifikasi dan Persetujuan</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Proses verifikasi data dilakukan oleh pihak Bank Sleman.</li>
            <li>Bank Sleman berhak menghubungi calon nasabah melalui telepon atau video call untuk verifikasi lebih lanjut jika diperlukan.</li>
            <li>Persetujuan pembukaan rekening sepenuhnya merupakan hak prerogatif Bank Sleman.</li>
          </ul>

          <h3 className="font-bold text-gray-800 text-base mt-4">4. Setoran Awal</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Setelah pengajuan disetujui, nasabah wajib melakukan setoran awal sesuai dengan jenis tabungan yang dipilih.</li>
            <li>Rekening akan aktif sepenuhnya setelah setoran awal diterima.</li>
          </ul>

          <h3 className="font-bold text-gray-800 text-base mt-4">5. Kerahasiaan Data</h3>
          <p>
            Bank Sleman menjamin kerahasiaan data pribadi nasabah dan tidak akan membagikannya kepada pihak ketiga tanpa persetujuan nasabah, kecuali diwajibkan oleh hukum yang berlaku.
          </p>

          <h3 className="font-bold text-gray-800 text-base mt-4">6. Lain-lain</h3>
          <p>
            Syarat dan ketentuan ini dapat berubah sewaktu-waktu sesuai dengan kebijakan Bank Sleman. Perubahan akan diinformasikan melalui website atau media resmi Bank Sleman.
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end bg-gray-50 rounded-b-2xl">
          <Button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
            Saya Mengerti
          </Button>
        </div>

      </div>
    </div>
  );
}
