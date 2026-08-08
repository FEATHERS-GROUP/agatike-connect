import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [{ title: "Privacy Policy — Agatike" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 py-14 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <PrivacyPolicy />
        </div>
      </main>
      <Footer />
    </div>
  );
}
