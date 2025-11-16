import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { CheckCircle, XCircle, Mail, MessageCircle } from 'lucide-react';

interface ApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (sendEmail: boolean, sendWhatsApp: boolean, message: string) => void;
  type: 'approve' | 'reject';
  applicantName: string;
  email: string;
  phone: string;
}

// Default messages (outside component to avoid re-creation)
const defaultApproveMessage = `Selamat! Permohonan pembukaan rekening tabungan Anda telah disetujui.\n\nSilakan kunjungi kantor cabang terdekat dengan membawa dokumen asli untuk proses aktivasi rekening.\n\nTerima kasih telah mempercayai layanan kami.`;
const defaultRejectMessage = `Mohon maaf, permohonan pembukaan rekening tabungan Anda tidak dapat kami setujui saat ini.\n\nHal ini dikarenakan data atau dokumen yang Anda berikan belum memenuhi persyaratan.\n\nAnda dapat mengajukan permohonan kembali setelah melengkapi dokumen yang diperlukan.`;

export function ApprovalDialog({
  open,
  onClose,
  onConfirm,
  type,
  applicantName,
  email,
  phone
}: ApprovalDialogProps) {
  const [sendEmail, setSendEmail] = useState(true);
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  
  const [message, setMessage] = useState(
    type === 'approve' ? defaultApproveMessage : defaultRejectMessage
  );

  // Update message when type changes
  useEffect(() => {
    setMessage(type === 'approve' ? defaultApproveMessage : defaultRejectMessage);
  }, [type]);

  const handleConfirm = () => {
    onConfirm(sendEmail, sendWhatsApp, message);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {type === 'approve' ? (
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            )}
            <div>
              <DialogTitle>
                {type === 'approve' ? 'Setujui Permohonan' : 'Tolak Permohonan'}
              </DialogTitle>
              <DialogDescription>
                Konfirmasi {type === 'approve' ? 'persetujuan' : 'penolakan'} untuk {applicantName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Message */}
          <div>
            <Label htmlFor="message" className="mb-2 block">
              Pesan Notifikasi
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          {/* Send Options */}
          <div className="space-y-4">
            <Label>Kirim Notifikasi Melalui:</Label>
            
            <div className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Checkbox
                id="email"
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Email</span>
                </Label>
                <p className="text-gray-500 ml-6">{email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Checkbox
                id="whatsapp"
                checked={sendWhatsApp}
                onCheckedChange={(checked) => setSendWhatsApp(checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="whatsapp" className="flex items-center gap-2 cursor-pointer">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span>WhatsApp</span>
                </Label>
                <p className="text-gray-500 ml-6">{phone}</p>
              </div>
            </div>
          </div>

          {!sendEmail && !sendWhatsApp && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-700">
                Peringatan: Tidak ada metode notifikasi yang dipilih. Pemohon tidak akan menerima pemberitahuan.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            className={type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {type === 'approve' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Konfirmasi Persetujuan
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Konfirmasi Penolakan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
