import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Image as ImageIcon, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { feedPosts, events } from "@/lib/mock-data";

export const Route = createFileRoute("/community/$postId")({
  component: PostCommunityPage,
});

function PostCommunityPage() {
  const { postId } = Route.useParams();
  const router = useRouter();

  // Find the post and its organizer
  const post = feedPosts.find((p) => p.id === postId) || feedPosts[0];
  const organizerEvent = events.find((e) => e.organizerHandle === post.handle) || events[0];

  const [isFollowing, setIsFollowing] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:max-w-xl md:mx-auto shadow-xl relative">
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 pb-3 pt-safe-top fixed top-0 left-0 right-0 mx-auto w-full md:max-w-xl z-40 transition-colors duration-300 min-h-[60px] ${scrolled ? "bg-background/90 backdrop-blur-md border-b border-border/40" : "bg-gradient-to-b from-black/60 to-transparent border-b border-transparent"}`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.history.back()}
            className={`p-2 -ml-2 rounded-full transition-colors ${scrolled ? "text-foreground hover:bg-secondary" : "text-white hover:bg-white/20 backdrop-blur-sm"}`}
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          {scrolled ? (
            <div className="flex items-center gap-2 animate-in fade-in duration-300">
              <img
                src={organizerEvent.cover}
                className="w-8 h-8 rounded-full object-cover border border-border"
              />
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-none">{organizerEvent.organizer}</span>
                <span className="text-[10px] text-muted-foreground">
                  @{organizerEvent.organizerHandle}
                </span>
              </div>
            </div>
          ) : (
            <h1 className="font-bold text-lg tracking-tight text-transparent">Community</h1>
          )}
        </div>
        {scrolled && (
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors animate-in fade-in duration-300 ${
              isFollowing ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>

      {/* Main Post Image Header */}
      <div className="w-full aspect-video md:aspect-[21/9] bg-secondary relative">
        <img src={post.image} alt="Post header" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Organizer Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={organizerEvent.cover}
                alt={organizerEvent.organizer}
                className="w-12 h-12 rounded-full border-2 border-background object-cover"
              />
              <div className="absolute bottom-0 right-0 bg-background rounded-full p-0.5">
                <CheckCircle2 className="h-4 w-4 text-primary fill-primary/20" />
              </div>
            </div>
            <div>
              <h2 className="font-bold text-white text-shadow-sm">{organizerEvent.organizer}</h2>
              <p className="text-xs text-white/80 drop-shadow-sm">
                @{organizerEvent.organizerHandle}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
              isFollowing
                ? "bg-white/20 text-white backdrop-blur-md border border-white/30"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 py-4 border-b border-border/40">
        <p className="text-sm text-foreground">
          <span className="font-bold mr-2">@{post.handle}</span>
          {post.caption}
        </p>
      </div>

      {/* Comments Section */}
      <div className="w-full pt-4">
        <h3 className="px-4 text-sm font-bold text-muted-foreground mb-4 flex items-center gap-2">
          Community Conversations{" "}
          <span className="bg-secondary text-foreground px-2 py-0.5 rounded-full text-[10px]">
            {post.comments}
          </span>
        </h3>

        <div className="px-4 space-y-5">
          {post.commentsList &&
            post.commentsList.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <img
                  src={comment.avatar}
                  alt={comment.handle}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">@{comment.handle}</span>
                    <span className="text-[10px] text-muted-foreground">{comment.time}</span>
                  </div>
                  <p className="text-sm text-foreground/90 mt-0.5">{comment.text}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Comment Input Footer */}
      <div className="fixed bottom-0 left-0 right-0 md:max-w-xl md:mx-auto bg-background/90 backdrop-blur-md border-t border-border/40 p-4 pb-safe-bottom z-40">
        {isFollowing ? (
          <div className="flex gap-3 items-center">
            <img
              src="https://i.pravatar.cc/150?u=me"
              alt="You"
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
            <div className="flex-1 flex items-center bg-secondary/50 border border-border/40 rounded-full px-4 py-1.5 focus-within:ring-1 focus-within:ring-primary transition-shadow">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Join the conversation..."
                className="flex-1 bg-transparent text-sm focus:outline-none py-1"
              />
              <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors ml-1">
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
            {commentText.trim().length > 0 && (
              <button className="text-primary p-2">
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <p className="text-sm text-muted-foreground font-medium mb-2">
              You must follow the organizer to join the conversation
            </p>
            <button
              onClick={() => setIsFollowing(true)}
              className="text-primary font-bold text-sm hover:underline"
            >
              Follow @{post.handle}
            </button>
          </div>
        )}
      </div>

      {/* Padding for fixed footer */}
      <div className="h-24"></div>
    </div>
  );
}
