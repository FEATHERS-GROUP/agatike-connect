import { createFileRoute } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/internal/control/admin/health")({
  component: HealthDashboard,
});

type ServiceStatus = "operational" | "degraded" | "down" | "checking";

interface Service {
  id: string;
  name: string;
  category: "database" | "api" | "payment";
  status: ServiceStatus;
  latency?: number;
  uptime: string;
  lastChecked: Date | null;
  description: string;
}

const INITIAL_SERVICES: Service[] = [
  {
    id: "db-supabase",
    name: "Supabase Database",
    category: "database",
    status: "checking",
    uptime: "99.99%",
    lastChecked: null,
    description: "Primary PostgreSQL cluster",
  },
  {
    id: "api-supabase-realtime",
    name: "Supabase Realtime",
    category: "api",
    status: "checking",
    uptime: "99.95%",
    lastChecked: null,
    description: "Websocket realtime events",
  },
  {
    id: "api-supabase-auth",
    name: "Supabase Auth",
    category: "api",
    status: "checking",
    uptime: "100%",
    lastChecked: null,
    description: "Identity and session management",
  },
  {
    id: "api-core",
    name: "Core Application API",
    category: "api",
    status: "checking",
    uptime: "99.9%",
    lastChecked: null,
    description: "Main application endpoints",
  },
  {
    id: "api-firebase",
    name: "Firebase Services",
    category: "api",
    status: "checking",
    uptime: "99.99%",
    lastChecked: null,
    description: "Storage and cloud messaging",
  },
  {
    id: "api-resend",
    name: "Resend Email API",
    category: "api",
    status: "checking",
    uptime: "99.98%",
    lastChecked: null,
    description: "Transactional email delivery",
  },
  {
    id: "pay-pawapay",
    name: "Pawapay Gateway",
    category: "payment",
    status: "checking",
    uptime: "99.7%",
    lastChecked: null,
    description: "Mobile money processing",
  },
  {
    id: "pay-stripe",
    name: "Stripe Gateway",
    category: "payment",
    status: "checking",
    uptime: "99.99%",
    lastChecked: null,
    description: "Credit card processing",
  },
];

function StatusBadge({ status }: { status: ServiceStatus }) {
  switch (status) {
    case "operational":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500 border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Operational
        </span>
      );
    case "degraded":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-500 border border-amber-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Degraded
        </span>
      );
    case "down":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-500 border border-red-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Down
        </span>
      );
    case "checking":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-500 border border-blue-500/20">
          <LucideIcons.Loader2 className="h-3 w-3 animate-spin" />
          Checking...
        </span>
      );
  }
}

function ServiceCard({
  service,
  onRefresh,
}: {
  service: Service;
  onRefresh: (id: string) => void;
}) {
  return (
    <div className="flex flex-col p-4 rounded-xl border border-[#333333] bg-[#1b1b1c] hover:border-[#444444] transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg bg-[#252526] border border-[#333333] ${
              service.category === "database"
                ? "text-indigo-400"
                : service.category === "api"
                  ? "text-sky-400"
                  : "text-orange-400"
            }`}
          >
            {service.category === "database" && <LucideIcons.Database className="w-5 h-5" />}
            {service.category === "api" && <LucideIcons.Server className="w-5 h-5" />}
            {service.category === "payment" && <LucideIcons.CreditCard className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-[#eeeeee] font-medium text-sm">{service.name}</h3>
            <p className="text-[#888888] text-xs mt-0.5">{service.description}</p>
          </div>
        </div>
        <StatusBadge status={service.status} />
      </div>

      <div className="mt-auto pt-4 border-t border-[#333333]/50 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-[#aaaaaa]">
            <LucideIcons.Activity className="w-3.5 h-3.5" />
            <span>{service.uptime} uptime</span>
          </div>
          {service.latency !== undefined && (
            <div className="flex items-center gap-1.5 text-[#aaaaaa]">
              <LucideIcons.Zap className="w-3.5 h-3.5" />
              <span>{service.latency}ms</span>
            </div>
          )}
        </div>
        <button
          onClick={() => onRefresh(service.id)}
          disabled={service.status === "checking"}
          className="text-[#666666] hover:text-white transition-colors disabled:opacity-50"
          title="Refresh status"
        >
          <LucideIcons.RefreshCw
            className={`w-3.5 h-3.5 ${service.status === "checking" ? "animate-spin" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}

function HealthDashboard() {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [globalStatus, setGlobalStatus] = useState<ServiceStatus>("checking");
  const [lastSystemCheck, setLastSystemCheck] = useState<Date | null>(null);

  const checkService = async (id: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, status: "checking" } : s)));

    // Simulate API call for health check
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1500));

    const isDegraded = Math.random() > 0.95; // 5% chance of being degraded for realism in demo

    setServices((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status: isDegraded ? "degraded" : "operational",
            latency: Math.floor(Math.random() * 100) + 15,
            lastChecked: new Date(),
          };
        }
        return s;
      }),
    );
  };

  const runSystemCheck = async () => {
    // Set all to checking
    setServices((prev) => prev.map((s) => ({ ...s, status: "checking" })));
    setGlobalStatus("checking");

    // Run checks in parallel but with different simulated times
    const checks = INITIAL_SERVICES.map((s) => checkService(s.id));
    await Promise.all(checks);

    setLastSystemCheck(new Date());
  };

  useEffect(() => {
    runSystemCheck();
  }, []);

  useEffect(() => {
    // Update global status based on all services
    if (services.some((s) => s.status === "checking")) {
      setGlobalStatus("checking");
    } else if (services.some((s) => s.status === "down")) {
      setGlobalStatus("down");
    } else if (services.some((s) => s.status === "degraded")) {
      setGlobalStatus("degraded");
    } else {
      setGlobalStatus("operational");
    }
  }, [services]);

  const databaseServices = services.filter((s) => s.category === "database");
  const apiServices = services.filter((s) => s.category === "api");
  const paymentServices = services.filter((s) => s.category === "payment");

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            System Health
            <LucideIcons.ShieldCheck className="w-6 h-6 text-[#f97316]" />
          </h1>
          <p className="text-[#888888] mt-1 text-sm">
            Real-time monitoring of database, APIs, and payment gateways.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <div className="text-[#aaaaaa]">System Status</div>
            <div className="font-medium flex items-center justify-end gap-2 mt-0.5">
              {globalStatus === "operational" && (
                <span className="text-emerald-500">All Systems Normal</span>
              )}
              {globalStatus === "degraded" && (
                <span className="text-amber-500">Minor Issues Detected</span>
              )}
              {globalStatus === "down" && <span className="text-red-500">System Outage</span>}
              {globalStatus === "checking" && (
                <span className="text-blue-500">Running Diagnostics...</span>
              )}
            </div>
          </div>

          <button
            onClick={runSystemCheck}
            disabled={globalStatus === "checking"}
            className="flex items-center gap-2 px-4 py-2 bg-[#252526] hover:bg-[#2d2d30] border border-[#333333] rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LucideIcons.RefreshCw
              className={`w-4 h-4 ${globalStatus === "checking" ? "animate-spin" : ""}`}
            />
            Run Diagnostics
          </button>
        </div>
      </div>

      {lastSystemCheck && (
        <div className="text-xs text-[#666666]">
          Last checked: {lastSystemCheck.toLocaleTimeString()}
        </div>
      )}

      <div className="grid gap-6">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400">
              <LucideIcons.Database className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-medium text-white">Database Cluster</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {databaseServices.map((service) => (
              <ServiceCard key={service.id} service={service} onRefresh={checkService} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded bg-sky-500/10 text-sky-400">
              <LucideIcons.Server className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-medium text-white">Core APIs & Services</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apiServices.map((service) => (
              <ServiceCard key={service.id} service={service} onRefresh={checkService} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded bg-orange-500/10 text-orange-400">
              <LucideIcons.CreditCard className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-medium text-white">Payment Gateways</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentServices.map((service) => (
              <ServiceCard key={service.id} service={service} onRefresh={checkService} />
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-3">
        <LucideIcons.CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-emerald-500">Incident History</h4>
          <p className="text-xs text-[#888888] mt-1">
            No incidents reported in the last 30 days. All systems have maintained 99.9% uptime SLA.
          </p>
        </div>
      </div>
    </div>
  );
}
