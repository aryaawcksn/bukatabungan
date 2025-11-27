import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AnimatedNumber from "./AnimateNumber";

interface StatCardProps {
  title: string;
  value: number; // sekarang wajib number supaya bisa animasi
  icon: LucideIcon;
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
  trendColor = "text-green-600",
  trendIcon: TrendIcon,
  loading = false,
}: StatCardProps) => {
  return (
    <div
      className={`bg-white border-l-4 rounded-xl p-5 flex justify-between items-center transition-all duration-200 hover:shadow-md`}
      style={{ borderLeftColor: color }}
    >
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-gray-400 text-sm font-medium truncate">{title}</p>

        {/* Value Animated */}
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-slate-900 mt-1 truncate">
            <AnimatedNumber value={value} />
          </p>
        )}

        {/* Trend */}
        {trend && !loading && (
          <div
            className={`mt-2 inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full ${trendColor} gap-1`}
          >
            {TrendIcon ? (
              <TrendIcon className="w-3 h-3" />
            ) : (
              <TrendingUp className="w-3 h-3" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>

      {/* Icon */}
      <div
        className="w-12 h-12 flex items-center justify-center rounded-lg flex-shrink-0 ml-4"
        style={{ backgroundColor: color + "20" }}
      >
        {loading ? (
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
        ) : (
          <Icon className="w-6 h-6" style={{ color }} />
        )}
      </div>
    </div>
  );
};

export { StatCard };
