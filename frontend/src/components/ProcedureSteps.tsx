import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  FileText,
  UserCheck,
  CreditCard,
  CheckCircle2,
  Check,
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface ProcedureStepsProps {
  savingsType: string;
  onComplete: () => void;
  onBack: () => void;
}

export default function ProcedureSteps({
  savingsType,
  onComplete,
  onBack,
}: ProcedureStepsProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  // Ensure page starts at the top when entering this screen
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  // 🔹 Define steps based on type of savings
  type Detail = string | { text: string; important?: boolean };
  type Step = {
    title: string;
    icon: LucideIcon;
    description: string;
    details: Detail[];
  };

  const stepsMap: Record<string, Step[]> = {
    mutiara: [
      {
        title: "Persiapan Dokumen",
        icon: FileText,
        description: "Siapkan dokumen penting untuk Tabungan Mutiara.",
        details: [
          "KTP asli yang masih berlaku.",
          "NPWP jika ingin ikut promo berhadiah.",
          "Foto selfie dengan KTP.",
          "Email aktif untuk verifikasi.",
          "Nomor HP yang aktif.",
        ],
      },
      {
        title: "Verifikasi Data",
        icon: UserCheck,
        description: "Pastikan data diverifikasi untuk keamanan transaksi.",
        details: [
          "Unggah foto KTP & selfie.",
          "OTP verifikasi nomor HP.",
          "Verifikasi email aktif.",
        ],
      },
      {
        title: "Pengecekan",
        icon: CheckCircle2,
        description: "Petugas akan langsung melakukan approval jika memenuh syarat",
        details: ["Setoran minimal Rp100.000.", "Transfer via VA atau e-wallet."],
      },
    ],
    bisnis: [
      {
        title: "Persiapan Dokumen",
        icon: FileText,
        description: "Dokumen untuk Tabungan Bisnis.",
        details: [
          "KTP & NPWP perusahaan.",
          "SIUP/TDP (jika ada).",
          "Email aktif & nomor HP.",
        ],
      },
      {
        title: "Verifikasi Data",
        icon: UserCheck,
        description: "Pastikan data bisnis terverifikasi.",
        details: [
          "Unggah dokumen perusahaan.",
          "OTP verifikasi nomor HP.",
          "Verifikasi email.",
        ],
      },
      {
        title: "Pengisian Formulir",
        icon: CreditCard,
        description: "Lengkapi data usaha Anda.",
        details: [
          "Alamat kantor sesuai dokumen.",
          "Informasi pemilik & karyawan.",
          "Pilih jenis kartu debit bisnis.",
        ],
      },
      {
        title: "Setoran Awal",
        icon: CheckCircle2,
        description: "Setoran awal agar rekening aktif.",
        details: ["Setoran minimal Rp500.000.", "Transfer via VA atau e-wallet."],
      },
    ],
    simpel: [
      {
        title: "Pengisian Formulir",
        icon: FileText,
        description: "Isi data anda pada formulir yang disediakan",
        details: [
  { text: "KTP/KK pelajar.", important: true },
  { text: "Email aktif & nomor HP.", important: false },
  { text: "Pembukaan rekening diperuntukan bagi nasabah WNI.", important: true },
  { text: "Calon Nasabah adalah perorangan.", important: false },
]
,
      },
      {
        title: "Setoran Awal",
        icon: CreditCard,
        description: "Lakukan setoran awal sesuai ketentuan",
        details: ["Minimal Rp 100.000", "Aktif selama 6 bulan", "Pilih kartu debit"],
      },
      {
        title: "Siap Digunakan",
        icon: CheckCircle2,
        description: "Setelah dikonfirmasi kartu anda akan langsung aktif",
        details: ["Bebas biaya admin selama 6 bulan", "Dapat digunakan disemua ATM seluruh indonesia"],
      },
    ],
  };

  const steps = stepsMap[savingsType] || [];


  const getSavingsTypeName = () => {
    switch (savingsType) {
      case "mutiara":
        return "Tabungan Mutiara";
      case "bisnis":
        return "Tabungan Bisnis";
      case "simpel":
        return "Tabungan Simpel";
      default:
        return "Tabungan";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-2 bg-gray-200 z-50">
       
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(0274) 868051</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Jl. Kragilan No.1 Sinduharjo, Sleman</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@banksleman.co.id</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-3">
              <img 
                src="/banksleman.png" 
                alt="Bank Sleman Logo" 
                className="w-40 h-auto -mt-3"
              />
            </div>
            <nav className="hidden lg:flex gap-8">
              <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors">HOME</a>
              <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors">PROFIL</a>
              <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors">PRODUK & LAYANAN</a>
              <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors">E-BANKING</a>
              <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors">INFO</a>
              <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors">HUBUNGI KAMI</a>
            </nav>
          
          </div>
        </div>
      </header>

      {/* Hero Banner with Pattern */}
      <section 
        className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 py-24 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1726406569540-eb2c5bc000b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG9yYWwlMjBwYXR0ZXJuJTIwZGFya3xlbnwxfHx8fDE3NjI3MzY2MjN8MA&ixlib=rb-4.1.0&q=80&w=1080')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-indigo-950/80 to-slate-900/90"></div>
        
        {/* Decorative Pattern Overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-white mb-4 text-5xl md:text-6xl">
              Prosedur Pembukaan {getSavingsTypeName()}
            </h1>
            <p className="text-white/90 text-xl mb-2">
              Ikuti langkah-langkah berikut hingga selesai untuk membuka rekening Anda.
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <a href="#" className="hover:text-white transition-colors">Home</a>
              <span>/</span>
              <a href="#" className="hover:text-white transition-colors">Produk</a>
              <span>/</span>
              <span className="text-emerald-400">{getSavingsTypeName()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <Card
              key={i}
              className="bg-white p-10 border-0 shadow-xl rounded-2xl scroll-mt-16"
            >
              <div className="flex items-start gap-6 mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex-shrink-0 shadow-md">
                  <Icon className="h-10 w-10 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-gray-900 mb-2 text-3xl font-semibold">
                    Langkah {i + 1}: {step.title}
                  </h2>
                  <p className="text-gray-600 text-lg">{step.description}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 shadow-inner">
                <h3 className="text-emerald-900 mb-6 text-xl font-semibold">
                  Persyaratan & Detail:
                </h3>
                <div className="space-y-4">
                  {step.details.map((detail, idx) => {
                    const detailText =
                      typeof detail === "string" ? detail : detail.text;
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-sm"
                      >
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-gray-800 pt-1">{detailText}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}

          {/* Buttons */}
          <div className="flex justify-between gap-4 pt-8">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex-1 bg-gray-100 hover:bg-gray-200 px-8 py-6 text-lg font-medium shadow rounded-xl border-0"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Kembali
            </Button>

            <Button
              onClick={onComplete}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-10 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all rounded-xl"
            >
              Buka Tabungan Sekarang
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/banksleman.png"
                  alt="Bank Sleman Logo"
                  className="w-40 h-auto brightness-[100] contrast-[0.1]"
                />
              </div>
              <p className="text-sm text-gray-400">
                Bank Perkreditan Rakyat terpercaya yang melayani masyarakat dengan sepenuh hati.
              </p>
            </div>

            <div>
              <h4 className="text-white mb-4">Layanan</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Tabungan</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Deposito</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Kredit</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">E-Banking</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white mb-4">Informasi</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Berita</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Karir</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Hubungi Kami</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white mb-4">Kontak</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-1 flex-shrink-0" />
                  <span>(0274) 868051</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-1 flex-shrink-0" />
                  <span>info@banksleman.co.id</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                  <span>Jl. Kragilan No.1 Sinduharjo, Sleman</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Bank Sleman. All rights reserved. | Terdaftar dan diawasi oleh OJK</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
