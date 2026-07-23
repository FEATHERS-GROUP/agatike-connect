import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEventFeedback, updateFeedback } from "@/api/feedback";
import {
  getEventStories,
  createEventStory,
  deleteEventStory,
  getEventHighlights,
  upsertEventHighlight,
  deleteEventHighlight,
} from "@/api/experience";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  CheckCircle2,
  Eye,
  EyeOff,
  Pin,
  Trash2,
  Image as ImageIcon,
  PlusCircle,
  MessageSquare,
  Heart,
  Share2,
  Copy,
  Video,
  Quote,
  BarChart3,
  Loader2,
  Clock,
  Camera,
  Sparkles,
  Send,
  X,
} from "lucide-react";
import { uploadFileToStorage } from "@/lib/firebase-storage";
import { formatDistanceToNow, format } from "date-fns";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Cell,
  Tooltip,
} from "recharts";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/experience")({
  component: ExperienceDashboard,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30 fill-transparent"}`}
        />
      ))}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function ExperienceDashboard() {
  const { eventId, workspaceSlug } = useParams({ strict: false });
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const { canCreateEventStory } = useSubscriptionLimits(
    activeWorkspace?.orgnizer_id,
    activeWorkspace?.id,
  );

  // Mark experience as read
  useEffect(() => {
    if (eventId) {
      localStorage.setItem(`experience_read_${eventId}`, Date.now().toString());
      localStorage.setItem("experience_read_all", Date.now().toString());
      window.dispatchEvent(new Event("experience_read_updated"));
    }
  }, [eventId]);

  // ── Feedback ──────────────────────────────────────────────────────────────
  const { data: feedbackData, isLoading: isLoadingFeedback } = useQuery({
    queryKey: ["event-feedback", eventId],
    queryFn: () => getEventFeedback({ data: { event_id: eventId } } as any),
    enabled: !!eventId,
  });

  const reviews = feedbackData?.reviews || [];
  const aggregate = feedbackData?.aggregate || { count: 0, avg: { rating: 0 } };
  const avgRating = aggregate.avg?.rating ? parseFloat(aggregate.avg.rating).toFixed(1) : "—";

  // Rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
  }));

  // Category averages
  const categoryKeys = ["venue", "organization", "content", "catering", "networking"];
  const categoryLabels: Record<string, string> = {
    venue: "Venue",
    organization: "Organization",
    content: "Content",
    catering: "Catering",
    networking: "Networking",
  };
  const categoryAvgs = categoryKeys.map((key) => {
    const scores = reviews
      .filter((r: any) => r.category_scores?.[key])
      .map((r: any) => r.category_scores[key]);
    const avg =
      scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
    return { subject: categoryLabels[key], A: parseFloat(avg.toFixed(1)), fullMark: 5 };
  });

  const feedbackMutation = useMutation({
    mutationFn: (vars: any) => updateFeedback({ data: vars } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-feedback", eventId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const copyFeedbackLink = () => {
    const url = `${window.location.origin}/f/${eventId}/review`;
    navigator.clipboard.writeText(url);
    toast.success("Feedback link copied!", { description: url });
  };

  // ── Stories ───────────────────────────────────────────────────────────────
  const { data: stories = [], isLoading: isLoadingStories } = useQuery({
    queryKey: ["event-stories", eventId],
    queryFn: () => getEventStories({ data: { event_id: eventId } } as any),
    enabled: !!eventId,
  });

  const [isUploadingStory, setIsUploadingStory] = useState(false);
  const [storyCaption, setStoryCaption] = useState("");

  const deleteStoryMutation = useMutation({
    mutationFn: (id: string) => deleteEventStory({ data: { id } } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-stories", eventId] });
      toast.success("Story deleted.");
    },
  });

  const MAX_STORY_SIZE_MB = 6;

  const handleStoryUpload = async (file: File) => {
    if (!canCreateEventStory(stories.length)) {
      toast.error("Story Limit Reached", {
        description: "You have reached the maximum number of stories allowed by your plan.",
      });
      return;
    }

    if (file.size > MAX_STORY_SIZE_MB * 1024 * 1024) {
      toast.error(`Image too large`, {
        description: `Max size is ${MAX_STORY_SIZE_MB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
      });
      return;
    }
    setIsUploadingStory(true);
    try {
      const url = await uploadFileToStorage(file, `stories/${eventId}`);
      await createEventStory({
        data: {
          event_id: eventId,
          workspace_id: activeWorkspace?.id,
          media_url: url,
          media_type: "photo",
          caption: storyCaption || undefined,
        },
      } as any);
      queryClient.invalidateQueries({ queryKey: ["event-stories", eventId] });
      setStoryCaption("");
      toast.success("Story posted!");
    } catch (err: any) {
      toast.error("Failed to post story.", { description: err?.message });
    } finally {
      setIsUploadingStory(false);
    }
  };

  // ── Highlights ────────────────────────────────────────────────────────────
  const { data: highlights = [] } = useQuery({
    queryKey: ["event-highlights", eventId],
    queryFn: () => getEventHighlights({ data: { event_id: eventId } } as any),
    enabled: !!eventId,
  });

  const deleteHighlightMutation = useMutation({
    mutationFn: (id: string) => deleteEventHighlight({ data: { id } } as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["event-highlights", eventId] }),
  });

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Experience</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Feedback, stories and posts from your event.
          </p>
        </div>
        <Button variant="outline" className="gap-2 rounded-full" onClick={copyFeedbackLink}>
          <Copy className="h-4 w-4" /> Share Feedback Link
        </Button>
      </header>

      <Tabs defaultValue="feedback" className="w-full">
        <TabsList className="mb-6 bg-secondary/50 p-1 rounded-xl w-full sm:w-auto">
          <TabsTrigger value="feedback" className="rounded-lg gap-2">
            <Star className="h-4 w-4" /> Reviews
          </TabsTrigger>
          <TabsTrigger value="stories" className="rounded-lg gap-2">
            <Sparkles className="h-4 w-4" /> Stories
          </TabsTrigger>
        </TabsList>

        {/* ══════════════ FEEDBACK TAB ══════════════ */}
        <TabsContent value="feedback" className="space-y-6">
          {isLoadingFeedback ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* KPI Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Avg Rating",
                    value: avgRating,
                    suffix: "/ 5",
                    icon: Star,
                    color: "text-amber-500",
                  },
                  {
                    label: "Total Reviews",
                    value: aggregate.count,
                    suffix: "",
                    icon: MessageSquare,
                    color: "text-primary",
                  },
                  {
                    label: "Verified",
                    value: reviews.filter((r: any) => r.is_verified).length,
                    suffix: `/ ${aggregate.count}`,
                    icon: CheckCircle2,
                    color: "text-green-500",
                  },
                  {
                    label: "Featured",
                    value: reviews.filter((r: any) => r.is_featured).length,
                    suffix: "pinned",
                    icon: Star,
                    color: "text-purple-500",
                  },
                ].map(({ label, value, suffix, icon: Icon, color }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1 text-muted-foreground">
                      <span className="text-sm font-medium">{label}</span>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <p className="text-2xl font-bold">
                      {value}{" "}
                      <span className="text-sm font-normal text-muted-foreground">{suffix}</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              {reviews.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Rating distribution */}
                  <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" /> Rating Distribution
                    </h3>
                    <div className="space-y-2">
                      {ratingDist.map(({ star, count }) => (
                        <div key={star} className="flex items-center gap-3 text-sm">
                          <span className="w-4 text-muted-foreground">{star}</span>
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                          <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all"
                              style={{
                                width: `${aggregate.count > 0 ? (count / aggregate.count) * 100 : 0}%`,
                              }}
                            />
                          </div>
                          <span className="w-6 text-right text-muted-foreground">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category Radar */}
                  <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                    <h3 className="font-semibold mb-4">Category Scores</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={categoryAvgs}>
                          <PolarGrid stroke="var(--color-border)" />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                          />
                          <Radar
                            name="Score"
                            dataKey="A"
                            stroke="var(--color-primary)"
                            fill="var(--color-primary)"
                            fillOpacity={0.2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  All Reviews ({reviews.length})
                </h3>
                {reviews.length === 0 ? (
                  <div className="rounded-2xl border border-border/60 bg-card p-12 text-center text-muted-foreground">
                    <Star className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No reviews yet.</p>
                    <p className="text-sm mt-1">
                      Share the feedback link with your attendees to collect their reviews.
                    </p>
                    <Button variant="outline" className="mt-4 gap-2" onClick={copyFeedbackLink}>
                      <Copy className="h-4 w-4" /> Copy Feedback Link
                    </Button>
                  </div>
                ) : (
                  reviews.map((review: any) => (
                    <div
                      key={review.id}
                      className={`rounded-2xl border bg-card p-5 shadow-sm space-y-3 transition-colors ${
                        review.is_featured
                          ? "border-amber-400/40 bg-amber-50/5"
                          : "border-border/60"
                      } ${!review.is_public ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-semibold text-primary text-sm">
                            {review.reviewer_name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm">{review.reviewer_name}</p>
                              {review.is_verified && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-semibold">
                                  <CheckCircle2 className="h-3 w-3" /> Verified
                                </span>
                              )}
                              {review.is_featured && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 text-[10px] font-semibold">
                                  <Star className="h-3 w-3" /> Featured
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <StarRow rating={review.rating} />
                              <span className="text-[11px] text-muted-foreground">
                                {formatDistanceToNow(new Date(review.created_at), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* Organizer Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title={review.is_featured ? "Unfeature" : "Feature this review"}
                            onClick={() =>
                              feedbackMutation.mutate({
                                id: review.id,
                                is_featured: !review.is_featured,
                              })
                            }
                          >
                            <Star
                              className={`h-4 w-4 ${review.is_featured ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title={review.is_public ? "Hide from public" : "Show publicly"}
                            onClick={() =>
                              feedbackMutation.mutate({
                                id: review.id,
                                is_public: !review.is_public,
                              })
                            }
                          >
                            {review.is_public ? (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {review.title && <p className="font-semibold text-sm">{review.title}</p>}
                      {review.body && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {review.body}
                        </p>
                      )}

                      {review.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {review.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-secondary text-[11px] text-muted-foreground"
                            >
                              {tag.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      )}

                      {review.media_urls?.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {review.media_urls.map((url: string, i: number) => (
                            <img
                              key={i}
                              src={url}
                              alt=""
                              className="h-20 w-20 rounded-lg object-cover border border-border"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* ══════════════ STORIES TAB ══════════════ */}
        <TabsContent value="stories" className="space-y-6">
          {/* Upload Story */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Post a Story
            </h3>
            <p className="text-sm text-muted-foreground">
              Stories are visible for 48 hours and appear in your event's experience feed.
            </p>
            <Input
              placeholder="Add a caption (optional)..."
              value={storyCaption}
              onChange={(e) => setStoryCaption(e.target.value)}
              className="bg-background"
            />
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isUploadingStory}
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleStoryUpload(e.target.files[0]);
                  }}
                />
                <Button
                  variant="outline"
                  className="w-full gap-2 pointer-events-none"
                  disabled={isUploadingStory}
                >
                  {isUploadingStory ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  Upload Photo
                </Button>
              </div>
              <Button
                variant="outline"
                className="flex-1 gap-2 opacity-40 cursor-not-allowed"
                disabled
                title="Video upload coming soon"
              >
                <Video className="h-4 w-4" /> Video (coming soon)
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Images only · Max {MAX_STORY_SIZE_MB}MB · JPG, PNG, WebP, GIF
            </p>
          </div>

          {/* Stories Grid */}
          {isLoadingStories ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : stories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center text-muted-foreground">
              <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No active stories.</p>
              <p className="text-sm mt-1">
                Post a photo or video to share event moments with your followers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {stories.map((story: any) => {
                const expiresAt = new Date(story.expires_at);
                const hoursLeft = Math.max(
                  0,
                  Math.round((expiresAt.getTime() - Date.now()) / 3600000),
                );
                return (
                  <div
                    key={story.id}
                    className="relative group rounded-2xl overflow-hidden border border-border/60 aspect-[9/16] bg-secondary"
                  >
                    {story.media_type === "video" ? (
                      <video src={story.media_url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={story.media_url} alt="" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
                    {story.caption && (
                      <p className="absolute bottom-8 left-2 right-2 text-white text-xs font-medium line-clamp-2">
                        {story.caption}
                      </p>
                    )}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white/80 text-[10px]">
                      <Clock className="h-3 w-3" /> {hoursLeft}h left
                    </div>
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-white/80 text-[10px] bg-black/30 px-2 py-0.5 rounded-full">
                      <Eye className="h-3 w-3" /> {story.views_count}
                    </div>
                    <button
                      onClick={() => deleteStoryMutation.mutate(story.id)}
                      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/80 hover:bg-red-700 text-white p-1.5 rounded-full"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
