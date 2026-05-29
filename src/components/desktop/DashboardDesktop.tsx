import { Link } from "@tanstack/react-router";
import { DesktopSidebar } from "./dashboard/DesktopSidebar";
import { DesktopHeader } from "./dashboard/DesktopHeader";
import { DesktopKPIs } from "./dashboard/DesktopKPIs";
import { DesktopSalesChart } from "./dashboard/DesktopSalesChart";
import { DesktopRecentOrders } from "./dashboard/DesktopRecentOrders";
import { DesktopPricing } from "./dashboard/DesktopPricing";
import { DesktopWizardPreview } from "./dashboard/DesktopWizardPreview";

export function DashboardDesktop() {
  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="flex">
        {/* Sidebar */}
        <DesktopSidebar />

        <main className="flex-1 p-6 lg:p-10">
          <DesktopHeader />

          {/* KPIs */}
          <DesktopKPIs />

          {/* Chart + live */}
          <DesktopSalesChart />

          {/* Recent orders */}
          <DesktopRecentOrders />

          {/* Pricing */}
          <DesktopPricing />

          {/* Wizard preview */}
          <DesktopWizardPreview />

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Need to scan?{" "}
            <Link to="/scanner" className="text-primary hover:underline">
              Open the mobile scanner →
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}
