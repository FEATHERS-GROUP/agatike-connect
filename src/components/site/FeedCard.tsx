import { Send, Bookmark, MoreHorizontal, CalendarDays, ChevronLeft, ChevronRight, MessageCircle, Heart } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { likeEventPost } from "@/api/experience";

export function FeedCard({ post }: { post: any }) {
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);

  const images = post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls : [post.image || post.cover];

  const handleLike = async () => {
    if (isLiked) return;
    setIsLiked(true);
    setLikesCount(likesCount + 1);
    try {
      await likeEventPost({ data: { post_id: post.id } });
    } catch (e) {
      setIsLiked(false);
      setLikesCount(likesCount - 1);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentImageIndex < images.length - 1) setCurrentImageIndex(currentImageIndex + 1);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentImageIndex > 0) setCurrentImageIndex(currentImageIndex - 1);
  };

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

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
                  src={post.avatar || "https://i.pravatar.cc/100"}
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

        {/* Image Carousel */}
        <Link
          to="/community/$postId"
          params={{ postId: post.id || "p-0" }}
          className="block w-full aspect-square bg-secondary relative group overflow-hidden"
        >
          <div 
            className="flex transition-transform duration-300 ease-in-out h-full w-full"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {images.map((img: string, idx: number) => (
              <img
                key={idx}
                src={img}
                alt={`Feed image ${idx + 1}`}
                className="h-full w-full object-cover shrink-0"
              />
            ))}
          </div>

          {images.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 backdrop-blur-sm transition-colors z-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {currentImageIndex < images.length - 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 backdrop-blur-sm transition-colors z-10"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_: any, idx: number) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}
        </Link>

        {/* Action Row */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4 text-sm font-medium text-foreground">
            <button onClick={handleLike} className="flex items-center gap-1.5 focus:outline-none transition-transform active:scale-90 hover:text-foreground/80">
              <Heart className={`h-6 w-6 ${isLiked ? "fill-primary text-primary" : ""}`} />
              <span>{likesCount}</span>
            </button>
            <Link to="/community/$postId" params={{ postId: post.id }} className="flex items-center gap-1.5 focus:outline-none transition-transform active:scale-90 hover:text-foreground/80">
              <MessageCircle className="h-6 w-6" style={{ transform: "scaleX(-1)" }} />
              <span>{post.comments || 0}</span>
            </Link>
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
          {post.createdAt && (
            <p className="text-[10px] text-muted-foreground mt-1.5 uppercase font-medium tracking-wider">
              {timeAgo(post.createdAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
