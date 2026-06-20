import { useState, useMemo } from "react";
import { Calendar, ChevronDown, BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface RevenueChartProps {
  allBookings: any[];
  workspaceCurrency: string;
}

export function RevenueChart({ allBookings, workspaceCurrency }: RevenueChartProps) {
  const [chartFilter, setChartFilter] = useState("This Week");
  const [showChartFilter, setShowChartFilter] = useState(false);

  const chartData = useMemo(() => {
    const dataMap = new Map();
    const today = new Date();
    today.setHours(0,0,0,0);

    let labels: string[] = [];
    if (chartFilter === "This Week") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        const label = d.toLocaleDateString(undefined, { weekday: 'short' });
        labels.push(key);
        dataMap.set(key, { label, value: 0 });
      }
    } else if (chartFilter === "This Month") {
      for (let i = 3; i >= 0; i--) {
        const key = `Week ${4-i}`;
        labels.push(key);
        dataMap.set(key, { label: key, value: 0 });
      }
    } else if (chartFilter === "This Year") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const label = d.toLocaleDateString(undefined, { month: 'short' });
        if (!labels.includes(key)) labels.push(key);
        dataMap.set(key, { label, value: 0 });
      }
    }

    allBookings.forEach((b: any) => {
      const d = new Date(b.created_at);
      let key = "";
      if (chartFilter === "This Week") {
        key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      } else if (chartFilter === "This Month") {
        const diffTime = Math.abs(today.getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 28) {
          const weekOffset = 3 - Math.floor((diffDays - 1) / 7);
          key = `Week ${weekOffset + 1}`;
        }
      } else if (chartFilter === "This Year") {
        if (d.getFullYear() === today.getFullYear() || (d.getFullYear() === today.getFullYear()-1 && d.getMonth() > today.getMonth())) {
          key = `${d.getFullYear()}-${d.getMonth()}`;
        }
      }

      if (key && dataMap.has(key)) {
        const existing = dataMap.get(key);
        existing.value += (b.total_price || 0);
        dataMap.set(key, existing);
      }
    });

    return Array.from(dataMap.values());
  }, [allBookings, chartFilter]);

  const maxChartValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-lg">Revenue Overview</h3>
            <p className="text-xs text-muted-foreground">Showing sales data for {chartFilter.toLowerCase()}</p>
          </div>
        </div>
        
        <div className="relative">
          <button
            className="flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/20 px-4 py-2 text-sm font-medium hover:bg-secondary/50 transition-colors"
            onClick={() => setShowChartFilter((p) => !p)}
          >
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {chartFilter}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          {showChartFilter && (
            <div className="absolute right-0 top-12 z-10 w-40 bg-card border border-border/60 rounded-xl shadow-lg overflow-hidden">
              {["This Week", "This Month", "This Year"].map((r) => (
                <button
                  key={r}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors ${
                    r === chartFilter ? "font-semibold text-primary" : ""
                  }`}
                  onClick={() => {
                    setChartFilter(r);
                    setShowChartFilter(false);
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-end gap-2 sm:gap-4 h-48 md:h-56 mt-4">
        {chartData.map((d: any) => {
          const pct = (d.value / maxChartValue) * 100;
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-3 group">
              <div
                className="w-full relative flex flex-col justify-end"
                style={{ height: "100%" }}
              >
                <div
                  className="w-full rounded-xl bg-primary/60 group-hover:bg-primary transition-all duration-500 relative"
                  style={{ height: `${pct || 2}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[11px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap z-10 shadow-lg pointer-events-none">
                    {formatCurrency(d.value, workspaceCurrency, true)}
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-medium truncate w-full text-center">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
