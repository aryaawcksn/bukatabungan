import { LayoutDashboard, ClipboardCheck, FileCog, LogOut, BarChart3 } from 'lucide-react';
import { cn } from "./ui/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

export function Sidebar({ activeTab, setActiveTab, user, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'submissions', label: 'Permohonan', icon: ClipboardCheck },
    { id: 'manage', label: 'Pengaturan', icon: FileCog, hidden: user?.role === "employement" },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white shadow-sm transition-transform">
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
            <img 
              src="./bss2.png" 
              alt="Logo" 
              className="h-8 w-8 object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              Bank Sleman
            </h1>
            <p className="text-[10px] font-medium text-slate-500">
              Dashboard Admin
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Menu Utama
          </div>
          
          {menuItems.filter(item => !item.hidden).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={onLogout}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-5 w-5 text-red-500 transition-colors group-hover:text-red-600" />
            Keluar
          </button>
        </div>
      </div>
    </aside>
  );
}
