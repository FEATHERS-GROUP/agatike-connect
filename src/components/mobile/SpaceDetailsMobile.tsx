import { Link } from "@tanstack/react-router";
import { ChevronLeft, MapPin, Clock, Star, Heart, Share2, ChevronUp, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Replace date-format tokens in plan names/prices with actual values
function resolvePlanTokens(str: string | undefined | null): string {
  if (!str) return "";
  const now = new Date();
  const monthNames = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];
  const shortMonthNames = ["Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"];
  return str
    .replace(/MMMM/g, monthNames[now.getMonth()])
    .replace(/MMM/g, shortMonthNames[now.getMonth()])
    .replace(/MM/g, String(now.getMonth() + 1).padStart(2, "0"))
    .replace(/YYYY/g, String(now.getFullYear()))
    .replace(/YY/g, String(now.getFullYear()).slice(-2));
}

const SPACE_TYPE_LABELS: Record<string, string> = {
  gym: "Fitness Center",
  office: "Co-working Space",
  coworking: "Co-working Space",
  studio: "Creative Studio",
  event_space: "Event Space",
  meeting_room: "Meeting Room",
};

export function SpaceDetailsMobile({ space, linkedPage }: { space: any, linkedPage: any }) {
  if (!space) return null;

  const [isPlansExpanded, setIsPlansExpanded] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsPlansExpanded(false);
      } else if (window.scrollY < 10) {
        setIsPlansExpanded(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const locations: any[] = Array.isArray(space.locations) ? space.locations : [];
  const plans: any[]     = Array.isArray(space.plans)     ? space.plans     : [];
  const currency: string = space.currency || "RWF";
  const typeLabel        = SPACE_TYPE_LABELS[space.type] ?? space.type ?? "Space";

  const firstLocation = locations.length > 0 ? locations[0] : null;

  const mockReviews = [
    {
      id: "rev1",
      reviewer_name: "Sarah M.",
      rating: 5,
      created_at: "2026-05-12T10:00:00Z",
      body: "Incredible facilities and super clean. Highly recommended for any professional.",
      is_verified: true,
    },
    {
      id: "rev2",
      reviewer_name: "Kevin D.",
      rating: 4,
      created_at: "2026-04-20T14:30:00Z",
      body: "Great atmosphere. Sometimes it gets busy, but the team is very welcoming.",
      is_verified: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground">
      {/* Header Image & Actions */}
      <div className="relative h-72 w-full">
        {space.cover_url ? (
          <img src={space.cover_url} alt={space.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="absolute top-0 left-0 right-0 pt-safe-top p-4 flex items-center justify-between z-10">
          <Link
            to="/venues"
            className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform border border-white/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform border border-white/10">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform border border-white/10">
              <Heart className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
            {typeLabel}
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="px-4 pt-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight leading-tight mb-2">{space.name}</h1>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground font-medium">
            {locations.length > 0 && (
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> 
                {locations.length} {locations.length === 1 ? "Location" : "Locations"}
                {firstLocation && (firstLocation.city || firstLocation.address) ? ` (${firstLocation.city || firstLocation.address})` : ""}
              </span>
            )}
          </div>
        </div>

        {/* About */}
        {space.description && (
          <div className="border-t border-border/40 pt-6">
            <h3 className="font-bold mb-2">About</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{space.description}</p>
          </div>
        )}

        {/* Membership Plans */}
        {plans.length > 0 && (
          <div className="border-t border-border/40 pt-6" id="plans">
            <h3 className="font-bold mb-4">Membership Plans</h3>
            <div className="space-y-4">
              {plans.map((plan: any, i: number) => (
                <div
                  key={i}
                  className="flex flex-col rounded-2xl border border-border/40 bg-secondary/30 p-5 shadow-sm"
                >
                  <h4 className="text-lg font-bold mb-1">{resolvePlanTokens(plan.name)}</h4>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-xl font-bold text-primary">
                      {currency} {(plan.price ?? plan.amount ?? 0).toLocaleString()}
                    </span>
                    {plan.billing_cycle && (
                      <span className="text-xs text-muted-foreground mb-1">/ {plan.billing_cycle}</span>
                    )}
                  </div>

                  {Array.isArray(plan.features) && plan.features.length > 0 && (
                    <ul className="space-y-2 mb-5">
                      {plan.features.map((feature: string, j: number) => (
                        <li key={j} className="flex items-start gap-2 text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="text-xs">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link
                    to="/spaces/checkout/$spaceId"
                    params={{ spaceId: space.id }}
                    search={{ 
                      plan: resolvePlanTokens(plan.name), 
                      price: String(plan.price ?? plan.amount ?? ""), 
                      cycle: plan.billing_cycle 
                    }}
                    className="mt-auto"
                  >
                    <Button
                      className="w-full h-10 rounded-xl font-bold text-sm shadow-[var(--shadow-glow)]"
                      style={i === 1 ? { background: "var(--gradient-primary)" } : {}}
                      variant={i === 1 ? "default" : "outline"}
                    >
                      Select Plan
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Community Reviews */}
        <div className="border-t border-border/40 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">Community reviews</h2>
              <div className="flex items-center gap-1.5 mt-0.5 text-sm font-medium text-muted-foreground">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-foreground">4.5</span>
                <span>({mockReviews.length} reviews)</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full h-8 text-xs">
              Leave a Review
            </Button>
          </div>
          <div className="space-y-3">
            {mockReviews.map((r: any) => (
              <div
                key={r.id}
                className="rounded-3xl border border-border/40 bg-card/60 p-4 backdrop-blur"
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  {r.reviewer_name}
                  {r.is_verified && (
                    <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-semibold tracking-wide uppercase">
                      Verified
                    </span>
                  )}
                  <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-primary text-primary" /> {r.rating.toFixed(1)}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5 mb-2">
                  {new Date(r.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {r.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Location Map */}
        {firstLocation?.lat && firstLocation?.lng && (
          <div className="border-t border-border/40 pt-6">
            <h3 className="font-bold mb-4">Primary Location</h3>
            <div className="aspect-video rounded-2xl overflow-hidden bg-secondary/30 relative border border-border/40 shadow-sm">
              <iframe
                title="Location Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${firstLocation.lat},${firstLocation.lng}&output=embed`}
              ></iframe>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom bg-background/95 backdrop-blur-xl border-t border-border/50 z-30 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
        <div className="max-w-md mx-auto">
          {/* Collapsible Header/Toggle */}
          <div
            className="flex items-center justify-between gap-4 mb-3 cursor-pointer active:opacity-70 transition-opacity"
            onClick={() => setIsPlansExpanded(!isPlansExpanded)}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground font-semibold">
                Membership Plans
              </span>
              <ChevronUp
                className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isPlansExpanded ? "rotate-180" : ""}`}
              />
            </div>
            {!isPlansExpanded && <span className="text-xs text-primary font-bold">View Plans</span>}
          </div>

          {/* Pricing Tiers List (Expanded) */}
          {isPlansExpanded && plans.length > 0 && (
            <div className="mb-4 space-y-2 max-h-48 overflow-y-auto pr-1 border-t border-border/40 pt-3 animate-in slide-in-from-bottom-2 fade-in duration-200">
              {plans.map((plan: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1 text-sm animate-in fade-in duration-150"
                >
                  <span className="text-muted-foreground font-medium truncate max-w-[60%]">
                    {resolvePlanTokens(plan.name)}
                  </span>
                  <span className="font-bold text-foreground shrink-0">
                    {plan.amount > 0 || plan.price > 0 ? formatCurrency(plan.amount ?? plan.price, currency) : "Free"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Plans from
              </span>
              <span className="text-xl font-bold text-foreground">
                {plans[0] && (plans[0].amount > 0 || plans[0].price > 0)
                  ? formatCurrency(plans[0].amount ?? plans[0].price, currency)
                  : "Free"}
              </span>
            </div>
            <Button
              className="flex-1 h-12 rounded-xl text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] active:scale-[0.98] transition-transform"
              style={{ background: "var(--gradient-primary)" }}
              onClick={() => {
                document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' });
                setIsPlansExpanded(false);
              }}
            >
              Select a Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
