import React, { useState, useEffect } from "react";
import { Plus, Save, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useNavigate } from "@tanstack/react-router";
import { AnalyticsChartRenderer } from "./AnalyticsChartRenderer";
import { getSavedQueries, saveQueries, AnalyticsFilter } from "@/api/advanced_analytics";
import { toast } from "sonner";
import { AnalyticsConfigurationModal } from "./AnalyticsConfigurationModal";

export interface TabConfig {
  id: string;
  name: string;
  entityType: string;
  startDate: Date;
  endDate: Date;
  groupBy: string;
  runTimestamp?: number;
  filters?: AnalyticsFilter;
  selectedColumns?: string[];
  displayMode?: "chart" | "table";
  chartType?: "bar" | "line";
  chartMetric?: string;
}

export function AnalyticsDashboard() {
  const { currentUser } = useWorkspace();
  const navigate = useNavigate();
  
  const [tabs, setTabs] = useState<TabConfig[]>([
    {
      id: "default-tab",
      name: "Tab 1",
      entityType: "orders",
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)),
      endDate: new Date(),
      groupBy: "month"
    }
  ]);
  const [activeTabId, setActiveTabId] = useState("default-tab");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);

  // Load saved queries from DB
  useEffect(() => {
    if (!currentUser?.id) return;
    
    async function load() {
      try {
        const saved = await getSavedQueries({ data: { user_id: currentUser.id } });
        if (saved && Array.isArray(saved) && saved.length > 0) {
          // parse dates
          const parsed = saved.map((t: any) => ({
            ...t,
            startDate: new Date(t.startDate),
            endDate: new Date(t.endDate)
          }));
          setTabs(parsed);
          setActiveTabId(parsed[0].id);
        }
      } catch (err) {
        console.error("Failed to load saved queries", err);
      } finally {
        setIsLoadingSaved(false);
      }
    }
    load();
  }, [currentUser?.id]);

  const handleSaveToDB = async () => {
    if (!currentUser?.id) return;
    setIsSaving(true);
    try {
      await saveQueries({ data: { user_id: currentUser.id, queries: tabs } });
      toast.success("Saved queries successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save queries");
    } finally {
      setIsSaving(false);
    }
  };

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const updateActiveTab = (updates: Partial<TabConfig>) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...updates } : t));
  };

  const addNewTab = () => {
    const newTab: TabConfig = {
      id: Math.random().toString(36).substring(7),
      name: `Tab ${tabs.length + 1}`,
      entityType: "orders",
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)),
      endDate: new Date(),
      groupBy: "month",
      filters: {
        type: "group",
        logicalOperator: "and",
        conditions: []
      }
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const removeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) setActiveTabId(newTabs[0].id);
  };

  if (isLoadingSaved) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background min-h-screen">
      {/* Header */}
      <div className="border-b border-border/60 p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/dashboard/workspaces" })}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Advanced Analytics</h1>
        </div>
        <Button 
          onClick={handleSaveToDB} 
          disabled={isSaving}
          size="sm"
          className="rounded-full shadow-[var(--shadow-glow)] gap-2 h-8 px-4 text-xs font-medium"
          style={{ background: "var(--gradient-primary)" }}
        >
          {isSaving ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Save className="h-3 w-3" />
          )}
          Save Queries
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center overflow-x-auto border-b border-border/60 bg-muted/20 p-2 gap-2 hide-scrollbar">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-colors border select-none whitespace-nowrap
              ${activeTabId === tab.id 
                ? "bg-card border-primary/50 text-primary shadow-sm" 
                : "bg-transparent border-transparent hover:bg-secondary text-muted-foreground"
              }
            `}
          >
            <span className="text-xs font-medium capitalize">
              {tab.entityType.replace(/_/g, ' ')}
            </span>
            {tabs.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive shrink-0"
                onClick={(e) => removeTab(tab.id, e)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
        <Button
          variant="ghost"
          size="icon"
          onClick={addNewTab}
          className="rounded-full h-8 w-8 shrink-0 text-muted-foreground"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8 relative">
          <div className="flex justify-end mb-4">
            <Button 
              variant="outline" 
              size="sm"
              className="rounded-full shadow-sm gap-2 h-8 text-xs px-4"
              onClick={() => setIsModalOpen(true)}
            >
              Configure Query
            </Button>
          </div>
          
          <AnalyticsChartRenderer config={activeTab} />
        </div>
      </div>
      
      {activeTab && (
        <AnalyticsConfigurationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          config={activeTab}
          onChange={updateActiveTab}
        />
      )}
    </div>
  );
}
