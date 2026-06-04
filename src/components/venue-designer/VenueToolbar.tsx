import { Accessibility, Crown, Eraser, Square } from "lucide-react";
import { SeatStatus } from "./types";

export const statusColors: Record<SeatStatus, string> = {
  available: "#cbd5e1",
  vip: "#f97316",
  accessible: "#0ea5e9",
  blocked: "#1f2937",
  stage: "#111111",
};

export const tools: { id: SeatStatus; label: string; icon: any }[] = [
  { id: "available", label: "Seat", icon: Square },
  { id: "vip", label: "VIP", icon: Crown },
  { id: "accessible", label: "Accessible", icon: Accessibility },
  { id: "blocked", label: "Blocked", icon: Eraser },
];

export function VenueToolbar({
  activeTool,
  setTool,
}: {
  activeTool: SeatStatus;
  setTool: (tool: SeatStatus) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-lg">
      <div className="flex flex-wrap gap-2">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-all ${
              activeTool === t.id
                ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                : "border-border/60 hover:bg-secondary hover:text-foreground text-muted-foreground"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4 px-2 text-xs font-medium text-muted-foreground">
        {(Object.keys(statusColors) as SeatStatus[])
          .filter((k) => k !== "stage")
          .map((k) => (
            <span key={k} className="flex items-center gap-2">
              <span
                className="h-3.5 w-3.5 rounded-sm shadow-sm"
                style={{ background: statusColors[k] }}
              />
              <span className="capitalize">{k}</span>
            </span>
          ))}
      </div>
    </div>
  );
}
