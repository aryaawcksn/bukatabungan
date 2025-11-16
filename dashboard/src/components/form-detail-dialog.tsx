import type { FormSubmission } from '../DashboardPage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  User, Mail, Phone, Calendar, MapPin, Briefcase, DollarSign, 
  FileText, Image as ImageIcon, CheckCircle, XCircle, CreditCard 
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FormDetailDialogProps {
  submission: FormSubmission;
  open: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export function FormDetailDialog({
  submission,
  open,
  onClose,
  onApprove,
  onReject
}: FormDetailDialogProps) {
  const statusConfig = {
    pending: {
      label: 'Menunggu Review',
      variant: 'outline' as const,
      className: 'border-orange-200 text-orange-700 bg-orange-50'
    },
    approved: {
      label: 'Disetujui',
      variant: 'outline' as const,
      className: 'border-green-200 text-green-700 bg-green-50'
    },
    rejected: {
      label: 'Ditolak',
      variant: 'outline' as const,
      className: 'border-red-200 text-red-700 bg-red-50'
    }
  };

  const status = statusConfig[submission.status];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>Detail Permohonan Pembukaan Rekening</DialogTitle>
              <DialogDescription>
                <div className="space-y-1">
                  <div>
                    Nomor Referensi: 
                    <span className="font-mono text-emerald-700 ml-2">{submission.referenceCode}</span>
                  </div>
                  {submission.cardType && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <CreditCard className="w-4 h-4" />
                      <span className="font-medium">Jenis Kartu: {submission.cardType}</span>
                    </div>
                  )}
                </div>
              </DialogDescription>
            </div>
            <Badge variant={status.variant} className={status.className}>
              {status.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Data */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-gray-900">Data Pribadi</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-gray-500 mb-1">Nama Lengkap</div>
                <div className="text-gray-900">{submission.personalData.fullName}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">NIK (16 Digit)</div>
                <div className="text-gray-900">{submission.personalData.nik}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Email</div>
                <div className="text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {submission.personalData.email}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Nomor Telepon</div>
                <div className="text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {submission.personalData.phone}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Tanggal Lahir</div>
                <div className="text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {submission.personalData.birthDate}
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="text-gray-900">Alamat</h3>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div>
                <div className="text-gray-500 mb-1">Alamat Lengkap</div>
                <div className="text-gray-900">{submission.personalData.address.street}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-gray-500 mb-1">Provinsi</div>
                  <div className="text-gray-900">{submission.personalData.address.province}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Kota</div>
                  <div className="text-gray-900">{submission.personalData.address.city}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Kode Pos</div>
                  <div className="text-gray-900">{submission.personalData.address.postalCode}</div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Job Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h3 className="text-gray-900">Informasi Pekerjaan</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-gray-500 mb-1">Pekerjaan</div>
                <div className="text-gray-900">{submission.jobInfo.occupation}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Range Penghasilan</div>
                <div className="text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  {submission.jobInfo.salaryRange}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Documents */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-gray-900">Dokumen</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-gray-500 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Foto KTP
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 aspect-video">
                  <ImageWithFallback
                    src={submission.documents.ktpPhoto}
                    alt="Foto KTP"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Foto Selfie dengan KTP
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 aspect-video">
                  <ImageWithFallback
                    src={submission.documents.selfiePhoto}
                    alt="Foto Selfie dengan KTP"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Submission Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Tanggal Pengajuan: <strong>{submission.submittedAt}</strong></span>
            </div>
          </div>
        </div>

        {submission.status === 'pending' && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
            <Button variant="outline" onClick={onReject} className="text-red-600 border-red-200 hover:bg-red-50">
              <XCircle className="w-4 h-4 mr-2" />
              Tolak Permohonan
            </Button>
            <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Setujui Permohonan
            </Button>
          </DialogFooter>
        )}

        {submission.status !== 'pending' && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}