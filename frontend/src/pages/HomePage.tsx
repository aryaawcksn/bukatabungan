import React from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { FAQItem } from "../components/FAQItem";
import {
  Building2,
  Shield,
  TrendingUp,
  Smartphone,
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";


interface HomePageProps {
  onOpenSavings: (type: string) => void;
}


export default function HomePage({ onOpenSavings }: HomePageProps) {
  const products = [
    {
      id: 'mutiara',
      title: 'Tabungan Mutiara',
      description: 'Tingkatkan saldo, menangkan hadiahnya',
      color: 'from-emerald-600 to-emerald-800',
      features: ['Bunga kompetitif', 'Berhadiah', 'Tanpa biaya admin'],
      cardBg: 'bg-gradient-to-br from-emerald-500 to-emerald-700'
    },
    {
      id: 'bisnis',
      title: 'Tabungan Bank Sleman',
      description: 'Tabungan masyarakat Sleman',
      color: 'from-indigo-600 to-purple-700',
      features: ['Gratis biaya admin', 'Bunga hingga 3.5%', 'Kartu debit gratis'],
      cardBg: 'bg-gradient-to-br from-indigo-600 to-purple-700'
    },
    {
      id: 'simpel',
      title: 'Tabungan Simpel',
      description: 'Nabung sejak dini',
      color: 'from-pink-500 to-rose-600',
      features: ['Untuk pelajar', 'Setoran ringan', 'Edukasi finansial'],
      cardBg: 'bg-gradient-to-br from-pink-500 to-rose-600'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
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
              {/* Ganti ini dengan logo PNG */}
              <img 
                src="/banksleman.png" 
                alt="BankKu Logo" 
                className="w-40 h-auto -mt-3" // atur ukuran sesuai kebutuhan
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
            <h1 className="text-white mb-4 text-5xl md:text-6xl">Tabungan</h1>
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <a href="#" className="hover:text-white transition-colors">Home</a>
              <span>/</span>
              <span className="text-emerald-400">Tabungan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id= "produk" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-gray-900 font-semibold mb-4 text-4xl">Produk Tabungan</h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card 
                key={product.id}
                className="bg-white overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg group cursor-pointer"
              >
                {/* Card Visual */}
                <div className="relative h-56 overflow-hidden">
                  <div className={`absolute inset-0 ${product.cardBg} p-6 transform group-hover:scale-105 transition-transform duration-300`}>
                    {/* Card Design */}
                    <div className="relative h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="text-white/90 text-sm"></div>
                        <img
                          src="/banksleman.png"  // ganti dengan path gambar kamu
                          alt="Bank Logo"
                          className="w-25 h-8 object-contain"
                        />
                      </div>
                      
                      {/* Chip */}
                        <img
                          src="/chip.png" // pastikan path-nya benar, misalnya di public/images
                          alt="Logo GPN"
                          className="w-11 object-contain"
                        />
                      


                      <div>
                        <div className="text-white/90 text-xs mb-2">Card Number</div>
                        <div className="text-white text-xl tracking-wider">•••• •••• •••• 8765</div>
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-white/70 text-xs mb-1">exp</div>
                          <div className="text-white text-sm">20/26</div>
                        </div>
                        <div className="flex gap-1">
                          <div className="relative">
 

                            {/* Ganti dekorasi bawah kiri jadi gambar */}
                            <img
                              src="/gpn.png"
                              alt="Logo GPN"
                              className="absolute -bottom-15 -right-0 w-12 h-40 opacity-60 object-contain"
                            />

                          {/* konten utama */}
                          <div className="p-8">
                            {/* isi konten kamu di sini */}
                          </div>
                        </div>
                        </div>
                      </div>
                    </div>

                    {/* Decorative circles */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full"></div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-gray-900 mb-3 text-2xl">{product.title}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                 <Button 
                  onClick={() => onOpenSavings(product.id)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 group-hover:shadow-lg transition-all"
                >
                  Selengkapnya
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
<section className="py-20 bg-white">
  <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 items-center gap-12">
    
    {/* Gambar Tropi di Kiri */}
    <div className="flex justify-center md:justify-start">
      <img
        src="/tropi.jpg"
        alt="Penghargaan Bank Sleman"
        className="rounded-2xl shadow-lg w-full max-w-md object-cover"
      />
    </div>

    {/* Teks di Kanan */}
    <div>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Kenapa harus pilih kami?
      </h2>
      <div className="w-20 h-1 bg-emerald-600 mb-6"></div>

      <ul className="space-y-5 text-gray-700">
        <li className="flex items-start gap-3">
          <CheckCircle className="text-emerald-600 w-6 h-6 mt-1" />
          <span>
            Kami peduli dan berkomitmen kuat untuk terus memajukan UMKM di wilayah Kabupaten Sleman
          </span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="text-emerald-600 w-6 h-6 mt-1" />
          <span>
            Kami berkomitmen untuk membantu masyarakat Kabupaten Sleman mencapai kesejahteraan
          </span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="text-emerald-600 w-6 h-6 mt-1" />
          <span>
            Kami berkomitmen untuk mengelola perusahaan dengan prinsip kehati-hatian dan tata kelola yang baik
          </span>
        </li>
      </ul>
    </div>

  </div>
</section>





{/* Section FAQ */}
<section className="py-16 bg-gray-50">
  <div className="max-w-3xl mx-auto px-6">
    <div className="max-w-3xl mx-auto px-6">
    <h2 className="text-3xl font-semibold text-center text-gray-900 mb-4">
      FAQ — Pertanyaan Umum
    </h2>
    <div className="w-24 h-1 bg-emerald-600 mx-auto rounded-full"></div>
  </div>
  <br></br>
    
    <FAQItem 
      question="Apakah Bank terdaftar di OJK?" 
      answer="Ya, BankKu terdaftar dan diawasi langsung oleh Otoritas Jasa Keuangan (OJK) serta dijamin oleh Lembaga Penjamin Simpanan (LPS)." 
    />
    
    <FAQItem 
      question="Apakah saya bisa membuka rekening secara online?" 
      answer="Tentu! Anda bisa membuka rekening langsung dari aplikasi mobile kami tanpa perlu datang ke cabang." 
    />

    <FAQItem 
      question="Apakah layanan customer service tersedia setiap saat?" 
      answer="Ya, layanan pelanggan kami tersedia 24 jam setiap hari untuk membantu kebutuhan Anda." 
    />
  </div>
</section>


      {/* CTA Section */}
      <section
  className="relative bg-cover bg-center bg-no-repeat py-20 overflow-hidden"
  style={{
    backgroundImage: `url("/kartubank.jpg")`, // ganti dengan path gambarmu
  }}
>
  <div className="absolute inset-0 bg-black/40"></div> {/* lapisan gelap transparan biar teks tetap jelas */}

  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
    <h2 className="text-white mb-6 text-4xl">
      Siap Membuka Tabungan?
    </h2>
    <p className="text-emerald-50 mb-10 text-xl">
      Proses cepat, mudah, dan 100% online
    </p>
    <Button 
      onClick={() => {
    const section = document.getElementById("produk");
    section?.scrollIntoView({ behavior: "smooth" });
  }}
      size="lg"
      className="bg-white text-emerald-700 hover:bg-emerald-50 px-10 py-7 text-lg shadow-xl hover:shadow-2xl transition-all"
    >
      Buka Tabungan Sekarang
      <ArrowRight className="h-5 w-5 ml-2" />
    </Button>
  </div>
</section>


      {/* Footer */}
      <footer className="bg-slate-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-3">
              {/* Ganti ini dengan logo PNG */}
              <img
              src="/banksleman.png"
              alt="BankKu Logo"
              className="w-40 h-auto brightness-[100] contrast-[0.1]"
            />
            </div>
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
