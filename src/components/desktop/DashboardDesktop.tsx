import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  BarChart3,
  Users,
  ScanLine,
  ShoppingBag,
  Crown,
  Megaphone,
  Wallet,
  Settings,
  TrendingUp,
  DollarSign,
  Eye,
  Plus,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { events } from "@/lib/mock-data";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Workspaces", icon: Building2 },
  { label: "Events", icon: CalendarDays },
  { label: "Tickets", icon: Ticket },
  { label: "Analytics", icon: BarChart3 },
  { label: "Attendees", icon: Users },
  { label: "Scanning", icon: ScanLine },
  { label: "Merchandise", icon: ShoppingBag },
  { label: "VIP Access", icon: Crown },
  { label: "Campaigns", icon: Megaphone },
  { label: "Withdrawals", icon: Wallet },
  { label: "Settings", icon: Settings },
];

export function DashboardDesktop() {
  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-background p-4 md:block">
          <Link to="/" className="mb-6 flex items-center gap-2 px-2">
            <div
              className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground font-bold"
              style={{ background: "var(--gradient-primary)" }}
            >
              A
            </div>
            <span className="text-lg font-semibold">Agatike</span>
          </Link>
          <nav className="space-y-1 text-sm">
            {nav.map((n) => {
              const href =
                n.label === "Workspaces"
                  ? "/workspaces"
                  : n.label === "Scanning"
                    ? "/scanner"
                    : null;
              const cls = `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${n.active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-secondary"}`;
              return href ? (
                <Link key={n.label} to={href} className={cls}>
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              ) : (
                <button key={n.label} className={cls}>
                  <n.icon className="h-4 w-4" /> {n.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-8 rounded-2xl border border-border/60 p-4">
            <p className="text-sm font-semibold">Upgrade to Pro</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Branded pages, marketing & advanced analytics.
            </p>
            <Button
              className="mt-3 w-full rounded-full"
              style={{ background: "var(--gradient-primary)" }}
            >
              Upgrade
            </Button>
          </div>
        </aside>

        <main className="flex-1 p-6 lg:p-10">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Welcome back, Nala</p>
              <h1 className="text-2xl font-semibold">Here's what's happening today</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-full">
                Export
              </Button>
              <Link to="/workspaces">
                <Button variant="outline" className="rounded-full">
                  Workspaces
                </Button>
              </Link>
              <Link to="/create-event">
                <Button
                  className="rounded-full shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Plus className="mr-1 h-4 w-4" /> New event
                </Button>
              </Link>
            </div>
          </header>

          {/* KPIs */}
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              { label: "Revenue (30d)", value: "$48,920", delta: "+18.4%", icon: DollarSign },
              { label: "Tickets sold", value: "1,284", delta: "+9.1%", icon: Ticket },
              { label: "Page views", value: "92,310", delta: "+24%", icon: Eye },
              { label: "Conversion", value: "6.8%", delta: "+1.2pt", icon: TrendingUp },
            ].map((k) => (
              <div
                key={k.label}
                className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {k.label}
                  </p>
                  <k.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-2 text-2xl font-semibold">{k.value}</p>
                <p className="mt-1 text-xs text-primary">{k.delta} vs last period</p>
              </div>
            ))}
          </div>

          {/* Chart + live */}
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-card p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Ticket sales</h3>
                <div className="flex gap-1 text-xs">
                  {["7d", "30d", "90d"].map((p, i) => (
                    <button
                      key={p}
                      className={`rounded-full px-3 py-1 ${i === 1 ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6 h-56">
                <SalesChart />
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <h3 className="font-semibold">Live event</h3>
              <p className="mt-1 text-xs text-muted-foreground">Afrobeats Night Live · Eko</p>
              <div className="mt-4 space-y-3">
                <Stat label="Checked in" value="842 / 1,200" pct={70} />
                <Stat label="Bar revenue" value="$3,420" pct={48} />
                <Stat label="Merch sold" value="186" pct={62} />
              </div>
              <Button variant="outline" className="mt-5 w-full rounded-full">
                Open scanner
              </Button>
            </div>
          </div>

          {/* Recent orders */}
          <div className="mt-6 rounded-2xl border border-border/60 bg-card">
            <div className="flex items-center justify-between p-6">
              <h3 className="font-semibold">Recent orders</h3>
              <button className="text-sm text-primary hover:underline">View all</button>
            </div>
            <div className="divide-y divide-border/60">
              {events.slice(0, 5).map((e, i) => (
                <div key={e.id} className="flex items-center gap-4 px-6 py-3 text-sm">
                  <img src={e.cover} className="h-10 w-10 rounded-lg object-cover" alt="" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.organizer} · {e.date}
                    </p>
                  </div>
                  <span className="hidden md:inline text-xs text-muted-foreground">x{2 + i}</span>
                  <span className="font-semibold">${(e.price * (2 + i)).toFixed(0)}</span>
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                    Paid
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <section className="mt-12">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-xl font-semibold">Pricing</h2>
                <p className="text-sm text-muted-foreground">
                  Transparent fees. Pay only when you sell.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {[
                {
                  name: "Free",
                  price: "$0",
                  desc: "Up to 30 attendees",
                  features: ["Free scanning", "Free withdrawals", "Email support"],
                },
                {
                  name: "Pro",
                  price: "$29/mo",
                  featured: true,
                  desc: "For growing organizers",
                  features: [
                    "Branded event pages",
                    "Marketing tools",
                    "Advanced analytics",
                    "Priority support",
                  ],
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  desc: "Stadiums, festivals, conferences",
                  features: [
                    "Dedicated success team",
                    "API access",
                    "Custom integrations",
                    "On-site staff",
                  ],
                },
              ].map((p) => (
                <div
                  key={p.name}
                  className={`relative rounded-3xl border p-6 ${p.featured ? "border-primary shadow-[var(--shadow-glow)]" : "border-border/60"} bg-card`}
                >
                  {p.featured && (
                    <span
                      className="absolute -top-3 left-6 rounded-full px-3 py-1 text-xs text-primary-foreground"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      Most popular
                    </span>
                  )}
                  <p className="text-sm text-muted-foreground">{p.name}</p>
                  <p className="mt-1 text-3xl font-semibold">{p.price}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>
                  <ul className="mt-5 space-y-2 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <span className="grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] text-primary">
                          ✓
                        </span>{" "}
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`mt-6 w-full rounded-full ${p.featured ? "" : "bg-foreground text-background hover:bg-foreground/90"}`}
                    style={p.featured ? { background: "var(--gradient-primary)" } : undefined}
                  >
                    {p.featured
                      ? "Start Pro"
                      : p.name === "Enterprise"
                        ? "Contact sales"
                        : "Get started"}
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* Wizard preview */}
          <section className="mt-12 rounded-3xl border border-border/60 bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Create event</h2>
                <p className="text-sm text-muted-foreground">
                  A 7-step wizard, designed for speed.
                </p>
              </div>
              <Button className="rounded-full" style={{ background: "var(--gradient-primary)" }}>
                Resume draft
              </Button>
            </div>
            <ol className="mt-6 grid gap-3 md:grid-cols-7">
              {["Details", "Tickets", "Venue", "Media", "Merchandise", "VIP access", "Publish"].map(
                (s, i) => (
                  <li
                    key={s}
                    className={`rounded-2xl border p-3 text-xs ${i < 3 ? "border-primary bg-accent/40" : "border-border/60 bg-background"}`}
                  >
                    <p className="text-muted-foreground">Step {i + 1}</p>
                    <p className="mt-1 font-medium text-foreground">{s}</p>
                  </li>
                ),
              )}
            </ol>
          </section>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Need to scan?{" "}
            <Link to="/scanner" className="text-primary hover:underline">
              Open the mobile scanner →
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: "var(--gradient-primary)" }}
        />
      </div>
    </div>
  );
}

function SalesChart() {
  const points = [12, 28, 22, 40, 36, 52, 48, 64, 58, 72, 80, 76, 92, 88];
  const max = Math.max(...points);
  const w = 600,
    h = 220,
    step = w / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / max) * (h - 20)}`)
    .join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.7 0.2 45)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.7 0.2 45)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#g)" />
      <path
        d={path}
        fill="none"
        stroke="oklch(0.7 0.2 45)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
