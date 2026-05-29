import { createFileRoute, Link } from "@tanstack/react-router";
import { DesktopHeader } from "@/components/desktop/dashboard/DesktopHeader";
import { DesktopKPIs } from "@/components/desktop/dashboard/DesktopKPIs";
import { DesktopSalesChart } from "@/components/desktop/dashboard/DesktopSalesChart";
import { DesktopRecentOrders } from "@/components/desktop/dashboard/DesktopRecentOrders";
import { DesktopPricing } from "@/components/desktop/dashboard/DesktopPricing";
import { DesktopWizardPreview } from "@/components/desktop/dashboard/DesktopWizardPreview";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  return (
    <>
      <DesktopHeader />
      <DesktopKPIs />
      <DesktopSalesChart />
      <DesktopRecentOrders />
      <DesktopPricing />
      <DesktopWizardPreview />

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Need to scan?{" "}
        <Link to="/scanner" className="text-primary hover:underline">
          Open the mobile scanner →
        </Link>
      </p>
    </>
  );
}
