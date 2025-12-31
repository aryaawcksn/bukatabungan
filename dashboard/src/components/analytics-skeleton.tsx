import { Skeleton } from "./ui/skeleton";
import { memo } from "react";

export const QuickStatsSkeleton = memo(() => (
  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200 mb-6">
    <div className="flex items-center gap-2 mb-4">
      <Skeleton className="w-5 h-5 rounded" />
      <Skeleton className="w-32 h-6 rounded" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="w-20 h-4 rounded" />
            <Skeleton className="w-4 h-4 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-12 h-8 rounded" />
            <div className="flex gap-3">
              <Skeleton className="w-10 h-3 rounded" />
              <Skeleton className="w-10 h-3 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
));

export const InsightCardsSkeleton = memo(() => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl p-5 border border-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="w-24 h-4 mb-2 rounded" />
            <Skeleton className="w-16 h-8 mb-3 rounded" />
            <Skeleton className="w-32 h-3 rounded" />
          </div>
          <Skeleton className="w-12 h-12 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
));

export const AnalyticsSkeleton = memo(() => (
  <div className="space-y-6">
    {/* Row 1 */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm h-[400px]">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="w-32 h-5 rounded" />
            <Skeleton className="w-48 h-3 rounded" />
          </div>
        </div>
        <div className="flex items-center justify-center h-48 mb-8">
           <Skeleton className="w-40 h-40 rounded-full" />
        </div>
        <div className="flex justify-center gap-4">
          <Skeleton className="w-16 h-3 rounded" />
          <Skeleton className="w-16 h-3 rounded" />
          <Skeleton className="w-16 h-3 rounded" />
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm h-[400px]">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="w-32 h-5 rounded" />
            <Skeleton className="w-48 h-3 rounded" />
          </div>
        </div>
        <Skeleton className="w-full h-64 rounded-lg" />
      </div>
    </div>

    {/* Row 2 */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm h-[400px]">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="w-32 h-5 rounded" />
            <Skeleton className="w-48 h-3 rounded" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
             <Skeleton key={i} className="w-full h-8 rounded" />
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm h-[400px]">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="w-32 h-5 rounded" />
            <Skeleton className="w-48 h-3 rounded" />
          </div>
        </div>
        <div className="flex items-end gap-2 h-64">
           {Array.from({ length: 8 }).map((_, i) => (
             <Skeleton key={i} className="flex-1" style={{ height: `${Math.random() * 80 + 20}%` }} />
           ))}
        </div>
      </div>
    </div>
  </div>
));
