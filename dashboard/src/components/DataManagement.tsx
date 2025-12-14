import { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Database, 
  AlertCircle, 
  Loader2,
  FileText,
  Archive,
  Trash2,
  Calendar,
  Filter
} from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config/api';

interface DataManagementProps {
  onDataImported?: () => void;
  cabangList?: Array<{
    id: number;
    nama_cabang: string;
    is_active: boolean;
  }>;
  userRole?: string;
}

export default function DataManagement({ onDataImported, cabangList = [], userRole = 'admin' }: DataManagementProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedCabang, setSelectedCabang] = useState<number | 'all'>('all');
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [selectedBackupCabang, setSelectedBackupCabang] = useState<number | 'all'>('all');
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [selectedExcelCabang, setSelectedExcelCabang] = useState<number | 'all'>('all');
  const [excelFullData, setExcelFullData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export data sebagai Excel
  const handleExportExcel = async (fullData = false, cabangId?: number | 'all') => {
    setIsExporting(true);
    try {
      let url = `${API_BASE_URL}/api/pengajuan/export/excel`;
      
      // Add query parameters
      const params = new URLSearchParams();
      if (fullData) params.append('fullData', 'true');
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      if (cabangId && cabangId !== 'all') params.append('cabangId', cabangId.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
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
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Generate filename dengan timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const prefix = fullData ? 'full-data' : 'data-permohonan';
      link.download = `${prefix}-${timestamp}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`Data ${fullData ? 'lengkap' : ''} berhasil diekspor ke Excel`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal mengekspor data');
    } finally {
      setIsExporting(false);
    }
  };

  // Export data sebagai JSON backup
  const handleExportBackup = async (cabangId?: number | 'all') => {
    setIsExporting(true);
    try {
      let url = `${API_BASE_URL}/api/pengajuan/export/backup`;
      
      // Add query parameters
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      if (cabangId && cabangId !== 'all') params.append('cabangId', cabangId.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
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
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Generate filename dengan timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `backup-data-${timestamp}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Backup data berhasil dibuat');
    } catch (error) {
      console.error('Backup error:', error);
      toast.error('Gagal membuat backup data');
    } finally {
      setIsExporting(false);
    }
  };

  // Preview import data
  const handlePreviewImport = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsImporting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/pengajuan/import/preview`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menganalisis data');
      }

      const result = await response.json();
      setImportPreviewData(result.analysis);
      setSelectedFile(file);
      setShowImportPreview(true);

    } catch (error: any) {
      console.error('Preview error:', error);
      toast.error(error.message || 'Gagal menganalisis data');
    } finally {
      setIsImporting(false);
    }
  };

  // Import data dengan konfirmasi
  const handleImportConfirm = async (overwrite: boolean = false) => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('overwrite', overwrite.toString());

    setIsImporting(true);
    setImportProgress(0);
    setShowImportPreview(false);

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
      
      let successMessage = `Data berhasil diimpor: ${result.imported} baru`;
      if (result.overwritten > 0) {
        successMessage += `, ${result.overwritten} ditimpa`;
      }
      if (result.skipped > 0) {
        successMessage += `, ${result.skipped} dilewati`;
      }
      
      toast.success(successMessage, {
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
      setSelectedFile(null);
      setImportPreviewData(null);
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

      handlePreviewImport(file);
    }
  };

  // Show delete modal
  const handleDeleteClick = (status: 'all' | 'pending' | 'approved' | 'rejected') => {
    setDeleteStatus(status);
    setSelectedCabang('all');
    setShowDeleteModal(true);
  };

  // Delete data berdasarkan status dan cabang
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setShowDeleteModal(false);
    
    try {
      let url = `${API_BASE_URL}/api/pengajuan/delete/${deleteStatus}`;
      
      // Add cabang parameter for super admin
      if (userRole === 'super' && selectedCabang !== 'all') {
        url += `?cabangId=${selectedCabang}`;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus data');
      }

      const result = await response.json();
      
      toast.success(`Berhasil menghapus ${result.deletedCount} data`, {
        description: result.message
      });

      // Callback untuk refresh data
      if (onDataImported) {
        onDataImported();
      }

    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Gagal menghapus data');
    } finally {
      setIsDeleting(false);
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

      {/* Date Filter Section */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Filter className="w-6 h-6 text-purple-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">Filter Tanggal Export</h4>
                <p className="text-slate-600 text-sm">
                  Atur rentang tanggal untuk export data (opsional)
                </p>
              </div>
              <Button
                onClick={() => setShowDateFilter(!showDateFilter)}
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {showDateFilter ? 'Sembunyikan' : 'Tampilkan'} Filter
              </Button>
            </div>
            
            {showDateFilter && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-purple-200">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button
                    onClick={() => setDateRange({ startDate: '', endDate: '' })}
                    variant="outline"
                    size="sm"
                    className="text-slate-600 hover:bg-slate-50"
                  >
                    Reset Filter
                  </Button>
                </div>
              </div>
            )}
          </div>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-700">Export Excel</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (userRole === 'super') {
                        setExcelFullData(false);
                        setShowExcelModal(true);
                      } else {
                        handleExportExcel(false);
                      }
                    }}
                    disabled={isExporting}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    size="sm"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                    )}
                    Data Utama
                  </Button>
                  <Button
                    onClick={() => {
                      if (userRole === 'super') {
                        setExcelFullData(true);
                        setShowExcelModal(true);
                      } else {
                        handleExportExcel(true);
                      }
                    }}
                    disabled={isExporting}
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50 flex-1"
                    size="sm"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Database className="w-4 h-4 mr-2" />
                    )}
                    Data Lengkap
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-700">Backup JSON</p>
                <Button
                  onClick={() => {
                    if (userRole === 'super') {
                      setShowBackupModal(true);
                    } else {
                      handleExportBackup();
                    }
                  }}
                  disabled={isExporting}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50 w-full"
                  size="sm"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Archive className="w-4 h-4 mr-2" />
                  )}
                  Backup Lengkap
                </Button>
              </div>
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
              Unggah file untuk mengimpor data permohonan (JSON)
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

      {/* Delete Section */}
      <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-slate-900 mb-2">Hapus Data</h4>
            <p className="text-slate-600 text-sm mb-4">
              Hapus data permohonan berdasarkan status. <span className="font-semibold text-red-600">Tindakan ini tidak dapat dibatalkan!</span>
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={() => handleDeleteClick('pending')}
                disabled={isDeleting}
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
                size="sm"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Hapus Pending
              </Button>
              
              <Button
                onClick={() => handleDeleteClick('approved')}
                disabled={isDeleting}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
                size="sm"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Hapus Disetujui
              </Button>
              
              <Button
                onClick={() => handleDeleteClick('rejected')}
                disabled={isDeleting}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
                size="sm"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Hapus Ditolak
              </Button>
              
              <Button
                onClick={() => handleDeleteClick('all')}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Hapus Semua
              </Button>
            </div>
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
              <li>• Excel "Data Utama" berisi kolom penting, "Data Lengkap" berisi semua field</li>
              <li>• Import akan menambahkan data baru, tidak mengganti yang ada</li>
              <li>• Filter tanggal berlaku untuk semua jenis export</li>
              <li>• Fitur hapus data bersifat permanen dan tidak dapat dibatalkan</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-2xl max-w-md w-full mx-4 animate-in zoom-in duration-300">
            
            {/* Icon */}
            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-30" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-red-500 to-rose-500 text-white rounded-full flex items-center justify-center shadow-lg">
                <Trash2 className="w-8 h-8" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Konfirmasi Hapus Data
            </h2>

            {/* Content based on user role */}
            {userRole === 'super' ? (
              <div className="space-y-4">
                <p className="text-slate-600 text-sm mb-4">
                  Pilih cabang yang ingin dihapus data {deleteStatus === 'all' ? 'semua' : deleteStatus}nya:
                </p>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 text-left">
                    Pilih Cabang:
                  </label>
                  <select
                    value={selectedCabang}
                    onChange={(e) => setSelectedCabang(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="all">Semua Cabang</option>
                    {cabangList.map((cabang) => (
                      <option key={cabang.id} value={cabang.id}>
                        {cabang.nama_cabang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                  <p className="text-red-800 text-xs">
                    ⚠️ Tindakan ini akan menghapus data {deleteStatus === 'all' ? 'semua status' : `dengan status ${deleteStatus}`} 
                    {selectedCabang === 'all' ? ' dari semua cabang' : ` dari cabang yang dipilih`} dan tidak dapat dibatalkan!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-600 text-sm">
                  Apakah Anda yakin ingin menghapus data {deleteStatus === 'all' ? 'semua' : deleteStatus} dari cabang ini?
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-xs">
                    ⚠️ Tindakan ini akan menghapus data {deleteStatus === 'all' ? 'semua status' : `dengan status ${deleteStatus}`} 
                    dari cabang Anda dan tidak dapat dibatalkan!
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center mt-6">
              <Button
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-all"
              >
                Batal
              </Button>

              <Button
                onClick={handleDeleteConfirm}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white hover:opacity-90 font-semibold shadow-lg transition-all"
              >
                Ya, Hapus Data
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Import Preview Modal */}
      {showImportPreview && importPreviewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl max-w-2xl w-full mx-4 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Preview Import Data</h2>
                <p className="text-slate-600 text-sm">Analisis file yang akan diimpor</p>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{importPreviewData.totalRecords}</div>
                <div className="text-xs text-blue-700">Total Records</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{importPreviewData.newRecords.length}</div>
                <div className="text-xs text-green-700">Data Baru</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">{importPreviewData.existingRecords.length}</div>
                <div className="text-xs text-amber-700">Sudah Ada</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{importPreviewData.conflicts.length}</div>
                <div className="text-xs text-red-700">Konflik Status</div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Breakdown Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(importPreviewData.statusBreakdown).map(([status, count]) => (
                  <div key={status} className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-slate-900">{count as number}</div>
                    <div className="text-xs text-slate-600 capitalize">{status}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cabang Breakdown */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Breakdown Cabang</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(importPreviewData.cabangBreakdown).map(([cabang, count]) => (
                  <div key={cabang} className="bg-slate-50 rounded-lg p-3 flex justify-between">
                    <span className="text-slate-700">{cabang}</span>
                    <span className="font-semibold text-slate-900">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cross-Cabang Warning */}
            {importPreviewData.crossCabangWarnings && importPreviewData.crossCabangWarnings.length > 0 && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-amber-800 mb-2">🚫 Peringatan Cross-Cabang</h3>
                <p className="text-amber-700 text-sm mb-3">
                  Data berikut dari cabang lain akan dilewati (admin cabang hanya bisa import data cabang sendiri):
                </p>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {importPreviewData.crossCabangWarnings.slice(0, 5).map((warning: any, index: number) => (
                    <div key={index} className="bg-white rounded p-2 text-xs">
                      <div className="font-medium">{warning.nama_lengkap} ({warning.kode_referensi})</div>
                      <div className="text-slate-600">
                        Cabang {warning.originalCabang} → Akan dilewati
                      </div>
                    </div>
                  ))}
                  {importPreviewData.crossCabangWarnings.length > 5 && (
                    <div className="text-xs text-amber-600">
                      +{importPreviewData.crossCabangWarnings.length - 5} data lainnya akan dilewati
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Conflicts Warning */}
            {importPreviewData.conflicts.length > 0 && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ Konflik Status Terdeteksi</h3>
                <p className="text-red-700 text-sm mb-3">
                  Data berikut memiliki status berbeda dengan yang ada di database:
                </p>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {importPreviewData.conflicts.slice(0, 5).map((conflict: any, index: number) => (
                    <div key={index} className="bg-white rounded p-2 text-xs">
                      <div className="font-medium">{conflict.nama_lengkap} ({conflict.kode_referensi})</div>
                      <div className="text-slate-600">
                        {conflict.currentStatus} → {conflict.newStatus}
                      </div>
                    </div>
                  ))}
                  {importPreviewData.conflicts.length > 5 && (
                    <div className="text-xs text-red-600">
                      +{importPreviewData.conflicts.length - 5} konflik lainnya
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {importPreviewData.conflicts.length > 0 ? (
                <>
                  <Button
                    onClick={() => handleImportConfirm(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={isImporting}
                  >
                    {isImporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Import & Timpa Data yang Konflik
                  </Button>
                  <Button
                    onClick={() => handleImportConfirm(false)}
                    variant="outline"
                    className="w-full"
                    disabled={isImporting}
                  >
                    Import Hanya Data Baru (Skip Konflik)
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => handleImportConfirm(false)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Lanjutkan Import
                </Button>
              )}
              
              <Button
                onClick={() => {
                  setShowImportPreview(false);
                  setImportPreviewData(null);
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                variant="outline"
                className="w-full"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Backup Modal for Super Admin */}
      {showBackupModal && userRole === 'super' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 animate-in zoom-in duration-300">
            
            {/* Icon */}
            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse opacity-30" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg">
                <Archive className="w-8 h-8" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-slate-900 mb-3 text-center">
              Backup Data
            </h2>

            <div className="space-y-4">
              <p className="text-slate-600 text-sm text-center mb-4">
                Pilih cabang yang ingin di-backup:
              </p>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 text-left">
                  Pilih Cabang:
                </label>
                <select
                  value={selectedBackupCabang}
                  onChange={(e) => setSelectedBackupCabang(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">Semua Cabang</option>
                  {cabangList.map((cabang) => (
                    <option key={cabang.id} value={cabang.id}>
                      {cabang.nama_cabang}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                <p className="text-green-800 text-xs">
                  💾 Backup akan mencakup semua data permohonan 
                  {selectedBackupCabang === 'all' ? ' dari semua cabang' : ` dari cabang yang dipilih`}
                  {dateRange.startDate || dateRange.endDate ? ' sesuai filter tanggal' : ''}.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center mt-6">
              <Button
                onClick={() => {
                  setShowBackupModal(false);
                  setSelectedBackupCabang('all');
                }}
                variant="outline"
                className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-all"
              >
                Batal
              </Button>

              <Button
                onClick={() => {
                  handleExportBackup(selectedBackupCabang);
                  setShowBackupModal(false);
                  setSelectedBackupCabang('all');
                }}
                disabled={isExporting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:opacity-90 font-semibold shadow-lg transition-all"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Archive className="w-4 h-4 mr-2" />
                )}
                Backup Data
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Export Modal for Super Admin */}
      {showExcelModal && userRole === 'super' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 animate-in zoom-in duration-300">
            
            {/* Icon */}
            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse opacity-30" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-slate-900 mb-3 text-center">
              Export Excel
            </h2>

            <div className="space-y-4">
              <p className="text-slate-600 text-sm text-center mb-4">
                Pilih cabang yang ingin di-export ke Excel:
              </p>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 text-left">
                  Pilih Cabang:
                </label>
                <select
                  value={selectedExcelCabang}
                  onChange={(e) => setSelectedExcelCabang(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">Semua Cabang</option>
                  {cabangList.map((cabang) => (
                    <option key={cabang.id} value={cabang.id}>
                      {cabang.nama_cabang}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                <p className="text-green-800 text-xs">
                  📊 Export akan mencakup {excelFullData ? 'data lengkap' : 'data utama'} 
                  {selectedExcelCabang === 'all' ? ' dari semua cabang' : ` dari cabang yang dipilih`}
                  {dateRange.startDate || dateRange.endDate ? ' sesuai filter tanggal' : ''}.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center mt-6">
              <Button
                onClick={() => {
                  setShowExcelModal(false);
                  setSelectedExcelCabang('all');
                  setExcelFullData(false);
                }}
                variant="outline"
                className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-all"
              >
                Batal
              </Button>

              <Button
                onClick={() => {
                  handleExportExcel(excelFullData, selectedExcelCabang);
                  setShowExcelModal(false);
                  setSelectedExcelCabang('all');
                  setExcelFullData(false);
                }}
                disabled={isExporting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:opacity-90 font-semibold shadow-lg transition-all"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                )}
                Export Excel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}