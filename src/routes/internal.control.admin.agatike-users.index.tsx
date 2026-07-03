import { createFileRoute, Link } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";
import { useState } from "react";
import { getAllUsers } from "@/api/users";

export const Route = createFileRoute("/internal/control/admin/agatike-users/")({
  loader: () => getAllUsers(),
  component: UsersPage,
});

function UsersPage() {
  const users = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const filteredUsers = users.filter((u: any) => 
    (u.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.handle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.id || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            Agatike Users
            <LucideIcons.Users className="w-6 h-6 text-[#f97316]" />
          </h1>
          <p className="text-[#888888] mt-1 text-sm">
            Manage and view all registered users on the platform.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
            <input 
              type="text"
              placeholder="Search by username, email, or handle..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#1b1b1c] border border-[#333333] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#f97316] placeholder:text-[#666666]"
            />
          </div>
          <button 
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#252526] hover:bg-[#2d2d30] border border-[#333333] rounded-lg text-sm font-medium text-white transition-colors w-full sm:w-auto shrink-0"
          >
            <LucideIcons.Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-[#1b1b1c] border border-[#333333] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#cccccc]">
            <thead className="bg-[#252526] text-[#888888] border-b border-[#333333]">
              <tr>
                <th className="px-6 py-4 font-medium">User Profile</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Joined Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333]">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#888888]">
                    No users found. {searchQuery && "Try a different search query."}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-[#252526] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#333333] overflow-hidden shrink-0 border border-[#444444] flex items-center justify-center">
                          {user.profile?.avatar_url ? (
                            <img 
                              src={user.profile.avatar_url} 
                              alt={user.username || "User"} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <LucideIcons.User className="w-5 h-5 text-[#888888]" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {user.username || "Anonymous"}
                          </div>
                          <div className="text-xs text-[#f97316]">
                            @{user.handle || user.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">{user.email || "No email"}</div>
                      <div className="text-xs text-[#888888] mt-0.5 font-mono">
                        ID: {user.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.country ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#333333] text-xs">
                          <LucideIcons.MapPin className="w-3 h-3 text-[#aaaaaa]" />
                          {user.country}
                        </span>
                      ) : (
                        <span className="text-xs text-[#888888]">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#aaaaaa]">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric'
                      }) : "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/internal/control/admin/agatike-users/${user.id}`}
                        className="p-2 text-[#888888] hover:text-white hover:bg-[#333333] rounded-lg transition-colors inline-block"
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-[#888888]">
            Showing <span className="font-medium text-white">{startIndex + 1}</span> to{" "}
            <span className="font-medium text-white">
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)}
            </span>{" "}
            of <span className="font-medium text-white">{filteredUsers.length}</span> users
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-[#1b1b1c] border border-[#333333] text-[#aaaaaa] hover:text-white disabled:opacity-50 transition-colors"
            >
              <LucideIcons.ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-[#aaaaaa] px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-[#1b1b1c] border border-[#333333] text-[#aaaaaa] hover:text-white disabled:opacity-50 transition-colors"
            >
              <LucideIcons.ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
