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
  ]
};

export function EditSubmissionDialog({ submission, open, onClose, onSuccess }: EditSubmissionDialogProps) {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [editHistory, setEditHistory] = useState<EditHistoryData | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Helper function to format date for input
  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
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
  });

  // Update form data when submission changes
  useEffect(() => {
    console.log('🔍 Updating form data with submission:', submission);
    setFormData({
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
    });
    console.log('🔍 Form data updated:', formData);
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
      const res = await fetch(`${API_BASE_URL}/api/pengajuan/${submission.id}`, {
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error('Failed to fetch full submission data');
      
      const data = await res.json();
      if (data.success) {
        // Update submission data with full details
        const fullSubmission = mapBackendDataToFormSubmission(data.data);
        console.log('🔍 Full submission data loaded:', fullSubmission);
        
        // Update form data with full submission
        setFormData({
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
        });
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!editReason.trim()) {
      toast.error('Alasan edit harus diisi');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/pengajuan/${submission.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          editReason,
          isEdit: true
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to edit submission');
      }

      if (data.success) {
        toast.success(`Berhasil mengedit ${data.changedFields} field`);
        setEditMode(false);
        setEditReason('');
        loadEditHistory(); // Reload history
        onSuccess(); // Refresh parent data
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
    setFormData({
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
      pekerjaan: submission.jobInfo.occupation || '',
      gaji_per_bulan: submission.jobInfo.salaryRange || '',
      sumber_dana: submission.jobInfo.incomeSource || '',
      rata_transaksi_per_bulan: submission.jobInfo.averageTransaction || '',
      nama_perusahaan: submission.jobInfo.workplace || '',
      alamat_perusahaan: submission.jobInfo.officeAddress || '',
      no_telepon: submission.jobInfo.officePhone || '',
      jabatan: submission.jobInfo.position || '',
      bidang_usaha: submission.jobInfo.businessField || '',
      tabungan_tipe: submission.savingsType || '',
      atm_tipe: submission.cardType || '',
      nominal_setoran: submission.accountInfo.initialDeposit || '',
      tujuan_pembukaan: submission.jobInfo.accountPurpose || '',
      kontak_darurat_nama: submission.emergencyContact?.name || '',
      kontak_darurat_hp: submission.emergencyContact?.phone || '',
      kontak_darurat_alamat: submission.emergencyContact?.address || '',
      kontak_darurat_hubungan: submission.emergencyContact?.relationship || '',
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
    };
    return labels[fieldName] || fieldName;
  };

  // Helper function to render appropriate input component
  const renderInputField = (fieldName: string, value: string, onChange: (value: string) => void) => {
    const options = DROPDOWN_OPTIONS[fieldName as keyof typeof DROPDOWN_OPTIONS];
    
    if (options) {
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
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
    if (fieldName === 'tanggal_lahir') {
      return (
        <Input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }

    if (fieldName === 'email') {
      return (
        <Input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }

    // Default text input
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };

  // Only show edit button for approved submissions
  if (submission.status !== 'approved') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <Label htmlFor="editReason" className="text-sm font-semibold text-yellow-800 mb-2 block">
                  Alasan Edit *
                </Label>
                <Textarea
                  id="editReason"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="Jelaskan alasan mengapa data perlu diedit..."
                  className="bg-white border-yellow-300 focus:border-yellow-500"
                  rows={3}
                />
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
                    <Input
                      id="nama"
                      value={formData.nama}
                      onChange={(e) => handleInputChange('nama', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="alias">Alias</Label>
                    <Input
                      id="alias"
                      value={formData.alias}
                      onChange={(e) => handleInputChange('alias', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="jenis_id">Jenis ID</Label>
                    {renderInputField('jenis_id', formData.jenis_id, (value) => handleInputChange('jenis_id', value))}
                  </div>
                  <div>
                    <Label htmlFor="no_id">Nomor ID</Label>
                    <Input
                      id="no_id"
                      value={formData.no_id}
                      onChange={(e) => handleInputChange('no_id', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                    <Input
                      id="tempat_lahir"
                      value={formData.tempat_lahir}
                      onChange={(e) => handleInputChange('tempat_lahir', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                    {renderInputField('tanggal_lahir', formData.tanggal_lahir, (value) => handleInputChange('tanggal_lahir', value))}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="alamat_id">Alamat KTP</Label>
                    <Input
                      id="alamat_id"
                      value={formData.alamat_id}
                      onChange={(e) => handleInputChange('alamat_id', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="kode_pos_id">Kode Pos</Label>
                    <Input
                      id="kode_pos_id"
                      value={formData.kode_pos_id}
                      onChange={(e) => handleInputChange('kode_pos_id', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="alamat_now">Alamat Domisili</Label>
                    <Input
                      id="alamat_now"
                      value={formData.alamat_now}
                      onChange={(e) => handleInputChange('alamat_now', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {renderInputField('email', formData.email, (value) => handleInputChange('email', value))}
                  </div>
                  <div>
                    <Label htmlFor="no_hp">No HP</Label>
                    <Input
                      id="no_hp"
                      value={formData.no_hp}
                      onChange={(e) => handleInputChange('no_hp', e.target.value)}
                    />
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
                    <Input
                      id="nama_ibu_kandung"
                      value={formData.nama_ibu_kandung}
                      onChange={(e) => handleInputChange('nama_ibu_kandung', e.target.value)}
                    />
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
                    <Input
                      id="nama_perusahaan"
                      value={formData.nama_perusahaan}
                      onChange={(e) => handleInputChange('nama_perusahaan', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="jabatan">Jabatan</Label>
                    <Input
                      id="jabatan"
                      value={formData.jabatan}
                      onChange={(e) => handleInputChange('jabatan', e.target.value)}
                    />
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
                    <Input
                      id="rata_transaksi_per_bulan"
                      value={formData.rata_transaksi_per_bulan}
                      onChange={(e) => handleInputChange('rata_transaksi_per_bulan', e.target.value)}
                    />
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
                  <div>
                    <Label htmlFor="atm_tipe">Jenis Kartu ATM</Label>
                    {renderInputField('atm_tipe', formData.atm_tipe, (value) => handleInputChange('atm_tipe', value))}
                  </div>
                  <div>
                    <Label htmlFor="nominal_setoran">Nominal Setoran</Label>
                    <Input
                      id="nominal_setoran"
                      value={formData.nominal_setoran}
                      onChange={(e) => handleInputChange('nominal_setoran', e.target.value)}
                    />
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
                    <Input
                      id="kontak_darurat_nama"
                      value={formData.kontak_darurat_nama}
                      onChange={(e) => handleInputChange('kontak_darurat_nama', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="kontak_darurat_hp">No HP</Label>
                    <Input
                      id="kontak_darurat_hp"
                      value={formData.kontak_darurat_hp}
                      onChange={(e) => handleInputChange('kontak_darurat_hp', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="kontak_darurat_hubungan">Hubungan</Label>
                    {renderInputField('kontak_darurat_hubungan', formData.kontak_darurat_hubungan, (value) => handleInputChange('kontak_darurat_hubungan', value))}
                  </div>
                  <div>
                    <Label htmlFor="kontak_darurat_alamat">Alamat</Label>
                    <Input
                      id="kontak_darurat_alamat"
                      value={formData.kontak_darurat_alamat}
                      onChange={(e) => handleInputChange('kontak_darurat_alamat', e.target.value)}
                    />
                  </div>
                </div>
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
              ? 'Pastikan data yang diubah sudah benar sebelum menyimpan'
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
                <Button onClick={handleSave} disabled={loading || !editReason.trim()}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
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