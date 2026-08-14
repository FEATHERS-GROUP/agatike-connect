import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWorkspacesForStaffUser } from "@/api/staff_portal_workspaces";
import { getWorkspaceApps } from "@/api/app-studio";
import {
  ArrowLeft,
  Wallet,
  MapPin,
  CreditCard,
  CalendarCheck,
  UserCheck,
  Shield,
  ChevronDown,
} from "lucide-react";
import { ModuleModalWrapper } from "@/components/staff-portal/ModuleModalWrapper";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

export const Route = createFileRoute("/staff/workspace/$workspaceUserId")({
  component: StaffWorkspaceDashboard,
});

const SESSION_TIMEOUT = 60 * 60 * 1000;

function StaffWorkspaceDashboard() {
  const { workspaceUserId } = Route.useParams();
  const navigate = useNavigate();

  const [authState, setAuthState] = useState<{
    role: string;
    email: string;
    name?: string;
    id: string;
  } | null>(() => {
    try {
      const stored = localStorage.getItem(`staff_auth_ws_${workspaceUserId}`);
      if (stored) {
        const lastActive = localStorage.getItem(`staff_session_ws_${workspaceUserId}`);
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

  const { data: workspaces = [] } = useQuery({
    queryKey: ["staff-workspaces", workspaceUserId],
    queryFn: () => getWorkspacesForStaffUser({ data: { user_id: workspaceUserId } } as any),
    enabled: !!authState,
  });

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId]);

  const { data: rawApps = [] } = useQuery({
    queryKey: ["workspace-apps", selectedWorkspaceId],
    queryFn: () => getWorkspaceApps({ data: { workspace_id: selectedWorkspaceId } } as any),
    enabled: !!selectedWorkspaceId,
  });

  const selectedWorkspace = workspaces.find((w: any) => w.id === selectedWorkspaceId);

  const { limits } = useSubscriptionLimits(
    selectedWorkspace?.orgnizer_id,
    selectedWorkspaceId ?? undefined,
  );

  const limit = limits.max_custom_apps === undefined || limits.max_custom_apps === -1 ? Infinity : limits.max_custom_apps;
  const sortedApps = [...rawApps].sort((a: any, b: any) => new Date(b.created_at || b.updated_at || 0).getTime() - new Date(a.created_at || a.updated_at || 0).getTime());
  const apps = limit === Infinity ? sortedApps : sortedApps.slice(0, limit);

  // Use the first app in the workspace for branding, or default
  const appData = apps.length > 0 ? apps[0] : null;

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showWorkspaceSelector, setShowWorkspaceSelector] = useState(false);

  if (!authState) return null;

  const themeColor = appData?.theme_color || "#ff3b30";
  const logoUrl = appData?.logo_url;

  const brandingConfig = (() => {
    let config = {
      font_family: "inter",
      background_color: "#ffffff",
      dashboard_columns: "2",
      mobile_layout: "grid",
      logout_style: "subtle",
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

  const renderModuleButton = (type: string, title: string, desc: string, Icon: any) => {
    // Check if the module is configured in the app
    const isConfigured = appData?.app_modules?.some((m: any) => m.type === type);
    if (!isConfigured) return null;

    return (
      <button
        onClick={() => setActiveModal(type)}
        className="w-full bg-background/60 backdrop-blur-xl border border-border/50 rounded-[2rem] p-6 text-left active:scale-[0.98] transition-all group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-6 opacity-5 transform translate-x-4 -translate-y-4 group-active:scale-110 transition-transform">
          <Icon className="h-32 w-32 text-foreground" />
        </div>
        <div className="relative z-10 flex flex-col gap-4">
          <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center border border-border/50 text-foreground">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <h4 className="font-black text-2xl tracking-tight mb-1">{title}</h4>
            <p className="text-muted-foreground text-sm font-medium">{desc}</p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div
      className={`min-h-[100dvh] text-foreground overflow-y-auto pb-safe ${fontClass}`}
      style={
        {
          "--color-primary": themeColor,
          backgroundColor:
            brandingConfig.background_color && brandingConfig.background_color !== "#ffffff"
              ? brandingConfig.background_color
              : "hsl(var(--background))",
          fontFamily: !fontClassMap[brandingConfig.font_family]
            ? brandingConfig.font_family
            : undefined,
        } as React.CSSProperties
      }
    >
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none -z-10" />
      <div className="absolute top-0 left-0 right-0 h-96 bg-primary/10 blur-[100px] pointer-events-none -z-10 rounded-full mix-blend-screen" />

      <header className="px-6 pt-safe-top pb-2 flex items-center justify-between relative z-10 mt-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setAuthState(null);
              localStorage.removeItem(`staff_session_ws_${workspaceUserId}`);
              navigate({ to: "/staff/login" });
            }}
            className="p-3 -ml-3 text-foreground/60 hover:text-foreground active:scale-95 transition-all bg-secondary/50 backdrop-blur-md rounded-full border border-border/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-8 w-8 rounded-md object-cover border border-border/50"
            />
          )}
        </div>
        <div className="bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full flex items-center gap-2.5 backdrop-blur-md shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
          <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)] animate-pulse" />
          <span className="text-primary text-xs font-black tracking-widest uppercase">Admin</span>
        </div>
      </header>

      <main className="px-6 pt-6 pb-24 relative z-10 space-y-10">
        <div>
          <button
            onClick={() => setShowWorkspaceSelector(!showWorkspaceSelector)}
            className="text-4xl font-black mb-2 leading-tight tracking-tight flex items-center gap-2 text-left"
          >
            {selectedWorkspace?.name || "Workspace"}
            {workspaces.length > 1 && (
              <ChevronDown className="h-6 w-6 text-muted-foreground mt-2" />
            )}
          </button>

          {showWorkspaceSelector && workspaces.length > 1 && (
            <div className="absolute z-20 mt-2 bg-background border border-border/50 rounded-2xl shadow-xl p-2 w-[calc(100%-3rem)] animate-in slide-in-from-top-2">
              {workspaces.map((w: any) => (
                <button
                  key={w.id}
                  onClick={() => {
                    setSelectedWorkspaceId(w.id);
                    setShowWorkspaceSelector(false);
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-secondary/50 active:bg-secondary font-bold"
                >
                  {w.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider rounded-lg border border-border/50">
              {authState.name || authState.role}
            </span>
          </div>
        </div>

        {!appData || !appData.app_modules || appData.app_modules.length === 0 ? (
          <div className="bg-secondary/30 border border-dashed border-border/50 rounded-[2rem] p-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h4 className="font-bold text-lg mb-2">No Modules Assigned</h4>
            <p className="text-muted-foreground text-sm">
              This app has no configured modules. Customize it in the App Builder.
            </p>
          </div>
        ) : (
          <div
            className={`grid gap-4 ${
              brandingConfig.mobile_layout === "list"
                ? "grid-cols-1"
                : brandingConfig.dashboard_columns === "3"
                  ? "grid-cols-2 md:grid-cols-3"
                  : brandingConfig.dashboard_columns === "4"
                    ? "grid-cols-2 md:grid-cols-4"
                    : "grid-cols-2"
            }`}
          >
            {renderModuleButton("wallet", "Wallet & Withdraw", "Manage balances", Wallet)}
            {renderModuleButton("venues", "Venues", "Manage locations", MapPin)}
            {renderModuleButton(
              "transactions",
              "Sales & Transactions",
              "View payments",
              CreditCard,
            )}
            {renderModuleButton(
              "venue_bookings",
              "Venue Bookings",
              "Manage venue bookings",
              CalendarCheck,
            )}
            {renderModuleButton("members", "Team Members", "Workspace staff directory", UserCheck)}
          </div>
        )}
      </main>

      {activeModal === "wallet" && (
        <ModuleModalWrapper title="Wallet & Withdraw" onClose={() => setActiveModal(null)}>
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 flex flex-col items-center justify-center mb-6">
            <Wallet className="h-12 w-12 text-primary mb-3" />
            <p className="text-sm font-bold text-primary uppercase tracking-widest">
              Available Balance
            </p>
            <h2 className="text-4xl font-black mt-1">RWF ---</h2>
          </div>
          <button className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl active:scale-95 transition-all">
            Request Withdrawal
          </button>
        </ModuleModalWrapper>
      )}
      {activeModal === "venues" && (
        <ModuleModalWrapper title="Venues" onClose={() => setActiveModal(null)}>
          <div className="text-center py-10">
            <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-bold">Venues Directory</h3>
            <p className="text-muted-foreground text-sm">Venue loading coming soon...</p>
          </div>
        </ModuleModalWrapper>
      )}
      {activeModal === "transactions" && (
        <ModuleModalWrapper title="Sales & Transactions" onClose={() => setActiveModal(null)}>
          <div className="text-center py-10">
            <CreditCard className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-bold">Recent Transactions</h3>
            <p className="text-muted-foreground text-sm">Transaction history coming soon...</p>
          </div>
        </ModuleModalWrapper>
      )}
      {activeModal === "venue_bookings" && (
        <ModuleModalWrapper title="Venue Bookings" onClose={() => setActiveModal(null)}>
          <div className="text-center py-10">
            <CalendarCheck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-bold">Venue Bookings</h3>
            <p className="text-muted-foreground text-sm">Bookings loading coming soon...</p>
          </div>
        </ModuleModalWrapper>
      )}
      {activeModal === "members" && (
        <ModuleModalWrapper title="Team Members" onClose={() => setActiveModal(null)}>
          <div className="text-center py-10">
            <UserCheck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-bold">Staff Directory</h3>
            <p className="text-muted-foreground text-sm">Directory loading coming soon...</p>
          </div>
        </ModuleModalWrapper>
      )}
    </div>
  );
}
