import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { DesktopHeader } from "@/components/desktop/dashboard/DesktopHeader";
import { DesktopKPIs } from "@/components/desktop/dashboard/DesktopKPIs";
import { DesktopSalesChart } from "@/components/desktop/dashboard/DesktopSalesChart";
import { DesktopRecentOrders } from "@/components/desktop/dashboard/DesktopRecentOrders";
import { DesktopPricing } from "@/components/desktop/dashboard/DesktopPricing";
import { DesktopWizardPreview } from "@/components/desktop/dashboard/DesktopWizardPreview";

export const Route = createFileRoute("/dashboard/$workspaceSlug/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const { workspaceSlug } = useParams({ from: "/dashboard/$workspaceSlug/" });
  return (
    <>
      <DesktopHeader />
      <DesktopKPIs />
      <DesktopSalesChart />
      <DesktopRecentOrders />
      <DesktopPricing />
      <DesktopWizardPreview />

      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link to={`/dashboard/${workspaceSlug}/scanner`} className="text-primary hover:underline">
            Open the mobile scanner →
          </Link>
        </div>
      </div>
    </>
  );
}
