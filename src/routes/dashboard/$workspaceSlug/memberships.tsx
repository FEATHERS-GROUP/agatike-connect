import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Users, Eye, RefreshCw, Building2, Download, UserPlus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MembersTable, type SpaceMember } from "@/components/desktop/dashboard/MembersTable";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getWorkspaceSubscriptionsByWorkspaceId } from "@/api/space_subscriptions";
import { getSpaces } from "@/api/spaces";
import { AddMemberModal } from "@/components/desktop/dashboard/AddMemberModal";
import { AddVisitorModal } from "@/components/desktop/dashboard/AddVisitorModal";

export const Route = createFileRoute("/dashboard/$workspaceSlug/memberships")({
  component: MembershipsPage,
});

const BILLING_CYCLES = ["Monthly", "Annually", "Daily", "Weekly", "One-time"];



// ── MembershipsPage ─────────────────────────────────────────────────────────
function MembershipsPage() {
  const { workspaceSlug } = useParams({ strict: false }) as any;
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["workspace_subscriptions", activeWorkspace?.id],
    queryFn: () => getWorkspaceSubscriptionsByWorkspaceId({ data: { workspace_id: activeWorkspace!.id } }),
    enabled: !!activeWorkspace?.id,
  });

  const { data: spaces = [] } = useQuery({
    queryKey: ["spaces", activeWorkspace?.id],
    queryFn: () => getSpaces({ data: { workspace_id: activeWorkspace!.id } }),
    enabled: !!activeWorkspace?.id,
  });

  // ── Derive members list ────────────────────────────────────────────────────
  const members: SpaceMember[] = useMemo(() => {
    if (isLoading) return [];
    const transformed: SpaceMember[] = [];
    for (const sub of subscriptions) {
      const isGroup   = sub.booking_type === "group";
      const isVisitor = sub.booking_type === "visitor";
      const status    = sub.status === "cancelled" || sub.status === "inactive" ? "Expired" : "Active";
      const joinedDate = sub.start_date
        ? new Date(sub.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : new Date(sub.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

      if (isGroup && sub.team_members && Array.isArray(sub.team_members)) {
        for (const member of sub.team_members) {
          transformed.push({
            id: `sub-${sub.id}-mem-${member.email || member.membership_id || Math.random()}`,
            name: member.name || "Unknown Member",
            email: member.email || undefined,
            phone: member.phone || undefined,
            membershipId: member.membership_id || undefined,
            type: "Company",
            category: "member",
            organization: sub.customer_name,
            plan: sub.plan_name,
            employees: sub.team_members.length,
            status: status as any,
            subscriptionType: "new",
            billedAs: "Organization",
            space: sub.space?.name,
            joinedDate,
          });
        }
      } else if (isVisitor) {
        transformed.push({
          id: `sub-${sub.id}`,
          name: sub.customer_name || "Unknown Visitor",
          email: sub.customer_email || undefined,
          phone: sub.customer_phone || undefined,
          hostedBy: sub.customer_address || undefined, // stored in customer_address field
          type: "Individual",
          category: "visitor",
          plan: undefined,
          employees: 1,
          status: status as any,
          subscriptionType: "new",
          billedAs: "Individual",
          space: sub.space?.name,
          joinedDate,
        });
      } else {
        transformed.push({
          id: `sub-${sub.id}`,
          name: sub.customer_name || "Unknown",
          email: sub.customer_email || undefined,
          phone: sub.customer_phone || undefined,
          membershipId: sub.id?.substring(0, 10).toUpperCase() || undefined,
          type: "Individual",
          category: "member",
          plan: sub.plan_name,
          employees: 1,
          status: status as any,
          subscriptionType: "new",
          billedAs: "Individual",
          space: sub.space?.name,
          joinedDate,
        });
      }
    }
    return transformed;
  }, [subscriptions, isLoading]);

  const stats = [
    { label: "Total Members",    value: members.filter(m => m.category === "member").length,                            icon: Users,     color: "text-orange-500",  bg: "bg-orange-500/10"  },
    { label: "Visitors",         value: members.filter(m => m.category === "visitor").length,                           icon: Eye,       color: "text-rose-500",    bg: "bg-rose-500/10"    },
    { label: "Re-using",         value: members.filter(m => m.subscriptionType === "returning").length,                 icon: RefreshCw, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Companies / Orgs", value: members.filter(m => m.type !== "Individual" && m.category === "member").length, icon: Building2, color: "text-purple-500",  bg: "bg-purple-500/10"  },
  ];

  // ── Add Member modal state ─────────────────────────────────────────────────
  const [showMemberModal, setShowMemberModal] = useState(false);

  // ── Add Visitor modal state ────────────────────────────────────────────────
  const [showVisitorModal, setShowVisitorModal] = useState(false);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Memberships</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            All members, visitors, and organizations across every space in{" "}
            <span className="text-foreground font-semibold">{activeWorkspace?.name ?? workspaceSlug}</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 rounded-xl h-11 px-5">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" onClick={() => setShowVisitorModal(true)} className="gap-2 rounded-xl h-11 px-5 border-rose-500/40 text-rose-500 hover:bg-rose-500/10">
            <UserRound className="h-4 w-4" /> Add Visitor
          </Button>
          <Button onClick={() => setShowMemberModal(true)} className="gap-2 rounded-xl h-11 px-5" style={{ background: "var(--gradient-primary)" }}>
            <UserPlus className="h-4 w-4" /> Add Member
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-card border border-border/60 rounded-3xl p-5 shadow-sm flex items-center gap-4 hover:border-orange-500/30 transition-colors">
            <div className={`h-11 w-11 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">{s.label}</p>
              <h4 className="text-2xl font-bold mt-0.5">{s.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <MembersTable members={members} pageSize={8} showSearch showFilters showSpaceColumn />

      {/* Modals */}
      <AddMemberModal 
        open={showMemberModal} 
        onOpenChange={setShowMemberModal} 
        spaces={spaces as any[]} 
        workspaceId={activeWorkspace?.id || ""} 
      />

      <AddVisitorModal 
        open={showVisitorModal} 
        onOpenChange={setShowVisitorModal} 
        spaces={spaces as any[]} 
        workspaceId={activeWorkspace?.id || ""} 
        members={members}
      />
    </div>
  );
}
