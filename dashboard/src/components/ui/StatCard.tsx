import { TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";


interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;   // ❗ WAJIB
  color: string;
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
  trendColor = "",
  trendIcon: TrendIcon,
  loading = false,
}: StatCardProps) => {
  return (
    <div
      className="bg-white rounded-xl shadow-lg p-6 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>

          {loading ? (
            <div className="h-6 mt-2 bg-gray-200 rounded w-32 animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          )}

          {loading ? (
            <div className="h-4 mt-2 bg-gray-100 rounded w-20 animate-pulse" />
          ) : (
            trend && (
              <p className={`text-sm flex items-center mt-1 ${trendColor}`}>
                {TrendIcon ? (
                  <TrendIcon className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-1" />
                )}
                {trend}
              </p>
            )
          )}
        </div>

        <div
          className="p-3 rounded-full"
          style={{ backgroundColor: color + "20" }}
        >
          {loading ? (
            <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
          ) : (
            <Icon className="w-6 h-6" style={{ color }} />
          )}
        </div>
      </div>
    </div>
  );
};

export { StatCard };
