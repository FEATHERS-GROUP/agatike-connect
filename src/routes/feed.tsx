import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Send, Bookmark, Ticket, Users } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Stories } from "@/components/site/Stories";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedCard } from "@/components/site/FeedCard";
import { useFollowedOrganizers } from "@/hooks/useFollowedOrganizers";
import { getOrganizers } from "@/api/organizers";
import { getGlobalFeedPosts } from "@/api/experience";
import { useQuery } from "@tanstack/react-query";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useFirestoreUserMessages } from "@/hooks/useFirestoreUserMessages";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { getPublicEvents } from "@/api/events";
import { getPublicMovieSchedules } from "@/api/cinemas";
import { mapDbEventToEvent, isWeekendEvent } from "@/lib/utils";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Feed — Agatike" },
      {
        name: "description",
        content: "Live moments, reels and reviews from events across Africa.",
      },
      { property: "og:title", content: "Agatike Feed" },
      {
        property: "og:description",
        content: "The social heartbeat of African nightlife and culture.",
      },
    ],
  }),
  component: Feed,
});

function Feed() {
  const { followedIds, isFollowing, toggleFollow } = useFollowedOrganizers();
  const { isLoggedIn, user } = useUserAuth();
  const navigate = useNavigate();
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  const { channels } = useFirestoreUserMessages(user?.id || "", followedIds);
  
  const { data: dbOrganizers = [] } = useQuery({
    queryKey: ["organizers"],
    queryFn: () => getOrganizers(),
  });

  const { data: dbEvents = [] } = useQuery({
    queryKey: ["public-events"],
    queryFn: () => getPublicEvents(),
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ["public_schedules_feed"],
    queryFn: () =>
      getPublicMovieSchedules({ data: { date: new Date().toISOString().split("T")[0] } } as any),
  });

  const feedMovies = useMemo(() => {
    const moviesMap = new Map<string, any>();
    schedules.forEach((s: any) => {
      const m = s.movie;
      const c = s.cinema;
      if (!m || !c) return;
      const movieKey = `${m.id}-${c.id}`;
      if (!moviesMap.has(movieKey)) {
        moviesMap.set(movieKey, {
          id: m.id,
          title: m.title,
          genre: m.genre || "Drama",
          rating: m.rating || "PG",
          cover: m.cover_url || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600",
          cinema: c.name,
        });
      }
    });
    return Array.from(moviesMap.values());
  }, [schedules]);

  const mappedEvents = useMemo(() => {
    return dbEvents.filter((e: any) => e.allowed_public === true && e.deleted !== true).map(mapDbEventToEvent).filter(Boolean);
  }, [dbEvents]);

  const upcomingEvents = useMemo(() => {
    let filtered = mappedEvents.filter((e: any) => isWeekendEvent(e.date));
    if (filtered.length === 0) filtered = mappedEvents;
    return filtered;
  }, [mappedEvents]);

  const suggestedOrganizers = dbOrganizers.filter((org: any) => !isFollowing(org.id));
  
  const unreadChatsCount = channels.filter((c) => {
    const isUnread =
      c.lastMessageSenderId !== user?.id &&
      c.rawTimeMillis > parseInt(localStorage.getItem(`chat_read_${c.id}`) || "0", 10);
    return c.lastMessageSenderId !== user?.id && (c.unread > 0 || isUnread);
  }).length;
  
  // Conditionally fetch posts only if logged in
  const { data: dbPosts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ["global-feed-posts"],
    queryFn: () => getGlobalFeedPosts(),
    enabled: isLoggedIn,
  });
  
  const isLoading = isLoggedIn ? isPostsLoading : true; // Show loading skeletons if not logged in

  // Filter feed posts to only show those from followed organizers
  const filteredPosts = dbPosts.filter((post) => isFollowing(post.organizerId));

  return (
    <div className="min-h-screen bg-background text-foreground relative pb-24 md:pb-0">
      <Navbar />
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_320px]">
        <main>
          <Stories isLoading={isLoading} />
          <div className="mt-8 space-y-8">
            {isLoading ? (
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col space-y-3 p-4 bg-card rounded-2xl border border-border/40"
                  >
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                    </div>
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((p, i) => <FeedCard key={`${p.id}-${i}`} post={p} />)
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-card rounded-2xl border border-border/40">
                <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Your feed is quiet</h3>
                <p className="text-muted-foreground mt-2 text-sm max-w-sm">
                  Follow organizers to see their latest updates, ticket drops, and event recaps
                  right here.
                </p>
                <Link to="/organizers">
                  <Button
                    className="mt-6 rounded-full shadow-[var(--shadow-glow)]"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    Discover Organizers
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </main>

        <aside className="hidden lg:block space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <p className="text-sm font-semibold">Upcoming for you</p>
            <div className="mt-4 space-y-3">
              {upcomingEvents.slice(0, 3).map((e: any) => (
                <Link
                  key={e.id}
                  to="/events/$eventId"
                  params={{ eventId: e.id }}
                  className="flex items-center gap-3 rounded-xl p-2 hover:bg-secondary transition"
                >
                  <img src={e.cover} className="h-12 w-12 rounded-lg object-cover" alt={e.title} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.date} · {e.city}
                    </p>
                  </div>
                </Link>
              ))}
              {upcomingEvents.length === 0 && (
                <p className="text-xs text-muted-foreground italic px-2">No upcoming events.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <p className="text-sm font-semibold">Suggested organizers</p>
            <div className="mt-4 space-y-3">
              {suggestedOrganizers.slice(0, 5).map((org: any) => (
                <div key={org.id} className="flex items-center gap-3">
                  <img
                    src={org.image || org.avatar || `https://i.pravatar.cc/150?u=${org.id}`}
                    className="h-10 w-10 rounded-full object-cover"
                    alt={org.name}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{org.name}</p>
                    <p className="text-xs text-muted-foreground">@{org.handle}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="ml-auto rounded-full text-xs h-7 px-3"
                    onClick={() => toggleFollow(org.id)}
                  >
                    Follow
                  </Button>
                </div>
              ))}
              {suggestedOrganizers.length === 0 && (
                <p className="text-xs text-muted-foreground italic px-2">You follow everyone!</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <p className="text-sm font-semibold">Now showing</p>
            <div className="mt-4 space-y-3">
              {feedMovies.slice(0, 3).map((m: any) => (
                <Link
                  key={m.id}
                  to="/movies"
                  className="flex items-center gap-3 rounded-xl p-2 hover:bg-secondary transition"
                >
                  <div className="relative h-14 w-10 shrink-0">
                    <img src={m.cover} className="h-full w-full rounded-md object-cover" alt={m.title} />
                    <div className="absolute top-0.5 left-0.5 bg-background/90 backdrop-blur rounded px-1 py-0.5 text-[8px] font-bold shadow-sm">
                      {m.rating}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.cinema}</p>
                  </div>
                </Link>
              ))}
              {feedMovies.length === 0 && (
                <p className="text-xs text-muted-foreground italic px-2">No movies showing today.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {!isLoggedIn && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none flex justify-center">
          <div className="bg-card/95 backdrop-blur-xl border border-border/60 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] rounded-3xl p-6 md:p-8 w-full max-w-lg pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-500 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            <div className="mx-auto h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-black tracking-tight text-foreground mb-2">Join the Community</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Log in to see live moments, reels, and exclusive updates from your favorite event organizers and friends.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/signin" className="w-full">
                <Button
                  className="w-full h-12 rounded-2xl text-base font-bold shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Log In
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-2">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline font-semibold">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Blur overlay for the background when not logged in */}
      {!isLoggedIn && (
        <div className="fixed inset-0 top-[72px] bg-background/20 backdrop-blur-[2px] z-40 pointer-events-none" />
      )}

      {isLoggedIn && (
        <>
          <button
            onClick={() => setIsMessagesOpen(true)}
            className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-[var(--shadow-glow)] transition-transform hover:scale-105 active:scale-95"
            style={{ background: "var(--gradient-primary)" }}
            aria-label="Open messages"
          >
            <MessageCircle className="h-6 w-6 text-white" />
            {unreadChatsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center px-1 shadow-md">
                {unreadChatsCount > 99 ? "99+" : unreadChatsCount}
              </span>
            )}
          </button>

          <Drawer open={isMessagesOpen} onOpenChange={setIsMessagesOpen}>
            <DrawerContent className="h-[80vh] bg-background/95 backdrop-blur-xl border-border/40 p-0 flex flex-col">
              <DrawerHeader className="border-b border-border/40 pb-4 text-left px-5 pt-5">
                <DrawerTitle className="text-xl font-bold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" /> Messages
                </DrawerTitle>
              </DrawerHeader>
              <ScrollArea className="flex-1 p-3">
                <div className="flex flex-col gap-1 pb-safe">
                  {channels.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">No messages yet</p>
                    </div>
                  ) : (
                    channels.map((chat) => {
                      const isUnread =
                        chat.lastMessageSenderId !== user?.id &&
                        chat.rawTimeMillis >
                          parseInt(localStorage.getItem(`chat_read_${chat.id}`) || "0", 10);
                      const displayUnread =
                        chat.lastMessageSenderId !== user?.id && chat.unread > 0
                          ? chat.unread
                          : isUnread
                            ? 1
                            : 0;

                      return (
                        <button
                          key={chat.id}
                          onClick={() => {
                            setIsMessagesOpen(false);
                            navigate({
                              to: "/$userId/message",
                              params: { userId: user?.id || "me" },
                              search: { chatId: chat.id } as any,
                            });
                          }}
                          className="flex items-center gap-3 w-full p-3 rounded-2xl transition-all text-left hover:bg-accent/50"
                        >
                          <Avatar className="h-12 w-12 border border-border/50">
                            <AvatarImage src={chat.avatar} alt={chat.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {chat.type === "group" ? (
                                <Users className="h-5 w-5" />
                              ) : (
                                chat.name?.substring(0, 2).toUpperCase()
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-sm truncate pr-2">
                                {chat.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {chat.time}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p
                                className={`text-xs truncate pr-2 ${
                                  displayUnread > 0
                                    ? "text-foreground font-medium"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {chat.lastMessage || "Tap to chat"}
                              </p>
                              {displayUnread > 0 && (
                                <Badge
                                  className="h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-[10px]"
                                  style={{ background: "var(--gradient-primary)" }}
                                >
                                  {displayUnread}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        </>
      )}

      <Footer />
    </div>
  );
}
