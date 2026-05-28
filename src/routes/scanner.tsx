import { createFileRoute } from "@tanstack/react-router";
import { ScannerMobile } from "@/components/mobile/ScannerMobile";
import { ScannerDesktop } from "@/components/desktop/ScannerDesktop";

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: "Scanner — Agatike" },
      { name: "description", content: "Mobile scanner for event entrances. Fast, reliable, offline-ready." },
    ],
  }),
  component: ScannerRoute,
});

function ScannerRoute() {
  return (
    <>
      <div className="md:hidden">
        <ScannerMobile />
      </div>
      <div className="hidden md:block">
        <ScannerDesktop />
      </div>
    </>
  );
}