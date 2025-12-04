import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export default function NotFoundPage() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center 
      bg-cover bg-center overflow-hidden transition-all duration-700 animate-pageEnter"
      style={{ backgroundImage: "url('/bs.png')" }}
    >
      {/* ✅ GRADIENT OVERLAY HALUS */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />

      {/* ✅ KONTEN DENGAN MASUK SMOOTH */}
      <div className="relative z-10 text-center px-6 animate-contentEnter">
        <h1 className="text-7xl font-extrabold text-white drop-shadow-xl">
          404
        </h1>

        <p className="mt-4 text-lg text-white/90 drop-shadow">
          Halaman yang kamu cari tidak ditemukan
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link to="/dashboard">
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-all duration-300 hover:scale-105">
              Ke Dashboard
            </Button>
          </Link>

          <Link to="/login">
            <Button
              variant="outline"
              className="bg-white/20 text-white border-white/40 
              hover:bg-white/30 transition-all duration-300 hover:scale-105"
            >
              Ke Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
