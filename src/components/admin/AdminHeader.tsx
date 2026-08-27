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
  ExternalLink,
  QrCode,
  CalendarDays,
  CalendarCheck,
  Film,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { logoutAdmin } from "@/api/admin_auth";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import agatikeIcon from "@/assets/logo/Agatike Icon.png";
import { useState, useRef, useEffect } from "react";
import { adminGlobalSearch } from "@/api/admin_search";
import { db } from "@/lib/firebase";
import {
  collection,
  query as firestoreQuery,
  where,
  onSnapshot,
  orderBy,
  limit,
  doc,
  updateDoc,
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";

type SearchResults = Awaited<ReturnType<typeof adminGlobalSearch>>;

// For items with dedicated detail pages → navigate directly
// For list pages → add ?highlight=ID so the page can scroll to + flash that row
const CATEGORY_CONFIG = [
  {
    key: "users" as const,
    label: "Users",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    detailPage: true,
    getHref: (r: any) => `/internal/control/admin/agatike-users/${r.id}`,
    getTitle: (r: any) => r.name || "—",
    getSub: (r: any) => {
      const parts: string[] = [];
      if (r.email) parts.push(r.email);
      if (r.phone) parts.push(r.phone);
      if (r.handle) parts.push(`@${r.handle}`);
      if (r.country) parts.push(r.country);
      if (r.role) parts.push(r.role);
      if (r.banned) parts.push("⛔ Banned");
      else if (r.active === false) parts.push("Inactive");
      return parts.join(" · ");
    },
  },
  {
    key: "organizers" as const,
    label: "Organizers",
    icon: Building2,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    detailPage: true,
    getHref: (r: any) => `/internal/control/admin/organizers/${r.id}`,
    getTitle: (r: any) => r.name || r.handle || "—",
    getSub: (r: any) => r.email || "",
  },
  {
    key: "support_tickets" as const,
    label: "Support Tickets",
    icon: LifeBuoy,
    color: "text-red-500",
    bg: "bg-red-500/10",
    detailPage: true,
    getHref: (r: any) => `/internal/control/admin/support/${r.id}`,
    getTitle: (r: any) => r.subject || "—",
    getSub: (r: any) => [r.status, r.priority, r.organizer?.name].filter(Boolean).join(" · "),
  },
  {
    key: "wallets" as const,
    label: "Wallets",
    icon: Wallet,
    color: "text-green-500",
    bg: "bg-green-500/10",
    detailPage: false,
    // Navigate to transactions page, highlight wallet row by ID
    getHref: (r: any) => `/internal/control/admin/transactions?highlight=${r.id}&type=wallet`,
    getTitle: (r: any) => r.workspaces?.name || r.walletNumber || "—",
    getSub: (r: any) =>
      `${r.walletNumber} · ${r.currency} ${Number(r.amount || 0).toLocaleString()}`,
  },
  {
    key: "ticket_projects" as const,
    label: "Project Designs",
    icon: LayoutTemplate,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    detailPage: true,
    getHref: (r: any) =>
      r.workspace?.id
        ? `/internal/control/admin/organizers/${r.workspace.id}`
        : "/internal/control/admin",
    getTitle: (r: any) => r.name || r.logoText || "Untitled Design",
    getSub: (r: any) => `${r.template || "—"} · ${r.workspace?.name || ""}`,
  },
  {
    key: "leads" as const,
    label: "Leads",
    icon: UserPlus,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    detailPage: true,
    getHref: (r: any) => `/internal/control/admin/leads/${r.id}`,
    getTitle: (r: any) => r.name || "—",
    getSub: (r: any) => [r.company, r.email, r.status].filter(Boolean).join(" · "),
  },
  {
    key: "wallet_transactions" as const,
    label: "Transactions",
    icon: CreditCard,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    detailPage: false,
    getHref: (r: any) =>
      `/internal/control/admin/transactions?highlight=${r.id}&ref=${encodeURIComponent(r.reference_id || "")}`,
    getTitle: (r: any) => r.reference_id || r.id?.slice(0, 12) || "—",
    getSub: (r: any) =>
      [
        r.type,
        r.status,
        r.currency && `${r.currency} ${Number(r.amount || 0).toLocaleString()}`,
        r.wallets?.workspaces?.name,
      ]
        .filter(Boolean)
        .join(" · "),
  },
  {
    key: "withdrawal_requests" as const,
    label: "Withdrawals",
    icon: ArrowDownToLine,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    detailPage: false,
    getHref: (r: any) => `/internal/control/admin/transactions?highlight=${r.id}&type=withdrawal`,
    getTitle: (r: any) => r.workspace?.name || r.payout_account || "—",
    getSub: (r: any) =>
      [
        r.payout_method,
        r.status,
        r.currency && `${r.currency} ${Number(r.amount || 0).toLocaleString()}`,
      ]
        .filter(Boolean)
        .join(" · "),
  },
  {
    key: "event_attendees" as const,
    label: "Attendees",
    icon: QrCode,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    detailPage: false,
    getHref: (r: any) =>
      r.events?.workspaces?.orgnizer_id
        ? `/internal/control/admin/organizers/${r.events.workspaces.orgnizer_id}/attendees?highlight=${r.id}`
        : `/internal/control/admin`,
    getTitle: (r: any) => r.names || r.email || "—",
    getSub: (r: any) =>
      [r.qrcode_number, r.ticket_type, r.status, r.events?.title].filter(Boolean).join(" · "),
  },
  {
    key: "venue_bookings" as const,
    label: "Venue Bookings",
    icon: CalendarDays,
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    detailPage: false,
    getHref: (r: any) =>
      r.workspace?.orgnizer_id
        ? `/internal/control/admin/organizers/${r.workspace.orgnizer_id}/venues?highlight=${r.id}`
        : `/internal/control/admin`,
    getTitle: (r: any) => r.customer_name || r.customer_email || "—",
    getSub: (r: any) =>
      [r.rentable_venue?.name, r.status, r.payment_status].filter(Boolean).join(" · "),
  },
  {
    key: "space_subscriptions" as const,
    label: "Memberships",
    icon: CalendarCheck,
    color: "text-fuchsia-500",
    bg: "bg-fuchsia-500/10",
    detailPage: false,
    getHref: (r: any) =>
      r.space?.workspace?.orgnizer_id
        ? `/internal/control/admin/organizers/${r.space.workspace.orgnizer_id}/memberships?highlight=${r.id}`
        : `/internal/control/admin`,
    getTitle: (r: any) => r.customer_name || r.customer_email || "—",
    getSub: (r: any) => [r.space?.name, r.plan_name, r.status].filter(Boolean).join(" · "),
  },
  {
    key: "cinema_bookings" as const,
    label: "Cinema Bookings",
    icon: Film,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    detailPage: false,
    getHref: (r: any) =>
      r.cinema?.workspace_id
        ? `/dashboard/${r.cinema.workspace_id}/Cinema/movies?highlight=${r.schedule?.movie?.id}`
        : `/internal/control/admin`,
    getTitle: (r: any) => r.names || r.email || "—",
    getSub: (r: any) =>
      [r.qrcode_number, r.status, r.schedule?.movie?.title, r.cinema?.name]
        .filter(Boolean)
        .join(" · "),
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
  const [activeIndex, setActiveIndex] = useState(-1);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Notifications Listener
  useEffect(() => {
    if (!db) return;
    const q = firestoreQuery(
      collection(db, "agatike_notifications"),
      where("organizerId", "==", "admin"),
      orderBy("createdAt", "desc"),
      limit(5),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: any[] = [];
      let unread = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.read) unread++;
        notifs.push({ id: doc.id, ...data });
      });
      setNotifications(notifs);
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, []);

  const debouncedQuery = useDebounce(query, 280);

  // Fetch on debounced query change
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults(null);
      setActiveIndex(-1);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    adminGlobalSearch({ data: { query: debouncedQuery } } as any)
      .then((r) => {
        if (!cancelled) {
          setResults(r);
          setIsLoading(false);
          setActiveIndex(-1);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAsRead = async (id: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "agatike_notifications", id), { read: true });
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  // Build flat list of all results for keyboard nav
  const flatResults: { item: any; cat: (typeof CATEGORY_CONFIG)[number] }[] = [];
  if (results) {
    for (const cat of CATEGORY_CONFIG) {
      const items = results[cat.key];
      if (items) {
        for (const item of items) {
          flatResults.push({ item, cat: cat as any });
        }
      }
    }
  }

  // Keyboard shortcuts
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
        gTimer = setTimeout(() => {
          gPressed = false;
        }, 800);
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
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        const selected = flatResults[activeIndex];
        if (selected) handleNavigate(selected.item, selected.cat);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, flatResults, activeIndex]);

  const handleNavigate = (item: any, cat: (typeof CATEGORY_CONFIG)[number]) => {
    setClickedId(item.id);
    setTimeout(() => {
      setIsOpen(false);
      setQuery("");
      setResults(null);
      setClickedId(null);
      navigate({ to: cat.getHref(item) as any });
    }, 120);
  };

  const totalResults = results
    ? CATEGORY_CONFIG.reduce((acc, cat) => acc + (results[cat.key]?.length || 0), 0)
    : 0;

  const hasResults = totalResults > 0;

  const handleLogout = async () => {
    await logoutAdmin();
    window.location.href = "/internal/control/admin/login";
  };

  let flatIdx = 0;

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
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-[#797775] pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search users, organizers, tickets… (Ctrl+K)"
          className="h-8 w-full rounded-sm border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#111111] pl-9 pr-8 text-xs text-gray-900 dark:text-white outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-colors placeholder:text-gray-400 dark:placeholder:text-[#797775]"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults(null);
              setIsOpen(false);
            }}
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
          <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#1b1b1c] shadow-2xl max-h-[540px] overflow-y-auto">
            {isLoading && !results && (
              <div className="flex items-center justify-center gap-2 py-8 text-gray-400 dark:text-[#797775] text-xs">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching…
              </div>
            )}

            {!isLoading && results && !hasResults && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-[#797775]">
                <Search className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">
                  No results for{" "}
                  <strong className="text-gray-600 dark:text-white">"{query}"</strong>
                </p>
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
                      {items.map((item: any) => {
                        const myIdx = flatIdx++;
                        const isActive = myIdx === activeIndex;
                        const isClicked = clickedId === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleNavigate(item, cat as any)}
                            onMouseEnter={() => setActiveIndex(myIdx)}
                            className={[
                              "group w-full text-left flex items-center gap-3 px-3 py-2.5 transition-all duration-100 cursor-pointer border-b border-gray-50 dark:border-[#1f1f1f] last:border-0",
                              isClicked
                                ? "bg-[#f97316]/20 scale-[0.99]"
                                : isActive
                                  ? "bg-gray-100 dark:bg-[#252525]"
                                  : "hover:bg-gray-50 dark:hover:bg-[#252525]",
                            ].join(" ")}
                          >
                            {/* Icon bubble */}
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${cat.bg}`}
                            >
                              <Icon className={`h-4 w-4 ${cat.color}`} />
                            </div>

                            {/* Text */}
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

                            {/* Right side badge + arrow */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {!cat.detailPage && (
                                <span className="text-[9px] bg-gray-100 dark:bg-[#333] text-gray-400 dark:text-[#777] rounded px-1.5 py-0.5 font-medium uppercase tracking-wide">
                                  List
                                </span>
                              )}
                              <ChevronRight
                                className={`h-3.5 w-3.5 transition-colors ${
                                  isActive ? "text-[#f97316]" : "text-gray-300 dark:text-[#444]"
                                }`}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Footer */}
                <div className="flex items-center justify-between px-3 py-2 text-[10px] text-gray-400 dark:text-[#555] border-t border-gray-100 dark:border-[#222] bg-gray-50 dark:bg-[#111]">
                  <span>
                    {totalResults} result{totalResults !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-2">
                    <kbd className="bg-gray-200 dark:bg-[#333] text-gray-500 dark:text-[#888] rounded px-1.5 py-0.5 font-mono text-[9px]">
                      ↑↓
                    </kbd>
                    navigate
                    <kbd className="bg-gray-200 dark:bg-[#333] text-gray-500 dark:text-[#888] rounded px-1.5 py-0.5 font-mono text-[9px]">
                      ↵
                    </kbd>
                    open
                    <kbd className="bg-gray-200 dark:bg-[#333] text-gray-500 dark:text-[#888] rounded px-1.5 py-0.5 font-mono text-[9px]">
                      Esc
                    </kbd>
                    close
                  </span>
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
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative p-2 rounded-sm transition-colors ${
              isNotifOpen
                ? "bg-gray-200 dark:bg-[#333333]"
                : "hover:bg-gray-200 dark:hover:bg-[#333333]"
            }`}
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#f97316]" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-1 w-80 z-50 rounded-md border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#1b1b1c] shadow-2xl overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-[#222] flex justify-between items-center bg-gray-50 dark:bg-[#111]">
                <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-[#f97316]/10 text-[#f97316] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto max-h-[300px]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 dark:text-[#777] text-xs">
                    No recent notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-gray-50 dark:border-[#222] last:border-0 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors ${
                        !n.read ? "bg-gray-50/50 dark:bg-[#1f1f1f]" : ""
                      }`}
                      onClick={() => !n.read && markAsRead(n.id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={`text-xs font-semibold ${
                            !n.read
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {n.title}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                          {n.createdAt
                            ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
                            : ""}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-[#888] line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-gray-100 dark:border-[#222] bg-gray-50 dark:bg-[#111] p-1">
                <Link
                  to="/internal/control/admin/notifications"
                  onClick={() => setIsNotifOpen(false)}
                  className="block w-full text-center px-4 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-200/50 dark:hover:bg-[#222] rounded transition-colors"
                >
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>
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
