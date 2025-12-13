import { memo, useMemo } from 'react';
import { TrendingUp, TrendingDown, Clock, Target, Users, Zap } from 'lucide-react';
import type { FormSubmission } from '../DashboardPage';

interface InsightCardsProps {
  submissions: FormSubmission[];
}

const InsightCards = memo(({ submissions }: InsightCardsProps) => {
  const insights = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
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

    const parseSubmissionDateTime = (submittedAt: string) => {
      try {
        // Format: "13/12/2024, 10:30" atau "13/12/2024 10:30"
        const parts = submittedAt.split(/[, ]/);
        const dateStr = parts[0];
        const timeStr = parts[1] || '00:00';
        const [day, month, year] = dateStr.split('/');
        const [hour, minute] = timeStr.split(':');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
      } catch (error) {
        console.warn('Error parsing datetime:', submittedAt, error);
        return new Date(0);
      }
    };
    
    // Today's submissions
    const todaySubmissions = submissions.filter(sub => {
      const subDate = parseSubmissionDate(sub.submittedAt);
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      return subDate.getTime() >= todayDate.getTime() && 
             subDate.getTime() < todayDate.getTime() + 24 * 60 * 60 * 1000;
    });
    
    // Yesterday's submissions
    const yesterdaySubmissions = submissions.filter(sub => {
      const subDate = parseSubmissionDate(sub.submittedAt);
      const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      return subDate.getTime() >= yesterdayDate.getTime() && 
             subDate.getTime() < yesterdayDate.getTime() + 24 * 60 * 60 * 1000;
    });
    
    // Approval rate
    const approvedCount = submissions.filter(s => s.status === 'approved').length;
    const totalProcessed = submissions.filter(s => s.status !== 'pending').length;
    const approvalRate = totalProcessed > 0 ? (approvedCount / totalProcessed) * 100 : 0;
    
    // Average processing time (mock calculation)
    const avgProcessingTime = submissions.filter(s => s.status !== 'pending').length > 0 ? 
      Math.round(Math.random() * 24 + 12) : 0; // Mock: 12-36 hours
    
    // Peak hour analysis - perbaiki parsing jam
    const hourCounts = submissions.reduce((acc, sub) => {
      const dateTime = parseSubmissionDateTime(sub.submittedAt);
      const hour = dateTime.getHours();
      if (!isNaN(hour)) {
        acc[hour] = (acc[hour] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);
    
    const peakHourEntry = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)[0];
    const peakHour = peakHourEntry ? peakHourEntry[0] : '10';
    
    // Growth calculation
    const growthRate = yesterdaySubmissions.length > 0 ? 
      ((todaySubmissions.length - yesterdaySubmissions.length) / yesterdaySubmissions.length) * 100 : 
      todaySubmissions.length > 0 ? 100 : 0;
    
    return [
      {
        title: 'Permohonan Hari Ini',
        value: todaySubmissions.length,
        change: growthRate,
        changeText: `${Math.abs(growthRate).toFixed(1)}% dari kemarin`,
        icon: Users,
        color: 'blue',
        isPositive: growthRate >= 0
      },
      {
        title: 'Tingkat Persetujuan',
        value: `${approvalRate.toFixed(1)}%`,
        change: approvalRate >= 85 ? 5 : -2,
        changeText: approvalRate >= 85 ? 'Target tercapai' : 'Perlu ditingkatkan',
        icon: Target,
        color: 'green',
        isPositive: approvalRate >= 85
      },
      {
        title: 'Rata-rata Proses',
        value: `${avgProcessingTime}h`,
        change: -8,
        changeText: '8% lebih cepat',
        icon: Clock,
        color: 'purple',
        isPositive: true
      },
      {
        title: 'Jam Puncak',
        value: `${peakHour}:00`,
        change: 0,
        changeText: 'Waktu tersibuk',
        icon: Zap,
        color: 'orange',
        isPositive: true
      }
    ];
  }, [submissions]);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        border: 'border-blue-200'
      },
      green: {
        bg: 'bg-emerald-50',
        icon: 'text-emerald-600',
        border: 'border-emerald-200'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'text-purple-600',
        border: 'border-purple-200'
      },
      orange: {
        bg: 'bg-orange-50',
        icon: 'text-orange-600',
        border: 'border-orange-200'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {insights.map((insight, index) => {
        const colorClasses = getColorClasses(insight.color);
        const Icon = insight.icon;
        
        return (
          <div
            key={index}
            className={`bg-white rounded-xl p-5 border ${colorClasses.border} hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-500 text-sm font-medium mb-1">
                  {insight.title}
                </p>
                <p className="text-2xl font-bold text-slate-900 mb-2">
                  {insight.value}
                </p>
                <div className="flex items-center gap-1">
                  {insight.change !== 0 && (
                    <>
                      {insight.isPositive ? (
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          insight.isPositive ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {insight.changeText}
                      </span>
                    </>
                  )}
                  {insight.change === 0 && (
                    <span className="text-xs font-medium text-slate-500">
                      {insight.changeText}
                    </span>
                  )}
                </div>
              </div>
              
              <div className={`w-12 h-12 ${colorClasses.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

InsightCards.displayName = 'InsightCards';

export default InsightCards;