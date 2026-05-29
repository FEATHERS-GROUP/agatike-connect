import { createFileRoute } from "@tanstack/react-router";
import { DashboardDesktop } from "@/components/desktop/DashboardDesktop";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Organizer Dashboard — Agatike" },
      {
        name: "description",
        content: "Sell tickets, run analytics, scan attendees and grow your events.",
      },
    ],
  }),
  component: DashboardRoute,
});

function DashboardRoute() {
  return (
    <>
      <div className="md:hidden flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">Desktop Only</h2>
        <p className="text-muted-foreground text-sm">
          The dashboard is optimized for desktop viewing. Please access it from a computer for the best experience.
        </p>
      </div>
      <div className="hidden md:block">
        <DashboardDesktop />
      </div>
    </>
  );
}
