import { memo, useMemo } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { FormSubmission } from '../DashboardPage';

interface QuickStatsProps {
  submissions: FormSubmission[];
}

const QuickStats = memo(({ submissions }: QuickStatsProps) => {
  const stats = useMemo(() => {
    const now = new Date();
    // const today = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }); // Not used anymore
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Helper function to parse date from submittedAt
          const parseSubmissionDate = (submittedAt: string) => {
        try {
          const cleaned = submittedAt.replace(',', '');
          const [datePart, timePart] = cleaned.split(' ');
          const [d, m, y] = datePart.split('/').map(Number);
          const [hh = 0, mm = 0] = (timePart || '').split(':').map(Number);

          return new Date(y, m - 1, d, hh, mm);
        } catch {
          return new Date(0);
        }
      };

    
    // Today's stats
    const todaySubmissions = submissions.filter(sub => {
      const subDate = parseSubmissionDate(sub.submittedAt);
      const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return subDate.getTime() >= todayDate.getTime() && 
             subDate.getTime() < todayDate.getTime() + 24 * 60 * 60 * 1000;
    });
    
    // This week's stats
    const weekSubmissions = submissions.filter(sub => {
      const subDate = parseSubmissionDate(sub.submittedAt);
      return subDate >= thisWeek && subDate <= now;
    });
    
    // This month's stats
    const monthSubmissions = submissions.filter(sub => {
      const subDate = parseSubmissionDate(sub.submittedAt);
      return subDate >= thisMonth && subDate <= now;
    });
    
    // Pending that need attention (older than 24 hours)
    const urgentPending = submissions.filter(sub => {
      if (sub.status !== 'pending') return false;
      const subDate = parseSubmissionDate(sub.submittedAt);
      const hoursDiff = (now.getTime() - subDate.getTime()) / (1000 * 60 * 60);
      return hoursDiff > 24;
    });
    
    return {
      today: {
        total: todaySubmissions.length,
        approved: todaySubmissions.filter(s => s.status === 'approved').length,
        pending: todaySubmissions.filter(s => s.status === 'pending').length
      },
      week: {
        total: weekSubmissions.length,
        approved: weekSubmissions.filter(s => s.status === 'approved').length,
        avgPerDay: Math.round(weekSubmissions.length / 7)
      },
      month: {
        total: monthSubmissions.length,
        approved: monthSubmissions.filter(s => s.status === 'approved').length,
        approvalRate: monthSubmissions.length > 0 ? 
          Math.round((monthSubmissions.filter(s => s.status === 'approved').length / monthSubmissions.filter(s => s.status !== 'pending').length) * 100) : 0
      },
      urgent: urgentPending.length
    };
  }, [submissions]);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200 mb-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-600" />
        Ringkasan Cepat
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Hari Ini</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-slate-900">{stats.today.total}</p>
            <div className="flex gap-3 text-xs">
              <span className="text-emerald-600">✓ {stats.today.approved}</span>
              <span className="text-amber-600">⏳ {stats.today.pending}</span>
            </div>
          </div>
        </div>

        {/* This Week */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Minggu Ini</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-slate-900">{stats.week.total}</p>
            <div className="flex gap-3 text-xs">
              <span className="text-emerald-600">✓ {stats.week.approved}</span>
              <span className="text-slate-500">~{stats.week.avgPerDay}/hari</span>
            </div>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Bulan Ini</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-slate-900">{stats.month.total}</p>
            <div className="flex gap-3 text-xs">
              <span className="text-emerald-600">✓ {stats.month.approved}</span>
              <span className="text-slate-500">{stats.month.approvalRate}% rate</span>
            </div>
          </div>
        </div>

        {/* Urgent */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Perlu Perhatian</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-slate-900">{stats.urgent}</p>
            <div className="text-xs">
              <span className="text-red-600">⚠️ {'>'}24 jam</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

QuickStats.displayName = 'QuickStats';

export default QuickStats;