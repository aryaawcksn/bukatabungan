import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, AlertCircle, ArrowLeft, MapPin, Phone } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-8 px-4 animate-page-enter">
      <div className="max-w-2xl mx-auto animate-content-enter">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-4 text-emerald-700 hover:text-emerald-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Button>
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">
            Status Pengajuan
          </h1>
          <p className="text-gray-600">
            Cek status pengajuan pembukaan rekening Anda
          </p>
        </div>

        {error ? (
          <Card className="p-8 text-center bg-red-50 border-red-200">
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Pengajuan Tidak Ditemukan
            </h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Button
              onClick={() => navigate('/')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Kembali ke Beranda
            </Button>
          </Card>
        ) : statusData ? (
          <div className="space-y-6">
            {/* Status Card */}
            <Card className={`p-8 text-center ${getStatusBgColor(statusData.statusColor)}`}>
              <div className="mb-6">
                {getStatusIcon(statusData.status)}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {statusData.status === 'approved' ? 'Pengajuan Disetujui' :
                 statusData.status === 'rejected' ? 'Pengajuan Ditolak' :
                 'Pengajuan Sedang Diproses'}
              </h2>
              <p className="text-gray-700 text-lg mb-6">
                {statusData.statusMessage}
              </p>
              
              {/* Reference Code */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                <p className="text-sm text-gray-600 mb-1">Nomor Referensi</p>
                <p className="text-xl font-mono text-emerald-700 font-semibold">
                  {statusData.kode_referensi}
                </p>
              </div>
            </Card>

            {/* Details Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Detail Pengajuan
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nama Lengkap:</span>
                  <span className="font-medium">{statusData.nama_lengkap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jenis Rekening:</span>
                  <span className="font-medium">{statusData.jenis_rekening}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tanggal Pengajuan:</span>
                  <span className="font-medium">{formatDate(statusData.created_at)}</span>
                </div>
                {statusData.approved_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tanggal Disetujui:</span>
                    <span className="font-medium text-green-600">{formatDate(statusData.approved_at)}</span>
                  </div>
                )}
                {statusData.rejected_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tanggal Ditolak:</span>
                    <span className="font-medium text-red-600">{formatDate(statusData.rejected_at)}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Branch Info Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                Informasi Cabang
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nama Cabang</p>
                  <p className="font-medium text-gray-800">{statusData.cabang.nama_cabang}</p>
                </div>
                {statusData.cabang.alamat_cabang && (
                  <div>
                    <p className="text-sm text-gray-600">Alamat</p>
                    <p className="font-medium text-gray-800">{statusData.cabang.alamat_cabang}</p>
                  </div>
                )}
              </div>
              
              {statusData.status === 'approved' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Catatan:</strong> Silakan datang ke cabang di atas untuk pengambilan buku tabungan Anda. 
                    Jangan lupa membawa dokumen identitas asli.
                  </p>
                </div>
              )}
            </Card>

            {/* Refresh Button */}
            <div className="text-center">
              <Button
                onClick={fetchStatus}
                variant="outline"
                className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 mobile-button-press"
              >
                Refresh Status
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}