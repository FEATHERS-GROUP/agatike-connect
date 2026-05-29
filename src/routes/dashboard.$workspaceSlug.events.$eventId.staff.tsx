import { createFileRoute } from "@tanstack/react-router";
import { Plus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/staff")({
  component: StaffView,
});

function StaffView() {
  const staff = [
    { id: 1, name: "David Kim", role: "Security Lead", status: "Confirmed" },
    { id: 2, name: "Sarah Connor", role: "Bartender", status: "Pending Invite" },
    { id: 3, name: "Mike Tyson", role: "Box Office", status: "Confirmed" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Staff Members</h1>
          <p className="text-sm text-muted-foreground">Manage your team and assign roles for the event.</p>
        </div>
        <Button className="rounded-full shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
          <Plus className="mr-1 h-4 w-4" /> Add Staff
        </Button>
      </header>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Assigned Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {staff.map((s) => (
              <tr key={s.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <p className="font-semibold text-foreground">{s.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">{s.role}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    s.status === 'Confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
