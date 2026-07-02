import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getAdminOrganizerOverview } from "@/api/admin_organizer_control";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId")({
  loader: async ({ params }) => {
    const overview = await getAdminOrganizerOverview({ data: { organizerId: params.organizerId } } as any);
    return { overview };
  },
  component: OrganizerDetailsLayout,
});

function OrganizerDetailsLayout() {
  const { overview } = Route.useLoaderData();

  return (
    <div className="flex flex-col h-full bg-[#111111] text-[#cccccc]">
      <div className="flex items-center gap-4 mb-6 border-b border-[#333333] pb-4">
        {overview.image ? (
          <img src={overview.image} alt="" className="h-12 w-12 rounded-sm object-cover border border-[#333333]" />
        ) : (
          <div className="h-12 w-12 rounded-sm bg-[#333333] flex items-center justify-center text-xl font-bold">
            {overview.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            {overview.name}
            {overview.active ? (
              <span className="text-xs bg-[#84c87e]/20 text-[#84c87e] px-2 py-0.5 rounded-sm border border-[#84c87e]/30">Active</span>
            ) : (
              <span className="text-xs bg-[#f43f5e]/20 text-[#f43f5e] px-2 py-0.5 rounded-sm border border-[#f43f5e]/30">Inactive</span>
            )}
            {overview.hasActiveSubscription && (
              <span className="text-xs bg-[#f97316]/20 text-[#f97316] px-2 py-0.5 rounded-sm border border-[#f97316]/30">Pro</span>
            )}
          </h1>
          <p className="text-[#797775]">@{overview.handle} • {overview.email}</p>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
