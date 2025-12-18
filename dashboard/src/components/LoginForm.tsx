import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { toast } from 'sonner';
import Captcha from './Captcha';
import { useAuth } from '../context/AuthContext';

export default function LoginForm() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requireCaptcha, setRequireCaptcha] = useState(false);
  const [captchaData, setCaptchaData] = useState({
    token: '',
    answer: ''
  });

  const handleCaptchaVerify = (token: string, answer: string) => {
    setCaptchaData({ token, answer });
  };

  const handleCaptchaError = (error: string) => {
    toast.error(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('Username dan password harus diisi');
      return;
    }

    if (requireCaptcha && (!captchaData.token || !captchaData.answer)) {
      toast.error('Silakan selesaikan captcha terlebih dahulu');
      return;
    }

    setLoading(true);

    try {
      const loginData = {
        username: formData.username,
        password: formData.password,
        ...(requireCaptcha && {
          captchaToken: captchaData.token,
          captchaAnswer: captchaData.answer
        })
      };

      const result = await login(loginData);
      
      if (result.success) {
        toast.success('Login berhasil!');
        // Redirect will be handled by AuthContext
      } else {
        // Check if captcha is required
        if (result.requireCaptcha) {
          setRequireCaptcha(true);
          toast.error(result.message || 'Captcha diperlukan untuk melanjutkan');
        } else {
          toast.error(result.message || 'Login gagal');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if error response indicates captcha is required
      if (error.response?.data?.requireCaptcha) {
        setRequireCaptcha(true);
        toast.error(error.response.data.message || 'Captcha diperlukan untuk melanjutkan');
      } else {
        toast.error(error.message || 'Terjadi kesalahan saat login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard Login
          </h1>
          <p className="text-gray-600">
            Masuk ke dashboard Bank Sleman
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="username" className="text-gray-700 font-medium">
              Username <span className="text-red-500">*</span>
            </Label>
            <Input
              id="username"
              type="text"
              required
              placeholder="Masukkan username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="mt-2 h-12 rounded-lg border-2 border-gray-300 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700 font-medium">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Masukkan password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 rounded-lg border-2 border-gray-300 focus:border-blue-500 pr-12"
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
          </div>

          {requireCaptcha && (
            <Captcha
              required={requireCaptcha}
              onVerify={handleCaptchaVerify}
              onError={handleCaptchaError}
              className="mt-4"
            />
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            disabled={loading || (requireCaptcha && (!captchaData.token || !captchaData.answer))}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Memproses...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </div>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Dashboard Bank Sleman - Sistem Pengajuan Tabungan
          </p>
        </div>
      </Card>
    </div>
  );
}