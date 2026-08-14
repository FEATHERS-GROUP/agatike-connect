import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserStaffAssignments } from "@/api/staff";
import { getBadgeProjectByEventId } from "@/api/badges";
import { useUserAuth } from "@/contexts/UserAuthContext";
import {
  Lock,
  ArrowLeft,
  ScanLine,
  Users,
  Activity,
  ExternalLink,
  Calendar,
  MapPin,
  XCircle,
  CheckCircle2,
  Ticket,
  Shield,
  ArrowRight,
  BadgeCheck,
  CreditCard,
  UserCheck,
  Wallet,
  CalendarCheck,
  UserPlus,
  LayoutGrid
} from "lucide-react";
import { ScannerMobile } from "@/components/mobile/ScannerMobile";
import { getEventById } from "@/api/events";
import { getAppById } from "@/api/app-studio";

export const Route = createFileRoute("/staff/event/$eventId")({
  component: StaffEventDashboard,
});

function Numpad({
  onPinComplete,
  error,
  event,
  appData,
}: {
  onPinComplete: (pin: string) => void;
  error: string;
  event?: any;
  appData?: any;
}) {
  const [pin, setPin] = useState("");

  const handlePress = (num: string) => {
    if (pin.length < 9) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 9) {
        onPinComplete(newPin);
        // Add slight delay before clearing so user sees the 9th dot
        setTimeout(() => setPin(""), 500);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const themeColor = appData?.theme_color || event?.theme_color || event?.tickets_page_styles?.primary_color || "#ff3b30";
  const logoUrl = appData?.logo_url || event?.cover;

  const brandingConfig = (() => {
    let config = {
      font_family: "inter",
      background_color: "#ffffff"
    };
    if (appData?.app_modules) {
      const bMod = appData.app_modules.find((m: any) => m.type === "branding_config");
      if (bMod) {
        config = typeof bMod.config === "string" ? JSON.parse(bMod.config) : bMod.config || config;
      }
    }
    return config;
  })();

  const fontClassMap: Record<string, string> = {
    inter: "font-sans",
    roboto: "font-sans",
    sans: "font-sans",
    serif: "font-serif",
    mono: "font-mono",
  };
  const fontClass = fontClassMap[brandingConfig.font_family] || "font-sans";

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center text-foreground px-6 w-full overflow-hidden ${fontClass}`}
      style={{ 
        "--color-primary": themeColor,
        backgroundColor: brandingConfig.background_color && brandingConfig.background_color !== "#ffffff" ? brandingConfig.background_color : "hsl(var(--background))",
        fontFamily: !fontClassMap[brandingConfig.font_family] ? brandingConfig.font_family : undefined
      } as React.CSSProperties}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="z-10 w-full max-w-sm flex flex-col items-center">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo"
            className="w-20 h-20 rounded-2xl object-cover mb-4 shadow-[0_0_30px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] border border-black/10"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-[0_0_30px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] border border-primary/20">
            <Lock className="h-8 w-8 text-primary" />
          </div>
        )}
        <h1 className="text-2xl font-bold mb-1 text-center">{appData?.name || event?.title || "Staff Portal"}</h1>
        <p className="text-muted-foreground text-sm mb-8 text-center">
          Enter your 9-digit security PIN
        </p>

        <div className="flex gap-2 mb-10">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                pin.length > i
                  ? "bg-primary shadow-[0_0_10px_var(--color-primary)] scale-125"
                  : "bg-black/10 dark:bg-white/20"
              }`}
            />
          ))}
        </div>

        {error && <p className="text-destructive text-sm mb-6 animate-pulse">{error}</p>}

        <div className="grid grid-cols-3 gap-x-8 gap-y-4 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePress(num.toString())}
              className="w-16 h-16 rounded-full bg-black/5 border border-black/10 text-2xl font-medium flex items-center justify-center active:bg-black/10 active:scale-95 transition-all mx-auto backdrop-blur-md"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handlePress("0")}
            className="w-16 h-16 rounded-full bg-black/5 border border-black/10 text-2xl font-medium flex items-center justify-center active:bg-black/10 active:scale-95 transition-all mx-auto backdrop-blur-md"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full text-muted-foreground text-xl font-medium flex items-center justify-center active:text-foreground active:scale-95 transition-all mx-auto"
          >
            DEL
          </button>
        </div>
      </div>
    </div>
  );
}

const AVAILABLE_MODULES = [
  { type: "scanner", title: "Access Scanner", icon: ScanLine, desc: "Scan tickets and badges" },
  { type: "attendees", title: "Event Attendees", icon: Users, desc: "Manage registered attendees" },
  { type: "transactions", title: "Sales & Transactions", icon: CreditCard, desc: "View payments" },
  { type: "venues", title: "Venues", icon: MapPin, desc: "Manage locations" },
  { type: "bookings", title: "Calendar Bookings", icon: Calendar, desc: "View reservations" },
  { type: "members", title: "Team Members", icon: UserCheck, desc: "Workspace staff directory" },
  { type: "stats", title: "Live Stats", icon: Activity, desc: "Checked-in & scans per hour" },
  { type: "wallet", title: "Wallet & Withdraw", icon: Wallet, desc: "Manage balances" },
  { type: "events_list", title: "Event Ticketing", icon: Ticket, desc: "Browse events and select tickets" },
  { type: "venue_bookings", title: "Venue Bookings", icon: CalendarCheck, desc: "Manage venue bookings" },
  { type: "memberships", title: "Memberships", icon: UserPlus, desc: "Register membership users" },
];

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in ms

function StaffEventDashboard() {
  const { eventId } = Route.useParams();
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      const lastActive = localStorage.getItem(`staff_session_${eventId}`);
      if (lastActive && Date.now() - parseInt(lastActive) < SESSION_TIMEOUT) {
        return true;
      }
    }
    return false;
  });
  const [pinError, setPinError] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  // Local scan stats
  const [scans, setScans] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(`scan_stats_${eventId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const checkedIn = scans.length;
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const scansPerHour = scans.filter((t) => t >= oneHourAgo).length;

  const recordScan = useCallback(() => {
    setScans((prev) => {
      const newScans = [...prev, Date.now()];
      localStorage.setItem(`scan_stats_${eventId}`, JSON.stringify(newScans));
      return newScans;
    });
  }, [eventId]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let lastActivity = Date.now();
    localStorage.setItem(`staff_session_${eventId}`, lastActivity.toString());

    const handleActivity = () => {
      lastActivity = Date.now();
    };

    // Track major interactions to keep session alive
    const events = ["mousedown", "keypress", "scroll", "touchstart"];
    events.forEach((e) => document.addEventListener(e, handleActivity, { passive: true }));

    const interval = setInterval(() => {
      const storedActivity = parseInt(localStorage.getItem(`staff_session_${eventId}`) || "0");
      const maxActivity = Math.max(lastActivity, storedActivity);

      if (Date.now() - maxActivity >= SESSION_TIMEOUT) {
        setIsAuthenticated(false);
        localStorage.removeItem(`staff_session_${eventId}`);
      } else if (lastActivity > storedActivity) {
        localStorage.setItem(`staff_session_${eventId}`, lastActivity.toString());
      }
    }, 10000); // Check every 10 seconds

    return () => {
      events.forEach((e) => document.removeEventListener(e, handleActivity));
      clearInterval(interval);
    };
  }, [isAuthenticated, eventId]);

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["user-staff-assignments", user?.id],
    queryFn: () => getUserStaffAssignments({ data: { user_id: user?.id } } as any),
    enabled: !!user?.id,
  });

  const assignment = assignments.find((a: any) => a.event_id === eventId);

  const { data: eventDetails } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById({ data: { id: eventId } } as any),
    enabled: !!eventId,
  });

  const { data: badgeProject } = useQuery({
    queryKey: ["badge-project", eventId],
    queryFn: () => getBadgeProjectByEventId({ data: { event_id: eventId } } as any),
    enabled: !!eventId && isAuthenticated,
  });

  const { data: appData } = useQuery({
    queryKey: ["workspace-app", eventDetails?.app_id],
    queryFn: () => getAppById({ data: { id: eventDetails?.app_id } } as any),
    enabled: !!eventDetails?.app_id,
  });

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center text-muted-foreground">
        Loading security protocols...
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">
          You are not assigned as staff for this event or your assignment has been revoked.
        </p>
        <Link to="/profile">
          <button className="px-6 py-3 bg-secondary text-secondary-foreground rounded-full font-medium hover:bg-secondary/80">
            Return to Profile
          </button>
        </Link>
      </div>
    );
  }

  const isExpired =
    assignment.event?.schedules?.[0]?.end_date &&
    new Date(assignment.event.schedules[0].end_date) < new Date();

  if (isExpired) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="h-16 w-16 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Event Ended</h2>
        <p className="text-muted-foreground mb-6">
          Staff access for "{assignment.event?.title}" has expired.
        </p>
        <Link to="/profile">
          <button className="px-6 py-3 bg-secondary text-secondary-foreground rounded-full font-medium hover:bg-secondary/80">
            Return to Profile
          </button>
        </Link>
      </div>
    );
  }

  if (!isAuthenticated && assignment.pin_code) {
    return (
      <Numpad
        onPinComplete={(pin) => {
          if (pin === String(assignment.pin_code)) {
            setIsAuthenticated(true);
            localStorage.setItem(`staff_session_${eventId}`, Date.now().toString());
            setPinError("");
          } else {
            setPinError("Incorrect PIN");
          }
        }}
        error={pinError}
        event={assignment.event}
        appData={appData}
      />
    );
  }

  // If we reach here, we are authenticated (or no PIN was required)

  if (showScanner) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col">
        <ScannerMobile
          eventId={eventId}
          onClose={() => setShowScanner(false)}
          onScanSuccess={recordScan}
        />
      </div>
    );
  }

  // Permissions
  const perms = assignment.app_permissions || [];
  const canScan = perms.includes("SCAN_TICKETS");
  const canViewGuestlist = perms.includes("VIEW_GUESTLIST");
  const canSell = perms.includes("SELL_TICKETS");
  const canViewAnalytics = perms.includes("VIEW_ANALYTICS");

  const brandingConfig = (() => {
    let config = {
      font_family: "inter",
      background_color: "#ffffff",
      dashboard_columns: "2",
      mobile_layout: "grid",
      logout_style: "subtle"
    };
    if (appData?.app_modules) {
      const bMod = appData.app_modules.find((m: any) => m.type === "branding_config");
      if (bMod) {
        config = typeof bMod.config === "string" ? JSON.parse(bMod.config) : bMod.config || config;
      }
    }
    return config;
  })();

  const fontClassMap: Record<string, string> = {
    inter: "font-sans",
    roboto: "font-sans",
    sans: "font-sans",
    serif: "font-serif",
    mono: "font-mono",
  };
  const fontClass = fontClassMap[brandingConfig.font_family] || "font-sans";

  return (
    <div
      className={`min-h-[100dvh] text-foreground overflow-y-auto pb-safe ${fontClass}`}
      style={
        { 
          "--color-primary": appData?.theme_color || assignment.event?.theme_color || "#ff3b30",
          backgroundColor: brandingConfig.background_color && brandingConfig.background_color !== "#ffffff" ? brandingConfig.background_color : "hsl(var(--background))",
          fontFamily: !fontClassMap[brandingConfig.font_family] ? brandingConfig.font_family : undefined
        } as React.CSSProperties
      }
    >
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none -z-10" />
      <div className="absolute top-0 left-0 right-0 h-96 bg-primary/10 blur-[100px] pointer-events-none -z-10 rounded-full mix-blend-screen" />

      <header className="px-6 pt-safe-top pb-2 flex items-center justify-between relative z-10 mt-6">
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="p-3 -ml-3 text-foreground/60 hover:text-foreground active:scale-95 transition-all bg-secondary/50 backdrop-blur-md rounded-full border border-border/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          {appData?.logo_url && (
            <img src={appData.logo_url} alt="Logo" className="h-8 w-8 rounded-md object-cover border border-border/50" />
          )}
        </div>
        <div className="bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full flex items-center gap-2.5 backdrop-blur-md shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
          <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)] animate-pulse" />
          <span className="text-primary text-xs font-black tracking-widest uppercase">Live</span>
        </div>
      </header>

      <main className="px-6 pt-6 pb-24 relative z-10 space-y-10">
        <div>
          <h1 className="text-4xl font-black mb-2 leading-tight tracking-tight">
            {appData?.name || assignment.event?.title || "Event Dashboard"}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider rounded-lg border border-border/50">
              {assignment.role}
            </span>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-lg border border-primary/20">
              {assignment.allowed_sections?.includes("*") ? "All Access" : "Restricted Sections"}
            </span>
          </div>
        </div>

        {(!appData || appData.app_modules?.length === 0) && canViewAnalytics && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
              Live Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-3xl p-5 shadow-sm flex flex-col justify-between aspect-[4/3] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2 border border-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-4xl font-black mb-0.5 tracking-tighter">{checkedIn}</p>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Checked In
                  </p>
                </div>
              </div>

              <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-3xl p-5 shadow-sm flex flex-col justify-between aspect-[4/3] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Activity className="h-16 w-16 text-blue-500" />
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2 border border-blue-500/20">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-4xl font-black mb-0.5 tracking-tighter">{scansPerHour}</p>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Scans/Hour
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
            Staff Tools
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {canScan && (
              <button
                onClick={() => setShowScanner(true)}
                className="w-full bg-primary relative overflow-hidden border border-primary/50 rounded-[2rem] p-6 text-left active:scale-[0.98] transition-all shadow-[0_15px_40px_color-mix(in_srgb,var(--color-primary)_25%,transparent)] group"
              >
                <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4 group-active:scale-110 transition-transform">
                  <ScanLine className="h-32 w-32 text-primary-foreground" />
                </div>
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
                    <ScanLine className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-2xl text-primary-foreground tracking-tight mb-1">
                      Scan Tickets
                    </h4>
                    <p className="text-primary-foreground/80 text-sm font-medium">
                      Verify attendees at the gate
                    </p>
                  </div>
                </div>
              </button>
            )}

            {canViewGuestlist && (
              <button className="w-full bg-background/60 backdrop-blur-xl border border-border/50 rounded-[2rem] p-6 text-left active:scale-[0.98] transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 transform translate-x-4 -translate-y-4 group-active:scale-110 transition-transform">
                  <Users className="h-32 w-32 text-foreground" />
                </div>
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center border border-border/50 text-foreground">
                    <Users className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-2xl tracking-tight mb-1">Guest List</h4>
                    <p className="text-muted-foreground text-sm font-medium">
                      Manage VIPs & reservations
                    </p>
                  </div>
                </div>
              </button>
            )}

            {canSell && (
              <button className="w-full bg-background/60 backdrop-blur-xl border border-border/50 rounded-[2rem] p-6 text-left active:scale-[0.98] transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 transform translate-x-4 -translate-y-4 group-active:scale-110 transition-transform">
                  <Ticket className="h-32 w-32 text-foreground" />
                </div>
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center border border-border/50 text-foreground">
                    <Ticket className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-2xl tracking-tight mb-1">Box Office</h4>
                    <p className="text-muted-foreground text-sm font-medium">
                      Sell tickets & collect payments
                    </p>
                  </div>
                </div>
              </button>
            )}

            {!canScan && !canViewGuestlist && !canSell && (!appData || appData.app_modules?.length === 0) && (
              <div className="bg-secondary/30 border border-dashed border-border/50 rounded-[2rem] p-8 text-center">
                <Shield className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h4 className="font-bold text-lg mb-2">No Tools Assigned</h4>
                <p className="text-muted-foreground text-sm">
                  You haven't been assigned any app permissions. Contact the organizer if this is a
                  mistake.
                </p>
              </div>
            )}
            
            {appData?.app_modules && appData.app_modules.length > 0 && (
              <div className={`grid gap-4 ${
                brandingConfig.mobile_layout === "list" ? "grid-cols-1" : 
                brandingConfig.dashboard_columns === "3" ? "grid-cols-2 md:grid-cols-3" :
                brandingConfig.dashboard_columns === "4" ? "grid-cols-2 md:grid-cols-4" :
                "grid-cols-2"
              }`}>
                {appData.app_modules
                  .filter((m: any) => m.type !== "branding_config")
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((m: any) => {
                    const config = typeof m.config === "string" ? JSON.parse(m.config) : m.config || {};
                    const visibilityRoles = config.visibility_roles
                      ?.split(",")
                      .map((r: string) => r.trim().toLowerCase())
                      .filter(Boolean) || [];
                    const userRole = assignment.role?.toLowerCase() || "";
                    
                    let isVisible = true;
                    if (visibilityRoles.length > 0) {
                      isVisible = visibilityRoles.includes(userRole);
                    }
                    if (!isVisible) return null;

                    const ModIcon = AVAILABLE_MODULES.find(x => x.type === m.type)?.icon || LayoutGrid;

                    if (m.type === "stats") {
                      return (
                        <div key={m.id} className="space-y-4 mb-6">
                          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                            Live Stats
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            {config.show_checked_in !== false && (
                              <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-3xl p-5 shadow-sm flex flex-col justify-between aspect-[4/3] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                  <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                                </div>
                                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2 border border-emerald-500/20">
                                  <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-4xl font-black mb-0.5 tracking-tighter">{checkedIn}</p>
                                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                    Checked In
                                  </p>
                                </div>
                              </div>
                            )}

                            {config.show_scans_per_hour !== false && (
                              <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-3xl p-5 shadow-sm flex flex-col justify-between aspect-[4/3] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                  <Activity className="h-16 w-16 text-blue-500" />
                                </div>
                                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2 border border-blue-500/20">
                                  <Activity className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-4xl font-black mb-0.5 tracking-tighter">{scansPerHour}</p>
                                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                    Scans/Hour
                                  </p>
                                </div>
                              </div>
                            )}

                            {config.show_tickets_scanned && (
                              <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-3xl p-5 shadow-sm flex flex-col justify-between aspect-[4/3] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                  <ScanLine className="h-16 w-16 text-orange-500" />
                                </div>
                                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-2 border border-orange-500/20">
                                  <ScanLine className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-4xl font-black mb-0.5 tracking-tighter">{scans.length}</p>
                                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                    Scanned
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                           if (m.type === "scanner") setShowScanner(true);
                           // Other modules can navigate to sub-routes if implemented
                        }}
                        className="w-full bg-background/60 backdrop-blur-xl border border-border/50 rounded-[2rem] p-6 text-left active:scale-[0.98] transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-6 opacity-5 transform translate-x-4 -translate-y-4 group-active:scale-110 transition-transform">
                          <ModIcon className="h-32 w-32 text-foreground" />
                        </div>
                        <div className="relative z-10 flex flex-col gap-4">
                          <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center border border-border/50 text-foreground">
                            <ModIcon className="h-7 w-7" />
                          </div>
                          <div>
                            <h4 className="font-black text-2xl tracking-tight mb-1">{m.title}</h4>
                            <p className="text-muted-foreground text-sm font-medium">
                              {m.desc || "Open module"}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="pt-6">
            {assignment?.badge_qr_string && badgeProject ? (
              <Link
                to="/b/$qrString"
                params={{ qrString: assignment.badge_qr_string }}
                className="block"
              >
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between hover:bg-primary/20 active:bg-primary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-primary">See Your Badge</h4>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary/70" />
                </div>
              </Link>
            ) : (
              <Link to="/events/$eventId" params={{ eventId }} className="block">
                <div className="bg-secondary/30 border border-border/50 rounded-2xl p-4 flex items-center justify-between hover:bg-secondary/50 active:bg-secondary transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-foreground/80">
                      <ExternalLink className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold">View Event Page</h4>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            )}
          </div>
        </div>
        <div className="mt-12 flex justify-center pb-12">
          <button 
            onClick={() => {
              setIsAuthenticated(false);
              localStorage.removeItem(`staff_session_${eventId}`);
              navigate({ to: "/profile" });
            }}
            className={`px-10 py-4 rounded-full font-bold shadow-sm transition-all active:scale-95 ${
              brandingConfig.logout_style === "prominent" 
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_0_20px_color-mix(in_srgb,var(--color-destructive)_30%,transparent)]" 
                : "bg-secondary/80 backdrop-blur-md text-secondary-foreground border border-border/50 hover:bg-secondary"
            }`}
          >
            Sign Out
          </button>
        </div>
      </main>
    </div>
  );
}
