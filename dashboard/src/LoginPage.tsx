import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import axios from "axios";

import { useAuth } from "./context/AuthContext";
import { API_BASE_URL } from "./config/api";
import "./styles/login-animations.css";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentBg, setCurrentBg] = useState(0);

  // Background images array with captions
  const backgrounds = [
    { image: 'https://res.cloudinary.com/dyeiuprwm/image/upload/v1766042175/lxtgu5wvswtaagpkefmf.jpg', caption: 'Menjelajahi keindahan alam Sleman yang memukau, dari perbukitan hijau hingga sawah yang luas.' },
    { image: 'https://res.cloudinary.com/dyeiuprwm/image/upload/v1766042177/adjornsqemej0hce8nio.jpg', caption: 'Keindahan Candi Prambanan yang memukau, warisan budaya dunia di jantung Yogyakarta.' },
    { image: 'https://res.cloudinary.com/dyeiuprwm/image/upload/v1766041914/jvfd8bhwafe0z9apoxy4.jpg', caption: 'Mitra finansial terpercaya untuk masa depan Yogyakarta yang lebih baik.' },
    { image: 'https://res.cloudinary.com/dyeiuprwm/image/upload/v1766041913/oflzawct3hml7alzskzf.jpg', caption: 'Saksi bisu kemegahan masa lalu. Selalu ada cerita di setiap sudut bebatuan Sleman.' },
    { image: 'https://res.cloudinary.com/dyeiuprwm/image/upload/v1766041912/trk8qvv9daus8cnen8bk.jpg', caption: 'Keindahan alam Indonesia yang memukau mata dan menyejukkan hati.' },
  ];

  // Auto-rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);


  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  if (!username || !password) {
    setLoading(false);
    return setError("Harap isi semua field");
  }

  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password, credentials: 'include'});
    if (res.data.success) {
      const { user: admin } = res.data;

      // Update Auth Context
      login(admin);

      navigate("/dashboard");
    } else {
      setError(res.data.message);
    }
  } catch (err) {
    const error = err as any;
    setError(error.response?.data?.message || "Login gagal");
  } finally {
    setLoading(false);
  }
};



  return (
  <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
    {/* ANIMATED BACKGROUND IMAGES */}
    {backgrounds.map((bg, index) => (
      <div
        key={bg.image}
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-2000 ${
          index === currentBg ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundImage: `url('${bg.image}')` }}
      />
    ))}

    {/* ANIMATED PARTICLES */}
    {/* <div className="absolute inset-0 overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        />
      ))}
    </div> */}

    {/* FLOATING GEOMETRIC SHAPES */}
    {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-20 h-20 border border-cyan-400/10 rounded-full animate-float" style={{ animationDelay: '0s' }} />
      <div className="absolute top-40 right-20 w-16 h-16 border border-blue-400/10 rounded-lg rotate-45 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-20 w-12 h-12 border border-cyan-300/10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-20 right-32 w-24 h-24 border border-blue-300/10 rounded-lg rotate-12 animate-float" style={{ animationDelay: '1.5s' }} />
    </div> */}

    {/* GRADIENT OVERLAY */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/75 to-slate-800/85" />



    {/* MAIN CONTENT */}
    <div className="relative z-10 w-full px-4">
      {/* LOGO/BRAND SECTION */}
      {/* <div className="text-center mb-8 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mb-4 shadow-lg">
          <Icon icon="mdi:bank" className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Bank Sleman</h1>
        <p className="text-cyan-200/80 text-sm">Sistem Administrasi Cabang</p>
      </div> */}

      {/* LOGIN FORM */}
      <div className=" p-8 rounded-2xl w-full max-w-md mx-auto animate-scale-in">

        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <img 
              src="/banksleman.webp" 
              alt="Bank Sleman Logo" 
              className="h-16 w-auto object-contain filter brightness-0 invert"
            />
          </div>
          <p className="text-cyan-200/70 text-sm">SISTEM MONITORING FORMULIR</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg backdrop-blur-sm">
            <p className="text-red-200 text-center text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* USERNAME */}
          <div className="relative group">
            <label className="block text-sm font-medium mb-2 text-white/90">
              Username
            </label>
            <div className="relative">
              <Icon
                icon="mdi:account-outline"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400/70"
              />
              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 placeholder-white/50 text-white focus:outline-none focus:border-cyan-400/60 focus:bg-white/15 transition-all duration-300"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="relative group">
            <label className="block text-sm font-medium mb-2 text-white/90">
              Password
            </label>
            <div className="relative">
              <Icon
                icon="mdi:lock-outline"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400/70"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/10 border transition-all duration-300 backdrop-blur-sm placeholder-white/50 text-white focus:outline-none ${
                  password.length >= 6
                    ? "border-emerald-400/40 focus:border-emerald-400/60 focus:bg-white/15"
                    : "border-white/20 focus:border-cyan-400/60 focus:bg-white/15"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-cyan-300 transition-colors"
              >
                <Icon
                  icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading || !username || !password}
            className={`w-full py-4 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg ${
              loading || !username || !password
                ? "bg-gray-600/50 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-xl transform hover:scale-[1.010] active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                <span>Tunggu Sebentar...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Icon icon="mdi:login" className="w-5 h-5" />
                <span>Masuk</span>
              </div>
            )}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-6 text-center space-y-3">
          {/* Background indicators */}
          <div className="flex justify-center space-x-2">
            {backgrounds.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBg(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentBg 
                    ? 'bg-cyan-400 w-6' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
          
          {/* Caption Text with Animation */}
          {/* <div className="relative h-8 flex justify-center items-center overflow-hidden px-4">
  {backgrounds.map((bg, index) => (
    <p
      key={bg.image}
      className={`
        absolute
        text-xs
        italic
        font-light
        tracking-wider
        transition-all
        duration-700
        ease-in-out

        ${
          index === currentBg
            ? 'opacity-50 translate-y-0 text-white blur-0'
            : index < currentBg
            ? 'opacity-0 -translate-y-6 text-white/10 blur-[0.5px]'
            : 'opacity-0 translate-y-6 text-white/10 blur-[0.5px]'
        }
      `}
      style={{
        textShadow: '0 1px 6px rgba(0,0,0,0.35)',
      }}
    >
      “{bg.caption}”
    </p>
  ))}
</div> */}

          
          <p className="text-white/50 text-xs pt-2">
            © 2025 PT BPR Bank Sleman (Perseroda).
          </p>
        </div>
      </div>
    </div>
  </div>
);

}
