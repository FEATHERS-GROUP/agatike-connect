import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/venues/$venueId")({
  component: VenueLayout,
});

function VenueLayout() {
  return (
    <div className="space-y-8">
      <Outlet />
    </div>
  );
}
