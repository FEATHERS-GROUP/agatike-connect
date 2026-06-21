import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export function EventReviews({
  eventId,
  feedbackData,
  avgRating,
  reviews,
  attendeeRecord,
}: {
  eventId: string;
  feedbackData: any;
  avgRating: string | number;
  reviews: any[];
  attendeeRecord?: any;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Community reviews</h2>
          {feedbackData?.aggregate?.count > 0 && (
            <div className="flex items-center gap-1.5 mt-0.5 text-sm font-medium text-muted-foreground">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-foreground">{avgRating}</span>
              <span>({feedbackData?.aggregate?.count} reviews)</span>
            </div>
          )}
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link
            to="/f/$eventId/review"
            params={{ eventId }}
            search={
              attendeeRecord
                ? {
                    attendeeId: attendeeRecord.id,
                    name: attendeeRecord.names,
                    email: attendeeRecord.email,
                  }
                : undefined
            }
          >
            Leave a Review
          </Link>
        </Button>
      </div>
      <div className="space-y-3">
        {reviews.length > 0 ? (
          reviews.map((r: any) => (
            <div key={r.id} className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                {r.reviewer_name}
                {r.is_verified && (
                  <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-semibold tracking-wide uppercase">
                    Verified
                  </span>
                )}
                {r.is_featured && (
                  <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-semibold tracking-wide uppercase">
                    Featured
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
              {r.title && <p className="mt-2 text-sm font-semibold">{r.title}</p>}
              {r.body && (
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{r.body}</p>
              )}
              {r.tags && r.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {r.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground font-medium capitalize"
                    >
                      {tag.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card p-6 text-center text-muted-foreground">
            <p className="text-sm">No reviews yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
