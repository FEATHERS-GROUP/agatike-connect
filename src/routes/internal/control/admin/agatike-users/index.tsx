import { createFileRoute, Link } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";
import { useState } from "react";
import { getAllUsers } from "@/api/users";

import {
  ExplorerIcon,
  EnthusiastIcon,
  VipIcon,
  SocialIcon,
  SubscriberIcon,
  VenueIcon,
} from "@/components/profile/ProfileBadges";

export const Route = createFileRoute("/internal/control/admin/agatike-users/")({
  loader: () => getAllUsers(),
  component: UsersPage,
});

function UsersPage() {
  const users = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const filteredUsers = users.filter(
    (u: any) =>
      (u.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.handle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.id || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            Agatike Users
            <LucideIcons.Users className="w-6 h-6 text-[#f97316]" />
          </h1>
          <p className="text-gray-500 dark:text-[#888888] mt-1 text-sm">
            Manage and view all registered users on the platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-[#888888]" />
            <input
              type="text"
              placeholder="Search by username, email, or handle..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#f97316] placeholder:text-gray-500 dark:text-[#666666]"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#252526] hover:bg-gray-200 dark:hover:bg-[#2d2d30] border border-gray-200 dark:border-[#333333] rounded-lg text-sm font-medium text-gray-900 dark:text-white transition-colors w-full sm:w-auto shrink-0">
            <LucideIcons.Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="hidden sm:block bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700 dark:text-[#cccccc]">
            <thead className="bg-gray-50 dark:bg-[#252526] text-gray-500 dark:text-[#888888] border-b border-gray-200 dark:border-[#333333]">
              <tr>
                <th className="px-4 py-3 font-medium">User Profile</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Joined Date</th>
                <th className="px-4 py-3 font-medium">Achievements</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#333333]">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500 dark:text-[#888888]"
                  >
                    No users found. {searchQuery && "Try a different search query."}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user: any) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-100 dark:hover:bg-[#252526] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#333333] overflow-hidden shrink-0 border border-gray-300 dark:border-[#444444] flex items-center justify-center">
                          {user.profile?.avatar_url ? (
                            <img
                              src={user.profile.avatar_url}
                              alt={user.username || "User"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <LucideIcons.User className="w-5 h-5 text-gray-500 dark:text-[#888888]" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user.username || "Anonymous"}
                          </div>
                          <div className="text-xs text-[#f97316]">
                            @{user.handle || user.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.email || "No email"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-[#888888] mt-0.5 font-mono">
                        ID: {user.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.country ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-200 dark:bg-[#333333] text-xs">
                          <LucideIcons.MapPin className="w-3 h-3 text-gray-600 dark:text-[#aaaaaa]" />
                          {user.country}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-[#888888]">Unknown</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-[#aaaaaa]">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Unknown"}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const totalEvents = user.totalEvents || 0;
                        const totalSubscriptions = user.totalSubscriptions || 0;
                        const totalVenueBookings = user.totalVenueBookings || 0;
                        const followingCount = user.totalFollowing || 0;

                        const badges = [];
                        if (totalEvents >= 10)
                          badges.push({
                            title: "Event Explorer",
                            Icon: ExplorerIcon,
                            color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
                          });
                        if (totalEvents >= 50)
                          badges.push({
                            title: "Enthusiast",
                            Icon: EnthusiastIcon,
                            color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
                          });
                        if (totalEvents >= 100)
                          badges.push({
                            title: "VIP Attendee",
                            Icon: VipIcon,
                            color: "text-orange-500 bg-orange-500/20 border-orange-500/30",
                          });
                        if (followingCount >= 25)
                          badges.push({
                            title: "Social Butterfly",
                            Icon: SocialIcon,
                            color: "text-orange-400 bg-orange-400/10 border-orange-400/20",
                          });
                        if (totalSubscriptions >= 5)
                          badges.push({
                            title: "Loyal Subscriber",
                            Icon: SubscriberIcon,
                            color: "text-red-500 bg-red-500/10 border-red-500/20",
                          });
                        if (totalVenueBookings >= 50)
                          badges.push({
                            title: "Space Booker",
                            Icon: VenueIcon,
                            color: "text-orange-400 bg-orange-300/10 border-orange-400/20",
                          });

                        if (badges.length === 0) {
                          return (
                            <span className="text-xs text-gray-500 dark:text-[#888888] italic">
                              No badges
                            </span>
                          );
                        }

                        return (
                          <div className="flex flex-wrap gap-1.5 max-w-[120px]">
                            {badges.map((b, i) => (
                              <div
                                key={i}
                                title={b.title}
                                className={`p-1 rounded-md border ${b.color} flex items-center justify-center shrink-0 cursor-help transition-transform hover:scale-110`}
                              >
                                <b.Icon className="w-3.5 h-3.5" />
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/internal/control/admin/agatike-users/${user.id}`}
                        className="p-2 text-gray-500 dark:text-[#888888] hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#333333] rounded-lg transition-colors inline-block"
                        title="View User Details"
                      >
                        <LucideIcons.ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile card list (shown only on small screens) ─────────── */}
      <div className="sm:hidden space-y-3">
        {paginatedUsers.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-[#888888] text-sm">
            No users found. {searchQuery && "Try a different search query."}
          </div>
        ) : (
          paginatedUsers.map((user: any) => {
            const totalEvents = user.totalEvents || 0;
            const totalSubscriptions = user.totalSubscriptions || 0;
            const totalVenueBookings = user.totalVenueBookings || 0;
            const followingCount = user.totalFollowing || 0;
            const badges: { title: string; Icon: any; color: string }[] = [];
            if (totalEvents >= 10)
              badges.push({
                title: "Event Explorer",
                Icon: ExplorerIcon,
                color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
              });
            if (totalEvents >= 50)
              badges.push({
                title: "Enthusiast",
                Icon: EnthusiastIcon,
                color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
              });
            if (totalEvents >= 100)
              badges.push({
                title: "VIP Attendee",
                Icon: VipIcon,
                color: "text-orange-500 bg-orange-500/20 border-orange-500/30",
              });
            if (followingCount >= 25)
              badges.push({
                title: "Social Butterfly",
                Icon: SocialIcon,
                color: "text-orange-400 bg-orange-400/10 border-orange-400/20",
              });
            if (totalSubscriptions >= 5)
              badges.push({
                title: "Loyal Subscriber",
                Icon: SubscriberIcon,
                color: "text-red-500 bg-red-500/10 border-red-500/20",
              });
            if (totalVenueBookings >= 50)
              badges.push({
                title: "Space Booker",
                Icon: VenueIcon,
                color: "text-orange-400 bg-orange-300/10 border-orange-400/20",
              });

            return (
              <div
                key={user.id}
                className="bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded-xl p-4 flex items-start gap-3"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#333333] overflow-hidden shrink-0 border border-gray-300 dark:border-[#444444] flex items-center justify-center">
                  {user.profile?.avatar_url ? (
                    <img
                      src={user.profile.avatar_url}
                      alt={user.username || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <LucideIcons.User className="w-5 h-5 text-gray-500 dark:text-[#888888]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {user.username || "Anonymous"}
                      </p>
                      <p className="text-xs text-[#f97316]">
                        @{user.handle || user.id.slice(0, 8)}
                      </p>
                    </div>
                    <Link
                      to={`/internal/control/admin/agatike-users/${user.id}`}
                      className="p-2 text-gray-500 dark:text-[#888888] hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#333333] rounded-lg transition-colors shrink-0"
                    >
                      <LucideIcons.ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600 dark:text-[#aaaaaa] truncate">
                      {user.email || "No email"}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {user.country && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-[#888888]">
                          <LucideIcons.MapPin className="w-3 h-3" />
                          {user.country}
                        </span>
                      )}
                      {user.created_at && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-[#888888]">
                          <LucideIcons.CalendarDays className="w-3 h-3" />
                          {new Date(user.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    {badges.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {badges.map((b, i) => (
                          <div
                            key={i}
                            title={b.title}
                            className={`p-1 rounded-md border ${b.color} flex items-center justify-center cursor-help`}
                          >
                            <b.Icon className="w-3.5 h-3.5" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-gray-500 dark:text-[#888888]">
            Showing{" "}
            <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span> to{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {filteredUsers.length}
            </span>{" "}
            users
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] text-gray-600 dark:text-[#aaaaaa] hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition-colors"
            >
              <LucideIcons.ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 dark:text-[#aaaaaa] px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] text-gray-600 dark:text-[#aaaaaa] hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition-colors"
            >
              <LucideIcons.ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
