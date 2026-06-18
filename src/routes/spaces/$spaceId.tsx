import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { MapPin, Clock, CheckCircle2, Instagram, Facebook, Twitter, Globe, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import VenueMap from "@/components/site/VenueMap";
import { useState } from "react";

export const Route = createFileRoute("/spaces/$spaceId")({
  component: SpaceDetailsMock,
});

function SpaceDetailsMock() {
  const { spaceId } = Route.useParams();
  const [selectedLocationIdx, setSelectedLocationIdx] = useState(0);

  const isGym = spaceId.includes("gym");
  
  const space = isGym ? {
    name: "FitLife Academy (Mock)",
    type: "gym",
    city: "Kigali",
    address: "Multiple Locations",
    opening_hours: "05:00",
    closing_hours: "23:00",
    description: "State-of-the-art fitness center with modern equipment, personal trainers, sauna, and daily group classes.",
    cover_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000",
    currency: "RWF",
    socials: {
      instagram: "#",
      facebook: "#",
      twitter: "#",
      website: "#",
      phone: "+250 788 000 000"
    },
    locations: [
      {
        id: "loc-1",
        name: "FitLife Remera",
        city: "Kigali",
        address: "Remera, KG 11 Ave",
        lat: -1.9566,
        lng: 30.1065,
        gallery: [
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600"
        ]
      },
      {
        id: "loc-2",
        name: "FitLife Nyarutarama",
        city: "Kigali",
        address: "Nyarutarama, KG 9 Ave",
        lat: -1.9366,
        lng: 30.0895,
        gallery: [
          "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=600"
        ]
      }
    ],
    memberships: [
      { name: "Day Pass", price: 5000, features: ["Full access", "Classes not included"] },
      { name: "Monthly Standard", price: 35000, features: ["Full access", "2 Group classes", "Locker access"] },
      { name: "Monthly Premium", price: 60000, features: ["Unlimited access", "All classes", "Sauna & Spa", "Personal Trainer (2x/month)"] },
    ]
  } : {
    name: "Agatike Hub (Mock)",
    type: "office",
    city: "Kigali",
    address: "Multiple Locations",
    opening_hours: "08:00",
    closing_hours: "20:00",
    description: "A premium co-working space for startups and freelancers with high-speed internet, free coffee, and sound-proof meeting rooms.",
    cover_url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1000",
    currency: "RWF",
    socials: {
      instagram: "#",
      website: "#",
      phone: "+250 788 111 111"
    },
    locations: [
      {
        id: "loc-1",
        name: "Agatike Hub - City Center",
        city: "Kigali",
        address: "KN 4 Ave, Kigali Heights",
        lat: -1.9536,
        lng: 30.0915,
        gallery: [
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600"
        ]
      },
      {
        id: "loc-2",
        name: "Agatike Hub - Kiyovu",
        city: "Kigali",
        address: "KN 3 Ave, Kiyovu",
        lat: -1.9616,
        lng: 30.0655,
        gallery: [
          "https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=600"
        ]
      }
    ],
    memberships: [
      { name: "Daily Pass", price: 15000, features: ["Hot desk", "Fast WiFi", "Coffee & Tea"] },
      { name: "Monthly Hot Desk", price: 150000, features: ["24/7 Access", "Hot desk", "Mail handling", "2 hours meeting room/month"] },
      { name: "Dedicated Desk", price: 250000, features: ["Fixed desk space", "Locker storage", "10 hours meeting room/month"] },
    ]
  };

  const mapStops = space.locations.map(loc => ({
    id: loc.id,
    lat: loc.lat,
    lng: loc.lng,
    venue: loc.name,
    city: loc.city,
    address: loc.address
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="relative h-[45vh] min-h-[350px] w-full overflow-hidden">
        <img
          src={space.cover_url}
          alt={space.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-10">
          <span className="w-fit rounded-full bg-primary/20 text-primary px-3 py-1 text-xs backdrop-blur font-bold uppercase tracking-wider mb-3">
            {space.type === "gym" ? "Fitness Center" : "Co-working Space"}
          </span>
          <h1 className="max-w-3xl text-4xl font-bold md:text-5xl">{space.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
            <span className="inline-flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg backdrop-blur-md">
              <MapPin className="h-4 w-4" /> {space.locations.length} Locations
            </span>
            <span className="inline-flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg backdrop-blur-md">
              <Clock className="h-4 w-4" /> {space.opening_hours} - {space.closing_hours}
            </span>
          </div>
          
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {space.socials.instagram && (
              <a href={space.socials.instagram} className="w-10 h-10 rounded-full bg-card/40 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {space.socials.twitter && (
              <a href={space.socials.twitter} className="w-10 h-10 rounded-full bg-card/40 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {space.socials.facebook && (
              <a href={space.socials.facebook} className="w-10 h-10 rounded-full bg-card/40 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {space.socials.website && (
              <a href={space.socials.website} className="w-10 h-10 rounded-full bg-card/40 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                <Globe className="w-4 h-4" />
              </a>
            )}
            {space.socials.phone && (
              <a href={`tel:${space.socials.phone}`} className="h-10 px-4 rounded-full bg-card/40 backdrop-blur border border-white/10 flex items-center gap-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-sm font-medium">
                <Phone className="w-4 h-4" /> {space.socials.phone}
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pb-20 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
          
          {/* Left Column */}
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-semibold mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">{space.description}</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-6">Locations</h2>
              
              {/* Badges for selection */}
              <div className="flex flex-wrap gap-2 mb-6">
                {space.locations.map((loc, idx) => (
                  <button 
                    key={loc.id} 
                    onClick={() => setSelectedLocationIdx(idx)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedLocationIdx === idx 
                      ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" 
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary border border-border/40 hover:border-border"
                    }`}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>

              {/* Selected Location Details */}
              {(() => {
                const loc = space.locations[selectedLocationIdx];
                return (
                  <div className="p-5 rounded-2xl border border-border/40 bg-card shadow-sm animate-in fade-in duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{loc.name}</h3>
                        <p className="text-muted-foreground flex items-center gap-1 mt-1 text-sm">
                          <MapPin className="w-3.5 h-3.5" /> {loc.address}, {loc.city}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => {
                         window.open(`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`, '_blank');
                      }}>
                        Navigate
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {loc.gallery.map((img, i) => (
                        <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-secondary">
                          <img src={img} alt={`${loc.name} - image ${i+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                      ))}
                    </div>

                    {/* Mobile Inline Map */}
                    <div className="mt-6 lg:hidden h-[250px] w-full rounded-xl overflow-hidden border border-border/40 shadow-inner relative bg-secondary/20">
                      <VenueMap 
                        tourStops={mapStops} 
                        selectedStopIdx={selectedLocationIdx}
                        onMarkerClick={setSelectedLocationIdx}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-6">Membership Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {space.memberships.map((plan, i) => (
                  <div key={i} className="flex flex-col rounded-3xl border border-border/40 bg-card p-6 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-end gap-1 mb-6">
                      <span className="text-2xl font-bold">{space.currency} {plan.price.toLocaleString()}</span>
                    </div>
                    
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-2 text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full h-11 rounded-xl font-bold shadow-[var(--shadow-glow)]"
                      style={i === 1 ? { background: "var(--gradient-primary)" } : {}}
                      variant={i === 1 ? "default" : "secondary"}
                    >
                      Select Plan
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Sticky Map) */}
          <div className="hidden lg:block relative">
            <div className="sticky top-24 h-[600px] w-full rounded-3xl overflow-hidden border border-border/40 shadow-lg bg-secondary/20">
              <VenueMap 
                tourStops={mapStops} 
                selectedStopIdx={selectedLocationIdx}
                onMarkerClick={setSelectedLocationIdx}
              />
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
