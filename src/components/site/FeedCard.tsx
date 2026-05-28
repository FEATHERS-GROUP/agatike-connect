import { Send, Bookmark, MoreHorizontal, CalendarDays } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

export function FeedCard({ post }: { post: any }) {
  const [isSaved, setIsSaved] = useState(false);

  // Mock checking if they have an upcoming event
  const hasUpcomingEvent = (post.id || "").length % 2 === 0;

  return (
    <div className="w-full px-4 mb-6">
      <div className="w-full bg-card rounded-3xl overflow-hidden border border-border/40 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-sm z-10 relative">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full overflow-hidden border border-border">
                <img
                  src={post.organizerAvatar || "https://i.pravatar.cc/100"}
                  alt="Organizer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground leading-none">
                  {post.handle || post.organizerHandle || "organizer"}
                </span>
                {hasUpcomingEvent && (
                  <span className="bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" /> New Event
                  </span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1">Kigali, RW</span>
            </div>
          </div>
          <button className="text-foreground p-1 hover:bg-secondary rounded-full transition-colors">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {/* Image */}
        <Link
          to="/community/$postId"
          params={{ postId: post.id || "p-0" }}
          className="block w-full aspect-square bg-secondary relative"
        >
          <img
            src={post.image || post.cover}
            alt="Feed"
            className="h-full w-full object-cover transition-transform active:scale-[0.98]"
          />
        </Link>

        {/* Action Row */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
            {/* Likes and Comments removed as requested */}
            {/* Followed by instead of Liked by */}
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1">
                <img
                  src="https://i.pravatar.cc/100?img=5"
                  className="w-5 h-5 rounded-full border-2 border-card z-20"
                />
                <img
                  src="https://i.pravatar.cc/100?img=6"
                  className="w-5 h-5 rounded-full border-2 border-card z-10"
                />
              </div>
              <p className="text-xs">
                Followed by <span className="font-bold text-foreground">angryswan</span> and{" "}
                <span className="font-bold text-foreground">800 others</span>
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="focus:outline-none transition-transform active:scale-90">
              <Send
                className="h-6 w-6 text-foreground hover:text-foreground/80"
                style={{ transform: "rotate(15deg)" }}
              />
            </button>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="focus:outline-none transition-transform active:scale-90"
            >
              <Bookmark
                className={`h-6 w-6 ${isSaved ? "fill-foreground text-foreground" : "text-foreground hover:text-foreground/80"}`}
              />
            </button>
          </div>
        </div>

        {/* Caption */}
        <div className="px-4 pb-4">
          <p className="text-sm text-foreground">
            <span className="font-bold mr-1">
              {post.handle || post.organizerHandle || "organizer"}
            </span>
            {post.caption ||
              "Join us for the most anticipated event of the year. Tickets are selling out fast! Don't miss this amazing night."}
          </p>
        </div>
      </div>
    </div>
  );
}
