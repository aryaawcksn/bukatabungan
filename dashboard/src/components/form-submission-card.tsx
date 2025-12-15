import type { FormSubmission } from '../DashboardPage';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, CheckCircle, XCircle, Eye, CreditCard } from 'lucide-react';

interface FormSubmissionCardProps {
  submission: FormSubmission;
  viewMode: "vertical" | "horizontal";
  onViewDetails: () => void;
  onApprove: () => void;
  onReject: () => void;
}


export function FormSubmissionCard({
  submission,
  viewMode,
  onViewDetails,
  onApprove,
  onReject
}: FormSubmissionCardProps) {

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

  const statusKey = submission?.status ?? 'pending';
  const status = statusConfig[statusKey] || statusConfig.pending;

  return (
    <Card
  className={`hover:shadow-md transition-all duration-300 ${
    viewMode === "horizontal"
      ? "h-full"
      : ""
  }`}
>

      <CardContent className="p-6">
        <div
  className={`mb-4 ${
    viewMode === "horizontal"
      ? "flex flex-col gap-3"
      : "flex items-start justify-between"
  }`}
>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-900 mb-1">{submission.personalData.fullName}</h3>
              <div className="text-gray-500 mb-2">
                <p className="font-mono text-emerald-700">
                  {submission.referenceCode}
                </p>
                {submission.cardType && (
                  <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    {submission.cardType}
                  </p>
                )}
              </div>
              <Badge variant={status.variant} className={status.className}>
                {status.label}
              </Badge>
            </div>
          </div>
          <div className="text-gray-400">
            <Calendar className="w-4 h-4 inline mr-1" />
            {submission.submittedAt}
          </div>
        </div>

        <div
  className={`gap-4 mb-4 p-4 bg-gray-50 rounded-lg ${
    viewMode === "horizontal"
      ? "grid grid-cols-1 gap-3"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
  }`}
>

          <div className="flex items-start gap-2">
            <CreditCard className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-gray-500 text-xs">Jenis Tabungan</div>
              <div className="text-gray-900 text-sm font-medium">{submission.accountInfo.accountType || submission.savingsType}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-gray-500 text-xs">Kewarganegaraan</div>
              <div className="text-gray-900 text-sm font-mono">{submission.personalData.citizenship}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-gray-500 text-xs">Telepon</div>
              <div className="text-gray-900 text-sm">{submission.personalData.phone}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-gray-500 text-xs">Email</div>
              <div className="text-gray-900 text-sm truncate">{submission.personalData.email}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-gray-500 text-xs">Tipe Nasabah</div>
              <div className="text-gray-900 text-sm">
                {submission.personalData.tipeNasabah === 'lama' ? 'Nasabah Lama' : 'Nasabah Baru'}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-gray-500 text-xs">Rekening Untuk</div>
              <div
                  className={`text-sm font-medium ${
                    submission.accountInfo.isForSelf ? 'text-gray-900' : 'text-gray-900'
                  }`}
                >
                  {submission.accountInfo.isForSelf ? 'Diri Sendiri' : 'Orang Lain'}
                </div>

            </div>
          </div>
          
          {submission.accountInfo.initialDeposit && (
            <div className="flex items-start gap-2">
              <CreditCard className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-gray-500 text-xs">Setoran Awal</div>
                <div className="text-gray-900 text-sm font-medium">Rp {parseFloat(submission.accountInfo.initialDeposit).toLocaleString('id-ID')}</div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm truncate">{submission.personalData.birthPlace}</span>
          </div>
          <div className="flex items-center gap-4 text-xs flex-wrap">
            {submission.jobInfo.occupation && (
              <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                {submission.jobInfo.occupation}
              </span>
            )}
            
            {submission.eddBankLain && submission.eddBankLain.length > 0 && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {submission.eddBankLain.length} Bank Lain
              </span>
            )}
            {submission.eddPekerjaanLain && submission.eddPekerjaanLain.length > 0 && (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                {submission.eddPekerjaanLain.length} Pekerjaan Lain
              </span>
            )}
          </div>
        </div>

       <div
  className={`pt-4 border-t border-gray-200 gap-2 ${
    viewMode === "horizontal"
      ? "flex flex-col"
      : "flex items-center justify-end"
  }`}
>

          <Button variant="outline" onClick={onViewDetails}>
            <Eye className="w-4 h-4 mr-2" />
            Lihat Detail
          </Button>
          {submission.status === 'pending' && (
            <>
              <Button variant="outline" onClick={onReject} className="text-red-600 border-red-200 hover:bg-red-50">
                <XCircle className="w-4 h-4 mr-2" />
                Tolak
              </Button>
              <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Setujui
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}