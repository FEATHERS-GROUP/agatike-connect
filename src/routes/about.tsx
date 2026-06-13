import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import {
  ArrowRight,
  Ticket,
  Users,
  ScanLine,
  LayoutTemplate,
  Wallet,
  BarChart3,
  Presentation,
  Compass,
  Bus,
  Building2,
  Briefcase,
  Nfc,
  BadgeCheck,
  ShieldCheck,
  IdCard,
  ClipboardList,
  PenTool,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [{ title: "About Agatike Connect" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-6 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
          <div className="relative max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Compass className="h-4 w-4" /> Discover the moments that matter
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Welcome to{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                Agatike Connect
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The premium social event platform. We empower organizers and communities to discover
              music, nightlife, sports, festivals, and experiences worldwide while providing the
              ultimate suite of event management tools.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-20 bg-muted/30 border-y border-border/40">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything you need to run your event</h2>
              <p className="text-muted-foreground">
                Built from the ground up for modern organizers and seamless attendee experiences.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<LayoutTemplate />}
                title="No-Code Page Builder"
                desc="Design beautiful, branded event landing pages effortlessly with our visual block editor."
              />
              <FeatureCard
                icon={<Ticket />}
                title="Ticket Designer"
                desc="Visual ticket designer that renders into beautiful Apple Wallet-style digital passes."
              />
              <FeatureCard
                icon={<IdCard />}
                title="Badge Designer"
                desc="Visually customize digital and physical IDs for your staff and attendees."
              />
              <FeatureCard
                icon={<ClipboardList />}
                title="Custom Forms"
                desc="Generate dynamic forms to collect RSVP data, questionnaires, and onboarding details."
              />
              <FeatureCard
                icon={<ScanLine />}
                title="Secure Scanning"
                desc="Dynamic QR credentials with a secure 60-second auto-expiration verification link to prevent fraud."
              />
              <FeatureCard
                icon={<Wallet />}
                title="Vouchers & Punch Cards"
                desc="Create sponsored digital vouchers, loyalty cards, and physical merchandise."
              />
              <FeatureCard
                icon={<Presentation />}
                title="Agatike Books"
                desc="A custom Notion-like database builder for event operations, tracking expenses, staff, and sponsors."
              />
              <FeatureCard
                icon={<Users />}
                title="Attendee CRM & Staffing"
                desc="Manage your event staff, vendors, and attendees with rich-text email capabilities."
              />
              <FeatureCard
                icon={<BarChart3 />}
                title="Real-time Financials"
                desc="Track real-time ticket sales, vendor payouts, and wallet withdrawals with integrated local currencies."
              />
              <FeatureCard
                icon={<Bus />}
                title="Bus Ticketing Management"
                desc="Manage and sell bus tickets directly alongside your event ecosystem."
              />
              <FeatureCard
                icon={<Building2 />}
                title="Venue Rentals Management"
                desc="Streamline booking and renting out your physical event spaces and venues."
              />
              <FeatureCard
                icon={<Briefcase />}
                title="Office Management"
                desc="Manage access, operations, and facilities for coworking spaces and dedicated offices."
              />
              <FeatureCard
                icon={<Nfc />}
                title="NFC Bracelets & Chips"
                desc="We provide and sell custom NFC bracelets and chips for seamless access to events and venues."
              />
              <FeatureCard
                icon={<BadgeCheck />}
                title="Memberships Management"
                desc="Handle recurring memberships, access tiers, and loyalty programs for your community."
              />
              <FeatureCard
                icon={<PenTool />}
                title="Venue Design Tools"
                desc="Custom venue mapping and floor plan design tools to visually plan out your event layout."
              />
              <FeatureCard
                icon={<ShieldCheck />}
                title="Security Management"
                desc="Robust security and access control management tailored to the specific needs of any venue or event."
              />
            </div>
          </div>
        </section>

        {/* Plasera Section */}
        <section className="px-6 py-24">
          <div className="max-w-3xl mx-auto text-center space-y-8 p-12 bg-card rounded-3xl border border-border/40 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <h2 className="text-2xl font-bold">Powered by Plasera</h2>
            <p className="text-muted-foreground text-lg">
              Agatike Connect is a flagship project proudly built and maintained by{" "}
              <strong>Plasera</strong>.
            </p>
            <p className="text-muted-foreground">
              Plasera is a forward-thinking tech company dedicated to delivering solutions for
              humans. We build software that matters, connecting technology with everyday human
              experiences.
            </p>
            <div className="pt-4">
              <a
                href="https://plas-era.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium hover:opacity-90 transition-opacity shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
              >
                Visit Plasera <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border/60 hover:border-primary/40 transition-colors group">
      <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
