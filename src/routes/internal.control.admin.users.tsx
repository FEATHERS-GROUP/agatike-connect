import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Shield, Plus, Edit, Trash2, X, Check, Loader2, CheckSquare, Square } from "lucide-react";
import { getAdminUsers, getAdminGroups, createAdminGroup, updateAdminGroup, deleteAdminGroup, createAdminUser, updateAdminUser, deleteAdminUser } from "@/api/admin_users";
import type { AdminUser, AdminGroup } from "@/api/admin_users";

export const Route = createFileRoute("/internal/control/admin/users")({
  component: AdminUsersPage,
});

const AVAILABLE_PAGES = [
  { path: "/internal/control/admin/dashboard", label: "Dashboard" },
  { path: "/internal/control/admin/services", label: "All Services" },
  { path: "/internal/control/admin/agatike-users", label: "Agatike Users" },
  { path: "/internal/control/admin/users", label: "Users & Roles" },
  { path: "/internal/control/admin/organizers", label: "Organizers" },
  { path: "/internal/control/admin/leads", label: "Leads" },
  { path: "/internal/control/admin/transactions", label: "Transactions" },
  { path: "/internal/control/admin/health", label: "System Health" },
  { path: "/internal/control/admin/moderation", label: "Moderation" },
  { path: "/internal/control/admin/providers", label: "Provider Fees" },
  { path: "/internal/control/admin/pricing", label: "Pricing Plans" },
  { path: "/internal/control/admin/earnings", label: "Earnings Analytics" },
  { path: "/internal/control/admin/modules", label: "Modules" },
  { path: "/internal/control/admin/support", label: "Help & Support" },
];

function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<"users" | "groups">("users");

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111] text-gray-700 dark:text-[#ccc]">
      <div className="p-6 border-b border-gray-200 dark:border-[#333] shrink-0 bg-gray-50 dark:bg-[#161616]">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-[#f97316]" />
          Users & Roles Management
        </h1>
        <p className="text-[12px] text-gray-500 dark:text-[#888] mt-1">Manage global admin access and role-based permissions.</p>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "users" ? "border-[#f97316] text-gray-900 dark:text-white" : "border-transparent text-gray-500 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa]"
            }`}
          >
            Admin Users
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "groups" ? "border-[#f97316] text-gray-900 dark:text-white" : "border-transparent text-gray-500 dark:text-[#666] hover:text-gray-600 dark:text-[#aaa]"
            }`}
          >
            Groups & Permissions
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === "users" ? <UsersTab /> : <GroupsTab />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Users Tab
// ─────────────────────────────────────────────────────────

function UsersTab() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin_users"],
    queryFn: () => getAdminUsers(),
  });

  const { data: groups } = useQuery({
    queryKey: ["admin_groups"],
    queryFn: () => getAdminGroups(),
  });

  const deleteMutation = useMutation({
    mutationFn: (vars: { id: string }) => deleteAdminUser({ data: vars }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_users"] }),
  });

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#f97316]" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-medium rounded transition-colors"
        >
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      <div className="bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#333] rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white dark:bg-[#111] border-b border-gray-200 dark:border-[#333] text-gray-500 dark:text-[#888] uppercase text-[11px]">
            <tr>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Group / Access</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#2a2a2a]">
            {users?.map(user => (
              <tr key={user.id} className="hover:bg-gray-100 dark:bg-[#1a1a1a]">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{user.email}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-[#aaa]">{user.name || "—"}</td>
                <td className="px-4 py-3">
                  {user.is_super_admin ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-red-500/10 text-red-500 border border-red-500/20">
                      <Shield className="h-3 w-3" /> Super Admin
                    </span>
                  ) : user.group ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-gray-200 dark:bg-[#333] text-gray-900 dark:text-[#ddd]">
                      {user.group.name}
                    </span>
                  ) : (
                    <span className="text-gray-500 dark:text-[#666] text-xs">No Group</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setEditingUser(user); setIsModalOpen(true); }} className="p-1.5 text-gray-500 dark:text-[#666] hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:bg-[#333] rounded transition-colors"><Edit className="h-4 w-4" /></button>
                    {!user.is_super_admin && (
                      <button 
                        onClick={() => { if(confirm("Delete this user?")) deleteMutation.mutate({ id: user.id }) }}
                        className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && <UserModal user={editingUser} groups={groups || []} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

function UserModal({ user, groups, onClose }: { user: AdminUser | null; groups: AdminGroup[]; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [groupId, setGroupId] = useState(user?.admin_group_id || "");
  const [isSuperAdmin, setIsSuperAdmin] = useState(user?.is_super_admin || false);

  const mutation = useMutation({
    mutationFn: (vars: any) => user ? updateAdminUser({ data: vars }) : createAdminUser({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
      onClose();
    },
    onError: (error: any) => {
      alert(`Error saving user: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && !password) return alert("Password is required for new users");
    mutation.mutate({
      id: user?.id as string,
      email,
      name,
      password: password || undefined,
      admin_group_id: isSuperAdmin ? null : (groupId || null),
      is_super_admin: isSuperAdmin,
    } as any);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-[#333] flex justify-between items-center bg-white dark:bg-[#111]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user ? "Edit User" : "Add New User"}</h2>
          <button onClick={onClose} className="p-1 text-gray-500 dark:text-[#666] hover:text-gray-900 dark:hover:text-white transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#888] uppercase mb-1.5">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#f97316] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#888] uppercase mb-1.5">Name (Optional)</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#f97316] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#888] uppercase mb-1.5">Password {user && "(Leave blank to keep)"}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#f97316] outline-none" />
          </div>
          
          <div className="pt-2 border-t border-gray-200 dark:border-[#333]">
            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <input type="checkbox" checked={isSuperAdmin} onChange={e => setIsSuperAdmin(e.target.checked)} className="rounded bg-white dark:bg-[#111] border-gray-200 dark:border-[#333] text-[#f97316] focus:ring-0 focus:ring-offset-0 w-4 h-4" />
              <span className="text-sm font-semibold text-red-400">Make Super Admin</span>
            </label>

            {!isSuperAdmin && (
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-[#888] uppercase mb-1.5">Assign Group</label>
                <select value={groupId} onChange={e => setGroupId(e.target.value)} className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#f97316] outline-none">
                  <option value="">-- No Group --</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-[#aaa] hover:bg-gray-200 dark:bg-[#333] rounded transition-colors">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-medium rounded transition-colors flex items-center gap-2">
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Groups Tab
// ─────────────────────────────────────────────────────────

function GroupsTab() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AdminGroup | null>(null);

  const { data: groups, isLoading } = useQuery({
    queryKey: ["admin_groups"],
    queryFn: () => getAdminGroups(),
  });

  const deleteMutation = useMutation({
    mutationFn: (vars: { id: string }) => deleteAdminGroup({ data: vars }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_groups"] }),
  });

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#f97316]" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => { setEditingGroup(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-medium rounded transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups?.map(group => (
          <div key={group.id} className="bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#333] rounded-lg p-5 flex flex-col hover:border-gray-300 dark:border-[#444] transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{group.name}</h3>
                <p className="text-[11px] text-gray-500 dark:text-[#666] mt-0.5">{group.permissions.length} pages granted</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditingGroup(group); setIsModalOpen(true); }} className="p-1.5 text-gray-500 dark:text-[#666] hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:bg-[#333] rounded transition-colors"><Edit className="h-4 w-4" /></button>
                <button onClick={() => { if(confirm(`Delete ${group.name}?`)) deleteMutation.mutate({ id: group.id }); }} className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="flex-1 flex flex-wrap gap-1.5 content-start">
              {group.permissions.map(path => {
                const page = AVAILABLE_PAGES.find(p => p.path === path);
                return (
                  <span key={path} className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-gray-100 dark:bg-[#222] border border-gray-200 dark:border-[#333] text-gray-600 dark:text-[#aaa]">
                    {page?.label || path}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
        {groups?.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-500 dark:text-[#666] border border-dashed border-gray-200 dark:border-[#333] rounded-lg">
            No groups created yet.
          </div>
        )}
      </div>

      {isModalOpen && <GroupModal group={editingGroup} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

function GroupModal({ group, onClose }: { group: AdminGroup | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(group?.name || "");
  const [perms, setPerms] = useState<string[]>(group?.permissions || []);

  const mutation = useMutation({
    mutationFn: (vars: any) => group ? updateAdminGroup({ data: vars }) : createAdminGroup({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_groups"] });
      onClose();
    },
    onError: (error: any) => {
      alert(`Error saving group: ${error.message}`);
    }
  });

  const togglePerm = (path: string) => {
    setPerms(prev => prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      id: group?.id as string,
      name,
      permissions: perms,
    } as any);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-[#333] flex justify-between items-center bg-white dark:bg-[#111] shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{group ? "Edit Group" : "Create Group"}</h2>
          <button onClick={onClose} className="p-1 text-gray-500 dark:text-[#666] hover:text-gray-900 dark:hover:text-white transition-colors"><X className="h-5 w-5" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-[#333] shrink-0">
            <label className="block text-xs font-medium text-gray-500 dark:text-[#888] uppercase mb-1.5">Group Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Support Team" className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#f97316] outline-none" />
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase mb-4 tracking-wide border-b border-gray-200 dark:border-[#333] pb-2">Page Permissions</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_PAGES.map(page => {
                const isSelected = perms.includes(page.path);
                return (
                  <div
                    key={page.path}
                    onClick={() => togglePerm(page.path)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected ? "bg-[#f97316]/10 border-[#f97316]/30" : "bg-white dark:bg-[#111] border-gray-200 dark:border-[#333] hover:border-gray-300 dark:hover:border-gray-300 dark:border-[#555]"
                    }`}
                  >
                    {isSelected ? <CheckSquare className="h-5 w-5 text-[#f97316]" /> : <Square className="h-5 w-5 text-gray-500 dark:text-[#555]" />}
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${isSelected ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-[#888]"}`}>{page.label}</div>
                      <div className="text-[10px] text-gray-500 dark:text-[#555] truncate font-mono mt-0.5">{page.path}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-5 py-4 border-t border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-[#aaa] hover:bg-gray-200 dark:bg-[#333] rounded transition-colors">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-medium rounded transition-colors flex items-center gap-2">
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
