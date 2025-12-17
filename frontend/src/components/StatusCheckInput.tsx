import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface StatusCheckInputProps {
  variant?: 'compact' | 'full' | 'minimal';
  className?: string;
}

export default function StatusCheckInput({ variant = 'compact', className = '' }: StatusCheckInputProps) {
  const [referenceCode, setReferenceCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (referenceCode.trim()) {
      navigate(`/status/${referenceCode.trim()}`);
    }
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={() => {
          const kodeRef = prompt("Masukkan nomor registrasi Anda:");
          if (kodeRef) {
            navigate(`/status/${kodeRef}`);
          }
        }}
        className={`inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors ${className}`}
      >
        <FileText className="w-4 h-4" />
        Cek Status Pengajuan
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={`flex items-center gap-2 ${className}`}>
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Nomor registrasi..."
            value={referenceCode}
            onChange={(e) => setReferenceCode(e.target.value)}
            className="pr-10 text-sm h-9"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <Button 
          type="submit" 
          size="sm" 
          variant="outline"
          className="h-9 px-3 text-xs"
        >
          Cek
        </Button>
      </form>
    );
  }

  // Full variant
  return (
    <div className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <FileText className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Cek Status Pengajuan</h3>
          <p className="text-sm text-gray-600">Masukkan nomor registrasi untuk melihat status</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Input
            type="text"
            placeholder="Contoh: REG-1765940777509-432"
            value={referenceCode}
            onChange={(e) => setReferenceCode(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <Button 
          type="submit" 
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          Cek Status Pengajuan
        </Button>
      </form>
    </div>
  );
}