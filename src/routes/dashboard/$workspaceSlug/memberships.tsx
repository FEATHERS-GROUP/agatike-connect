import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Eye, RefreshCw, Building2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MembersTable, type SpaceMember } from "@/components/desktop/dashboard/MembersTable";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export const Route = createFileRoute("/dashboard/$workspaceSlug/memberships")({
  component: MembershipsPage,
});

// ── Mock data (replace with real API when subscriptions endpoint is ready) ──
const MOCK_MEMBERS: SpaceMember[] = [
  { id: "m-1",  name: "Alice Johnson",        email: "alice@example.com",       type: "Individual",   category: "member",  plan: "Monthly Hot Desk",  employees: 1,  status: "Active",  subscriptionType: "returning", billedAs: "Individual",   space: "Kigali Hub",    joinedDate: "Oct 12, 2026" },
  { id: "m-2",  name: "Kigali Tech Hub",      email: "info@kigalitechhub.rw",   type: "Company",      category: "member",  plan: "Private Office",    employees: 12, status: "Active",  subscriptionType: "returning", billedAs: "Organization", space: "Kigali Hub",    joinedDate: "Oct 08, 2026" },
  { id: "m-3",  name: "Mark Smith",           email: "mark@example.com",        type: "Individual",   category: "member",  plan: "Day Pass",          employees: 1,  status: "Expired", subscriptionType: "new",       billedAs: "Individual",   space: "Remera Space",  joinedDate: "Oct 11, 2026" },
  { id: "m-4",  name: "Rwanda Ventures Ltd",  email: "contact@rwandaventures.rw",type: "Company",     category: "member",  plan: "Dedicated Desk",    employees: 4,  status: "Active",  subscriptionType: "new",       billedAs: "Organization", space: "Kigali Hub",    joinedDate: "Oct 02, 2026" },
  { id: "m-5",  name: "Jane Doe",             email: "jane@example.com",        type: "Individual",   category: "member",  plan: "Dedicated Desk",    employees: 1,  status: "Active",  subscriptionType: "returning", billedAs: "Individual",   space: "Kigali Hub",    joinedDate: "Oct 10, 2026" },
  { id: "m-6",  name: "AfriTech Solutions",   email: "hello@afritech.rw",        type: "Organization", category: "member",  plan: "Private Office",    employees: 22, status: "Active",  subscriptionType: "new",       billedAs: "Organization", space: "Remera Space",  joinedDate: "Oct 05, 2026" },
  { id: "m-7",  name: "Hinga Collective",     email: "hello@hinga.rw",          type: "Organization", category: "member",  plan: "Dedicated Desk",    employees: 7,  status: "Active",  subscriptionType: "new",       billedAs: "Organization", space: "Kigali Hub",    joinedDate: "Oct 02, 2026" },
  { id: "m-8",  name: "Sophie Williams",      email: "sophie@example.com",      type: "Individual",   category: "visitor", plan: undefined,           employees: 1,  status: "Active",  subscriptionType: "new",       billedAs: "Individual",   space: "Kigali Hub",    joinedDate: "Oct 14, 2026" },
  { id: "m-9",  name: "Eric Nshimiyimana",    email: "eric@example.com",        type: "Individual",   category: "visitor", plan: undefined,           employees: 1,  status: "Active",  subscriptionType: "new",       billedAs: "Individual",   space: "Remera Space",  joinedDate: "Oct 13, 2026" },
  { id: "m-10", name: "Muse Labs",            email: "team@muselabs.rw",        type: "Company",      category: "member",  plan: "Monthly Hot Desk",  employees: 3,  status: "Pending", subscriptionType: "new",       billedAs: "Organization", space: "Kigali Hub",    joinedDate: "Oct 15, 2026" },
  { id: "m-11", name: "David Iradukunda",     email: "david@example.com",       type: "Individual",   category: "member",  plan: "Day Pass",          employees: 1,  status: "Expired", subscriptionType: "returning", billedAs: "Individual",   space: "Kigali Hub",    joinedDate: "Sep 28, 2026" },
  { id: "m-12", name: "Gasabo Digital Hub",   email: "info@gasabodigital.rw",   type: "Organization", category: "member",  plan: "Private Office",    employees: 15, status: "Active",  subscriptionType: "returning", billedAs: "Organization", space: "Remera Space",  joinedDate: "Sep 20, 2026" },
];

function MembershipsPage() {
  const { workspaceSlug } = useParams({ strict: false }) as any;
  const { activeWorkspace } = useWorkspace();

  const stats = [
    { label: "Total Members",   value: MOCK_MEMBERS.filter(m => m.category === "member").length,                   icon: Users,     color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Visitors",        value: MOCK_MEMBERS.filter(m => m.category === "visitor").length,                  icon: Eye,       color: "text-rose-500",   bg: "bg-rose-500/10"   },
    { label: "Re-using",        value: MOCK_MEMBERS.filter(m => m.subscriptionType === "returning").length,        icon: RefreshCw, color: "text-emerald-500",bg: "bg-emerald-500/10"},
    { label: "Companies / Orgs",value: MOCK_MEMBERS.filter(m => m.type !== "Individual" && m.category === "member").length, icon: Building2, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

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
        <Button variant="outline" className="gap-2 rounded-xl h-11 px-5">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
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

      {/* Full table with search + filters + pagination */}
      <MembersTable
        members={MOCK_MEMBERS}
        pageSize={8}
        showSearch
        showFilters
        showSpaceColumn
      />
    </div>
  );
}
