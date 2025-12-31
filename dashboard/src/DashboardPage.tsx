import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense, memo } from 'react';
import { Search, FileBarChart, LogOut, X, Clock3, Check, TrendingDown, TrendingUp, ArrowUp, Calendar as CalendarIcon, AlertTriangle, BarChart3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { StatCard } from "./components/ui/StatCard";
import { Sidebar } from './components/Sidebar';
import { DashboardHeader } from './components/DashboardHeader';

// Import types
import type { Cabang } from './components/CabangSetting';

// Lazy load komponen berat
const SubmissionTable = lazy(() => import('./components/SubmissionTable').then(module => ({ default: module.SubmissionTable })));
const CabangSetting = lazy(() => import('./components/CabangSetting'));
const AccountSetting = lazy(() => import('./components/AccountSetting'));
const DataManagement = lazy(() => import('./components/DataManagement'));
const FormDetailDialog = lazy(() => import('./components/form-detail-dialog').then(module => ({ default: module.FormDetailDialog })));
const ApprovalDialog = lazy(() => import('./components/approval-dialog').then(module => ({ default: module.ApprovalDialog })));
const EditSubmissionDialog = lazy(() => import('./components/edit-submission-dialog').then(module => ({ default: module.EditSubmissionDialog })));

// Lazy load analytics components
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));
const InsightCards = lazy(() => import('./components/InsightCards'));
const QuickStats = lazy(() => import('./components/QuickStats'));

// Import skeletons
import { QuickStatsSkeleton, InsightCardsSkeleton, AnalyticsSkeleton } from './components/analytics-skeleton';

// Loading component
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center py-8">
    <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
  </div>
));

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
  approval_notes?: string;
  rejection_notes?: string;
  // Simplified edit tracking
  edit_count?: number;
  last_edited_at?: string;
  lastEditedBy?: string;
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
    // Penghasilan mapping
    return map[penghasilan] || penghasilan;
  };

  // Map jenis kartu ke format yang lebih readable
  const mapJenisKartu = (jenisKartu: string) => {
    if (!jenisKartu) return '';
    const normalized = jenisKartu.toLowerCase().trim();
    const map: Record<string, string> = {
      'silver': 'Silver',
      'gold': 'Gold',
      'platinum': 'Platinum',
      'silver-card': 'Silver',
      'gold-card': 'Gold',
      'platinum-card': 'Platinum'
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

  const result = {
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
      identityType: (() => {
        const type = data.identityType || data.jenis_id || 'KTP';
        const upperType = type.toUpperCase();
        if (upperType.includes('KTP')) return 'KTP';
        if (upperType.includes('KIA')) return 'KIA';
        if (upperType.includes('PASPOR')) return 'Paspor';
        if (upperType.includes('LAINNYA')) return 'Lainnya';
        return type;
      })(),
      nik: data.nik || '',
      identityValidUntil: (data.berlaku_id && data.berlaku_id.trim() !== '' && data.berlaku_id.toLowerCase() !== 'seumur hidup') ? formatDate(data.berlaku_id) : 'Seumur Hidup',
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
    rejectedAt: data.rejected_at ? formatDateTime(data.rejected_at) : undefined,
    approval_notes: data.approval_notes || undefined,
    rejection_notes: data.rejection_notes || undefined,
    // Simplified edit tracking
    edit_count: data.edit_count || 0,
    last_edited_at: data.last_edited_at ? formatDateTime(data.last_edited_at) : undefined,
    lastEditedBy: data.lastEditedBy || undefined
  };
  
  // Data mapping completed
  
  return result;
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
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);
  const [approvalDialog, setApprovalDialog] = useState<{ open: boolean; type: 'approve' | 'reject'; submission: FormSubmission | null }>({
    open: false,
    type: 'approve',
    submission: null
  });
  const [editDialog, setEditDialog] = useState<{ open: boolean; submission: FormSubmission | null }>({
    open: false,
    submission: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Limit items per page untuk performa
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Marking & Bulk Operations State
  const [markedSubmissions, setMarkedSubmissions] = useState<Set<string>>(new Set());
  
  // Date range filter untuk analytics
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  
  // State untuk input manual tanggal (format YYYY-MM-DD untuk input type="date")
  const [dateFromInput, setDateFromInput] = useState<string>('');
  const [dateToInput, setDateToInput] = useState<string>('');
  
  // Helper untuk convert string YYYY-MM-DD ke Date
  const stringToDate = useCallback((dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    const date = new Date(dateString + 'T00:00:00');
    if (isNaN(date.getTime())) return undefined;
    return date;
  }, []);
  
  // Handler untuk perubahan input tanggal
  const handleDateFromChange = useCallback((value: string) => {
    setDateFromInput(value);
    const date = stringToDate(value);
    setDateRange(prev => ({ ...prev, from: date }));
  }, [stringToDate]);
  
  const handleDateToChange = useCallback((value: string) => {
    setDateToInput(value);
    const date = stringToDate(value);
    setDateRange(prev => ({ ...prev, to: date }));
  }, [stringToDate]);
  
  // Handler untuk clear filter
  const handleClearDateFilter = useCallback(() => {
    setDateRange({ from: undefined, to: undefined });
    setDateFromInput('');
    setDateToInput('');
  }, []);


  // State untuk CabangSetting
  const [cabangList, setCabangList] = useState<Cabang[]>([]);
  const [isCabangLoading, setIsCabangLoading] = useState(false);
  
  const [openAccordion, setOpenAccordion] = useState({
    cabang: false,
    account: false,
    dataManagement: false,
  });

  
  // Interval untuk auto-refresh (30 detik untuk mengurangi beban)
  const POLLING_INTERVAL = 30000; // 30 detik
  
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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Refresh data ketika tab berubah
  useEffect(() => {
    if (activeTab === 'analytics') {
      // Gunakan analytics data untuk tab analytics
      fetchAnalyticsData(false);
      fetchCabangForAnalytics();
    } else if (activeTab === 'submissions' || activeTab === 'dashboard') {
      // Gunakan data regular untuk tab lain
      fetchSubmissions(false);
      fetchCabang();
    }
  }, [activeTab]);

  // Ref untuk tracking activeTab tanpa re-render (penting untuk interval)
  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Fetch data dari backend dengan auto-refresh
  useEffect(() => {
    let isMounted = true;

    checkBackendConnection().then(() => {
      if (isMounted) {
        // Jika di tab analytics, gunakan analytics data
        if (activeTab === 'analytics') {
          fetchAnalyticsData();
          fetchCabangForAnalytics();
        } else {
          fetchSubmissions();
          fetchCabang();
        }
      }
    });

    const intervalId = setInterval(() => {
      if (
        isMounted &&
        !loadingRef.current &&
        !approvalDialogRef.current.open &&
        !selectedSubmissionRef.current
      ) {
        // Check active tab from ref to decide which data to fetch
        if (activeTabRef.current === 'analytics') {
           fetchAnalyticsData(false);
        } else if (activeTabRef.current === 'submissions' || activeTabRef.current === 'dashboard') {
           fetchSubmissions(false);
        }
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
        // Backend connection OK
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
        // Quick length check first
        if (prev.length !== mappedData.length) {
          return mappedData;
        }
        // Deep comparison only if lengths match
        const hasChanged = prev.some((item, index) => 
          item.id !== mappedData[index]?.id || 
          item.status !== mappedData[index]?.status ||
          item.submittedAt !== mappedData[index]?.submittedAt ||
           // Check if we have enriched data that changed
           (item.jobInfo?.salaryRange !== mappedData[index]?.jobInfo?.salaryRange) ||
           // Check for edits
           (item.edit_count !== mappedData[index]?.edit_count) ||
           (item.last_edited_at !== mappedData[index]?.last_edited_at) ||
           // Check for relevant personal data changes (name is visible in table)
           (item.personalData.fullName !== mappedData[index]?.personalData.fullName) ||
           // Check for account info changes
           (item.accountInfo.accountType !== mappedData[index]?.accountInfo.accountType)
        );
        return hasChanged ? mappedData : prev;
      });
      
      setLastFetchTime(new Date());

      // if (showLoading) {
      //   toast.success("Data berhasil dimuat", { duration: 2000 });
      // }
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

  // Fetch analytics data (untuk semua cabang jika memungkinkan)
  const fetchAnalyticsData = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      // Try analytics endpoint first, fallback to regular endpoint
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/api/pengajuan/analytics/data?all_branches=true`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
      } catch (analyticsError) {
        // Analytics endpoint not available, using regular endpoint
        response = await fetch(`${API_BASE_URL}/api/pengajuan`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
      }

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
        
        // Update submissions dengan data analytics
        setSubmissions(prev => {
          // Quick length check first
          if (prev.length !== mappedData.length) {
            return mappedData;
          }
          // Deep comparison only if lengths match
          const hasChanged = prev.some((item, index) => 
            item.id !== mappedData[index]?.id || 
            item.status !== mappedData[index]?.status ||
            item.submittedAt !== mappedData[index]?.submittedAt ||
            // Check if we have enriched data (e.g. salary) that was missing before
            (item.jobInfo?.salaryRange !== mappedData[index]?.jobInfo?.salaryRange)
          );
          return hasChanged ? mappedData : prev;
        });
        
        setLastFetchTime(new Date());

        if (showLoading) {
          // Analytics data loaded successfully
        }
      } else {
        if (showLoading) {
          toast.error(result.message || "Gagal mengambil data analytics");
        }
        setSubmissions([]);
      }
    } catch (error: any) {
      console.error("Error fetching analytics data:", error);
      // Fallback ke data regular jika analytics gagal
      if (showLoading) {
        // Analytics failed, falling back to regular data
        toast.info("Analytics endpoint tidak tersedia, menggunakan data regular");
        await fetchSubmissions(showLoading);
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  // Fetch cabang untuk analytics (semua cabang jika memungkinkan)
  const fetchCabangForAnalytics = async () => {
    setIsCabangLoading(true);
    try {
      // Try analytics cabang endpoint first, fallback to regular cabang endpoint
      let res;
      try {
        res = await fetch(`${API_BASE_URL}/api/pengajuan/analytics/cabang?all_branches=true`, {
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
      } catch (analyticsError) {
        // Analytics cabang endpoint not available, using regular cabang endpoint
        res = await fetch(`${API_BASE_URL}/api/cabang`, {
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
      }
      
      if (!res.ok) {
        // Fallback ke endpoint cabang regular
        // Analytics cabang failed, falling back to regular cabang endpoint
        await fetchCabang();
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        setCabangList(data.data);
        // Analytics cabang loaded successfully
      }
    } catch (error) {
      console.error("Error fetching analytics cabang:", error);
      // Fallback ke endpoint cabang regular
      await fetchCabang();
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

  const handleEdit = useCallback((id: string) => {
    const submission = submissions.find(sub => sub.id === id);
    if (submission && submission.status === 'approved') {
      setEditDialog({ open: true, submission });
    }
  }, [submissions]);

  const handleEditSuccess = useCallback(() => {
    setEditDialog({ open: false, submission: null });
    fetchSubmissions(); // Refresh data
    // toast.success('Data berhasil diperbarui');
  }, [fetchSubmissions]);

  const handleEditComplete = useCallback(() => {
    fetchSubmissions(); // Refresh data when edit is completed
    setDetailRefreshKey(prev => prev + 1); // Force refresh detail dialog
  }, [fetchSubmissions]);

  const handleApprovalConfirm = useCallback(async (sendWhatsApp: boolean, message: string, notes: string) => {
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
          message,
          notes
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

  const filteredSubmissions = useMemo(() => {
    let filtered = submissions;
    
    if (debouncedSearchQuery || statusFilter !== 'all') {
      filtered = submissions.filter(sub => {
        const matchesSearch = !debouncedSearchQuery || 
          sub.personalData.fullName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          sub.referenceCode.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
    }
    
    // Reset to first page when filter changes
    if (currentPage > Math.ceil(filtered.length / itemsPerPage)) {
      setCurrentPage(1);
    }
    
    return filtered;
  }, [submissions, debouncedSearchQuery, statusFilter, currentPage, itemsPerPage]);

  const paginatedSubmissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSubmissions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSubmissions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

  // Helper function to parse date from submittedAt
  const parseSubmissionDate = useCallback((submittedAt: string): Date => {
    try {
      // Format: "13/12/2024, 10:30" atau "13/12/2024 10:30"
      const dateStr = submittedAt.split(/[, ]/)[0]; // Ambil bagian tanggal saja
      const [day, month, year] = dateStr.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } catch (error) {
      console.warn('Error parsing date:', submittedAt, error);
      return new Date(0);
    }
  }, []);

  // Filter submissions berdasarkan date range untuk analytics
  const filteredAnalyticsSubmissions = useMemo(() => {
    if (!dateRange.from && !dateRange.to) {
      return submissions; // Tidak ada filter tanggal
    }

    return submissions.filter(sub => {
      const subDate = parseSubmissionDate(sub.submittedAt);
      
      // Reset waktu untuk perbandingan tanggal saja
      const submissionDate = new Date(subDate.getFullYear(), subDate.getMonth(), subDate.getDate());
      
      if (dateRange.from && dateRange.to) {
        // Filter range: from <= date <= to
        const fromDate = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate());
        const toDate = new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate());
        return submissionDate >= fromDate && submissionDate <= toDate;
      } else if (dateRange.from) {
        // Hanya filter from
        const fromDate = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate());
        return submissionDate >= fromDate;
      } else if (dateRange.to) {
        // Hanya filter to
        const toDate = new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate());
        return submissionDate <= toDate;
      }
      
      return true;
    });
  }, [submissions, dateRange, parseSubmissionDate]);

  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    // Helper function untuk parsing tanggal dari format Indonesia
    const parseIndonesianDate = (dateStr: string): Date => {
      try {
        const [day, month, year] = dateStr.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } catch {
        return new Date(0);
      }
    };
    
    // Filter submissions hari ini
    const todaySubmissions = submissions.filter(s => {
      const submissionDate = s.submittedAt.split(',')[0]; // Ambil bagian tanggal saja
      return submissionDate === todayStr;
    });
    
    // Filter approved/rejected hari ini
    const approvedToday = submissions.filter(s => {
      if (s.status !== 'approved' || !s.approvedAt) return false;
      const approvedDate = s.approvedAt.split(',')[0];
      return approvedDate === todayStr;
    });
    
    const rejectedToday = submissions.filter(s => {
      if (s.status !== 'rejected' || !s.rejectedAt) return false;
      const rejectedDate = s.rejectedAt.split(',')[0];
      return rejectedDate === todayStr;
    });
    
    // Recent submissions (5 terbaru)
    const recentSubmissions = [...submissions]
      .sort((a, b) => new Date(b.submittedAt.split(',').reverse().join('-')).getTime() - new Date(a.submittedAt.split(',').reverse().join('-')).getTime())
      .slice(0, 5);
    
    // Cabang aktif dari submissions
    const activeBranches = new Set(submissions.map(s => s.cabangName).filter(Boolean)).size;
    
    // Jenis rekening paling populer
    const accountTypes = submissions.reduce((acc, s) => {
      const type = s.accountInfo.accountType || 'Tabungan';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const popularAccountType = Object.entries(accountTypes)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Tabungan';
    
    // Tingkat persetujuan
    const totalProcessed = submissions.filter(s => s.status !== 'pending').length;
    const approvedCount = submissions.filter(s => s.status === 'approved').length;
    const approvalRate = totalProcessed > 0 ? Math.round((approvedCount / totalProcessed) * 100) : 0;
    
    // Trend 7 hari terakhir
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }).reverse();
    
    const weeklyTrend = last7Days.map(dateStr => {
      const daySubmissions = submissions.filter(s => {
        const submissionDate = s.submittedAt.split(',')[0];
        return submissionDate === dateStr;
      });
      return {
        date: dateStr,
        count: daySubmissions.length,
        approved: daySubmissions.filter(s => s.status === 'approved').length,
        pending: daySubmissions.filter(s => s.status === 'pending').length
      };
    });
    
    // Permohonan yang sudah lama pending (lebih dari 3 hari)
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const oldPendingSubmissions = submissions.filter(s => {
      if (s.status !== 'pending') return false;
      const submissionDate = parseIndonesianDate(s.submittedAt.split(',')[0]);
      return submissionDate < threeDaysAgo;
    });
    
    // Permohonan urgent (lebih dari 5 hari)
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    
    const urgentSubmissions = submissions.filter(s => {
      if (s.status !== 'pending') return false;
      const submissionDate = parseIndonesianDate(s.submittedAt.split(',')[0]);
      return submissionDate < fiveDaysAgo;
    });
    
    return {
      total: submissions.length,
      pending: submissions.filter(s => s.status === 'pending').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      rejected: submissions.filter(s => s.status === 'rejected').length,
      todaySubmissions: todaySubmissions.length,
      approvedToday: approvedToday.length,
      rejectedToday: rejectedToday.length,
      recentSubmissions,
      activeBranches,
      popularAccountType,
      avgProcessTime: 2, // Placeholder - bisa dihitung dari data real
      approvalRate,
      weeklyTrend,
      oldPendingSubmissions,
      urgentSubmissions
    };
  }, [submissions]);

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

// Marking & Bulk Operations Handlers
const handleToggleMark = useCallback((id: string) => {
  setMarkedSubmissions(prev => {
    const newSet = new Set(prev);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    return newSet;
  });
}, []);





  // Manual Refresh Handler
  const handleManualRefresh = useCallback(() => {
    if (activeTab === 'analytics') {
      fetchAnalyticsData(true);
      fetchCabangForAnalytics();
    } else {
      fetchSubmissions(true);
      fetchCabang();
    }
  }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 animate-page-enter">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={() => setActiveTab('logout')} 
      />

      <div className="flex-1 pl-64 transition-all duration-300">
        <DashboardHeader 
          user={user} 
          title={activeTab === 'dashboard' ? 'Overview' : activeTab === 'analytics' ? 'Data Analytics' : activeTab === 'submissions' ? 'Daftar Permohonan' : activeTab === 'manage' ? 'Pengaturan' : 'Dashboard'}
          lastFetchTime={lastFetchTime}
          onRefresh={handleManualRefresh}
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
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Total Permohonan"
        value={stats.total}
        color="#3b82f6"
        icon={FileBarChart}
        trend={`${stats.todaySubmissions || 0} hari ini`}
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
        trend={`${stats.approvedToday || 0} hari ini`}
        trendColor="text-emerald-600"
        trendIcon={TrendingUp}
      />

      <StatCard
        title="Ditolak"
        value={stats.rejected}
        color="#ef4444"
        icon={X}
        trend={`${stats.rejectedToday || 0} hari ini`}
        trendColor="text-rose-600"
        trendIcon={TrendingDown}
      />
    </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Aktivitas Terbaru */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Aktivitas Terbaru</h3>
                <div className="space-y-3">
                  {stats.recentSubmissions?.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm">{submission.personalData.fullName}</p>
                        <p className="text-xs text-slate-500">{submission.referenceCode}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          submission.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          submission.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {submission.status === 'pending' ? 'Menunggu' : 
                           submission.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">{submission.submittedAt.split(',')[0]}</p>
                      </div>
                    </div>
                  ))}
                  {(!stats.recentSubmissions || stats.recentSubmissions.length === 0) && (
                    <p className="text-slate-500 text-sm text-center py-4">Belum ada aktivitas terbaru</p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Ringkasan Cepat</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Cabang Aktif</span>
                    <span className="font-semibold text-slate-900">{stats.activeBranches || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Jenis Rekening Populer</span>
                    <span className="font-semibold text-slate-900">{stats.popularAccountType || 'Tabungan'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Rata-rata Proses</span>
                    <span className="font-semibold text-slate-900">{stats.avgProcessTime || '2'} hari</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Tingkat Persetujuan</span>
                    <span className="font-semibold text-emerald-600">{stats.approvalRate || '85'}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trend Chart & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Mini Chart - Trend 7 Hari */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Trend 7 Hari Terakhir</h3>
                  <BarChart3 className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-3">
                  {stats.weeklyTrend?.map((day) => {
                    const maxCount = Math.max(...(stats.weeklyTrend?.map(d => d.count) || [1]));
                    const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                    
                    return (
                      <div key={day.date} className="flex items-center gap-3">
                        <div className="w-16 text-xs text-slate-600 font-medium">
                          {day.date.split('/').slice(0, 2).join('/')}
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-8 text-xs font-semibold text-slate-900">
                            {day.count}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Total minggu ini: {stats.weeklyTrend?.reduce((sum, day) => sum + day.count, 0) || 0}</span>
                    <span>Rata-rata: {Math.round((stats.weeklyTrend?.reduce((sum, day) => sum + day.count, 0) || 0) / 7)} per hari</span>
                  </div>
                </div>
              </div>

              {/* Notifikasi & Alerts */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Notifikasi & Peringatan</h3>
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div className="space-y-3">
                  {/* Urgent Submissions */}
                  {stats.urgentSubmissions && stats.urgentSubmissions.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="font-semibold text-red-800 text-sm">Urgent - Lebih dari 5 hari</span>
                      </div>
                      <p className="text-red-700 text-xs mb-2">
                        {stats.urgentSubmissions.length} permohonan memerlukan tindakan segera
                      </p>
                      <div className="space-y-1">
                        {stats.urgentSubmissions.slice(0, 2).map((submission) => (
                          <div key={submission.id} className="text-xs text-red-600">
                            • {submission.personalData.fullName} ({submission.referenceCode})
                          </div>
                        ))}
                        {stats.urgentSubmissions.length > 2 && (
                          <div className="text-xs text-red-600">
                            • dan {stats.urgentSubmissions.length - 2} lainnya...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Old Pending Submissions */}
                  {stats.oldPendingSubmissions && stats.oldPendingSubmissions.length > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock3 className="w-4 h-4 text-amber-600" />
                        <span className="font-semibold text-amber-800 text-sm">Perlu Perhatian - Lebih dari 3 hari</span>
                      </div>
                      <p className="text-amber-700 text-xs mb-2">
                        {stats.oldPendingSubmissions.length} permohonan menunggu review
                      </p>
                      <div className="space-y-1">
                        {stats.oldPendingSubmissions.slice(0, 2).map((submission) => (
                          <div key={submission.id} className="text-xs text-amber-600">
                            • {submission.personalData.fullName} ({submission.referenceCode})
                          </div>
                        ))}
                        {stats.oldPendingSubmissions.length > 2 && (
                          <div className="text-xs text-amber-600">
                            • dan {stats.oldPendingSubmissions.length - 2} lainnya...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* No Alerts */}
                  {(!stats.urgentSubmissions || stats.urgentSubmissions.length === 0) && 
                   (!stats.oldPendingSubmissions || stats.oldPendingSubmissions.length === 0) && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                      <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-emerald-800 font-medium text-sm">Semua Terkendali</p>
                      <p className="text-emerald-600 text-xs">Tidak ada permohonan yang memerlukan perhatian khusus</p>
                    </div>
                  )}

                  {/* Quick Action Button */}
                  {((stats.urgentSubmissions && stats.urgentSubmissions.length > 0) || 
                    (stats.oldPendingSubmissions && stats.oldPendingSubmissions.length > 0)) && (
                    <button
                      onClick={() => {
                        setActiveTab('submissions');
                        setStatusFilter('pending');
                      }}
                      className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Review Semua Pending
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Aksi Cepat</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('submissions')}
                  className="flex items-center justify-center gap-2 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg p-4 transition-colors"
                >
                  <Clock3 className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-slate-900">Review Pending</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="flex items-center justify-center gap-2 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg p-4 transition-colors"
                >
                  <FileBarChart className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-slate-900">Lihat Analytics</span>
                </button>
                <button
                  onClick={() => setActiveTab('manage')}
                  className="flex items-center justify-center gap-2 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg p-4 transition-colors"
                >
                  <Check className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-slate-900">Pengaturan</span>
                </button>
              </div>
            </div> */}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    Data Analytics & Insights
                  </h2>
                  <p className="text-slate-500 text-lg">
                    Analisis permohonan dan tren bisnis.
                  </p>
                </div>
                
                {/* Date Range Filter - Manual Input */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                    <CalendarIcon className="h-4 w-4 text-slate-500" />
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <label htmlFor="date-from" className="text-sm text-slate-600 whitespace-nowrap">
                          Dari:
                        </label>
                        <input
                          id="date-from"
                          type="date"
                          value={dateFromInput}
                          onChange={(e) => handleDateFromChange(e.target.value)}
                          className="border-none outline-none text-sm text-slate-900 bg-transparent cursor-pointer focus:ring-0 w-[140px]"
                          placeholder="Tanggal awal"
                        />
                      </div>
                      <span className="text-slate-400">-</span>
                      <div className="flex items-center gap-1">
                        <label htmlFor="date-to" className="text-sm text-slate-600 whitespace-nowrap">
                          Sampai:
                        </label>
                        <input
                          id="date-to"
                          type="date"
                          value={dateToInput}
                          onChange={(e) => handleDateToChange(e.target.value)}
                          className="border-none outline-none text-sm text-slate-900 bg-transparent cursor-pointer focus:ring-0 w-[140px]"
                          placeholder="Tanggal akhir"
                        />
                      </div>
                      {(dateRange.from || dateRange.to) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs hover:bg-slate-100"
                          onClick={handleClearDateFilter}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Info jumlah data yang difilter */}
              {(dateRange.from || dateRange.to) && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Menampilkan <span className="font-semibold">{filteredAnalyticsSubmissions.length}</span> dari <span className="font-semibold">{submissions.length}</span> permohonan
                    {dateRange.from && dateRange.to && (
                      <> dalam rentang {dateRange.from.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} - {dateRange.to.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <Suspense fallback={<QuickStatsSkeleton />}>
              <QuickStats submissions={filteredAnalyticsSubmissions} />
            </Suspense>

            {/* Insight Cards */}
            <Suspense fallback={<InsightCardsSkeleton />}>
              <InsightCards submissions={filteredAnalyticsSubmissions} />
            </Suspense>

            {/* Analytics Dashboard */}
            <Suspense fallback={<AnalyticsSkeleton />}>
              <AnalyticsDashboard submissions={filteredAnalyticsSubmissions} cabangList={cabangList} />
            </Suspense>
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
            <Suspense fallback={<LoadingSpinner />}>
              <SubmissionTable 
                submissions={paginatedSubmissions}
                loading={loading}
                onViewDetails={(sub) => setSelectedSubmission(sub)}
                onApprove={(id) => handleApprove(id)}
                onReject={(id) => handleReject(id)}
              />
            </Suspense>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-slate-600">
                  Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredSubmissions.length)} dari {filteredSubmissions.length} data
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </Button>
                  <span className="text-sm text-slate-600">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
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
            <Suspense fallback={<LoadingSpinner />}>
              <CabangSetting
                cabangList={cabangList}
                onToggleStatus={handleToggleCabangStatus}
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>

    {/* Accordion: Olah Data */}
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
      {/* Header Accordion */}
      <button
        onClick={() =>
          setOpenAccordion(prev => ({ ...prev, dataManagement: !prev.dataManagement }))
        }
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-all duration-500"
      >
        <div>
          <h4 className="text-xl font-semibold text-slate-900">Olah Data</h4>
          <p className="text-slate-500 text-sm">
            Export, import, dan backup data permohonan.
          </p>
        </div>

        <svg
          className={`w-5 h-5 text-slate-600 transition-transform ${
            openAccordion.dataManagement ? "rotate-180" : ""
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
          openAccordion.dataManagement ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 border-t border-slate-200">
          <Suspense fallback={<LoadingSpinner />}>
            <DataManagement 
              onDataImported={() => fetchSubmissions(false)} 
              cabangList={cabangList}
              userRole={user?.role}
            />
          </Suspense>
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
          <Suspense fallback={<LoadingSpinner />}>
            <AccountSetting cabangList={cabangList} />
          </Suspense>
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
        <Suspense fallback={null}>
          <FormDetailDialog
            key={`${selectedSubmission.id}-${detailRefreshKey}`}
            submission={selectedSubmission}
            open={!!selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
            onApprove={() => handleApprove(selectedSubmission.id)}
            onReject={() => handleReject(selectedSubmission.id)}
            onEdit={selectedSubmission.status === 'approved' ? () => handleEdit(selectedSubmission.id) : undefined}
            onEditComplete={handleEditComplete}
            isMarked={markedSubmissions.has(selectedSubmission.id)}
            onToggleMark={selectedSubmission.status === 'pending' ? () => handleToggleMark(selectedSubmission.id) : undefined}
          />
        </Suspense>
      )}

      {approvalDialog.submission && (
        <Suspense fallback={null}>
          <ApprovalDialog
            open={approvalDialog.open}
            onClose={() => setApprovalDialog({ open: false, type: 'approve', submission: null })}
            onConfirm={handleApprovalConfirm}
            type={approvalDialog.type}
            applicantName={approvalDialog.submission.personalData.fullName}
            phone={approvalDialog.submission.personalData.phone}
            referenceCode={approvalDialog.submission.referenceCode}
          />
        </Suspense>
      )}

      {editDialog.submission && (
        <Suspense fallback={null}>
          <EditSubmissionDialog
            submission={editDialog.submission}
            open={editDialog.open}
            onClose={() => setEditDialog({ open: false, submission: null })}
            onSuccess={handleEditSuccess}
            onEditComplete={handleEditComplete}
          />
        </Suspense>
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
