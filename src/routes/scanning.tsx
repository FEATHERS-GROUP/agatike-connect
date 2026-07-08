import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ShieldCheck, ScanFace, SmartphoneNfc } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/scanning")({
  head: () => ({
    meta: [{ title: "Scanning & Access Control — Agatike Connect" }],
  }),
  component: ScanningPage,
});

function ScanningPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-24">
          
          {/* Hero Section */}
          <div className="text-center space-y-6 max-w-3xl mx-auto pt-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
              <ShieldCheck className="h-4 w-4" /> Secure & Fast
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Next-Gen Access Control
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              From office buildings to massive festivals, our scanning tools are designed to keep the line moving securely and flawlessly.
            </p>
          </div>

          {/* Feature 1: Office Entrance */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 space-y-6">
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                <ScanFace className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">Office Entrance Scanner</h2>
              <p className="text-muted-foreground text-lg">
                Upgrade your corporate security with our sleek, integrated turnstile scanners. Support for digital QR codes, NFC passes, and mobile wallet integration ensures your employees and guests experience seamless entry.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Lightning fast QR & NFC scanning
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Real-time attendance tracking
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Sleek design that fits premium lobbies
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2 rounded-3xl overflow-hidden border border-border/50 shadow-[var(--shadow-card)]">
              <img src="/office-scanner.png" alt="Office Entrance Scanner" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
            </div>
          </div>

          {/* Feature 2: NFC Bracelets */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-3xl overflow-hidden border border-border/50 shadow-[var(--shadow-card)]">
              <img src="/nfc-bracelet.png" alt="NFC Bracelet" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="space-y-6">
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                <SmartphoneNfc className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">NFC Smart Bracelets</h2>
              <p className="text-muted-foreground text-lg">
                Give your VIPs and festival attendees a frictionless experience. Our custom-designed NFC bracelets allow for tap-and-go entry, cashless payments, and exclusive zone access without pulling out a phone.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Cashless payments ready
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Durable & waterproof materials
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Brandable with your logo and colors
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3: Event Scanning Machine */}
          <div className="grid md:grid-cols-2 gap-12 items-center pb-12">
            <div className="order-2 md:order-1 space-y-6">
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">Heavy-Duty Event Scanners</h2>
              <p className="text-muted-foreground text-lg">
                Built for the chaos of massive concerts and sporting events. Our rugged handheld scanning terminals process tickets offline and online, preventing fraud and keeping the entry lines moving at maximum speed.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Offline scanning mode
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> High-capacity battery for multi-day events
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Instant sync across all gates
                </li>
              </ul>
              <div className="pt-4">
                <Button className="rounded-full shadow-[var(--shadow-glow)] h-12 px-8" style={{ background: "var(--gradient-primary)" }}>
                  Get a Quote
                </Button>
              </div>
            </div>
            <div className="order-1 md:order-2 rounded-3xl overflow-hidden border border-border/50 shadow-[var(--shadow-card)]">
              <img src="/event-scanner.png" alt="Event Scanning Machine" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
