import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId")({
  component: SpaceLayout,
});

function SpaceLayout() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Outlet />
    </div>
  );
}
