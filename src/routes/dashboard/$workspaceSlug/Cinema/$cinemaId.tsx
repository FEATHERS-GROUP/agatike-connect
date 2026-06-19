import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId")({
  component: CinemaLayout,
});

function CinemaLayout() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Outlet />
    </div>
  );
}
