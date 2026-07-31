import React, { useEffect, useState, useMemo } from "react";
import { TabConfig } from "./AnalyticsDashboard";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { executeAdvancedQuery } from "@/api/advanced_analytics";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { RefreshCw, LayoutTemplate } from "lucide-react";
import { AnalyticsTableRenderer } from "./AnalyticsTableRenderer";

interface Props {
  config: TabConfig;
}

// Utility to resolve dot-notation paths
function resolvePath(obj: any, path: string) {
  return path.split(".").reduce((prev, curr) => {
    if (prev === null || prev === undefined) return null;
    if (Array.isArray(prev)) {
      const vals = prev.map((p) => p?.[curr]).filter(Boolean);
      return vals.length > 0 ? vals.join(", ") : null;
    }
    return prev[curr];
  }, obj);
}

const COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#be185d"];

export function AnalyticsChartRenderer({ config }: Props) {
  const { currentUser } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any[] | null>(null);

  const fetchData = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await executeAdvancedQuery({
        data: {
          organizer_id: currentUser.id,
          entity_type: config.entityType,
          start_date: config.startDate.toISOString(),
          end_date: config.endDate.toISOString(),
          filters: config.filters,
        },
      });
      setRawData(res.rawData || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (config.runTimestamp) {
      fetchData();
    } else {
      setRawData(null);
    }
  }, [config.runTimestamp, currentUser?.id]);

  // Frontend Aggregation
  const chartData = useMemo(() => {
    if (!rawData || !config.groupBy) return [];

    const aggregated = new Map<string, number>();

    rawData.forEach((item: any) => {
      let key = "Unknown";

      // Resolve X-Axis Group Key
      if (config.groupBy === "month") {
        if (item.created_at) {
          const d = new Date(item.created_at);
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        }
      } else {
        const val = resolvePath(item, config.groupBy);
        if (val !== null && val !== undefined) {
          key = String(val);
        }
      }

      // Resolve Y-Axis Metric
      let metric = 1; // Default to Count
      if (config.chartMetric) {
        const val = resolvePath(item, config.chartMetric);
        if (val !== null && !isNaN(Number(val))) {
          metric = Number(val);
        } else {
          metric = 0; // If they asked for a sum, and it's missing, add 0
        }
      }

      aggregated.set(key, (aggregated.get(key) || 0) + metric);
    });

    return Array.from(aggregated.entries()).map(([name, value]) => ({ name, value }));
  }, [rawData, config.groupBy, config.chartMetric]);

  if (!config.runTimestamp) {
    return (
      <div className="bg-card border border-border/60 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
        <LayoutTemplate className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold mb-2">Ready to Query</h3>
        <p className="text-muted-foreground mb-6">
          Configure your filters above and click "Run Query" to fetch your analytics data.
        </p>
        <Button onClick={fetchData} variant="outline" className="rounded-full">
          <RefreshCw className="h-4 w-4 mr-2" /> Run Query
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-card border border-border/60 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
        <p className="text-muted-foreground font-medium">Running large dataset query...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border/60 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-4 mx-auto w-16 h-16 flex items-center justify-center">
          <span className="text-destructive font-bold text-2xl">!</span>
        </div>
        <h3 className="text-xl font-bold mb-2 text-destructive">Query Error</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={fetchData} variant="outline" className="rounded-full">
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  if (!rawData || rawData.length === 0) {
    return (
      <div className="bg-card border border-border/60 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
        <LayoutTemplate className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold mb-2">No Data Found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or date range.</p>
      </div>
    );
  }

  if (config.displayMode === "table") {
    return <AnalyticsTableRenderer config={config} data={rawData} />;
  }

  const hasAggregations = config.groupBy && chartData.length > 0;
  const isLine = config.chartType === "line";
  const label = config.chartMetric ? `Sum of ${config.chartMetric}` : "Count";

  return (
    <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm min-h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Visualization</h2>
          <p className="text-sm text-muted-foreground">
            {hasAggregations
              ? `Grouped by ${config.groupBy}`
              : `Showing ${rawData.length} raw records (Please select a "Group By" in filters to plot data)`}
          </p>
        </div>
      </div>

      <div className="w-full h-[400px] mt-4">
        {hasAggregations ? (
          <ResponsiveContainer width="100%" height="100%">
            {isLine ? (
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  dy={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name={label}
                  stroke={COLORS[0]}
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  dy={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="value"
                  name={label}
                  fill={COLORS[0]}
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center">
            <LayoutTemplate className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-1">Chart Requires Grouping</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Please open the configuration modal and select a "Group By" attribute to plot a chart.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
