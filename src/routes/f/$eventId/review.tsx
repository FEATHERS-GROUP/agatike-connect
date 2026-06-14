import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { submitEventFeedback, checkFeedbackExists } from "@/api/feedback";
import { getEventById } from "@/api/events";
import { getRentableVenueById } from "@/api/rentable_venues";
import { checkUserAttendance } from "@/api/attendees";
import { useQuery } from "@tanstack/react-query";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Star, CheckCircle2, Camera, Tag, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { uploadFileToStorage } from "@/lib/firebase-storage";

export const Route = createFileRoute("/f/$eventId/review")({
  head: () => ({
    meta: [
      { title: "Leave a Review — Agatike" },
      { name: "description", content: "Share your experience about this event." },
    ],
  }),
  component: FeedbackForm,
});

const TAGS = [
  "well_organized",
  "great_speakers",
  "great_venue",
  "good_food",
  "excellent_networking",
  "good_value",
  "loved_the_content",
  "would_attend_again",
  "poor_organization",
  "too_crowded",
  "needs_improvement",
];

const CATEGORIES = [
  { key: "venue", label: "Venue & Location" },
  { key: "organization", label: "Organization" },
  { key: "content", label: "Content & Programme" },
  { key: "catering", label: "Food & Catering" },
  { key: "networking", label: "Networking" },
];

function StarPicker({
  value,
  onChange,
  size = "lg",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: "sm" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <Star
            className={`${size === "lg" ? "w-9 h-9" : "w-5 h-5"} transition-colors ${
              (hovered || value) >= star
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function FeedbackForm() {
  const { eventId } = Route.useParams();
  const search = useSearch({ strict: false }) as any;
  const { user } = useUserAuth();
  
  const attendeeId = search?.attendeeId || "";
  const prefillEmail = search?.email || user?.email || "";
  const prefillName = search?.name || user?.name || "";

  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById({ data: { id: eventId } } as any),
    enabled: !!eventId,
  });

  const { data: venue, isLoading: isLoadingVenue } = useQuery({
    queryKey: ["venue", eventId],
    queryFn: () => getRentableVenueById({ data: { id: eventId } } as any),
    enabled: !!eventId && !event, // only if it's not an event
  });

  const { data: attendanceData, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["attendance", eventId, user?.uid],
    queryFn: () => checkUserAttendance({ data: { event_id: eventId } } as any),
    enabled: !!user && !attendeeId, // only check if logged in and attendeeId wasn't given
  });

  const verifiedAttendeeId = attendeeId || attendanceData?.id || "";

  const [step, setStep] = useState<"form" | "success">("form");
  const [rating, setRating] = useState(0);
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState(prefillName);
  const [email, setEmail] = useState(prefillEmail);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const MAX_REVIEW_MEDIA_SIZE_MB = 5;

  const handleImageUpload = async (file: File) => {
    if (file.size > MAX_REVIEW_MEDIA_SIZE_MB * 1024 * 1024) {
      toast.error(`Image too large`, {
        description: `Max size is ${MAX_REVIEW_MEDIA_SIZE_MB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
      });
      return;
    }
    setIsUploading(true);
    try {
      const url = await uploadFileToStorage(file, `feedback/${eventId}`);
      setMediaUrls((prev) => [...prev, url]);
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!rating) throw new Error("Please select a star rating.");
      if (!name.trim()) throw new Error("Please enter your name.");
      if (!email.trim()) throw new Error("Please enter your email.");

      // Check for duplicate submission
      const alreadySubmitted = await checkFeedbackExists({
        data: { event_id: eventId, reviewer_email: email },
      } as any);
      if (alreadySubmitted) throw new Error("You have already submitted feedback for this event.");

      return submitEventFeedback({
        data: {
          event_id: eventId,
          attendee_id: verifiedAttendeeId || undefined,
          reviewer_name: name,
          reviewer_email: email,
          rating,
          title: title || undefined,
          body: body || undefined,
          category_scores: Object.keys(categoryScores).length > 0 ? categoryScores : undefined,
          tags: selectedTags,
          media_urls: mediaUrls,
          source: verifiedAttendeeId ? "email_link" : "web",
        },
      } as any);
    },
    onSuccess: () => setStep("success"),
    onError: (err: any) => toast.error(err.message || "Failed to submit feedback"),
  });

  const isVerified = !!verifiedAttendeeId;

  if (isLoadingEvent || isLoadingVenue || isLoadingAttendance) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Thank you for your feedback!</h1>
        <p className="text-muted-foreground max-w-xs mb-2">
          Your review helps the organizer improve and helps others know what to expect.
        </p>
        {isVerified && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-semibold mt-2 mb-4">
            <CheckCircle2 className="h-3.5 w-3.5" /> Verified Attendee Review
          </span>
        )}
        <div className="flex gap-1 mt-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`h-6 w-6 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/50 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Feedback</p>
          <h1 className="font-bold text-lg leading-tight line-clamp-1">
            {event?.title || venue?.name || "Event/Venue Review"}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Verified badge */}
        {isVerified && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            <p className="text-sm text-green-700 font-medium">
              Your attendance has been verified — your review will show a Verified Attendee badge.
            </p>
          </div>
        )}

        {/* Overall Rating */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Overall Rating *</Label>
          <div className="flex flex-col items-start gap-2">
            <StarPicker value={rating} onChange={setRating} size="lg" />
            <span className="text-sm text-muted-foreground">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating] ||
                "Tap a star to rate"}
            </span>
          </div>
        </div>

        {/* Category Scores */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Rate by Category{" "}
            <span className="text-muted-foreground font-normal text-sm">(optional)</span>
          </Label>
          <div className="space-y-4 bg-secondary/20 p-4 rounded-xl border border-border/60">
            {CATEGORIES.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground w-40">{label}</span>
                <StarPicker
                  value={categoryScores[key] || 0}
                  onChange={(v) => setCategoryScores((prev) => ({ ...prev, [key]: v }))}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Tag className="h-4 w-4" /> Quick Tags{" "}
            <span className="text-muted-foreground font-normal text-sm">(optional)</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selectedTags.includes(tag)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {tag.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Review Title + Body */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">
            Write a Review{" "}
            <span className="text-muted-foreground font-normal text-sm">(optional)</span>
          </Label>
          <Input
            placeholder='Headline, e.g. "Best event I attended this year!"'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background"
          />
          <textarea
            placeholder="Share more details about your experience — what did you enjoy most? What could be improved?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            className="w-full bg-background border border-border/60 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y"
          />
        </div>

        {/* Media Upload */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Camera className="h-4 w-4" /> Add Photos{" "}
            <span className="text-muted-foreground font-normal text-sm">(optional)</span>
          </Label>
          <div className="flex flex-wrap gap-3">
            {mediaUrls.map((url, i) => (
              <div
                key={i}
                className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setMediaUrls((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
            {mediaUrls.length < 5 && (
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-secondary transition-colors">
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Camera className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground">Add photo</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                  }}
                />
              </label>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Images only · Max {MAX_REVIEW_MEDIA_SIZE_MB}MB · JPG, PNG, WebP, GIF
          </p>
        </div>

        {/* Identity */}
        <div className="space-y-4 bg-secondary/20 p-5 rounded-xl border border-border/60">
          <Label className="text-base font-semibold">Your Details *</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              <Input
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email Address</Label>
              <Input
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            Your email is used only to verify your attendance and prevent duplicate submissions. It
            won't be displayed publicly.
          </p>
        </div>

        {/* Submit */}
        <Button
          onClick={() => submitMutation.mutate()}
          disabled={submitMutation.isPending || !rating}
          className="w-full h-12 text-base gap-2"
          size="lg"
        >
          {submitMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
          {submitMutation.isPending ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </div>
  );
}
