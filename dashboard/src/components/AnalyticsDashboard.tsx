import { memo, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { Calendar, TrendingUp, Users, CreditCard, MapPin, Clock } from 'lucide-react';
import type { FormSubmission } from '../DashboardPage';

interface AnalyticsDashboardProps {
  submissions: FormSubmission[];
  cabangList?: Array<{
    id: number;
    nama_cabang: string;
    is_active: boolean;
  }>;
}

const COLORS = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#06b6d4'
};

const AnalyticsDashboard = memo(({ submissions, cabangList = [] }: AnalyticsDashboardProps) => {
  // 1. Status Distribution Data
  const statusData = useMemo(() => {
    const counts = submissions.reduce((acc, sub) => {
      acc[sub.status] = (acc[sub.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Menunggu', value: counts.pending || 0, color: COLORS.pending },
      { name: 'Disetujui', value: counts.approved || 0, color: COLORS.approved },
      { name: 'Ditolak', value: counts.rejected || 0, color: COLORS.rejected }
    ];
  }, [submissions]);

  // Helper function to parse date from submittedAt
  const parseSubmissionDate = (submittedAt: string) => {
    try {
      // Format: "13/12/2024, 10:30" atau "13/12/2024 10:30"
      const dateStr = submittedAt.split(/[, ]/)[0]; // Ambil bagian tanggal saja
      const [day, month, year] = dateStr.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } catch (error) {
      console.warn('Error parsing date:', submittedAt, error);
      return new Date(0);
    }
  };

  // 2. Daily Trend Data (Last 7 days)
  const dailyTrendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map(date => {
      const daySubmissions = submissions.filter(sub => {
        const subDate = parseSubmissionDate(sub.submittedAt);
        return subDate.getFullYear() === date.getFullYear() &&
               subDate.getMonth() === date.getMonth() &&
               subDate.getDate() === date.getDate();
      });
      
      return {
        date: date.toLocaleDateString('id-ID', { 
          weekday: 'short', 
          day: 'numeric' 
        }),
        total: daySubmissions.length,
        approved: daySubmissions.filter(s => s.status === 'approved').length,
        pending: daySubmissions.filter(s => s.status === 'pending').length,
        rejected: daySubmissions.filter(s => s.status === 'rejected').length
      };
    });
  }, [submissions]);

  // 3. Account Type Distribution (Jenis Rekening)
  const cardTypeData = useMemo(() => {
    const counts = submissions.reduce((acc, sub) => {
      // Prioritas: savingsType > accountType > cardType
      let accountType = sub.savingsType || sub.accountInfo?.accountType || sub.cardType || 'Lainnya';
      
      // Mapping untuk nama yang lebih user-friendly
      const typeMapping: Record<string, string> = {
        'simpel': 'Tabungan Simpel',
        'mutiara': 'Tabungan Mutiara',
        'bisnis': 'Tabungan Bisnis',
        'individu': 'Tabungan Individu',
        'promosi': 'Tabungan Promosi',
        'silver': 'Kartu Debit Silver',
        'gold': 'Kartu Debit Gold',
        'platinum': 'Kartu Debit Platinum'
      };
      
      // Normalize dan map
      const normalizedType = accountType.toLowerCase().trim();
      const mappedType = typeMapping[normalizedType] || accountType;
      
      acc[mappedType] = (acc[mappedType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6
  }, [submissions]);

  // 4. Branch Distribution - Role-based access
  const branchData = useMemo(() => {
    // Jika cabangList tersedia, gunakan data cabang yang sesuai role
    if (cabangList && cabangList.length > 0) {
      return cabangList.map(cabang => {
        // Hitung permohonan untuk cabang ini
        const count = submissions.filter(sub => 
          sub.cabangName === cabang.nama_cabang || 
          sub.cabangId === cabang.id.toString()
        ).length;
        
        return {
          name: cabang.nama_cabang,
          value: count,
          isActive: cabang.is_active
        };
      }).sort((a, b) => b.value - a.value);
    }
    
    // Fallback ke logic lama jika cabangList tidak tersedia
    const counts = submissions.reduce((acc, sub) => {
      const branch = sub.cabangName || 'Tidak Diketahui';
      acc[branch] = (acc[branch] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, isActive: true }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 jika tidak ada cabangList
  }, [submissions, cabangList]);

  // 5. Age Demographics
  const ageData = useMemo(() => {
    const ageGroups = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '55+': 0
    };

    submissions.forEach(sub => {
      if (sub.personalData.birthDate && sub.personalData.birthDate.trim() !== '') {
        try {
          // Parse tanggal lahir dengan format DD/MM/YYYY
          const birthDateStr = sub.personalData.birthDate.trim();
          let birthYear: number;
          
          if (birthDateStr.includes('/')) {
            const parts = birthDateStr.split('/');
            birthYear = parseInt(parts[2]); // year is the third part
          } else {
            // Jika format lain, coba parse langsung
            birthYear = new Date(birthDateStr).getFullYear();
          }
          
          // Validasi tahun yang masuk akal
          if (birthYear > 1900 && birthYear <= new Date().getFullYear()) {
            const age = new Date().getFullYear() - birthYear;
            
            console.log(`Birth date: ${birthDateStr}, Birth year: ${birthYear}, Age: ${age}`); // Debug log
            
            if (age >= 18 && age <= 25) ageGroups['18-25']++;
            else if (age >= 26 && age <= 35) ageGroups['26-35']++;
            else if (age >= 36 && age <= 45) ageGroups['36-45']++;
            else if (age >= 46 && age <= 55) ageGroups['46-55']++;
            else if (age > 55) ageGroups['55+']++;
          } else {
            console.warn(`Invalid birth year: ${birthYear} from ${birthDateStr}`);
          }
        } catch (error) {
          console.warn(`Error parsing birth date: ${sub.personalData.birthDate}`, error);
        }
      }
    });

    console.log('Age groups:', ageGroups); // Debug log
    return Object.entries(ageGroups).map(([name, value]) => ({ name, value }));
  }, [submissions]);

  // 6. Salary Range Distribution
  const salaryData = useMemo(() => {
    const counts = submissions.reduce((acc, sub) => {
      let salary = sub.jobInfo?.salaryRange;
      
      // Jika salary kosong atau null, coba ambil dari field lain
      if (!salary || salary.trim() === '') {
        salary = 'Tidak Diketahui';
      }
      
      // Clean up salary text
      const cleanSalary = salary.replace(/^Rp\s*/, '').trim();
      
      acc[cleanSalary] = (acc[cleanSalary] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);



    console.log('Salary raw data sample:', submissions.slice(0, 3).map(s => ({ 
      id: s.id, 
      salary: s.jobInfo?.salaryRange,
      rawJobInfo: s.jobInfo 
    })));
    console.log('Salary counts:', counts); // Debug log
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [submissions]);

  if (submissions.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="h-32 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Status Overview & Daily Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Status Permohonan</h3>
              <p className="text-sm text-slate-500">Distribusi status saat ini</p>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value, 'Jumlah']}
                  labelStyle={{ color: '#1e293b' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-center gap-4 mt-4">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Trend */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Trend 7 Hari</h3>
              <p className="text-sm text-slate-500">Permohonan harian</p>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="approved"
                  stroke={COLORS.approved}
                  strokeWidth={2}
                  dot={{ fill: COLORS.approved, strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="rejected"
                  stroke={COLORS.rejected}
                  strokeWidth={2}
                  dot={{ fill: COLORS.rejected, strokeWidth: 2, r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Card Types & Branches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Type Distribution */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Jenis Kartu</h3>
              <p className="text-sm text-slate-500">Distribusi produk</p>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cardTypeData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  width={100}
                />
                <Tooltip 
                  formatter={(value) => [value, 'Jumlah']}
                  labelStyle={{ color: '#1e293b' }}
                />
                <Bar 
                  dataKey="value" 
                  fill={COLORS.secondary}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch Distribution */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Distribusi Cabang</h3>
              <p className="text-sm text-slate-500">Permohonan per cabang</p>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip 
                  formatter={(value, _name, props) => {
                    const isActive = props.payload?.isActive;
                    const status = isActive ? 'Aktif' : 'Tidak Aktif';
                    return [
                      `${value} permohonan`,
                      `Status: ${status}`
                    ];
                  }}
                  labelStyle={{ color: '#1e293b' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                >
                  {branchData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isActive ? COLORS.accent : '#94a3b8'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend untuk status cabang */}
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS.accent }}
              ></div>
              <span className="text-sm text-slate-600">Cabang Aktif</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full bg-slate-400"
              ></div>
              <span className="text-sm text-slate-600">Cabang Tidak Aktif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Demographics */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Kelompok Usia</h3>
              <p className="text-sm text-slate-500">Demografi nasabah</p>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip 
                  formatter={(value) => [value, 'Jumlah']}
                  labelStyle={{ color: '#1e293b' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salary Range */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Range Penghasilan</h3>
              <p className="text-sm text-slate-500">Distribusi income</p>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  width={120}
                />
                <Tooltip 
                  formatter={(value) => [value, 'Jumlah']}
                  labelStyle={{ color: '#1e293b' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#22c55e"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
});

AnalyticsDashboard.displayName = 'AnalyticsDashboard';

export default AnalyticsDashboard;