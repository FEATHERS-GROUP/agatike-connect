import { createFileRoute } from "@tanstack/react-router";
import { Search, Download, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/customers")({
  component: CustomersView,
});

function CustomersView() {
  const customers = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", ticket: "VIP Pass", qty: 2, amount: "$240", date: "May 12, 2026" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", ticket: "General Admission", qty: 1, amount: "$45", date: "May 14, 2026" },
    { id: 3, name: "Charlie Davis", email: "charlie@example.com", ticket: "Early Bird", qty: 4, amount: "$120", date: "May 15, 2026" },
    { id: 4, name: "Diana Prince", email: "diana@example.com", ticket: "VIP Pass", qty: 1, amount: "$120", date: "May 18, 2026" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">Manage attendees and ticket buyers.</p>
        </div>
        <Button variant="outline" className="rounded-full shadow-sm">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </header>

      <div className="flex gap-4 items-center bg-card p-4 rounded-2xl border border-border/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or order ID..."
            className="pl-9 rounded-full bg-secondary/50 border-transparent"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Ticket Type</th>
              <th className="px-6 py-4 font-medium">Qty</th>
              <th className="px-6 py-4 font-medium">Amount Paid</th>
              <th className="px-6 py-4 font-medium">Purchase Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">{c.ticket}</td>
                <td className="px-6 py-4">{c.qty}</td>
                <td className="px-6 py-4 text-green-500 font-medium">{c.amount}</td>
                <td className="px-6 py-4 text-muted-foreground">{c.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
