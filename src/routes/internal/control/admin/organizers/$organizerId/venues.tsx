import { createFileRoute, useSearch } from "@tanstack/react-router";
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
  CalendarCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/venues")({
  loader: async ({ params }) => {
    const data = await getAdminOrganizerVenues({
      data: { organizerId: params.organizerId },
    } as any);
    return data;
  },
  validateSearch: (search: Record<string, unknown>) => ({
    highlight: search.highlight as string | undefined,
  }),
  component: OrganizerVenuesAndSpaces,
});

type Tab = "venues" | "spaces" | "bookings";

function EmptyRow({ cols, label }: { cols: number; label: string }) {
  return (
    <tr>
      <td colSpan={cols} className="py-8 text-center text-gray-600 dark:text-[#797775] italic">
        {label}
      </td>
    </tr>
  );
}

function WorkspaceCell({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Building2 className="h-3.5 w-3.5 text-gray-600 dark:text-[#797775] shrink-0" />
      <span
        className={
          name && name !== "—"
            ? "text-gray-700 dark:text-[#cccccc]"
            : "text-gray-600 dark:text-[#797775] italic"
        }
      >
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
      <Icon className="h-4 w-4 text-gray-600 dark:text-[#797775] shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="text-xs text-gray-600 dark:text-[#797775] mb-1">{label}</div>
        <div className="text-sm text-gray-900 dark:text-white break-words">{children}</div>
      </div>
    </div>
  );
}

function OrganizerVenuesAndSpaces() {
  const { venues, spaces, bookings } = Route.useLoaderData() as any;
  const [activeTab, setActiveTab] = useState<Tab>("venues");
  const [searchQuery, setSearchQuery] = useState("");
  const searchParam = useSearch({ from: "/internal/control/admin/organizers/$organizerId/venues" });
  const highlightId = searchParam.highlight;
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    if (!highlightId) return;
    setHighlightedId(highlightId);
    // Switch to bookings tab since highlights mostly come from bookings search
    setActiveTab("bookings");
    const timer = setTimeout(() => {
      const el = document.getElementById(`row-${highlightId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setHighlightedId(null), 3000);
    }, 400);
    return () => clearTimeout(timer);
  }, [highlightId]);

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
    {
      key: "bookings",
      label: "Bookings",
      icon: CalendarCheck,
      count: bookings?.length || 0,
      color: "text-[#4ec9b0]",
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

  const filteredBookings = (bookings || []).filter(
    (b: any) =>
      (b.customer_name || "").toLowerCase().includes(q) ||
      (b.customer_email || "").toLowerCase().includes(q) ||
      (b.rentable_venue?.name || "").toLowerCase().includes(q) ||
      (b.workspaceName || "").toLowerCase().includes(q),
  );

  return (
    <div className="space-y-4 font-sans text-sm pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200 dark:border-[#333333] gap-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          {activeTab === "venues" ? (
            <MapPin className="h-5 w-5 text-[#569cd6]" />
          ) : activeTab === "spaces" ? (
            <LayoutGrid className="h-5 w-5 text-[#c586c0]" />
          ) : (
            <CalendarCheck className="h-5 w-5 text-[#4ec9b0]" />
          )}
          Venues, Spaces & Bookings
        </h2>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-600 dark:text-[#797775]" />
          </div>
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-sm py-1.5 pl-9 pr-3 text-sm text-gray-900 dark:text-white placeholder-[#797775] focus:outline-none focus:border-[#569cd6] transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-[#333333]">
        {tabs.map(({ key, label, icon: Icon, count, color }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
              activeTab === key
                ? `border-current ${color}`
                : "border-transparent text-gray-600 dark:text-[#797775] hover:text-gray-700 dark:text-[#cccccc]"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === key ? "bg-current/10" : "bg-gray-100 dark:bg-[#2d2d30]"}`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Tables */}
      <div className="bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-[#333333]">
        <div className="overflow-x-auto">
          {/* Rentable Venues */}
          {activeTab === "venues" && (
            <table className="w-full text-left text-[13px] whitespace-nowrap">
              <thead className="bg-gray-100 dark:bg-[#2d2d30] text-gray-700 dark:text-[#cccccc]">
                <tr>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    ID
                  </th>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    Name
                  </th>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    Workspace
                  </th>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    Type
                  </th>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    Location
                  </th>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    Capacity
                  </th>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    Status
                  </th>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#333333] text-gray-700 dark:text-[#cccccc]">
                {filteredVenues.length === 0 ? (
                  <EmptyRow cols={8} label="No rentable venues found." />
                ) : (
                  filteredVenues.map((v: any) => (
                    <tr
                      key={v.id}
                      className="hover:bg-gray-200 dark:hover:bg-[#2d2d30] transition-colors"
                    >
                      <td className="py-2 px-4 font-mono text-gray-600 dark:text-[#797775] text-xs">
                        {String(v.id).substring(0, 8)}...
                      </td>
                      <td className="py-2 px-4 font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-[#569cd6] shrink-0" />
                          {v.name || "Untitled"}
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <WorkspaceCell name={v.workspaceName} />
                      </td>
                      <td className="py-2 px-4 capitalize text-[#dcdcaa]">{v.type || "—"}</td>
                      <td className="py-2 px-4 text-gray-700 dark:text-[#cccccc]">
                        {[v.city, v.country].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="py-2 px-4">
                        {v.capacity ? (
                          <div className="flex items-center gap-1.5 text-gray-700 dark:text-[#cccccc]">
                            <Users className="h-3.5 w-3.5 text-gray-600 dark:text-[#797775]" />
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
                          <span className="text-xs px-2 py-0.5 rounded-sm bg-gray-200 dark:bg-[#797775]/10 text-gray-600 dark:text-[#797775]">
                            {v.status || "—"}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        <Sheet>
                          <SheetTrigger asChild>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 dark:bg-[#333333] hover:bg-gray-200 dark:hover:bg-[#444444] text-gray-900 dark:text-white text-xs rounded transition-colors">
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
                          </SheetTrigger>
                          <SheetContent className="bg-gray-50 dark:bg-[#1e1e1e] border-gray-200 dark:border-[#333333] text-gray-900 dark:text-white w-full sm:max-w-md p-0 flex flex-col font-sans">
                            <SheetHeader className="p-6 pb-4 border-b border-gray-200 dark:border-[#333333]">
                              <SheetTitle className="text-gray-900 dark:text-white flex items-center gap-2">
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
                                      className="h-16 w-16 rounded-md object-cover bg-gray-100 dark:bg-[#2d2d30]"
                                    />
                                  ) : (
                                    <div className="h-16 w-16 rounded-md bg-gray-100 dark:bg-[#2d2d30] flex items-center justify-center">
                                      <MapPin className="h-6 w-6 text-gray-600 dark:text-[#797775]" />
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                      {v.name || "Untitled Venue"}
                                    </h3>
                                    <div className="text-sm text-gray-600 dark:text-[#797775] capitalize">
                                      {v.type || "Uncategorized"}
                                    </div>
                                    <div className="mt-1 flex items-center gap-2">
                                      <span className="text-xs px-2 py-0.5 rounded-sm bg-gray-200 dark:bg-[#333333] text-gray-700 dark:text-[#cccccc] font-mono">
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

                                <div className="h-px bg-gray-200 dark:bg-[#333333]" />

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 gap-6">
                                  <DetailBlock icon={Building2} label="Workspace">
                                    {v.workspaceName || "—"}
                                  </DetailBlock>

                                  <DetailBlock icon={Map} label="Location">
                                    {v.address ? (
                                      <>
                                        <div>{v.address}</div>
                                        <div className="text-gray-700 dark:text-[#cccccc]">
                                          {[v.city, v.country].filter(Boolean).join(", ")}
                                        </div>
                                      </>
                                    ) : (
                                      <span className="italic text-gray-600 dark:text-[#797775]">
                                        No address provided
                                      </span>
                                    )}
                                  </DetailBlock>

                                  <DetailBlock icon={Users} label="Capacity">
                                    {v.capacity ? (
                                      `${v.capacity} people`
                                    ) : (
                                      <span className="italic text-gray-600 dark:text-[#797775]">
                                        Not specified
                                      </span>
                                    )}
                                  </DetailBlock>

                                  <DetailBlock icon={Banknote} label="Rental Information">
                                    <div className="capitalize">
                                      Model:{" "}
                                      <span className="text-gray-700 dark:text-[#cccccc]">
                                        {v.rental_model || "—"}
                                      </span>
                                    </div>
                                    <div className="capitalize">
                                      Type:{" "}
                                      <span className="text-gray-700 dark:text-[#cccccc]">
                                        {v.rental_type || "—"}
                                      </span>
                                    </div>
                                    <div>
                                      Currency:{" "}
                                      <span className="text-[#dcdcaa]">{v.currency || "USD"}</span>
                                    </div>
                                  </DetailBlock>

                                  <DetailBlock icon={Clock} label="Operating Hours">
                                    {v.opening_hours || v.closing_hours ? (
                                      <div className="text-gray-700 dark:text-[#cccccc]">
                                        {v.opening_hours || "??:??"} — {v.closing_hours || "??:??"}
                                      </div>
                                    ) : (
                                      <span className="italic text-gray-600 dark:text-[#797775]">
                                        Not specified
                                      </span>
                                    )}
                                  </DetailBlock>

                                  <DetailBlock icon={Info} label="Description">
                                    {v.description ? (
                                      <div className="whitespace-pre-wrap text-gray-700 dark:text-[#cccccc] leading-relaxed">
                                        {v.description}
                                      </div>
                                    ) : (
                                      <span className="italic text-gray-600 dark:text-[#797775]">
                                        No description provided
                                      </span>
                                    )}
                                  </DetailBlock>

                                  {v.instructions && (
                                    <DetailBlock icon={FileText} label="Instructions">
                                      <div className="whitespace-pre-wrap text-gray-700 dark:text-[#cccccc] leading-relaxed">
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
                                            className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#2d2d30] text-xs text-gray-700 dark:text-[#cccccc] capitalize"
                                          >
                                            {a}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="italic text-gray-600 dark:text-[#797775]">
                                        None listed
                                      </span>
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
              <thead className="bg-gray-100 dark:bg-[#2d2d30] text-gray-700 dark:text-[#cccccc]">
                <tr>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    ID
                  </th>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    Name
                  </th>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    Workspace
                  </th>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    Type
                  </th>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    Status
                  </th>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    Created
                  </th>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#333333] text-gray-700 dark:text-[#cccccc]">
                {filteredSpaces.length === 0 ? (
                  <EmptyRow cols={7} label="No spaces found." />
                ) : (
                  filteredSpaces.map((s: any) => (
                    <tr
                      key={s.id}
                      className="hover:bg-gray-200 dark:hover:bg-[#2d2d30] transition-colors"
                    >
                      <td className="py-2 px-4 font-mono text-gray-600 dark:text-[#797775] text-xs">
                        {String(s.id).substring(0, 8)}...
                      </td>
                      <td className="py-2 px-4 font-medium text-gray-900 dark:text-white">
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
                          <span className="text-xs px-2 py-0.5 rounded-sm bg-gray-200 dark:bg-[#797775]/10 text-gray-600 dark:text-[#797775]">
                            {s.status || "—"}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-gray-600 dark:text-[#797775]">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString("en-US") : "—"}
                      </td>
                      <td className="py-2 px-4">
                        <Sheet>
                          <SheetTrigger asChild>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 dark:bg-[#333333] hover:bg-gray-200 dark:hover:bg-[#444444] text-gray-900 dark:text-white text-xs rounded transition-colors">
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
                          </SheetTrigger>
                          <SheetContent className="bg-gray-50 dark:bg-[#1e1e1e] border-gray-200 dark:border-[#333333] text-gray-900 dark:text-white w-full sm:max-w-md p-0 flex flex-col font-sans">
                            <SheetHeader className="p-6 pb-4 border-b border-gray-200 dark:border-[#333333]">
                              <SheetTitle className="text-gray-900 dark:text-white flex items-center gap-2">
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
                                      className="h-16 w-16 rounded-md object-cover bg-gray-100 dark:bg-[#2d2d30]"
                                    />
                                  ) : (
                                    <div className="h-16 w-16 rounded-md bg-gray-100 dark:bg-[#2d2d30] flex items-center justify-center">
                                      <LayoutGrid className="h-6 w-6 text-gray-600 dark:text-[#797775]" />
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                      {s.name || "Untitled Space"}
                                    </h3>
                                    <div className="text-sm text-gray-600 dark:text-[#797775] capitalize">
                                      {s.type || "Uncategorized"}
                                    </div>
                                    <div className="mt-1 flex items-center gap-2">
                                      <span className="text-xs px-2 py-0.5 rounded-sm bg-gray-200 dark:bg-[#333333] text-gray-700 dark:text-[#cccccc] font-mono">
                                        {String(s.id).substring(0, 8)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="h-px bg-gray-200 dark:bg-[#333333]" />

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 gap-6">
                                  <DetailBlock icon={Building2} label="Workspace">
                                    {s.workspaceName || "—"}
                                  </DetailBlock>

                                  <DetailBlock icon={Map} label="Locations">
                                    {s.locations &&
                                    Array.isArray(s.locations) &&
                                    s.locations.length > 0 ? (
                                      <ul className="list-disc pl-4 space-y-1 text-gray-700 dark:text-[#cccccc]">
                                        {s.locations.map((loc: any, i: number) => (
                                          <li key={i}>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                              {loc.name}
                                            </span>
                                            {loc.address && (
                                              <div className="text-xs text-gray-600 dark:text-[#797775]">
                                                {loc.address}
                                              </div>
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <span className="italic text-gray-600 dark:text-[#797775]">
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
                                            className="bg-gray-100 dark:bg-[#2d2d30] p-2 rounded border border-gray-200 dark:border-[#333333] text-xs"
                                          >
                                            <div className="font-medium text-gray-900 dark:text-white">
                                              {plan.name}
                                            </div>
                                            <div className="text-[#dcdcaa]">
                                              {s.currency || "USD"} {plan.price} / {plan.interval}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="italic text-gray-600 dark:text-[#797775]">
                                        No plans configured
                                      </span>
                                    )}
                                  </DetailBlock>

                                  <DetailBlock icon={Info} label="Description">
                                    {s.description ? (
                                      <div className="whitespace-pre-wrap text-gray-700 dark:text-[#cccccc] leading-relaxed">
                                        {s.description}
                                      </div>
                                    ) : (
                                      <span className="italic text-gray-600 dark:text-[#797775]">
                                        No description provided
                                      </span>
                                    )}
                                  </DetailBlock>

                                  {(s.rsvp_form_id || s.show_rsvp_form_button) && (
                                    <DetailBlock icon={List} label="RSVP Form">
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-700 dark:text-[#cccccc]">
                                          {s.rsvp_form_button_text || "RSVP"}
                                        </span>
                                        {s.rsvp_form_id && (
                                          <span className="text-[10px] bg-gray-200 dark:bg-[#333333] px-1.5 py-0.5 rounded font-mono text-gray-600 dark:text-[#797775]">
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

          {/* Bookings */}
          {activeTab === "bookings" && (
            <table className="w-full text-left text-[13px] whitespace-nowrap">
              <thead className="bg-gray-100 dark:bg-[#2d2d30] text-gray-700 dark:text-[#cccccc]">
                <tr>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    ID
                  </th>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    Customer
                  </th>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    Venue
                  </th>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    Dates
                  </th>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    Status
                  </th>
                  <th className="font-semibold py-2 px-4 border-b border-gray-200 dark:border-[#333333]">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#333333] text-gray-700 dark:text-[#cccccc]">
                {filteredBookings.length === 0 ? (
                  <EmptyRow cols={6} label="No bookings found matching criteria" />
                ) : (
                  filteredBookings.map((b: any) => {
                    const isHighlighted = highlightedId === b.id;
                    return (
                      <tr
                        key={b.id}
                        id={`row-${b.id}`}
                        className={[
                          "transition-colors",
                          isHighlighted
                            ? "bg-[#f97316]/15 ring-2 ring-inset ring-[#f97316]/50 animate-pulse"
                            : "hover:bg-gray-200 dark:hover:bg-[#2d2d30]",
                        ].join(" ")}
                      >
                        <td className="py-2 px-4 font-mono text-gray-600 dark:text-[#797775] text-xs">
                          {String(b.id).substring(0, 8)}...
                        </td>
                        <td className="py-2 px-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {b.customer_name || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-[#797775]">
                            {b.customer_email || b.customer_phone || "—"}
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {b.rentable_venue?.name || "—"}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-[#797775]">
                            {b.workspaceName}
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="text-gray-900 dark:text-white">
                            {b.start_time ? new Date(b.start_time).toLocaleDateString("en-US") : "—"}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-[#797775]">
                            To: {b.end_time ? new Date(b.end_time).toLocaleDateString("en-US") : "—"}
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-gray-200 dark:bg-[#333333] text-gray-700 dark:text-[#cccccc] w-fit">
                              {b.status || "—"}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-sm w-fit ${
                                b.payment_status === "paid" || b.payment_status === "success"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-gray-200 dark:bg-[#333333] text-gray-700 dark:text-[#cccccc]"
                              }`}
                            >
                              {b.payment_status || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-4 font-medium text-[#dcdcaa]">
                          RWF {Number(b.total_amount || 0).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
