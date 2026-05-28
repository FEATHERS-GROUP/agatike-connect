import { createFileRoute } from "@tanstack/react-router";
import { DashboardMobile } from "@/components/mobile/DashboardMobile";
import { DashboardDesktop } from "@/components/desktop/DashboardDesktop";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Organizer Dashboard — Agatike" },
      { name: "description", content: "Sell tickets, run analytics, scan attendees and grow your events." },
    ],
  }),
  component: DashboardRoute,
});

function DashboardRoute() {
  return (
    <>
      <div className="md:hidden">
        <DashboardMobile />
      </div>
      <div className="hidden md:block">
        <DashboardDesktop />
      </div>
    </>
  );
}