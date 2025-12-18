import React, { useState, useEffect } from 'react';
import { RefreshCw, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface CaptchaProps {
  onVerify: (token: string, answer: string) => void;
  onError?: (error: string) => void;
  required?: boolean;
  className?: string;
}

interface CaptchaData {
  token: string;
  question: string;
}

export default function Captcha({ onVerify, onError, required = false, className = '' }: CaptchaProps) {
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateCaptcha = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/api/captcha/generate`, {
        method: 'GET',
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCaptchaData(result.data);
        setAnswer('');
      } else {
        const errorMsg = result.message || 'Gagal memuat captcha';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'Tidak dapat terhubung ke server';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
    setError('');
    
    // Auto-verify when answer is provided
    if (value.trim() && captchaData) {
      onVerify(captchaData.token, value.trim());
    }
  };

  const handleRefresh = () => {
    generateCaptcha();
  };

  // Generate captcha on mount if required
  useEffect(() => {
    if (required) {
      generateCaptcha();
    }
  }, [required]);

  // Don't render if not required
  if (!required && !captchaData) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-4 w-4 text-blue-600" />
        <Label className="text-sm font-medium text-gray-700">
          Verifikasi Keamanan <span className="text-red-500">*</span>
        </Label>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}
      
      <div className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Memuat captcha...</span>
          </div>
        ) : captchaData ? (
          <>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="bg-white px-4 py-2 rounded border border-gray-300 font-mono text-lg font-semibold text-gray-800 min-w-[100px] text-center">
                  {captchaData.question}
                </div>
                <span className="text-gray-600 font-medium">=</span>
                <Input
                  type="number"
                  placeholder="?"
                  value={answer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="w-20 text-center font-semibold"
                  autoComplete="off"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex-shrink-0"
              title="Muat ulang captcha"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="flex-1">
            <Button
              type="button"
              variant="outline"
              onClick={generateCaptcha}
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              Muat Captcha
            </Button>
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 flex items-start gap-1">
        <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Selesaikan perhitungan matematika sederhana untuk melanjutkan. Ini membantu melindungi sistem dari akses otomatis.
      </p>
    </div>
  );
}