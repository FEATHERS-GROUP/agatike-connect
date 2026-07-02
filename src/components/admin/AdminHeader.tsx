import { Bell, Search, Settings, HelpCircle, Grid, Filter, LogOut } from "lucide-react";
import { useRouter, Link } from "@tanstack/react-router";
import { logoutAdmin } from "@/api/admin_auth";

export function AdminHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAdmin();
    router.invalidate();
    router.navigate({ to: "/internal/control/admin/login" });
  };

  return (
    <header className="flex h-12 w-full shrink-0 items-center justify-between bg-[#1b1b1c] px-3 font-sans text-sm border-b border-[#333333]">
      <div className="flex items-center gap-4">
        <Link
          to="/internal/control/admin"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="text-[#f97316]">
            <Grid className="h-5 w-5" />
          </div>
          <span className="font-semibold text-white tracking-tight">Agatike</span>
          <span className="text-[#cccccc] text-xs px-2 border-l border-[#333333] ml-2">
            Master Control
          </span>
        </Link>
      </div>

      <div className="flex items-center flex-1 max-w-lg mx-6 relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#797775]" />
        <input
          type="text"
          placeholder="Search resources, services, and docs (G+/)"
          className="h-8 w-full rounded-sm border border-[#333333] bg-[#111111] pl-9 pr-3 text-xs text-white outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-colors placeholder:text-[#797775]"
        />
      </div>

      <div className="flex items-center gap-1 text-[#cccccc]">
        <button className="p-2 hover:bg-[#333333] rounded-sm transition-colors" title="Filter">
          <Filter className="h-4 w-4" />
        </button>
        <button className="p-2 hover:bg-[#333333] rounded-sm transition-colors" title="Settings">
          <Settings className="h-4 w-4" />
        </button>
        <button className="p-2 hover:bg-[#333333] rounded-sm transition-colors" title="Help">
          <HelpCircle className="h-4 w-4" />
        </button>
        <button
          className="relative p-2 hover:bg-[#333333] rounded-sm transition-colors"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#f97316]" />
        </button>
        <div className="h-4 w-px bg-[#333333] mx-1" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 p-1.5 px-3 hover:bg-[#333333] rounded-sm transition-colors text-xs"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
          <span>admin@agatike.com</span>
        </button>
      </div>
    </header>
  );
}
