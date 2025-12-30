import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { CheckCircle, XCircle, MessageCircle, Loader2, FileText, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface ApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (sendWhatsApp: boolean, message: string, notes: string) => Promise<void> | void;
  type: 'approve' | 'reject';
  applicantName: string;
  phone: string;
  referenceCode?: string;
}

// Default messages
const defaultApproveMessage = `Selamat! Permohonan pembukaan rekening tabungan Anda telah disetujui.\n\nSilakan kunjungi kantor cabang terdekat dengan membawa dokumen asli untuk proses aktivasi rekening.\n\nTerima kasih telah mempercayai layanan kami.`;

const getDefaultRejectMessage = (referenceCode?: string) => {
  const baseMessage = `Mohon maaf, permohonan pembukaan rekening tabungan Anda tidak dapat kami setujui saat ini.\n\nHal ini dikarenakan data atau dokumen yang Anda berikan belum memenuhi persyaratan.\n\nAnda dapat mengajukan permohonan kembali setelah melengkapi dokumen yang diperlukan.`;
  
  if (referenceCode) {
    return `${baseMessage}\n\nSelengkapnya dapat dilihat pada: bukatabungan.vercel.app/status/${referenceCode}`;
  }
  
  return baseMessage;
};

export function ApprovalDialog({
  open,
  onClose,
  onConfirm,
  type,
  applicantName,
  phone,
  referenceCode
}: ApprovalDialogProps) {
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  // Auto-check WhatsApp saat modal dibuka
  useEffect(() => {
    if (open) {
      setSendWhatsApp(true);
      setLoading(false);
      setNotes('');
      setIsMessageOpen(false);
      // Set message berdasarkan type
      setMessage(
        type === 'approve' 
          ? defaultApproveMessage 
          : getDefaultRejectMessage(referenceCode)
      );
    }
  }, [open, type, referenceCode]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(sendWhatsApp, message, notes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => !loading && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
          {/* Catatan Alasan */}
          <div>
            <Label htmlFor="notes" className="mb-2 block flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Catatan Alasan {type === 'approve' ? 'Persetujuan' : 'Penolakan'}
              {type === 'reject' && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                type === 'approve' 
                  ? 'Catatan tambahan untuk persetujuan (opsional)...'
                  : 'Jelaskan alasan penolakan (wajib diisi)...'
              }
              rows={5}
              className="resize-y min-h-[100px]"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              {type === 'approve' 
                ? 'Catatan ini akan tersimpan untuk referensi internal'
                : 'Catatan ini akan tersimpan dan dapat dilihat saat cek status'
              }
            </p>
          </div>

          {/* Pilihan Kirim Notifikasi */}
          <div className="space-y-4">
            <Label>Kirim Notifikasi Melalui:</Label>

            <div className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Checkbox
                id="whatsapp"
                checked={sendWhatsApp}
                onCheckedChange={(checked) => setSendWhatsApp(checked as boolean)}
                disabled={loading}
              />
              <div className="flex-1">
                <Label htmlFor="whatsapp" className="flex items-center gap-2 cursor-pointer">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span>WhatsApp</span>
                </Label>
                <p className="text-gray-500 ml-6">{phone}</p>
              </div>
            </div>

            {/* Collapsible Message Editor */}
            {sendWhatsApp && (
              <Collapsible open={isMessageOpen} onOpenChange={setIsMessageOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between" type="button">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span>Atur Pesan Notifikasi</span>
                    </div>
                    {isMessageOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  <Label htmlFor="message" className="text-sm">
                    Pesan yang akan dikirim:
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="resize-none text-sm"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">
                    Preview pesan yang akan dikirim ke WhatsApp nasabah
                  </p>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

          {/* Peringatan jika tidak ada metode dipilih */}
          {!sendWhatsApp && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-700">
                Peringatan: Tidak ada metode notifikasi yang dipilih. Pemohon tidak akan menerima pemberitahuan.
              </p>
            </div>
          )}

          {/* Peringatan jika reject tanpa catatan */}
          {type === 'reject' && !notes.trim() && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">
                Catatan alasan penolakan wajib diisi untuk dokumentasi dan transparansi.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            className={type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            disabled={loading || (type === 'reject' && !notes.trim())}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : type === 'approve' ? (
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
