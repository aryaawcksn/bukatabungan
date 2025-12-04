import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function InvalidRequestPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Permintaan Tidak Valid
        </h1>
        
        <p className="text-slate-600 mb-8">
          Maaf, halaman atau produk yang Anda cari tidak ditemukan atau tidak valid. Silakan kembali ke halaman utama.
        </p>

        <Button 
          onClick={() => navigate('/')}
          className="w-full bg-emerald-800 hover:bg-emerald-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  );
}
