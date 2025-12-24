import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, AlertCircle, ArrowLeft, MapPin, Phone, RefreshCw, Check } from 'lucide-react';
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
  <div className="min-h-screen bg-slate-50 py-10 px-4">
    <div className="max-w-3xl mx-auto">
      {/* Navigation & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <button 
            onClick={() => navigate('/')}
            className="group flex items-center text-slate-500 hover:text-blue-600 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Kembali
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Lacak Pengajuan
          </h1>
        </div>
        
        {statusData && (
          <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ref ID:</span>
            <span className="font-mono font-bold text-blue-600">{statusData.kode_referensi}</span>
          </div>
        )}
      </div>

      {error ? (
        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="bg-red-500 h-2 w-full" />
          <div className="p-10 text-center">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Data Tidak Ditemukan</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">{error}</p>
            <Button onClick={() => navigate('/')} className="bg-slate-900 hover:bg-slate-800 text-white px-8">
              Coba Lagi
            </Button>
          </div>
        </Card>
      ) : statusData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Status Column */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
              <div className={`p-6 flex items-center gap-4 ${
                statusData.status === 'approved' ? 'bg-emerald-50' : 
                statusData.status === 'rejected' ? 'bg-red-50' : 'bg-blue-50'
              }`}>
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  {getStatusIcon(statusData.status)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Status Saat Ini</p>
                  <h2 className="text-xl font-bold text-slate-900">
                    {statusData.status === 'approved' ? 'Disetujui' :
                     statusData.status === 'rejected' ? 'Ditolak' : 'Dalam Proses Verifikasi'}
                  </h2>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100">
                <p className="text-slate-600 leading-relaxed">
                  {statusData.statusMessage}
                </p>
                
                {/* Tampilkan catatan jika ada */}
                {(statusData.approval_notes || statusData.rejection_notes) && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">
                      {statusData.status === 'approved' ? 'Catatan Persetujuan:' : 'Alasan Penolakan:'}
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {statusData.approval_notes || statusData.rejection_notes}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Application Steps (Visual Progress) */}
            <Card className="p-6 border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6">Timeline Pengajuan</h3>
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-slate-200">
                {/* Step 1: Submission */}
                <div className="relative flex items-center gap-6">
                  <div className="absolute left-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center ring-4 ring-white">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-12">
                    <p className="text-sm font-bold text-slate-900">Pengajuan Terkirim</p>
                    <p className="text-xs text-slate-500">{formatDate(statusData.created_at)}</p>
                  </div>
                </div>

                {/* Step 2: Verification */}
                <div className="relative flex items-center gap-6">
                  <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-white ${
                    statusData.status !== 'pending' ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'
                  }`}>
                    {statusData.status !== 'pending' ? <Check className="h-5 w-5 text-white" /> : <Clock className="h-5 w-5 text-white" />}
                  </div>
                  <div className="ml-12">
                    <p className="text-sm font-bold text-slate-900">Verifikasi Dokumen</p>
                    <p className="text-xs text-slate-500">
                      {statusData.status === 'pending' ? 'Sedang diperiksa oleh analis kami' : 'Selesai diverifikasi'}
                    </p>
                  </div>
                </div>

                {/* Step 3: Result */}
                {(statusData.approved_at || statusData.rejected_at) && (
                  <div className="relative flex items-center gap-6">
                    <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-white ${
                      statusData.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'
                    }`}>
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-12">
                      <p className="text-sm font-bold text-slate-900">
                        {statusData.status === 'approved' ? 'Keputusan Akhir: Disetujui' : 'Keputusan Akhir: Ditolak'}
                      </p>
                      <p className="text-xs text-slate-500">{formatDate((statusData.approved_at || statusData.rejected_at) as string)}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            <Card className="p-5 border-slate-200 shadow-sm bg-white">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Informasi Pemohon</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 block">Nama Lengkap</label>
                  <p className="font-semibold text-slate-900">{statusData.nama_lengkap}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block">Tipe Produk</label>
                  <p className="font-semibold text-slate-900">{statusData.jenis_rekening}</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-slate-200 shadow-sm bg-slate-900 text-white">
              <div className="flex items-center gap-2 mb-4 text-blue-400">
                <MapPin className="h-4 w-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">Cabang Tujuan</h3>
              </div>
              <p className="font-bold text-lg mb-1">{statusData.cabang.nama_cabang}</p>
              <p className="text-sm text-slate-400 leading-relaxed">
                {statusData.cabang.alamat_cabang}
              </p>
              
              {statusData.status === 'approved' && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-[11px] text-blue-300 italic uppercase font-medium">Instruksi:</p>
                  <p className="text-xs text-slate-300 mt-1">Bawa KTP asli untuk verifikasi fisik.</p>
                </div>
              )}
            </Card>

            <button 
              onClick={fetchStatus}
              className="w-full py-3 px-4 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Update Status
            </button>
          </div>
        </div>
      ) : null}
    </div>
    <ScrollToTop />
  </div>
);
}