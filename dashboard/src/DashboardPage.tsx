import { useState, useEffect, useRef } from 'react';
import { FormSubmissionCard } from './components/form-submission-card';
import { FormDetailDialog } from './components/form-detail-dialog';
import { ApprovalDialog } from './components/approval-dialog';
import { FileText, Search, Filter, LayoutDashboard, ClipboardCheck, FileBarChart } from 'lucide-react';
import { Input } from './components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

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
  };
  documents: {
    ktpPhoto: string;
    selfiePhoto: string;
  };
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
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

  return {
    id: data.id?.toString() || '',
    referenceCode: data.kode_referensi || '',
    cardType: mapJenisKartu(data.jenis_kartu),
    personalData: {
      fullName: data.nama_lengkap || '',
      nik: data.nik || '',
      email: data.email || '',
      phone: data.no_hp || '',
      birthDate: formatDate(data.tanggal_lahir),
      address: {
        street: data.alamat || '',
        province: data.provinsi || '',
        city: data.kota || '',
        postalCode: data.kode_pos || ''
      }
    },
    jobInfo: {
      occupation: data.pekerjaan || '',
      salaryRange: mapPenghasilan(data.penghasilan)
    },
    documents: {
      ktpPhoto: data.foto_ktp || '',
      selfiePhoto: data.foto_selfie || '',
    },
    submittedAt: formatDateTime(data.created_at),
    status: (data.status || 'pending') as 'pending' | 'approved' | 'rejected'
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
      const response = await fetch('http://localhost:5000/api/cek-koneksi');
      if (response.ok) {
        console.log('✅ Backend server terhubung');
      }
    } catch (error) {
      console.error('❌ Backend server tidak dapat diakses:', error);
      toast.error('Backend server tidak berjalan. Pastikan backend berjalan di http://localhost:5000', {
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

    const response = await fetch('http://localhost:5000/api/pengajuan', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
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
      toast.error(`Gagal memuat data: ${errorMessage}`);
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
      const response = await fetch(`http://localhost:5000/api/pengajuan/${approvalDialog.submission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          sendEmail: sendEmail,
          sendWhatsApp: sendWhatsApp,
          message
        })
      });

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900 font-semibold text-lg">Sistem Pemantauan Rekening Bank</h1>
              <p className="text-gray-500 text-sm">
                Pantau status dan kelola permohonan rekening baru
                {lastFetchTime && (
                  <span className="ml-2 text-xs">
                    • Terakhir update: {lastFetchTime.toLocaleTimeString('id-ID')}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="bg-gray-100 border-t border-gray-200">
          <div className="max-w-7xl mx-auto flex">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
              { id: 'submissions', label: 'Permohonan', icon: <ClipboardCheck className="w-4 h-4 mr-2" /> },
              { id: 'reports', label: 'Ajukan', icon: <FileBarChart className="w-4 h-4 mr-2" /> },
              { id: 'export', label: 'Kelola Data', icon: <FileBarChart className="w-4 h-4 mr-2" /> },
              { id: 'log', label: 'Aktivitas', icon: <FileBarChart className="w-4 h-4 mr-2" /> }
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
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="text-gray-500 text-sm">Total Permohonan</p>
              <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="text-gray-500 text-sm">Menunggu</p>
              <p className="text-lg font-semibold text-orange-600">{stats.pending}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="text-gray-500 text-sm">Disetujui</p>
              <p className="text-lg font-semibold text-green-600">{stats.approved}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="text-gray-500 text-sm">Ditolak</p>
              <p className="text-lg font-semibold text-red-600">{stats.rejected}</p>
            </div>
          </div>
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

        {activeTab === 'reports' && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
            <FileBarChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Fitur laporan akan ditambahkan di versi berikutnya.</p>
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