import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FormSubmissionCard } from './components/form-submission-card';
import CabangSetting from './components/CabangSetting';

import { FormDetailDialog } from './components/form-detail-dialog';
import { ApprovalDialog } from './components/approval-dialog';
import { Search, LayoutDashboard, ClipboardCheck, FileBarChart, LogOut, FileCog, X, Clock3, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { StatCard } from "./components/ui/StatCard";

export interface FormSubmission {
  id: string;
  referenceCode: string;
  cardType?: string;
  savingsType?: string;
  cabangPengambilan?: number;
  cabangId?: string;
  cabangName?: string;
  personalData: {
    fullName: string;
    nik: string;
    email: string;
    phone: string;
    birthDate: string;
    gender?: string;
    maritalStatus?: string;
    citizenship?: string;
    motherName?: string;
    address: {
      street: string;
      province: string;
      city: string;
      postalCode: string;
    };
  };
  jobInfo: {
    occupation: string;
    salaryRange: string;
    workplace?: string;
    officeAddress?: string;
    incomeSource?: string;
    accountPurpose?: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
  };
  documents: {
    ktpPhoto: string;
    selfiePhoto: string;
  };
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  dataAgreement?: boolean;
}

// Helper function untuk mapping data dari backend ke format FormSubmission
const mapBackendDataToFormSubmission = (data: any): FormSubmission => {
  // Format tanggal lahir
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Format tanggal submitted
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Map penghasilan ke format yang lebih readable
  const mapPenghasilan = (penghasilan: string) => {
    const map: Record<string, string> = {
      'below5': '< Rp 5.000.000',
      '5-10jt': 'Rp 5.000.000 - Rp 10.000.000',
      '10-20jt': 'Rp 10.000.000 - Rp 20.000.000',
      'above20': '> Rp 20.000.000'
    };
    return map[penghasilan] || penghasilan;
  };

  // Map jenis kartu ke format yang lebih readable
  const mapJenisKartu = (jenisKartu: string) => {
    if (!jenisKartu) return '';
    const normalized = jenisKartu.toLowerCase().trim();
    const map: Record<string, string> = {
      'silver': 'Kartu Debit Silver',
      'gold': 'Kartu Debit Gold',
      'platinum': 'Kartu Debit Platinum',
      'silver-card': 'Kartu Debit Silver',
      'gold-card': 'Kartu Debit Gold',
      'platinum-card': 'Kartu Debit Platinum',
      'mutiara': 'Tabungan Mutiara',
      'bisnis': 'Tabungan Bank Sleman',
      'simpel': 'Tabungan Simpel',
      'individu': 'Tabungan Individu',
      'promosi': 'Tabungan Promosi'
    };
    // Jika ada di map, return mapped value, jika tidak return as-is dengan format yang lebih baik
    if (map[normalized]) {
      return map[normalized];
    }
    // Jika tidak ada di map, return dengan format title case
    return jenisKartu.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Map sumber dana ke format yang lebih readable
  const mapSumberDana = (sumberDana: string) => {
    const map: Record<string, string> = {
      'gaji': 'Gaji',
      'usaha': 'Usaha',
      'warisan': 'Warisan',
      'orang-tua': 'Orang Tua',
      'investasi': 'Investasi',
      'lainnya': 'Lainnya'
    };
    return map[sumberDana] || sumberDana;
  };

  // Map tujuan rekening ke format yang lebih readable
  const mapTujuanRekening = (tujuan: string) => {
    const map: Record<string, string> = {
      'tabungan-personal': 'Tabungan Pribadi',
      'bisnis': 'Keperluan Bisnis',
      'investasi': 'Investasi',
      'pembayaran': 'Pembayaran / Transaksi',
      'lainnya': 'Lainnya'
    };
    return map[tujuan] || tujuan;
  };

  return {
    id: data.id?.toString() || '',
    referenceCode: data.kode_referensi || '',
    cardType: mapJenisKartu(data.jenis_kartu),
    savingsType: data.jenis_rekening || data.savings_type || '',
    cabangPengambilan: Number(data.cabang_pengambilan) || undefined,
    cabangId: data.cabang_id || '',
    cabangName: data.nama_cabang || '',
    personalData: {
      fullName: data.nama_lengkap || '',
      nik: data.nik || '',
      email: data.email || '',
      phone: data.no_hp || '',
      birthDate: formatDate(data.tanggal_lahir),
      gender: (data.jenis_kelamin && data.jenis_kelamin.trim() !== '') ? data.jenis_kelamin : undefined,
      maritalStatus: (data.status_pernikahan && data.status_pernikahan.trim() !== '') ? data.status_pernikahan : undefined,
      citizenship: (data.kewarganegaraan && data.kewarganegaraan.trim() !== '') ? data.kewarganegaraan : undefined,
      motherName: (data.nama_ibu_kandung && data.nama_ibu_kandung.trim() !== '') ? data.nama_ibu_kandung : undefined,
      address: {
        street: data.alamat || '',
        province: data.provinsi || '',
        city: data.kota || '',
        postalCode: data.kode_pos || ''
      }
    },
    jobInfo: {
      occupation: data.pekerjaan || '',
      salaryRange: mapPenghasilan(data.penghasilan),
      workplace: (data.tempat_bekerja && data.tempat_bekerja.trim() !== '') ? data.tempat_bekerja : undefined,
      officeAddress: (data.alamat_kantor && data.alamat_kantor.trim() !== '') ? data.alamat_kantor : undefined,
      incomeSource: (data.sumber_dana && data.sumber_dana.trim() !== '') ? mapSumberDana(data.sumber_dana) : undefined,
      accountPurpose: (data.tujuan_rekening && data.tujuan_rekening.trim() !== '') ? mapTujuanRekening(data.tujuan_rekening) : undefined
    },
    emergencyContact: ((data.kontak_darurat_nama && data.kontak_darurat_nama.trim() !== '') || 
                       (data.kontak_darurat_hp && data.kontak_darurat_hp.trim() !== '')) ? {
      name: data.kontak_darurat_nama || '',
      phone: data.kontak_darurat_hp || ''
    } : undefined,
    documents: {
      ktpPhoto: (data.foto_ktp && data.foto_ktp.trim() !== '') ? data.foto_ktp : '',
      selfiePhoto: (data.foto_selfie && data.foto_selfie.trim() !== '') ? data.foto_selfie : '',
    },
    submittedAt: formatDateTime(data.created_at),
    status: (data.status || 'pending') as 'pending' | 'approved' | 'rejected',
    approvedBy: data.approved_by || undefined,
    approvedAt: data.approved_at ? formatDateTime(data.approved_at) : undefined,
    rejectedBy: data.rejected_by || undefined,
    rejectedAt: data.rejected_at ? formatDateTime(data.rejected_at) : undefined,
    dataAgreement: data.setuju_data || false
  };
};

export default function DashboardPage() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setIsRefreshing] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [approvalDialog, setApprovalDialog] = useState<{ open: boolean; type: 'approve' | 'reject'; submission: FormSubmission | null }>({
    open: false,
    type: 'approve',
    submission: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Interval untuk auto-refresh (5 detik)
  const POLLING_INTERVAL = 300; // 5 detik
  
  // Refs untuk tracking state tanpa menyebabkan re-render
  const loadingRef = useRef(loading);
  const approvalDialogRef = useRef(approvalDialog);
  const selectedSubmissionRef = useRef(selectedSubmission);
  
  // Update refs saat state berubah
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);
  
  useEffect(() => {
    approvalDialogRef.current = approvalDialog;
  }, [approvalDialog]);
  
  useEffect(() => {
    selectedSubmissionRef.current = selectedSubmission;
  }, [selectedSubmission]);

  // Fetch data dari backend dengan auto-refresh
  useEffect(() => {
    let isMounted = true;

    // Cek koneksi backend terlebih dahulu
    checkBackendConnection().then(() => {
      if (isMounted) {
        fetchSubmissions();
      }
    });

    // Setup auto-refresh interval
    const intervalId = setInterval(() => {
      // Jangan fetch jika sedang loading atau ada dialog terbuka
      if (isMounted && 
          !loadingRef.current && 
          !approvalDialogRef.current.open && 
          !selectedSubmissionRef.current) {
        fetchSubmissions(false); // false = tidak show loading indicator
      }
    }, POLLING_INTERVAL);

    // Cleanup interval saat component unmount
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch('https://bukatabungan-production.up.railway.app/api/cek-koneksi', {
        credentials: 'include'
      });
      if (response.ok) {
        console.log('status koneksi backend: OK');
      }
    } catch (error) {
      console.error('Backend server tidak dapat diakses:', error);
      toast.error('Tidak dapat terhubung ke server', {
        duration: 5000,
      });
    }
  };

 const fetchSubmissions = async (showLoading: boolean = true) => {
  try {
    if (showLoading) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    // 🔑 Ambil token dari localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token tidak ditemukan. Silakan login ulang.");
    }

    const response = await fetch('https://bukatabungan-production.up.railway.app/api/pengajuan', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }

    const result = await response.json();

    if (result.success && result.data) {
      const mappedData = result.data.map(mapBackendDataToFormSubmission);
      
      // Optimization: Only update state if data has actually changed
      setSubmissions(prev => {
        if (JSON.stringify(prev) === JSON.stringify(mappedData)) {
          return prev;
        }
        return mappedData;
      });
      
      setLastFetchTime(new Date());

      if (showLoading) {
        toast.success("Data berhasil dimuat", { duration: 2000 });
      }
    } else {
      if (showLoading) {
        toast.error(result.message || "Gagal mengambil data pengajuan");
      }
      setSubmissions([]);
    }
  } catch (error: any) {
    console.error("Error fetching submissions:", error);
    const errorMessage = error.message || "Terjadi kesalahan saat mengambil data";
    if (showLoading) {
      toast.error(
  <span>
    Gagal memuat data atau {errorMessage}. Silahkan coba login{" "}
    <a 
      href="/login" 
      className="underline text-blue-600 font-semibold"
    >
      di sini
    </a>.
  </span>
);
    }
    setSubmissions([]);
  } finally {
    if (showLoading) {
      setLoading(false);
    } else {
      setIsRefreshing(false);
    }
  }
};

  const handleApprove = useCallback((id: string) => {
    const submission = submissions.find(sub => sub.id === id);
    if (submission) setApprovalDialog({ open: true, type: 'approve', submission });
  }, [submissions]);

  const handleReject = useCallback((id: string) => {
    const submission = submissions.find(sub => sub.id === id);
    if (submission) setApprovalDialog({ open: true, type: 'reject', submission });
  }, [submissions]);

  const handleApprovalConfirm = useCallback(async (sendEmail: boolean, sendWhatsApp: boolean, message: string) => {
    if (!approvalDialog.submission) return;
    
    const newStatus = approvalDialog.type === 'approve' ? 'approved' : 'rejected';
    
    try {
      // 🔑 Ambil token dari localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token tidak ditemukan. Silakan login ulang.");
        return;
      }

      const response = await fetch(`https://bukatabungan-production.up.railway.app/api/pengajuan/${approvalDialog.submission.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          sendEmail: sendEmail,
          sendWhatsApp: sendWhatsApp,
          message
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        // Handle error response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          
          // Jika token tidak valid atau expired, redirect ke login
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("admin_cabang_id");
            localStorage.removeItem("admin_username");
            localStorage.removeItem("isLoggedIn");
            toast.error("Session expired. Silakan login ulang.");
            window.location.href = "/";
            return;
          }
        } catch (e) {
          // Jika response bukan JSON
        }
        toast.error(errorMessage || 'Gagal mengupdate status');
        return;
      }

      const result = await response.json();

      if (result.success) {
        const notificationMethods = [];
        if (sendEmail) notificationMethods.push('Email');
        if (sendWhatsApp) notificationMethods.push('WhatsApp');
        
        toast.success(
          approvalDialog.type === 'approve'
            ? `Permohonan disetujui!`
            : `Permohonan ditolak.`,
          {
            description: `${approvalDialog.submission.personalData.fullName} - ${approvalDialog.submission.referenceCode}${notificationMethods.length > 0 ? ` • Notifikasi dikirim via: ${notificationMethods.join(', ')}` : ''}`
          }
        );
        
        // Refresh data dari backend untuk memastikan data terbaru
        await fetchSubmissions(false);
      } else {
        toast.error(result.message || 'Gagal mengupdate status');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(`Terjadi kesalahan saat mengupdate status: ${error.message || 'Unknown error'}`);
    } finally {
      setApprovalDialog({ open: false, type: 'approve', submission: null });
      setSelectedSubmission(null);
    }
  }, [approvalDialog, fetchSubmissions]);

  const filteredSubmissions = useMemo(() => submissions.filter(sub => {
    const matchesSearch =
      sub.personalData.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.referenceCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [submissions, searchQuery, statusFilter]);

  const stats = useMemo(() => ({
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length
  }), [submissions]);

  const handleLogout = () => {
    localStorage.removeItem("token");   // kalau pakai token
    sessionStorage.clear();             // kalau simpan session
    window.location.href = "/login";    // redirect ke login
  };

  const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 10) return "Selamat Pagi";
  if (hour >= 10 && hour < 15) return "Selamat Siang";
  if (hour >= 15 && hour < 18) return "Selamat Sore";
  return "Selamat Malam";
};



  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/30 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Left Side - Branding */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center">
            <img 
              src="./bss2.png" 
              alt="Dashboard" 
              className="w-10 h-10 object-contain"
            />
          </div>

            <div>
              <h1
                className="text-slate-900 font-bold text-xl tracking-tight leading-none"
                style={{ fontFamily: '"", sans-serif, text-sm' }}
              >
                Bank Sleman
              </h1>
              <p className="text-slate-500 text-xs font-medium mt-1">
                Sistem Pemantauan Permohonan Rekening
              </p>
            </div>
          </div>

          {/* Right Side - Profile & Info */}
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <p className="text-xs font-medium text-slate-500 mb-0.5">
                Cabang {localStorage.getItem("admin_nama_cabang") || "Pusat"}
              </p>
              {lastFetchTime && (
                <p className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                  <Clock3 className="w-3 h-3" />
                  Last Update {lastFetchTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
            
            <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>

            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 leading-tight">
                  {localStorage.getItem("admin_username") || "Admin"}
                </p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold ring-2 ring-white">
                {(localStorage.getItem("admin_username") || "A").charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Integrated into Header for cleaner look */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1 -mb-px overflow-x-auto scrollbar-hide">
            {[
              { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
              { id: 'submissions', label: 'Permohonan', icon: ClipboardCheck },
              { id: 'manage', label: 'Pengaturan', icon: FileCog },
              { id: 'logout', label: 'Keluar', icon: LogOut }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap
                    ${isActive 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Welcome Message */}
        {activeTab === 'dashboard' && (
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          {getGreeting()}, {localStorage.getItem("admin_username") || "Admin"}! 👋
        </h2>
        <p className="text-slate-500 mt-2 text-lg">
          Berikut adalah ringkasan aktivitas permohonan rekening hari ini.
        </p>
      </div>
    )}

        {activeTab === "dashboard" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Permohonan"
                value={stats.total}
                color="#3b82f6"
                icon={FileBarChart}
                trend="+12% dari kemarin"
                trendColor="text-emerald-600"
              />
              <StatCard
                title="Menunggu Review"
                value={stats.pending}
                color="#f59e0b"
                icon={Clock3}
                trend="Butuh tindakan"
                trendColor="text-amber-600"
              />
              <StatCard
                title="Disetujui"
                value={stats.approved}
                color="#10b981"
                icon={Check}
                trend="Minggu ini"
                trendColor="text-emerald-600"
              />
              <StatCard
                title="Ditolak"
                value={stats.rejected}
                color="#ef4444"
                icon={X}
                trend="Minggu ini"
                trendColor="text-rose-600"
              />
            </div>

            {/* Recent Activity Section could go here */}
          </div>
        )}


        {activeTab === 'submissions' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Daftar Permohonan</h3>
                <p className="text-slate-500">Kelola dan verifikasi data nasabah.</p>
              </div>
              
              {/* Filter Bar */}
              <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    placeholder="Cari nama / ref..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-transparent border-none text-sm focus:ring-0 w-[200px] placeholder:text-slate-400"
                  />
                </div>
                <div className="h-6 w-[1px] bg-slate-200"></div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] border-none bg-transparent focus:ring-0 text-sm font-medium text-slate-600">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="approved">Disetujui</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="grid place-items-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-medium animate-pulse">Mengambil data...</p>
                </div>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-16 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Tidak ada data ditemukan</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Coba ubah kata kunci pencarian atau filter status untuk menemukan data yang Anda cari.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map(sub => (
                  <FormSubmissionCard
                    key={sub.id}
                    submission={sub}
                    onViewDetails={() => setSelectedSubmission(sub)}
                    onApprove={() => handleApprove(sub.id)}
                    onReject={() => handleReject(sub.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h3>
                  <p className="text-slate-500">Konfigurasi parameter dan akses admin.</p>
                </div>
                {/* Back button if in sub-view */}
              </div>

            {/* Simple toggle for now, or just render CabangSetting below for this task */}
            <div className="space-y-8">
              <CabangSetting />
              
              <div className="border-t border-slate-200 pt-8">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Menu Lainnya</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Admin User */}
                  <button className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:-lg hover:border-indigo-200 transition-all duration-300 text-left overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <span className="absolute top-4 right-4 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider z-20">
                      High Admin
                    </span>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <FileCog className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg mb-2">Manajemen User</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        Tambah atau hapus akses admin untuk staff bank lainnya.
                      </p>
                    </div>
                  </button>

                  {/* Dev Only */}
                  <button className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:-lg hover:border-purple-200 transition-all duration-300 text-left overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <span className="absolute top-4 right-4 bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider z-20">
                      Dev Only
                    </span>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <FileBarChart className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg mb-2">System Logs</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        Monitoring performa sistem dan error logs untuk developer.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logout' && (
          <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-300">
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center -xl max-w-md w-full">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut className="w-10 h-10 ml-1" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Konfirmasi Logout</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Apakah Anda yakin ingin keluar dari sistem? Anda harus login kembali untuk mengakses data.
              </p>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium border-none -none"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleLogout}
                  className="px-6 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 font-medium -lg -red-600/20"
                >
                  Ya, Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Dialogs */}
      {selectedSubmission && (
        <FormDetailDialog
          submission={selectedSubmission}
          open={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onApprove={() => handleApprove(selectedSubmission.id)}
          onReject={() => handleReject(selectedSubmission.id)}
        />
      )}

      {approvalDialog.submission && (
        <ApprovalDialog
          open={approvalDialog.open}
          onClose={() => setApprovalDialog({ open: false, type: 'approve', submission: null })}
          onConfirm={handleApprovalConfirm}
          type={approvalDialog.type}
          applicantName={approvalDialog.submission.personalData.fullName}
          email={approvalDialog.submission.personalData.email}
          phone={approvalDialog.submission.personalData.phone}
        />
      )}

      <Toaster />
    </div>
  );
}
