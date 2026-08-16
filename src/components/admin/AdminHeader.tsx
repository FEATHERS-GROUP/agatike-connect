import {
  Bell,
  Search,
  Settings,
  HelpCircle,
  Filter,
  LogOut,
  Users,
  Building2,
  LifeBuoy,
  Wallet,
  LayoutTemplate,
  UserPlus,
  ArrowDownToLine,
  CreditCard,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useRouter, Link, useNavigate } from "@tanstack/react-router";
import { logoutAdmin } from "@/api/admin_auth";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import agatikeIcon from "@/assets/logo/Agatike Icon.png";
import { useState, useRef, useEffect, useCallback } from "react";
import { adminGlobalSearch } from "@/api/admin_search";

type SearchResults = Awaited<ReturnType<typeof adminGlobalSearch>>;

const CATEGORY_CONFIG = [
  {
    key: "users" as const,
    label: "Users",
    icon: Users,
    color: "text-blue-500",
    getHref: (r: any) => `/internal/control/admin/agatike-users/${r.id}`,
    getTitle: (r: any) => r.name || "—",
    getSub: (r: any) => r.email || r.phone || "",
  },
  {
    key: "organizers" as const,
    label: "Organizers",
    icon: Building2,
    color: "text-purple-500",
    getHref: (r: any) => `/internal/control/admin/organizers/${r.id}`,
    getTitle: (r: any) => r.name || r.handle || "—",
    getSub: (r: any) => r.email || "",
  },
  {
    key: "support_tickets" as const,
    label: "Support Tickets",
    icon: LifeBuoy,
    color: "text-red-500",
    getHref: (r: any) => `/internal/control/admin/support/${r.id}`,
    getTitle: (r: any) => r.subject || "—",
    getSub: (r: any) => `${r.status} · ${r.priority || "—"} · ${r.organizer?.name || ""}`,
  },
  {
    key: "wallets" as const,
    label: "Wallets",
    icon: Wallet,
    color: "text-green-500",
    getHref: (r: any) => `/internal/control/admin/transactions`,
    getTitle: (r: any) => r.workspace?.name || r.walletNumber || "—",
    getSub: (r: any) => `${r.walletNumber} · ${r.currency} ${Number(r.amount || 0).toLocaleString()}`,
  },
  {
    key: "ticket_projects" as const,
    label: "Project Designs",
    icon: LayoutTemplate,
    color: "text-amber-500",
    getHref: (r: any) =>
      r.workspace?.id
        ? `/dashboard/${r.workspace.id}/events`
        : "/internal/control/admin",
    getTitle: (r: any) => r.name || r.logoText || "Untitled Design",
    getSub: (r: any) => `${r.template || "—"} · ${r.workspace?.name || ""}`,
  },
  {
    key: "leads" as const,
    label: "Leads",
    icon: UserPlus,
    color: "text-cyan-500",
    getHref: (r: any) => `/internal/control/admin/leads/${r.id}`,
    getTitle: (r: any) => r.name || "—",
    getSub: (r: any) =>
      [r.company, r.email, r.status].filter(Boolean).join(" · "),
  },
  {
    key: "wallet_transactions" as const,
    label: "Transactions",
    icon: CreditCard,
    color: "text-indigo-500",
    getHref: (r: any) => `/internal/control/admin/transactions`,
    getTitle: (r: any) => r.reference_id || r.id?.slice(0, 8) || "—",
    getSub: (r: any) =>
      `${r.type} · ${r.status} · ${r.currency} ${Number(r.amount || 0).toLocaleString()} · ${r.wallets?.workspace?.name || ""}`,
  },
  {
    key: "withdrawal_requests" as const,
    label: "Withdrawals",
    icon: ArrowDownToLine,
    color: "text-rose-500",
    getHref: (r: any) => `/internal/control/admin/transactions`,
    getTitle: (r: any) => r.workspace?.name || r.payout_account || "—",
    getSub: (r: any) =>
      `${r.payout_method || "—"} · ${r.status} · ${r.currency || ""} ${Number(r.amount || 0).toLocaleString()}`,
  },
] as const;

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function AdminHeader() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 280);

  // Fetch on debounced query change
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    adminGlobalSearch({ data: { query: debouncedQuery } } as any)
      .then((r) => {
        if (!cancelled) {
          setResults(r);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Open when user starts typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  // Keyboard shortcut G+/ or Ctrl+K
  useEffect(() => {
    let gPressed = false;
    let gTimer: ReturnType<typeof setTimeout>;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
        return;
      }
      if (e.key === "g" || e.key === "G") {
        gPressed = true;
        clearTimeout(gTimer);
        gTimer = setTimeout(() => { gPressed = false; }, 800);
      }
      if (gPressed && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const totalResults = results
    ? CATEGORY_CONFIG.reduce((acc, cat) => acc + (results[cat.key]?.length || 0), 0)
    : 0;

  const hasResults = totalResults > 0;

  const handleLogout = async () => {
    await logoutAdmin();
    window.location.href = "/internal/control/admin/login";
  };

  return (
    <header className="flex h-12 w-full shrink-0 items-center justify-between bg-gray-50 dark:bg-[#1b1b1c] px-3 font-sans text-sm border-b border-gray-200 dark:border-[#333333]">
      <div className="flex items-center gap-4">
        <Link
          to="/internal/control/admin"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src={agatikeIcon} alt="Agatike" className="h-7 w-auto object-contain" />
          <span className="text-gray-700 dark:text-[#cccccc] text-xs px-2 border-l border-gray-200 dark:border-[#333333] ml-2">
            Master Control
          </span>
        </Link>
      </div>

      {/* ── Search ── */}
      <div ref={containerRef} className="flex items-center flex-1 max-w-lg mx-6 relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 dark:text-[#797775] pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search users, organizers, tickets… (Ctrl+K)"
          className="h-8 w-full rounded-sm border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#111111] pl-9 pr-8 text-xs text-gray-900 dark:text-white outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-colors placeholder:text-gray-400 dark:placeholder:text-[#797775]"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults(null); setIsOpen(false); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-[#f97316]" />
        )}

        {/* Results dropdown */}
        {isOpen && query.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#1b1b1c] shadow-xl max-h-[520px] overflow-y-auto">
            {isLoading && !results && (
              <div className="flex items-center justify-center gap-2 py-8 text-gray-400 dark:text-[#797775] text-xs">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching…
              </div>
            )}

            {!isLoading && results && !hasResults && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-[#797775]">
                <Search className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">No results for <strong className="text-gray-600 dark:text-white">"{query}"</strong></p>
              </div>
            )}

            {results && hasResults && (
              <div className="py-1">
                {CATEGORY_CONFIG.map((cat) => {
                  const items = results[cat.key];
                  if (!items || items.length === 0) return null;
                  const Icon = cat.icon;

                  return (
                    <div key={cat.key}>
                      {/* Category header */}
                      <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-[#555] bg-gray-50 dark:bg-[#111] border-b border-gray-100 dark:border-[#222]">
                        <Icon className={`h-3 w-3 ${cat.color}`} />
                        {cat.label}
                        <span className="ml-auto bg-gray-200 dark:bg-[#333] rounded-full px-1.5 py-0.5 text-[9px] font-bold text-gray-500 dark:text-[#888]">
                          {items.length}
                        </span>
                      </div>

                      {/* Items */}
                      {items.map((item: any) => (
                        <Link
                          key={item.id}
                          to={cat.getHref(item) as any}
                          onClick={() => { setIsOpen(false); setQuery(""); }}
                          className="group flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors cursor-pointer border-b border-gray-50 dark:border-[#1f1f1f] last:border-0"
                        >
                          <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#252525] ${cat.color}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-800 dark:text-white truncate">
                              {cat.getTitle(item)}
                            </p>
                            {cat.getSub(item) && (
                              <p className="text-[10px] text-gray-400 dark:text-[#777] truncate mt-0.5">
                                {cat.getSub(item)}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-[#444] group-hover:text-[#f97316] transition-colors flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  );
                })}

                <div className="px-3 py-2 text-[10px] text-gray-400 dark:text-[#555] border-t border-gray-100 dark:border-[#222] text-center">
                  {totalResults} result{totalResults !== 1 ? "s" : ""} — press <kbd className="bg-gray-100 dark:bg-[#333] rounded px-1 py-0.5 font-mono">Esc</kbd> to close
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 text-gray-700 dark:text-[#cccccc]">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 hover:bg-gray-200 dark:hover:bg-[#333333] rounded-sm transition-colors"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          className="p-2 hover:bg-gray-200 dark:hover:bg-[#333333] rounded-sm transition-colors"
          title="Filter"
        >
          <Filter className="h-4 w-4" />
        </button>
        <button
          className="p-2 hover:bg-gray-200 dark:hover:bg-[#333333] rounded-sm transition-colors"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
        <button
          className="p-2 hover:bg-gray-200 dark:hover:bg-[#333333] rounded-sm transition-colors"
          title="Help"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
        <button
          className="relative p-2 hover:bg-gray-200 dark:hover:bg-[#333333] rounded-sm transition-colors"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#f97316]" />
        </button>
        <div className="h-4 w-px bg-gray-200 dark:bg-[#333333] mx-1" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 p-1.5 px-3 hover:bg-gray-200 dark:hover:bg-[#333333] rounded-sm transition-colors text-xs"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
          <span>admin@agatike.com</span>
        </button>
      </div>
    </header>
  );
}
