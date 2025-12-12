// FormDetailDialog component – displays submission details and allows PDF export
import React, { useEffect, useState } from 'react';
import { type FormSubmission, mapBackendDataToFormSubmission } from '../DashboardPage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Card } from './ui/card';
import { pdf } from '@react-pdf/renderer';
import { SubmissionPdf } from '../SubmissionPdf';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  CreditCard,
  UserCheck,
  Wallet,
  AlertCircle,
  Target,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';

interface FormDetailDialogProps {
  submission: FormSubmission;
  open: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

// Helper UI components ------------------------------------------------------
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}
const Section = ({ title, icon, children }: SectionProps) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
      {icon}
      <h3 className="text-base font-bold text-gray-800 uppercase tracking-wide">{title}</h3>
    </div>
    {children}
  </div>
);

const TwoCol = ({ children }: { children: React.ReactNode }) => {
  // Filter out null/undefined children
  const validChildren = React.Children.toArray(children).filter(child => child !== null && child !== undefined);
  
  if (validChildren.length === 0) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-8">{validChildren}</div>
  );
};

interface FieldProps {
  label: string;
  value: string | undefined | null;
  icon?: React.ReactNode;
}
const Field = ({ label, value, icon }: FieldProps) => {
  // Show field with "-" if value is empty, null, or undefined
  const displayValue = (!value || value.trim() === '') ? '-' : value;
  
  return (
    <div className="group">
      <div className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5 uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <div className="text-sm text-gray-900 font-semibold whitespace-pre-wrap break-words border-l-2 border-transparent group-hover:border-gray-200 pl-0 group-hover:pl-2 transition-all">
        {displayValue}
      </div>
    </div>
  );
};

export function FormDetailDialog({ submission, open, onClose, onApprove, onReject }: FormDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [detailSubmission, setDetailSubmission] = useState<FormSubmission>(submission);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Fetch full details when dialog opens
  useEffect(() => {
    if (open && submission.id) {
       // Reset to initial submission first
       setDetailSubmission(submission);
       setPdfBlob(null);
       
       const fetchDetails = async () => {
         setFetchingDetails(true);
         try {
           const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/pengajuan/${submission.id}`, {
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

       fetchDetails();
    }
  }, [open, submission.id]); 

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
      {/* UPDATE: Menggunakan rounded-lg (bukan 2xl) dan max-w-4xl agar lebih lebar & formal */}
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto p-0 rounded-lg gap-0">
        
        {/* HEADER SECTION */}
        <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">
                  Detail Permohonan Rekening
                </DialogTitle>
                <div className="flex flex-col text-sm text-gray-500">
                   <div className="flex items-center gap-2">
                     <span>Ref:</span>
                     <span className="font-mono font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">
                        {detailSubmission.referenceCode}
                     </span>
                   </div>
                </div>
              </div>

              {/* Status Badge: rounded-md agar lebih kotak/formal */}
              <Badge variant={status.variant} className={`${status.className} rounded-md text-xs px-3 py-1 shadow-sm`}>
                {status.label}
              </Badge>
            </div>

            {/* Sub-header info (Card Type & Savings Type) */}
            {(detailSubmission.cardType || detailSubmission.savingsType) && (
               <div className="flex items-center gap-4 mt-4 text-sm bg-blue-50/50 p-2 rounded-md border border-blue-100">
                  {detailSubmission.cardType && (
                    <div className="flex items-center gap-2 text-blue-800">
                      <CreditCard className="w-4 h-4" />
                      <span className="font-semibold">{detailSubmission.cardType}</span>
                    </div>
                  )}
                  {detailSubmission.savingsType && (
                    <>
                      <div className="h-4 w-px bg-blue-200"></div>
                      <div className="flex items-center gap-2 text-blue-800">
                        <Wallet className="w-4 h-4" />
                        <span className="font-semibold">{detailSubmission.savingsType}</span>
                      </div>
                    </>
                  )}
               </div>
            )}
          </DialogHeader>
        </div>

        {/* MAIN CONTENT */}
        <div className="p-6 space-y-8 bg-white">
          {fetchingDetails && (
             <div className="p-3 bg-blue-50 text-blue-700 rounded-md text-center text-sm border border-blue-100">
               Sedang memuat data lengkap...
             </div>
          )}

          {/* PERSONAL DATA */}
          <Section title="Data Pribadi" icon={<User className="w-5 h-5 text-gray-700" />}>
            <TwoCol>
              <Field label="Nama Lengkap" value={detailSubmission.personalData.fullName} />
              <Field label="Alias" value={detailSubmission.personalData.alias} />
              <Field label="Jenis Identitas" value={detailSubmission.personalData.identityType || "KTP"} />
              <Field label="NIK" value={detailSubmission.personalData.nik} />
              <Field label="Berlaku Sampai" value={detailSubmission.personalData.identityValidUntil} />
              <Field label="Email" icon={<Mail className="w-3 h-3" />} value={detailSubmission.personalData.email} />
              <Field label="No. Telepon" icon={<Phone className="w-3 h-3" />} value={detailSubmission.personalData.phone} />
              <Field label="Tempat, Tgl Lahir" icon={<Calendar className="w-3 h-3" />} value={`${detailSubmission.personalData.birthPlace || ''}, ${detailSubmission.personalData.birthDate}`} />
              <Field label="Jenis Kelamin" value={detailSubmission.personalData.gender} />
              <Field label="Status Pernikahan" value={detailSubmission.personalData.maritalStatus} />
              <Field label="Agama" value={detailSubmission.personalData.religion} />
              <Field label="Pendidikan" value={detailSubmission.personalData.education} />
              <Field label="Kewarganegaraan" value={detailSubmission.personalData.citizenship} />
              <Field label="Nama Ibu Kandung" value={detailSubmission.personalData.motherName} />
              <Field label="NPWP" value={detailSubmission.personalData.npwp} />
              <Field label="Status Rumah" value={detailSubmission.personalData.homeStatus} />
              <Field label="Tipe Nasabah" value={(() => {
                console.log("DETAIL:", detailSubmission.personalData.tipeNasabah);
                return detailSubmission.personalData.tipeNasabah === 'lama' ? 'Nasabah Lama' : 'Nasabah Baru';
              })()} />
              {detailSubmission.personalData.tipeNasabah === 'lama' && (
                <Field label="Nomor Rekening Lama" value={detailSubmission.personalData.nomorRekeningLama} />
              )}
            </TwoCol>
          </Section>

          {/* ADDRESS */}
          <Section title="Alamat" icon={<MapPin className="w-5 h-5 text-gray-700" />}>
            <TwoCol>
              <Field label="Alamat KTP" value={detailSubmission.personalData.address.street} />
              <Field label="Kode Pos" value={detailSubmission.personalData.address.postalCode} />
              {detailSubmission.personalData.address.domicile && (
                <Field label="Alamat Domisili" value={detailSubmission.personalData.address.domicile} />
              )}
            </TwoCol>
          </Section>

          {/* JOB INFO */}
          <Section
            title={detailSubmission.savingsType === 'SimPel' ? 'Sekolah & Pekerjaan' : 'Pekerjaan & Keuangan'}
            icon={<Briefcase className="w-5 h-5 text-gray-700" />}
          >
            <TwoCol>
              <Field label="Pekerjaan" value={detailSubmission.jobInfo.occupation} />
              <Field 
                label={detailSubmission.savingsType === 'SimPel' ? 'Nama Sekolah' : 'Nama Instansi'} 
                icon={<Building2 className="w-3 h-3" />}
                value={detailSubmission.jobInfo.workplace} 
              />
              <Field label="Bidang Usaha" value={detailSubmission.jobInfo.businessField} />
              <Field label="Jabatan" value={detailSubmission.jobInfo.position} />
              <Field label="Penghasilan" icon={<DollarSign className="w-3 h-3" />} value={detailSubmission.jobInfo.salaryRange} />
              <Field label="Sumber Dana" value={detailSubmission.jobInfo.incomeSource} />
              <Field label="Rata-rata Transaksi" icon={<DollarSign className="w-3 h-3" />} value={detailSubmission.jobInfo.averageTransaction} />
              <Field label="Tujuan Rekening" icon={<Target className="w-3 h-3" />} value={detailSubmission.jobInfo.accountPurpose} />
              <Field label="Alamat Kantor" value={detailSubmission.jobInfo.officeAddress} />
              <Field label="Telp Kantor" icon={<Phone className="w-3 h-3" />} value={detailSubmission.jobInfo.officePhone} />
            </TwoCol>
          </Section>

          {/* ACCOUNT INFO */}
          <Section title="Informasi Rekening" icon={<CreditCard className="w-5 h-5 text-gray-700" />}>
            <TwoCol>
              <Field label="Jenis Rekening" value={detailSubmission.accountInfo.accountType} />
              <Field label="Setoran Awal" icon={<DollarSign className="w-3 h-3" />} value={detailSubmission.accountInfo.initialDeposit} />
              <Field label="Jenis Kartu" value={detailSubmission.accountInfo.cardType} />
              <Field label="Rekening Untuk" value={detailSubmission.accountInfo.isForSelf ? 'Diri Sendiri' : 'Orang Lain'} />
            </TwoCol>
          </Section>

          {/* EMERGENCY CONTACT */}
          {detailSubmission.emergencyContact && (
             <Section title="Kontak Darurat" icon={<AlertCircle className="w-5 h-5 text-gray-700" />}>
               <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                 <TwoCol>
                   <Field label="Nama" value={detailSubmission.emergencyContact.name} />
                   <Field label="Nomor Telepon" icon={<Phone className="w-3 h-3" />} value={detailSubmission.emergencyContact.phone} />
                   <Field label="Alamat" icon={<MapPin className="w-3 h-3" />} value={detailSubmission.emergencyContact.address} />
                   <Field label="Hubungan" value={detailSubmission.emergencyContact.relationship} />
                 </TwoCol>
               </div>
             </Section>
          )}

          {/* BENEFICIAL OWNER - Formal Style Card */}
          {detailSubmission.beneficialOwner && (
            <Section title="Beneficial Owner" icon={<UserCheck className="w-5 h-5 text-gray-700" />}>
              <Card className="p-5 bg-white border border-gray-200 rounded-md shadow-sm">
                <TwoCol>
                  <Field label="Nama Lengkap" value={detailSubmission.beneficialOwner.name} />
                  <Field label="Alamat" value={detailSubmission.beneficialOwner.address} />
                  <Field label="Tempat Lahir" value={detailSubmission.beneficialOwner.birthPlace} />
                  <Field label="Tanggal Lahir" value={detailSubmission.beneficialOwner.birthDate} />
                  <Field label="Jenis Kelamin" value={detailSubmission.beneficialOwner.gender} />
                  <Field label="Kewarganegaraan" value={detailSubmission.beneficialOwner.citizenship} />
                  <Field label="Status Pernikahan" value={detailSubmission.beneficialOwner.maritalStatus} />
                  <Field label="Jenis Identitas" value={detailSubmission.beneficialOwner.identityType} />
                  <Field label="Nomor Identitas" value={detailSubmission.beneficialOwner.identityNumber} />
                  <Field label="Sumber Dana" value={detailSubmission.beneficialOwner.incomeSource} />
                  <Field label="Hubungan" value={detailSubmission.beneficialOwner.relationship} />
                  <Field label="Nomor HP" value={detailSubmission.beneficialOwner.phone} />
                  <Field label="Pekerjaan" value={detailSubmission.beneficialOwner.occupation} />
                  <Field label="Pendapatan Tahunan" value={detailSubmission.beneficialOwner.annualIncome} />
                </TwoCol>
              </Card>
            </Section>
          )}

          {/* OTHER BANKS */}
          {detailSubmission.eddBankLain && detailSubmission.eddBankLain.length > 0 && (
            <Section title="Rekening Bank Lain" icon={<CreditCard className="w-5 h-5 text-gray-700" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detailSubmission.eddBankLain.map((bank, idx) => (
                  <Card key={bank.id || idx} className="p-4 bg-white border border-gray-200 rounded-md shadow-sm hover:border-blue-300 transition-colors">
                    <div className="flex flex-col gap-2">
                       <h4 className="font-bold text-gray-800 text-sm border-b pb-1 mb-1">{bank.bank_name}</h4>
                       <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-xs text-gray-500 block">Jenis</span>
                            {bank.jenis_rekening}
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">No. Rek</span>
                            {bank.nomor_rekening}
                          </div>
                       </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Section>
          )}

          {/* OTHER JOBS */}
          {detailSubmission.eddPekerjaanLain && detailSubmission.eddPekerjaanLain.length > 0 && (
            <Section title="Pekerjaan Tambahan" icon={<Briefcase className="w-5 h-5 text-gray-700" />}>
               <div className="flex flex-wrap gap-3">
                 {detailSubmission.eddPekerjaanLain.map((job, idx) => (
                   <div key={job.id || idx} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium text-gray-700">
                      {job.jenis_usaha}
                   </div>
                 ))}
               </div>
            </Section>
          )}

          <Separator className="my-6" />

          {/* LOG & APPROVAL STATUS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-50 border-gray-200 rounded-md p-4 flex items-center gap-3">
                <div className="p-2 bg-white rounded-md border border-gray-200">
                  <Calendar className="w-4 h-4 text-gray-500" />
                </div>
                <div className="text-sm">
                   <span className="block text-gray-500 text-xs uppercase">Tanggal Pengajuan</span>
                   <span className="font-semibold text-gray-800">{detailSubmission.submittedAt}</span>
                </div>
              </Card>

              {detailSubmission.status === 'approved' && detailSubmission.approvedBy && (
                <Card className="bg-green-50 border-green-200 rounded-md p-4 flex items-center gap-3">
                   <div className="p-2 bg-white rounded-md border border-green-100">
                     <CheckCircle className="w-4 h-4 text-green-600" />
                   </div>
                   <div className="text-sm">
                      <span className="block text-green-700 text-xs uppercase">Disetujui Oleh</span>
                      <div className="font-semibold text-green-900">
                        {detailSubmission.approvedBy} 
                        {detailSubmission.approvedAt && <span className="font-normal text-xs ml-1">({detailSubmission.approvedAt})</span>}
                      </div>
                   </div>
                </Card>
              )}

              {detailSubmission.status === 'rejected' && detailSubmission.rejectedBy && (
                <Card className="bg-red-50 border-red-200 rounded-md p-4 flex items-center gap-3">
                   <div className="p-2 bg-white rounded-md border border-red-100">
                     <XCircle className="w-4 h-4 text-red-600" />
                   </div>
                   <div className="text-sm">
                      <span className="block text-red-700 text-xs uppercase">Ditolak Oleh</span>
                      <div className="font-semibold text-red-900">
                        {detailSubmission.rejectedBy}
                        {detailSubmission.rejectedAt && <span className="font-normal text-xs ml-1">({detailSubmission.rejectedAt})</span>}
                      </div>
                   </div>
                </Card>
              )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0 rounded-b-lg">
           <DialogFooter className="gap-3 sm:gap-2">
            <Button variant="outline" onClick={onClose} className="rounded-md border-gray-300 text-gray-700 hover:bg-white hover:text-gray-900">
              Tutup
            </Button>

            {/* Approved: PDF Button */}
            {detailSubmission.status === 'approved' && (
              <>
                {!pdfBlob ? (
                  <Button variant="outline" onClick={handleGeneratePdf} disabled={loading} className="rounded-md border-blue-600 text-blue-700 hover:bg-blue-50">
                    <FileText className="w-4 h-4 mr-2" />
                    {loading ? 'Memproses PDF...' : 'Generate PDF'}
                  </Button>
                ) : (
                  <a href={URL.createObjectURL(pdfBlob)} download={`Bukti-Pendaftaran-${detailSubmission.referenceCode}.pdf`} className="inline-flex">
                    <Button variant="default" className="rounded-md bg-blue-700 hover:bg-blue-800 text-white">
                      <FileText className="w-4 h-4 mr-2" />
                      Download Bukti PDF
                    </Button>
                  </a>
                )}
              </>
            )}

            {/* Pending: Actions */}
            {detailSubmission.status === 'pending' && (
              <>
                <Button variant="outline" onClick={onReject} className="rounded-md border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300">
                  <XCircle className="w-4 h-4 mr-2" />
                  Tolak
                </Button>
                <Button onClick={onApprove} className="rounded-md bg-green-700 hover:bg-green-800 text-white shadow-sm">
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