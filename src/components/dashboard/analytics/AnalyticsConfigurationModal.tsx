import React, { useState, useEffect } from "react";
import { TabConfig } from "./AnalyticsDashboard";
import { AnalyticsFilter, FilterGroup, FilterRule, LogicalOperator } from "@/api/advanced_analytics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Settings2, Type, Hash, Calendar, ToggleLeft } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: TabConfig;
  onChange: (updates: Partial<TabConfig>) => void;
}

const ENTITIES = [
  { id: "workspaces", label: "Workspaces" },
  { id: "events", label: "Events" },
  { id: "attendees", label: "Attendees" },
  { id: "orders", label: "Orders" },
  { id: "movies", label: "Movies (Cinema)" },
  { id: "cinema_bookings", label: "Cinema Bookings" },
  { id: "reviews", label: "Reviews & Feedback" },
  { id: "forms", label: "Forms & Responses" },
  { id: "facilities", label: "Facilities" },
];

const GROUP_BY_OPTIONS = [
  { id: "", label: "None (Raw Data)" },
  { id: "month", label: "By Month" },
  { id: "status", label: "By Status" },
  { id: "country", label: "By Country" },
];

const AVAILABLE_COLUMNS: Record<string, { id: string; label: string; type: "string" | "number" | "date" | "boolean" }[]> = {
  workspaces: [
    { id: "name", label: "Workspace Name", type: "string" },
    { id: "created_at", label: "Created At", type: "date" },
    { id: "city", label: "City", type: "string" },
    { id: "logo", label: "Logo URL", type: "string" },
  ],
  events: [
    { id: "title", label: "Event Title", type: "string" },
    { id: "created_at", label: "Created At", type: "date" },
    { id: "category", label: "Category", type: "string" },
    { id: "event_type", label: "Event Type", type: "string" },
    { id: "venue_details", label: "Venue Details", type: "string" },
    { id: "tour_stops", label: "Tour Stops", type: "string" },
  ],
  attendees: [
    { id: "created_at", label: "Created At", type: "date" },
    { id: "status", label: "Status", type: "string" },
    { id: "email", label: "Attendee Email", type: "string" },
    { id: "names", label: "Attendee Name", type: "string" },
    { id: "phone", label: "Phone", type: "string" },
    { id: "type", label: "Purchase Type", type: "string" },
    { id: "ticket_type", label: "Ticket Type", type: "string" },
    { id: "quanity", label: "Quantity", type: "number" },
    { id: "qrcode_number", label: "QR Code", type: "string" },
  ],
  orders: [
    { id: "created_at", label: "Created At", type: "date" },
    { id: "amount_paid", label: "Amount Paid", type: "number" },
    { id: "status", label: "Status", type: "string" },
    { id: "qty", label: "Quantity", type: "number" },
    { id: "phone", label: "Customer Phone", type: "string" },
    { id: "size", label: "Size", type: "string" },
    { id: "picked", label: "Picked Up?", type: "boolean" },
    { id: "product.name", label: "Product Name", type: "string" },
    { id: "product.type", label: "Product Type", type: "string" },
  ],
  movies: [
    { id: "title", label: "Title", type: "string" },
    { id: "created_at", label: "Created At", type: "date" },
    { id: "genre", label: "Genre", type: "string" },
    { id: "duration", label: "Duration (mins)", type: "number" },
    { id: "language", label: "Language", type: "string" },
    { id: "release_date", label: "Release Date", type: "date" },
  ],
  cinema_bookings: [
    { id: "total_price", label: "Total Price", type: "number" },
    { id: "quantity", label: "Quantity", type: "number" },
    { id: "created_at", label: "Created At", type: "date" },
    { id: "status", label: "Status", type: "string" },
    { id: "customer_email", label: "Customer Email", type: "string" },
    { id: "customer_phone", label: "Customer Phone", type: "string" },
    { id: "payment_method", label: "Payment Method", type: "string" },
  ],
  reviews: [
    { id: "rating", label: "Rating", type: "number" },
    { id: "reviewer_name", label: "Reviewer Name", type: "string" },
    { id: "reviewer_email", label: "Reviewer Email", type: "string" },
    { id: "created_at", label: "Created At", type: "date" },
    { id: "title", label: "Title", type: "string" },
    { id: "body", label: "Body", type: "string" },
    { id: "source", label: "Source", type: "string" },
    { id: "is_verified", label: "Verified?", type: "boolean" },
  ],
  forms: [
    { id: "title", label: "Form Title", type: "string" },
    { id: "description", label: "Description", type: "string" },
    { id: "created_at", label: "Created At", type: "date" },
  ],
  facilities: [
    { id: "name", label: "Venue Name", type: "string" },
    { id: "created_at", label: "Created At", type: "date" },
    { id: "price_per_day", label: "Price / Day", type: "number" },
    { id: "capacity", label: "Capacity", type: "number" },
    { id: "location", label: "Location", type: "string" },
  ],
  default: [
    { id: "created_at", label: "Created At", type: "date" },
    { id: "title", label: "Title", type: "string" },
    { id: "name", label: "Name", type: "string" },
    { id: "status", label: "Status", type: "string" },
  ],
};

const OPERATORS = {
  string: [
    { id: "_eq", label: "Is" },
    { id: "_neq", label: "Is not" },
    { id: "_ilike", label: "Contains" },
    { id: "_nilike", label: "Does not contain" },
    { id: "_is_null", label: "Is empty" },
  ],
  number: [
    { id: "_eq", label: "=" },
    { id: "_neq", label: "!=" },
    { id: "_gt", label: ">" },
    { id: "_gte", label: ">=" },
    { id: "_lt", label: "<" },
    { id: "_lte", label: "<=" },
  ],
  date: [
    { id: "_eq", label: "Is" },
    { id: "_gt", label: "Is after" },
    { id: "_lt", label: "Is before" },
  ],
  boolean: [
    { id: "_eq", label: "Is" },
  ],
};

function getFieldIcon(type: string) {
  switch (type) {
    case "string": return <Type className="h-4 w-4 text-muted-foreground mr-2" />;
    case "number": return <Hash className="h-4 w-4 text-muted-foreground mr-2" />;
    case "date": return <Calendar className="h-4 w-4 text-muted-foreground mr-2" />;
    case "boolean": return <ToggleLeft className="h-4 w-4 text-muted-foreground mr-2" />;
    default: return <Type className="h-4 w-4 text-muted-foreground mr-2" />;
  }
}

// Tree Node Component
function FilterTreeNode({ 
  node, 
  cols,
  isRoot,
  isFirstChild,
  parentLogicalOperator,
  onChange, 
  onRemove 
}: { 
  node: AnalyticsFilter; 
  cols: any[];
  isRoot: boolean;
  isFirstChild: boolean;
  parentLogicalOperator?: LogicalOperator;
  onChange: (node: AnalyticsFilter) => void;
  onRemove: () => void;
}) {
  if (node.type === "rule") {
    const selectedCol = cols.find(c => c.id === node.field);
    const colType = selectedCol ? selectedCol.type : "string";
    const ops = OPERATORS[colType] || OPERATORS.string;

    return (
      <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full">
        <div className="w-24 shrink-0 text-sm font-medium text-muted-foreground flex items-center justify-end pr-2">
          {isRoot && isFirstChild ? "Where" : (isFirstChild ? "-" : parentLogicalOperator?.toUpperCase() || "AND")}
        </div>
        
        <div className="flex h-10 flex-1 min-w-[200px] items-center rounded-xl border border-input bg-background px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-ring">
          {getFieldIcon(colType)}
          <select
            value={node.field}
            onChange={(e) => onChange({ ...node, field: e.target.value, operator: "_eq", value: "" })}
            className="flex-1 bg-transparent focus:outline-none w-full"
          >
            <option value="">Select Column...</option>
            {cols.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>

        <div className="flex h-10 w-full md:w-[150px] items-center rounded-xl border border-input bg-background px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-ring">
          <select
            value={node.operator}
            onChange={(e) => onChange({ ...node, operator: e.target.value })}
            className="flex-1 bg-transparent focus:outline-none w-full"
          >
            {ops.map((o: any) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>

        {node.operator !== "_is_null" && (
          <Input 
            type={colType === "date" ? "date" : colType === "number" ? "number" : "text"}
            value={node.value}
            onChange={(e) => onChange({ ...node, value: e.target.value })}
            placeholder="Value..."
            className="w-full md:flex-1 min-w-[150px] bg-background"
          />
        )}
        
        {!isRoot && (
          <Button variant="ghost" size="icon" onClick={onRemove} className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // It's a group
  return (
    <div className={`flex flex-col w-full ${!isRoot ? "border-l-2 border-border/50 ml-6 pl-6 pt-2 pb-2 relative" : ""}`}>
      {!isRoot && (
        <div className="absolute -left-[2px] top-4 w-6 border-t-2 border-border/50" />
      )}
      
      {!isRoot && (
        <div className="flex items-center gap-3 mb-3">
          <div className="w-24 shrink-0 text-sm font-medium text-muted-foreground flex items-center justify-end pr-2">
            {isFirstChild ? "-" : parentLogicalOperator?.toUpperCase() || "AND"}
          </div>
          <div className="flex h-10 w-24 items-center rounded-xl border border-input bg-background px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-ring">
            <select
              value={node.logicalOperator}
              onChange={(e) => onChange({ ...node, logicalOperator: e.target.value as LogicalOperator })}
              className="flex-1 bg-transparent focus:outline-none w-full font-semibold"
            >
              <option value="and">AND</option>
              <option value="or">OR</option>
            </select>
          </div>
          <Button variant="ghost" size="icon" onClick={onRemove} className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl ml-auto">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex flex-col space-y-3">
        {node.conditions.map((child, i) => (
          <FilterTreeNode
            key={i}
            node={child}
            cols={cols}
            isRoot={false}
            isFirstChild={i === 0}
            parentLogicalOperator={node.logicalOperator}
            onChange={(updatedChild) => {
              const newConditions = [...node.conditions];
              newConditions[i] = updatedChild;
              onChange({ ...node, conditions: newConditions });
            }}
            onRemove={() => {
              const newConditions = [...node.conditions];
              newConditions.splice(i, 1);
              onChange({ ...node, conditions: newConditions });
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4 ml-[108px]">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onChange({ ...node, conditions: [...node.conditions, { type: "rule", field: "", operator: "_eq", value: "" }] })} 
          className="text-primary hover:bg-primary/10 rounded-full h-8"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Condition
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onChange({ ...node, conditions: [...node.conditions, { type: "group", logicalOperator: "and", conditions: [{ type: "rule", field: "", operator: "_eq", value: "" }] }] })} 
          className="text-primary hover:bg-primary/10 rounded-full h-8"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Condition Group
        </Button>
      </div>
    </div>
  );
}


export function AnalyticsConfigurationModal({ isOpen, onClose, config, onChange }: Props) {
  const [localConfig, setLocalConfig] = useState<TabConfig>(config);

  useEffect(() => {
    if (isOpen) {
      // Ensure root is a group
      const c = { ...config };
      if (!c.filters || (c.filters.type !== "group" && Array.isArray(c.filters))) {
        c.filters = {
          type: "group",
          logicalOperator: "and",
          conditions: Array.isArray(c.filters) ? c.filters.map(f => ({ type: "rule", ...f })) : []
        };
      }
      setLocalConfig(c);
    }
  }, [isOpen, config]);

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleApply = () => {
    onChange({ 
      ...localConfig,
      runTimestamp: Date.now() 
    });
    onClose();
  };

  const toggleColumn = (colId: string) => {
    const cols = localConfig.selectedColumns || [];
    if (cols.includes(colId)) {
      setLocalConfig({ ...localConfig, selectedColumns: cols.filter(c => c !== colId) });
    } else {
      setLocalConfig({ ...localConfig, selectedColumns: [...cols, colId] });
    }
  };

  const cols = AVAILABLE_COLUMNS[localConfig.entityType] || AVAILABLE_COLUMNS.default;
  const selectedCols = localConfig.selectedColumns || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto sm:rounded-3xl p-0 border-none shadow-2xl bg-card">
        <div className="p-6 md:p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-2xl">
                <Settings2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">Filters & Configuration</DialogTitle>
                <DialogDescription className="text-base mt-1">
                  Build advanced queries to analyze your data visually.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-muted/20 p-5 rounded-2xl border border-border/50">
              <div className="space-y-2">
                <Label>Tab Name</Label>
                <Input 
                  value={localConfig.name} 
                  onChange={(e) => setLocalConfig({ ...localConfig, name: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Data Source</Label>
                <select
                  value={localConfig.entityType}
                  onChange={(e) => setLocalConfig({ ...localConfig, entityType: e.target.value, selectedColumns: [] })}
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {ENTITIES.map(ent => (
                    <option key={ent.id} value={ent.id}>{ent.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formatDate(localConfig.startDate)}
                  onChange={(e) => {
                    const d = new Date(e.target.value);
                    if (!isNaN(d.getTime())) setLocalConfig({ ...localConfig, startDate: d });
                  }}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formatDate(localConfig.endDate)}
                  onChange={(e) => {
                    const d = new Date(e.target.value);
                    if (!isNaN(d.getTime())) setLocalConfig({ ...localConfig, endDate: d });
                  }}
                  className="bg-background"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Advanced Filters</h3>
              </div>
              
              <div className="bg-muted/10 p-5 rounded-2xl border border-border/50">
                {localConfig.filters && localConfig.filters.type === "group" && (
                  <FilterTreeNode 
                    node={localConfig.filters} 
                    cols={cols} 
                    isRoot={true}
                    isFirstChild={true}
                    onChange={(n) => setLocalConfig({ ...localConfig, filters: n })}
                    onRemove={() => {}}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Display Mode</h3>
                <div className="flex bg-muted p-1 rounded-2xl w-max">
                  <button
                    onClick={() => setLocalConfig({ ...localConfig, displayMode: "chart" })}
                    className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${(!localConfig.displayMode || localConfig.displayMode === "chart") ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Chart View
                  </button>
                  <button
                    onClick={() => setLocalConfig({ ...localConfig, displayMode: "table" })}
                    className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${localConfig.displayMode === "table" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Table View
                  </button>
                </div>
                {(!localConfig.displayMode || localConfig.displayMode === "chart") && (
                  <div className="space-y-2 mt-4">
                    <Label>Group By (for Charts)</Label>
                    <select
                      value={localConfig.groupBy}
                      onChange={(e) => setLocalConfig({ ...localConfig, groupBy: e.target.value })}
                      className="flex h-10 w-full max-w-xs items-center rounded-xl border border-input bg-background px-3 py-2 text-sm"
                    >
                      {GROUP_BY_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {localConfig.displayMode === "table" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Table Columns</h3>
                  <div className="flex flex-wrap gap-2 p-4 bg-muted/20 rounded-xl border border-border/50">
                    {cols.map(c => (
                      <label key={c.id} className="flex items-center gap-2 bg-background border px-3 py-1.5 rounded-full text-sm cursor-pointer hover:border-primary/50 transition-colors">
                        <input 
                          type="checkbox"
                          checked={selectedCols.includes(c.id)}
                          onChange={() => toggleColumn(c.id)}
                          className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                        />
                        {c.label}
                      </label>
                    ))}
                    {selectedCols.length === 0 && (
                      <span className="text-sm text-muted-foreground italic">Select columns to display. If none, all available data is shown.</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 border-t bg-muted/10">
          <Button variant="ghost" onClick={onClose} className="rounded-full">Cancel</Button>
          <Button onClick={handleApply} className="rounded-full shadow-[var(--shadow-glow)] gap-2 px-8" style={{ background: "var(--gradient-primary)" }}>
            Apply & Fetch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
