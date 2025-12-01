// FormDetailDialog component – displays submission details and allows PDF export
import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { FormSubmission } from '../DashboardPage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
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
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  CreditCard,
  UserCheck,
  UserX,
  Building2,
  Target,
  Wallet,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

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
  <div>
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
);

const TwoCol = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-3 md:grid-cols-2 gap-6">{children}</div>
);

interface FieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}
const Field = ({ label, value, icon }: FieldProps) => (
  <div>
    <div className="text-sm text-gray-500 mb-1.5 flex items-center gap-1.5">
      {icon}
      {label}
    </div>
    <div className="text-gray-900 font-medium whitespace-pre-wrap break-words">
      {value || '-'}
    </div>
  </div>
);

interface ImageCardProps {
  label: string;
  src: string;
  onClick: () => void;
}
const ImageCard = ({ label, src, onClick }: ImageCardProps) => {
  const hasImage = src && src.trim() !== '';
  if (!hasImage) {
    return (
      <div>
        <div className="text-gray-500 mb-2 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          {label}
        </div>
        <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50 aspect-video flex items-center justify-center">
          <span className="text-gray-400 text-sm">Foto belum diupload</span>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="text-gray-500 mb-2 flex items-center gap-2">
        <ImageIcon className="w-4 h-4" />
        {label}
      </div>
      <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50 aspect-video group cursor-pointer" onClick={onClick}>
        <img src={src} alt={label} className="w-full h-full object-cover transition-all" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <span className="text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-lg">Lihat</span>
        </div>
      </div>
    </div>
  );
};

interface ImagePreviewModalProps {
  image: string | null;
  onClose: () => void;
}
const ImagePreviewModal = ({ image, onClose }: ImagePreviewModalProps) => {
  if (!image) return null;
  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]" onClick={onClose} onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="relative max-w-4xl max-h-[90vh] p-4" onClick={e => e.stopPropagation()}>
        <img src={image} alt="Preview" className="max-w-full max-h-[90vh] rounded-lg shadow-xl object-contain" />
        <button
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            onClose();
          }}
          className="absolute top-6 right-6 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition z-10 pointer-events-auto"
          aria-label="Close"
          type="button"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
  return createPortal(modalContent, document.body);
};

export function FormDetailDialog({ submission, open, onClose, onApprove, onReject }: FormDetailDialogProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const statusConfig = {
    pending: { label: 'Menunggu Review', variant: 'outline' as const, className: 'border-orange-500 text-orange-700 bg-orange-100' },
    approved: { label: 'Disetujui', variant: 'outline' as const, className: 'border-green-500 text-green-700 bg-green-100' },
    rejected: { label: 'Ditolak', variant: 'outline' as const, className: 'border-red-500 text-red-700 bg-red-100' },
  };
  const status = statusConfig[submission.status];

  const handleGeneratePdf = async () => {
    setLoading(true);
    const blob = await pdf(<SubmissionPdf submission={submission} />).toBlob();
    setPdfBlob(blob);
    setLoading(false);
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen && previewImage) return; // keep open while preview shown
    if (!isOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="w-2xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl">
        <div className="p-6">
          {/* HEADER */}
          <DialogHeader>
            <div className="flex items-start justify-between mb-4">
              <div>
                <DialogTitle className="text-2xl font-semibold max-w-[380px] leading-tight">
                  Detail Permohonan Pembukaan Rekening
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="space-y-1 mt-2">
                    <div className="text-gray-700">
                      Nomor Referensi:
                      <span className="font-mono text-emerald-700 ml-2">{submission.referenceCode}</span>
                    </div>
                    {submission.cardType && (
                      <div className="flex items-center gap-2 text-blue-600 mt-1">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-medium">Jenis Kartu: {submission.cardType}</span>
                      </div>
                    )}
                  </div>
                </DialogDescription>
              </div>
              <Badge variant={status.variant} className={`${status.className} text-sm px-4 py-1.5`}>
                {status.label}
              </Badge>
            </div>
          </DialogHeader>

          {/* MAIN CONTENT */}
          <div className="space-y-8">
            <Separator />
            {/* PERSONAL DATA */}
            <Section title="Data Pribadi" icon={<User className="w-5 h-5 text-blue-600" />}>
              <TwoCol>
                <Field label="Nama Lengkap" value={submission.personalData.fullName} />
                <Field label="NIK (16 Digit)" value={submission.personalData.nik} />
                <Field label="Email" icon={<Mail className="w-4 h-4 text-gray-400" />} value={submission.personalData.email} />
                <Field label="Nomor Telepon" icon={<Phone className="w-4 h-4 text-gray-400" />} value={submission.personalData.phone} />
                <Field label="Tanggal Lahir" icon={<Calendar className="w-4 h-4 text-gray-400" />} value={submission.personalData.birthDate} />
                {submission.personalData.gender && (
                  <Field label="Jenis Kelamin" value={submission.personalData.gender} />
                )}
                {submission.cardType !== 'Tabungan Simpel' && submission.personalData.maritalStatus && (
                  <Field label="Status Pernikahan" value={submission.personalData.maritalStatus} />
                )}
                {submission.personalData.citizenship && (
                  <Field label="Kewarganegaraan" value={submission.personalData.citizenship} />
                )}
                {submission.personalData.motherName && (
                  <Field label="Nama Ibu Kandung" value={submission.personalData.motherName} />
                )}
              </TwoCol>
            </Section>

            {/* ADDRESS */}
            <Section title="Alamat" icon={<MapPin className="w-5 h-5 text-blue-600" />}>
              <TwoCol>
                <Field label="Alamat Lengkap" value={submission.personalData.address.street} />
                <Field label="Provinsi" value={submission.personalData.address.province} />
                <Field label="Kota" value={submission.personalData.address.city} />
                <Field label="Kode Pos" value={submission.personalData.address.postalCode} />
              </TwoCol>
            </Section>

            <Separator />

            {/* JOB INFO */}
            <Section
              title={submission.cardType === 'Tabungan Simpel' ? 'Informasi Sekolah' : 'Informasi Pekerjaan'}
              icon={<Briefcase className="w-5 h-5 text-blue-600" />}
            >
              <TwoCol>
                <Field
                  label={submission.cardType === 'Tabungan Simpel' ? 'Status' : 'Status Pekerjaan'}
                  value={submission.jobInfo.occupation}
                />
                {submission.jobInfo.occupation !== 'tidak-bekerja' && (
                  <>
                    <Field
                      label={submission.cardType === 'Tabungan Simpel' ? 'Range Penghasilan Orang Tua' : 'Range Penghasilan'}
                      icon={<DollarSign className="w-4 h-4 text-gray-400" />}
                      value={submission.jobInfo.salaryRange}
                    />
                    {submission.jobInfo.workplace && (
                      <Field
                        label={submission.cardType === 'Tabungan Simpel' ? 'Nama Sekolah' : 'Nama Instansi/Perusahaan'}
                        icon={<Building2 className="w-4 h-4 text-gray-400" />}
                        value={submission.jobInfo.workplace}
                      />
                    )}
                  </>
                )}
                {submission.jobInfo.incomeSource && (
                  <Field label="Sumber Dana" icon={<Wallet className="w-4 h-4 text-gray-400" />} value={submission.jobInfo.incomeSource} />
                )}
                {submission.jobInfo.accountPurpose && (
                  <Field label="Tujuan Pembukaan Rekening" icon={<Target className="w-4 h-4 text-gray-400" />} value={submission.jobInfo.accountPurpose} />
                )}
              </TwoCol>
            </Section>

            <Separator />

            {/* EMERGENCY CONTACT */}
            {submission.emergencyContact && (
              <>
                <Section title="Kontak Darurat" icon={<AlertCircle className="w-5 h-5 text-blue-600" />}>
                  <TwoCol>
                    <Field label="Nama Kontak Darurat" value={submission.emergencyContact.name} />
                    <Field
                      label="Nomor Telepon Kontak Darurat"
                      icon={<Phone className="w-4 h-4 text-gray-400" />}
                      value={submission.emergencyContact.phone}
                    />
                  </TwoCol>
                </Section>
                <Separator />
              </>
            )}

            {/* DOCUMENTS */}
            <Section title="Dokumen" icon={<FileText className="w-5 h-5 text-blue-600" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageCard
                  label="Foto KTP"
                  src={submission.documents.ktpPhoto}
                  onClick={() => setPreviewImage(submission.documents.ktpPhoto)}
                />
              </div>
            </Section>

            <Separator />

            {/* DATA AGREEMENT */}
            {submission.dataAgreement !== undefined && (
              <Section title="Persetujuan Data" icon={<ShieldCheck className="w-5 h-5 text-blue-600" />}>
                <Card className={`p-3 ${submission.dataAgreement ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-4 h-4 ${submission.dataAgreement ? 'text-green-600' : 'text-yellow-600'}`} />
                    <span className={submission.dataAgreement ? 'text-green-700' : 'text-yellow-700'}>
                      {submission.dataAgreement
                        ? '✓ Menyetujui Syarat dan Ketentuan serta Kebijakan Privasi'
                        : '✗ Belum menyetujui Syarat dan Ketentuan'}
                    </span>
                  </div>
                </Card>
              </Section>
            )}

            {/* SUBMISSION INFO */}
            <Section title="Log Aktivitas" icon={<FileText className="w-5 h-5 text-blue-600" />}>
              <Card className="bg-blue-50 border-blue-100 p-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Tanggal Pengajuan: <strong className="ml-1">{submission.submittedAt}</strong>
                  </span>
                </div>
              </Card>
            </Section>

            {/* APPROVAL / REJECTION INFO */}
            {submission.status === 'approved' && submission.approvedBy && (
              <Card className="bg-green-50 border-green-200 p-3">
                <div className="flex items-center gap-2 text-green-700">
                  <UserCheck className="w-4 h-4" />
                  <span>
                    Diterima oleh: <strong className="ml-1">{submission.approvedBy}</strong>
                    {submission.approvedAt && (
                      <strong className="text-green-600 ml-2">({submission.approvedAt})</strong>
                    )}
                  </span>
                </div>
              </Card>
            )}
            {submission.status === 'rejected' && submission.rejectedBy && (
              <Card className="bg-red-50 border-red-200 p-3">
                <div className="flex items-center gap-2 text-red-700">
                  <UserX className="w-4 h-4" />
                  <span>
                    Ditolak oleh: <strong className="ml-1">{submission.rejectedBy}</strong>
                    {submission.rejectedAt && (
                      <span className="text-red-600 text-sm ml-2">{submission.rejectedAt}</span>
                    )}
                  </span>
                </div>
              </Card>
            )}
          </div>

          {/* FOOTER */}
          <DialogFooter className="mt-8 gap-2">
          <Button variant="outline" onClick={onClose}>Tutup</Button>

          {/* PDF hanya muncul kalau sudah approved */}
          {submission.status === 'approved' && (
            <>
              {!pdfBlob && (
                <Button variant="outline" onClick={handleGeneratePdf} disabled={loading} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  <FileText className="w-4 h-4 mr-2" />
                  {loading ? 'Generating PDF...' : 'Generate PDF'}
                </Button>
              )}
              {pdfBlob && (
                <a href={URL.createObjectURL(pdfBlob)} download={`Bukti-Pendaftaran-${submission.referenceCode}.pdf`}>
                  <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                    <FileText className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </a>
              )}
            </>
          )}

          {submission.status === 'pending' && (
            <>
              <Button variant="outline" onClick={onReject} className="text-red-600 border-red-300 hover:bg-red-50">
                <XCircle className="w-4 h-4 mr-2" />
                Tolak Permohonan
              </Button>
              <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Setujui Permohonan
              </Button>
            </>
          )}
        </DialogFooter>

        </div>
        {/* Image preview modal */}
        <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />
      </DialogContent>
    </Dialog>
  );
}