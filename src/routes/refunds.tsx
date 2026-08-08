import { createFileRoute } from "@tanstack/react-router";
import { RefundPolicy } from "@/components/legal/RefundPolicy";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [{ title: "Refund Policy Agatike" }],
  }),
  component: RefundsPage,
});

function RefundsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto p-6 sm:p-12">
          <RefundPolicy />
        </div>
      </main>
      <Footer />
    </div>
  );
}
