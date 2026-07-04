import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";
import { useState } from "react";
import { getUserDetailsForAdmin, toggleUserActiveStatus } from "@/api/users";

export const Route = createFileRoute("/internal/control/admin/agatike-users/$userId")({
  loader: ({ params }) => getUserDetailsForAdmin({ data: { userId: params.userId } } as any),
  component: UserDetailsPage,
});

function UserDetailsPage() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "tickets" | "subscriptions">("overview");

  if (!data || !data.users_by_pk) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <LucideIcons.UserX className="w-12 h-12 text-gray-500 dark:text-[#888888] mb-4" />
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">User Not Found</h2>
        <p className="text-gray-500 dark:text-[#888888] mb-6">The user you are looking for does not exist or has been deleted.</p>
        <Link 
          to="/internal/control/admin/agatike-users"
          className="px-4 py-2 bg-gray-50 dark:bg-[#1b1b1c] hover:bg-gray-100 dark:hover:bg-[#252526] border border-gray-200 dark:border-[#333333] text-gray-900 dark:text-white rounded-lg transition-colors"
        >
          Back to Users
        </Link>
      </div>
    );
  }

  const user = data.users_by_pk;
  const attendees = data.event_attendees || [];
  const venues = data.venue_bookings || [];
  const subscriptions = data.space_subscriptions || [];

  const handleToggleActive = async () => {
    if (!confirm(`Are you sure you want to ${user.active ? 'deactivate' : 'activate'} this user's account?`)) return;
    
    setIsToggling(true);
    try {
      const res = await toggleUserActiveStatus({ data: { userId: user.id, active: !user.active } } as any);
      if (res.success) {
        router.invalidate();
      } else {
        alert("Failed to update user status.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating the status.");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/internal/control/admin/agatike-users"
            className="p-2 bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded-lg text-gray-500 dark:text-[#888888] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252526] transition-colors"
          >
            <LucideIcons.ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {user.username || "Anonymous"}
              {user.active ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-500/10 text-green-500 uppercase tracking-wider border border-green-500/20">Active</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-500 uppercase tracking-wider border border-red-500/20">Deactivated</span>
              )}
            </h1>
            <p className="text-gray-500 dark:text-[#888888] mt-1 text-sm font-mono">
              @{user.handle || user.id.slice(0, 8)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleToggleActive}
            disabled={isToggling}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
              user.active 
                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20" 
                : "bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20"
            }`}
          >
            {isToggling ? (
              <LucideIcons.Loader2 className="w-4 h-4 animate-spin" />
            ) : user.active ? (
              <LucideIcons.UserMinus className="w-4 h-4" />
            ) : (
              <LucideIcons.UserCheck className="w-4 h-4" />
            )}
            {user.active ? "Deactivate Account" : "Activate Account"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-[#333333] pb-px">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "overview" ? "border-[#f97316] text-[#f97316]" : "border-transparent text-gray-500 dark:text-[#888888] hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "tickets" ? "border-[#f97316] text-[#f97316]" : "border-transparent text-gray-500 dark:text-[#888888] hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Tickets
          <span className="px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-[#333333] text-[10px] text-gray-900 dark:text-white leading-none">
            {attendees.length + venues.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "subscriptions" ? "border-[#f97316] text-[#f97316]" : "border-transparent text-gray-500 dark:text-[#888888] hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Subscriptions
          <span className="px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-[#333333] text-[10px] text-gray-900 dark:text-white leading-none">
            {subscriptions.length}
          </span>
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="col-span-1 md:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded-xl p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-[#252526] border border-gray-300 dark:border-[#444444] flex items-center justify-center overflow-hidden mb-4">
                {user.profile?.avatar_url ? (
                  <img src={user.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <LucideIcons.User className="w-10 h-10 text-gray-500 dark:text-[#555555]" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{user.username || "Anonymous User"}</h3>
              <p className="text-sm text-gray-500 dark:text-[#888888] mb-4">@{user.handle || "no_handle"}</p>
              
              <div className="w-full space-y-3 mt-2 text-left">
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-[#cccccc]">
                  <LucideIcons.Mail className="w-4 h-4 text-gray-500 dark:text-[#888888]" />
                  <span className="truncate">{user.email || "No email provided"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-[#cccccc]">
                  <LucideIcons.MapPin className="w-4 h-4 text-gray-500 dark:text-[#888888]" />
                  <span>{user.country || "Unknown Location"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-[#cccccc]">
                  <LucideIcons.Calendar className="w-4 h-4 text-gray-500 dark:text-[#888888]" />
                  <span>Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-[#cccccc]">
                  <LucideIcons.FileCheck className="w-4 h-4 text-gray-500 dark:text-[#888888]" />
                  <span>Agreed to terms: {user.agreed_to_terms ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Metadata</h3>
              <div className="bg-white dark:bg-[#111111] rounded-lg p-4 border border-gray-200 dark:border-[#333333] overflow-x-auto">
                <pre className="text-xs text-gray-600 dark:text-[#aaaaaa] font-mono whitespace-pre-wrap">
                  {JSON.stringify(user.profile || {}, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <LucideIcons.ShieldAlert className="w-5 h-5 text-red-500" />
                Danger Zone
              </h3>
              <p className="text-sm text-gray-500 dark:text-[#888888] mb-4">
                These actions have significant consequences on the user's account and access to the platform.
              </p>
              
              <div className="flex flex-col gap-4 border border-gray-200 dark:border-[#333333] rounded-lg p-4 bg-white dark:bg-[#111111]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Deactivate Account</h4>
                    <p className="text-xs text-gray-500 dark:text-[#888888] mt-0.5 max-w-sm">
                      Deactivating an account will prevent the user from logging in and using the platform until it is reactivated.
                    </p>
                  </div>
                  <button 
                    onClick={handleToggleActive}
                    disabled={isToggling}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {isToggling ? "Processing..." : user.active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "tickets" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-[#252526]">
              <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <LucideIcons.Ticket className="w-4 h-4 text-[#f97316]" />
                Event Tickets
              </h3>
            </div>
            {attendees.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-[#888888] text-sm">
                This user has not purchased any event tickets.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700 dark:text-[#cccccc]">
                  <thead className="bg-gray-50 dark:bg-[#1b1b1c] text-gray-500 dark:text-[#888888] border-b border-gray-200 dark:border-[#333333]">
                    <tr>
                      <th className="px-6 py-3 font-medium">Event</th>
                      <th className="px-6 py-3 font-medium">Attendee Name</th>
                      <th className="px-6 py-3 font-medium">Ticket Type</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-[#333333]">
                    {attendees.map((att: any) => (
                      <tr key={att.id} className="hover:bg-gray-100 dark:hover:bg-[#252526] transition-colors">
                        <td className="px-6 py-3 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          {att.events?.title || "Unknown Event"}
                        </td>
                        <td className="px-6 py-3">{att.names || "N/A"}</td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-0.5 rounded bg-gray-200 dark:bg-[#333333] text-xs">
                            {att.ticket_type || "Standard"}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            att.status === 'confirmed' || !att.status ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {att.status || "Confirmed"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-500 dark:text-[#888888] text-xs">
                          {new Date(att.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-[#252526]">
              <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <LucideIcons.Building2 className="w-4 h-4 text-[#f97316]" />
                Venue Bookings
              </h3>
            </div>
            {venues.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-[#888888] text-sm">
                This user has not booked any venues.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700 dark:text-[#cccccc]">
                  <thead className="bg-gray-50 dark:bg-[#1b1b1c] text-gray-500 dark:text-[#888888] border-b border-gray-200 dark:border-[#333333]">
                    <tr>
                      <th className="px-6 py-3 font-medium">Venue</th>
                      <th className="px-6 py-3 font-medium">Customer</th>
                      <th className="px-6 py-3 font-medium">Amount</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Booking Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-[#333333]">
                    {venues.map((venue: any) => (
                      <tr key={venue.id} className="hover:bg-gray-100 dark:hover:bg-[#252526] transition-colors">
                        <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                          {venue.rentable_venue?.name || "Unknown Venue"}
                        </td>
                        <td className="px-6 py-3">{venue.customer_name || "N/A"}</td>
                        <td className="px-6 py-3">{venue.amount || "0"}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            venue.status === 'confirmed' || venue.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {venue.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-500 dark:text-[#888888] text-xs">
                          {new Date(venue.start_time).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "subscriptions" && (
        <div className="bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded-xl overflow-hidden animate-in fade-in duration-300">
          <div className="p-4 border-b border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-[#252526]">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <LucideIcons.Box className="w-4 h-4 text-[#f97316]" />
              Space Subscriptions
            </h3>
          </div>
          {subscriptions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-[#888888] text-sm">
              This user does not have any active or past subscriptions.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700 dark:text-[#cccccc]">
                <thead className="bg-gray-50 dark:bg-[#1b1b1c] text-gray-500 dark:text-[#888888] border-b border-gray-200 dark:border-[#333333]">
                  <tr>
                    <th className="px-6 py-3 font-medium">Space & Plan</th>
                    <th className="px-6 py-3 font-medium">Price</th>
                    <th className="px-6 py-3 font-medium">Billing Cycle</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Next Billing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#333333]">
                  {subscriptions.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-gray-100 dark:hover:bg-[#252526] transition-colors">
                      <td className="px-6 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">{sub.space?.name || "Unknown Space"}</div>
                        <div className="text-xs text-gray-500 dark:text-[#888888] mt-0.5">{sub.plan_name}</div>
                      </td>
                      <td className="px-6 py-3 font-mono">{sub.price || "0"}</td>
                      <td className="px-6 py-3 capitalize">{sub.billing_cycle || "Monthly"}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          sub.status === 'active' ? 'bg-green-500/10 text-green-500' : 
                          sub.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {sub.status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-500 dark:text-[#888888] text-xs">
                        {sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
