import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrganizerProjects } from "@/api/admin_organizer_control";
import { Ticket, Stamp, MapPin, FileText, Building2, Search, Globe, Lock, ExternalLink } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/projects")({
  loader: async ({ params }) => {
    const data = await getAdminOrganizerProjects({ data: { organizerId: params.organizerId } } as any);
    return data;
  },
  component: OrganizerProjects,
});

type Tab = "tickets" | "badges" | "venues" | "pages";

function EmptyRow({ cols, label }: { cols: number; label: string }) {
  return (
    <tr>
      <td colSpan={cols} className="py-8 text-center text-[#797775] italic">{label}</td>
    </tr>
  );
}

function WorkspaceCell({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Building2 className="h-3.5 w-3.5 text-[#797775] shrink-0" />
      <span className={name && name !== "—" ? "text-[#cccccc]" : "text-[#797775] italic"}>{name || "—"}</span>
    </div>
  );
}

function OrganizerProjects() {
  const { tickets, badges, venues, pages } = Route.useLoaderData() as any;
  const [activeTab, setActiveTab] = useState<Tab>("tickets");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs: { key: Tab; label: string; icon: any; count: number; color: string }[] = [
    { key: "tickets", label: "Ticket Projects", icon: Ticket, count: tickets?.length || 0, color: "text-[#c586c0]" },
    { key: "badges", label: "Badge Designs", icon: Stamp, count: badges?.length || 0, color: "text-[#dcdcaa]" },
    { key: "venues", label: "Venue Designs", icon: MapPin, count: venues?.length || 0, color: "text-[#569cd6]" },
    { key: "pages", label: "Page Builder", icon: FileText, count: pages?.length || 0, color: "text-[#84c87e]" },
  ];

  const q = searchQuery.toLowerCase();

  const filteredTickets = (tickets || []).filter((t: any) =>
    (t.name || "").toLowerCase().includes(q) || (t.workspaceName || "").toLowerCase().includes(q)
  );
  const filteredBadges = (badges || []).filter((b: any) =>
    (b.logo_text || "").toLowerCase().includes(q) || (b.eventTitle || "").toLowerCase().includes(q) || (b.workspaceName || "").toLowerCase().includes(q)
  );
  const filteredVenues = (venues || []).filter((v: any) =>
    (v.name || "").toLowerCase().includes(q) || (v.workspaceName || "").toLowerCase().includes(q)
  );
  const filteredPages = (pages || []).filter((p: any) =>
    (p.title || "").toLowerCase().includes(q) || (p.slug || "").toLowerCase().includes(q) || (p.workspaceName || "").toLowerCase().includes(q)
  );

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#333333] gap-4">
        <h2 className="text-lg font-medium text-white">All Projects</h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#797775]" />
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-[#1e1e1e] border border-[#333333] rounded-sm py-1.5 pl-9 pr-3 text-sm text-white placeholder-[#797775] focus:outline-none focus:border-[#569cd6] transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#333333]">
        {tabs.map(({ key, label, icon: Icon, count, color }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
              activeTab === key
                ? `border-current ${color}`
                : "border-transparent text-[#797775] hover:text-[#cccccc]"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === key ? "bg-current/10" : "bg-[#2d2d30]"}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Tables */}
      <div className="bg-[#252526] border border-[#333333]">
        <div className="overflow-x-auto">

          {/* Ticket Projects */}
          {activeTab === "tickets" && (
            <table className="w-full text-left text-[13px] whitespace-nowrap">
              <thead className="bg-[#2d2d30] text-[#cccccc]">
                <tr>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">ID</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Name</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Workspace</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Template</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Status</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333] text-[#cccccc]">
                {filteredTickets.length === 0 ? <EmptyRow cols={6} label="No ticket projects found." /> : filteredTickets.map((t: any) => (
                  <tr key={t.id} className="hover:bg-[#2d2d30] transition-colors">
                    <td className="py-2 px-4 font-mono text-[#797775] text-xs">{String(t.id).substring(0, 8)}...</td>
                    <td className="py-2 px-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-3.5 w-3.5 text-[#c586c0] shrink-0" />
                        {t.name || "Untitled"}
                      </div>
                    </td>
                    <td className="py-2 px-4"><WorkspaceCell name={t.workspaceName} /></td>
                    <td className="py-2 px-4 capitalize text-[#dcdcaa]">{t.template || "—"}</td>
                    <td className="py-2 px-4">
                      {t.deleted
                        ? <span className="text-xs px-2 py-0.5 rounded-sm bg-[#f43f5e]/10 text-[#f43f5e]">Deleted</span>
                        : <span className="text-xs px-2 py-0.5 rounded-sm bg-[#84c87e]/10 text-[#84c87e]">Active</span>
                      }
                    </td>
                    <td className="py-2 px-4 text-[#797775]">{t.created_at ? new Date(t.created_at).toLocaleDateString('en-US') : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Badge Designs */}
          {activeTab === "badges" && (
            <table className="w-full text-left text-[13px] whitespace-nowrap">
              <thead className="bg-[#2d2d30] text-[#cccccc]">
                <tr>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">ID</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Logo Text</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Linked Event</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Workspace</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Theme</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Accent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333] text-[#cccccc]">
                {filteredBadges.length === 0 ? <EmptyRow cols={6} label="No badge designs found." /> : filteredBadges.map((b: any) => (
                  <tr key={b.id} className="hover:bg-[#2d2d30] transition-colors">
                    <td className="py-2 px-4 font-mono text-[#797775] text-xs">{String(b.id).substring(0, 8)}...</td>
                    <td className="py-2 px-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Stamp className="h-3.5 w-3.5 text-[#dcdcaa] shrink-0" />
                        {b.logo_text || "No Logo Text"}
                      </div>
                    </td>
                    <td className="py-2 px-4 text-[#cccccc]">{b.eventTitle || "—"}</td>
                    <td className="py-2 px-4"><WorkspaceCell name={b.workspaceName} /></td>
                    <td className="py-2 px-4 capitalize text-[#dcdcaa]">{b.theme || "—"}</td>
                    <td className="py-2 px-4">
                      {b.accent_color
                        ? <span className="flex items-center gap-1.5">
                            <span className="inline-block h-3 w-3 rounded-full border border-[#444]" style={{ backgroundColor: b.accent_color }} />
                            <span className="text-xs font-mono text-[#797775]">{b.accent_color}</span>
                          </span>
                        : <span className="text-[#797775]">—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Venue Designs */}
          {activeTab === "venues" && (
            <table className="w-full text-left text-[13px] whitespace-nowrap">
              <thead className="bg-[#2d2d30] text-[#cccccc]">
                <tr>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">ID</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Venue Name</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Workspace</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Dimensions (W × H)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333] text-[#cccccc]">
                {filteredVenues.length === 0 ? <EmptyRow cols={4} label="No venue designs found." /> : filteredVenues.map((v: any) => (
                  <tr key={v.id} className="hover:bg-[#2d2d30] transition-colors">
                    <td className="py-2 px-4 font-mono text-[#797775] text-xs">{String(v.id).substring(0, 8)}...</td>
                    <td className="py-2 px-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-[#569cd6] shrink-0" />
                        {v.name || "Untitled Venue"}
                      </div>
                    </td>
                    <td className="py-2 px-4"><WorkspaceCell name={v.workspaceName} /></td>
                    <td className="py-2 px-4">
                      {v.boundary_width && v.boundary_height
                        ? <span className="text-[#dcdcaa]">{v.boundary_width} × {v.boundary_height}</span>
                        : <span className="text-[#797775] italic">Not configured</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Page Builder */}
          {activeTab === "pages" && (
            <table className="w-full text-left text-[13px] whitespace-nowrap">
              <thead className="bg-[#2d2d30] text-[#cccccc]">
                <tr>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">ID</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Title</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Workspace</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Slug / URL</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Published</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333] text-[#cccccc]">
                {filteredPages.length === 0 ? <EmptyRow cols={6} label="No pages found." /> : filteredPages.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[#2d2d30] transition-colors">
                    <td className="py-2 px-4 font-mono text-[#797775] text-xs">{String(p.id).substring(0, 8)}...</td>
                    <td className="py-2 px-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-[#84c87e] shrink-0" />
                        {p.title || "Untitled Page"}
                      </div>
                    </td>
                    <td className="py-2 px-4"><WorkspaceCell name={p.workspaceName} /></td>
                    <td className="py-2 px-4">
                      {p.slug ? (
                        <span className="flex items-center gap-1.5 font-mono text-xs text-[#569cd6]">
                          /{p.slug}
                          <ExternalLink className="h-3 w-3 text-[#797775]" />
                        </span>
                      ) : (
                        <span className="text-[#797775]">—</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {p.is_published
                        ? <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm bg-[#84c87e]/10 text-[#84c87e]"><Globe className="h-3 w-3" /> Published</span>
                        : <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm bg-[#797775]/10 text-[#797775]"><Lock className="h-3 w-3" /> Draft</span>
                      }
                    </td>
                    <td className="py-2 px-4 text-[#797775]">
                      {p.updated_at ? new Date(p.updated_at).toLocaleDateString('en-US') : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>
      </div>
    </div>
  );
}
