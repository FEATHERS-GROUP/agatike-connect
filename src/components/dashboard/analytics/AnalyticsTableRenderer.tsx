import React from "react";
import { TabConfig } from "./AnalyticsDashboard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  config: TabConfig;
  data: any[];
}

const AVAILABLE_COLUMNS: Record<string, { id: string; label: string }[]> = {
  workspaces: [
    { id: "name", label: "Workspace Name" },
    { id: "created_at", label: "Created At" },
    { id: "city", label: "City" },
    { id: "logo", label: "Logo URL" },
  ],
  events: [
    { id: "title", label: "Event Title" },
    { id: "created_at", label: "Created At" },
    { id: "category", label: "Category" },
    { id: "event_type", label: "Event Type" },
    { id: "venue_details", label: "Venue Details" },
    { id: "tour_stops", label: "Tour Stops" },
  ],
  attendees: [
    { id: "created_at", label: "Created At" },
    { id: "status", label: "Status" },
    { id: "email", label: "Attendee Email" },
    { id: "names", label: "Attendee Name" },
    { id: "phone", label: "Phone" },
    { id: "type", label: "Purchase Type" },
    { id: "ticket_type", label: "Ticket Type" },
    { id: "quanity", label: "Quantity" },
    { id: "qrcode_number", label: "QR Code" },
  ],
  orders: [
    { id: "created_at", label: "Created At" },
    { id: "amount_paid", label: "Amount Paid" },
    { id: "status", label: "Status" },
    { id: "qty", label: "Quantity" },
    { id: "phone", label: "Customer Phone" },
    { id: "size", label: "Size" },
    { id: "picked", label: "Picked Up?" },
    { id: "product.name", label: "Product Name" },
    { id: "product.type", label: "Product Type" },
  ],
  movies: [
    { id: "title", label: "Title" },
    { id: "created_at", label: "Created At" },
    { id: "genre", label: "Genre" },
    { id: "duration", label: "Duration (mins)" },
    { id: "language", label: "Language" },
    { id: "release_date", label: "Release Date" },
  ],
  cinema_bookings: [
    { id: "total_price", label: "Total Price" },
    { id: "quantity", label: "Quantity" },
    { id: "created_at", label: "Created At" },
    { id: "status", label: "Status" },
    { id: "customer_email", label: "Customer Email" },
    { id: "customer_phone", label: "Customer Phone" },
    { id: "payment_method", label: "Payment Method" },
  ],
  reviews: [
    { id: "rating", label: "Rating" },
    { id: "reviewer_name", label: "Reviewer Name" },
    { id: "reviewer_email", label: "Reviewer Email" },
    { id: "created_at", label: "Created At" },
    { id: "title", label: "Title" },
    { id: "body", label: "Body" },
    { id: "source", label: "Source" },
    { id: "is_verified", label: "Verified?" },
  ],
  forms: [
    { id: "title", label: "Form Title" },
    { id: "description", label: "Description" },
    { id: "created_at", label: "Created At" },
  ],
  facilities: [
    { id: "name", label: "Venue Name" },
    { id: "created_at", label: "Created At" },
    { id: "price_per_day", label: "Price / Day" },
    { id: "capacity", label: "Capacity" },
    { id: "location", label: "Location" },
  ],
  default: [
    { id: "created_at", label: "Created At" },
    { id: "title", label: "Title" },
    { id: "name", label: "Name" },
    { id: "status", label: "Status" },
  ],
};

// Utility to resolve dot-notation paths (e.g., user.email)
function resolvePath(obj: any, path: string) {
  return path.split(".").reduce((prev, curr) => (prev ? prev[curr] : null), obj);
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
      <div className="flex flex-col items-center justify-center p-12 bg-card border border-border/60 rounded-3xl shadow-sm text-center">
        <h3 className="text-xl font-bold mb-2">No Data Available</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          There is no data matching your current filters and date range.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/60 rounded-3xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border/60 flex items-center justify-between bg-muted/10">
        <div>
          <h2 className="text-xl font-bold">Data Table</h2>
          <p className="text-sm text-muted-foreground">Showing {data.length} records</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => (
                <TableHead key={col.id} className="whitespace-nowrap font-semibold">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={row.id || rowIndex}>
                {columns.map(col => {
                  const val = resolvePath(row, col.id);
                  let displayVal = val;
                  
                  // Simple formatting
                  if (col.id === "created_at" || col.id === "startDate") {
                    displayVal = val ? new Date(val).toLocaleDateString() : "-";
                  } else if (typeof val === "object" && val !== null) {
                    displayVal = JSON.stringify(val);
                  } else if (val === null || val === undefined) {
                    displayVal = "-";
                  }

                  return (
                    <TableCell key={`${row.id || rowIndex}-${col.id}`} className="max-w-[200px] truncate">
                      {displayVal}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
