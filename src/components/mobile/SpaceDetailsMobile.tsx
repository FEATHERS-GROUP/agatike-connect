import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  MapPin,
  Clock,
  Star,
  Heart,
  Share2,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  Phone,
  ExternalLink,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getSpaceFeedback, submitSpaceFeedback } from "@/api/feedback";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SPACE_TYPE_LABELS: Record<string, string> = {
  gym: "Fitness Center",
  office: "Co-working Space",
  coworking: "Co-working Space",
  studio: "Creative Studio",
  event_space: "Event Space",
  meeting_room: "Meeting Room",
};

const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
const DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
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
    const dayRange =
      j - i > 1
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
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const todayKey = days[new Date().getDay()];
  const h = opening_hours[todayKey];
  if (!h) return null;
  return formatHourEntry(h);
}

export function SpaceDetailsMobile({ space, linkedPage }: { space: any; linkedPage: any }) {
  if (!space) return null;

  const [isPlansExpanded, setIsPlansExpanded] = useState(false);
  const [showHours, setShowHours] = useState(false);
  const [expandedPlanIdx, setExpandedPlanIdx] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsPlansExpanded(false);
        setShowHours(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const locations: any[] = Array.isArray(space.locations) ? space.locations : [];
  const plans: any[] = Array.isArray(space.plans) ? space.plans : [];
  const socials: any = space.socials || {};
  const currency: string = space.currency || "RWF";
  const typeLabel = SPACE_TYPE_LABELS[space.type] ?? space.type ?? "Space";

  const firstLocation = locations.length > 0 ? locations[0] : null;

  const { user } = useUserAuth();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");

  useEffect(() => {
    if (user) {
      setReviewName(user.username || "");
      setReviewEmail(user.email || "");
    }
  }, [user]);

  const { data: feedbackData, refetch: refetchFeedback } = useQuery({
    queryKey: ["space-feedback", space?.id],
    queryFn: () => getSpaceFeedback({ data: { space_id: space?.id } }),
    enabled: !!space?.id,
  });

  const reviews = feedbackData?.reviews || [];
  const aggregate = feedbackData?.aggregate || { count: 0, avg: { rating: 0 } };
  const avgRating = aggregate.avg?.rating ? Number(aggregate.avg.rating).toFixed(1) : "0.0";

  const submitFeedbackMutation = useMutation({
    mutationFn: (values: { reviewer_name: string; reviewer_email: string; rating: number; body: string }) =>
      submitSpaceFeedback({ data: { space_id: space.id, ...values } }),
    onSuccess: () => {
      toast.success("Review submitted! Thank you.");
      refetchFeedback();
      setIsReviewModalOpen(false);
      setReviewBody("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit review");
    },
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewEmail || !reviewBody) {
      toast.error("Please fill in all fields");
      return;
    }
    submitFeedbackMutation.mutate({
      reviewer_name: reviewName,
      reviewer_email: reviewEmail,
      rating: reviewRating,
      body: reviewBody,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-[280px]">
      {/* Backdrop for Expanded Plans */}
      {isPlansExpanded && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 animate-in fade-in duration-300"
          onClick={() => setIsPlansExpanded(false)}
        />
      )}

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
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform border border-white/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform border border-white/10">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform border border-white/10">
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
          <h1 className="text-3xl font-bold tracking-tight leading-tight mb-4">{space.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground font-medium relative">
            {locations.length > 0 && (
              <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg backdrop-blur-md text-foreground">
                <MapPin className="h-4 w-4 text-primary" /> {locations.length}{" "}
                {locations.length === 1 ? "Location" : "Locations"}
              </span>
            )}

            {/* Smart working hours pill */}
            {locations.length > 0 &&
              locations[0]?.opening_hours &&
              (() => {
                const firstLocHours = locations[0].opening_hours;
                const todayStr = todayHours(firstLocHours);
                const summary = summarizeHours(firstLocHours);
                const allSame = locations.every(
                  (l: any) => JSON.stringify(l.opening_hours) === JSON.stringify(firstLocHours),
                );
                return (
                  <>
                    <button
                      onClick={() => setShowHours((h) => !h)}
                      className="inline-flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg backdrop-blur-md hover:bg-secondary/80 transition-colors text-foreground"
                    >
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Today: {todayStr ?? "See schedule"}</span>
                      {!allSame && (
                        <span className="text-[10px] ml-1 text-primary font-bold">Varies</span>
                      )}
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${showHours ? "rotate-180" : ""}`}
                      />
                    </button>
                    {showHours && (
                      <div className="absolute top-full mt-2 left-0 right-0 z-20 bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl p-4 shadow-xl">
                        {allSame ? (
                          <>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                              All Locations
                            </p>
                            <div className="space-y-1.5">
                              {summary.map((line, i) => (
                                <p key={i} className="text-sm text-foreground">
                                  {line}
                                </p>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="space-y-4">
                            {locations.map((loc: any, idx: number) => (
                              <div key={idx}>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                  {loc.name || `Location ${idx + 1}`}
                                </p>
                                <div className="space-y-1">
                                  {summarizeHours(loc.opening_hours).map((line, i) => (
                                    <p key={i} className="text-sm text-foreground">
                                      {line}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
          </div>
        </div>

        {/* Social links + RSVP buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {socials.instagram && (
            <a
              href={socials.instagram}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-secondary/50 backdrop-blur border border-border/40 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
            >
              <Instagram className="w-4 h-4" />
            </a>
          )}
          {socials.twitter && (
            <a
              href={socials.twitter}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-secondary/50 backdrop-blur border border-border/40 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
            >
              <Twitter className="w-4 h-4" />
            </a>
          )}
          {socials.facebook && (
            <a
              href={socials.facebook}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-secondary/50 backdrop-blur border border-border/40 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
            >
              <Facebook className="w-4 h-4" />
            </a>
          )}
          {socials.website && (
            <a
              href={socials.website}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-secondary/50 backdrop-blur border border-border/40 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
          {socials.phone && (
            <a
              href={`tel:${socials.phone}`}
              className="h-10 px-4 rounded-full bg-secondary/50 backdrop-blur border border-border/40 flex items-center gap-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-sm font-medium"
            >
              <Phone className="w-4 h-4" /> <span className="sr-only">Call</span>
            </a>
          )}

          {/* Form Buttons */}
          {space.connected_forms && space.connected_forms.length > 0 ? (
            space.connected_forms.map((cForm: any) =>
              cForm.showButton !== false && cForm.formId && cForm.formId !== "none" ? (
                <Button
                  key={cForm.id}
                  variant="default"
                  className="h-10 px-5 rounded-full font-bold shadow-[var(--shadow-glow)] text-xs"
                  onClick={() => window.open(`/f/${cForm.formId}`, "_blank")}
                >
                  {cForm.buttonText || "Fill out our form"}
                </Button>
              ) : null,
            )
          ) : space.rsvp_form_id && space.show_rsvp_form_button !== false ? (
            <Button
              variant="default"
              className="h-10 px-5 rounded-full font-bold shadow-[var(--shadow-glow)] text-xs"
              onClick={() => window.open(`/f/${space.rsvp_form_id}`, "_blank")}
            >
              {space.rsvp_form_button_text || "Fill out our form"}
            </Button>
          ) : null}

          {/* Linked Page */}
          {linkedPage && (
            <Button
              variant="outline"
              className="h-10 px-5 rounded-full font-bold bg-background/50 backdrop-blur text-xs"
              onClick={() => window.open(`/p/${linkedPage.slug}`, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit our page
            </Button>
          )}
        </div>

        {/* About */}
        {space.description && (
          <div className="border-t border-border/40 pt-6">
            <h3 className="font-bold mb-2">About</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{space.description}</p>
          </div>
        )}

        {/* Community Reviews */}
        <div className="border-t border-border/40 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">Community reviews</h2>
              <div className="flex items-center gap-1.5 mt-0.5 text-sm font-medium text-muted-foreground">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-foreground">{avgRating}</span>
                <span>({aggregate.count} reviews)</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-8 text-xs"
              onClick={() => setIsReviewModalOpen(true)}
            >
              Leave a Review
            </Button>
          </div>
          <div className="space-y-3">
            {reviews.length > 0 ? (
              reviews.map((r: any) => (
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
                    {new Date(r.created_at).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {r.body}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-border/40 border-dashed bg-card/40 p-6 text-center text-muted-foreground text-sm">
                No reviews yet. Be the first to leave one!
              </div>
            )}
          </div>
        </div>

        {/* Location Map */}
        {firstLocation?.lat && firstLocation?.lng && (
          <div className="border-t border-border/40 pt-6">
            <h3 className="font-bold mb-4">{firstLocation.name || "Primary Location"}</h3>
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
            {(firstLocation.city || firstLocation.address) && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {[firstLocation.address, firstLocation.city].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom bg-background/95 backdrop-blur-xl border-t border-border/50 z-40 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] transition-transform duration-300">
        <div className="max-w-md mx-auto">
          {/* Collapsible Header/Toggle */}
          <div
            className="flex items-center justify-between gap-4 mb-3 cursor-pointer active:opacity-70 transition-opacity"
            onClick={() => setIsPlansExpanded(!isPlansExpanded)}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground font-semibold">Membership Plans</span>
              <ChevronUp
                className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isPlansExpanded ? "rotate-180" : ""}`}
              />
            </div>
            {!isPlansExpanded && plans.length > 1 && (
              <span className="text-xs text-primary font-bold">
                Show {plans.length - 1} more options
              </span>
            )}
          </div>

          {/* Pricing Tiers List (Expanded) */}
          {isPlansExpanded && plans.length > 0 && (
            <div className="mb-4 max-h-[50vh] overflow-y-auto space-y-2.5 pr-1 border-t border-border/40 pt-3 scrollbar-hide animate-in slide-in-from-bottom-2 fade-in duration-200">
              {plans.map((plan: any, idx: number) => (
                <div
                  key={idx}
                  className="w-full rounded-2xl border border-border/40 bg-card/50 p-3.5 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-sm">{plan.name}</p>
                    <p className="font-bold text-base text-primary">
                      {plan.amount > 0 || plan.price > 0
                        ? formatCurrency(plan.amount ?? plan.price, currency)
                        : "Free"}
                      {plan.billing_cycle && (
                        <span className="text-[10px] text-muted-foreground ml-1">
                          / {plan.billing_cycle}
                        </span>
                      )}
                    </p>
                  </div>

                  {Array.isArray(plan.features) && plan.features.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {plan.features
                        .slice(0, expandedPlanIdx === idx ? undefined : 2)
                        .map((feature: string, j: number) => (
                          <p
                            key={j}
                            className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-snug"
                          >
                            <CheckCircle2 className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </p>
                        ))}
                      {plan.features.length > 2 && (
                        <button
                          className="text-[11px] font-bold text-primary mt-1"
                          onClick={() => setExpandedPlanIdx(expandedPlanIdx === idx ? null : idx)}
                        >
                          {expandedPlanIdx === idx
                            ? "Show less"
                            : `View ${plan.features.length - 2} more features`}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center mt-3 pt-3 border-t border-border/40">
                    <Link
                      to="/spaces/checkout/$spaceId"
                      params={{ spaceId: space.id }}
                      search={{
                        plan: plan.name,
                        price: String(plan.price ?? plan.amount ?? ""),
                        cycle: plan.billing_cycle,
                      }}
                      className="w-full"
                    >
                      <Button
                        className="w-full h-9 rounded-lg text-xs font-bold shadow-[var(--shadow-glow)]"
                        style={idx === 1 ? { background: "var(--gradient-primary)" } : {}}
                        variant={idx === 1 ? "default" : "secondary"}
                      >
                        Select Plan
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pricing Tiers List (Collapsed - shows just 1) */}
          {!isPlansExpanded && plans.length > 0 && (
            <div className="mb-4 border-t border-border/40 pt-3 animate-in slide-in-from-bottom-2 fade-in duration-200">
              {plans.slice(0, 1).map((plan: any, idx: number) => (
                <div
                  key={idx}
                  className="w-full rounded-2xl border border-border/40 bg-card/50 p-3.5 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-sm">{plan.name}</p>
                    <p className="font-bold text-base text-primary">
                      {plan.amount > 0 || plan.price > 0
                        ? formatCurrency(plan.amount ?? plan.price, currency)
                        : "Free"}
                      {plan.billing_cycle && (
                        <span className="text-[10px] text-muted-foreground ml-1">
                          / {plan.billing_cycle}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center mt-3 pt-3 border-t border-border/40">
                    <Link
                      to="/spaces/checkout/$spaceId"
                      params={{ spaceId: space.id }}
                      search={{
                        plan: plan.name,
                        price: String(plan.price ?? plan.amount ?? ""),
                        cycle: plan.billing_cycle,
                      }}
                      className="w-full"
                    >
                      <Button
                        className="w-full h-9 rounded-lg text-xs font-bold shadow-[var(--shadow-glow)]"
                        variant="secondary"
                      >
                        Select Plan
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog for Review */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-md mx-auto rounded-3xl p-6 border border-white/10 dark:border-white/5 bg-background/95 backdrop-blur-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Leave a Review</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Share your experience at {space.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReviewSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="review-name" className="text-sm font-semibold">Your Name</Label>
              <Input
                id="review-name"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                placeholder="e.g. John Doe"
                className="mt-1 rounded-xl h-10"
                required
              />
            </div>
            <div>
              <Label htmlFor="review-email" className="text-sm font-semibold">Your Email</Label>
              <Input
                id="review-email"
                type="email"
                value={reviewEmail}
                onChange={(e) => setReviewEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                className="mt-1 rounded-xl h-10"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-semibold block mb-2">Rating</Label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewRating(i + 1)}
                    className="p-1 transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        i < reviewRating ? "fill-primary text-primary" : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="review-body" className="text-sm font-semibold">Review Message</Label>
              <textarea
                id="review-body"
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
                placeholder="What did you think of the space?"
                className="w-full h-24 mt-1 rounded-xl p-3 border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReviewModalOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitFeedbackMutation.isPending}
                className="rounded-xl shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
              >
                {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
