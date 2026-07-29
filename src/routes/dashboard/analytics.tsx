import { createFileRoute, redirect } from '@tanstack/react-router'
import { AnalyticsDashboard } from "@/components/dashboard/analytics/AnalyticsDashboard";
import { getSession } from "@/api/auth";

export const Route = createFileRoute("/dashboard/analytics")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session || session.type !== "organizer") {
      throw redirect({ to: "/dashboard/login" });
    }
    return { session };
  },
  head: () => ({
    meta: [
      { title: "Advanced Analytics — Agatike Dashboard" },
      { name: "description", content: "Query and visualize your workspace data." },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  return (
    <div className="flex flex-col h-full min-h-screen">
      <AnalyticsDashboard />
    </div>
  );
}
