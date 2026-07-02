import { createFileRoute, Outlet, redirect, useRouterState, useNavigate } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminOrganizerSidebar } from "@/components/admin/AdminOrganizerSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAdminSession } from "@/api/admin_auth";

export const Route = createFileRoute("/internal/control/admin")({
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/internal/control/admin/login") {
      return;
    }

    try {
      const session = await getAdminSession();
      if (!session) {
        throw new Error("unauthenticated");
      }
      return { session };
    } catch {
      throw redirect({
        to: "/internal/control/admin/login",
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Admin Portal — Agatike" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const location = useRouterState({ select: (s) => s.location });
  const isLoginPage = location.pathname === "/internal/control/admin/login";
  const isOrganizerDetails = location.pathname.startsWith("/internal/control/admin/organizers/") && location.pathname.length > "/internal/control/admin/organizers/".length;

  return (
    <div className="min-h-screen bg-[#111111] text-[#cccccc] font-sans text-sm selection:bg-[#f97316]/30">
      {isLoginPage ? (
        <main className="w-full h-screen bg-[#111111]">
          <Outlet />
        </main>
      ) : (
        <div className="flex flex-col h-screen overflow-hidden bg-[#111111]">
          {/* Azure Portal Full-Width Header */}
          <AdminHeader />
          
          <div className="flex flex-1 overflow-hidden">
            {isOrganizerDetails ? <AdminOrganizerSidebar /> : <AdminSidebar />}
            
            <main className="flex-1 overflow-y-auto p-4 bg-[#111111]">
              <Outlet />
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
