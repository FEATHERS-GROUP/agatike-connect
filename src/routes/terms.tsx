import { createFileRoute } from "@tanstack/react-router";
import { TermsAndConditions } from "@/components/legal/TermsAndConditions";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [{ title: "Terms and Conditions — Agatike" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-6 sm:px-8">
        <div className="max-w-3xl mx-auto bg-card border border-border/40 p-8 sm:p-12 rounded-3xl shadow-sm">
          <TermsAndConditions />
        </div>
      </main>
      <Footer />
    </div>
  );
}
