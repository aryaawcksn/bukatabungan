import React from "react";
import { useNavigate } from "react-router-dom";



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

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-slate-50">
      {/* Inject Custom CSS */}

      {/* --- NAVBAR --- */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? "bg-white/95 backdrop-blur-sm py-3 shadow-md border-slate-200" 
            : "bg-transparent py-5 border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo Area */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <img
                src="/banksleman.png"
                alt="Bank Sleman"
                className={`h-10 w-auto object-contain transition-all duration-300 ${
                  isScrolled ? "" : "brightness-0 invert" 
                }`}
              />
            </div>

            {/* Right Menu (Desktop) */}
            <div className="hidden md:flex items-center space-x-8">
              {["Produk", "Layanan", "Promo"].map((item) => (
                <a 
                  key={item}
                  href="#" 
                  className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${
                    isScrolled 
                      ? "text-slate-700 hover:text-emerald-700" 
                      : "text-slate-100 hover:text-white"
                  }`}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative bg-slate-900 overflow-hidden">
        
        {/* Background Gradient & Pattern (Formal Style) */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f392b] to-emerald-900 z-0"></div>
        
        {/* Subtle Grid Pattern for Texture */}
        <div className="absolute inset-0 z-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24 lg:pt-48 lg:pb-40">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Text Content */}
            <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0 order-2 lg:order-1">
            

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
                Tabungan <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-100">
                  Aman & Terpercaya
                </span>
              </h1>

              <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Buka rekening Bank Sleman secara online dengan proses verifikasi yang cepat. Solusi keuangan resmi untuk masyarakat Sleman dan sekitarnya.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => navigate('/selection')}
                  className="w-full sm:w-auto px-18 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm uppercase tracking-wide rounded-lg shadow-lg shadow-amber-500/20 transition-transform transform hover:-translate-y-0.5"
                >
                  Buka Rekening
                </button>
                
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8 text-sm text-slate-400">
                <div className="flex items-center gap-3">
                   <div className="p-1.5 bg-slate-800 rounded border border-slate-700">
                      <CheckShieldIcon className="w-5 h-5 text-emerald-400" />
                   </div>
                   <div className="flex flex-col text-left">
                      <span className="text-xs uppercase tracking-wider opacity-70">Diawasi Oleh</span>
                      <strong className="text-white">Otoritas Jasa Keuangan</strong>
                   </div>
                </div>
                <div className="hidden sm:block w-px h-8 bg-slate-700"></div>
                <div className="flex items-center gap-3">
                   <div className="p-1.5 bg-slate-800 rounded border border-slate-700">
                      <UmbrellaIcon className="w-5 h-5 text-emerald-400" />
                   </div>
                   <div className="flex flex-col text-left">
                      <span className="text-xs uppercase tracking-wider opacity-70">Dijamin Oleh</span>
                      <strong className="text-white">Lembaga Penjamin Simpanan</strong>
                   </div>
                </div>
              </div>
            </div>

            {/* Illustration Area - UPDATED */}
            {/* Added negative margin top (-mt-...) to move the whole image area up */}
            <div className="relative flex justify-center lg:justify-end order-1 lg:order-2 -mt-12 lg:-mt-24">
                <div className="relative w-full max-w-md lg:max-w-lg">
                  
                  {/* Formal decorative backdrop (The "Glass" glow behind) */}
                  {/* Added animate-float-slower class */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/10 rounded-full blur-3xl -z-10 animate-float-slower"></div>
                  
                  {/* Main Image Container (The actual glass card frame) */}
                  {/* Added animate-float-slow class and removed group-hover effects */}
                  <div className="relative z-10 p-2 rounded-2xl backdrop-blur-sm shadow-2xl animate-float-slow">
                     <img
                        src="/3dimage.png"
                        alt="Mobile Banking Illustration"
                        className="w-full h-auto rounded-xl "
                      />
                      
                      {/* Floating Badge REMOVED from here */}
                  </div>
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- CORPORATE FOOTER --- */}
      <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10 mb-16">
            
            {/* Identity */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                 <h3 className="text-white text-xl font-bold tracking-tight">Bank Sleman</h3>
              </div>
              <p className="text-sm leading-7 text-slate-400">
                PT BPR Bank Sleman (Perseroda) hadir sebagai mitra keuangan terpercaya untuk membangun ekonomi daerah yang berkelanjutan.
              </p>
              <div className="flex gap-3">
                <SocialIconWrapper><FacebookIcon /></SocialIconWrapper>
                <SocialIconWrapper><InstagramIcon /></SocialIconWrapper>
                <SocialIconWrapper><YoutubeIcon /></SocialIconWrapper>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Perusahaan</h4>
              <ul className="space-y-3 text-sm">
                {['Profil Korporasi', 'Tata Kelola', 'Laporan Tahunan', 'Karir', 'Berita Terkini'].map(item => (
                    <li key={item}><a href="#" className="hover:text-emerald-400 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Produk</h4>
              <ul className="space-y-3 text-sm">
                {['Tabungan Mutiara', 'Deposito Berjangka', 'Kredit Usaha Rakyat', 'Kredit Pegawai', 'Simulasi Kredit'].map(item => (
                    <li key={item}><a href="#" className="hover:text-emerald-400 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Kantor Pusat</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Jl. Magelang KM 10, Tridadi, Sleman, Daerah Istimewa Yogyakarta 55511</span>
                </li>
                <li className="flex items-center gap-3">
                  <PhoneIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>(0274) 868xxx</span>
                </li>
                <li className="flex items-center gap-3">
                  <MailIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>cs@banksleman.co.id</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-slate-500 text-center md:text-left">
              &copy; {new Date().getFullYear()} PT BPR Bank Sleman (Perseroda). Seluruh Hak Cipta Dilindungi.
            </p>
            
            <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3">
                    <div className="bg-white px-2 py-1 rounded text-[10px] font-bold text-black border border-slate-600">OJK</div>
                    <div className="bg-white px-2 py-1 rounded text-[10px] font-bold text-purple-900 border border-slate-600">LPS</div>
                 </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Icons (Tetap sama) ---
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
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
)
const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
)
const YoutubeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>
    </svg>
)

const SocialIconWrapper = ({ children }: { children: React.ReactNode }) => (
    <a href="#" className="w-9 h-9 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all duration-300">
        {children}
    </a>
)