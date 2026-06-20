import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { BoxOfficeWidget } from "@/components/desktop/dashboard/cinema/BoxOfficeWidget";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId")({
  component: CinemaLayout,
});

function CinemaLayout() {
  const { workspaceSlug, cinemaId } = useParams({ from: "/dashboard/$workspaceSlug/Cinema/$cinemaId" });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Outlet />
      <BoxOfficeWidget workspaceSlug={workspaceSlug} cinemaId={cinemaId} />
    </div>
  );
}
