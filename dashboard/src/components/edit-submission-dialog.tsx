import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Edit3, 
  Save, 
  XCircle, 
  User, 
  Briefcase, 
  AlertCircle,
  CheckCircle2,
  History,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config/api';
import { type FormSubmission, mapBackendDataToFormSubmission } from '../DashboardPage';
import { parseAddress, combineAddress, type AddressComponents } from '../utils/addressParser';
import IndonesianAddressDropdown from './IndonesianAddressDropdown';

// Helper to format number string to IDR currency format
const formatRupiah = (angka: string | number) => {
  if (!angka) return '';
  const numberString = angka.toString().replace(/[^,\d]/g, '');
  const split = numberString.split(',');
  const sisa = split[0].length % 3;
  let rupiah = split[0].substring(0, sisa);
  const ribuan = split[0].substring(sisa).match(/\d{3}/gi);

  if (ribuan) {
    const separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }

  rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
  return 'Rp. ' + rupiah;
};



interface EditSubmissionDialogProps {
  submission: FormSubmission;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onEditComplete?: () => void; // Optional callback for when edit is completed
}

interface SubmissionInfo {
  id: number;
  status: string;
  edit_count: number;
  last_edited_at: string | null;
  last_edited_by: string | null;
}

// Dropdown options based on FormSimpel.tsx and FormMutiara.tsx
const DROPDOWN_OPTIONS = {
  tipe_nasabah: [
    { value: 'baru', label: 'Nasabah Baru' },
    { value: 'lama', label: 'Nasabah Lama' }
  ],
  jenis_id: [
    { value: 'KTP', label: 'KTP / NIK' },
    { value: 'KIA', label: 'KIA' },
    { value: 'Paspor', label: 'Paspor' },
    { value: 'Lainnya', label: 'Lainnya' }
  ],
  jenis_kelamin: [
    { value: 'Laki-laki', label: 'Laki-laki' },
    { value: 'Perempuan', label: 'Perempuan' }
  ],
  status_kawin: [
    { value: 'Belum Kawin', label: 'Belum Kawin' },
    { value: 'Kawin', label: 'Kawin' },
    { value: 'Cerai Hidup', label: 'Cerai Hidup' },
    { value: 'Cerai Mati', label: 'Cerai Mati' }
  ],
  agama: [
    { value: 'Islam', label: 'Islam' },
    { value: 'Kristen', label: 'Kristen' },
    { value: 'Katolik', label: 'Katolik' },
    { value: 'Hindu', label: 'Hindu' },
    { value: 'Budha', label: 'Budha' },
    { value: 'Konghucu', label: 'Konghucu' },
    { value: 'Lainnya', label: 'Lainnya' }
  ],
  pendidikan: [
    { value: 'PAUD/TK', label: 'PAUD/TK' },
    { value: 'SD', label: 'SD' },
    { value: 'SMP', label: 'SMP' },
    { value: 'SMA', label: 'SMA' },
    { value: 'Diploma', label: 'Diploma (D3)' },
    { value: 'S-1', label: 'S-1' },
    { value: 'S-2/S-3', label: 'S-2/S-3' },
    { value: 'Lainnya', label: 'Lainnya' }
  ],
  kewarganegaraan: [
    { value: 'Indonesia', label: '🇮🇩 WNI (Warga Negara Indonesia)' },
    { value: 'WNA', label: 'WNA (Warga Negara Asing)' }
  ],
  status_rumah: [
    { value: 'Milik Sendiri', label: 'Milik Sendiri' },
    { value: 'Milik Orang Tua', label: 'Milik Orang Tua' },
    { value: 'Sewa/Kontrak', label: 'Sewa/Kontrak' },
    { value: 'Dinas', label: 'Rumah Dinas' }
  ],
  pekerjaan: [
    { value: 'Pelajar/Mahasiswa', label: 'Pelajar / Mahasiswa' },
    { value: 'karyawan-swasta', label: 'Karyawan Swasta' },
    { value: 'pns', label: 'PNS / TNI / Polri' },
    { value: 'wiraswasta', label: 'Wiraswasta' },
    { value: 'ibu-rumah-tangga', label: 'Ibu Rumah Tangga' },
    { value: 'Lainnya', label: 'Lainnya' }
  ],
  gaji_per_bulan: [
    { value: 's.d 1 Juta', label: 's.d 1 Juta' },
    { value: '> 1 - 5 Juta', label: '> 1 - 5 Juta' },
    { value: '> 10 - 25 Juta', label: '> 10 - 25 Juta' },
    { value: '> 5 - 10 Juta', label: '> 5 - 10 Juta' },
    { value: '> 100 Juta', label: '> 100 Juta' }
  ],
  sumber_dana: [
    { value: 'Gaji', label: 'Gaji' },
    { value: 'Hasil Usaha', label: 'Hasil Usaha' },
    { value: 'Orang Tua', label: 'Orang Tua' },
    { value: 'Beasiswa', label: 'Beasiswa' },
    { value: 'Warisan', label: 'Warisan' },
    { value: 'Tabungan', label: 'Tabungan Pribadi' },
    { value: 'Lainnya', label: 'Lainnya' }
  ],
  tabungan_tipe: [
    { value: 'SimPel', label: 'SimPel' },
    { value: 'Mutiara', label: 'Mutiara' },
    { value: 'Reguler', label: 'Reguler' },
    { value: 'TabunganKu', label: 'TabunganKu' },
    { value: 'Arofah', label: 'Arofah' },
    { value: 'Pensiun', label: 'Pensiun' },
    { value: 'TamasyaPlus', label: 'TamasyaPlus' }
  ],
  jenis_tabungan: [
    { value: 'Silver', label: 'Silver' },
    { value: 'Gold', label: 'Gold' }
  ],
  atm_tipe: [
    { value: 'Gold', label: 'Gold' },
    { value: 'Silver', label: 'Silver' },
    { value: 'Platinum', label: 'Platinum' }
  ],
  tujuan_pembukaan: [
    { value: 'Menabung', label: 'Menabung' },
    { value: 'Transaksi', label: 'Transaksi' },
    { value: 'Investasi', label: 'Investasi' },
    { value: 'Pendidikan', label: 'Pendidikan' },
    { value: 'Lainnya', label: 'Lainnya' }
  ],
  kontak_darurat_hubungan: [
    { value: 'Orang Tua', label: 'Orang Tua' },
    { value: 'Suami/Istri', label: 'Suami/Istri' },
    { value: 'Anak', label: 'Anak' },
    { value: 'Saudara Kandung', label: 'Saudara Kandung' },
    { value: 'Kerabat Lain', label: 'Kerabat Lain' },
    { value: 'Lainnya', label: 'Lainnya' }
  ],
  // BO Fields
  bo_jenis_kelamin: [
    { value: 'Laki-laki', label: 'Laki-laki' },
    { value: 'Perempuan', label: 'Perempuan' }
  ],
  bo_kewarganegaraan: [
    { value: 'WNI', label: 'WNI (Warga Negara Indonesia)' },
    { value: 'WNA', label: 'WNA (Warga Negara Asing)' }
  ],
  bo_status_pernikahan: [
    { value: 'Belum Menikah', label: 'Belum Menikah' },
    { value: 'Menikah', label: 'Menikah' },
    { value: 'Cerai Hidup', label: 'Cerai Hidup' },
    { value: 'Cerai Mati', label: 'Cerai Mati' }
  ],
  bo_jenis_id: [
    { value: 'KTP', label: 'KTP / KIA' },
    { value: 'Paspor', label: 'Paspor' },
    { value: 'Lainnya', label: 'Lainnya' }
  ],
  bo_sumber_dana: [
    { value: 'Gaji', label: 'Gaji' },
    { value: 'Hasil Usaha', label: 'Hasil Usaha' },
    { value: 'Investasi', label: 'Investasi' },
    { value: 'Warisan', label: 'Warisan' },
    { value: 'Hibah', label: 'Hibah' },
    { value: 'Lainnya', label: 'Lainnya' }
  ],
  bo_hubungan: [
    { value: 'Orang Tua', label: 'Orang Tua' },
    { value: 'Anak', label: 'Anak' },
    { value: 'Suami/Istri', label: 'Suami/Istri' },
    { value: 'Saudara Kandung', label: 'Saudara Kandung' },
    { value: 'Kerabat', label: 'Kerabat' },
    { value: 'Teman', label: 'Teman' },
    { value: 'Lainnya', label: 'Lainnya' }
  ]
};

export function EditSubmissionDialog({ submission, open, onClose, onSuccess, onEditComplete }: EditSubmissionDialogProps) {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [submissionInfo, setSubmissionInfo] = useState<SubmissionInfo | null>(null);

  const [originalFormData, setOriginalFormData] = useState<any>(null);
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());

  // Skeleton for Edit Form
  const EditSkeleton = () => (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 animate-pulse">
      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>

      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-md" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 4, 5].map((field) => (
              <div key={field} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // Helper function to format date for input
  const formatDateForInput = (dateString: string | undefined | null) => {
    if (!dateString || dateString.toLowerCase() === 'seumur hidup') return '';
    
    try {
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // If it's in DD/MM/YYYY format (from mapping function), convert it
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Handle other potential valid date strings
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };
  
  // Form data state
  const [formData, setFormData] = useState({
    // Personal Data
    nama: submission.personalData.fullName || '',
    alias: submission.personalData.alias || '',
    tipe_nasabah: '', // Will be loaded from backend
    nomor_rekening_lama: '', // Will be loaded from backend
    jenis_id: submission.personalData.identityType || '',
    jenis_id_custom: '', // Custom field for jenis_id
    no_id: submission.personalData.nik || '',
    berlaku_id: formatDateForInput(submission.personalData.identityValidUntil),
    tempat_lahir: submission.personalData.birthPlace || '',
    tanggal_lahir: formatDateForInput(submission.personalData.birthDate),
    alamat_id: submission.personalData.address.street || '',
    kode_pos_id: submission.personalData.address.postalCode || '',
    alamat_now: submission.personalData.address.domicile || '',
    jenis_kelamin: submission.personalData.gender || '',
    status_kawin: submission.personalData.maritalStatus || '',
    agama: submission.personalData.religion || '',
    agama_custom: '', // Custom field for agama
    pendidikan: submission.personalData.education || '',
    pendidikan_custom: '', // Custom field for pendidikan
    nama_ibu_kandung: submission.personalData.motherName || '',
    npwp: submission.personalData.npwp || '',
    email: submission.personalData.email || '',
    no_hp: submission.personalData.phone || '',
    kewarganegaraan: submission.personalData.citizenship || '',
    status_rumah: submission.personalData.homeStatus || '',
    
    // Job Info
    pekerjaan: submission.jobInfo.occupation || '',
    pekerjaan_custom: '', // Custom field for pekerjaan
    gaji_per_bulan: submission.jobInfo.salaryRange || '',
    sumber_dana: submission.jobInfo.incomeSource || '',
    sumber_dana_custom: '', // Custom field for sumber_dana
    rata_transaksi_per_bulan: submission.jobInfo.averageTransaction || '',
    nama_perusahaan: submission.jobInfo.workplace || '',
    alamat_perusahaan: submission.jobInfo.officeAddress || '',
    alamat_kantor: '', // Will be loaded from backend
    telepon_kantor: '', // Will be loaded from backend
    no_telepon: submission.jobInfo.officePhone || '',
    jabatan: submission.jobInfo.position || '',
    bidang_usaha: submission.jobInfo.businessField || '',
    
    // EDD Fields (will be loaded from backend)
    edd_bank_lain: [] as any[],
    edd_pekerjaan_lain: [] as any[],
    
    // Account Info
    tabungan_tipe: submission.savingsType || '',
    jenis_tabungan: '', // Will be loaded from backend (Silver/Gold for Mutiara)
    atm_tipe: submission.cardType || '',
    nominal_setoran: submission.accountInfo.initialDeposit || '',
    tujuan_pembukaan: submission.jobInfo.accountPurpose || '',
    tujuan_pembukaan_custom: '', // Custom field for tujuan_pembukaan
    
    // Emergency Contact
    kontak_darurat_nama: submission.emergencyContact?.name || '',
    kontak_darurat_alamat: submission.emergencyContact?.address || '',
    kontak_darurat_hp: submission.emergencyContact?.phone || '',
    kontak_darurat_hubungan: submission.emergencyContact?.relationship || '',
    kontak_darurat_hubungan_custom: '', // Custom field for kontak_darurat_hubungan
    
    // Beneficial Owner (BO) fields
    rekening_untuk_sendiri: true as boolean, // Default to true
    bo_nama: '',
    bo_alamat: '',
    bo_tempat_lahir: '',
    bo_tanggal_lahir: '',
    bo_jenis_kelamin: '',
    bo_kewarganegaraan: '',
    bo_status_pernikahan: '',
    bo_jenis_id: '',
    bo_jenis_id_custom: '', // Custom field for bo_jenis_id
    bo_nomor_id: '',
    bo_sumber_dana: '',
    bo_sumber_dana_custom: '', // Custom field for bo_sumber_dana
    bo_hubungan: '',
    bo_hubungan_custom: '', // Custom field for bo_hubungan
    bo_nomor_hp: '',
    bo_pekerjaan: '',
    bo_pendapatan_tahun: '',
  });

  // Address components state for better editing experience
  const [addressComponents, setAddressComponents] = useState<AddressComponents>(() => {
    return parseAddress(submission.personalData.address.street || '');
  });

  // Update form data when submission changes
  useEffect(() => {
    const newFormData = {
      // Personal Data
      nama: submission.personalData.fullName || '',
      alias: submission.personalData.alias || '',
      tipe_nasabah: '', // Will be loaded from backend
      nomor_rekening_lama: '', // Will be loaded from backend
      jenis_id: submission.personalData.identityType || '',
      jenis_id_custom: '', // Will be populated from backend if needed
      no_id: submission.personalData.nik || '',
      berlaku_id: formatDateForInput(submission.personalData.identityValidUntil),
      tempat_lahir: submission.personalData.birthPlace || '',
      tanggal_lahir: formatDateForInput(submission.personalData.birthDate),
      alamat_id: submission.personalData.address.street || '',
      kode_pos_id: submission.personalData.address.postalCode || '',
      alamat_now: submission.personalData.address.domicile || '',
      jenis_kelamin: submission.personalData.gender || '',
      status_kawin: submission.personalData.maritalStatus || '',
      agama: submission.personalData.religion || '',
      agama_custom: '',
      pendidikan: submission.personalData.education || '',
      pendidikan_custom: '',
      nama_ibu_kandung: submission.personalData.motherName || '',
      npwp: submission.personalData.npwp || '',
      email: submission.personalData.email || '',
      no_hp: submission.personalData.phone || '',
      kewarganegaraan: submission.personalData.citizenship || '',
      status_rumah: submission.personalData.homeStatus || '',
      
      // Job Info
      pekerjaan: submission.jobInfo.occupation || '',
      pekerjaan_custom: '',
      gaji_per_bulan: submission.jobInfo.salaryRange || '',
      sumber_dana: submission.jobInfo.incomeSource || '',
      sumber_dana_custom: '',
      rata_transaksi_per_bulan: submission.jobInfo.averageTransaction || '',
      nama_perusahaan: submission.jobInfo.workplace || '',
      alamat_perusahaan: submission.jobInfo.officeAddress || '',
      alamat_kantor: '', // Will be loaded from backend
      telepon_kantor: '', // Will be loaded from backend
      no_telepon: submission.jobInfo.officePhone || '',
      jabatan: submission.jobInfo.position || '',
      bidang_usaha: submission.jobInfo.businessField || '',
      
      // EDD Fields (will be loaded from backend)
      edd_bank_lain: [] as any[],
      edd_pekerjaan_lain: [] as any[],
      
      // Account Info
      tabungan_tipe: submission.savingsType || '',
      jenis_tabungan: '', // Will be loaded from backend
      atm_tipe: submission.cardType || '',
      nominal_setoran: submission.accountInfo.initialDeposit || '',
      tujuan_pembukaan: submission.jobInfo.accountPurpose || '',
      tujuan_pembukaan_custom: '',
      
      // Emergency Contact
      kontak_darurat_nama: submission.emergencyContact?.name || '',
      kontak_darurat_alamat: submission.emergencyContact?.address || '',
      kontak_darurat_hp: submission.emergencyContact?.phone || '',
      kontak_darurat_hubungan: submission.emergencyContact?.relationship || '',
      kontak_darurat_hubungan_custom: '',
      
      // Beneficial Owner (BO) fields - Add these from submission data if available
      rekening_untuk_sendiri: true as boolean, // Default to true, will be updated from backend if available
      bo_nama: '',
      bo_alamat: '',
      bo_tempat_lahir: '',
      bo_tanggal_lahir: '',
      bo_jenis_kelamin: '',
      bo_kewarganegaraan: '',
      bo_status_pernikahan: '',
      bo_jenis_id: '',
      bo_jenis_id_custom: '',
      bo_nomor_id: '',
      bo_sumber_dana: '',
      bo_sumber_dana_custom: '',
      bo_hubungan: '',
      bo_hubungan_custom: '',
      bo_nomor_hp: '',
      bo_pekerjaan: '',
      bo_pendapatan_tahun: '',
    };
    
    setFormData(newFormData);
    setOriginalFormData(newFormData); // Store original data for comparison
    setChangedFields(new Set()); // Reset changed fields
  }, [submission]);

  // Load full submission data and edit history when dialog opens
  useEffect(() => {
    const initializeData = async () => {
      if (open && submission.id) {
        setFetchingData(true);
        try {
          // Run both in parallel for better performance
          await Promise.all([
            loadFullSubmissionData(),
            loadSubmissionInfo()
          ]);
        } catch (err) {
          console.error('Error initializing dialog data:', err);
        } finally {
          // Minimal delay to ensure smooth transition
          setTimeout(() => setFetchingData(false), 300);
        }
      }
    };

    initializeData();
  }, [open, submission.id]);

  const loadFullSubmissionData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pengajuan/${submission.id}`, {
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error('Failed to fetch full submission data');
      
      const data = await res.json();
      if (data.success) {
        // Update submission data with full details
        const fullSubmission = mapBackendDataToFormSubmission(data.data);
        
        // Update form data with full submission
        const fullFormData = {
          // Personal Data
          nama: fullSubmission.personalData.fullName || '',
          alias: fullSubmission.personalData.alias || '',
          tipe_nasabah: data.data.tipe_nasabah || '',
          nomor_rekening_lama: data.data.nomor_rekening_lama || '',
          jenis_id: fullSubmission.personalData.identityType || '',
          jenis_id_custom: '', // Will be populated if jenis_id is custom
          no_id: fullSubmission.personalData.nik || '',
          berlaku_id: formatDateForInput(data.data.berlaku_id), // Use formatter to ensure it works with date picker
          tempat_lahir: fullSubmission.personalData.birthPlace || '',
          tanggal_lahir: formatDateForInput(fullSubmission.personalData.birthDate),
          alamat_id: fullSubmission.personalData.address.street || '',
          kode_pos_id: fullSubmission.personalData.address.postalCode || '',
          alamat_now: fullSubmission.personalData.address.domicile || '',
          jenis_kelamin: fullSubmission.personalData.gender || '',
          status_kawin: fullSubmission.personalData.maritalStatus || '',
          agama: fullSubmission.personalData.religion || '',
          agama_custom: '',
          pendidikan: fullSubmission.personalData.education || '',
          pendidikan_custom: '',
          nama_ibu_kandung: fullSubmission.personalData.motherName || '',
          npwp: fullSubmission.personalData.npwp || '',
          email: fullSubmission.personalData.email || '',
          no_hp: fullSubmission.personalData.phone || '',
          kewarganegaraan: fullSubmission.personalData.citizenship || '',
          status_rumah: fullSubmission.personalData.homeStatus || '',
          
          // Job Info
          pekerjaan: fullSubmission.jobInfo.occupation || '',
          pekerjaan_custom: '',
          gaji_per_bulan: fullSubmission.jobInfo.salaryRange || '',
          sumber_dana: fullSubmission.jobInfo.incomeSource || '',
          sumber_dana_custom: '',
          rata_transaksi_per_bulan: fullSubmission.jobInfo.averageTransaction || '',
          nama_perusahaan: fullSubmission.jobInfo.workplace || '',
          alamat_perusahaan: fullSubmission.jobInfo.officeAddress || '',
          alamat_kantor: data.data.alamat_kantor || '',
          telepon_kantor: data.data.telepon_perusahaan || data.data.no_telepon || '',
          no_telepon: fullSubmission.jobInfo.officePhone || '',
          jabatan: fullSubmission.jobInfo.position || '',
          bidang_usaha: fullSubmission.jobInfo.businessField || '',
          
          // EDD Fields
          edd_bank_lain: data.data.edd_bank_lain || [],
          edd_pekerjaan_lain: data.data.edd_pekerjaan_lain || [],
          
          // Account Info
          tabungan_tipe: fullSubmission.savingsType || '',
          jenis_tabungan: data.data.jenis_tabungan || '',
          atm_tipe: fullSubmission.cardType || '',
          nominal_setoran: fullSubmission.accountInfo.initialDeposit || '',
          tujuan_pembukaan: fullSubmission.jobInfo.accountPurpose || '',
          tujuan_pembukaan_custom: '',
          
          // Emergency Contact
          kontak_darurat_nama: fullSubmission.emergencyContact?.name || '',
          kontak_darurat_alamat: fullSubmission.emergencyContact?.address || '',
          kontak_darurat_hp: fullSubmission.emergencyContact?.phone || '',
          kontak_darurat_hubungan: fullSubmission.emergencyContact?.relationship || '',
          kontak_darurat_hubungan_custom: '',
          
          // Beneficial Owner (BO) fields - Use mapped data from fullSubmission
          rekening_untuk_sendiri: fullSubmission.accountInfo.isForSelf !== undefined ? Boolean(fullSubmission.accountInfo.isForSelf) : true,
          bo_nama: fullSubmission.beneficialOwner?.name || '',
          bo_alamat: fullSubmission.beneficialOwner?.address || '',
          bo_tempat_lahir: fullSubmission.beneficialOwner?.birthPlace || '',
          bo_tanggal_lahir: fullSubmission.beneficialOwner?.birthDate ? formatDateForInput(fullSubmission.beneficialOwner.birthDate) : '',
          bo_jenis_kelamin: fullSubmission.beneficialOwner?.gender || '',
          bo_kewarganegaraan: fullSubmission.beneficialOwner?.citizenship || '',
          bo_status_pernikahan: fullSubmission.beneficialOwner?.maritalStatus || '',
          bo_jenis_id: fullSubmission.beneficialOwner?.identityType || '',
          bo_jenis_id_custom: '',
          bo_nomor_id: fullSubmission.beneficialOwner?.identityNumber || '',
          bo_sumber_dana: fullSubmission.beneficialOwner?.incomeSource || '',
          bo_sumber_dana_custom: '',
          bo_hubungan: fullSubmission.beneficialOwner?.relationship || '',
          bo_hubungan_custom: '',
          bo_nomor_hp: fullSubmission.beneficialOwner?.phone || '',
          bo_pekerjaan: fullSubmission.beneficialOwner?.occupation || '',
          bo_pendapatan_tahun: fullSubmission.beneficialOwner?.annualIncome || '',
        };

        // Handle custom fields - check if current values are not in dropdown options
        // If a value is not in the predefined options, it's likely a custom value
        const checkAndSetCustomField = (fieldName: string, value: string, customFieldName: string) => {
          const options = DROPDOWN_OPTIONS[fieldName as keyof typeof DROPDOWN_OPTIONS];
          if (options && value) {
            const isInOptions = options.some(option => option.value === value);
            if (!isInOptions) {
              // Value is not in dropdown options, so it's a custom value
              // Set the dropdown to "Lainnya" and put the actual value in custom field
              (fullFormData as any)[fieldName] = 'Lainnya';
              (fullFormData as any)[customFieldName] = value;
            }
          }
        };

        // Check for custom values in various fields
        checkAndSetCustomField('jenis_id', fullFormData.jenis_id, 'jenis_id_custom');
        checkAndSetCustomField('agama', fullFormData.agama, 'agama_custom');
        checkAndSetCustomField('pendidikan', fullFormData.pendidikan, 'pendidikan_custom');
        checkAndSetCustomField('pekerjaan', fullFormData.pekerjaan, 'pekerjaan_custom');
        checkAndSetCustomField('sumber_dana', fullFormData.sumber_dana, 'sumber_dana_custom');
        checkAndSetCustomField('tujuan_pembukaan', fullFormData.tujuan_pembukaan, 'tujuan_pembukaan_custom');
        checkAndSetCustomField('kontak_darurat_hubungan', fullFormData.kontak_darurat_hubungan, 'kontak_darurat_hubungan_custom');
        checkAndSetCustomField('bo_jenis_id', fullFormData.bo_jenis_id, 'bo_jenis_id_custom');
        checkAndSetCustomField('bo_sumber_dana', fullFormData.bo_sumber_dana, 'bo_sumber_dana_custom');
        checkAndSetCustomField('bo_hubungan', fullFormData.bo_hubungan, 'bo_hubungan_custom');
        
        setFormData(fullFormData);
        setOriginalFormData(fullFormData); // Update original data reference
        
      }
    } catch (err) {
      console.error('Error loading full submission data:', err);
      toast.error('Gagal memuat data lengkap submission');
    }
  };

  const loadSubmissionInfo = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pengajuan/${submission.id}/history`, {
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error('Failed to fetch submission info');
      
      const data = await res.json();
      if (data.success) {
        setSubmissionInfo(data.data.submission);
      }
    } catch (err) {
      console.error('Error loading submission info:', err);
      toast.error('Gagal memuat informasi submission');
    }
  };

  const handleInputChange = (field: string, value: string | boolean | any[]) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Special handling: Clear custom field when main field is not "Lainnya"
      if (field.endsWith('_custom')) {
        // This is a custom field, no special handling needed
      } else {
        // This is a main field, check if we need to clear custom field
        const customFieldName = `${field}_custom`;
        if (value !== 'Lainnya' && customFieldName in newData) {
          (newData as any)[customFieldName] = '';
        }
        
        // Special handling: If changing back to "Lainnya" and we have original custom value, restore it
        if (value === 'Lainnya' && customFieldName in newData && originalFormData) {
          const originalCustomValue = (originalFormData as any)[customFieldName];
          if (originalCustomValue && !(newData as any)[customFieldName]) {
            (newData as any)[customFieldName] = originalCustomValue;
          }
        }
      }
      
      // Special handling: Clear nomor_rekening_lama when tipe_nasabah changes to 'baru'
      if (field === 'tipe_nasabah' && value === 'baru') {
        newData.nomor_rekening_lama = '';
      }
      
      // Special handling: Clear berlaku_id when jenis_id changes to 'KTP'
      if (field === 'jenis_id' && value === 'KTP') {
        newData.berlaku_id = '';
      }
      
      // Special handling: Clear jenis_tabungan when tabungan_tipe is not 'Mutiara'
      if (field === 'tabungan_tipe' && value !== 'Mutiara') {
        newData.jenis_tabungan = '';
      }
      
      // Special handling: Clear BO fields when rekening_untuk_sendiri is changed to true
      if (field === 'rekening_untuk_sendiri' && value === true) {
        
        // Clear all BO fields including custom fields
        newData.bo_nama = '';
        newData.bo_alamat = '';
        newData.bo_tempat_lahir = '';
        newData.bo_tanggal_lahir = '';
        newData.bo_jenis_kelamin = '';
        newData.bo_kewarganegaraan = '';
        newData.bo_status_pernikahan = '';
        newData.bo_jenis_id = '';
        newData.bo_jenis_id_custom = '';
        newData.bo_nomor_id = '';
        newData.bo_sumber_dana = '';
        newData.bo_sumber_dana_custom = '';
        newData.bo_hubungan = '';
        newData.bo_hubungan_custom = '';
        newData.bo_nomor_hp = '';
        newData.bo_pekerjaan = '';
        newData.bo_pendapatan_tahun = '';
      }
      
      return newData;
    });

    // Track changed fields separately to avoid state update conflicts
    if (originalFormData) {
      setChangedFields(prevChangedFields => {
        const newChangedFields = new Set(prevChangedFields);
        
        // Check if field has actually changed from original
        if ((originalFormData as any)[field] !== value) {
          // Skip empty optional fields unless they had content before
          if ((value === '' || value === null || value === undefined) && 
              ((originalFormData as any)[field] === '' || (originalFormData as any)[field] === null || (originalFormData as any)[field] === undefined)) {
            newChangedFields.delete(field);
          } else {
            newChangedFields.add(field);
          }
        } else {
          newChangedFields.delete(field);
        }
        
        // Special handling for EDD arrays - check if they've changed
        if (field === 'edd_bank_lain' || field === 'edd_pekerjaan_lain') {
          const originalValue = (originalFormData as any)[field];
          const currentValue = value;
          
          // Simple comparison for arrays
          if (JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
            newChangedFields.add(field);
          } else {
            newChangedFields.delete(field);
          }
        }
        
        // Mark cleared fields as changed too
        if (field === 'tipe_nasabah' && value === 'baru' && originalFormData.nomor_rekening_lama) {
          newChangedFields.add('nomor_rekening_lama');
        }
        
        if (field === 'jenis_id' && value === 'KTP' && originalFormData.berlaku_id) {
          newChangedFields.add('berlaku_id');
        }
        
        if (field === 'tabungan_tipe' && value !== 'Mutiara' && originalFormData.jenis_tabungan) {
          newChangedFields.add('jenis_tabungan');
        }
        
        // If we're clearing BO fields, mark them as changed too
        if (field === 'rekening_untuk_sendiri' && value === true) {
          const boFields = ['bo_nama', 'bo_alamat', 'bo_tempat_lahir', 'bo_tanggal_lahir', 
                           'bo_jenis_kelamin', 'bo_kewarganegaraan', 'bo_status_pernikahan', 
                           'bo_jenis_id', 'bo_jenis_id_custom', 'bo_nomor_id', 'bo_sumber_dana', 'bo_sumber_dana_custom', 
                           'bo_hubungan', 'bo_hubungan_custom', 'bo_nomor_hp', 'bo_pekerjaan', 'bo_pendapatan_tahun'];
          
          boFields.forEach(boField => {
            if ((originalFormData as any)[boField] && (originalFormData as any)[boField] !== '') {
              newChangedFields.add(boField);
            }
          });
        }
        
        return newChangedFields;
      });
    }
  };

  // Helper function to handle EDD changes with proper tracking
  const handleEddChange = (fieldName: 'edd_bank_lain' | 'edd_pekerjaan_lain', newArray: any[]) => {
    setFormData(prev => ({ ...prev, [fieldName]: newArray }));
    
    // Track changes for EDD fields
    if (originalFormData) {
      const originalValue = (originalFormData as any)[fieldName];
      const newChangedFields = new Set(changedFields);
      
      if (JSON.stringify(originalValue) !== JSON.stringify(newArray)) {
        newChangedFields.add(fieldName);
      } else {
        newChangedFields.delete(fieldName);
      }
      
      setChangedFields(newChangedFields);
    }
  };

  const handleSave = async () => {
    // if (!editReason.trim()) {
    //   toast.error('Alasan edit harus diisi');
    //   return;
    // }

    // Prevent double submission
    if (loading) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data to send
      const dataToSend = {
        ...formData,
        // Add separated address components
        alamat_jalan: addressComponents.alamatJalan,
        provinsi: addressComponents.provinsi,
        kota: addressComponents.kota,
        kecamatan: addressComponents.kecamatan,
        kelurahan: addressComponents.kelurahan,
        editReason,
        isEdit: true
      };

      // Remove all custom fields from dataToSend - they shouldn't be sent to backend
      const customFieldsToRemove = [
        'jenis_id_custom', 'agama_custom', 'pendidikan_custom', 'pekerjaan_custom',
        'sumber_dana_custom', 'tujuan_pembukaan_custom', 'kontak_darurat_hubungan_custom',
        'bo_jenis_id_custom', 'bo_sumber_dana_custom', 'bo_hubungan_custom'
      ];
      
      customFieldsToRemove.forEach(field => {
        delete (dataToSend as any)[field];
      });

      // Handle custom fields - send custom values directly to main fields when "Lainnya" is selected
      const customFieldMappings = [
        { main: 'jenis_id', custom: 'jenis_id_custom' },
        { main: 'agama', custom: 'agama_custom' },
        { main: 'pendidikan', custom: 'pendidikan_custom' },
        { main: 'pekerjaan', custom: 'pekerjaan_custom' },
        { main: 'sumber_dana', custom: 'sumber_dana_custom' },
        { main: 'tujuan_pembukaan', custom: 'tujuan_pembukaan_custom' },
        { main: 'kontak_darurat_hubungan', custom: 'kontak_darurat_hubungan_custom' },
        { main: 'bo_jenis_id', custom: 'bo_jenis_id_custom' },
        { main: 'bo_sumber_dana', custom: 'bo_sumber_dana_custom' },
        { main: 'bo_hubungan', custom: 'bo_hubungan_custom' },
      ];

      customFieldMappings.forEach(({ main, custom }) => {
        if ((formData as any)[main] === 'Lainnya' && (formData as any)[custom]) {
          // Send the custom value directly to the main field
          (dataToSend as any)[main] = (formData as any)[custom];
        }
      });

      // Special handling for Mutiara: map jenis_tabungan to atm_tipe
      if (formData.tabungan_tipe === 'Mutiara' && formData.jenis_tabungan) {
        dataToSend.atm_tipe = formData.jenis_tabungan; // Silver or Gold
      }

      // Map telepon_kantor to no_telepon for backend compatibility
      if (formData.telepon_kantor) {
        dataToSend.no_telepon = formData.telepon_kantor;
        // Remove the original field to avoid confusion
        (dataToSend as any).telepon_kantor = undefined;
      }
      
      // Map alamat_kantor to alamat_perusahaan for backend compatibility  
      if (formData.alamat_kantor) {
        dataToSend.alamat_perusahaan = formData.alamat_kantor;
        // Remove the original field to avoid confusion
        (dataToSend as any).alamat_kantor = undefined;
      }

      // If rekening_untuk_sendiri is true, explicitly send empty BO fields to ensure they're cleared
      if (formData.rekening_untuk_sendiri === true) {
        dataToSend.bo_nama = '';
        dataToSend.bo_alamat = '';
        dataToSend.bo_tempat_lahir = '';
        dataToSend.bo_tanggal_lahir = '';
        dataToSend.bo_jenis_kelamin = '';
        dataToSend.bo_kewarganegaraan = '';
        dataToSend.bo_status_pernikahan = '';
        dataToSend.bo_jenis_id = '';
        dataToSend.bo_nomor_id = '';
        dataToSend.bo_sumber_dana = '';
        dataToSend.bo_hubungan = '';
        dataToSend.bo_nomor_hp = '';
        dataToSend.bo_pekerjaan = '';
        dataToSend.bo_pendapatan_tahun = '';
      }

      const res = await fetch(`${API_BASE_URL}/api/pengajuan/${submission.id}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToSend)
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to edit submission');
      }

      if (data.success) {
        toast.success(
  <span>
    Berhasil menyimpan perubahan pada <strong className="font-bold text-indigo-400">{submission.referenceCode}</strong>
  </span>
);
        setEditMode(false);
        setEditReason('');
        
        // Reload form data to reflect changes immediately
        await loadFullSubmissionData();
        
        // Reload submission info
        await loadSubmissionInfo();
        
        // Refresh parent data
        onSuccess();
        
        // Notify that edit is completed (for detail dialog refresh)
        if (onEditComplete) {
          onEditComplete();
        }
      }
    } catch (err: any) {
      console.error('Error editing submission:', err);
      toast.error(err.message || 'Gagal mengedit submission');
    } finally {
      setLoading(false);
    }
  };


  const handleUndoField = (fieldName: string) => {
    if (!originalFormData) return;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [fieldName]: originalFormData[fieldName]
      };
      
      // If undoing a main field that has custom field, also restore custom field
      const customFieldName = `${fieldName}_custom`;
      if (customFieldName in originalFormData) {
        (newData as any)[customFieldName] = (originalFormData as any)[customFieldName];
      }
      
      // Special handling for alamat_id - restore address components
      if (fieldName === 'alamat_id') {
        const originalAddress = originalFormData.alamat_id;
        if (originalAddress) {
          const parsedComponents = parseAddress(originalAddress);
          setAddressComponents(parsedComponents);
        }
      }
      
      // Special handling for undoing 'rekening_untuk_sendiri'
      if (fieldName === 'rekening_untuk_sendiri' && originalFormData.rekening_untuk_sendiri === false) {
         const boFields = ['bo_nama', 'bo_alamat', 'bo_tempat_lahir', 'bo_tanggal_lahir', 
                           'bo_jenis_kelamin', 'bo_kewarganegaraan', 'bo_status_pernikahan', 
                           'bo_jenis_id', 'bo_jenis_id_custom', 'bo_nomor_id', 'bo_sumber_dana', 'bo_sumber_dana_custom',
                           'bo_hubungan', 'bo_hubungan_custom', 'bo_nomor_hp', 'bo_pekerjaan', 'bo_pendapatan_tahun'];
         
         boFields.forEach(field => {
           (newData as any)[field] = (originalFormData as any)[field];
         });
      }

      return newData;
    });

    setChangedFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(fieldName);
      
      // Also clear custom field from changed set if we reverted the main field
      const customFieldName = `${fieldName}_custom`;
      if (customFieldName in originalFormData) {
        newSet.delete(customFieldName);
      }
      
      // Also clear BO fields from changed set if we reverted the toggle
      if (fieldName === 'rekening_untuk_sendiri' && (originalFormData as any)[fieldName] === false) {
          const boFields = ['bo_nama', 'bo_alamat', 'bo_tempat_lahir', 'bo_tanggal_lahir', 
                           'bo_jenis_kelamin', 'bo_kewarganegaraan', 'bo_status_pernikahan', 
                           'bo_jenis_id', 'bo_jenis_id_custom', 'bo_nomor_id', 'bo_sumber_dana', 'bo_sumber_dana_custom',
                           'bo_hubungan', 'bo_hubungan_custom', 'bo_nomor_hp', 'bo_pekerjaan', 'bo_pendapatan_tahun'];
          boFields.forEach(f => newSet.delete(f));
      }
      
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFieldLabel = (fieldName: string) => {
    const labels: Record<string, string> = {
      nama: 'Nama Lengkap',
      alias: 'Alias',
      tipe_nasabah: 'Tipe Nasabah',
      nomor_rekening_lama: 'Nomor Rekening Lama',
      jenis_id: 'Jenis ID',
      no_id: 'Nomor ID',
      berlaku_id: 'Berlaku Hingga',
      tempat_lahir: 'Tempat Lahir',
      tanggal_lahir: 'Tanggal Lahir',
      alamat_id: 'Alamat KTP',
      kode_pos_id: 'Kode Pos',
      alamat_now: 'Alamat Domisili',
      jenis_kelamin: 'Jenis Kelamin',
      status_kawin: 'Status Pernikahan',
      agama: 'Agama',
      pendidikan: 'Pendidikan',
      nama_ibu_kandung: 'Nama Ibu Kandung',
      npwp: 'NPWP',
      email: 'Email',
      no_hp: 'No HP',
      kewarganegaraan: 'Kewarganegaraan',
      status_rumah: 'Status Rumah',
      pekerjaan: 'Pekerjaan',
      gaji_per_bulan: 'Gaji per Bulan',
      sumber_dana: 'Sumber Dana',
      rata_transaksi_per_bulan: 'Rata-rata Transaksi',
      nama_perusahaan: 'Nama Perusahaan',
      alamat_perusahaan: 'Alamat Perusahaan',
      alamat_kantor: 'Alamat Kantor',
      telepon_kantor: 'Telepon Kantor',
      no_telepon: 'No Telepon Kantor',
      jabatan: 'Jabatan',
      bidang_usaha: 'Bidang Usaha',
      tabungan_tipe: 'Jenis Rekening',
      jenis_tabungan: 'Jenis Tabungan',
      atm_tipe: 'Jenis Kartu ATM',
      nominal_setoran: 'Nominal Setoran',
      tujuan_pembukaan: 'Tujuan Pembukaan',
      kontak_darurat_nama: 'Nama Kontak Darurat',
      kontak_darurat_alamat: 'Alamat Kontak Darurat',
      kontak_darurat_hp: 'HP Kontak Darurat',
      kontak_darurat_hubungan: 'Hubungan Kontak Darurat',
      // BO Fields
      rekening_untuk_sendiri: 'Rekening untuk Sendiri',
      bo_nama: 'Nama Lengkap BO',
      bo_alamat: 'Alamat BO',
      bo_tempat_lahir: 'Tempat Lahir BO',
      bo_tanggal_lahir: 'Tanggal Lahir BO',
      bo_jenis_kelamin: 'Jenis Kelamin BO',
      bo_kewarganegaraan: 'Kewarganegaraan BO',
      bo_status_pernikahan: 'Status Pernikahan BO',
      bo_jenis_id: 'Jenis Identitas BO',
      bo_nomor_id: 'Nomor Identitas BO',
      bo_sumber_dana: 'Sumber Dana BO',
      bo_hubungan: 'Hubungan dengan Nasabah',
      bo_nomor_hp: 'Nomor HP BO',
      bo_pekerjaan: 'Pekerjaan BO',
      bo_pendapatan_tahun: 'Pendapatan Tahunan BO',
    };
    return labels[fieldName] || fieldName;
  };

  // Helper function to render appropriate input component
  const renderInputField = (fieldName: string, value: string, onChange: (value: string | boolean | any[]) => void) => {
    const options = DROPDOWN_OPTIONS[fieldName as keyof typeof DROPDOWN_OPTIONS];
    const isChanged = changedFields.has(fieldName);
    const customFieldName = `${fieldName}_custom`;
    const isCustomFieldChanged = changedFields.has(customFieldName);
    const baseClassName = isChanged ? 'border-2 border-orange-400 bg-orange-50' : '';
    
    let inputElement;

    if (options) {
      inputElement = (
        <div className="space-y-2">
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={baseClassName}>
              <SelectValue placeholder={`Pilih ${getFieldLabel(fieldName)}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Custom input field when "Lainnya" is selected */}
          {value === 'Lainnya' && (
            <div className="flex items-start gap-2 group">
              <div className="flex-1">
                <Input
                  value={formData[`${fieldName}_custom` as keyof typeof formData] as string || ''}
                  onChange={(e) => handleInputChange(`${fieldName}_custom`, e.target.value)}
                  placeholder={`Sebutkan ${getFieldLabel(fieldName).toLowerCase()} lainnya`}
                  className={isCustomFieldChanged ? 'border-2 border-orange-400 bg-orange-50' : ''}
                />
              </div>
              {isCustomFieldChanged && (
                <div className="mt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUndoField(`${fieldName}_custom`)}
                    className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-full"
                    title={`Kembalikan ${getFieldLabel(fieldName)} Custom ke nilai awal`}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    } else if (fieldName === 'tanggal_lahir' || fieldName === 'bo_tanggal_lahir' || fieldName === 'berlaku_id') {
      inputElement = (
        <Input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClassName}
        />
      );
    } else if (fieldName === 'email') {
      inputElement = (
        <Input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClassName}
        />
      );
    } else if (fieldName === 'nominal_setoran' || fieldName === 'rata_transaksi_per_bulan') {
      inputElement = (
        <Input
          type="text"
          value={formatRupiah(value)}
          onChange={(e) => {
            const cleanValue = e.target.value.replace(/\D/g, '');
            // Limit to maximum safe value for NUMERIC(18,2) - 16 digits before decimal
            const maxValue = 9999999999999999;
            const numericValue = parseInt(cleanValue) || 0;
            if (numericValue <= maxValue) {
              onChange(cleanValue);
            }
          }}
          className={baseClassName}
          placeholder="Rp. 0"
          title="Maksimal Rp. 9.999.999.999.999.999"
        />
      );
    } else if (fieldName === 'alamat_id' || fieldName === 'alamat_now' || fieldName === 'alamat_perusahaan' || fieldName === 'alamat_kantor' || fieldName === 'bo_alamat' || fieldName === 'kontak_darurat_alamat') {
      inputElement = (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClassName}
          rows={2}
        />
      );
    } else {
      inputElement = (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClassName}
        />
      );
    }

    // Wrap with undo button if changed (but not for dropdown fields with custom inputs)
    if (options) {
      // For dropdown fields, we handle undo buttons separately for main and custom fields
      return (
        <div className="flex items-start gap-2 group">
          <div className="flex-1">
            {inputElement}
          </div>
          {isChanged && (
            <div className="mt-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleUndoField(fieldName)}
                className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-full"
                title={`Kembalikan ${getFieldLabel(fieldName)} ke nilai awal`}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      );
    } else {
      // For non-dropdown fields, standard undo button
      return (
        <div className="flex items-start gap-2 group">
          <div className="flex-1">
            {inputElement}
          </div>
          {isChanged && (
            <div className="mt-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleUndoField(fieldName)}
                className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-full"
                title={`Kembalikan ${getFieldLabel(fieldName)} ke nilai awal`}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      );
    }
  };

  // Only show edit button for approved submissions
  if (submission.status !== 'approved') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden flex flex-col bg-slate-50">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                {editMode ? 'Edit Submission' : 'Edit Submission'}
              </DialogTitle>
              <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                <span className="font-mono bg-slate-100 px-1.5 rounded text-slate-600 font-medium">
                  {submission.referenceCode}
                </span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span>{submission.personalData.fullName}</span>
                {/* Simplified edit indicator */}
                {submission.edit_count && submission.edit_count > 0 && (
                  <>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <div className="flex items-center gap-1 text-amber-600">
                      <Edit3 className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        Edited {submission.edit_count}x
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
              <XCircle className="w-6 h-6 text-slate-400" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {fetchingData ? (
          <EditSkeleton />
        ) : (
          <div className="flex-1 overflow-y-auto p-8 animate-contentEnter">
            <div className="space-y-8">
              
              {/* Minimal Edit Info Alert */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
                <div className="mt-0.5">
                   {submissionInfo && submissionInfo.edit_count && submissionInfo.edit_count > 0 ? (
                      <History className="w-5 h-5 text-blue-600" />
                   ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                   )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    {submissionInfo && submissionInfo.edit_count && submissionInfo.edit_count > 0 
                      ? 'Riwayat Pengeditan' 
                      : 'Data Belum Pernah Diedit'}
                  </h4>
                  <p className="text-xs text-blue-700">
                    {submissionInfo && submissionInfo.edit_count && submissionInfo.edit_count > 0 ? (
                      <>
                        Data ini telah diedit <strong>{submissionInfo.edit_count} kali</strong>. 
                        Terakhir diubah pada <strong>{submissionInfo.last_edited_at ? formatDate(submissionInfo.last_edited_at) : '-'}</strong>
                        {submissionInfo.last_edited_by ? <> oleh <strong>{submissionInfo.last_edited_by}</strong></> : ''}.
                      </>
                    ) : (
                      'Data ini masih orisinil sesuai pengajuan awal nasabah.'
                    )}
                  </p>
                </div>
              </div>

              {/* Edit Reason */}
              {/* <div className={`border rounded-lg p-4 ${changedFields.size > 0 ? 'bg-orange-50 border-orange-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="editReason" className={`text-sm font-semibold mb-0 block ${changedFields.size > 0 ? 'text-orange-800' : 'text-yellow-800'}`}>
                    Alasan Edit *
                  </Label>
                  {changedFields.size > 0 && (
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                      {changedFields.size} field berubah
                    </Badge>
                  )}
                </div>
                <Textarea
                  id="editReason"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="Jelaskan alasan mengapa data perlu diedit..."
                  className={`bg-white focus:border-yellow-500 ${changedFields.size > 0 ? 'border-orange-300' : 'border-yellow-300'}`}
                  rows={3}
                />
                {changedFields.size > 0 && (
                  <p className="text-xs text-orange-700 mt-2">
                    Field yang berubah: {Array.from(changedFields).map(field => getFieldLabel(field)).join(', ')}
                  </p>
                )}
              </div> */}

              {/* Personal Data Section */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Data Pribadi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
                  <div className="space-y-2">
                    <Label htmlFor="nama">Nama Lengkap</Label>
                    {renderInputField('nama', formData.nama, (value) => handleInputChange('nama', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alias">Alias</Label>
                    {renderInputField('alias', formData.alias, (value) => handleInputChange('alias', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipe_nasabah">Tipe Nasabah</Label>
                    {renderInputField('tipe_nasabah', formData.tipe_nasabah, (value) => handleInputChange('tipe_nasabah', value))}
                  </div>
                  {/* Show nomor rekening lama only if tipe nasabah is 'lama' */}
                  {formData.tipe_nasabah === 'lama' && (
                    <div className="space-y-2">
                      <Label htmlFor="nomor_rekening_lama">Nomor Rekening Lama</Label>
                      {renderInputField('nomor_rekening_lama', formData.nomor_rekening_lama, (value) => handleInputChange('nomor_rekening_lama', value))}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="jenis_id">Jenis ID</Label>
                    {renderInputField('jenis_id', formData.jenis_id, (value) => handleInputChange('jenis_id', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="no_id">Nomor ID</Label>
                    {renderInputField('no_id', formData.no_id, (value) => handleInputChange('no_id', value))}
                  </div>
                  {/* Show berlaku_id only for non-KTP documents */}
                  {formData.jenis_id && formData.jenis_id !== 'KTP' && (
                    <div className="space-y-2">
                      <Label htmlFor="berlaku_id">Berlaku Hingga</Label>
                      {renderInputField('berlaku_id', formData.berlaku_id, (value) => handleInputChange('berlaku_id', value))}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                    {renderInputField('tempat_lahir', formData.tempat_lahir, (value) => handleInputChange('tempat_lahir', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                    {renderInputField('tanggal_lahir', formData.tanggal_lahir, (value) => handleInputChange('tanggal_lahir', value))}
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Alamat KTP (Dropdown hanya untuk alamat di Indonesia)
                    </Label>
                    <div className="flex items-start gap-2 group">
                      <div className="flex-1">
                        <IndonesianAddressDropdown
                          addressComponents={addressComponents}
                          onAddressChange={(components) => {
                            setAddressComponents(components);
                            // Update the combined address in formData
                            const combinedAddress = combineAddress(components);
                            handleInputChange('alamat_id', combinedAddress);
                          }}
                          citizenship={formData.kewarganegaraan}
                        />
                        {formData.alamat_id && (
                          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                            <p className="text-xs text-green-700 font-medium">Alamat Lengkap Sekarang:</p>
                            <p className="text-sm text-green-800 mt-1">{formData.alamat_id}</p>
                          </div>
                        )}
                      </div>
                      {changedFields.has('alamat_id') && (
                        <div className="mt-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUndoField('alamat_id')}
                            className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-full"
                            title="Kembalikan Alamat KTP ke nilai awal"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kode_pos_id">Kode Pos</Label>
                    {renderInputField('kode_pos_id', formData.kode_pos_id, (value) => handleInputChange('kode_pos_id', value))}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="alamat_now">Alamat Domisili (Opsional)</Label>
                    {renderInputField('alamat_now', formData.alamat_now, (value) => handleInputChange('alamat_now', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {renderInputField('email', formData.email, (value) => handleInputChange('email', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="no_hp">No HP</Label>
                    {renderInputField('no_hp', formData.no_hp, (value) => handleInputChange('no_hp', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                    {renderInputField('jenis_kelamin', formData.jenis_kelamin, (value) => handleInputChange('jenis_kelamin', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status_kawin">Status Pernikahan</Label>
                    {renderInputField('status_kawin', formData.status_kawin, (value) => handleInputChange('status_kawin', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agama">Agama</Label>
                    {renderInputField('agama', formData.agama, (value) => handleInputChange('agama', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pendidikan">Pendidikan</Label>
                    {renderInputField('pendidikan', formData.pendidikan, (value) => handleInputChange('pendidikan', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nama_ibu_kandung">Nama Ibu Kandung</Label>
                    {renderInputField('nama_ibu_kandung', formData.nama_ibu_kandung, (value) => handleInputChange('nama_ibu_kandung', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="npwp">NPWP</Label>
                    {renderInputField('npwp', formData.npwp, (value) => handleInputChange('npwp', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kewarganegaraan">Kewarganegaraan</Label>
                    {renderInputField('kewarganegaraan', formData.kewarganegaraan, (value) => handleInputChange('kewarganegaraan', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status_rumah">Status Rumah</Label>
                    {renderInputField('status_rumah', formData.status_rumah, (value) => handleInputChange('status_rumah', value))}
                  </div>
                </div>
              </div>

              {/* Job Info Section */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-green-600" />
                  Informasi Pekerjaan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pekerjaan">Pekerjaan</Label>
                    {renderInputField('pekerjaan', formData.pekerjaan, (value) => handleInputChange('pekerjaan', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nama_perusahaan">Nama Perusahaan</Label>
                    {renderInputField('nama_perusahaan', formData.nama_perusahaan, (value) => handleInputChange('nama_perusahaan', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jabatan">Jabatan</Label>
                    {renderInputField('jabatan', formData.jabatan, (value) => handleInputChange('jabatan', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alamat_kantor">Alamat Kantor</Label>
                    {renderInputField('alamat_kantor', formData.alamat_kantor, (value) => handleInputChange('alamat_kantor', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telepon_kantor">Telepon Kantor</Label>
                    {renderInputField('telepon_kantor', formData.telepon_kantor, (value) => handleInputChange('telepon_kantor', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bidang_usaha">Bidang Usaha</Label>
                    {renderInputField('bidang_usaha', formData.bidang_usaha, (value) => handleInputChange('bidang_usaha', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gaji_per_bulan">Gaji per Bulan</Label>
                    {renderInputField('gaji_per_bulan', formData.gaji_per_bulan, (value) => handleInputChange('gaji_per_bulan', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sumber_dana">Sumber Dana</Label>
                    {renderInputField('sumber_dana', formData.sumber_dana, (value) => handleInputChange('sumber_dana', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rata_transaksi_per_bulan">Rata-rata Transaksi</Label>
                    {renderInputField('rata_transaksi_per_bulan', formData.rata_transaksi_per_bulan, (value) => handleInputChange('rata_transaksi_per_bulan', value))}
                  </div>
                </div>
              </div>

              {/* Account Info Section */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Informasi Rekening
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tabungan_tipe">Jenis Rekening</Label>
                    {renderInputField('tabungan_tipe', formData.tabungan_tipe, (value) => handleInputChange('tabungan_tipe', value))}
                  </div>
                  {/* Jenis Tabungan - Only for Mutiara */}
                  {formData.tabungan_tipe === 'Mutiara' && (
                    <div className="space-y-2">
                      <Label htmlFor="jenis_tabungan">Jenis Tabungan (Silver/Gold)</Label>
                      {renderInputField('jenis_tabungan', formData.jenis_tabungan, (value) => handleInputChange('jenis_tabungan', value))}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="nominal_setoran">Nominal Setoran</Label>
                    {renderInputField('nominal_setoran', formData.nominal_setoran, (value) => handleInputChange('nominal_setoran', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tujuan_pembukaan">Tujuan Pembukaan</Label>
                    {renderInputField('tujuan_pembukaan', formData.tujuan_pembukaan, (value) => handleInputChange('tujuan_pembukaan', value))}
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Kontak Darurat
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="kontak_darurat_nama">Nama Lengkap</Label>
                    {renderInputField('kontak_darurat_nama', formData.kontak_darurat_nama, (value) => handleInputChange('kontak_darurat_nama', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kontak_darurat_hp">No HP</Label>
                    {renderInputField('kontak_darurat_hp', formData.kontak_darurat_hp, (value) => handleInputChange('kontak_darurat_hp', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kontak_darurat_hubungan">Hubungan</Label>
                    {renderInputField('kontak_darurat_hubungan', formData.kontak_darurat_hubungan, (value) => handleInputChange('kontak_darurat_hubungan', value))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kontak_darurat_alamat">Alamat Lengkap</Label>
                    {renderInputField('kontak_darurat_alamat', formData.kontak_darurat_alamat, (value) => handleInputChange('kontak_darurat_alamat', value))}
                  </div>
                </div>
              </div>

              {/* Beneficial Owner Section */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  Beneficial Owner
                </h3>
                
                {/* Rekening untuk sendiri */}
                <div className="mb-6">
                  <Label className="text-gray-700 font-semibold mb-4 block">Apakah rekening ini untuk Anda sendiri?</Label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="rekening_untuk_sendiri" 
                        value="true" 
                        checked={formData.rekening_untuk_sendiri === true} 
                        onChange={() => handleInputChange('rekening_untuk_sendiri', true)} 
                        className="hidden" 
                      />
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${formData.rekening_untuk_sendiri === true ? "border-blue-500" : "border-gray-300"} ${changedFields.has('rekening_untuk_sendiri') ? 'border-orange-400 bg-orange-50' : ''}`}>
                        {formData.rekening_untuk_sendiri === true && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                      </span>
                      <span className="text-sm text-gray-700">Ya, untuk saya sendiri</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="rekening_untuk_sendiri" 
                        value="false" 
                        checked={formData.rekening_untuk_sendiri === false} 
                        onChange={() => handleInputChange('rekening_untuk_sendiri', false)} 
                        className="hidden" 
                      />
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${formData.rekening_untuk_sendiri === false ? "border-blue-500" : "border-gray-300"} ${changedFields.has('rekening_untuk_sendiri') ? 'border-orange-400 bg-orange-50' : ''}`}>
                        {formData.rekening_untuk_sendiri === false && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                      </span>
                      <span className="text-sm text-gray-700">Tidak, untuk orang lain</span>
                    </label>
                    {changedFields.has('rekening_untuk_sendiri') && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUndoField('rekening_untuk_sendiri')}
                        className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-full"
                        title="Kembalikan ke nilai awal"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* BO Fields - Only show when account is for others */}
                {formData.rekening_untuk_sendiri === false ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bo_nama">
                          Nama Lengkap BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_nama', formData.bo_nama, (value) => handleInputChange('bo_nama', value))}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bo_tempat_lahir">
                          Tempat Lahir BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_tempat_lahir', formData.bo_tempat_lahir, (value) => handleInputChange('bo_tempat_lahir', value))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bo_tanggal_lahir">
                          Tanggal Lahir BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_tanggal_lahir', formData.bo_tanggal_lahir, (value) => handleInputChange('bo_tanggal_lahir', value))}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bo_jenis_kelamin">
                          Jenis Kelamin BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_jenis_kelamin', formData.bo_jenis_kelamin, (value) => handleInputChange('bo_jenis_kelamin', value))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bo_alamat">
                        Alamat BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                      </Label>
                      {renderInputField('bo_alamat', formData.bo_alamat, (value) => handleInputChange('bo_alamat', value))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bo_kewarganegaraan">
                          Kewarganegaraan BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_kewarganegaraan', formData.bo_kewarganegaraan, (value) => handleInputChange('bo_kewarganegaraan', value))}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bo_status_pernikahan">
                          Status Pernikahan BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_status_pernikahan', formData.bo_status_pernikahan, (value) => handleInputChange('bo_status_pernikahan', value))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bo_jenis_id">
                          Jenis Identitas BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_jenis_id', formData.bo_jenis_id, (value) => handleInputChange('bo_jenis_id', value))}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bo_nomor_id">
                          Nomor Identitas BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_nomor_id', formData.bo_nomor_id, (value) => handleInputChange('bo_nomor_id', value))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bo_pekerjaan">
                          Pekerjaan BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_pekerjaan', formData.bo_pekerjaan, (value) => handleInputChange('bo_pekerjaan', value))}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bo_sumber_dana">
                          Sumber Dana BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_sumber_dana', formData.bo_sumber_dana, (value) => handleInputChange('bo_sumber_dana', value))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bo_hubungan">
                          Hubungan dengan Nasabah {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_hubungan', formData.bo_hubungan, (value) => handleInputChange('bo_hubungan', value))}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bo_nomor_hp">
                          Nomor HP BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_nomor_hp', formData.bo_nomor_hp, (value) => handleInputChange('bo_nomor_hp', value))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bo_pendapatan_tahun">
                        Pendapatan Tahunan BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                      </Label>
                      <div className="flex items-start gap-2 group">
                        <div className="flex-1">
                          <Select
                            value={formData.bo_pendapatan_tahun}
                            onValueChange={(value) => handleInputChange('bo_pendapatan_tahun', value)}
                          >
                            <SelectTrigger className={changedFields.has('bo_pendapatan_tahun') ? 'border-2 border-orange-400 bg-orange-50' : ''}>
                              <SelectValue placeholder="Pilih range pendapatan tahunan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sd-5jt">Sampai dengan 5 Juta</SelectItem>
                              <SelectItem value="5-10jt">5 - 10 Juta</SelectItem>
                              <SelectItem value="10-25jt">10 - 25 Juta</SelectItem>
                              <SelectItem value="25-100jt">25 - 100 Juta</SelectItem>
                              <SelectItem value=">100jt">Lebih dari 100 Juta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {changedFields.has('bo_pendapatan_tahun') && (
                          <div className="mt-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUndoField('bo_pendapatan_tahun')}
                              className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-full"
                              title="Kembalikan Pendapatan Tahunan BO ke nilai awal"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                    <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium mb-2">Rekening untuk Diri Sendiri</p>
                    <p className="text-sm">Data Beneficial Owner tidak diperlukan karena rekening ini untuk Anda sendiri.</p>
                  </div>
                )}
              </div>

              {/* EDD Bank Lain Section */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Enhanced Due Diligence - Bank Lain
                  </h3>
                  {changedFields.has('edd_bank_lain') && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUndoField('edd_bank_lain')}
                      className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-full"
                      title="Kembalikan EDD Bank Lain ke nilai awal"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {formData.edd_bank_lain && formData.edd_bank_lain.length > 0 ? (
                  <div className="space-y-4">
                    {formData.edd_bank_lain.map((bank: any, index: number) => (
                      <div key={index} className={`p-4 border rounded-lg ${changedFields.has('edd_bank_lain') ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-slate-50'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Nama Bank</Label>
                            <Input
                              value={bank.bank_name || ''}
                              onChange={(e) => {
                                const newEddBankLain = [...(formData.edd_bank_lain || [])];
                                newEddBankLain[index] = { ...newEddBankLain[index], bank_name: e.target.value };
                                handleEddChange('edd_bank_lain', newEddBankLain);
                              }}
                              placeholder="Nama bank"
                              className="mt-1"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Jenis Rekening</Label>
                            <Input
                              value={bank.jenis_rekening || ''}
                              onChange={(e) => {
                                const newEddBankLain = [...(formData.edd_bank_lain || [])];
                                newEddBankLain[index] = { ...newEddBankLain[index], jenis_rekening: e.target.value };
                                handleEddChange('edd_bank_lain', newEddBankLain);
                              }}
                              placeholder="Tabungan / Giro"
                              className="mt-1"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Nomor Rekening</Label>
                            <Input
                              value={bank.nomor_rekening || ''}
                              onChange={(e) => {
                                const newEddBankLain = [...(formData.edd_bank_lain || [])];
                                newEddBankLain[index] = { ...newEddBankLain[index], nomor_rekening: e.target.value };
                                handleEddChange('edd_bank_lain', newEddBankLain);
                              }}
                              placeholder="Nomor rekening"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-lg font-medium mb-2">Tidak Ada Data Bank Lain</p>
                    <p className="text-sm">Nasabah tidak memiliki rekening di bank lain.</p>
                  </div>
                )}
              </div>

              {/* EDD Pekerjaan Lain Section */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                    Enhanced Due Diligence - Pekerjaan/Usaha Lain
                  </h3>
                  {changedFields.has('edd_pekerjaan_lain') && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUndoField('edd_pekerjaan_lain')}
                      className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-full"
                      title="Kembalikan EDD Pekerjaan/Usaha Lain ke nilai awal"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {formData.edd_pekerjaan_lain && formData.edd_pekerjaan_lain.length > 0 ? (
                  <div className="space-y-4">
                    {formData.edd_pekerjaan_lain.map((pekerjaan: any, index: number) => (
                      <div key={index} className={`p-4 border rounded-lg ${changedFields.has('edd_pekerjaan_lain') ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-slate-50'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Jenis Usaha</Label>
                            <Input
                              value={pekerjaan.jenis_usaha || ''}
                              onChange={(e) => {
                                const newEddPekerjaanLain = [...(formData.edd_pekerjaan_lain || [])];
                                newEddPekerjaanLain[index] = { ...newEddPekerjaanLain[index], jenis_usaha: e.target.value };
                                handleEddChange('edd_pekerjaan_lain', newEddPekerjaanLain);
                              }}
                              placeholder="Jenis usaha/pekerjaan"
                              className="mt-1"
                            />
                          </div>
                          {/* <div className="space-y-2">
                            <Label>Keterangan</Label>
                            <Input
                              value={pekerjaan.keterangan || ''}
                              onChange={(e) => {
                                const newEddPekerjaanLain = [...(formData.edd_pekerjaan_lain || [])];
                                newEddPekerjaanLain[index] = { ...newEddPekerjaanLain[index], keterangan: e.target.value };
                                handleEddChange('edd_pekerjaan_lain', newEddPekerjaanLain);
                              }}
                              placeholder="Keterangan tambahan"
                              className="mt-1"
                            />
                          </div> */}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                    <p className="text-lg font-medium mb-2">Tidak Ada Pekerjaan/Usaha Lain</p>
                    <p className="text-sm">Nasabah tidak memiliki pekerjaan atau usaha lain.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 flex justify-between items-center shrink-0">
          <div className="text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>
                      Pastikan data yang diubah sudah benar sebelum menyimpan.
                    </span>
                  </div>
          </div>

          <DialogFooter className="gap-3">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Batal
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={loading || changedFields.size === 0}
                  className={changedFields.size > 0 ? 'bg-orange-600 hover:bg-orange-700' : ''}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan {changedFields.size} Perubahan
                    </>
                  )}
                </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
