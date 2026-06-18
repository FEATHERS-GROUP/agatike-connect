import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import {
  MapPin,
  Clock,
  CheckCircle2,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  Phone,
  Star,
  ChevronLeft,
  Building2,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "@/api/spaces";
import { getPublicWorkspacePageById } from "@/api/workspace-pages";
const VenueMap = lazy(() => import("@/components/site/VenueMap"));

const DAY_KEYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as const;
const DAY_LABELS: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed",
  thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun",
};

function formatHourEntry(h: any) {
  if (!h || h.closed) return "Closed";
  if (h.is24Hours) return "24 Hours";
  return `${h.open} – ${h.close}`;
}

/** Collapse consecutive days with the same schedule into a range e.g. "Mon–Fri: 08:00–18:00" */
function summarizeHours(opening_hours: Record<string, any>): string[] {
  if (!opening_hours) return [];
  const lines: string[] = [];
  let i = 0;
  while (i < DAY_KEYS.length) {
    const key = DAY_KEYS[i];
    const h = opening_hours[key];
    const label = formatHourEntry(h);
    let j = i + 1;
    while (j < DAY_KEYS.length && formatHourEntry(opening_hours[DAY_KEYS[j]]) === label) j++;
    const dayRange = j - i > 1
      ? `${DAY_LABELS[DAY_KEYS[i]]}–${DAY_LABELS[DAY_KEYS[j - 1]]}`
      : DAY_LABELS[DAY_KEYS[i]];
    lines.push(`${dayRange}: ${label}`);
    i = j;
  }
  return lines;
}

/** Get today's hours string from an opening_hours object */
function todayHours(opening_hours: Record<string, any>): string | null {
  if (!opening_hours) return null;
  const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  const todayKey = days[new Date().getDay()];
  const h = opening_hours[todayKey];
  if (!h) return null;
  return formatHourEntry(h);
}

export const Route = createFileRoute("/spaces/$spaceId")({
  component: SpaceDetails,
});

const SPACE_TYPE_LABELS: Record<string, string> = {
  gym: "Fitness Center",
  office: "Co-working Space",
  coworking: "Co-working Space",
  studio: "Creative Studio",
  event_space: "Event Space",
  meeting_room: "Meeting Room",
};

function SpaceDetails() {
  const { spaceId } = Route.useParams();
  const navigate = useNavigate();
  const [selectedLocationIdx, setSelectedLocationIdx] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [showHours, setShowHours] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: space, isLoading, isError } = useQuery({
    queryKey: ["space", spaceId],
    queryFn: () => getSpaceById({ data: { id: spaceId } }),
    enabled: !!spaceId,
  });

  const { data: linkedPage } = useQuery({
    queryKey: ["linked-page", space?.page_id],
    queryFn: () => getPublicWorkspacePageById({ data: { id: space!.page_id } } as any),
    enabled: !!space?.page_id,
  });

  // ── Loading skeleton ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar hideOnMobile />
        <div className="h-[45vh] min-h-[350px] w-full bg-secondary/40 animate-pulse" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-8">
          <div className="h-8 w-1/3 bg-secondary/60 rounded-xl animate-pulse" />
          <div className="h-4 w-full bg-secondary/40 rounded-xl animate-pulse" />
          <div className="h-4 w-3/4 bg-secondary/40 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-secondary/40 rounded-3xl animate-pulse" />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────
  if (isError || !space) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar hideOnMobile />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <Building2 className="w-16 h-16 text-muted-foreground/40" />
          <h2 className="text-2xl font-bold">Space not found</h2>
          <p className="text-muted-foreground">This space may have been removed or is not publicly available.</p>
          <Button onClick={() => navigate({ to: "/venues" })} className="rounded-full mt-2">
            Browse all spaces
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Normalise data from DB ────────────────────────────────────
  const locations: any[] = Array.isArray(space.locations) ? space.locations : [];
  const plans: any[]     = Array.isArray(space.plans)     ? space.plans     : [];
  const socials: any     = space.socials || {};
  const currency: string = space.currency || "RWF";
  const typeLabel        = SPACE_TYPE_LABELS[space.type] ?? space.type ?? "Space";

  const mapStops = locations
    .filter((loc: any) => loc.lat && loc.lng)
    .map((loc: any) => ({
      id: loc.id,
      lat: loc.lat,
      lng: loc.lng,
      venue: loc.name,
      city: loc.city,
      address: loc.address,
    }));

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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar hideOnMobile />

      {/* Mobile Back Button */}
      <div className="md:hidden absolute top-4 left-4 z-50 pt-safe-top">
        <button
          onClick={() => navigate({ to: "/venues" })}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white shadow-sm hover:bg-black/60 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>

      {/* Hero */}
      <section className="relative h-[45vh] min-h-[350px] w-full overflow-hidden">
        {space.cover_url ? (
          <img
            src={space.cover_url}
            alt={space.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 sm:px-6 pb-10">
          <span className="w-fit rounded-full bg-primary/20 text-primary px-3 py-1 text-xs backdrop-blur font-bold uppercase tracking-wider mb-3">
            {typeLabel}
          </span>
          <h1 className="max-w-3xl text-4xl font-bold md:text-5xl">{space.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
            {locations.length > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg backdrop-blur-md">
                <MapPin className="h-4 w-4" /> {locations.length} {locations.length === 1 ? "Location" : "Locations"}
              </span>
            )}
            {/* Smart working hours pill — derived from location data */}
            {locations.length > 0 && locations[0]?.opening_hours && (() => {
              const firstLocHours = locations[0].opening_hours;
              const todayStr = todayHours(firstLocHours);
              const summary = summarizeHours(firstLocHours);
              // Check if all locations share identical hours
              const allSame = locations.every((l: any) =>
                JSON.stringify(l.opening_hours) === JSON.stringify(firstLocHours)
              );
              return (
                <div className="relative">
                  <button
                    onClick={() => setShowHours(h => !h)}
                    className="inline-flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg backdrop-blur-md hover:bg-secondary/80 transition-colors"
                  >
                    <Clock className="h-4 w-4" />
                    <span>Today: {todayStr ?? "See schedule"}</span>
                    {!allSame && <span className="text-[10px] ml-1 text-primary font-bold">Varies</span>}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showHours ? "rotate-180" : ""}`} />
                  </button>
                  {showHours && (
                    <div className="absolute top-full mt-2 left-0 z-50 min-w-[260px] bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl p-4 shadow-xl">
                      {allSame ? (
                        <>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">All Locations</p>
                          <div className="space-y-1.5">
                            {summary.map((line, i) => (
                              <p key={i} className="text-sm text-foreground">{line}</p>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4">
                          {locations.map((loc: any, idx: number) => (
                            <div key={idx}>
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{loc.name || `Location ${idx + 1}`}</p>
                              <div className="space-y-1">
                                {summarizeHours(loc.opening_hours).map((line, i) => (
                                  <p key={i} className="text-sm text-foreground">{line}</p>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Social links + RSVP buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {socials.instagram && (
              <a href={socials.instagram} target="_blank" rel="noreferrer"
                className="w-10 h-10 rounded-full bg-card/40 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {socials.twitter && (
              <a href={socials.twitter} target="_blank" rel="noreferrer"
                className="w-10 h-10 rounded-full bg-card/40 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {socials.facebook && (
              <a href={socials.facebook} target="_blank" rel="noreferrer"
                className="w-10 h-10 rounded-full bg-card/40 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {socials.website && (
              <a href={socials.website} target="_blank" rel="noreferrer"
                className="w-10 h-10 rounded-full bg-card/40 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                <Globe className="w-4 h-4" />
              </a>
            )}
            {socials.phone && (
              <a href={`tel:${socials.phone}`}
                className="h-10 px-4 rounded-full bg-card/40 backdrop-blur border border-white/10 flex items-center gap-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-sm font-medium">
                <Phone className="w-4 h-4" /> {socials.phone}
              </a>
            )}
            {/* Multiple RSVP form buttons */}
            {space.connected_forms && space.connected_forms.length > 0
              ? space.connected_forms.map((cForm: any) =>
                  cForm.showButton !== false && cForm.formId && cForm.formId !== "none" ? (
                    <Button
                      key={cForm.id}
                      variant="default"
                      className="h-10 px-6 rounded-full font-bold shadow-[var(--shadow-glow)]"
                      onClick={() => window.open(`/f/${cForm.formId}`, "_blank")}
                    >
                      {cForm.buttonText || "Fill out our form"}
                    </Button>
                  ) : null
                )
              : space.rsvp_form_id && space.show_rsvp_form_button !== false
              ? (
                <Button
                  variant="default"
                  className="h-10 px-6 rounded-full font-bold shadow-[var(--shadow-glow)]"
                  onClick={() => window.open(`/f/${space.rsvp_form_id}`, "_blank")}
                >
                  {space.rsvp_form_button_text || "Fill out our form"}
                </Button>
              )
              : null}
            {linkedPage && (
              <Button
                variant="outline"
                className="h-10 px-6 rounded-full font-bold bg-background/50 backdrop-blur"
                onClick={() => window.open(`/p/${linkedPage.slug}`, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit our page
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-20 pt-12">
        <div className="space-y-16">

          {/* About */}
          {space.description && (
            <div className="max-w-3xl">
              <h2 className="text-2xl font-semibold mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">{space.description}</p>
            </div>
          )}

          {/* Membership Plans */}
          {plans.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Membership Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan: any, i: number) => (
                  <div
                    key={i}
                    className="flex flex-col rounded-3xl border border-border/40 bg-card p-6 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors"
                  >
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-end gap-1 mb-6">
                      <span className="text-2xl font-bold">
                        {currency} {(plan.price ?? plan.amount ?? 0).toLocaleString()}
                      </span>
                      {plan.billing_cycle && (
                        <span className="text-sm text-muted-foreground mb-1">/ {plan.billing_cycle}</span>
                      )}
                    </div>

                    {Array.isArray(plan.features) && plan.features.length > 0 && (
                      <ul className="space-y-3 mb-8 flex-1">
                        {plan.features.map((feature: string, j: number) => (
                          <li key={j} className="flex items-start gap-2 text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <Button
                      className="w-full h-11 rounded-xl font-bold shadow-[var(--shadow-glow)] mt-auto"
                      style={i === 1 ? { background: "var(--gradient-primary)" } : {}}
                      variant={i === 1 ? "default" : "secondary"}
                    >
                      Select Plan
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locations & Map */}
          {locations.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Locations</h2>

              <div className={`grid gap-8 lg:gap-12 items-start ${mapStops.length > 0 ? "grid-cols-1 lg:grid-cols-[1fr_400px]" : "grid-cols-1"}`}>
                <div>
                  {/* Location tabs */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {locations.map((loc: any, idx: number) => (
                      <button
                        key={loc.id || idx}
                        onClick={() => setSelectedLocationIdx(idx)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedLocationIdx === idx
                            ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary border border-border/40 hover:border-border"
                        }`}
                      >
                        {loc.name || `Location ${idx + 1}`}
                      </button>
                    ))}
                  </div>

                  {/* Selected location details */}
                  {(() => {
                    const loc = locations[selectedLocationIdx];
                    if (!loc) return null;
                    return (
                      <div className="p-5 rounded-2xl border border-border/40 bg-card shadow-sm animate-in fade-in duration-300">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold">{loc.name || "Location"}</h3>
                            {(loc.address || loc.city) && (
                              <p className="text-muted-foreground flex items-center gap-1 mt-1 text-sm">
                                <MapPin className="w-3.5 h-3.5" />
                                {[loc.address, loc.city].filter(Boolean).join(", ")}
                              </p>
                            )}
                          </div>
                          {loc.lat && loc.lng && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`, "_blank")}
                            >
                              Navigate
                            </Button>
                          )}
                        </div>

                        {/* Gallery — only shown if images exist */}
                        {Array.isArray(loc.gallery) && loc.gallery.length > 0 && (
                          <div className="grid grid-cols-2 gap-3 mt-4">
                            {loc.gallery.map((img: string, i: number) => (
                              <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-secondary">
                                <img
                                  src={img}
                                  alt={`${loc.name} - ${i + 1}`}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Per-day working hours schedule */}
                        {loc.opening_hours && (
                          <div className="mt-5 border-t border-border/40 pt-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" /> Working Hours
                            </p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                              {DAY_KEYS.map((day) => {
                                const h = loc.opening_hours[day];
                                const isToday = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][new Date().getDay()] === day;
                                return (
                                  <div key={day} className={`flex items-center justify-between text-sm py-0.5 ${isToday ? "font-semibold text-primary" : "text-foreground"}`}>
                                    <span className="capitalize">{DAY_LABELS[day]}</span>
                                    <span className={h?.closed ? "text-muted-foreground" : ""}>{formatHourEntry(h)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Mobile inline map */}
                        {mapStops.length > 0 && (
                          <div className="mt-6 lg:hidden h-[250px] w-full rounded-xl overflow-hidden border border-border/40 shadow-inner relative bg-secondary/20">
                            {isClient && (
                              <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">Loading map...</div>}>
                                <VenueMap
                                  tourStops={mapStops}
                                  selectedStopIdx={selectedLocationIdx}
                                  onMarkerClick={setSelectedLocationIdx}
                                />
                              </Suspense>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Desktop map */}
                {mapStops.length > 0 && (
                  <div className="hidden lg:block relative h-full">
                    <div className="sticky top-24 h-[400px] w-full rounded-3xl overflow-hidden border border-border/40 shadow-lg bg-secondary/20">
                      {isClient && (
                        <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">Loading map...</div>}>
                          <VenueMap
                            tourStops={mapStops}
                            selectedStopIdx={selectedLocationIdx}
                            onMarkerClick={setSelectedLocationIdx}
                          />
                        </Suspense>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Community Reviews */}
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Community reviews</h2>
                <div className="flex items-center gap-1.5 mt-1 text-sm font-medium text-muted-foreground">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="text-foreground">4.5</span>
                  <span>(24 reviews)</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-full">
                Leave a Review
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockReviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-border/60 bg-card p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary text-sm font-bold uppercase">
                      {r.reviewer_name.substring(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{r.reviewer_name}</span>
                        {r.is_verified && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-semibold tracking-wide uppercase">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-primary text-primary" : "text-muted"}`} />
                        ))}
                        <span className="ml-2 text-[10px] text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{r.body}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
