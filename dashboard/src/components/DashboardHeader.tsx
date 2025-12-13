import { Clock3 } from 'lucide-react';

interface DashboardHeaderProps {
  user: any;
  title: string;
  lastFetchTime?: Date | null;
}

export function DashboardHeader({ user, title, lastFetchTime }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-sm">
      {/* Left side: Page Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
      </div>

      {/* Right Side: Profile & Info */}
      <div className="flex items-center gap-6">
        <div className="hidden text-right md:block">
          <p className="mb-0.5 text-xs font-medium text-slate-500">
            {user?.nama_cabang || "Pusat"}
          </p>
          {lastFetchTime && (
            <p className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
              <Clock3 className="h-3 w-3" />
              Diperbarui {lastFetchTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        
        <div className="hidden h-8 w-[1px] bg-slate-200 md:block"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight text-slate-800">
              {(user?.username || "Admin").charAt(0).toUpperCase() + (user?.username || "Admin").slice(1)}
            </p>
            <p className="text-xs text-slate-500">
             {(user?.role || "Admin").charAt(0).toUpperCase() + (user?.role || "Admin").slice(1)}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 font-semibold text-white ring-2 ring-white shadow-sm">
            {(user?.username || "A").charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
