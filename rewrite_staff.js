const fs = require("fs");
const path = require("path");

const targetPath = path.join(__dirname, "src/routes/staff.event.$eventId.tsx");

const content = `import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEventById } from "@/api/events";
import { getAppById } from "@/api/app-studio";
import { loginCompanyUser, getStaffAssignmentsByEmail } from "@/api/staff_portal_auth";
import { getBadgeProjectByEventId } from "@/api/badges";
import {
  Lock, ArrowLeft, ScanLine, Users, Activity, ExternalLink, Calendar, MapPin, XCircle, CheckCircle2, Ticket, Shield, ArrowRight, BadgeCheck, CreditCard, UserCheck, Wallet, CalendarCheck, UserPlus, LayoutGrid, ChevronRight
} from "lucide-react";
import { ScannerMobile } from "@/components/mobile/ScannerMobile";

export const Route = createFileRoute("/staff/event/$eventId")({
  component: StaffEventDashboard,
});

function Numpad({
  onPinComplete,
  error,
  themeColor,
}: {
  onPinComplete: (pin: string) => void;
  error: string;
  themeColor: string;
}) {
  const [pin, setPin] = useState("");

  const handlePress = (num: string) => {
    if (pin.length < 9) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 9) {
        onPinComplete(newPin);
        setTimeout(() => setPin(""), 500);
      }
    }
  };

  const handleDelete = () => setPin(pin.slice(0, -1));

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex gap-2 mb-10">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className={\`w-3 h-3 rounded-full transition-all duration-300 \${
              pin.length > i
                ? "bg-primary shadow-[0_0_10px_var(--color-primary)] scale-125"
                : "bg-black/10 dark:bg-white/20"
            }\`}
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

const SESSION_TIMEOUT = 60 * 60 * 1000;

function StaffEventDashboard() {
  const { eventId } = Route.useParams();
  const navigate = useNavigate();

  const { data: eventDetails } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById({ data: { id: eventId } } as any),
    enabled: !!eventId,
  });

  const { data: appData } = useQuery({
    queryKey: ["workspace-app", eventDetails?.app_id],
    queryFn: () => getAppById({ data: { id: eventDetails?.app_id } } as any),
    enabled: !!eventDetails?.app_id,
  });

  const { data: badgeProject } = useQuery({
    queryKey: ["badge-project", eventId],
    queryFn: () => getBadgeProjectByEventId({ data: { event_id: eventId } } as any),
    enabled: !!eventId,
  });

  const [authState, setAuthState] = useState<{
    role: "workspace_user" | "organizer" | "event_staff";
    email: string;
    name?: string;
    id: string; // User ID or Assignment ID
    app_permissions?: string[];
    allowed_sections?: string[];
  } | null>(() => {
    try {
      const stored = localStorage.getItem(\`staff_auth_\${eventId}\`);
      if (stored) {
        const lastActive = localStorage.getItem(\`staff_session_\${eventId}\`);
        if (lastActive && Date.now() - parseInt(lastActive) < SESSION_TIMEOUT) {
          return JSON.parse(stored);
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [loginStep, setLoginStep] = useState<"gateway" | "company" | "staff_email" | "staff_event_select" | "staff_pin">("gateway");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffAssignments, setStaffAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [showScanner, setShowScanner] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const [scans, setScans] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(\`scan_stats_\${eventId}\`);
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
      localStorage.setItem(\`scan_stats_\${eventId}\`, JSON.stringify(newScans));
      return newScans;
    });
  }, [eventId]);

  useEffect(() => {
    if (!authState) return;

    let lastActivity = Date.now();
    localStorage.setItem(\`staff_auth_\${eventId}\`, JSON.stringify(authState));
    localStorage.setItem(\`staff_session_\${eventId}\`, lastActivity.toString());

    const handleActivity = () => { lastActivity = Date.now(); };
    const events = ["mousedown", "keypress", "scroll", "touchstart"];
    events.forEach((e) => document.addEventListener(e, handleActivity, { passive: true }));

    const interval = setInterval(() => {
      const storedActivity = parseInt(localStorage.getItem(\`staff_session_\${eventId}\`) || "0");
      const maxActivity = Math.max(lastActivity, storedActivity);

      if (Date.now() - maxActivity >= SESSION_TIMEOUT) {
        setAuthState(null);
        localStorage.removeItem(\`staff_session_\${eventId}\`);
      } else if (lastActivity > storedActivity) {
        localStorage.setItem(\`staff_session_\${eventId}\`, lastActivity.toString());
      }
    }, 10000);

    return () => {
      events.forEach((e) => document.removeEventListener(e, handleActivity));
      clearInterval(interval);
    };
  }, [authState, eventId]);

  const handleCompanyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await loginCompanyUser({ data: { email, password, eventId } } as any);
      if (res.success) {
        setAuthState({
          role: res.role as "workspace_user" | "organizer",
          email: res.email,
          name: res.name,
          id: res.id,
        });
      }
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleStaffEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const assignments = await getStaffAssignmentsByEmail({ data: { email: staffEmail } } as any);
      const activeForThisEvent = assignments.filter((a: any) => a.event_id === eventId);
      
      if (activeForThisEvent.length === 1) {
        setSelectedAssignment(activeForThisEvent[0]);
        setLoginStep("staff_pin");
      } else if (activeForThisEvent.length > 1) {
        setStaffAssignments(activeForThisEvent);
        setLoginStep("staff_event_select");
      } else {
        setLoginError("No staff assignment found for this event with that email.");
      }
    } catch (err: any) {
      setLoginError("Failed to verify staff email");
    } finally {
      setIsLoggingIn(false);
    }
  };

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

  const renderLoginScreen = () => (
    <div
      className={\`fixed inset-0 z-[100] flex flex-col items-center justify-center text-foreground px-6 w-full overflow-hidden \${fontClass}\`}
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
        <h1 className="text-2xl font-bold mb-1 text-center">{appData?.name || eventDetails?.title || "Staff Portal"}</h1>
        <p className="text-muted-foreground text-sm mb-8 text-center">
          {loginStep === "gateway" && "Choose your login method"}
          {loginStep === "company" && "Sign in to your workspace account"}
          {loginStep === "staff_email" && "Enter your staff email"}
          {loginStep === "staff_event_select" && "Select your assignment"}
          {loginStep === "staff_pin" && "Enter your 9-digit security PIN"}
        </p>

        {loginStep === "gateway" && (
          <div className="w-full space-y-4">
            <button 
              onClick={() => setLoginStep("staff_email")}
              className="w-full py-4 px-6 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] active:scale-95 transition-all flex items-center justify-between"
            >
              <span>Login as Event Staff</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setLoginStep("company")}
              className="w-full py-4 px-6 bg-secondary/80 backdrop-blur-md border border-border/50 rounded-2xl font-bold text-lg active:scale-95 transition-all flex items-center justify-between"
            >
              <span>Login as Company User</span>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        )}

        {loginStep === "company" && (
          <form onSubmit={handleCompanyLogin} className="w-full space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-5 py-4 rounded-xl bg-background/50 backdrop-blur-md border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-5 py-4 rounded-xl bg-background/50 backdrop-blur-md border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {loginError && <p className="text-destructive text-sm text-center">{loginError}</p>}
            <button 
              disabled={isLoggingIn}
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold mt-2 shadow-[0_5px_15px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] disabled:opacity-50"
            >
              {isLoggingIn ? "Authenticating..." : "Sign In"}
            </button>
            <button 
              type="button"
              onClick={() => setLoginStep("gateway")}
              className="w-full py-3 text-muted-foreground font-medium text-sm mt-4"
            >
              Back
            </button>
          </form>
        )}

        {loginStep === "staff_email" && (
          <form onSubmit={handleStaffEmailSubmit} className="w-full space-y-4">
            <input
              type="email"
              placeholder="Staff Email"
              className="w-full px-5 py-4 rounded-xl bg-background/50 backdrop-blur-md border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              required
            />
            {loginError && <p className="text-destructive text-sm text-center">{loginError}</p>}
            <button 
              disabled={isLoggingIn}
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold mt-2 shadow-[0_5px_15px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] disabled:opacity-50"
            >
              {isLoggingIn ? "Checking..." : "Continue"}
            </button>
            <button 
              type="button"
              onClick={() => setLoginStep("gateway")}
              className="w-full py-3 text-muted-foreground font-medium text-sm mt-4"
            >
              Back
            </button>
          </form>
        )}

        {loginStep === "staff_event_select" && (
          <div className="w-full space-y-3">
            {staffAssignments.map((a: any) => (
              <button
                key={a.id}
                onClick={() => {
                  setSelectedAssignment(a);
                  setLoginStep("staff_pin");
                }}
                className="w-full p-4 bg-background/50 backdrop-blur-md border border-border/50 rounded-xl flex items-center justify-between active:scale-95 transition-all"
              >
                <div className="text-left">
                  <h4 className="font-bold">{a.role}</h4>
                  <p className="text-xs text-muted-foreground">ID: {a.id.substring(0,8)}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
            <button 
              onClick={() => setLoginStep("staff_email")}
              className="w-full py-3 text-muted-foreground font-medium text-sm mt-4"
            >
              Back
            </button>
          </div>
        )}

        {loginStep === "staff_pin" && selectedAssignment && (
          <div className="w-full flex flex-col items-center">
            <Numpad
              themeColor={themeColor}
              error={loginError}
              onPinComplete={(pin) => {
                if (pin === String(selectedAssignment.pin_code)) {
                  setAuthState({
                    role: "event_staff",
                    email: staffEmail,
                    id: selectedAssignment.id,
                    app_permissions: selectedAssignment.app_permissions || [],
                    allowed_sections: selectedAssignment.allowed_sections || [],
                    name: selectedAssignment.role
                  });
                  setLoginError("");
                } else {
                  setLoginError("Incorrect PIN");
                }
              }}
            />
            <button 
              onClick={() => setLoginStep("staff_email")}
              className="mt-6 text-muted-foreground font-medium text-sm"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (!authState) {
    return renderLoginScreen();
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

  const isCompanyUser = authState.role === "workspace_user" || authState.role === "organizer";
  const perms = authState.app_permissions || [];
  
  // Handlers for restricted modules
  const handleRestrictedModuleClick = (moduleType: string) => {
    if (!isCompanyUser) {
      alert("Access Restricted: This module is restricted to Workspace Administrators.");
      return;
    }
    setActiveModal(moduleType);
  };

  return (
    <div
      className={\`min-h-[100dvh] text-foreground overflow-y-auto pb-safe \${fontClass}\`}
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
          <Link
            to="/profile"
            className="p-3 -ml-3 text-foreground/60 hover:text-foreground active:scale-95 transition-all bg-secondary/50 backdrop-blur-md rounded-full border border-border/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
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
              {isCompanyUser ? "Admin Access" : (authState.allowed_sections?.includes("*") ? "All Access" : "Restricted")}
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
          <div className={\`grid gap-4 \${
            brandingConfig.mobile_layout === "list" ? "grid-cols-1" : 
            brandingConfig.dashboard_columns === "3" ? "grid-cols-2 md:grid-cols-3" :
            brandingConfig.dashboard_columns === "4" ? "grid-cols-2 md:grid-cols-4" :
            "grid-cols-2"
          }\`}>
            {appData.app_modules
              .filter((m: any) => m.type !== "branding_config")
              .sort((a: any, b: any) => a.order - b.order)
              .map((m: any) => {
                const config = typeof m.config === "string" ? JSON.parse(m.config) : m.config || {};
                
                // For Event Staff, check visibility_roles
                if (!isCompanyUser && config.visibility_roles) {
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
                          if (isCompanyUser || perms.includes("SCAN_TICKETS")) setShowScanner(true);
                          else alert("You do not have permission to scan tickets.");
                       } else if (["wallet", "venues", "transactions", "venue_bookings", "members"].includes(m.type)) {
                          handleRestrictedModuleClick(m.type);
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

        <div className="mt-12 flex justify-center pb-12">
          <button 
            onClick={() => {
              setAuthState(null);
              localStorage.removeItem(\`staff_session_\${eventId}\`);
            }}
            className={\`px-10 py-4 rounded-full font-bold shadow-sm transition-all active:scale-95 \${
              brandingConfig.logout_style === "prominent" 
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_0_20px_color-mix(in_srgb,var(--color-destructive)_30%,transparent)]" 
                : "bg-secondary/80 backdrop-blur-md text-secondary-foreground border border-border/50 hover:bg-secondary"
            }\`}
          >
            Sign Out
          </button>
        </div>
      </main>

      {/* Modals will be rendered here based on activeModal */}
      {activeModal === "wallet" && (
         <div className="fixed inset-0 z-[200] bg-background">
            <div className="p-6 pt-safe-top">
               <button onClick={() => setActiveModal(null)} className="mb-4 text-primary">Close Wallet</button>
               <h1 className="text-2xl font-bold">Wallet Module</h1>
               <p>Implementation coming soon.</p>
            </div>
         </div>
      )}
      {activeModal === "venues" && (
         <div className="fixed inset-0 z-[200] bg-background">
            <div className="p-6 pt-safe-top">
               <button onClick={() => setActiveModal(null)} className="mb-4 text-primary">Close Venues</button>
               <h1 className="text-2xl font-bold">Venues Module</h1>
               <p>Implementation coming soon.</p>
            </div>
         </div>
      )}
      {activeModal === "transactions" && (
         <div className="fixed inset-0 z-[200] bg-background">
            <div className="p-6 pt-safe-top">
               <button onClick={() => setActiveModal(null)} className="mb-4 text-primary">Close Transactions</button>
               <h1 className="text-2xl font-bold">Transactions Module</h1>
               <p>Implementation coming soon.</p>
            </div>
         </div>
      )}
      {activeModal === "venue_bookings" && (
         <div className="fixed inset-0 z-[200] bg-background">
            <div className="p-6 pt-safe-top">
               <button onClick={() => setActiveModal(null)} className="mb-4 text-primary">Close Bookings</button>
               <h1 className="text-2xl font-bold">Venue Bookings Module</h1>
               <p>Implementation coming soon.</p>
            </div>
         </div>
      )}
      {activeModal === "members" && (
         <div className="fixed inset-0 z-[200] bg-background">
            <div className="p-6 pt-safe-top">
               <button onClick={() => setActiveModal(null)} className="mb-4 text-primary">Close Directory</button>
               <h1 className="text-2xl font-bold">Staff Directory Module</h1>
               <p>Implementation coming soon.</p>
            </div>
         </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(targetPath, content);
console.log("Successfully updated file.");
