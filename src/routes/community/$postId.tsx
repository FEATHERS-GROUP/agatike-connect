import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
  Send,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Heart,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostById, getPostComments, addPostComment, likeEventPost } from "@/api/experience";
import { useFollowedOrganizers } from "@/hooks/useFollowedOrganizers";
import { useUserAuth } from "@/contexts/UserAuthContext";

const COUNTRY_FLAGS: Record<string, string> = {
  Rwanda: "🇷🇼",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Canada: "🇨🇦",
  Kenya: "🇰🇪",
  Uganda: "🇺🇬",
  Tanzania: "🇹🇿",
  Nigeria: "🇳🇬",
  "South Africa": "🇿🇦",
};

const getCountryFlag = (countryName?: string | null) => {
  if (!countryName) return "";
  return COUNTRY_FLAGS[countryName] || "🌍";
};

export const Route = createFileRoute("/community/$postId")({
  component: PostCommunityPage,
});

const timeAgo = (dateStr: string) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

function PostCommunityPage() {
  const { postId } = Route.useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isFollowing, toggleFollow } = useFollowedOrganizers();
  const { user } = useUserAuth();

  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById({ data: { postId } }),
  });

  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ["post-comments", postId],
    queryFn: () => getPostComments({ data: { post_id: postId } }),
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => addPostComment({ data: { post_id: postId, content } }),
    onSuccess: () => {
      setCommentText("");
      refetchComments();
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: () => likeEventPost({ data: { post_id: postId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  const [commentText, setCommentText] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoadingPost) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Post not found.
      </div>
    );
  }

  const following = isFollowing(post.organizerId);
  const images =
    post.mediaUrls && post.mediaUrls.length > 0
      ? post.mediaUrls
      : [
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop",
        ];

  const nextImage = () => {
    if (currentImageIndex < images.length - 1) setCurrentImageIndex(currentImageIndex + 1);
  };

  const prevImage = () => {
    if (currentImageIndex > 0) setCurrentImageIndex(currentImageIndex - 1);
  };

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
                src={post.avatar || `https://i.pravatar.cc/150?u=${post.organizerId}`}
                className="w-8 h-8 rounded-full object-cover border border-border"
              />
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-none">{post.user}</span>
                <span className="text-[10px] text-muted-foreground">@{post.handle}</span>
              </div>
            </div>
          ) : (
            <h1 className="font-bold text-lg tracking-tight text-transparent">Community</h1>
          )}
        </div>
        {scrolled && (
          <button
            onClick={() => toggleFollow(post.organizerId)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors animate-in fade-in duration-300 ${
              following ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"
            }`}
          >
            {following ? "Following" : "Follow"}
          </button>
        )}
      </div>

      {/* Main Post Image Header (Carousel) */}
      <div className="w-full aspect-square md:aspect-[4/3] bg-secondary relative overflow-hidden group">
        <div
          className="flex transition-transform duration-300 ease-in-out h-full w-full"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {images.map((img: string, idx: number) => (
            <img
              key={idx}
              src={
                img ||
                "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop"
              }
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
            <div className="absolute top-20 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/40 px-2 py-1 rounded-full backdrop-blur-md">
              {images.map((_: any, idx: number) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Organizer Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={post.avatar || `https://i.pravatar.cc/150?u=${post.organizerId}`}
                alt={post.user}
                className="w-12 h-12 rounded-full border-2 border-background object-cover"
              />
              <div className="absolute bottom-0 right-0 bg-background rounded-full p-0.5">
                <CheckCircle2 className="h-4 w-4 text-primary fill-primary/20" />
              </div>
            </div>
            <div>
              <h2 className="font-bold text-white text-shadow-sm">{post.user}</h2>
              <p className="text-xs text-white/80 drop-shadow-sm">@{post.handle}</p>
            </div>
          </div>
          <button
            onClick={() => toggleFollow(post.organizerId)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
              following
                ? "bg-white/20 text-white backdrop-blur-md border border-white/30"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {following ? "Following" : "Follow"}
          </button>
        </div>
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 flex items-center gap-4 text-sm font-medium text-foreground">
        <button
          onClick={() => likeMutation.mutate()}
          className="flex items-center gap-1.5 focus:outline-none transition-transform active:scale-90 hover:text-foreground/80"
        >
          <Heart className="h-6 w-6" />
          <span>{post.likes}</span>
        </button>
        <div className="flex items-center gap-1.5">
          <MessageCircle className="h-6 w-6" style={{ transform: "scaleX(-1)" }} />
          <span>{post.comments}</span>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-4 border-b border-border/40">
        <p className="text-sm text-foreground">
          <span className="font-bold mr-2">@{post.handle}</span>
          {post.caption}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1.5 uppercase font-medium tracking-wider">
          {timeAgo(post.createdAt)}
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

        <div className="px-4 space-y-5 pb-8">
          {comments.map((comment: any) => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.user?.profile || `https://i.pravatar.cc/150?u=${comment.user_id}`}
                alt={comment.user?.handle || "User"}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">
                    @{comment.user?.handle || "user"} {getCountryFlag(comment.user?.country)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {timeAgo(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 mt-0.5">{comment.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              Be the first to comment on this post.
            </div>
          )}
        </div>
      </div>

      {/* Comment Input Footer */}
      <div className="fixed bottom-0 left-0 right-0 md:max-w-xl md:mx-auto bg-background/90 backdrop-blur-md border-t border-border/40 p-4 pb-safe-bottom z-40">
        {following ? (
          <form
            className="flex gap-3 items-center"
            onSubmit={(e) => {
              e.preventDefault();
              if (commentText.trim()) addCommentMutation.mutate(commentText);
            }}
          >
            <img
              src={user?.profile || `https://i.pravatar.cc/150?u=${user?.id || "default"}`}
              alt={user?.username || "You"}
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
            <div className="flex-1 flex items-center bg-secondary/50 border border-border/40 rounded-full px-4 py-1.5 focus-within:ring-1 focus-within:ring-primary transition-shadow">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Join the conversation..."
                className="flex-1 bg-transparent text-sm focus:outline-none py-1"
                disabled={addCommentMutation.isPending}
              />
            </div>
            {commentText.trim().length > 0 && (
              <button
                type="submit"
                className="text-primary p-2 active:scale-95 transition-transform"
                disabled={addCommentMutation.isPending}
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <p className="text-sm text-muted-foreground font-medium mb-2">
              You must follow the organizer to join the conversation
            </p>
            <button
              onClick={() => toggleFollow(post.organizerId)}
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
