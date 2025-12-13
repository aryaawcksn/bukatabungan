import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { SubmissionTable } from './components/SubmissionTable';
import CabangSetting, { type Cabang } from './components/CabangSetting';
import AccountSetting from './components/AccountSetting';

import { FormDetailDialog } from './components/form-detail-dialog';
import { ApprovalDialog } from './components/approval-dialog';
import { Search, FileBarChart, LogOut, X, Clock3, Check, TrendingDown, TrendingUp, ArrowUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { StatCard } from "./components/ui/StatCard";
import { Sidebar } from './components/Sidebar';
import { DashboardHeader } from './components/DashboardHeader';

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
    alias?: string;
    identityType?: string;
    nik: string;
    identityValidUntil?: string;
    email: string;
    phone: string;
    birthPlace?: string;
    birthDate: string;
    gender?: string;
    maritalStatus?: string;
    religion?: string;
    education?: string;
    citizenship?: string;
    motherName?: string;
    npwp?: string;
    homeStatus?: string;
    tipeNasabah?: 'baru' | 'lama';
    nomorRekeningLama?: string;
    address: {
      street: string;
      domicile?: string;
      postalCode: string;
    };
  };
  jobInfo: {
    occupation: string;
    salaryRange: string;
    workplace?: string;
    officeAddress?: string;
    officePhone?: string;
    position?: string;
    businessField?: string;
    incomeSource?: string;
    averageTransaction?: string;
    accountPurpose?: string;
  };
  accountInfo: {
    accountType: string;
    initialDeposit?: string;
    cardType?: string;
    isForSelf: boolean;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    address?: string;
    relationship: string;
  };
  beneficialOwner?: {
    name: string;
    address: string;
    birthPlace?: string;
    birthDate?: string;
    gender?: string;
    citizenship?: string;
    maritalStatus?: string;
    identityType?: string;
    identityNumber?: string;
    incomeSource?: string;
    relationship?: string;
    phone?: string;
    occupation?: string;
    annualIncome?: string;
    approval?: boolean;
  };
  eddBankLain?: Array<{
    id: number;
    edd_id: number;
    bank_name: string;
    jenis_rekening: string;
    nomor_rekening: string;
    created_at: string;
  }>;
  eddPekerjaanLain?: Array<{
    id: number;
    edd_id: number;
    jenis_usaha: string;
    created_at: string;
  }>;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
}

// Helper function untuk mapping data dari backend ke format FormSubmission
export const mapBackendDataToFormSubmission = (data: any): FormSubmission => {
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
    cabangPengambilan: Number(data.cabang_id) || undefined,
    cabangId: data.cabang_id || '',
    cabangName: data.nama_cabang || '',
    personalData: {
      fullName: data.nama_lengkap || '',
      alias: data.alias || undefined,
      identityType: data.identityType || data.jenis_id || 'KTP',
      nik: data.nik || '',
      identityValidUntil: (data.berlaku_id && data.berlaku_id.trim() !== '') ? formatDate(data.berlaku_id) : 'Seumur Hidup',
      email: data.email || '',
      phone: data.no_hp || '',
      birthPlace: (data.tempat_lahir && data.tempat_lahir.trim() !== '') ? data.tempat_lahir : undefined,
      birthDate: formatDate(data.tanggal_lahir),
      gender: (data.jenis_kelamin && data.jenis_kelamin.trim() !== '') ? data.jenis_kelamin : undefined,
      maritalStatus: (data.status_pernikahan && data.status_pernikahan.trim() !== '') ? data.status_pernikahan : undefined,
      religion: (data.agama && data.agama.trim() !== '') ? data.agama : undefined,
      education: (data.pendidikan && data.pendidikan.trim() !== '') ? data.pendidikan : undefined,
      citizenship: (data.kewarganegaraan && data.kewarganegaraan.trim() !== '') ? data.kewarganegaraan : undefined,
      motherName: (data.nama_ibu_kandung && data.nama_ibu_kandung.trim() !== '') ? data.nama_ibu_kandung : undefined,
      npwp: (data.npwp && data.npwp.trim() !== '') ? data.npwp : undefined,
      homeStatus: (data.status_rumah && data.status_rumah.trim() !== '') ? data.status_rumah : undefined,
      tipeNasabah: (() => {
        const tipe = (data.tipe_nasabah && data.tipe_nasabah.trim() !== '') ? data.tipe_nasabah as 'baru' | 'lama' : 'baru';
        if (data.kode_referensi === 'REG-1765523075976-875') {
        }
        return tipe;
      })(),
      nomorRekeningLama: (data.nomor_rekening_lama && data.nomor_rekening_lama.trim() !== '') ? data.nomor_rekening_lama : undefined,
      address: {
        street: data.alamat || '',
        domicile: (data.alamat_domisili && data.alamat_domisili.trim() !== '' && data.alamat_domisili !== data.alamat) ? data.alamat_domisili : undefined,
        postalCode: data.kode_pos || ''
      }
    },
    jobInfo: {
      occupation: data.pekerjaan || '',
      salaryRange: mapPenghasilan(data.penghasilan),
      workplace: (data.tempat_bekerja && data.tempat_bekerja.trim() !== '') ? data.tempat_bekerja : (data.nama_perusahaan && data.nama_perusahaan.trim() !== '') ? data.nama_perusahaan : undefined,
      officeAddress: (data.alamat_kantor && data.alamat_kantor.trim() !== '') ? data.alamat_kantor : (data.alamat_perusahaan && data.alamat_perusahaan.trim() !== '') ? data.alamat_perusahaan : undefined,
      officePhone: (data.telepon_perusahaan && data.telepon_perusahaan.trim() !== '') ? data.telepon_perusahaan : (data.no_telepon && data.no_telepon.trim() !== '') ? data.no_telepon : undefined,
      position: (data.jabatan && data.jabatan.trim() !== '') ? data.jabatan : undefined,
      businessField: (data.bidang_usaha && data.bidang_usaha.trim() !== '') ? data.bidang_usaha : undefined,
      incomeSource: (data.sumber_dana && data.sumber_dana.trim() !== '') ? mapSumberDana(data.sumber_dana) : undefined,
      averageTransaction: (data.rata_rata_transaksi) ? `Rp ${parseFloat(data.rata_rata_transaksi).toLocaleString('id-ID')}` : (data.rata_transaksi_per_bulan) ? `Rp ${parseFloat(data.rata_transaksi_per_bulan).toLocaleString('id-ID')}` : undefined,
      accountPurpose: (data.tujuan_rekening && data.tujuan_rekening.trim() !== '') ? mapTujuanRekening(data.tujuan_rekening) : undefined
    },
    accountInfo: {
      accountType: data.jenis_rekening || '',
      initialDeposit: (data.nominal_setoran && data.nominal_setoran.trim() !== '') ? data.nominal_setoran : undefined,
      cardType: mapJenisKartu(data.jenis_kartu),
      isForSelf: data.rekening_untuk_sendiri
    },
    emergencyContact: ((data.kontak_darurat_nama && data.kontak_darurat_nama.trim() !== '') || 
                       (data.kontak_darurat_hp && data.kontak_darurat_hp.trim() !== '')) ? {
      name: data.kontak_darurat_nama || '',
      phone: data.kontak_darurat_hp || '',
      address: (data.kontak_darurat_alamat && data.kontak_darurat_alamat.trim() !== '') ? data.kontak_darurat_alamat : undefined,
      relationship: data.kontak_darurat_hubungan || ''
    } : undefined,
    beneficialOwner: (data.bo_nama && data.bo_nama.trim() !== '') ? {
      name: data.bo_nama,
      address: data.bo_alamat || '',
      birthPlace: (data.bo_tempat_lahir && data.bo_tempat_lahir.trim() !== '') ? data.bo_tempat_lahir : undefined,
      birthDate: (data.bo_tanggal_lahir && data.bo_tanggal_lahir.trim() !== '') ? formatDate(data.bo_tanggal_lahir) : undefined,
      gender: (data.bo_jenis_kelamin && data.bo_jenis_kelamin.trim() !== '') ? data.bo_jenis_kelamin : undefined,
      citizenship: (data.bo_kewarganegaraan && data.bo_kewarganegaraan.trim() !== '') ? data.bo_kewarganegaraan : undefined,
      maritalStatus: (data.bo_status_pernikahan && data.bo_status_pernikahan.trim() !== '') ? data.bo_status_pernikahan : undefined,
      identityType: (data.bo_jenis_id && data.bo_jenis_id.trim() !== '') ? data.bo_jenis_id : undefined,
      identityNumber: (data.bo_nomor_id && data.bo_nomor_id.trim() !== '') ? data.bo_nomor_id : undefined,
      incomeSource: (data.bo_sumber_dana && data.bo_sumber_dana.trim() !== '') ? data.bo_sumber_dana : undefined,
      relationship: (data.bo_hubungan && data.bo_hubungan.trim() !== '') ? data.bo_hubungan : undefined,
      phone: (data.bo_nomor_hp && data.bo_nomor_hp.trim() !== '') ? data.bo_nomor_hp : undefined,
      occupation: (data.bo_pekerjaan && data.bo_pekerjaan.trim() !== '') ? data.bo_pekerjaan : undefined,
      annualIncome: (data.bo_pendapatan_tahun && data.bo_pendapatan_tahun.trim() !== '') ? data.bo_pendapatan_tahun : undefined,
      approval: data.bo_persetujuan || false
    } : undefined,
    eddBankLain: data.edd_bank_lain && Array.isArray(data.edd_bank_lain) && data.edd_bank_lain.length > 0 ? data.edd_bank_lain : undefined,
    eddPekerjaanLain: data.edd_pekerjaan_lain && Array.isArray(data.edd_pekerjaan_lain) && data.edd_pekerjaan_lain.length > 0 ? data.edd_pekerjaan_lain : undefined,
    submittedAt: formatDateTime(data.created_at),
    status: (data.status || 'pending') as 'pending' | 'approved' | 'rejected',
    approvedBy: data.approvedBy || undefined,
    approvedAt: data.approved_at ? formatDateTime(data.approved_at) : undefined,
    rejectedBy: data.rejectedBy || undefined,
    rejectedAt: data.rejected_at ? formatDateTime(data.rejected_at) : undefined
  };
};

import { useAuth } from "./context/AuthContext";
import { API_BASE_URL } from "./config/api";

export default function DashboardPage() {
  const { user, logout } = useAuth();
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
  const [showScrollTop, setShowScrollTop] = useState(false);


  // State untuk CabangSetting
  const [cabangList, setCabangList] = useState<Cabang[]>([]);
  const [isCabangLoading, setIsCabangLoading] = useState(false);
  
  const [openAccordion, setOpenAccordion] = useState({
    cabang: false,
    account: false,
  });

  
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

  checkBackendConnection().then(() => {
    if (isMounted) {
      fetchSubmissions();
      fetchCabang(); // ✅ TAMBAHKAN INI
    }
  });

  const intervalId = setInterval(() => {
    if (
      isMounted &&
      !loadingRef.current &&
      !approvalDialogRef.current.open &&
      !selectedSubmissionRef.current
    ) {
      fetchSubmissions(false);
    }
  }, POLLING_INTERVAL);

  return () => {
    isMounted = false;
    clearInterval(intervalId);
  };
}, []);


  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cek-koneksi`, {
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
    // const token = localStorage.getItem("token");
    // if (!token) {
    //   throw new Error("Token tidak ditemukan. Silakan login ulang.");
    // }

    const response = await fetch(`${API_BASE_URL}/api/pengajuan`, {
      method: 'GET',
      headers: {
        // 'Authorization': `Bearer ${token}`,
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
      // Debug specific submission
      
      
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
    {errorMessage}. Silahkan coba login{" "}
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

  const fetchCabang = async () => {
    // Don't fetch if already loaded
    
    setIsCabangLoading(true);
    try {
      // const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/cabang`, {
        headers: {
          // 'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error('Gagal mengambil data cabang');
      
      const data = await res.json();
      if (data.success) {
        setCabangList(data.data);
       
      }
    } catch (error) {
      toast.error('Gagal memuat daftar cabang');
      console.error(error);
    } finally {
      setIsCabangLoading(false);
    }
  };

  const handleToggleCabangStatus = async (id: number, currentStatus: boolean) => {
  // ✅ Optimistic update sementara (tanpa updated_by dulu)
  setCabangList(prev =>
    prev.map(c => (c.id === id ? { ...c, is_active: !currentStatus } : c))
  );

  try {
    // const token = localStorage.getItem("token");

    const res = await fetch(
      `${API_BASE_URL}/api/cabang/${id}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ is_active: !currentStatus }),
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal mengubah status');
    }

    // ✅ UPDATE STATE DENGAN DATA ASLI DARI BACKEND (TERMAsUK updated_by)
    setCabangList(prev =>
      prev.map(c => (c.id === id ? data.data : c))
    );

    toast.success(`Status cabang diperbarui.`);
  } catch (error) {
    // ✅ Revert jika gagal
    setCabangList(prev =>
      prev.map(c => (c.id === id ? { ...c, is_active: currentStatus } : c))
    );

    toast.error('Gagal mengubah status!');
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

  const handleApprovalConfirm = useCallback(async (sendWhatsApp: boolean, message: string) => {
    if (!approvalDialog.submission) return;
    
    const newStatus = approvalDialog.type === 'approve' ? 'approved' : 'rejected';
    
    try {
      // 🔑 Ambil token dari localStorage
      // const token = localStorage.getItem("token");
      // if (!token) {
      //   toast.error("Token tidak ditemukan. Silakan login ulang.");
      //   return;
      // }

      const response = await fetch(`${API_BASE_URL}/api/pengajuan/${approvalDialog.submission.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
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
            localStorage.removeItem("role");
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
    logout();
  };

  const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 10) return "Selamat Pagi";
  if (hour >= 10 && hour < 15) return "Selamat Siang";
  if (hour >= 15 && hour < 18) return "Selamat Sore";
  return "Selamat Malam";
};

useEffect(() => {
  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 300);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};


  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={() => setActiveTab('logout')} 
      />

      <div className="flex-1 pl-64 transition-all duration-300">
        <DashboardHeader 
          user={user} 
          title={activeTab === 'dashboard' ? 'Overview' : activeTab === 'submissions' ? 'Daftar Permohonan' : activeTab === 'manage' ? 'Pengaturan' : 'Dashboard'}
          lastFetchTime={lastFetchTime}
        />

        <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Welcome Message */}
        {activeTab === 'dashboard' && (
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          {getGreeting()}, {user?.username || "Admin"}! 👋
        </h2>
        <p className="text-slate-500 mt-2 text-lg">
          Berikut adalah ringkasan aktivitas permohonan rekening hari ini.
        </p>
      </div>
    )}

        {activeTab === "dashboard" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Permohonan"
        value={stats.total}
        color="#3b82f6"
        icon={FileBarChart}
        trend="+12% dari kemarin"
        trendColor="text-emerald-600"
        trendIcon={TrendingUp}
      />

      <StatCard
        title="Menunggu Review"
        value={stats.pending}
        color="#f59e0b"
        icon={Clock3}
        trend="Butuh tindakan"
        trendColor="text-amber-600"
        trendIcon={TrendingDown}
      />

      <StatCard
        title="Disetujui"
        value={stats.approved}
        color="#10b981"
        icon={Check}
        trend="Minggu ini"
        trendColor="text-emerald-600"
        trendIcon={TrendingUp}
      />

      <StatCard
        title="Ditolak"
        value={stats.rejected}
        color="#ef4444"
        icon={X}
        trend="Minggu ini"
        trendColor="text-rose-600"
        trendIcon={TrendingDown}
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
            <SubmissionTable 
              submissions={filteredSubmissions}
              loading={loading}
              onViewDetails={(sub) => setSelectedSubmission(sub)}
              onApprove={(id) => handleApprove(id)}
              onReject={(id) => handleReject(id)}
            />
          </div>
        )}

       {activeTab === 'manage' && (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

    {/* Header Section */}
    <div>
      <h3 className="text-3xl font-bold text-slate-900">Pengaturan Sistem</h3>
      <p className="text-slate-500 mt-1">
        Konfigurasi cabang, akses admin, dan fitur lanjutan.
      </p>
    </div>

    {/* Accordion: Pengaturan Cabang */}
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
      {/* Header Accordion */}
      <button
        onClick={() =>
          setOpenAccordion(prev => ({ ...prev, cabang: !prev.cabang }))
        }
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-all duration-500"
      >
        <div>
          <h4 className="text-xl font-semibold text-slate-900">Pengaturan Cabang</h4>
          <p className="text-slate-500 text-sm">
            Atur status dan akses cabang operasional.
          </p>
        </div>

        <svg
          className={`w-5 h-5 text-slate-600 transition-transform ${
            openAccordion.cabang ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Body Accordion */}
      <div
        className={`overflow-hidden transition-all duration-500 ${
          openAccordion.cabang ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 border-t border-slate-200">
          {isCabangLoading ? (
            <div className="grid place-items-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">
                  Memuat Data Cabang...
                </p>
              </div>
            </div>
          ) : (
            <CabangSetting
              cabangList={cabangList}
              onToggleStatus={handleToggleCabangStatus}
            />
          )}
        </div>
      </div>
    </div>

    {/* Accordion: Pengaturan Akun */}
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
      {/* Header Accordion */}
      <button
        onClick={() =>
          setOpenAccordion(prev => ({ ...prev, account: !prev.account }))
        }
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-all duration-500"
      >
        <div>
          <h4 className="text-xl font-semibold text-slate-900">Pengaturan Akun</h4>
          <p className="text-slate-500 text-sm">
            Manajemen user dan hak akses sistem.
          </p>
        </div>

        <svg
          className={`w-5 h-5 text-slate-600 transition-transform ${
            openAccordion.account ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Body Accordion */}
      <div
        className={`overflow-hidden transition-all duration-500 ${
          openAccordion.account ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 border-t border-slate-200">
           <AccountSetting cabangList={cabangList} />
        </div>
      </div>
    </div>


  </div>
)}

        {activeTab === 'logout' && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-2xl max-w-md w-full animate-in zoom-in duration-300">

      {/* ICON */}
      <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
        <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-30" />
        <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-rose-500 text-white rounded-full flex items-center justify-center shadow-lg">
          <LogOut className="w-9 h-9 ml-1" />
        </div>
      </div>

      {/* TITLE */}
      <h2 className="text-2xl font-bold text-slate-900 mb-3">
        Konfirmasi Logout
      </h2>

      {/* DESCRIPTION */}
      <p className="text-slate-500 mb-8 leading-relaxed text-sm">
        Anda akan keluar dari sistem dan perlu login kembali untuk melanjutkan aktivitas. 
        Pastikan semua pekerjaan telah disimpan.
      </p>

      {/* ACTION BUTTON */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => setActiveTab('dashboard')}
          className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-all"
        >
          Batal
        </Button>

        <Button
          onClick={handleLogout}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white hover:opacity-90 font-semibold shadow-lg transition-all"
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
          phone={approvalDialog.submission.personalData.phone}
        />
      )}

      <Toaster />
      {showScrollTop && (
  <button
    onClick={scrollToTop}
    className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition-all animate-in fade-in zoom-in"
    aria-label="Scroll to top"
  >
    <ArrowUp className="w-5 h-5" />
  </button>
)}

      </div>
    </div>
  );
}
