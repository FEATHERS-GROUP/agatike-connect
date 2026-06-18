import { useState, useMemo } from "react";
import { Building2, Users, RefreshCw, UserCheck, ChevronLeft, ChevronRight, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type MemberType = "Individual" | "Company" | "Organization";
export type MemberStatus = "Active" | "Expired" | "Pending";
export type SubscriptionType = "new" | "returning";
export type MemberCategory = "member" | "visitor";

export interface SpaceMember {
  id: string;
  name: string;
  email?: string;
  type: MemberType;
  category: MemberCategory;
  plan?: string;
  employees?: number;
  status: MemberStatus;
  subscriptionType: SubscriptionType;
  billedAs: "Individual" | "Organization";
  space?: string;
  joinedDate: string;
}

interface MembersTableProps {
  members: SpaceMember[];
  pageSize?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  showSpaceColumn?: boolean;
}

const STATUS_STYLES: Record<MemberStatus, string> = {
  Active:  "bg-green-500/10 text-green-500",
  Expired: "bg-muted text-muted-foreground",
  Pending: "bg-amber-500/10 text-amber-500",
};

const TYPE_STYLES: Record<MemberType, string> = {
  Individual:   "bg-secondary/60 text-muted-foreground",
  Company:      "bg-orange-500/10 text-orange-500",
  Organization: "bg-purple-500/10 text-purple-500",
};

export function MembersTable({
  members,
  pageSize = 10,
  showSearch = true,
  showFilters = true,
  showSpaceColumn = false,
}: MembersTableProps) {
  const [query, setQuery]         = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType]     = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [page, setPage]           = useState(1);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.email?.toLowerCase().includes(q) ?? false) ||
        (m.plan?.toLowerCase().includes(q) ?? false);

      const matchesStatus   = filterStatus   === "all" || m.status   === filterStatus;
      const matchesType     = filterType     === "all" || m.type     === filterType;
      const matchesCategory = filterCategory === "all" || m.category === filterCategory;

      return matchesQuery && matchesStatus && matchesType && matchesCategory;
    });
  }, [members, query, filterStatus, filterType, filterCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-4">
      {/* ── Search + Filters ── */}
      {(showSearch || showFilters) && (
        <div className="flex flex-wrap gap-3 items-center">
          {showSearch && (
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or plan…"
                value={query}
                onChange={(e) => { setQuery(e.target.value); resetPage(); }}
                className="pl-9 rounded-xl h-10"
              />
            </div>
          )}

          {showFilters && (
            <>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); resetPage(); }}
                className="h-10 rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="all">All categories</option>
                <option value="member">Members</option>
                <option value="visitor">Visitors</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); resetPage(); }}
                className="h-10 rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="all">All types</option>
                <option value="Individual">Individual</option>
                <option value="Company">Company</option>
                <option value="Organization">Organization</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); resetPage(); }}
                className="h-10 rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="all">All statuses</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Pending">Pending</option>
              </select>
            </>
          )}

          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/10 border-b border-border/40">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Name</th>
                <th className="px-5 py-3.5 font-semibold">Category</th>
                <th className="px-5 py-3.5 font-semibold">Entity</th>
                {showSpaceColumn && <th className="px-5 py-3.5 font-semibold">Space</th>}
                <th className="px-5 py-3.5 font-semibold">Plan</th>
                <th className="px-5 py-3.5 font-semibold text-center">Employees</th>
                <th className="px-5 py-3.5 font-semibold">Billed As</th>
                <th className="px-5 py-3.5 font-semibold">Joined</th>
                <th className="px-5 py-3.5 font-semibold">Subscription</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={showSpaceColumn ? 10 : 9} className="px-5 py-12 text-center text-muted-foreground">
                    No members match your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((m) => (
                  <tr key={m.id} className="hover:bg-secondary/5 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{m.name}</p>
                        {m.email && <p className="text-xs text-muted-foreground mt-0.5">{m.email}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                        m.category === "visitor"
                          ? "bg-rose-500/10 text-rose-500"
                          : "bg-blue-500/10 text-blue-500"
                      )}>
                        {m.category === "visitor" ? "Visitor" : "Member"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold",
                        TYPE_STYLES[m.type]
                      )}>
                        {m.type === "Individual" ? <Users className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                        {m.type}
                      </span>
                    </td>
                    {showSpaceColumn && (
                      <td className="px-5 py-3.5 text-muted-foreground text-xs">{m.space ?? "—"}</td>
                    )}
                    <td className="px-5 py-3.5 text-muted-foreground">{m.plan ?? "—"}</td>
                    <td className="px-5 py-3.5 text-center font-bold">
                      {m.employees && m.employees > 1
                        ? <span className="text-orange-500">{m.employees}</span>
                        : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        "text-xs font-semibold uppercase tracking-wider",
                        m.billedAs === "Individual" ? "text-muted-foreground" : "text-orange-500"
                      )}>
                        {m.billedAs}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs whitespace-nowrap">{m.joinedDate}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                        m.subscriptionType === "returning"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-orange-500/10 text-orange-500"
                      )}>
                        {m.subscriptionType === "returning"
                          ? <><RefreshCw className="h-3 w-3" /> Re-using</>
                          : <><UserCheck className="h-3 w-3" /> New</>}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                        STATUS_STYLES[m.status]
                      )}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-border/40 flex items-center justify-between bg-secondary/5">
            <p className="text-xs text-muted-foreground">
              Page <span className="font-semibold text-foreground">{safePage}</span> of{" "}
              <span className="font-semibold text-foreground">{totalPages}</span>
              {" "}· {filtered.length} total
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page number pills */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (safePage <= 3) {
                  pageNum = i + 1;
                } else if (safePage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = safePage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === safePage ? "default" : "outline"}
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-lg text-xs font-bold",
                      pageNum === safePage && "shadow-[var(--shadow-glow)]"
                    )}
                    style={pageNum === safePage ? { background: "var(--gradient-primary)" } : {}}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
