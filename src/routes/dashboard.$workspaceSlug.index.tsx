import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { DesktopHeader } from "@/components/desktop/dashboard/DesktopHeader";
import { DesktopKPIs } from "@/components/desktop/dashboard/DesktopKPIs";
import { DesktopSalesChart } from "@/components/desktop/dashboard/DesktopSalesChart";
import { DesktopRecentOrders } from "@/components/desktop/dashboard/DesktopRecentOrders";
import { DesktopPricing } from "@/components/desktop/dashboard/DesktopPricing";
import { DesktopWizardPreview } from "@/components/desktop/dashboard/DesktopWizardPreview";
import { getWorkspaceEvents } from "@/api/events";
import { getWorkspaceForms } from "@/api/rsvps";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export const Route = createFileRoute("/dashboard/$workspaceSlug/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const { workspaceSlug } = useParams({ from: "/dashboard/$workspaceSlug/" });
  const { activeWorkspace } = useWorkspace();

  const { data: rawEvents = [] } = useQuery({
    queryKey: ["workspace-events", activeWorkspace?.id],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { data: rawForms = [] } = useQuery({
    queryKey: ["workspace-forms", activeWorkspace?.id],
    queryFn: () => getWorkspaceForms({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalSold = 0;
    const totalDrafted = 0; // Set to 0 for now — no draft status field yet
    const totalEvents = rawEvents.length;

    rawEvents.forEach((e: any) => {
      const tickets = e.event_tickets || [];
      tickets.forEach((t: any) => {
        totalSold += Number(t.sold || 0);
        totalRevenue += Number(t.sold || 0) * Number(t.cost || 0);
      });
    });

    // Count total registered attendees across all RSVP forms
    const totalRegistered = rawForms.reduce((acc: number, form: any) => {
      return acc + (form.rsvps?.length || 0);
    }, 0);

    return { totalRevenue, totalSold, totalDrafted, totalEvents, totalRegistered };
  }, [rawEvents, rawForms]);

  // Use the most recently created event as the "live" event preview
  const liveEvent = rawEvents[0] ?? null;

  return (
    <>
      <DesktopHeader />
      <DesktopKPIs stats={stats} />
      <DesktopSalesChart liveEvent={liveEvent} />
      <DesktopRecentOrders />
      <DesktopPricing />
      <DesktopWizardPreview />

      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link
            to="/dashboard/$workspaceSlug/scanner"
            params={{ workspaceSlug: workspaceSlug || "" }}
            className="text-primary hover:underline"
          >
            Open the mobile scanner →
          </Link>
        </div>
      </div>
    </>
  );
}
