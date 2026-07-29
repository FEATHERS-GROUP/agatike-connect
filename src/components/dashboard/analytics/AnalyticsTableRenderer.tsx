import React from "react";
import { TabConfig } from "./AnalyticsDashboard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

interface Props {
  config: TabConfig;
  data: any[];
}

const AVAILABLE_COLUMNS: Record<string, { id: string; label: string; type: "string" | "number" | "date" | "boolean" }[]> = {
  workspaces: [
    { id: "name", label: "Workspace Name", type: "string" },
    { id: "created_at", label: "Created At", type: "date" },
    { id: "city", label: "City", type: "string" },
    { id: "type", label: "Type", type: "string" },
  ],
  events: [
    { id: "title", label: "Event Title", type: "string" },
    { id: "created_at", label: "Created At", type: "date" },
    { id: "category", label: "Category", type: "string" },
    { id: "event_type", label: "Event Type", type: "string" },
    { id: "tour_stops.city", label: "Tour Stop City", type: "string" },
    { id: "event_tickets.name", label: "Ticket Name", type: "string" },
    { id: "event_tickets.cost", label: "Ticket Cost", type: "number" },
    { id: "event_tickets.sold", label: "Tickets Sold", type: "number" },
    { id: "workspaces.name", label: "Workspace Name", type: "string" },
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
    { id: "payment_method", label: "Payment Method", type: "string" },
    { id: "events.title", label: "Event Title", type: "string" },
    { id: "events.category", label: "Event Category", type: "string" },
    { id: "event_tickets.name", label: "Ticket Name", type: "string" },
    { id: "event_tickets.cost", label: "Ticket Cost", type: "number" },
    { id: "event_tickets.product_orders.amount_paid", label: "Product Order Amount", type: "number" },
    { id: "user_id", label: "Account ID (Blank = Guest)", type: "string" },
    { id: "users.username", label: "User Profile Name", type: "string" },
    { id: "users.country", label: "User Country", type: "string" },
    { id: "users.gender", label: "User Gender", type: "string" },
    { id: "users.dateOfBirth", label: "Date of Birth", type: "string" },
  ],
  venue_bookings: [
    { id: "created_at", label: "Created At", type: "date" },
    { id: "start_time", label: "Start Date", type: "date" },
    { id: "end_time", label: "End Date", type: "date" },
    { id: "status", label: "Status", type: "string" },
    { id: "amount", label: "Amount", type: "number" },
    { id: "customer_name", label: "Customer Name", type: "string" },
    { id: "customer_email", label: "Customer Email", type: "string" },
  ],
  ticket_tiers: [
    { id: "created_at", label: "Created At", type: "date" },
    { id: "name", label: "Tier Name", type: "string" },
    { id: "price", label: "Price", type: "number" },
    { id: "type", label: "Type", type: "string" },
  ],
  products: [
    { id: "created_at", label: "Created At", type: "date" },
    { id: "name", label: "Product Name", type: "string" },
    { id: "type", label: "Type", type: "string" },
    { id: "price", label: "Price", type: "number" },
    { id: "stock_limit", label: "Stock Limit", type: "number" },
  ],
  orders: [
    { id: "created_at", label: "Created At", type: "date" },
    { id: "amount_paid", label: "Amount Paid", type: "number" },
    { id: "status", label: "Status", type: "string" },
    { id: "qty", label: "Quantity", type: "number" },
    { id: "phone", label: "Customer Phone", type: "string" },
    { id: "size", label: "Size", type: "string" },
    { id: "product.name", label: "Product Name", type: "string" },
    { id: "product.type", label: "Product Type", type: "string" },
    { id: "product.price", label: "Product Price", type: "number" },
  ],
  cinemas: [
    { id: "name", label: "Cinema Name", type: "string" },
    { id: "created_at", label: "Created At", type: "date" },
    { id: "city", label: "City", type: "string" },
    { id: "address", label: "Address", type: "string" },
    { id: "workspaces.name", label: "Workspace Name", type: "string" },
  ],
  movies: [
    { id: "title", label: "Title", type: "string" },
    { id: "created_at", label: "Created At", type: "date" },
    { id: "genre", label: "Genre", type: "string" },
    { id: "duration_minutes", label: "Duration (mins)", type: "number" },
  ],
  cinema_bookings: [
    { id: "total_price", label: "Total Price", type: "number" },
    { id: "quantity", label: "Quantity", type: "number" },
    { id: "created_at", label: "Created At", type: "date" },
    { id: "status", label: "Status", type: "string" },
    { id: "email", label: "Customer Email", type: "string" },
    { id: "payment_method", label: "Payment Method", type: "string" },
  ],
  reviews: [
    { id: "rating", label: "Rating", type: "number" },
    { id: "reviewer_name", label: "Reviewer Name", type: "string" },
    { id: "reviewer_email", label: "Reviewer Email", type: "string" },
    { id: "created_at", label: "Created At", type: "date" },
    { id: "events.title", label: "Event Title", type: "string" },
    { id: "events.category", label: "Event Category", type: "string" },
  ],
  forms: [
    { id: "title", label: "Form Title", type: "string" },
    { id: "created_at", label: "Created At", type: "date" },
    { id: "workspace.name", label: "Workspace Name", type: "string" },
  ],
  facilities: [
    { id: "name", label: "Venue Name", type: "string" },
    { id: "created_at", label: "Created At", type: "date" },
    { id: "capacity", label: "Capacity", type: "number" },
    { id: "workspace.name", label: "Workspace Name", type: "string" },
  ],
  memberships: [
    { id: "created_at", label: "Created At", type: "date" },
    { id: "status", label: "Status", type: "string" },
    { id: "user.email", label: "User Email", type: "string" },
    { id: "user.username", label: "User Name", type: "string" },
  ],
  workspace_users: [
    { id: "created_at", label: "Joined At", type: "date" },
    { id: "role", label: "Role", type: "string" },
    { id: "email", label: "User Email", type: "string" },
    { id: "status", label: "Status", type: "string" },
  ],
  wallet_transactions: [
    { id: "created_at", label: "Created At", type: "date" },
    { id: "updated_at", label: "Updated At", type: "date" },
    { id: "amount", label: "Amount", type: "number" },
    { id: "net_amount", label: "Net Amount", type: "number" },
    { id: "platform_fee", label: "Platform Fee", type: "number" },
    { id: "currency", label: "Currency", type: "string" },
    { id: "type", label: "Type", type: "string" },
    { id: "status", label: "Status", type: "string" },
    { id: "provider_status", label: "Provider Status", type: "string" },
    { id: "description", label: "Description", type: "string" },
    { id: "reference_id", label: "Reference ID", type: "string" },
    { id: "provider_reference", label: "Provider Reference", type: "string" },
    { id: "id", label: "Transaction ID", type: "string" },
  ],
  ledger_transactions: [
    { id: "created_at", label: "Created At", type: "date" },
    { id: "amount", label: "Amount", type: "number" },
    { id: "account_type", label: "Account Type", type: "string" },
  ],
  default: [
    { id: "created_at", label: "Created At", type: "date" },
    { id: "title", label: "Title", type: "string" },
    { id: "name", label: "Name", type: "string" },
    { id: "status", label: "Status", type: "string" },
  ],
};

// Utility to resolve dot-notation paths (e.g., user.email or events.title if it's an array)
function resolvePath(obj: any, path: string) {
  return path.split(".").reduce((prev, curr) => {
    if (prev === null || prev === undefined) return null;
    if (Array.isArray(prev)) {
      // If it's an array, map over it and extract the field, then join or return the first
      const vals = prev.map(p => p?.[curr]).filter(Boolean);
      return vals.length > 0 ? vals.join(", ") : null;
    }
    return prev[curr];
  }, obj);
}

export function AnalyticsTableRenderer({ config, data }: Props) {
  const allCols = AVAILABLE_COLUMNS[config.entityType] || AVAILABLE_COLUMNS.default;
  
  // If no columns are selected, show all available columns by default
  const selectedColIds = config.selectedColumns && config.selectedColumns.length > 0 
    ? config.selectedColumns 
    : allCols.map(c => c.id);

  const columns = allCols.filter(c => selectedColIds.includes(c.id));

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card border border-border/40 rounded-2xl shadow-sm text-center min-h-[400px]">
        <h3 className="text-xl font-bold mb-2">No Data Available</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          There is no data matching your current filters and date range.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/40 rounded-2xl shadow-sm overflow-hidden flex flex-col w-full">
      <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between bg-muted/5">
        <div>
          <h2 className="text-lg font-semibold text-foreground/90">Data Table</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Showing {data.length} records</p>
        </div>
      </div>
      
      <div className="overflow-x-auto flex-1 w-full relative">
        <Table className="w-full text-sm">
          <TableHeader className="bg-muted/30">
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              {columns.map(col => (
                <TableHead key={col.id} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground h-auto">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={row.id || rowIndex} className="border-b border-border/30 hover:bg-muted/20 transition-colors group">
                {columns.map(col => {
                  const val = resolvePath(row, col.id);
                  let displayVal = val;
                  
                  // Simple formatting
                  if (col.type === "date" || col.id === "created_at" || col.id === "startDate") {
                    displayVal = val ? new Date(val).toLocaleDateString() : "-";
                  } else if (typeof val === "object" && val !== null) {
                    displayVal = JSON.stringify(val);
                  } else if (val === null || val === undefined) {
                    displayVal = "-";
                  }

                  return (
                    <TableCell key={`${row.id || rowIndex}-${col.id}`} className="max-w-[250px] truncate px-4 py-3 text-foreground/80 group-hover:text-foreground transition-colors align-middle">
                      {displayVal}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
          
          {/* Render Footer for Totals */}
          {columns.some(c => c.type === "number") && (
            <TableFooter>
              <TableRow>
                {columns.map((col, index) => {
                  if (index === 0 && col.type !== "number") {
                    return <TableCell key="footer-first" className="font-bold">Total</TableCell>;
                  }
                  if (col.type === "number") {
                    // Compute sum safely
                    const total = data.reduce((acc, row) => {
                      const val = resolvePath(row, col.id);
                      if (val) {
                        if (typeof val === "string" && val.includes(",")) {
                          const arraySum = val.split(",").reduce((sumAcc, v) => {
                            const num = Number(v.trim());
                            return sumAcc + (isNaN(num) ? 0 : num);
                          }, 0);
                          return acc + arraySum;
                        } else if (!isNaN(Number(val))) {
                          return acc + Number(val);
                        }
                      }
                      return acc;
                    }, 0);
                    
                    return (
                      <TableCell key={`footer-${col.id}`} className="font-bold px-4 py-3 align-middle">
                        {total.toLocaleString()}
                      </TableCell>
                    );
                  }
                  return <TableCell key={`footer-${col.id}`} className="px-4 py-3 align-middle" />;
                })}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  );
}
