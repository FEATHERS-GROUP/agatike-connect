import { Link, useNavigate } from "@tanstack/react-router";
import { feedPosts, events, movies, stories } from "@/lib/mock-data";
import { FeedCard } from "@/components/site/FeedCard";
import { Stories } from "@/components/site/Stories";
import { Camera, Activity, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useQuery } from "@tanstack/react-query";
import { getOrganizers } from "@/api/organizers";
import { useFollowedOrganizers } from "@/hooks/useFollowedOrganizers";

export function HomeMobile() {
  const { user, isLoading, isLoggedIn } = useUserAuth();
  const navigate = useNavigate();
  const { toggleFollow, isFollowing } = useFollowedOrganizers();
  const items = feedPosts;

  const { data: dbOrganizers = [], isLoading: organizersLoading } = useQuery({
    queryKey: ["organizers"],
    queryFn: () => getOrganizers(),
  });

  // Show loading spinner while checking session
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background text-foreground pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-background z-30 border-b border-border/40 pt-safe-top">
        <button className="text-foreground">
          <Camera className="h-6 w-6" />
        </button>
        <img src="/icon.svg" alt="Agatike" className="h-8 w-auto object-contain" />
        <button className="text-foreground">
          <Activity className="h-6 w-6" />
        </button>
      </div>

      {/* Welcome Banner */}
      {user && (
        <div className="px-4 pt-4 pb-2">
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{user.username}</span> 👋
          </p>
        </div>
      )}

      {/* Top Stories Row */}
      <div className="px-4 py-3 border-b border-border/40">
        <Stories items={stories} />
      </div>

      {/* Popular Organizers */}
      <div className="pt-5 pb-3 border-b border-border/40">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Popular Organizers</h2>
          <Link to="/organizers" className="text-sm font-bold text-primary">
            See all
          </Link>
        </div>
        <div className="flex gap-4 px-4 overflow-x-auto hide-scrollbar pb-2">
          {organizersLoading ? (
            <div className="flex items-center justify-center w-full py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : dbOrganizers.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full py-6 gap-2 text-muted-foreground">
              <Users className="h-8 w-8" />
              <p className="text-sm">No organizers found</p>
            </div>
          ) : (
            dbOrganizers.map((org: any) => {
              const following = isFollowing(org.id);
              return (
                <Link
                  key={org.id}
                  to="/organizers"
                  className="w-36 shrink-0 rounded-2xl p-4 bg-card border border-border/40 shadow-sm flex flex-col items-center text-center transition-transform active:scale-95 block"
                >
                  <img
                    src={org.image || org.avatar || "/icon.svg"}
                    alt={org.name}
                    className="w-16 h-16 rounded-full object-cover mb-3"
                  />
                  <p className="font-semibold text-sm leading-tight line-clamp-1">{org.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">@{org.handle}</p>
                  <Button
                    size="sm"
                    variant={following ? "outline" : "default"}
                    className={`mt-3 w-full rounded-full h-7 text-[10px] font-bold uppercase tracking-wider ${following ? "" : "shadow-[var(--shadow-glow)]"}`}
                    style={following ? undefined : { background: "var(--gradient-primary)" }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFollow(org.id);
                    }}
                  >
                    {following ? "Following" : "Follow"}
                  </Button>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Upcoming Events Horizontal Scroll */}
      <div className="pt-5 pb-3">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Upcoming Events</h2>
          <Link to="/events" className="text-sm font-bold text-primary">
            See all
          </Link>
        </div>
        <div className="flex gap-4 px-4 overflow-x-auto hide-scrollbar pb-2">
          {events.map((event) => (
            <Link
              key={event.id}
              to="/events/$eventId"
              params={{ eventId: event.id }}
              className="w-60 shrink-0 rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm block transition-transform active:scale-95"
            >
              <div className="aspect-[4/3] relative">
                <img src={event.cover} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm">
                  {event.currency || "$"}
                  {event.price}
                </div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm leading-tight line-clamp-2">{event.title}</p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="truncate">{event.date}</span>
                  <span>•</span>
                  <span className="truncate">{event.city}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>


      {/* Movies Horizontal Scroll */}
      <div className="pt-2 pb-3">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Now Showing</h2>
          <Link to="/movies" className="text-sm font-bold text-primary">
            See all
          </Link>
        </div>
        <div className="flex gap-4 px-4 overflow-x-auto hide-scrollbar pb-2">
          {movies.map((m) => (
            <Link
              key={m.id}
              to="/movies"
              className="w-32 shrink-0 block transition-transform active:scale-95"
            >
              <div className="aspect-[2/3] relative rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm mb-2">
                <img src={m.cover} alt={m.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm">
                  {m.rating}
                </div>
              </div>
              <h3 className="font-bold text-sm leading-tight line-clamp-1">{m.title}</h3>
              <p className="text-muted-foreground text-[10px] mt-0.5">{m.genre}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Feed List */}
      <div className="w-full pt-2 pb-24">
        {items.map((item, index) => (
          <FeedCard key={`${item.id}-${index}`} post={item} />
        ))}
      </div>

      {/* CSS to hide scrollbars */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
