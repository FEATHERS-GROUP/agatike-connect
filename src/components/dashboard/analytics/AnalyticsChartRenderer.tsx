import React, { useEffect, useState } from "react";
import { TabConfig } from "./AnalyticsDashboard";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { executeAdvancedQuery } from "@/api/advanced_analytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { RefreshCw, LayoutTemplate } from "lucide-react";

import { AnalyticsTableRenderer } from "./AnalyticsTableRenderer";

interface Props {
  config: TabConfig;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#8dd1e1", "#a4de6c"];

export function AnalyticsChartRenderer({ config }: Props) {
  const { currentUser } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ rawData: any[]; aggregatedData: any[] } | null>(null);
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

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
          group_by: config.groupBy || undefined,
          filters: config.filters,
        }
      });
      setData(res);
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
      setData(null); // Reset data when tab switches or no run
    }
  }, [config.runTimestamp, currentUser?.id]);

  if (!config.runTimestamp) {
    return (
      <div className="bg-card border border-border/60 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
        <LayoutTemplate className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold mb-2">Ready to Query</h3>
        <p className="text-muted-foreground mb-6">Configure your filters above and click "Run Query" to fetch your analytics data.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-card border border-border/60 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
        <p className="text-muted-foreground font-medium">Running large dataset query...</p>
        <p className="text-sm text-muted-foreground/70">This may take a moment depending on the date range.</p>
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

  if (!data || (data.aggregatedData.length === 0 && data.rawData.length === 0)) {
    return (
      <div className="bg-card border border-border/60 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
        <LayoutTemplate className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold mb-2">No Data Found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or date range.</p>
      </div>
    );
  }

  if (config.displayMode === "table") {
    return <AnalyticsTableRenderer config={config} data={data.rawData} />;
  }

  const hasAggregations = config.groupBy && data.aggregatedData.length > 0;

  return (
    <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm min-h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Visualization</h2>
          <p className="text-sm text-muted-foreground">
            {hasAggregations 
              ? `Grouped by ${config.groupBy}` 
              : `Showing ${data.rawData.length} raw records (No grouping applied)`}
          </p>
        </div>
        
        {hasAggregations && (
          <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-full border border-border/60">
            <Button
              variant={chartType === "bar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("bar")}
              className={`rounded-full h-8 px-4 ${chartType === "bar" ? "shadow-sm" : ""}`}
            >
              Bar
            </Button>
            <Button
              variant={chartType === "pie" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("pie")}
              className={`rounded-full h-8 px-4 ${chartType === "pie" ? "shadow-sm" : ""}`}
            >
              Pie
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 w-full relative min-h-[400px]">
        {hasAggregations ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={data.aggregatedData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'currentColor', opacity: 0.7 }}
                  axisLine={{ opacity: 0.2 }}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis 
                  tick={{ fill: 'currentColor', opacity: 0.7 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="var(--primary)" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={data.aggregatedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.aggregatedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)' }} />
              </PieChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>Please select a "Group By" option to view charts.</p>
            <p className="text-sm mt-2">Currently loaded {data.rawData.length} rows of raw data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
