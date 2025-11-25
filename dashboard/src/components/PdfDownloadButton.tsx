import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { SubmissionPdf } from '../SubmissionPdf';
import type { FormSubmission } from '../DashboardPage';

interface PdfDownloadButtonProps {
  submission: FormSubmission;
  variant?: 'default' | 'outline';
}

export function PdfDownloadButton({ submission, variant = 'outline' }: PdfDownloadButtonProps) {
  return (
    <PDFDownloadLink
      document={<SubmissionPdf submission={submission} />}
      fileName={`Permohonan_${submission.referenceCode}.pdf`}
    >
      {({ loading }) => (
        <Button variant={variant} disabled={loading}>
          <Download className="w-4 h-4 mr-2" />
          {loading ? 'Mempersiapkan PDF...' : 'Download PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
