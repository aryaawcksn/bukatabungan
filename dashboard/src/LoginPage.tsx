import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

import { useAuth } from "./context/AuthContext";
import { API_BASE_URL } from "./config/api";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-emerald-800 mb-6 text-center">
          Login Admin Cabang
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded"
                >
                {loading ? "Memproses..." : "Login"}
                </Button>
        </form>
      </div>
    </div>
  );
}
