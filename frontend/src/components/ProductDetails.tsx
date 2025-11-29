import React, { useEffect } from "react";
import { Button } from "./ui/button";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileText,
  CreditCard,
  Banknote,
  ShieldCheck,
  Info
} from "lucide-react";

interface ProductDetailsProps {
  savingsType: string;
  onNext: () => void;
  onBack: () => void;
}

function ProductDetails({
  savingsType,
  onNext,
  onBack,
}: ProductDetailsProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const getProductInfo = () => {
    switch (savingsType) {
      case "mutiara":
        return {
          title: "Tabungan Mutiara",
          subtitle: "Tingkatkan saldo, menangkan hadiahnya",
          description: "Tabungan Mutiara adalah produk tabungan berhadiah yang memberikan kesempatan untuk memenangkan hadiah menarik setiap bulannya. Semakin besar saldo, semakin besar peluang menang!",
          features: [
            "Bunga kompetitif untuk setiap saldo",
            "Berhadiah bulanan dengan sistem undian",
            "Tanpa biaya administrasi bulanan",
            "Kartu debit gratis",
            "Akses mobile banking dan internet banking",
          ],
          terms: [
            "Tabungan Mutiara adalah tabungan untuk perorangan dengan sistem undian berhadiah.",
            "Setoran awal minimal Rp100.000",
            "Saldo minimum yang harus dipertahankan adalah Rp50.000",
            "Setiap saldo tertentu berhak mendapatkan kupon undian",
            "Undian dilakukan setiap bulan dengan hadiah menarik",
            "Bunga dihitung harian dan dibayarkan bulanan",
          ],
          fees: [
            "Biaya administrasi: Gratis",
            "Biaya kartu debit: Gratis",
            "Biaya tarik tunai di ATM Bank Sleman: Gratis",
            "Biaya tarik tunai di ATM lain: Sesuai ketentuan",
            "Biaya transfer: Sesuai ketentuan",
          ],
          interest: "3.5% p.a",
          interestDesc: "Suku bunga kompetitif yang dapat berubah sewaktu-waktu",
          cardBg: "from-emerald-500 to-emerald-800",
          chipColor: "text-emerald-100",
          img: "/mutiara.png",
          notes: [
            {
              jenis: "Perorangan belum dewasa (< 12 tahun)",
              dokumen: [
                "Kartu identitas orang tua & NPWP",
                "Akte Kelahiran Anak / KIA",
              ]
            },
            {
              jenis: "Perorangan belum dewasa (Wali)",
              dokumen: [
                "Kartu identitas & NPWP wali",
                "Surat Penetapan Wali dari Pengadilan"
              ]
            }
          ]
        };
      case "bisnis":
        return {
          title: "Tabungan Bank Sleman",
          subtitle: "Tabungan masyarakat Sleman",
          description: "Tabungan Bank Sleman dirancang khusus untuk masyarakat Kabupaten Sleman. Dengan fitur lengkap dan kemudahan transaksi, tabungan ini menjadi pilihan tepat untuk mengelola keuangan Anda.",
          features: [
            "Gratis biaya administrasi bulanan",
            "Bunga kompetitif hingga 3.5% per tahun",
            "Kartu debit gratis dengan desain eksklusif",
            "Akses mobile banking dan internet banking",
            "Layanan nasabah 24/7",
            "Transaksi mudah di seluruh Indonesia",
          ],
          terms: [
            "Tabungan Bank Sleman adalah tabungan untuk perorangan WNI",
            "Setoran awal minimal Rp500.000",
            "Saldo minimum yang harus dipertahankan adalah Rp100.000",
            "Untuk WNI dengan KTP yang masih berlaku",
            "Satu nasabah hanya dapat memiliki satu rekening",
            "Transaksi dapat dilakukan melalui berbagai channel",
          ],
          fees: [
            "Biaya administrasi: Gratis",
            "Biaya kartu debit: Gratis",
            "Biaya tarik tunai di ATM Bank Sleman: Gratis",
            "Biaya tarik tunai di ATM lain: Sesuai ketentuan",
            "Biaya transfer: Sesuai ketentuan",
          ],
          interest: "3.5% p.a",
          interestDesc: "Suku bunga menarik untuk pertumbuhan dana Anda",
          cardBg: "from-indigo-500 to-purple-700",
          chipColor: "text-indigo-100",
          img: "/umum.png",
          notes: [
             {
              jenis: "Perorangan belum dewasa (< 12 tahun)",
              dokumen: [
                "Kartu identitas orang tua",
                "Akte Kelahiran Anak / KIA",
              ]
            },
          ]
        };
      case "simpel":
        return {
          title: "Tabungan Simpel",
          subtitle: "Nabung sejak dini",
          description: "Tabungan SimPel (Simpanan Pelajar) adalah tabungan untuk siswa yang diterbitkan secara nasional untuk mendorong budaya menabung sejak dini.",
          features: [
            "Khusus untuk pelajar PAUD, TK, SD, SMP, SMA",
            "Setoran ringan, mulai dari Rp5.000",
            "Tanpa biaya administrasi",
            "Edukasi finansial sejak dini",
            "Kartu debit khusus pelajar",
          ],
          terms: [
            "Siswa PAUD - SMA berusia di bawah 17 tahun",
            "Belum memiliki KTP",
            "Hanya boleh memiliki 1 rekening SimPel",
            "Setoran awal minimal Rp50.000",
            "Saldo minimum Rp10.000",
          ],
          fees: [
            "Biaya administrasi: Gratis",
            "Biaya kartu debit: Gratis",
            "Biaya tarik tunai di ATM Bank Sleman: Gratis",
            "Biaya ganti buku: Gratis",
          ],
          interest: "2.5% p.a",
          interestDesc: "Bunga simpanan pelajar yang menguntungkan",
          cardBg: "from-pink-500 to-rose-600",
          chipColor: "text-pink-100",
          img: "/simpel.png",
          notes: [
             {
              jenis: "Siswa PAUD/TK/SD/SMP/SMA",
              dokumen: [
                "Kartu identitas orang tua",
                "Akte Kelahiran / KIA / Kartu Pelajar",
                "Surat persetujuan orang tua"
              ]
            },
          ]
        };
      default:
        return {
          title: "Tabungan",
          subtitle: "",
          description: "",
          features: [],
          terms: [],
          fees: [],
          interest: "",
          interestDesc: "",
          cardBg: "from-gray-500 to-gray-700",
          chipColor: "text-gray-100",
          notes: []
        };
    }
  };

  const product = getProductInfo();

  return (
    <div className="min-h-screen bg-slate-50 py-12 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Navigation */}
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-8 hover:bg-slate-200 text-slate-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Pilihan
        </Button>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{product.title}</h1>
          <p className="text-lg text-slate-600">{product.subtitle}</p>
        </div>

        <div className="grid gap-8">
          
          {/* Top Section: Visual & Quick Stats */}
          <div className="grid md:grid-cols-1 gap-8 items-stretch">
            
            <img
              src={product.img}
              alt={`${product.title} Card`}
              className="w-full max-w-md mx-auto h-auto"
            />
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Column 1: Description & Features */}
            <div className="md:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  Tentang Produk
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {product.description}
                </p>
                
                <h4 className="font-semibold text-slate-900 mb-4">Keunggulan Utama</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
                  Syarat & Ketentuan
                </h3>
                <ul className="space-y-3">
                  {product.terms.map((term, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-slate-700">
                      <span className="font-bold text-slate-300 select-none">{idx + 1}.</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 2: Fees & Docs */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-500" />
                  Biaya & Limit
                </h3>
                <div className="space-y-4">
                  {product.fees.map((fee, idx) => (
                    <div key={idx} className="pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{fee.split(':')[0]}</p>
                      <p className="text-slate-900 font-medium">{fee.split(':')[1] || "Gratis"}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                   <FileText className="w-5 h-5 text-slate-500" />
                   Dokumen
                </h3>
                <div className="space-y-4">
                   {product.notes.map((note, idx) => (
                     <div key={idx} className="bg-slate-50 p-4 rounded-xl">
                       <p className="text-xs font-bold text-slate-700 mb-2 uppercase">{note.jenis}</p>
                       <ul className="list-disc list-inside space-y-1">
                         {note.dokumen.map((doc, dIdx) => (
                           <li key={dIdx} className="text-xs text-slate-600">{doc}</li>
                         ))}
                       </ul>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="sticky bottom-6 z-20">
            <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 max-w-3xl mx-auto border border-white/10">
              <div className="hidden sm:block pl-2">
                <p className="text-white font-bold">Pilih Ini?</p>
                <p className="text-slate-400 text-xs">Lanjutkan untuk pengisian formulir</p>
              </div>
              <Button 
                onClick={onNext}
                className="w-full sm:w-auto px-8 py-6 bg-green-500 hover:bg-green-400 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Buka Rekening Sekarang <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

        </div>

        {/* Simple Footer */}
        <div className="mt-16 pt-8 border-t border-slate-200 text-center">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} PT BPR Bank Sleman (Perseroda). Terdaftar dan diawasi oleh OJK.
          </p>
        </div>

      </div>
    </div>
  );
}

export default ProductDetails;
