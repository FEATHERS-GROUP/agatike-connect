import { Button } from "@/components/ui/button";

export function DesktopSalesChart({ liveEvent }: { liveEvent?: any }) {
  const firstStop = liveEvent?.tour_stops?.[0];
  const location = firstStop
    ? `${firstStop.venue ? firstStop.venue + " · " : ""}${firstStop.city || ""}`
    : "";

  return (
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
        <h3 className="font-semibold">{liveEvent ? "Live event" : "No live event"}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {liveEvent ? `${liveEvent.title}${location ? ` · ${location}` : ""}` : "No events are currently live"}
        </p>
        <div className="mt-4 space-y-3">
          <Stat label="Checked in" value="0 / 0" pct={0} />
          <Stat label="Bar revenue" value="$0" pct={0} />
          <Stat label="Merch sold" value="0" pct={0} />
        </div>
        <Button variant="outline" className="mt-5 w-full rounded-full" disabled={!liveEvent}>
          Open scanner
        </Button>
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
  const points = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const max = 100; // avoid divide by 0 if max is 0
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
