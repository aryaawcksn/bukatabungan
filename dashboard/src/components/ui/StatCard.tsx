import { TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;   // wajib
  color: string;      // primary color
  trend?: string;
  trendColor?: string;
  trendIcon?: LucideIcon;
  loading?: boolean;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendColor = "text-green-500",
  trendIcon: TrendIcon,
  loading = false,
}: StatCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center border-l-4 transition-all duration-200 hover:shadow-lg"
         style={{ borderLeftColor: color }}>
      
      {/* Info Section */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <p className="text-gray-500 text-sm font-medium truncate">{title}</p>

        {/* Value */}
        {loading ? (
          <div className="h-8 mt-1 w-24 bg-gray-200 rounded animate-pulse" />
        ) : (
          <p className="text-2xl font-semibold text-gray-900 mt-1 truncate">{value}</p>
        )}

        {/* Trend */}
        {loading ? (
          <div className="h-4 mt-2 w-20 bg-gray-100 rounded animate-pulse" />
        ) : (
          trend && (
            <div className={`flex items-center text-sm mt-1 ${trendColor} truncate`}>
              {TrendIcon ? <TrendIcon className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1" />}
              <span>{trend}</span>
            </div>
          )
        )}
      </div>

      {/* Icon Section */}
      <div className="flex-shrink-0 ml-4 flex items-center justify-center w-14 h-14 rounded-full"
           style={{ background: `linear-gradient(135deg, ${color}20, ${color}10)` }}>
        {loading ? (
          <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
        ) : (
          <Icon className="w-6 h-6" style={{ color }} />
        )}
      </div>
    </div>
  );
};

export { StatCard };
