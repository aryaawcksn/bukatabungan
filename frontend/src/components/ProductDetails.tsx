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
          description: "Tabungan Mutiara adalah Salah satu produk tabungan di PT BPR Bank Sleman (Perseroda) yang memberikan peluang mendapatkan hadiah fantastis, berupa mobil, motor, batangan emas, tabungan dan berbagai peralatan elektronik yang diundi setiap tahun",
          features: [
            "Diundi setiap tahun dengan hadiah utama mobil",
            "Terrelasi dengan Kartu ATM Bank Sleman",
            "Akses Mobile Banking (dalam proses pengembangan)",
          ],
          terms: [
            "Perorangan dan Non Perorangan",
            "Setoran awal minimal Rp20.000 (dua puluh ribu rupiah)",
            "Setoran selanjutnya minimal Rp20.000 (dua puluh ribu rupiah)",
            "Saldo minimal Rp20.000 (dua puluh ribu rupiah",
          ],
          fees: [
            "Biaya Administrasi Rp8.000",
            "Biaya Tarik Tunai di ATM Bank Sleman Gratis",
            "Biaya Tarik Tunai/Transfer di Jaringan ALTO/PRIMA: Sesuai Ketentuan",
          ],
          interest: "3.5% p.a",
          interestDesc: "Suku bunga kompetitif yang dapat berubah sewaktu-waktu",
          cardBg: "from-emerald-500 to-emerald-800",
          chipColor: "text-emerald-100",
          img: "/mutiara1.png",
          notes: [
            {
              jenis: "Perorangan",
              dokumen: [
                "KTP Asli",
              ]
            },
            
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
              jenis: "Perorangan (>18 Tahun)",
              dokumen: [
                "Kartu Tanda Penduduk (KTP)",
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
              jenis: "Siswa PAUD/TK/SD/SMP/SMA (< 18 Tahun)",
              dokumen: [
                "Kartu Indentitas Anak (KIA)",
              ]
            },
          ]
        };

        case "arofah":
        return {
          title: "Tabungan Arofah",
          subtitle: "Tabungan Aman Ibadah Jadi Kenyataan",
          description: "Tabungan arofah adalah produk tabungan berhadiah yang diperuntukan untuk menghimpun dana persiapan perjalanan religi dan berhadiah uang tunai wisata religi yang diundi setahun sekali.",
          features: [
            "Perorangan",
          ],
          terms: [
            "Perorangan",
            "Penabung wajib mngisi aplikasi pembukaan rekening dan menyerahkan dokuen pesyaratan pembukaan rekening sesuai ketentuan",
            "Setoran awal minimal Rp100.000 (seratus ribu rupiah)",
            "Setoran selanjutnya minimal Rp10.000 (sepuluh ribu rupiah)",
            "Saldo minimal Rp100.000 (seratus ribu rupiah)",
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
          img: "/arofah.png",
          notes: [
            {
              jenis: "Perorangan (> 18 Tahun)",
              dokumen: [
                "Kartu Indentitas Penduduk (KTP)",
              ]
            },
          ]
        };
        case "tamasya":
        return {
          title: "Tabungan Tamasya Plus",
          subtitle: "Sering nabung, banyak untung",
          description: "Tabungan Tamasya Plus adalah tabungan berhadiah bersama BPR anggota Perbarindo Daerah Istimewa Yogyakarta yang diundi melalui mekanisme undian pada periode tertentu atas dasar poin undian yang diperoleh pada setiap bulannya.",
          features: [
            "Perorangan atau Non Perorangan",
          ],
          terms: [
            "Perorangan atau Non Perorangan",
            "Penabung wajib mngisi aplikasi pembukaan rekening dan menyerahkan dokuen pesyaratan pembukaan rekening sesuai ketentuan",
            "Setoran awal minimal Rp20.000 (dua puluh ribu rupiah)",
            "Saldo minimal Rp10.000 (sepuluh ribu rupiah)",
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
          img: "/tamasya.png",
          notes: [
            {
              jenis: "Perorangan",
              dokumen: [
                "Kartu Indentitas Penduduk (KTP)",
              ]
            },
             {
              jenis: "Non Perorangan",
              dokumen: [
                "Kartu Indentitas Penduduk (KTP)",
              ]
            },
          ]
        };
        case "tabunganku":
        return {
          title: "Tabungan Ku",
          subtitle: "Ringan dan Mudah",
          description: "TabunganKu adalah produk simpanan yang diselenggarakan secara bersama oleh bank-bank di Indonesia dengan persyaratan mudah dan ringan.",
          features: [
            "Perorangan atau Non Perorangan",
          ],
          terms: [
            "Perorangan atau Non Perorangan",
            "Penabung wajib mngisi aplikasi pembukaan rekening dan menyerahkan dokuen pesyaratan pembukaan rekening sesuai ketentuan",
            "Setoran awal minimal Rp10.000 (dua puluh ribu rupiah)",
            "Setoran selanjutnya minimal Rp10.000 (sepuluh ribu rupiah)",
            "Saldo minimal Rp10.000 (sepuluh ribu rupiah)",
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
          img: "/tabunganku.png",
          notes: [
            {
              jenis: "Perorangan",
              dokumen: [
                "Kartu Indentitas Penduduk (KTP)",
              ]
            },
             {
              jenis: "Non Perorangan",
              dokumen: [
                "Kartu Indentitas Penduduk (KTP)",
              ]
            },
          ]
        };
        case "pensiun":
        return {
          title: "Tabungan Pensiun",
          subtitle: "Simpanan untuk masa tua",
          description: "Tabungan Pensiun (Tapen) adalah simpanan yang setoran dan penarikannya hanya dapat dilakukan menurut syarat dtertentu yang disepakati.",
          features: [
            "Perorangan",
          ],
          terms: [
            "Perorangan atau Non Perorangan",
            "Penabung wajib mngisi aplikasi pembukaan rekening dan menyerahkan dokuen pesyaratan pembukaan rekening sesuai ketentuan",
            "Usia maksimal 64 tahun",
            "Setoran awal minimal Rp25.000 (dua puluh ribu rupiah)",
            "Setoran selanjutnya minimal Rp10.000 (sepuluh ribu rupiah)",
            "Saldo minimal Rp25.000 (sepuluh ribu rupiah)",
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
          img: "/taspen.png",
          notes: [
            {
              jenis: "Perorangan",
              dokumen: [
                "Kartu Indentitas Penduduk (KTP)",
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
  <div
    className="min-h-screen relative font-sans text-slate-800 pb-24 lg:pb-0 animate-page-enter"
    style={{
      backgroundImage: `url('/Gunung-Merapi.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}
  >
    {/* Overlay */}
    <div className="absolute inset-0 bg-white/75 backdrop-blur-sm"></div>

    <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-10 animate-content-enter">

        {/* Breadcrumb */}
        <div className="mb-10">
          <Button
            variant="ghost"
            onClick={onBack}
            className="pl-0 text-slate-500 hover:text-blue-700 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Produk
          </Button>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">

          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-4">
            <div className="sticky top-20">
              <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-md text-center">
                <div className="bg-slate-50 rounded-xl p-8 mb-6 flex items-center justify-center">
                  {product.img ? (
                    <img
                      src={product.img}
                      alt={product.title}
                      className="w-72 mx-auto"
                    />
                  ) : (
                    <div className={`w-64 h-32 rounded-lg bg-gradient-to-br ${product.cardBg}`}></div>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-slate-900">
                  {product.title}
                </h1>
                <p className="text-slate-600 mt-2 text-sm">
                  {product.subtitle}
                </p>

                <div className="mt-8 pt-6 border-t border-slate-200 hidden lg:block">
                  <Button
                    onClick={onNext}
                    className="w-full bg-blue-700 hover:bg-blue-800  h-11 text-sm font-semibold rounded-xl shadow"
                  >
                    Buka Tabungan
                  </Button>
                  <p className="text-xs text-slate-500 mt-3">
                    Aman • Resmi • Terpercaya
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="lg:col-span-8 space-y-12">

            {/* DESKRIPSI */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-blue-700" />
                <h3 className="text-lg font-bold text-slate-900">
                  Deskripsi Produk
                </h3>
              </div>
              <p className="text-slate-700 leading-relaxed text-base border-l-4 border-blue-500 pl-4">
                {product.description}
              </p>
            </section>

            {/* KEUNTUNGAN */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Gem className="w-5 h-5 text-blue-700" />
                <h3 className="text-lg font-bold text-slate-900">
                  Keuntungan Utama
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {product.features.map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-start p-4 bg-white rounded-xl border border-slate-200 shadow-sm"
                  >
                    <CheckCircle2 className="w-5 h-5 text-blue-700 mr-3 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-700 text-sm">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* SYARAT & BIAYA */}
            <div className="grid md:grid-cols-2 gap-8">

              {/* SYARAT */}
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h4 className="font-bold text-slate-800 text-sm">
                    Syarat & Ketentuan
                  </h4>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    {product.terms.map((term, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span>{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* BIAYA */}
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h4 className="font-bold text-slate-800 text-sm">
                    Informasi Biaya
                  </h4>
                </div>
                <table className="w-full text-sm text-left">
                  <tbody>
                    {product.fees.map((fee, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0">
                        <td className="px-6 py-3 text-slate-600 w-1/2">
                          {fee.split(':')[0]}
                        </td>
                        <td className="px-6 py-3 font-semibold text-slate-900 text-right w-1/2">
                          {fee.split(':')[1] || 'Gratis'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

            </div>

            {/* ========================= */}
            {/* DOKUMEN PERSYARATAN */}
            {/* ========================= */}
            {product.notes.length > 0 && (
              <section className="mt-16">
                <div className="flex items-center gap-2 mb-5">
                  <FileText className="w-5 h-5 text-blue-700" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Dokumen Persyaratan
                  </h3>
                </div>

                <div className="space-y-6">
                  {product.notes.map((note, i) => (
                    <div
                      key={i}
                      className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4 text-blue-700" />
                          <h4 className="font-semibold text-slate-800 text-sm">
                            {note.jenis}
                          </h4>
                        </div>
                        <span className="text-xs text-slate-500">
                          Wajib Disiapkan
                        </span>
                      </div>

                      <div className="p-6 grid sm:grid-cols-2 gap-4">
                        {note.dokumen.map((doc, j) => (
                          <div
                            key={j}
                            className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                              <File className="w-4 h-4 text-blue-700" />
                            </div>
                            <p className="text-sm font-medium text-slate-700">
                              {doc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-xs text-slate-500 leading-relaxed">
                  Dokumen dibawa saat pembukaan rekening di kantor cabang. Data diproses sesuai kebijakan privasi Bank Sleman.
                </p>
              </section>
            )}

          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-24 pt-6 border-t border-slate-200 text-center mb-6 lg:mb-0">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} PT BPR Bank Sleman (Perseroda)
          </p>
        </div>

      </div>
    </div>

    {/* MOBILE ACTION BAR - Outside relative container */}
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 lg:hidden z-50 shadow-lg backdrop-blur-sm animate-slide-up">
      <div className="flex items-center gap-4 max-w-lg mx-auto">
        <div className="flex-1 animate-stagger-1">
          <p className="text-xs text-slate-500">Produk Pilihan</p>
          <p className="font-bold text-slate-900 truncate">
            {product.title}
          </p>
        </div>
        <Button
          onClick={onNext}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 rounded-xl transition-gentle animate-stagger-2"
        >
          Buka Tabungan
        </Button>
      </div>
    </div>
  </div>
);


}

export default ProductDetails;