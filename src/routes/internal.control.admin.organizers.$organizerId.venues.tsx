import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrganizerVenues } from "@/api/admin_organizer_control";
import {
  MapPin,
  Search,
  Building2,
  LayoutGrid,
  Users,
  Eye,
  Info,
  Banknote,
  Clock,
  List,
  Map,
  Shield,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/venues")({
  loader: async ({ params }) => {
    const data = await getAdminOrganizerVenues({
      data: { organizerId: params.organizerId },
    } as any);
    return data;
  },
  component: OrganizerVenuesAndSpaces,
});

type Tab = "venues" | "spaces";

function EmptyRow({ cols, label }: { cols: number; label: string }) {
  return (
    <tr>
      <td colSpan={cols} className="py-8 text-center text-[#797775] italic">
        {label}
      </td>
    </tr>
  );
}

function WorkspaceCell({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Building2 className="h-3.5 w-3.5 text-[#797775] shrink-0" />
      <span className={name && name !== "—" ? "text-[#cccccc]" : "text-[#797775] italic"}>
        {name || "—"}
      </span>
    </div>
  );
}

function DetailBlock({
  icon: Icon,
  label,
  children,
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="h-4 w-4 text-[#797775] shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="text-xs text-[#797775] mb-1">{label}</div>
        <div className="text-sm text-white break-words">{children}</div>
      </div>
    </div>
  );
}

function OrganizerVenuesAndSpaces() {
  const { venues, spaces } = Route.useLoaderData() as any;
  const [activeTab, setActiveTab] = useState<Tab>("venues");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs: { key: Tab; label: string; icon: any; count: number; color: string }[] = [
    {
      key: "venues",
      label: "Rentable Venues",
      icon: MapPin,
      count: venues?.length || 0,
      color: "text-[#569cd6]",
    },
    {
      key: "spaces",
      label: "Spaces",
      icon: LayoutGrid,
      count: spaces?.length || 0,
      color: "text-[#c586c0]",
    },
  ];

  const q = searchQuery.toLowerCase();

  const filteredVenues = (venues || []).filter(
    (v: any) =>
      (v.name || "").toLowerCase().includes(q) || (v.workspaceName || "").toLowerCase().includes(q),
  );

  const filteredSpaces = (spaces || []).filter(
    (s: any) =>
      (s.name || "").toLowerCase().includes(q) || (s.workspaceName || "").toLowerCase().includes(q),
  );

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#333333] gap-4">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          {activeTab === "venues" ? (
            <MapPin className="h-5 w-5 text-[#569cd6]" />
          ) : (
            <LayoutGrid className="h-5 w-5 text-[#c586c0]" />
          )}
          Venues & Spaces
        </h2>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#797775]" />
          </div>
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
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
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === key ? "bg-current/10" : "bg-[#2d2d30]"}`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Tables */}
      <div className="bg-[#252526] border border-[#333333]">
        <div className="overflow-x-auto">
          {/* Rentable Venues */}
          {activeTab === "venues" && (
            <table className="w-full text-left text-[13px] whitespace-nowrap">
              <thead className="bg-[#2d2d30] text-[#cccccc]">
                <tr>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">ID</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Name</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Workspace</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Type</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Location</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Capacity</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Status</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333] text-[#cccccc]">
                {filteredVenues.length === 0 ? (
                  <EmptyRow cols={8} label="No rentable venues found." />
                ) : (
                  filteredVenues.map((v: any) => (
                    <tr key={v.id} className="hover:bg-[#2d2d30] transition-colors">
                      <td className="py-2 px-4 font-mono text-[#797775] text-xs">
                        {String(v.id).substring(0, 8)}...
                      </td>
                      <td className="py-2 px-4 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-[#569cd6] shrink-0" />
                          {v.name || "Untitled"}
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <WorkspaceCell name={v.workspaceName} />
                      </td>
                      <td className="py-2 px-4 capitalize text-[#dcdcaa]">{v.type || "—"}</td>
                      <td className="py-2 px-4 text-[#cccccc]">
                        {[v.city, v.country].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="py-2 px-4">
                        {v.capacity ? (
                          <div className="flex items-center gap-1.5 text-[#cccccc]">
                            <Users className="h-3.5 w-3.5 text-[#797775]" />
                            {v.capacity}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2 px-4">
                        {v.status === "Active" ? (
                          <span className="text-xs px-2 py-0.5 rounded-sm bg-[#84c87e]/10 text-[#84c87e]">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-sm bg-[#797775]/10 text-[#797775]">
                            {v.status || "—"}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        <Sheet>
                          <SheetTrigger asChild>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#333333] hover:bg-[#444444] text-white text-xs rounded transition-colors">
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
                          </SheetTrigger>
                          <SheetContent className="bg-[#1e1e1e] border-[#333333] text-white w-full sm:max-w-md p-0 flex flex-col font-sans">
                            <SheetHeader className="p-6 pb-4 border-b border-[#333333]">
                              <SheetTitle className="text-white flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-[#569cd6]" />
                                Rentable Venue Details
                              </SheetTitle>
                            </SheetHeader>

                            <ScrollArea className="flex-1 p-6">
                              <div className="space-y-6">
                                {/* Header Info */}
                                <div className="flex items-start gap-4">
                                  {v.cover_url ? (
                                    <img
                                      src={v.cover_url}
                                      alt="Cover"
                                      className="h-16 w-16 rounded-md object-cover bg-[#2d2d30]"
                                    />
                                  ) : (
                                    <div className="h-16 w-16 rounded-md bg-[#2d2d30] flex items-center justify-center">
                                      <MapPin className="h-6 w-6 text-[#797775]" />
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="text-lg font-medium text-white">
                                      {v.name || "Untitled Venue"}
                                    </h3>
                                    <div className="text-sm text-[#797775] capitalize">
                                      {v.type || "Uncategorized"}
                                    </div>
                                    <div className="mt-1 flex items-center gap-2">
                                      <span className="text-xs px-2 py-0.5 rounded-sm bg-[#333333] text-[#cccccc] font-mono">
                                        {String(v.id).substring(0, 8)}
                                      </span>
                                      {v.is_venue_private && (
                                        <span className="text-xs px-2 py-0.5 rounded-sm bg-[#c586c0]/10 text-[#c586c0] flex items-center gap-1">
                                          <Shield className="h-3 w-3" />
                                          Private
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="h-px bg-[#333333]" />

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 gap-6">
                                  <DetailBlock icon={Building2} label="Workspace">
                                    {v.workspaceName || "—"}
                                  </DetailBlock>

                                  <DetailBlock icon={Map} label="Location">
                                    {v.address ? (
                                      <>
                                        <div>{v.address}</div>
                                        <div className="text-[#cccccc]">
                                          {[v.city, v.country].filter(Boolean).join(", ")}
                                        </div>
                                      </>
                                    ) : (
                                      <span className="italic text-[#797775]">
                                        No address provided
                                      </span>
                                    )}
                                  </DetailBlock>

                                  <DetailBlock icon={Users} label="Capacity">
                                    {v.capacity ? (
                                      `${v.capacity} people`
                                    ) : (
                                      <span className="italic text-[#797775]">Not specified</span>
                                    )}
                                  </DetailBlock>

                                  <DetailBlock icon={Banknote} label="Rental Information">
                                    <div className="capitalize">
                                      Model:{" "}
                                      <span className="text-[#cccccc]">
                                        {v.rental_model || "—"}
                                      </span>
                                    </div>
                                    <div className="capitalize">
                                      Type:{" "}
                                      <span className="text-[#cccccc]">{v.rental_type || "—"}</span>
                                    </div>
                                    <div>
                                      Currency:{" "}
                                      <span className="text-[#dcdcaa]">{v.currency || "USD"}</span>
                                    </div>
                                  </DetailBlock>

                                  <DetailBlock icon={Clock} label="Operating Hours">
                                    {v.opening_hours || v.closing_hours ? (
                                      <div className="text-[#cccccc]">
                                        {v.opening_hours || "??:??"} — {v.closing_hours || "??:??"}
                                      </div>
                                    ) : (
                                      <span className="italic text-[#797775]">Not specified</span>
                                    )}
                                  </DetailBlock>

                                  <DetailBlock icon={Info} label="Description">
                                    {v.description ? (
                                      <div className="whitespace-pre-wrap text-[#cccccc] leading-relaxed">
                                        {v.description}
                                      </div>
                                    ) : (
                                      <span className="italic text-[#797775]">
                                        No description provided
                                      </span>
                                    )}
                                  </DetailBlock>

                                  {v.instructions && (
                                    <DetailBlock icon={FileText} label="Instructions">
                                      <div className="whitespace-pre-wrap text-[#cccccc] leading-relaxed">
                                        {v.instructions}
                                      </div>
                                    </DetailBlock>
                                  )}

                                  <DetailBlock icon={List} label="Amenities">
                                    {v.amenities &&
                                    Array.isArray(v.amenities) &&
                                    v.amenities.length > 0 ? (
                                      <div className="flex flex-wrap gap-1.5">
                                        {v.amenities.map((a: string, i: number) => (
                                          <span
                                            key={i}
                                            className="px-2 py-0.5 rounded-full bg-[#2d2d30] text-xs text-[#cccccc] capitalize"
                                          >
                                            {a}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="italic text-[#797775]">None listed</span>
                                    )}
                                  </DetailBlock>
                                </div>
                              </div>
                            </ScrollArea>
                          </SheetContent>
                        </Sheet>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Spaces */}
          {activeTab === "spaces" && (
            <table className="w-full text-left text-[13px] whitespace-nowrap">
              <thead className="bg-[#2d2d30] text-[#cccccc]">
                <tr>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">ID</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Name</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Workspace</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Type</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Status</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Created</th>
                  <th className="font-semibold py-2 px-4 border-b border-[#333333]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333] text-[#cccccc]">
                {filteredSpaces.length === 0 ? (
                  <EmptyRow cols={7} label="No spaces found." />
                ) : (
                  filteredSpaces.map((s: any) => (
                    <tr key={s.id} className="hover:bg-[#2d2d30] transition-colors">
                      <td className="py-2 px-4 font-mono text-[#797775] text-xs">
                        {String(s.id).substring(0, 8)}...
                      </td>
                      <td className="py-2 px-4 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <LayoutGrid className="h-3.5 w-3.5 text-[#c586c0] shrink-0" />
                          {s.name || "Untitled"}
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <WorkspaceCell name={s.workspaceName} />
                      </td>
                      <td className="py-2 px-4 capitalize text-[#dcdcaa]">{s.type || "—"}</td>
                      <td className="py-2 px-4">
                        {s.status === "Active" ? (
                          <span className="text-xs px-2 py-0.5 rounded-sm bg-[#84c87e]/10 text-[#84c87e]">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-sm bg-[#797775]/10 text-[#797775]">
                            {s.status || "—"}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-[#797775]">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString("en-US") : "—"}
                      </td>
                      <td className="py-2 px-4">
                        <Sheet>
                          <SheetTrigger asChild>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#333333] hover:bg-[#444444] text-white text-xs rounded transition-colors">
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
                          </SheetTrigger>
                          <SheetContent className="bg-[#1e1e1e] border-[#333333] text-white w-full sm:max-w-md p-0 flex flex-col font-sans">
                            <SheetHeader className="p-6 pb-4 border-b border-[#333333]">
                              <SheetTitle className="text-white flex items-center gap-2">
                                <LayoutGrid className="h-5 w-5 text-[#c586c0]" />
                                Space Details
                              </SheetTitle>
                            </SheetHeader>

                            <ScrollArea className="flex-1 p-6">
                              <div className="space-y-6">
                                {/* Header Info */}
                                <div className="flex items-start gap-4">
                                  {s.cover_url ? (
                                    <img
                                      src={s.cover_url}
                                      alt="Cover"
                                      className="h-16 w-16 rounded-md object-cover bg-[#2d2d30]"
                                    />
                                  ) : (
                                    <div className="h-16 w-16 rounded-md bg-[#2d2d30] flex items-center justify-center">
                                      <LayoutGrid className="h-6 w-6 text-[#797775]" />
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="text-lg font-medium text-white">
                                      {s.name || "Untitled Space"}
                                    </h3>
                                    <div className="text-sm text-[#797775] capitalize">
                                      {s.type || "Uncategorized"}
                                    </div>
                                    <div className="mt-1 flex items-center gap-2">
                                      <span className="text-xs px-2 py-0.5 rounded-sm bg-[#333333] text-[#cccccc] font-mono">
                                        {String(s.id).substring(0, 8)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="h-px bg-[#333333]" />

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 gap-6">
                                  <DetailBlock icon={Building2} label="Workspace">
                                    {s.workspaceName || "—"}
                                  </DetailBlock>

                                  <DetailBlock icon={Map} label="Locations">
                                    {s.locations &&
                                    Array.isArray(s.locations) &&
                                    s.locations.length > 0 ? (
                                      <ul className="list-disc pl-4 space-y-1 text-[#cccccc]">
                                        {s.locations.map((loc: any, i: number) => (
                                          <li key={i}>
                                            <span className="font-medium text-white">
                                              {loc.name}
                                            </span>
                                            {loc.address && (
                                              <div className="text-xs text-[#797775]">
                                                {loc.address}
                                              </div>
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <span className="italic text-[#797775]">
                                        No locations provided
                                      </span>
                                    )}
                                  </DetailBlock>

                                  <DetailBlock icon={Banknote} label="Plans & Pricing">
                                    {s.plans && Array.isArray(s.plans) && s.plans.length > 0 ? (
                                      <div className="space-y-2">
                                        {s.plans.map((plan: any, i: number) => (
                                          <div
                                            key={i}
                                            className="bg-[#2d2d30] p-2 rounded border border-[#333333] text-xs"
                                          >
                                            <div className="font-medium text-white">
                                              {plan.name}
                                            </div>
                                            <div className="text-[#dcdcaa]">
                                              {s.currency || "USD"} {plan.price} / {plan.interval}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="italic text-[#797775]">
                                        No plans configured
                                      </span>
                                    )}
                                  </DetailBlock>

                                  <DetailBlock icon={Info} label="Description">
                                    {s.description ? (
                                      <div className="whitespace-pre-wrap text-[#cccccc] leading-relaxed">
                                        {s.description}
                                      </div>
                                    ) : (
                                      <span className="italic text-[#797775]">
                                        No description provided
                                      </span>
                                    )}
                                  </DetailBlock>

                                  {(s.rsvp_form_id || s.show_rsvp_form_button) && (
                                    <DetailBlock icon={List} label="RSVP Form">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[#cccccc]">
                                          {s.rsvp_form_button_text || "RSVP"}
                                        </span>
                                        {s.rsvp_form_id && (
                                          <span className="text-[10px] bg-[#333333] px-1.5 py-0.5 rounded font-mono text-[#797775]">
                                            ID: {s.rsvp_form_id.substring(0, 8)}
                                          </span>
                                        )}
                                      </div>
                                    </DetailBlock>
                                  )}
                                </div>
                              </div>
                            </ScrollArea>
                          </SheetContent>
                        </Sheet>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
