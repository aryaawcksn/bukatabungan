import { useState, useEffect, useRef } from 'react';
import { FormSubmissionCard } from './components/form-submission-card';
import { FormDetailDialog } from './components/form-detail-dialog';
import { ApprovalDialog } from './components/approval-dialog';
import { FileText, Search, Filter, LayoutDashboard, ClipboardCheck, FileBarChart, LogOut, FileCog, X, Clock3, Check } from 'lucide-react';
import { Input } from './components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { StatCard } from "./components/ui/StatCard";



export interface FormSubmission {
  id: string;
  referenceCode: string;
  cardType?: string; // Jenis kartu debit yang dipilih
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
  savingsType?: string;
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
    savingsType: data.savings_type || '',
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
  const POLLING_INTERVAL = 5000; // 5 detik
  
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
        console.log('✅ Backend server terhubung');
      }
    } catch (error) {
      console.error('❌ Backend server tidak dapat diakses:', error);
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
      setSubmissions(mappedData);
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

  const handleApprove = (id: string) => {
    const submission = submissions.find(sub => sub.id === id);
    if (submission) setApprovalDialog({ open: true, type: 'approve', submission });
  };

  const handleReject = (id: string) => {
    const submission = submissions.find(sub => sub.id === id);
    if (submission) setApprovalDialog({ open: true, type: 'reject', submission });
  };

  const handleApprovalConfirm = async (sendEmail: boolean, sendWhatsApp: boolean, message: string) => {
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
            localStorage.removeItem("admin_cabang");
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
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch =
      sub.personalData.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.referenceCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length
  };

  const handleLogout = () => {
  localStorage.removeItem("token");   // kalau pakai token
  sessionStorage.clear();             // kalau simpan session
  window.location.href = "/login";    // redirect ke login
};


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
  {/* Left Side */}
  <div className="flex items-center gap-3">
    <div>
      <h1 className="text-gray-900 font-semibold text-lg">Sistem Pemantauan Formulir Rekening</h1>
      <p className="text-gray-500 text-sm">
        Bank Sleman Cabang {localStorage.getItem("admin_cabang") || "not_found"}
        {lastFetchTime && (
          <span className="ml-2 text-xs">
            • Terakhir update: {lastFetchTime.toLocaleTimeString('id-ID')}
          </span>
        )}
      </p>
    </div>
  </div>

  {/* Profile Badge */}
  <div className="flex items-center gap-3 bg-blue-50v px-4 py-2">
    <div className="text-right leading-tight">
      <p className="text-xs text-gray-500">
       Selamat datang
      </p>
      <p className="text-sm font-medium text-gray-800">
        {localStorage.getItem("admin_username") || "Not_found"}
      </p>
      
    </div>

    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center font-semibold">
      { (localStorage.getItem("admin_username") || "U").charAt(0).toUpperCase() }
    </div>
    
  </div>
</div>


        {/* Navigation Bar */}
        <nav className="bg-gray-100 border-t border-gray-200">
          <div className="max-w-7xl mx-auto flex">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
              { id: 'submissions', label: 'Permohonan', icon: <ClipboardCheck className="w-4 h-4 mr-2" /> },
              { id: 'manage', label: 'Kelola Data', icon: <FileCog className="w-4 h-4 mr-2" /> },
              { id: 'logout', label: 'Logout', icon: <LogOut className="w-4 h-4 mr-2" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-5 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Content */}
     <main className="max-w-7xl mx-auto px-6 py-8">
  {activeTab === "dashboard" && (
    <>
      <h3 className="mb-6 text-2xl">Informasi Permohonan</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Permohonan"
          value={stats.total}
          color="#3a7eea"
          icon={FileBarChart}
        />
        <StatCard
          title="Menunggu"
          value={stats.pending}
          color="#f6b53b"
          icon={Clock3}
        />
        <StatCard
          title="Disetujui"
          value={stats.approved}
          color="#1fb64c"
          icon={Check}
        />
        <StatCard
          title="Ditolak"
          value={stats.rejected}
          color="#e43333"
          icon={X}
        />
      </div>
    </>
  )}


        {activeTab === 'submissions' && (
          <>
            {/* Filter Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Cari nama atau kode referensi..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Disetujui</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <p className="text-gray-500">Memuat data...</p>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Tidak ada pengajuan yang ditemukan.</p>
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
          </>
        )}

        {activeTab === 'manage' && (
  <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

    {/* Cabang Pengambilan */}
    <button className="relative border rounded-xl p-6 hover:bg-gray-50 text-left shadow-sm">
      <h3 className="font-semibold text-gray-800 text-lg mb-1">
        Cabang Pengambilan
      </h3>
      <p className="text-gray-500 text-sm">Kelola daftar cabang bank.</p>
    </button>

    {/* Admin User - khusus high admin */}
    <button className="relative border rounded-xl p-6 hover:bg-gray-50 text-left shadow-sm">
      <span className="absolute top-3 right-3 bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
        High Admin
      </span>

      <h3 className="font-semibold text-gray-800 text-lg mb-1">
        Admin User
      </h3>
      <p className="text-gray-500 text-sm">Manajemen akun admin.</p>
    </button>

    {/* Kelola Daftar (untuk developer saja) */}
    <button className="relative border rounded-xl p-6 hover:bg-gray-50 text-left shadow-sm">
      <span className="absolute top-3 right-3 bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">
        Dev Only
      </span>

      <h3 className="font-semibold text-gray-800 text-lg mb-1">
        Kelola Sistem
      </h3>
      <p className="text-gray-500 text-sm">Menu khusus pengembangan.</p>
    </button>

  </div>
)}


        {activeTab === 'logout' && (
  <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-700">
    <LogOut className="w-12 h-12 mx-auto mb-4 text-gray-300" />
    <h2 className="text-xl font-semibold mb-2">Yakin ingin logout?</h2>
    <p className="text-gray-500 mb-6">
      Anda akan keluar dari panel admin.
    </p>

    <div className="flex justify-center gap-4">
      <Button
        onClick={handleLogout}
        className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
      >
        Logout
      </Button>
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