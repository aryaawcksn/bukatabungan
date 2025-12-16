import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Edit3, 
  Save, 
  X, 
  User, 
  Briefcase, 
  AlertCircle,
  History,
  CheckCircle2,
  Clock
} from 'lucide-react';
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
}

interface EditHistory {
  id: number;
  field_name: string;
  old_value: string;
  new_value: string;
  edit_reason: string;
  edited_at: string;
  edited_by_username: string;
  edited_by_name: string;
}

interface SubmissionInfo {
  id: number;
  status: string;
  edit_count: number;
  last_edited_at: string | null;
  last_edited_by: {
    username: string;
  } | null;
  original_approved_by: {
    username: string;
    approved_at: string;
  } | null;
  current_approved_by: {
    username: string;
    approved_at: string;
  } | null;
}

interface EditHistoryData {
  submission: SubmissionInfo;
  history: EditHistory[];
}

// Dropdown options based on FormSimpel.tsx and FormMutiara.tsx
const DROPDOWN_OPTIONS = {
  jenis_id: [
    { value: 'KTP', label: '🪪 KTP / KIA' },
    { value: 'Paspor', label: '📘 Paspor' },
    { value: 'Lainnya', label: '📄 Lainnya' }
  ],
  jenis_kelamin: [
    { value: 'Laki-laki', label: '👨 Laki-laki' },
    { value: 'Perempuan', label: '👩 Perempuan' }
  ],
  status_kawin: [
    { value: 'Belum Kawin', label: 'Belum Kawin' },
    { value: 'Kawin', label: 'Kawin' },
    { value: 'Cerai Hidup', label: 'Cerai Hidup' },
    { value: 'Cerai Mati', label: 'Cerai Mati' }
  ],
  agama: [
    { value: 'Islam', label: '☪️ Islam' },
    { value: 'Kristen', label: '✝️ Kristen' },
    { value: 'Katolik', label: '✝️ Katolik' },
    { value: 'Hindu', label: '🕉️ Hindu' },
    { value: 'Budha', label: '☸️ Budha' },
    { value: 'Konghucu', label: '☯️ Konghucu' },
    { value: 'Lainnya', label: 'Lainnya' }
  ],
  pendidikan: [
    { value: 'SD', label: '🎒 SD' },
    { value: 'SMP', label: '📚 SMP' },
    { value: 'SMA', label: '🎓 SMA' },
    { value: 'Diploma', label: '📜 Diploma (D3)' },
    { value: 'Sarjana', label: '🎓 Sarjana (S1)' },
    { value: 'Magister', label: '🎓 Magister (S2)' },
    { value: 'Doktor', label: '🎓 Doktor (S3)' },
    { value: 'Lainnya', label: 'Lainnya' }
  ],
  kewarganegaraan: [
    { value: 'Indonesia', label: '🇮🇩 WNI (Warga Negara Indonesia)' },
    { value: 'WNA', label: '🌍 WNA (Warga Negara Asing)' }
  ],
  status_rumah: [
    { value: 'Milik Sendiri', label: '🏠 Milik Sendiri' },
    { value: 'Milik Orang Tua', label: '👨‍👩‍👧 Milik Orang Tua' },
    { value: 'Sewa/Kontrak', label: '🔑 Sewa/Kontrak' },
    { value: 'Dinas', label: '🏢 Rumah Dinas' }
  ],
  pekerjaan: [
    { value: 'pelajar-mahasiswa', label: '🎓 Pelajar / Mahasiswa' },
    { value: 'karyawan-swasta', label: '💼 Karyawan Swasta' },
    { value: 'pns', label: '🏛️ PNS / TNI / Polri' },
    { value: 'wiraswasta', label: '🏪 Wiraswasta' },
    { value: 'ibu-rumah-tangga', label: '🏠 Ibu Rumah Tangga' },
    { value: 'lainnya', label: '📋 Lainnya' }
  ],
  gaji_per_bulan: [
    { value: '< 3 Juta', label: '💰 < 3 Juta' },
    { value: '3 - 5 Juta', label: '💰 3 - 5 Juta' },
    { value: '5 - 10 Juta', label: '💰💰 5 - 10 Juta' },
    { value: '> 10 Juta', label: '💰💰💰 > 10 Juta' }
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
    { value: 'Orang Tua', label: '👨‍👩‍👧 Orang Tua' },
    { value: 'Suami/Istri', label: '💑 Suami/Istri' },
    { value: 'Anak', label: '👶 Anak' },
    { value: 'Saudara Kandung', label: '👫 Saudara Kandung' },
    { value: 'Kerabat Lain', label: '👥 Kerabat Lain' },
    { value: 'Lainnya', label: '✏️ Lainnya' }
  ],
  // BO Fields
  bo_jenis_kelamin: [
    { value: 'Laki-laki', label: '👨 Laki-laki' },
    { value: 'Perempuan', label: '👩 Perempuan' }
  ],
  bo_kewarganegaraan: [
    { value: 'Indonesia', label: '🇮🇩 WNI (Warga Negara Indonesia)' },
    { value: 'WNA', label: '🌍 WNA (Warga Negara Asing)' }
  ],
  bo_status_pernikahan: [
    { value: 'Belum Kawin', label: 'Belum Kawin' },
    { value: 'Kawin', label: 'Kawin' },
    { value: 'Cerai Hidup', label: 'Cerai Hidup' },
    { value: 'Cerai Mati', label: 'Cerai Mati' }
  ],
  bo_jenis_id: [
    { value: 'KTP', label: '🪪 KTP / KIA' },
    { value: 'Paspor', label: '📘 Paspor' },
    { value: 'Lainnya', label: '📄 Lainnya' }
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
    { value: 'Orang Tua', label: '👨‍👩‍👧 Orang Tua' },
    { value: 'Anak', label: '👶 Anak' },
    { value: 'Suami/Istri', label: '💑 Suami/Istri' },
    { value: 'Saudara Kandung', label: '👫 Saudara Kandung' },
    { value: 'Kerabat', label: '👥 Kerabat' },
    { value: 'Teman', label: '🤝 Teman' },
    { value: 'Lainnya', label: '📋 Lainnya' }
  ]
};

export function EditSubmissionDialog({ submission, open, onClose, onSuccess }: EditSubmissionDialogProps) {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [editHistory, setEditHistory] = useState<EditHistoryData | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<any>(null);
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());

  // Helper function to format date for input
  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      // Handle different date formats
      let date: Date;
      
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // If it's in DD/MM/YYYY format (from mapping function), convert it
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Otherwise, parse as regular date and format to YYYY-MM-DD
      date = new Date(dateString);
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
    jenis_id: submission.personalData.identityType || '',
    no_id: submission.personalData.nik || '',
    berlaku_id: '',
    tempat_lahir: submission.personalData.birthPlace || '',
    tanggal_lahir: formatDateForInput(submission.personalData.birthDate),
    alamat_id: submission.personalData.address.street || '',
    kode_pos_id: submission.personalData.address.postalCode || '',
    alamat_now: submission.personalData.address.domicile || '',
    jenis_kelamin: submission.personalData.gender || '',
    status_kawin: submission.personalData.maritalStatus || '',
    agama: submission.personalData.religion || '',
    pendidikan: submission.personalData.education || '',
    nama_ibu_kandung: submission.personalData.motherName || '',
    npwp: submission.personalData.npwp || '',
    email: submission.personalData.email || '',
    no_hp: submission.personalData.phone || '',
    kewarganegaraan: submission.personalData.citizenship || '',
    status_rumah: submission.personalData.homeStatus || '',
    
    // Job Info
    pekerjaan: submission.jobInfo.occupation || '',
    gaji_per_bulan: submission.jobInfo.salaryRange || '',
    sumber_dana: submission.jobInfo.incomeSource || '',
    rata_transaksi_per_bulan: submission.jobInfo.averageTransaction || '',
    nama_perusahaan: submission.jobInfo.workplace || '',
    alamat_perusahaan: submission.jobInfo.officeAddress || '',
    no_telepon: submission.jobInfo.officePhone || '',
    jabatan: submission.jobInfo.position || '',
    bidang_usaha: submission.jobInfo.businessField || '',
    
    // Account Info
    tabungan_tipe: submission.savingsType || '',
    atm_tipe: submission.cardType || '',
    nominal_setoran: submission.accountInfo.initialDeposit || '',
    tujuan_pembukaan: submission.jobInfo.accountPurpose || '',
    
    // Emergency Contact
    kontak_darurat_nama: submission.emergencyContact?.name || '',
    kontak_darurat_hp: submission.emergencyContact?.phone || '',
    kontak_darurat_alamat: submission.emergencyContact?.address || '',
    kontak_darurat_hubungan: submission.emergencyContact?.relationship || '',
    
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
    bo_nomor_id: '',
    bo_sumber_dana: '',
    bo_hubungan: '',
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
    console.log('🔍 Updating form data with submission:', submission);
    const newFormData = {
      // Personal Data
      nama: submission.personalData.fullName || '',
      alias: submission.personalData.alias || '',
      jenis_id: submission.personalData.identityType || '',
      no_id: submission.personalData.nik || '',
      berlaku_id: '',
      tempat_lahir: submission.personalData.birthPlace || '',
      tanggal_lahir: formatDateForInput(submission.personalData.birthDate),
      alamat_id: submission.personalData.address.street || '',
      kode_pos_id: submission.personalData.address.postalCode || '',
      alamat_now: submission.personalData.address.domicile || '',
      jenis_kelamin: submission.personalData.gender || '',
      status_kawin: submission.personalData.maritalStatus || '',
      agama: submission.personalData.religion || '',
      pendidikan: submission.personalData.education || '',
      nama_ibu_kandung: submission.personalData.motherName || '',
      npwp: submission.personalData.npwp || '',
      email: submission.personalData.email || '',
      no_hp: submission.personalData.phone || '',
      kewarganegaraan: submission.personalData.citizenship || '',
      status_rumah: submission.personalData.homeStatus || '',
      
      // Job Info
      pekerjaan: submission.jobInfo.occupation || '',
      gaji_per_bulan: submission.jobInfo.salaryRange || '',
      sumber_dana: submission.jobInfo.incomeSource || '',
      rata_transaksi_per_bulan: submission.jobInfo.averageTransaction || '',
      nama_perusahaan: submission.jobInfo.workplace || '',
      alamat_perusahaan: submission.jobInfo.officeAddress || '',
      no_telepon: submission.jobInfo.officePhone || '',
      jabatan: submission.jobInfo.position || '',
      bidang_usaha: submission.jobInfo.businessField || '',
      
      // Account Info
      tabungan_tipe: submission.savingsType || '',
      atm_tipe: submission.cardType || '',
      nominal_setoran: submission.accountInfo.initialDeposit || '',
      tujuan_pembukaan: submission.jobInfo.accountPurpose || '',
      
      // Emergency Contact
      kontak_darurat_nama: submission.emergencyContact?.name || '',
      kontak_darurat_hp: submission.emergencyContact?.phone || '',
      kontak_darurat_alamat: submission.emergencyContact?.address || '',
      kontak_darurat_hubungan: submission.emergencyContact?.relationship || '',
      
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
      bo_nomor_id: '',
      bo_sumber_dana: '',
      bo_hubungan: '',
      bo_nomor_hp: '',
      bo_pekerjaan: '',
      bo_pendapatan_tahun: '',
    };
    
    setFormData(newFormData);
    setOriginalFormData(newFormData); // Store original data for comparison
    setChangedFields(new Set()); // Reset changed fields
    console.log('🔍 Form data updated:', newFormData);
  }, [submission]);

  // Load full submission data and edit history when dialog opens
  useEffect(() => {
    if (open && submission.id) {
      loadFullSubmissionData();
      loadEditHistory();
    }
  }, [open, submission.id]);

  const loadFullSubmissionData = async () => {
    try {
      console.log('🔄 Loading full submission data for ID:', submission.id);
      const res = await fetch(`${API_BASE_URL}/api/pengajuan/${submission.id}`, {
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error('Failed to fetch full submission data');
      
      const data = await res.json();
      if (data.success) {
        // Update submission data with full details
        const fullSubmission = mapBackendDataToFormSubmission(data.data);
        console.log('🔍 Full submission data loaded:', fullSubmission);
        console.log('🔍 BO data from backend:', {
          rekening_untuk_sendiri: data.data.rekening_untuk_sendiri,
          bo_nama: data.data.bo_nama,
          bo_alamat: data.data.bo_alamat,
          beneficialOwner: fullSubmission.beneficialOwner
        });
        
        // Update form data with full submission
        const fullFormData = {
          // Personal Data
          nama: fullSubmission.personalData.fullName || '',
          alias: fullSubmission.personalData.alias || '',
          jenis_id: fullSubmission.personalData.identityType || '',
          no_id: fullSubmission.personalData.nik || '',
          berlaku_id: '',
          tempat_lahir: fullSubmission.personalData.birthPlace || '',
          tanggal_lahir: formatDateForInput(fullSubmission.personalData.birthDate),
          alamat_id: fullSubmission.personalData.address.street || '',
          kode_pos_id: fullSubmission.personalData.address.postalCode || '',
          alamat_now: fullSubmission.personalData.address.domicile || '',
          jenis_kelamin: fullSubmission.personalData.gender || '',
          status_kawin: fullSubmission.personalData.maritalStatus || '',
          agama: fullSubmission.personalData.religion || '',
          pendidikan: fullSubmission.personalData.education || '',
          nama_ibu_kandung: fullSubmission.personalData.motherName || '',
          npwp: fullSubmission.personalData.npwp || '',
          email: fullSubmission.personalData.email || '',
          no_hp: fullSubmission.personalData.phone || '',
          kewarganegaraan: fullSubmission.personalData.citizenship || '',
          status_rumah: fullSubmission.personalData.homeStatus || '',
          
          // Job Info
          pekerjaan: fullSubmission.jobInfo.occupation || '',
          gaji_per_bulan: fullSubmission.jobInfo.salaryRange || '',
          sumber_dana: fullSubmission.jobInfo.incomeSource || '',
          rata_transaksi_per_bulan: fullSubmission.jobInfo.averageTransaction || '',
          nama_perusahaan: fullSubmission.jobInfo.workplace || '',
          alamat_perusahaan: fullSubmission.jobInfo.officeAddress || '',
          no_telepon: fullSubmission.jobInfo.officePhone || '',
          jabatan: fullSubmission.jobInfo.position || '',
          bidang_usaha: fullSubmission.jobInfo.businessField || '',
          
          // Account Info
          tabungan_tipe: fullSubmission.savingsType || '',
          atm_tipe: fullSubmission.cardType || '',
          nominal_setoran: fullSubmission.accountInfo.initialDeposit || '',
          tujuan_pembukaan: fullSubmission.jobInfo.accountPurpose || '',
          
          // Emergency Contact
          kontak_darurat_nama: fullSubmission.emergencyContact?.name || '',
          kontak_darurat_hp: fullSubmission.emergencyContact?.phone || '',
          kontak_darurat_alamat: fullSubmission.emergencyContact?.address || '',
          kontak_darurat_hubungan: fullSubmission.emergencyContact?.relationship || '',
          
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
          bo_nomor_id: fullSubmission.beneficialOwner?.identityNumber || '',
          bo_sumber_dana: fullSubmission.beneficialOwner?.incomeSource || '',
          bo_hubungan: fullSubmission.beneficialOwner?.relationship || '',
          bo_nomor_hp: fullSubmission.beneficialOwner?.phone || '',
          bo_pekerjaan: fullSubmission.beneficialOwner?.occupation || '',
          bo_pendapatan_tahun: fullSubmission.beneficialOwner?.annualIncome || '',
        };
        
        setFormData(fullFormData);
        setOriginalFormData(fullFormData); // Update original data reference
      }
    } catch (err) {
      console.error('Error loading full submission data:', err);
      toast.error('Gagal memuat data lengkap submission');
    }
  };

  const loadEditHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/pengajuan/${submission.id}/history`, {
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error('Failed to fetch edit history');
      
      const data = await res.json();
      if (data.success) {
        setEditHistory(data.data);
      }
    } catch (err) {
      console.error('Error loading edit history:', err);
      toast.error('Gagal memuat riwayat edit');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Special handling: Clear BO fields when rekening_untuk_sendiri is changed to true
      if (field === 'rekening_untuk_sendiri' && value === true) {
        console.log('🗑️ Clearing BO fields because rekening_untuk_sendiri changed to true');
        
        // Clear all BO fields
        newData.bo_nama = '';
        newData.bo_alamat = '';
        newData.bo_tempat_lahir = '';
        newData.bo_tanggal_lahir = '';
        newData.bo_jenis_kelamin = '';
        newData.bo_kewarganegaraan = '';
        newData.bo_status_pernikahan = '';
        newData.bo_jenis_id = '';
        newData.bo_nomor_id = '';
        newData.bo_sumber_dana = '';
        newData.bo_hubungan = '';
        newData.bo_nomor_hp = '';
        newData.bo_pekerjaan = '';
        newData.bo_pendapatan_tahun = '';
      }
      
      // Track changed fields
      if (originalFormData) {
        const newChangedFields = new Set(changedFields);
        
        // Check if field has actually changed from original
        if (originalFormData[field] !== value) {
          // Skip empty optional fields unless they had content before
          if ((value === '' || value === null || value === undefined) && 
              (originalFormData[field] === '' || originalFormData[field] === null || originalFormData[field] === undefined)) {
            newChangedFields.delete(field);
          } else {
            newChangedFields.add(field);
          }
        } else {
          newChangedFields.delete(field);
        }
        
        // If we're clearing BO fields, mark them as changed too
        if (field === 'rekening_untuk_sendiri' && value === true) {
          const boFields = ['bo_nama', 'bo_alamat', 'bo_tempat_lahir', 'bo_tanggal_lahir', 
                           'bo_jenis_kelamin', 'bo_kewarganegaraan', 'bo_status_pernikahan', 
                           'bo_jenis_id', 'bo_nomor_id', 'bo_sumber_dana', 'bo_hubungan', 
                           'bo_nomor_hp', 'bo_pekerjaan', 'bo_pendapatan_tahun'];
          
          boFields.forEach(boField => {
            if (originalFormData[boField] && originalFormData[boField] !== '') {
              newChangedFields.add(boField);
            }
          });
        }
        
        setChangedFields(newChangedFields);
      }
      
      return newData;
    });
  };

  const handleSave = async () => {
    if (!editReason.trim()) {
      toast.error('Alasan edit harus diisi');
      return;
    }

    // Prevent double submission
    if (loading) {
      console.log('⚠️ Save already in progress, ignoring duplicate call');
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

      // If rekening_untuk_sendiri is true, explicitly send empty BO fields to ensure they're cleared
      if (formData.rekening_untuk_sendiri === true) {
        console.log('🗑️ Sending empty BO fields to clear database');
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

      const res = await fetch(`${API_BASE_URL}/api/pengajuan/${submission.id}`, {
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
        toast.success(`Berhasil mengedit ${data.changedFields} field`);
        setEditMode(false);
        setEditReason('');
        
        // Reload form data to reflect changes immediately
        console.log('🔄 Reloading form data after successful save...');
        await loadFullSubmissionData();
        
        // Reload history
        await loadEditHistory();
        
        // Refresh parent data
        onSuccess();
        
        console.log('✅ Form data reloaded successfully');
      }
    } catch (err: any) {
      console.error('Error editing submission:', err);
      toast.error(err.message || 'Gagal mengedit submission');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditReason('');
    // Reset form data to original values
    if (originalFormData) {
      setFormData({ ...originalFormData });
      setChangedFields(new Set());
    }
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
      jenis_id: 'Jenis ID',
      no_id: 'Nomor ID',
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
      no_telepon: 'No Telepon Kantor',
      jabatan: 'Jabatan',
      bidang_usaha: 'Bidang Usaha',
      tabungan_tipe: 'Jenis Rekening',
      atm_tipe: 'Jenis Kartu ATM',
      nominal_setoran: 'Nominal Setoran',
      tujuan_pembukaan: 'Tujuan Pembukaan',
      kontak_darurat_nama: 'Nama Kontak Darurat',
      kontak_darurat_hp: 'HP Kontak Darurat',
      kontak_darurat_alamat: 'Alamat Kontak Darurat',
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
  const renderInputField = (fieldName: string, value: string, onChange: (value: string) => void) => {
    const options = DROPDOWN_OPTIONS[fieldName as keyof typeof DROPDOWN_OPTIONS];
    const isChanged = changedFields.has(fieldName);
    const baseClassName = isChanged ? 'border-2 border-orange-400 bg-orange-50' : '';
    
    if (options) {
      return (
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
      );
    }

    // Special cases for specific input types
    if (fieldName === 'tanggal_lahir' || fieldName === 'bo_tanggal_lahir') {
      return (
        <Input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClassName}
        />
      );
    }

    if (fieldName === 'email') {
      return (
        <Input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClassName}
        />
      );
    }

    // Currency fields
    if (fieldName === 'nominal_setoran' || fieldName === 'rata_transaksi_per_bulan') {
      return (
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
    }

    // Textarea for address fields
    if (fieldName === 'alamat_id' || fieldName === 'alamat_now' || fieldName === 'alamat_perusahaan' || fieldName === 'bo_alamat' || fieldName === 'kontak_darurat_alamat') {
      return (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClassName}
          rows={2}
        />
      );
    }

    // Default text input
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={baseClassName}
      />
    );
  };

  // Only show edit button for approved submissions
  if (submission.status !== 'approved') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden flex flex-col bg-slate-50">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                {editMode ? 'Edit Submission' : 'Riwayat Edit Submission'}
              </DialogTitle>
              <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                <span className="font-mono bg-slate-100 px-1.5 rounded text-slate-600 font-medium">
                  {submission.referenceCode}
                </span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span>{submission.personalData.fullName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!editMode && submission.status === 'approved' && (
              <Button 
                onClick={() => setEditMode(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Data
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
              <X className="w-6 h-6 text-slate-400" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {editMode ? (
            // Edit Mode
            <div className="space-y-8">
              {/* Edit Reason */}
              <div className={`border rounded-lg p-4 ${changedFields.size > 0 ? 'bg-orange-50 border-orange-200' : 'bg-yellow-50 border-yellow-200'}`}>
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
              </div>

              {/* Personal Data Section */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Data Pribadi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="nama">Nama Lengkap</Label>
                    {renderInputField('nama', formData.nama, (value) => handleInputChange('nama', value))}
                  </div>
                  <div>
                    <Label htmlFor="alias">Alias</Label>
                    {renderInputField('alias', formData.alias, (value) => handleInputChange('alias', value))}
                  </div>
                  <div>
                    <Label htmlFor="jenis_id">Jenis ID</Label>
                    {renderInputField('jenis_id', formData.jenis_id, (value) => handleInputChange('jenis_id', value))}
                  </div>
                  <div>
                    <Label htmlFor="no_id">Nomor ID</Label>
                    {renderInputField('no_id', formData.no_id, (value) => handleInputChange('no_id', value))}
                  </div>
                  <div>
                    <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                    {renderInputField('tempat_lahir', formData.tempat_lahir, (value) => handleInputChange('tempat_lahir', value))}
                  </div>
                  <div>
                    <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                    {renderInputField('tanggal_lahir', formData.tanggal_lahir, (value) => handleInputChange('tanggal_lahir', value))}
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      📍 Alamat KTP (Dropdown Indonesia)
                    </Label>
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
                        <p className="text-xs text-green-700 font-medium">📍 Alamat Lengkap:</p>
                        <p className="text-sm text-green-800 mt-1">{formData.alamat_id}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="kode_pos_id">Kode Pos</Label>
                    {renderInputField('kode_pos_id', formData.kode_pos_id, (value) => handleInputChange('kode_pos_id', value))}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="alamat_now">Alamat Domisili</Label>
                    {renderInputField('alamat_now', formData.alamat_now, (value) => handleInputChange('alamat_now', value))}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {renderInputField('email', formData.email, (value) => handleInputChange('email', value))}
                  </div>
                  <div>
                    <Label htmlFor="no_hp">No HP</Label>
                    {renderInputField('no_hp', formData.no_hp, (value) => handleInputChange('no_hp', value))}
                  </div>
                  <div>
                    <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                    {renderInputField('jenis_kelamin', formData.jenis_kelamin, (value) => handleInputChange('jenis_kelamin', value))}
                  </div>
                  <div>
                    <Label htmlFor="status_kawin">Status Pernikahan</Label>
                    {renderInputField('status_kawin', formData.status_kawin, (value) => handleInputChange('status_kawin', value))}
                  </div>
                  <div>
                    <Label htmlFor="agama">Agama</Label>
                    {renderInputField('agama', formData.agama, (value) => handleInputChange('agama', value))}
                  </div>
                  <div>
                    <Label htmlFor="pendidikan">Pendidikan</Label>
                    {renderInputField('pendidikan', formData.pendidikan, (value) => handleInputChange('pendidikan', value))}
                  </div>
                  <div>
                    <Label htmlFor="nama_ibu_kandung">Nama Ibu Kandung</Label>
                    {renderInputField('nama_ibu_kandung', formData.nama_ibu_kandung, (value) => handleInputChange('nama_ibu_kandung', value))}
                  </div>
                  <div>
                    <Label htmlFor="kewarganegaraan">Kewarganegaraan</Label>
                    {renderInputField('kewarganegaraan', formData.kewarganegaraan, (value) => handleInputChange('kewarganegaraan', value))}
                  </div>
                  <div>
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
                  <div>
                    <Label htmlFor="pekerjaan">Pekerjaan</Label>
                    {renderInputField('pekerjaan', formData.pekerjaan, (value) => handleInputChange('pekerjaan', value))}
                  </div>
                  <div>
                    <Label htmlFor="nama_perusahaan">Nama Perusahaan</Label>
                    {renderInputField('nama_perusahaan', formData.nama_perusahaan, (value) => handleInputChange('nama_perusahaan', value))}
                  </div>
                  <div>
                    <Label htmlFor="jabatan">Jabatan</Label>
                    {renderInputField('jabatan', formData.jabatan, (value) => handleInputChange('jabatan', value))}
                  </div>
                  <div>
                    <Label htmlFor="gaji_per_bulan">Gaji per Bulan</Label>
                    {renderInputField('gaji_per_bulan', formData.gaji_per_bulan, (value) => handleInputChange('gaji_per_bulan', value))}
                  </div>
                  <div>
                    <Label htmlFor="sumber_dana">Sumber Dana</Label>
                    {renderInputField('sumber_dana', formData.sumber_dana, (value) => handleInputChange('sumber_dana', value))}
                  </div>
                  <div>
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
                  <div>
                    <Label htmlFor="tabungan_tipe">Jenis Rekening</Label>
                    {renderInputField('tabungan_tipe', formData.tabungan_tipe, (value) => handleInputChange('tabungan_tipe', value))}
                  </div>
                  {/* ATM Type - Only for Mutiara */}
                  {formData.tabungan_tipe === 'Mutiara' && (
                    <div>
                      <Label htmlFor="atm_tipe">Jenis Kartu ATM</Label>
                      {renderInputField('atm_tipe', formData.atm_tipe, (value) => handleInputChange('atm_tipe', value))}
                    </div>
                  )}
                  <div>
                    <Label htmlFor="nominal_setoran">Nominal Setoran</Label>
                    {renderInputField('nominal_setoran', formData.nominal_setoran, (value) => handleInputChange('nominal_setoran', value))}
                  </div>
                  <div>
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
                  <div>
                    <Label htmlFor="kontak_darurat_nama">Nama</Label>
                    {renderInputField('kontak_darurat_nama', formData.kontak_darurat_nama, (value) => handleInputChange('kontak_darurat_nama', value))}
                  </div>
                  <div>
                    <Label htmlFor="kontak_darurat_hp">No HP</Label>
                    {renderInputField('kontak_darurat_hp', formData.kontak_darurat_hp, (value) => handleInputChange('kontak_darurat_hp', value))}
                  </div>
                  <div>
                    <Label htmlFor="kontak_darurat_hubungan">Hubungan</Label>
                    {renderInputField('kontak_darurat_hubungan', formData.kontak_darurat_hubungan, (value) => handleInputChange('kontak_darurat_hubungan', value))}
                  </div>
                  <div>
                    <Label htmlFor="kontak_darurat_alamat">Alamat</Label>
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
                  </div>
                </div>

                {/* BO Fields - Only show when account is for others */}
                {formData.rekening_untuk_sendiri === false ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="bo_nama">
                          Nama Lengkap BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_nama', formData.bo_nama, (value) => handleInputChange('bo_nama', value))}
                      </div>
                      <div>
                        <Label htmlFor="bo_tempat_lahir">
                          Tempat Lahir BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_tempat_lahir', formData.bo_tempat_lahir, (value) => handleInputChange('bo_tempat_lahir', value))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="bo_tanggal_lahir">
                          Tanggal Lahir BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_tanggal_lahir', formData.bo_tanggal_lahir, (value) => handleInputChange('bo_tanggal_lahir', value))}
                      </div>
                      <div>
                        <Label htmlFor="bo_jenis_kelamin">
                          Jenis Kelamin BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_jenis_kelamin', formData.bo_jenis_kelamin, (value) => handleInputChange('bo_jenis_kelamin', value))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bo_alamat">
                        Alamat BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                      </Label>
                      {renderInputField('bo_alamat', formData.bo_alamat, (value) => handleInputChange('bo_alamat', value))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="bo_kewarganegaraan">
                          Kewarganegaraan BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_kewarganegaraan', formData.bo_kewarganegaraan, (value) => handleInputChange('bo_kewarganegaraan', value))}
                      </div>
                      <div>
                        <Label htmlFor="bo_status_pernikahan">
                          Status Pernikahan BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_status_pernikahan', formData.bo_status_pernikahan, (value) => handleInputChange('bo_status_pernikahan', value))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="bo_jenis_id">
                          Jenis Identitas BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_jenis_id', formData.bo_jenis_id, (value) => handleInputChange('bo_jenis_id', value))}
                      </div>
                      <div>
                        <Label htmlFor="bo_nomor_id">
                          Nomor Identitas BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_nomor_id', formData.bo_nomor_id, (value) => handleInputChange('bo_nomor_id', value))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="bo_pekerjaan">
                          Pekerjaan BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_pekerjaan', formData.bo_pekerjaan, (value) => handleInputChange('bo_pekerjaan', value))}
                      </div>
                      <div>
                        <Label htmlFor="bo_sumber_dana">
                          Sumber Dana BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_sumber_dana', formData.bo_sumber_dana, (value) => handleInputChange('bo_sumber_dana', value))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="bo_hubungan">
                          Hubungan dengan Nasabah {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_hubungan', formData.bo_hubungan, (value) => handleInputChange('bo_hubungan', value))}
                      </div>
                      <div>
                        <Label htmlFor="bo_nomor_hp">
                          Nomor HP BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                        </Label>
                        {renderInputField('bo_nomor_hp', formData.bo_nomor_hp, (value) => handleInputChange('bo_nomor_hp', value))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bo_pendapatan_tahun">
                        Pendapatan Tahunan BO {formData.rekening_untuk_sendiri === false && <span className="text-red-500">*</span>}
                      </Label>
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
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                    <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium mb-2">Rekening untuk Diri Sendiri</p>
                    <p className="text-sm">Data Beneficial Owner tidak diperlukan karena rekening ini untuk Anda sendiri.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // History Mode
            <div className="space-y-6">
              {/* Submission Info */}
              {editHistory && (
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Status Approval
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-slate-500 mb-1">Disetujui Pertama Kali</div>
                      <div className="text-sm font-medium">
                        {editHistory.submission.original_approved_by ? (
                          <>
                            <div>{editHistory.submission.original_approved_by.username}</div>
                            <div className="text-slate-500">
                              {formatDate(editHistory.submission.original_approved_by.approved_at)}
                            </div>
                          </>
                        ) : (
                          <div className="text-slate-400">Belum ada data</div>
                        )}
                      </div>
                    </div>
                    
                    {editHistory.submission.edit_count > 0 && (
                      <div>
                        <div className="text-sm text-slate-500 mb-1">Terakhir Diedit</div>
                        <div className="text-sm font-medium">
                          {editHistory.submission.last_edited_by ? (
                            <>
                              <div>{editHistory.submission.last_edited_by.username}</div>
                              <div className="text-slate-500">
                                {formatDate(editHistory.submission.last_edited_at!)}
                              </div>
                            </>
                          ) : (
                            <div className="text-slate-400">Belum pernah diedit</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                      {editHistory.submission.edit_count} kali diedit
                    </Badge>
                    <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                      Status: {editHistory.submission.status}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Edit History */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-600" />
                  Riwayat Perubahan
                </h3>

                {loadingHistory ? (
                  <div className="text-center py-8 text-slate-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 animate-spin" />
                    Memuat riwayat edit...
                  </div>
                ) : editHistory && editHistory.history.length > 0 ? (
                  <div className="space-y-4">
                    {editHistory.history.map((item) => (
                      <div key={item.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-medium text-slate-900">
                              {getFieldLabel(item.field_name)}
                            </div>
                            <div className="text-sm text-slate-500">
                              Diedit oleh {item.edited_by_username}
                            </div>
                          </div>
                          <div className="text-sm text-slate-500">
                            {formatDate(item.edited_at)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="text-xs text-slate-500 mb-1">Nilai Lama</div>
                            <div className="text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
                              {item.old_value || '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 mb-1">Nilai Baru</div>
                            <div className="text-sm bg-green-50 border border-green-200 rounded px-3 py-2">
                              {item.new_value || '-'}
                            </div>
                          </div>
                        </div>
                        
                        {item.edit_reason && (
                          <div>
                            <div className="text-xs text-slate-500 mb-1">Alasan</div>
                            <div className="text-sm bg-slate-50 border border-slate-200 rounded px-3 py-2">
                              {item.edit_reason}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Belum ada riwayat edit
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-white flex justify-between items-center shrink-0">
          <div className="text-sm text-slate-500">
            {editMode 
              ? (
                  <div className="flex items-center gap-2">
                    <span>
                      {changedFields.size > 0 
                        ? `${changedFields.size} field${changedFields.size > 1 ? 's' : ''} telah berubah`
                        : 'Belum ada perubahan'
                      }
                    </span>
                    {changedFields.size > 0 && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                        {changedFields.size} perubahan
                      </Badge>
                    )}
                  </div>
                )
              : `Submission ini telah diedit ${editHistory?.submission.edit_count || 0} kali`
            }
          </div>

          <DialogFooter className="gap-3">
            {editMode ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={loading}>
                  <X className="w-4 h-4 mr-2" />
                  Batal
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={loading || !editReason.trim() || changedFields.size === 0}
                  className={changedFields.size > 0 ? 'bg-orange-600 hover:bg-orange-700' : ''}
                >
                  <Save className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Menyimpan & Memuat Ulang...' : `Simpan ${changedFields.size} Perubahan`}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={onClose}>
                Tutup
              </Button>
            )}
          </DialogFooter>
        </div>

      </DialogContent>
    </Dialog>
  );
}