import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, AlertCircle, ArrowLeft, MapPin, Phone, RefreshCw, Check, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import ScrollToTop from './ScrollToTop';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface StatusData {
  kode_referensi: string;
  nama_lengkap: string;
  jenis_rekening: string;
  status: string;
  statusMessage: string;
  statusColor: string;
  created_at: string;
  approved_at?: string;
  rejected_at?: string;
  approval_notes?: string;
  rejection_notes?: string;
  cabang: {
    nama_cabang: string;
    alamat_cabang: string;
    telepon_cabang: string;
  };
}

export default function StatusCheck() {
  const { referenceCode } = useParams<{ referenceCode: string }>();
  const navigate = useNavigate();
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (referenceCode) {
      fetchStatus();
    }
  }, [referenceCode]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/pengajuan/status/${referenceCode}`);
      const result = await response.json();

      if (result.success) {
        setStatusData(result.data);
        setError(null);
      } else {
        setError(result.message || 'Nomor registrasi tidak ditemukan');
        setStatusData(null);
      }
    } catch (err) {
      console.error('Error fetching status:', err);
      setError('Terjadi kesalahan saat mengambil status pengajuan');
      setStatusData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-16 w-16 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-16 w-16 text-red-600" />;
      case 'pending':
        return <Clock className="h-16 w-16 text-yellow-600" />;
      default:
        return <AlertCircle className="h-16 w-16 text-gray-600" />;
    }
  };

  const getStatusBgColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-50 border-green-200';
      case 'red':
        return 'bg-red-50 border-red-200';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Mengambil status pengajuan...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-[#F4F7F9] antialiased text-slate-900">
    <ScrollToTop />
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-1 md:gap-0">
            <img 
              src="/banksleman.png" 
              alt="Bank Sleman Logo" 
              className="h-10 w-auto object-contain flex-shrink-0"
            />
            <div className="text-xs md:text-sm font-medium text-slate-600 md:pt-3">
              Pembukaan Rekening Online
            </div>
          </div>
        </div>
      </div>
    </header>

    <div className="max-w-4xl mx-auto py-8 px-4">
      
      {/* Header & Meta Information */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-6 border-b border-slate-200 gap-4">
        <div>
          {/* <button 
            onClick={() => navigate('/')}
            className="flex items-center text-slate-500 hover:text-slate-800 transition-colors text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <ArrowLeft className="h-3 w-3 mr-2" />
            Kembali ke Beranda
          </button> */}
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight text-center md:text-left">
            Status Pengajuan Layanan
          </h1>
        </div>
        
        {statusData && (
          <div className="text-center md:text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nomor Registrasi</p>
            <p className="font-mono text-lg font-bold text-slate-800">{statusData.kode_referensi}</p>
          </div>
        )}
      </div>

      {error ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-sm">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900">Data Tidak Ditemukan</h2>
          <p className="text-slate-500 mt-2 mb-6 text-sm">{error}</p>
          <Button onClick={() => navigate('/')} className="bg-slate-800 text-white rounded-md px-6 py-2 h-auto text-sm">
            Coba Lagi
          </Button>
        </div>
      ) : statusData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Status Card */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Detail Status</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                  statusData.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                  statusData.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {statusData.status === 'approved' ? 'Disetujui' : statusData.status === 'rejected' ? 'Ditolak' : 'Dalam Proses'}
                </span>
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {statusData.status === 'approved' ? 'Permohonan Anda Telah Disetujui' :
                   statusData.status === 'rejected' ? 'Permohonan Belum Dapat Disetujui' : 
                   'Permohonan Dalam Tahap Verifikasi'}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {statusData.statusMessage}
                </p>

                {/* Section Catatan Resmi */}
                {(statusData.approval_notes || statusData.rejection_notes) && (
                  <div className="mt-6 border-t border-slate-100 pt-6">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Catatan Petugas:</h3>
                    <div className="bg-slate-50 border border-slate-200 p-4">
                      <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                        {statusData.approval_notes || statusData.rejection_notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Section */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-8">Riwayat Aktivitas</h3>
              
              <div className="space-y-0 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
                {/* Step Item */}
                <div className="relative pl-10 pb-8">
                  <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-white border-2 border-emerald-500 rounded-full flex items-center justify-center z-10">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 text-[13px]">Pengajuan Diterima Sistem</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Dokumen telah berhasil diunggah dan masuk dalam sistem.</p>
                    </div>
                    <p className="text-[11px] font-medium text-slate-400 mt-1 md:mt-0">{formatDate(statusData.created_at)}</p>
                  </div>
                </div>

                {/* Step Item 2 */}
                <div className="relative pl-10 pb-8">
                  <div className={`absolute left-0 top-1 w-[24px] h-[24px] bg-white border-2 rounded-full flex items-center justify-center z-10 ${
                    statusData.status !== 'pending' ? 'border-emerald-500' : 'border-blue-500'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${statusData.status !== 'pending' ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`} />
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 text-[13px]">Proses Verifikasi Internal</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Pemeriksaan validitas data oleh tim internal.</p>
                    </div>
                  </div>
                </div>

                {/* Final Result */}
                {(statusData.approved_at || statusData.rejected_at) && (
                  <div className="relative pl-10">
                    <div className={`absolute left-0 top-1 w-[24px] h-[24px] bg-white border-2 rounded-full flex items-center justify-center z-10 ${
                      statusData.status === 'approved' ? 'border-emerald-500' : 'border-red-500'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${statusData.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 text-[13px]">Dokumen telah {statusData.status === 'approved' ? 'Disetujui' : 'Ditolak'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Tim verifikasi telah menyelesaikan proses.</p>
                      </div>
                      <p className="text-[11px] font-medium text-slate-400 mt-1 md:mt-0">{formatDate((statusData.approved_at || statusData.rejected_at) as string)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Information Summary */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Informasi Pendaftar</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 gap-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Nama Lengkap</span>
                  <span className="text-sm font-semibold text-slate-800 underline decoration-slate-200 underline-offset-4">{statusData.nama_lengkap}</span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Jenis Produk</span>
                  <span className="text-sm font-semibold text-slate-800">{statusData.jenis_rekening}</span>
                </div>
              </div>
            </div>

            {/* Branch Details */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-4 py-3 flex items-center gap-2">
                <MapPin className="h-3 w-3 text-blue-400" />
                <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Kantor Layanan</h3>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-slate-900 text-sm mb-1">{statusData.cabang.nama_cabang}</h4>
                <p className="text-xs text-slate-500 leading-normal mb-4">
                  {statusData.cabang.alamat_cabang}
                </p>
                
                {statusData.status === 'approved' && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-900 uppercase mb-2">Petunjuk Lanjutan:</p>
                    <div className="bg-blue-50 border-l-2 border-blue-500 p-3">
                      <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                        Harap hadir di kantor cabang dengan membawa dokumen identitas diri (KTP/Passport) asli untuk verifikasi fisik terakhir.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={fetchStatus}
              className="w-full py-3 rounded-md bg-slate-800 text-white text-[12px] font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <RefreshCw className="h-3 w-3" />
              Perbarui Status Pengajuan
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full py-3 rounded-md bg-slate-800 text-white text-[12px] font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Home className="h-3 w-3" />
              Kembali ke Beranda
            </button>
          </aside>
        </div>
      ) : null}
    </div>
  </div>
);
}