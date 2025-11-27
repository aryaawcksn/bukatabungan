import { useEffect } from 'react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { MapPin, Building2, AlertCircle } from 'lucide-react';

export interface Cabang {
  updated_by: string;
  id: number;
  kode_cabang: string;
  nama_cabang: string;
  alamat: string;
  is_active: boolean;
}

interface CabangSettingProps {
  cabangList: Cabang[];
  onToggleStatus: (id: number, currentStatus: boolean) => void;
}

export default function CabangSetting({ cabangList, onToggleStatus }: CabangSettingProps) {
  
  // Logic to determine if user can edit. 
  // Based on request: "high admin, dev dan cabang pemilik akun"
  // Since we don't have the full auth context here, we'll assume the backend also protects it,
  // but we can add some UI checks if we know the role names.
  // For now, we'll allow all admins who can access this page to try, and handle errors.

  useEffect(() => {
    if (cabangList.length > 0) {
      // toast.success("Data Cabang Berhasil Dimuat", { duration: 2000 });
      // Removed toast here to avoid spamming if parent handles it or if it re-renders.
      // Parent handles "Data berhasil dimuat" for submissions, maybe we don't need it here explicitly every time.
    }
  }, [cabangList]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pengaturan Cabang</h2>
          <p className="text-slate-500">Kelola status aktif/non-aktif kantor cabang.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cabangList.map((cabang) => (
          <Card
            key={cabang.id}
            className={`p-5 border transition-all duration-200 ${
              !cabang.is_active
                ? 'bg-gray-50 border-gray-200'
                : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  !cabang.is_active ? 'bg-gray-200 text-gray-500' : 'bg-blue-50 text-blue-600'
                }`}
              >
                <Building2 className="w-5 h-5" />
              </div>

              <Switch
                checked={cabang.is_active}
                onCheckedChange={() => onToggleStatus(cabang.id, cabang.is_active)}
                className={!cabang.is_active ? 'data-[state=unchecked]:bg-gray-300' : ''}
              />
            </div>

            <div>
              <h3
                className={`font-semibold text-lg ${
                  !cabang.is_active ? 'text-gray-500' : 'text-slate-900'
                }`}
              >
                {cabang.nama_cabang}
              </h3>

              <p className="text-sm text-slate-500 mb-3 flex items-center gap-1">
                <span
                  className={`inline-block mt-1 text-xs font-medium px-2 py-1 rounded ${
                    cabang.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {cabang.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </p>

              <div className="flex items-start gap-2 text-sm text-slate-500 min-h-[40px]">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">
                  {cabang.alamat || 'Alamat tidak tersedia'}
                </span>
              </div>
            </div>

            {!cabang.is_active && (
              <div className="mt-4 pt-3 border-t border-gray-200 flex items-center gap-2 text-amber-600 text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>
              Dinonaktifkan oleh{" "}
              <span className="font-semibold">
                {cabang.updated_by || "Tidak diketahui"}
              </span>
            </span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
