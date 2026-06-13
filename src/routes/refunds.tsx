import { createFileRoute } from "@tanstack/react-router";
import { RefundPolicy } from "@/components/legal/RefundPolicy";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [{ title: "Refund Policy — Agatike" }],
  }),
  component: RefundsPage,
});

function RefundsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-6 sm:px-8">
        <div className="max-w-3xl mx-auto bg-card border border-border/40 p-8 sm:p-12 rounded-3xl shadow-sm">
          <RefundPolicy />
        </div>
      </main>
      <Footer />
    </div>
  );
}
