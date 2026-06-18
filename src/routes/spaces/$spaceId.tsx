import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { MapPin, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/spaces/$spaceId")({
  component: SpaceDetailsMock,
});

function SpaceDetailsMock() {
  const { spaceId } = Route.useParams();

  // Very simple mock data matching what we put in the venues index loader
  const isGym = spaceId.includes("gym");
  
  const space = isGym ? {
    name: "FitLife Academy (Mock)",
    type: "gym",
    city: "Kigali",
    address: "Remera, KG 11 Ave",
    opening_hours: "05:00",
    closing_hours: "23:00",
    description: "State-of-the-art fitness center with modern equipment, personal trainers, sauna, and daily group classes.",
    cover_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000",
    currency: "RWF",
    memberships: [
      { name: "Day Pass", price: 5000, features: ["Full access", "Classes not included"] },
      { name: "Monthly Standard", price: 35000, features: ["Full access", "2 Group classes", "Locker access"] },
      { name: "Monthly Premium", price: 60000, features: ["Unlimited access", "All classes", "Sauna & Spa", "Personal Trainer (2x/month)"] },
    ]
  } : {
    name: "Agatike Hub (Mock)",
    type: "office",
    city: "Kigali",
    address: "Norrsken House",
    opening_hours: "08:00",
    closing_hours: "20:00",
    description: "A premium co-working space for startups and freelancers with high-speed internet, free coffee, and sound-proof meeting rooms.",
    cover_url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1000",
    currency: "RWF",
    memberships: [
      { name: "Daily Pass", price: 15000, features: ["Hot desk", "Fast WiFi", "Coffee & Tea"] },
      { name: "Monthly Hot Desk", price: 150000, features: ["24/7 Access", "Hot desk", "Mail handling", "2 hours meeting room/month"] },
      { name: "Dedicated Desk", price: 250000, features: ["Fixed desk space", "Locker storage", "10 hours meeting room/month"] },
    ]
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="relative h-[50vh] min-h-[350px] w-full overflow-hidden">
        <img
          src={space.cover_url}
          alt={space.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-10">
          <span className="w-fit rounded-full bg-background/70 px-3 py-1 text-xs backdrop-blur font-bold uppercase tracking-wider">
            {space.type === "gym" ? "Fitness Center" : "Co-working Space"}
          </span>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold md:text-5xl">{space.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {space.city}, {space.address}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" /> {space.opening_hours} - {space.closing_hours}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10">
        <div className="max-w-3xl mb-12">
          <h2 className="text-2xl font-semibold mb-4">About this space</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">{space.description}</p>
        </div>

        <h2 className="text-3xl font-bold mb-8 text-center">Membership Plans</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {space.memberships.map((plan, i) => (
            <div key={i} className="flex flex-col rounded-3xl border border-border/40 bg-card p-8 shadow-[var(--shadow-card)] relative overflow-hidden group hover:border-primary/50 transition-colors">
              {i === 1 && (
                <div className="absolute top-0 inset-x-0 h-1 bg-primary" />
              )}
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-3xl font-bold">{space.currency} {plan.price.toLocaleString()}</span>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full h-12 rounded-xl font-bold shadow-[var(--shadow-glow)]"
                style={i === 1 ? { background: "var(--gradient-primary)" } : {}}
                variant={i === 1 ? "default" : "secondary"}
              >
                Select Plan
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
