import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getScheduledServices, getServiceAttendees } from "@/api/admin_services";
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  Clapperboard,
  CalendarDays,
  Zap,
  Search,
  Filter,
  Clock,
  RefreshCw,
  X,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { format, parseISO, addDays, endOfWeek, endOfMonth, startOfDay } from "date-fns";
import { StatCard } from "@/components/admin/StatCard";

export const Route = createFileRoute("/internal/control/admin/master-schedule")({
  component: AdminServicesPage,
});

function AdminServicesPage() {
  const [timeframe, setTimeframe] = useState<"today" | "tomorrow" | "next4" | "week" | "month">(
    "week",
  );
  const [filterType, setFilterType] = useState<
    "All" | "Event" | "Cinema" | "Experience" | "Venue Booking"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Attendees Modal State
  const [selectedService, setSelectedService] = useState<{
    id: string;
    type: string;
    title: string;
  } | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);

      const now = new Date();
      let startDate = startOfDay(now);
      let endDate = new Date();

      switch (timeframe) {
        case "today":
          endDate = startOfDay(addDays(now, 1));
          break;
        case "tomorrow":
          startDate = startOfDay(addDays(now, 1));
          endDate = startOfDay(addDays(now, 2));
          break;
        case "next4":
          endDate = startOfDay(addDays(now, 4));
          break;
        case "week":
          endDate = endOfWeek(now, { weekStartsOn: 1 }); // Assuming Monday start
          break;
        case "month":
          endDate = endOfMonth(now);
          break;
      }

      try {
        const res = await getScheduledServices({
          data: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        });
        setServices(res.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [timeframe]);

  const filteredServices = services.filter((s) => {
    // 1. Filter by Type
    if (filterType !== "All" && s.type !== filterType) return false;

    // 2. Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !s.title?.toLowerCase().includes(q) &&
        !s.organizer?.toLowerCase().includes(q) &&
        !s.location?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case "Event":
        return <CalendarDays className="h-5 w-5 text-blue-500" />;
      case "Cinema":
        return <Clapperboard className="h-5 w-5 text-purple-500" />;
      case "Experience":
        return <Zap className="h-5 w-5 text-orange-500" />;
      case "Venue Booking":
        return <MapPin className="h-5 w-5 text-green-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case "Event":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "Cinema":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "Experience":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800";
      case "Venue Booking":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  };

  const handleViewAttendees = async (service: any) => {
    setSelectedService({ id: service.id, type: service.type, title: service.title });
    setIsModalOpen(true);
    setIsLoadingAttendees(true);
    setAttendees([]);
    try {
      const res = await getServiceAttendees({ data: { type: service.type, id: service.id } });
      setAttendees(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAttendees(false);
    }
  };

  const totalEvents = filteredServices.filter((s) => s.type === "Event").length;
  const totalCinemas = filteredServices.filter((s) => s.type === "Cinema").length;
  const totalExperiences = filteredServices.filter((s) => s.type === "Experience").length;
  const totalVenueBookings = filteredServices.filter((s) => s.type === "Venue Booking").length;
  const totalBookings = filteredServices.reduce((acc, curr) => acc + (curr.bookings || 0), 0);

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-[#333333] pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-gray-500" />
            Master Schedule
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track all Events, Cinema Screenings, and Experiences happening across the platform.
          </p>
        </div>

        {/* Timeframe Filters */}
        <div className="flex items-center bg-gray-100 dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-lg p-1">
          {[
            { id: "today", label: "Today" },
            { id: "tomorrow", label: "Tomorrow" },
            { id: "next4", label: "Next 4 Days" },
            { id: "week", label: "This Week" },
            { id: "month", label: "This Month" },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id as any)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                timeframe === tf.id
                  ? "bg-white dark:bg-[#252526] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#1a1a1a]"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Events" value={totalEvents.toString()} icon={CalendarDays} />
        <StatCard title="Cinema Showings" value={totalCinemas.toString()} icon={Clapperboard} />
        <StatCard title="Experiences" value={totalExperiences.toString()} icon={Zap} />
        <StatCard title="Venue Bookings" value={totalVenueBookings.toString()} icon={MapPin} />
        <StatCard title="Total RSVPs/Tickets" value={totalBookings.toString()} icon={Ticket} />
      </div>

      {/* Secondary Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, location, or organizer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-gray-500" />
          <div className="flex gap-2">
            {["All", "Event", "Cinema", "Experience", "Venue Booking"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  filterType === type
                    ? "bg-gray-800 text-white border-gray-800 dark:bg-white dark:text-black dark:border-white"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-[#111111] dark:text-gray-400 dark:border-[#333333] dark:hover:bg-[#252526]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-lg">
            <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-3 opacity-50" />
            <h3 className="text-gray-900 dark:text-white font-medium">No Scheduled Services</h3>
            <p className="text-gray-500 text-sm mt-1">
              There are no services matching your filters for this timeframe.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Left: Image & Date */}
                <div className="flex flex-col items-center sm:w-1/3">
                  <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-[#111111] border border-gray-200 dark:border-[#333333] mb-3">
                    {service.coverUrl ? (
                      <img
                        src={service.coverUrl}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getIconForType(service.type)}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border mb-2 ${getColorForType(service.type)}`}
                    >
                      {service.type}
                    </span>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {format(parseISO(service.date), "MMM d, yyyy")}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {format(parseISO(service.date), "h:mm a")}
                    </div>
                  </div>
                </div>

                {/* Right: Details */}
                <div className="flex-1 flex flex-col">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {service.title}
                  </h2>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
                      <span className="line-clamp-2">{service.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Organizer:
                      </span>{" "}
                      {service.organizer}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#333333] flex items-end justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <Ticket className="h-3.5 w-3.5" />
                        TICKET TIERS
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {service.ticketTiers && service.ticketTiers.length > 0 ? (
                          service.ticketTiers.slice(0, 3).map((tier: any, i: number) => (
                            <span
                              key={i}
                              className="inline-flex bg-gray-100 dark:bg-[#252526] px-2 py-1 rounded text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#444]"
                            >
                              {tier.name} <span className="text-gray-400 mx-1">•</span> RWF{" "}
                              {tier.price || tier.price_adjustment || 0}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">Free / No Tiers</span>
                        )}
                        {service.ticketTiers?.length > 3 && (
                          <span className="inline-flex bg-gray-100 dark:bg-[#252526] px-2 py-1 rounded text-xs text-gray-500 border border-gray-200 dark:border-[#444]">
                            +{service.ticketTiers.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-gray-500 font-medium mb-0.5">BOOKINGS</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {service.bookings.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {(service.type === "Event" || service.type === "Cinema") && (
                    <div className="mt-3">
                      <button
                        onClick={() => handleViewAttendees(service)}
                        className="w-full py-2 bg-gray-50 hover:bg-gray-100 dark:bg-[#252526] dark:hover:bg-[#2d2d2d] text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg border border-gray-200 dark:border-[#444] transition-colors flex items-center justify-center gap-1"
                      >
                        <Users className="h-4 w-4" />
                        View Attendees
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attendees Modal */}
      {isModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333333] rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#333333]">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Attendees for {selectedService.title}
                </h2>
                <p className="text-xs text-gray-500">{selectedService.type}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-[#252526] rounded-md text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {isLoadingAttendees ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3 text-gray-500">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <p className="text-sm">Loading attendees...</p>
                </div>
              ) : attendees.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="h-10 w-10 text-gray-400 mx-auto mb-3 opacity-50" />
                  <h3 className="text-gray-900 dark:text-white font-medium">No Attendees Yet</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    There are no bookings for this service.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 dark:border-[#333333] rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-[#333333]">
                    <thead className="bg-gray-50 dark:bg-[#252526]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ticket Tier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Scan Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#1a1a1a] divide-y divide-gray-200 dark:divide-[#333333]">
                      {attendees.map((attendee) => (
                        <tr key={attendee.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {attendee.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {attendee.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {attendee.ticketTier}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {attendee.status?.toLowerCase() === "scanned" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Scanned
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                                <Clock className="h-3.5 w-3.5" />
                                {attendee.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
