import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function InvalidRequestPage() {
   return (
    <div
      className="relative min-h-screen flex items-center justify-center 
      bg-cover bg-center overflow-hidden animate-page-enter"
      style={{ backgroundImage: "url('/bs.png')" }}
    >
      {/* ✅ GRADIENT OVERLAY HALUS */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40" />

      {/* ✅ KONTEN DENGAN MASUK SMOOTH */}
      <div className="relative z-10 text-center px-6 animate-content-enter">
        <h1 className="text-6xl font-bold text-white drop-shadow-lg animate-stagger-1">
          404
        </h1>

        <p className="mt-6 text-lg text-white/90 drop-shadow animate-stagger-2">
          Halaman yang Anda cari tidak ditemukan
        </p>

        <div className="mt-8 flex justify-center gap-4 animate-stagger-3">
          <Link to="/">
            <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg transition-gentle hover:scale-105">
              Ke Beranda
            </Button>
          </Link>

          <Link to="/selection">
            <Button
              variant="outline"
              className="bg-white/10 text-white border-white/30 backdrop-blur-sm
              hover:bg-white/20 transition-gentle hover:scale-105"
            >
              Buka Rekening
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
