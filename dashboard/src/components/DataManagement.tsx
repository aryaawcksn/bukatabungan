import { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Database, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  FileText,
  Archive
} from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config/api';

interface DataManagementProps {
  onDataImported?: () => void;
}

export default function DataManagement({ onDataImported }: DataManagementProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export data sebagai Excel
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/pengajuan/export/excel`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Gagal mengekspor data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename dengan timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `data-permohonan-${timestamp}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Data berhasil diekspor ke Excel');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal mengekspor data');
    } finally {
      setIsExporting(false);
    }
  };

  // Export data sebagai JSON backup
  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/pengajuan/export/backup`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Gagal membuat backup');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename dengan timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `backup-data-${timestamp}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Backup data berhasil dibuat');
    } catch (error) {
      console.error('Backup error:', error);
      toast.error('Gagal membuat backup data');
    } finally {
      setIsExporting(false);
    }
  };

  // Import data dari file
  const handleImport = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsImporting(true);
    setImportProgress(0);

    try {
      // Simulasi progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`${API_BASE_URL}/api/pengajuan/import`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengimpor data');
      }

      const result = await response.json();
      
      toast.success(`Data berhasil diimpor: ${result.imported} record`, {
        description: result.message
      });

      // Callback untuk refresh data
      if (onDataImported) {
        onDataImported();
      }

    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Gagal mengimpor data');
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validasi tipe file
      const allowedTypes = [
        'application/json',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error('Format file tidak didukung. Gunakan JSON, Excel, atau CSV');
        return;
      }

      // Validasi ukuran file (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Ukuran file terlalu besar. Maksimal 10MB');
        return;
      }

      handleImport(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <Database className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Olah Data</h3>
          <p className="text-slate-500 text-sm">Export, import, dan backup data permohonan</p>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-green-600" />
          </div>
          
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-slate-900 mb-2">Export Data</h4>
            <p className="text-slate-600 text-sm mb-4">
              Unduh data permohonan dalam berbagai format untuk analisis atau backup
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                )}
                Export Excel
              </Button>
              
              <Button
                onClick={handleExportBackup}
                disabled={isExporting}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Archive className="w-4 h-4 mr-2" />
                )}
                Backup JSON
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-slate-900 mb-2">Import Data</h4>
            <p className="text-slate-600 text-sm mb-4">
              Unggah file untuk mengimpor data permohonan (JSON, Excel, CSV)
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isImporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Pilih File
            </Button>
            
            {/* Progress Bar */}
            {isImporting && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                  <span>Mengimpor data...</span>
                  <span>{importProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-amber-800 font-medium mb-1">Catatan Penting:</p>
            <ul className="text-amber-700 space-y-1 text-xs">
              <li>• Format yang didukung: JSON, Excel (.xlsx, .xls), CSV</li>
              <li>• Ukuran file maksimal: 10MB</li>
              <li>• Backup JSON berisi data lengkap termasuk metadata</li>
              <li>• Excel export hanya berisi data utama untuk analisis</li>
              <li>• Import akan menambahkan data baru, tidak mengganti yang ada</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}