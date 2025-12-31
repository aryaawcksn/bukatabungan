
// FormDetailDialog component – displays submission details and allows PDF export
import React, { useEffect, useState } from 'react';
import { type FormSubmission, mapBackendDataToFormSubmission } from '../DashboardPage';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';
import { pdf } from '@react-pdf/renderer';
import { SubmissionPdf } from '../SubmissionPdf';
import {
  User,
  Calendar,
  MapPin,
  Briefcase,
  FileText,
  CheckCircle,
  XCircle,
  CreditCard,
  UserCheck,
  Wallet,
  AlertCircle,
  Clock,
  Edit3,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config/api';

interface FormDetailDialogProps {
  submission: FormSubmission;
  open: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  isMarked?: boolean;
  onToggleMark?: () => void;
  onEdit?: () => void;
  onEditComplete?: () => void; // New callback for when edit is completed
}

// Helper UI components ------------------------------------------------------
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}
const Section = ({ title, icon, children, className = "" }: SectionProps) => (
  <div className={`mb-8 ${className}`}>
    <div className="flex items-center gap-2 mb-4">
       <div className="p-1.5 bg-slate-100 rounded-md text-slate-600">
         {icon}
       </div>
      <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
      <div className="flex-1 h-px bg-slate-100 ml-4"></div>
    </div>
    {children}
  </div>
);

const GridContainer = ({ children }: { children: React.ReactNode }) => {
  // Filter out null/undefined children
  const validChildren = React.Children.toArray(children).filter(child => child !== null && child !== undefined);
  
  if (validChildren.length === 0) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">{validChildren}</div>
  );
};

interface FieldProps {
  label: string;
  value: string | undefined | null;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}
const Field = ({ label, value, icon, fullWidth = false }: FieldProps) => {
  // Show field with "-" if value is empty, null, or undefined
  const displayValue = (!value || value.trim() === '') ? '-' : value;
  
  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? "col-span-full" : ""}`}>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
        {icon && <span className="opacity-70">{icon}</span>}
        {label}
      </div>
      <div className="text-sm text-slate-900 font-medium break-words leading-relaxed">
        {displayValue}
      </div>
    </div>
  );
};

// Skeleton component for loading state
const DetailSkeleton = () => (
  <div className="flex-1 overflow-y-auto p-4 space-y-10 animate-pulse">
    {/* TOP SUMMARY CARDS SKELETON */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>

    {/* PERSONAL DATA SKELETON */}
    <Section title="Data Pribadi Nasabah" icon={<Skeleton className="w-4 h-4 rounded-full" />}>
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
      </div>
    </Section>

    {/* JOB INFO SKELETON */}
    <Section title="Pekerjaan & Keuangan" icon={<Skeleton className="w-4 h-4 rounded-full" />}>
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
      </div>
    </Section>
  </div>
);

export function FormDetailDialog({ submission, open, onClose, onApprove, onReject, onEdit}: FormDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [detailSubmission, setDetailSubmission] = useState<FormSubmission>(submission);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Function to fetch full details
  const fetchDetails = async () => {
    if (!submission.id) return;
    
    setFetchingDetails(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/pengajuan/${submission.id}`, {
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error("Failed to fetch details");
      
      const data = await res.json();
      if (data.success) {
        const fullDetails = mapBackendDataToFormSubmission(data.data);
        setDetailSubmission(fullDetails);
      }
    } catch (err) {
      console.error("Error fetching detail:", err);
      toast.error("Gagal memuat detail lengkap");
    } finally {
      setFetchingDetails(false);
    }
  };

  // Fetch full details when dialog opens
  useEffect(() => {
    if (open && submission.id) {
       // Reset to initial submission first
       setDetailSubmission(submission);
       setPdfBlob(null);
       
       fetchDetails();
    }
  }, [open, submission.id]);

  // Listen for changes in submission data to refresh
  useEffect(() => {
    if (open && submission.id) {
      // If submission data has changed (like after edit), refresh details
      fetchDetails();
    }
  }, [submission.submittedAt, submission.status]); // Listen to key fields that might change 

  const statusConfig = {
    pending: { label: 'Menunggu Review', variant: 'outline' as const, className: 'border-orange-500 text-orange-700 bg-orange-50' },
    approved: { label: 'Disetujui', variant: 'outline' as const, className: 'border-green-600 text-green-700 bg-green-50' },
    rejected: { label: 'Ditolak', variant: 'outline' as const, className: 'border-red-500 text-red-700 bg-red-50' },
  };
  const status = statusConfig[detailSubmission.status];

  const handleGeneratePdf = async () => {
    setLoading(true);
    const blob = await pdf(<SubmissionPdf submission={detailSubmission} />).toBlob();
    setPdfBlob(blob);
    setLoading(false);
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };

  
  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      {/* Increased max-width to 5xl and height to 90vh - Fixed Background Opacity */}
      <DialogContent className="max-w-[95vw] sm:max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden flex flex-col bg-slate-50">
        
        {/* HEADER SECTION - Compact & Cleaner */}
        <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                </div>
                <div>
                   <DialogTitle className="text-xl font-bold text-slate-900">
                     Detail Permohonan
                   </DialogTitle>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                         <span className="font-mono bg-slate-100 px-1.5 rounded text-slate-600 font-medium">
                            {detailSubmission.referenceCode}
                         </span>
                         <span className="w-1 h-1 bg-slate-300 rounded-full" />
                         <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {detailSubmission.submittedAt}
                         </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                 {/* Compact Status Info */}
                <div className="px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm flex items-center gap-3 text-sm">
                    {detailSubmission.status === 'approved' && detailSubmission.approvedBy && (
                        <div className="flex items-center gap-1.5 text-green-700 pr-3 border-r border-slate-200">
                             <CheckCircle className="w-4 h-4" />
                             <span className="font-medium">Oleh: {detailSubmission.approvedBy}</span>
                        </div>
                    )}
                     {detailSubmission.status === 'rejected' && detailSubmission.rejectedBy && (
                        <div className="flex items-center gap-1.5 text-red-700 pr-3 border-r border-slate-200">
                             <XCircle className="w-4 h-4" />
                             <span className="font-medium">Oleh: {detailSubmission.rejectedBy}</span>
                        </div>
                    )}
                    <Badge variant={status.variant} className={`${status.className} border-0 bg-transparent px-0 font-bold uppercase`}>
                        {status.label}
                    </Badge>
                </div>

                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
                    <XCircle className="w-6 h-6 text-slate-400" />
                </Button>
            </div>
        </div>

        {/* MAIN SCROLLABLE CONTENT */}
        {fetchingDetails ? (
          <DetailSkeleton />
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-10 animate-contentEnter">
             {/* TOP SUMMARY CARDS */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                    <div className="text-xs text-slate-500 uppercase font-semibold">Jenis Rekening</div>
                    <div className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-blue-600" />
                        {detailSubmission.savingsType || "-"}
                    </div>
                    <div className="text-sm text-slate-500">{detailSubmission.personalData.tipeNasabah === 'lama' ? 'Nasabah Lama' : 'Nasabah Baru'}</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                     <div className="text-xs text-slate-500 uppercase font-semibold">Jenis Kartu</div>
                     <div className="text-lg font-bold text-slate-800 flex items-center gap-2">
                         <CreditCard className="w-5 h-5 text-purple-600" />
                         {detailSubmission.cardType 
                           ? detailSubmission.cardType
                           : (detailSubmission.savingsType === 'Mutiara' ? "Belum Dipilih" : "Tanpa Kartu ATM")}
                     </div>
                </div>
                 <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                     <div className="text-xs text-slate-500 uppercase font-semibold">Kepemilikikan</div>
                     <div className="text-lg font-bold text-slate-800 flex items-center gap-2">
                         <User className='w-5 h-5 text-emerald-600'/>
                        {detailSubmission.accountInfo.isForSelf ? 'Pribadi' : 'Orang Lain'}
                     </div>
                 </div>
             </div>
  
            {/* PERSONAL DATA */}
            <Section title="Data Pribadi Nasabah" icon={<User className="w-4 h-4" />}>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <GridContainer>
                  <Field label="Nama Lengkap" value={detailSubmission.personalData.fullName} />
                  <Field label="Alias" value={detailSubmission.personalData.alias} />
                  <Field label="No Identitas" value={detailSubmission.personalData.nik} />
                  <Field label="Jenis Identitas" value={detailSubmission.personalData.identityType} />
                  <Field label="NPWP" value={detailSubmission.personalData.npwp} />
                  <Field label="Tempat, Tgl Lahir"value={`${detailSubmission.personalData.birthPlace || ''}, ${detailSubmission.personalData.birthDate}`} />
                  <Field label="Jenis Kelamin" value={detailSubmission.personalData.gender} />
                  <Field label="Status Pernikahan" value={detailSubmission.personalData.maritalStatus} />
                  <Field label="Nama Ibu Kandung" value={detailSubmission.personalData.motherName} />
                  <Field label="Agama" value={detailSubmission.personalData.religion} />
                  <Field label="Pendidikan" value={detailSubmission.personalData.education} />
                   <Field label="Kewarganegaraan" value={detailSubmission.personalData.citizenship} />
                  <Field label="Email"value={detailSubmission.personalData.email} />
                  <Field label="No. Telepon"value={detailSubmission.personalData.phone} />
                  </GridContainer>
              </div>
               <div className="mt-4 bg-white p-6 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" /> Alamat Lengkap
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field label="Alamat KTP" value={detailSubmission.personalData.address.street} fullWidth />
                      <div className="grid grid-cols-2 gap-4">
                          <Field label="Kode Pos" value={detailSubmission.personalData.address.postalCode} />
                          <Field label="Status Rumah" value={detailSubmission.personalData.homeStatus} />
                      </div>
                       {detailSubmission.personalData.address.domicile && (
                          <Field label="Alamat Domisili" value={detailSubmission.personalData.address.domicile} fullWidth />
                      )}
                  </div>
               </div>
            </Section>
  
            {/* JOB INFO */}
            <Section
              title={detailSubmission.savingsType === 'SimPel' ? 'Sekolah & Pekerjaan' : 'Pekerjaan & Keuangan'}
              icon={<Briefcase className="w-4 h-4" />}
            >
               <div className="bg-white p-6 rounded-xl border border-slate-200">
                   <GridContainer>
                  <Field label="Pekerjaan" value={detailSubmission.jobInfo.occupation} />
                  <Field 
                      label={detailSubmission.savingsType === 'SimPel' ? 'Nama Sekolah' : 'Nama Instansi'} 
                      value={detailSubmission.jobInfo.workplace} 
                  />
                  <Field label="Bidang Usaha" value={detailSubmission.jobInfo.businessField} />
                  <Field label="Jabatan" value={detailSubmission.jobInfo.position} />
                  <Field label="Penghasilan" value={detailSubmission.jobInfo.salaryRange} />
                  <Field label="Sumber Dana" value={detailSubmission.jobInfo.incomeSource} />
                  <Field label="Rata-rata Transaksi"value={detailSubmission.jobInfo.averageTransaction} />
                  <Field label="Tujuan Rekening" value={detailSubmission.jobInfo.accountPurpose} />
                  </GridContainer>
                  <Separator className="my-6" />
                  <GridContainer>
                       <Field label="Alamat Kantor" value={detailSubmission.jobInfo.officeAddress} fullWidth />
                       <Field label="Telp Kantor" value={detailSubmission.jobInfo.officePhone} />
                  </GridContainer>
               </div>
            </Section>
  
            {/* EMERGENCY CONTACT & BENEFICIAL OWNER GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-1 gap-8">
                 {/* EMERGENCY CONTACT */}
                 {detailSubmission.emergencyContact && (
                   <Section title="Kontak Darurat" icon={<AlertCircle className="w-4 h-4" />} className="mb-0">
                     <div className="bg-white p-6 rounded-xl border border-slate-200 h-full">
                       <div className="space-y-4">
                         <Field label="Nama" value={detailSubmission.emergencyContact.name} />
                         <Field label="Hubungan" value={detailSubmission.emergencyContact.relationship} />
                         <Field label="Nomor Telepon" value={detailSubmission.emergencyContact.phone} />
                         <Field label="Alamat"value={detailSubmission.emergencyContact.address} />
                       </div>
                     </div>
                   </Section>
                  )}
  
                   {/* BENEFICIAL OWNER */}
                  {detailSubmission.beneficialOwner && (
                      <Section title="Beneficial Owner" icon={<UserCheck className="w-4 h-4" />} className="mb-0">
                      <div className="bg-white p-6 rounded-xl border border-slate-200 h-full">
                          <GridContainer>
                              <Field label="Nama Lengkap" value={detailSubmission.beneficialOwner.name} />
                              <Field label="Hubungan" value={detailSubmission.beneficialOwner.relationship} />
                              <Field label="Kewarganegaraan" value={detailSubmission.beneficialOwner.citizenship} />
                              <Field label="Pendapatan" value={detailSubmission.beneficialOwner.annualIncome} />
                              <Field label="Alamat" value={detailSubmission.beneficialOwner.address} />
                              <Field label="Tempat, Tgl Lahir" icon={<Calendar className="w-3 h-3" />} value={`${detailSubmission.beneficialOwner.birthPlace || ''}, ${detailSubmission.beneficialOwner.birthDate}`} />
                              <Field label="Jenis Kelamin" value={detailSubmission.beneficialOwner.gender} />
                              <Field label="Status Pernikahan" value={detailSubmission.beneficialOwner.maritalStatus} />
                              <Field label="Jenis ID" value={detailSubmission.beneficialOwner.identityType} />
                              <Field label="Nomor ID" value={detailSubmission.beneficialOwner.identityNumber} />
                              <Field label="Sumber Dana" value={detailSubmission.beneficialOwner.incomeSource} />
                              <Field label="No Hp" value={detailSubmission.beneficialOwner.phone} />
                              <Field label="Pekerjaan" value={detailSubmission.beneficialOwner.occupation} />
                          </GridContainer>
                      </div>
                      </Section>
                  )}
            </div>
            
            {/* OTHER BANKS / JOBS */}
            {(detailSubmission.eddBankLain?.length || detailSubmission.eddPekerjaanLain?.length) ? (
                <Section title="Informasi Kekayaan (EDD)" icon={<FileText className="w-4 h-4" />}>
                     <div className="bg-white p-6 rounded-xl border border-slate-200">
                          {detailSubmission.eddBankLain && detailSubmission.eddBankLain.length > 0 && (
                               <div className="mb-6">
                                   <h4 className="text-sm font-semibold mb-3">Rekening Bank Lain</h4>
                                   <div className="flex flex-wrap gap-4">
                                       {detailSubmission.eddBankLain.map((bank, i) => (
                                           <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                                               <div className="font-bold text-slate-700">{bank.bank_name}</div>
                                               <div className="text-slate-500">{bank.nomor_rekening} ({bank.jenis_rekening})</div>
                                           </div>
                                       ))}
                                   </div>
                               </div>
                          )}
                          {detailSubmission.eddPekerjaanLain && detailSubmission.eddPekerjaanLain.length > 0 && (
                               <div>
                                   <h4 className="text-sm font-semibold mb-3">Usaha Tambahan</h4>
                                   <div className="flex flex-wrap gap-2">
                                       {detailSubmission.eddPekerjaanLain.map((job, i) => (
                                           <Badge key={i} variant="secondary" className="px-3 py-1">
                                               {job.jenis_usaha}
                                           </Badge>
                                       ))}
                                   </div>
                               </div>
                          )}
                     </div>
                </Section>
            ) : null}
  
          </div>
        )}

        {/* FOOTER ACTION BAR */}
        <div className="p-5 border-t border-slate-200 flex justify-between items-center shrink-0">
           <div className="text-sm text-slate-500 hidden sm:block">
              {status.label === 'Disetujui' 
                ? `Permohonan disetujui pada ${detailSubmission.approvedAt || 'Unknown Date'}`
                : status.label === 'Ditolak' 
                  ? `Permohonan ditolak pada ${detailSubmission.rejectedAt || 'Unknown Date'}`
                  : 'Tinjau data dengan seksama sebelum memberikan keputusan.'}
           </div>

           <DialogFooter className="gap-3 sm:gap-4 w-full sm:w-auto">
            {/* Approved: PDF Button & Edit Button */}
            {detailSubmission.status === 'approved' &&  (
              <>
                {onEdit && (
                  <Button variant="outline" onClick={onEdit} className="w-full sm:w-auto border-blue-200 text-blue-600 hover:bg-blue-50">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Data
                  </Button>
                )}
                {!pdfBlob ? (
                  <Button variant="outline" onClick={handleGeneratePdf} disabled={loading} className="w-full sm:w-auto">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Memproses PDF...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate PDF
                      </>
                    )}
                  </Button>
                ) : (
                  <a href={URL.createObjectURL(pdfBlob)} download={`Bukti-Pendaftaran-${detailSubmission.referenceCode}.pdf`} className="w-full sm:w-auto">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <FileText className="w-4 h-4 mr-2" />
                      Download Bukti PDF
                    </Button>
                  </a>
                )}
              </>
            )}

            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Tutup
            </Button>

           

            {/* Pending: Actions */}
            {detailSubmission.status === 'pending' && (
              <>
                <Button variant="outline" onClick={onReject} className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300">
                  <XCircle className="w-4 h-4 mr-2" />
                  Tolak
                </Button>
                <Button onClick={onApprove} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white shadow-md">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Setujui
                </Button>
              </>
            )}
          </DialogFooter>
        </div>

      </DialogContent>
    </Dialog>
  );
}