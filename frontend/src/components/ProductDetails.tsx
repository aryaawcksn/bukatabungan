import React, { useEffect } from "react";
import { Button } from "./ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  CreditCard,
  Banknote,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Download,
  UserPlus,
  Gem,
  File,
  Video
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

  const getProductInfo = () => {
    const type = savingsType ? savingsType.toLowerCase() : "";

    switch (type) {
      case "mutiara":
        return {
          title: "Tabungan Mutiara",
          subtitle: "Tingkatkan saldo, menangkan hadiahnya",
          description: "Tabungan Mutiara adalah produk tabungan berhadiah yang memberikan kesempatan untuk memenangkan hadiah menarik setiap bulannya.",
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
                "Kartu identitas orang tua",
                "Akte Kelahiran Anak / KIA",
              ]
            },
            {
              jenis: "Perorangan belum dewasa (Wali)",
              dokumen: [
                "Lorem ipsum dolor sit amet",
                "Lorem ipsum dolor sit amet",
              ]
            }
          ]
        };
      case "regular":
        return {
          title: "Tabungan Bank Sleman",
          subtitle: "Tabungan masyarakat Sleman",
          description: "Tabungan Bank Sleman adalah produk simpanan yang setoran dan penarikannya hanya dapat dilakukan menurut syarat tertentu yang disepakati.",
          features: [
            "Gratis biaya administrasi bulanan",
            "Akses mobile banking dan internet banking",
            "Layanan nasabah 24/7",
          ],
          terms: [
            "Perorangan atau Non Perorangan",
            "Penabung wajib mengisi aplikasi pembukaan rekening dan menyerahkan dokumen persyaratan pembukaan rekening sesuai ketentuan",
            "Setoran awal minimal Rp20.000 (dua puluh ribu rupiah)",
            "Saldo minimal Rp10.000 (sepuluh ribu rupiah)",
            "Satu nasabah hanya dapat memiliki satu rekening",
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
          title: "Tabungan Tidak Ditemukan",
          subtitle: `Kode: ${savingsType}`,
          description: "Mohon kembali dan pilih jenis tabungan yang tersedia.",
          features: [],
          terms: [],
          fees: [],
          interest: "",
          interestDesc: "",
          cardBg: "from-gray-500 to-gray-700",
          chipColor: "text-gray-100",
          img: "",
          notes: []
        };
    }
  };

  const product = getProductInfo();

    useEffect(() => {
       window.scrollTo({ top: 0, behavior: "auto" });
     }, []);

  return (
    // START: Perubahan Utama di Elemen Pembungkus Utama
    <div
      className="min-h-screen relative font-sans text-slate-800 pb-20 lg:pb-0" // Hapus bg-slate-50, tambahkan relative
      style={{
        backgroundImage: `url('/bs.png')`, // Panggil gambar dari folder public
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Agar gambar tetap saat di-scroll
      }}
    >
      {/* Layer Overlay Putih (Opacity 90%) agar teks mudah dibaca */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>


      {/* Bungkus Semua Konten di div Z-10 agar berada di atas overlay */}
      <div className="relative z-10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-2">

          {/* Navigation Breadcrumb */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={onBack}
              className="pl-0 text-slate-500 hover:text-blue-700 hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Produk
            </Button>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* --- LEFT SIDEBAR (STICKY) --- */}
            <div className="lg:col-span-4 lg:order-1">
              <div className="sticky top-20">


                {/* Main Product Card (Mengandung Gambar) */}
                <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-200 text-center">
                  <div className="bg-slate-50 rounded-sm p-8 mb-6 flex items-center justify-center">
                    {product.img ? (
                      <img
                        src={product.img}
                        alt={product.title}
                        // UBAH DARI w-48 menjadi w-64 atau w-80
                        className="w-80 mx-auto"
                      />
                    ) : (
                      // UBAH DARI w-48 menjadi w-64 pada placeholder <div> juga
                      <div className={`w-64 h-32 rounded-sm bg-gradient-to-br ${product.cardBg}`}></div>
                    )}
                  </div>

                  <h1 className="text-2xl font-bold text-slate-900">{product.title}</h1>
                  <p className="text-slate-500 mt-2 text-sm">{product.subtitle}</p>

                  {/* Desktop Action Button */}
                  <div className="mt-6 pt-6 border-t border-slate-100 hidden lg:block">
                    <Button
                      onClick={onNext}
                      className="w-full bg-blue-700 hover:bg-blue-800 h-12 text-sm font-semibold rounded-xl shadow-lg shadow-blue-900/10"

                    >
                      Buka Tabungan
                    </Button>
                    <p className="text-xs text-slate-400 mt-3 text-center">Proses cepat & aman</p>
                  </div>
                </div>

                {/* Process Flow Card */}
                
              </div>
            </div>

            {/* --- RIGHT CONTENT (SCROLLABLE) --- */}
            <div className="lg:col-span-8 lg:order-2 space-y-10">

              {/* Section: Description */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200">Deskripsi Produk</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg border-l-4 border-blue-400 pl-4">
                  {product.description}
                </p>
              </section>

              {/* Section: Features Grid */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Gem className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 ">
                  Keuntungan Utama
                </h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {product.features.map((feat, i) => (
                    <div key={i} className="flex items-start p-4 bg-white rounded-sm border border-slate-200 shadow-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0 mt-0.5"/>
                      <span className="font-medium text-slate-700 text-sm">{feat}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section: Data Tables (Terms & Fees) */}
              <div className="grid md:grid-cols-2 gap-8">

                {/* Syarat */}
                <section className="bg-white rounded-sm border border-slate-200 overflow-hidden shadow-sm h-full">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <h4 className="font-bold text-slate-800 text-sm">Syarat & Ketentuan</h4>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-4">
                      {product.terms.map((term, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                          <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0 border border-blue-100">
                            {i + 1}
                          </span>
                          <span>{term}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                {/* Biaya */}
                <section className="bg-white rounded-sm border border-slate-200 overflow-hidden shadow-sm h-full">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-slate-500" />
                    <h4 className="font-bold text-slate-800 text-sm">Informasi Biaya</h4>
                  </div>
                  <div className="p-0">
                    <table className="w-full text-sm text-left">
                      <tbody>
                        {product.fees.map((fee, i) => (
                          <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3 text-slate-500 w-1/2 align-top">
                              {fee.split(':')[0]}
                            </td>
                            <td className="px-6 py-3 font-semibold text-slate-900 text-right w-1/2 align-top">
                              {fee.split(':')[1] || "Gratis"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              {/* Section: Documents (Notes) */}
              {product.notes.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-6 flex items-center gap-2">
                    <File className="w-5 h-5 text-blue-600" /> Dokumen Persyaratan
                  </h3>
                  <div className="space-y-4">
                    {product.notes.map((note, idx) => (
                      <div key={idx} className="bg-blue-50/50 rounded-sm p-5 border border-blue-100 flex flex-col sm:flex-row gap-4">
                        <div className="bg-white p-2 rounded-lg h-fit w-fit border border-blue-100 shadow-sm hidden sm:block">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">
                            {note.jenis}
                          </h5>
                          <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
                            {note.dokumen.map((doc, dIdx) => (
                              <li key={dIdx} className="flex items-center gap-2 text-sm text-slate-600">
                                <ChevronRight className="w-3 h-3 text-blue-400" />
                                {doc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sticky Action Bar (Hidden on Desktop) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 lg:hidden z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4 max-w-lg mx-auto">
            <div className="flex-1">
              <p className="text-xs text-slate-500">Produk Pilihan</p>
              <p className="font-bold text-slate-900 truncate">{product.title}</p>
            </div>
            <Button onClick={onNext} className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6">
              Buka Tabungan
            </Button>
          </div>
        </div>

        {/* NEW COPYRIGHT FOOTER */}
        <div className="mt-24 lg:mt-32"></div>
        <div className="mt-16 lg:mt-24 pt-6 pb-6 border-t border-slate-200 text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-slate-500 text-sm m-0">
            &copy; {new Date().getFullYear()} PT BPR Bank Sleman (Perseroda) All rights reserved.
          </p>
        </div>
      </div>
      {/* END: Wrapper Konten Z-10 */}

    </div>
    // END: Perubahan Utama
  );
}

export default ProductDetails;