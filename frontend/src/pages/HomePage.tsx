import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";

interface HomePageProps {
  onOpenSavings: (type: string) => void;
}

export default function HomePage({ onOpenSavings }: HomePageProps) {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      
      {/* --- NAVBAR (From HeroLanding) --- */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${
          isScrolled 
            ? "bg-white/90 backdrop-blur-md py-4 shadow-sm" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo Area */}
            <div 
              className={`flex-shrink-0 flex items-center gap-2 transition-all duration-500 ${
                isScrolled 
                  ? "scale-95" 
                  : "scale-100"
              }`}
            >
              <img
              src="/banksleman.png"
              alt="Bank Sleman"
              className={`h-8 md:h-10 w-auto object-contain -mt-2 transition-all duration-500 ${
                isScrolled
                  ? "brightness-90 contrast-100"
                  : "brightness-200 contrast-200"
              }`}
            />
            </div>

            {/* Right Menu (Desktop) */}
            <div className="hidden md:flex items-center space-x-8">
              {["Produk", "Layanan", "Promo"].map((item) => (
                <a 
                  key={item}
                  href={item === "Produk" ? "#produk" : "#"} 
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isScrolled 
                      ? "text-slate-600 hover:text-green-600" 
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>
      
      {/* --- HERO SECTION (From HeroLanding) --- */}
      <main className="relative bg-gradient-to-br from-[#0EA5E9] via-[#34d399] to-[#064e3b] overflow-hidden">

        {/* Background Pattern Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-green-400/20 blur-[100px]" />
            <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] rounded-full bg-yellow-400/10 blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Text Content */}
            <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0 order-2 lg:order-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.15]">
                Masa Depan Finansial <br/>
                <span className="text-green-200">Dimulai dari Sini.</span>
              </h1>
              
              <p className="text-lg text-green-50 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Buka tabungan Bank Sleman langsung secara. Aman, cepat, dan tanpa perlu antre di kantor cabang.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => navigate('/selection')}
                  className="w-full sm:w-auto px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-green-900 font-bold rounded-xl shadow-lg shadow-yellow-500/20 transform transition hover:-translate-y-1"
                >
                  Buka Tabungan Sekarang
                </button>
                <a
                  href="#info"
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl backdrop-blur-sm border border-white/10 transition flex items-center justify-center gap-2"
                >
                   Pelajari Syarat
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-green-100/80">
                <div className="flex items-center gap-2">
                   <CheckShieldIcon className="w-5 h-5 text-green-300" />
                   <span>Terdaftar & Diawasi <strong>OJK</strong></span>
                </div>
                <div className="hidden sm:block text-white/20">|</div>
                <div className="flex items-center gap-2">
                   <UmbrellaIcon className="w-5 h-5 text-green-300" />
                   <span>Simpanan Dijamin <strong>LPS</strong></span>
                </div>
              </div>
            </div>

            {/* Illustration / Image Area */}
            <div className="relative lg:h-auto flex justify-center lg:justify-end order-1 lg:order-2">
  <div className="relative w-full max-w-md lg:max-w-lg">

    {/* GLASS – gerak diagonal + rotate */}
    <div 
  className="absolute inset-4 bg-white/5 border border-white/10 
             rounded-[2rem] backdrop-blur-sm 
             animate-glass"
/>


    {/* IMAGE – gerak naik turun saja */}
    <img
  src="/3dimage.png"
  className="relative z-10 w-full h-auto drop-shadow-2xl 
             animate-image transition hover:scale-[1.03] duration-500"
/>



                {/* Floating Card UI Element */}
                {/* <div className="absolute -bottom-6 -left-6 z-20 bg-white p-4 rounded-xl shadow-xl flex items-center gap-4 max-w-[200px] animate">
                  <div className="bg-green-100 p-2 rounded-lg">
                     <ChartIcon className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Bunga Kompetitif</p>
                    <p className="text-sm font-bold text-slate-900">Hingga 4.5%</p>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
        
        {/* Curved Divider */}
        <div className="absolute -bottom-[1px] w-full overflow-hidden leading-[0]">
          <svg
            className="block w-full h-[60px] lg:h-[100px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
              className="fill-slate-900"
            />
          </svg>
        </div>
      </main>

      {/* --- CORPORATE FOOTER (From HeroLanding) --- */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            
            {/* Column 1: Identity */}
            <div className="space-y-4">
              <h3 className="text-white text-lg font-bold">Bank Sleman</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Mitra keuangan terpercaya untuk membangun masa depan Anda. Melayani dengan hati, berinovasi dengan teknologi.
              </p>
              <div className="flex gap-4 mt-4">
                {/* Social Placeholders */}
                <SocialIconWrapper><FacebookIcon /></SocialIconWrapper>
                <SocialIconWrapper><InstagramIcon /></SocialIconWrapper>
                <SocialIconWrapper><YoutubeIcon /></SocialIconWrapper>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-green-400 transition">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Karir</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Berita & Artikel</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Laporan Tahunan</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Jaringan Kantor</a></li>
              </ul>
            </div>

            {/* Column 3: Products */}
            <div>
              <h4 className="text-white font-semibold mb-4">Produk & Layanan</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-green-400 transition">Tabungan</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Deposito</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Kredit Usaha</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Internet Banking</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Simulasi Kredit</a></li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Hubungi Kami</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Jl. Magelang KM 10, Tridadi, Sleman, Yogyakarta 55511</span>
                </li>
                <li className="flex items-center gap-3">
                  <PhoneIcon className="w-5 h-5 text-green-500 shrink-0" />
                  <span>(0274) 868xxx / Call Center 1500xxx</span>
                </li>
                <li className="flex items-center gap-3">
                  <MailIcon className="w-5 h-5 text-green-500 shrink-0" />
                  <span>cs@banksleman.co.id</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 mt-8">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <p className="text-xs text-slate-500 text-center md:text-left">
                &copy; {new Date().getFullYear()} PT BPR Bank Sleman (Perseroda). All rights reserved.
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-end gap-6">
                 {/* OJK & LPS Disclaimers */}
                 <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition">
                    <div className="bg-white p-1 rounded w-12 h-auto flex items-center justify-center">
                        <span className="text-[8px] font-bold text-black text-center leading-tight">OJK</span>
                    </div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider">Terdaftar & Diawasi</span>
                 </div>
                 <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition">
                    <div className="bg-white p-1 rounded w-12 h-auto flex items-center justify-center">
                        <span className="text-[8px] font-bold text-purple-900 text-center leading-tight">LPS</span>
                    </div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider">Peserta Penjaminan</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Icons Components (SVG) ---
const CheckShieldIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" />
  </svg>
)

const UmbrellaIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v20" /><path d="m17 5 3 2.8c.8.8 1.2 2 .5 3.5S17 15 12 15s-9.3-3.2-8.5-4.5S6 5.8 9 5" />
  </svg>
)

const ChartIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
  </svg>
)

const MapPinIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
)

const PhoneIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
)

const MailIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
)

const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
)
const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
)
const YoutubeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>
    </svg>
)

const SocialIconWrapper = ({ children }: { children: React.ReactNode }) => (
    <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-green-600 hover:text-white transition-all duration-300">
        {children}
    </a>
)
