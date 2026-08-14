import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEventById } from "@/api/events";
import { getAppById } from "@/api/app-studio";
import { getBadgeProjectByEventId } from "@/api/badges";
import {
  ArrowLeft, ScanLine, Users, Activity, ExternalLink, Calendar, MapPin, CheckCircle2, Ticket, Shield, ArrowRight, BadgeCheck, CreditCard, UserCheck, Wallet, CalendarCheck, UserPlus, LayoutGrid
} from "lucide-react";
import { ScannerMobile } from "@/components/mobile/ScannerMobile";

export const Route = createFileRoute("/staff/event/$eventId")({
  component: StaffEventDashboard,
});

const AVAILABLE_MODULES = [
  { type: "scanner", title: "Access Scanner", icon: ScanLine, desc: "Scan tickets and badges" },
  { type: "attendees", title: "Event Attendees", icon: Users, desc: "Manage registered attendees" },
  { type: "stats", title: "Live Stats", icon: Activity, desc: "Checked-in & scans per hour" },
  { type: "events_list", title: "Event Ticketing", icon: Ticket, desc: "Browse events and select tickets" },
];

const SESSION_TIMEOUT = 60 * 60 * 1000;

function StaffEventDashboard() {
  const { eventId } = Route.useParams();
  const navigate = useNavigate();

  const [authState, setAuthState] = useState<{
    role: string;
    email: string;
    name?: string;
    id: string; // User ID or Assignment ID
    app_permissions?: string[];
    allowed_sections?: string[];
  } | null>(() => {
    try {
      const stored = localStorage.getItem(`staff_auth_${eventId}`);
      if (stored) {
        const lastActive = localStorage.getItem(`staff_session_${eventId}`);
        if (lastActive && Date.now() - parseInt(lastActive) < SESSION_TIMEOUT) {
          return JSON.parse(stored);
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!authState) {
      navigate({ to: "/staff/login" });
    }
  }, [authState, navigate]);

  const { data: eventDetails } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById({ data: { id: eventId } } as any),
    enabled: !!eventId && !!authState,
  });

  const { data: appData } = useQuery({
    queryKey: ["workspace-app", eventDetails?.app_id],
    queryFn: () => getAppById({ data: { id: eventDetails?.app_id } } as any),
    enabled: !!eventDetails?.app_id && !!authState,
  });

  const { data: badgeProject } = useQuery({
    queryKey: ["badge-project", eventId],
    queryFn: () => getBadgeProjectByEventId({ data: { event_id: eventId } } as any),
    enabled: !!eventId && !!authState,
  });

  const [showScanner, setShowScanner] = useState(false);

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
    if (!authState) return;

    let lastActivity = Date.now();
    localStorage.setItem(`staff_auth_${eventId}`, JSON.stringify(authState));
    localStorage.setItem(`staff_session_${eventId}`, lastActivity.toString());

    const handleActivity = () => { lastActivity = Date.now(); };
    const events = ["mousedown", "keypress", "scroll", "touchstart"];
    events.forEach((e) => document.addEventListener(e, handleActivity, { passive: true }));

    const interval = setInterval(() => {
      const storedActivity = parseInt(localStorage.getItem(`staff_session_${eventId}`) || "0");
      const maxActivity = Math.max(lastActivity, storedActivity);

      if (Date.now() - maxActivity >= SESSION_TIMEOUT) {
        setAuthState(null);
        localStorage.removeItem(`staff_session_${eventId}`);
      } else if (lastActivity > storedActivity) {
        localStorage.setItem(`staff_session_${eventId}`, lastActivity.toString());
      }
    }, 10000);

    return () => {
      events.forEach((e) => document.removeEventListener(e, handleActivity));
      clearInterval(interval);
    };
  }, [authState, eventId]);

  if (!authState) {
    return null; // Will redirect in useEffect
  }

  // Scanner UI
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

  const perms = authState.app_permissions || [];
  
  const themeColor = appData?.theme_color || eventDetails?.theme_color || "#ff3b30";
  const logoUrl = appData?.logo_url || eventDetails?.cover;

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
      style={{ 
        "--color-primary": themeColor,
        backgroundColor: brandingConfig.background_color && brandingConfig.background_color !== "#ffffff" ? brandingConfig.background_color : "hsl(var(--background))",
        fontFamily: !fontClassMap[brandingConfig.font_family] ? brandingConfig.font_family : undefined
      } as React.CSSProperties}
    >
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none -z-10" />
      <div className="absolute top-0 left-0 right-0 h-96 bg-primary/10 blur-[100px] pointer-events-none -z-10 rounded-full mix-blend-screen" />

      <header className="px-6 pt-safe-top pb-2 flex items-center justify-between relative z-10 mt-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setAuthState(null);
              localStorage.removeItem(`staff_session_${eventId}`);
              navigate({ to: "/staff/login" });
            }}
            className="p-3 -ml-3 text-foreground/60 hover:text-foreground active:scale-95 transition-all bg-secondary/50 backdrop-blur-md rounded-full border border-border/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          {logoUrl && (
            <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded-md object-cover border border-border/50" />
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
            {appData?.name || eventDetails?.title || "Event Dashboard"}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider rounded-lg border border-border/50">
              {authState.name || authState.role}
            </span>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-lg border border-primary/20">
              {authState.allowed_sections?.includes("*") ? "All Access" : "Restricted Sections"}
            </span>
          </div>
        </div>

        {(!appData || !appData.app_modules || appData.app_modules.length === 0) ? (
           <div className="bg-secondary/30 border border-dashed border-border/50 rounded-[2rem] p-8 text-center">
             <Shield className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
             <h4 className="font-bold text-lg mb-2">No Modules Assigned</h4>
             <p className="text-muted-foreground text-sm">
               This app has no configured modules. Customize it in the App Builder.
             </p>
           </div>
        ) : (
          <div className={`grid gap-4 ${
            brandingConfig.mobile_layout === "list" ? "grid-cols-1" : 
            brandingConfig.dashboard_columns === "3" ? "grid-cols-2 md:grid-cols-3" :
            brandingConfig.dashboard_columns === "4" ? "grid-cols-2 md:grid-cols-4" :
            "grid-cols-2"
          }`}>
            {appData.app_modules
              .filter((m: any) => m.type !== "branding_config" && AVAILABLE_MODULES.some((a) => a.type === m.type))
              .sort((a: any, b: any) => a.order - b.order)
              .map((m: any) => {
                const config = typeof m.config === "string" ? JSON.parse(m.config) : m.config || {};
                
                // For Event Staff, check visibility_roles
                if (config.visibility_roles) {
                  const visibilityRoles = config.visibility_roles
                    .split(",")
                    .map((r: string) => r.trim().toLowerCase())
                    .filter(Boolean);
                  const userRole = (authState.name || "").toLowerCase();
                  if (visibilityRoles.length > 0 && !visibilityRoles.includes(userRole)) {
                    return null;
                  }
                }

                const ModIcon = AVAILABLE_MODULES.find(x => x.type === m.type)?.icon || LayoutGrid;

                if (m.type === "stats") {
                  return (
                    <div key={m.id} className="space-y-4 mb-6 col-span-full">
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
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={m.id}
                    onClick={() => {
                       if (m.type === "scanner") {
                          if (perms.includes("SCAN_TICKETS") || perms.includes("*")) setShowScanner(true);
                          else alert("You do not have permission to scan tickets.");
                       }
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

        <div className="pt-6">
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
        </div>
      </main>
    </div>
  );
}
