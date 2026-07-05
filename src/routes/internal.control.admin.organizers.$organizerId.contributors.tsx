import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrganizerContributors } from "@/api/admin_organizer_control";
import {
  Users2,
  Search,
  Building2,
  CheckCircle2,
  Clock,
  Shield,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute(
  "/internal/control/admin/organizers/$organizerId/contributors",
)({
  loader: async ({ params }) => {
    const contributors = await getAdminOrganizerContributors({
      data: { organizerId: params.organizerId },
    } as any);
    return { contributors };
  },
  component: OrganizerContributors,
});

const PAGE_SIZE = 25;

function StatusPill({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  if (s === "active" || s === "accepted")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] border bg-[#84c87e]/10 text-[#84c87e] border-[#84c87e]/30">
        <CheckCircle2 className="h-2.5 w-2.5" />
        {status}
      </span>
    );
  if (s === "pending")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] border bg-[#dcdcaa]/10 text-[#dcdcaa] border-[#dcdcaa]/30">
        <Clock className="h-2.5 w-2.5" />
        Pending
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] border bg-gray-200 dark:bg-[#333333]/60 text-gray-600 dark:text-[#797775] border-gray-200 dark:border-[#333333] capitalize">
      {status || "—"}
    </span>
  );
}

function AccessBadge({ level }: { level: string }) {
  const l = (level || "").toLowerCase();
  if (l === "edit")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] border bg-[#569cd6]/10 text-[#569cd6] border-[#569cd6]/30">
        <Pencil className="h-2.5 w-2.5" />
        Edit
      </span>
    );
  if (l === "admin")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] border bg-[#c586c0]/10 text-[#c586c0] border-[#c586c0]/30">
        <Shield className="h-2.5 w-2.5" />
        Admin
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] border bg-gray-200 dark:bg-[#797775]/10 text-gray-600 dark:text-[#797775] border-gray-200 dark:border-[#333333]">
      <Eye className="h-2.5 w-2.5" />
      View
    </span>
  );
}

function ResourceTypePill({ type }: { type: string }) {
  const label = (type || "").replace(/_/g, " ");
  const colorMap: Record<string, string> = {
    ticket_project: "text-[#dcdcaa] bg-[#dcdcaa]/10 border-[#dcdcaa]/30",
    venue_project: "text-[#c586c0] bg-[#c586c0]/10 border-[#c586c0]/30",
    badge_project: "text-[#84c87e] bg-[#84c87e]/10 border-[#84c87e]/30",
  };
  const cls =
    colorMap[type] ||
    "text-gray-600 dark:text-[#797775] bg-transparent border-gray-200 dark:border-[#333333]";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] border capitalize ${cls}`}>
      {label || "—"}
    </span>
  );
}

function OrganizerContributors() {
  const { contributors } = Route.useLoaderData();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState("all");
  const [filterAccess, setFilterAccess] = useState("all");

  const resourceTypes = useMemo(
    () => [
      "all",
      ...Array.from(new Set(contributors.map((c: any) => c.resource_type).filter(Boolean))),
    ],
    [contributors],
  );
  const accessLevels = useMemo(
    () => [
      "all",
      ...Array.from(new Set(contributors.map((c: any) => c.access_level).filter(Boolean))),
    ],
    [contributors],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contributors.filter((c: any) => {
      if (filterType !== "all" && c.resource_type !== filterType) return false;
      if (filterAccess !== "all" && c.access_level !== filterAccess) return false;
      if (
        q &&
        !(c.email || "").toLowerCase().includes(q) &&
        !(c.workspaceName || "").toLowerCase().includes(q) &&
        !(c.resource_type || "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [contributors, search, filterType, filterAccess]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const editCount = contributors.filter((c: any) => c.access_level === "edit").length;
  const pendingCount = contributors.filter(
    (c: any) => (c.status || "").toLowerCase() === "pending",
  ).length;

  return (
    <div className="font-sans text-sm pb-10">
      {/* ── KPI Strip ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-200 dark:bg-[#333333] border border-gray-200 dark:border-[#333333] mb-0">
        {[
          {
            label: "Total Contributors",
            value: contributors.length,
            sub: `${new Set(contributors.map((c: any) => c.email)).size} unique emails`,
            color: "text-gray-900 dark:text-white",
          },
          {
            label: "Edit Access",
            value: editCount,
            sub: `${contributors.length - editCount} view-only`,
            color: "text-[#569cd6]",
          },
          {
            label: "Pending Invites",
            value: pendingCount,
            sub: `${contributors.length - pendingCount} accepted`,
            color: "text-[#dcdcaa]",
          },
          {
            label: "Project Types",
            value: resourceTypes.length - 1,
            sub: resourceTypes.slice(1).join(", ").replace(/_/g, " ") || "—",
            color: "text-[#c586c0]",
          },
        ].map((k, i) => (
          <div key={i} className="bg-gray-100 dark:bg-[#1a1a1a] px-5 py-5">
            <p className="text-gray-600 dark:text-[#797775] text-xs uppercase tracking-wider mb-2">
              {k.label}
            </p>
            <p className={`font-bold text-lg leading-tight mb-0.5 ${k.color}`}>{k.value}</p>
            <p className="text-gray-600 dark:text-[#797775] text-xs truncate">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Filters + Table ────────────────────────────────── */}
      <section className="py-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Users2 className="h-4 w-4 text-[#c586c0]" />
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">
              Contributors
              <span className="ml-2 text-gray-600 dark:text-[#797775] font-normal">
                ({contributors.length})
              </span>
            </h2>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {/* Resource type filter */}
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333333] text-gray-700 dark:text-[#cccccc] text-xs px-2 py-1.5 focus:outline-none focus:border-[#569cd6] transition-colors"
            >
              {resourceTypes.map((t) => (
                <option key={String(t)} value={String(t)}>
                  {t === "all" ? "All Types" : String(t).replace(/_/g, " ")}
                </option>
              ))}
            </select>

            {/* Access level filter */}
            <select
              value={filterAccess}
              onChange={(e) => {
                setFilterAccess(e.target.value);
                setPage(1);
              }}
              className="bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333333] text-gray-700 dark:text-[#cccccc] text-xs px-2 py-1.5 focus:outline-none focus:border-[#569cd6] transition-colors"
            >
              {accessLevels.map((a) => (
                <option key={String(a)} value={String(a)}>
                  {a === "all" ? "All Access" : String(a)}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600 dark:text-[#797775]" />
              <input
                type="text"
                placeholder="Search by email or workspace…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333333] text-gray-900 dark:text-white text-xs pl-9 pr-4 py-1.5 w-56 focus:outline-none focus:border-[#569cd6] transition-colors placeholder-[#797775]"
              />
            </div>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-[#333333]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] whitespace-nowrap">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#2d2d30] text-gray-600 dark:text-[#797775] text-xs uppercase tracking-wider">
                  <th className="py-2.5 px-5 font-medium border-b border-gray-200 dark:border-[#333333]">
                    Email
                  </th>
                  <th className="py-2.5 px-5 font-medium border-b border-gray-200 dark:border-[#333333]">
                    Workspace
                  </th>
                  <th className="py-2.5 px-5 font-medium border-b border-gray-200 dark:border-[#333333]">
                    Resource Type
                  </th>
                  <th className="py-2.5 px-5 font-medium border-b border-gray-200 dark:border-[#333333]">
                    Resource ID
                  </th>
                  <th className="py-2.5 px-5 font-medium border-b border-gray-200 dark:border-[#333333]">
                    Access Level
                  </th>
                  <th className="py-2.5 px-5 font-medium border-b border-gray-200 dark:border-[#333333]">
                    Status
                  </th>
                  <th className="py-2.5 px-5 font-medium border-b border-gray-200 dark:border-[#333333]">
                    Added
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#333333]">
                {slice.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-gray-600 dark:text-[#797775] italic"
                    >
                      {search || filterType !== "all" || filterAccess !== "all"
                        ? "No contributors match your filters."
                        : "No contributors found."}
                    </td>
                  </tr>
                ) : (
                  slice.map((c: any, i: number) => (
                    <tr
                      key={c.id}
                      className={`transition-colors hover:bg-gray-100 dark:hover:bg-[#252526] ${i % 2 === 0 ? "bg-gray-100 dark:bg-[#1a1a1a]" : "bg-white dark:bg-[#111111]"}`}
                    >
                      <td className="py-3 px-5">
                        <p className="text-gray-900 dark:text-white font-medium">{c.email}</p>
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-[#797775] text-xs">
                          <Building2 className="h-3 w-3 shrink-0" />
                          {c.workspaceName}
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <ResourceTypePill type={c.resource_type} />
                      </td>
                      <td className="py-3 px-5 font-mono text-[#569cd6] text-xs">
                        {String(c.resource_id || "—").substring(0, 12)}…
                      </td>
                      <td className="py-3 px-5">
                        <AccessBadge level={c.access_level} />
                      </td>
                      <td className="py-3 px-5">
                        <StatusPill status={c.status} />
                      </td>
                      <td className="py-3 px-5 text-gray-600 dark:text-[#797775]">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString("en-US") : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-[#333333] bg-white dark:bg-[#111111]">
              <span className="text-xs text-gray-600 dark:text-[#797775]">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 border border-gray-200 dark:border-[#333333] text-gray-600 dark:text-[#797775] hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#555555] disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs text-gray-600 dark:text-[#797775]">
                  {page} / {pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="p-1.5 border border-gray-200 dark:border-[#333333] text-gray-600 dark:text-[#797775] hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#555555] disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
