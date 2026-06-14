import { Link, useNavigate } from "@tanstack/react-router";
import { FeedCard } from "@/components/site/FeedCard";
import { Stories } from "@/components/site/Stories";
import { MessageCircle, Activity, Loader2, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useQuery } from "@tanstack/react-query";
import { getOrganizers } from "@/api/organizers";
import { getOrganizersRatings } from "@/api/feedback";
import { getGlobalFeedPosts } from "@/api/experience";
import { useFollowedOrganizers } from "@/hooks/useFollowedOrganizers";
import { useFirestoreUserMessages } from "@/hooks/useFirestoreUserMessages";
import { useEffect, useState, useMemo, Fragment } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getPublicEvents } from "@/api/events";
import { mapDbEventToEvent, isWeekendEvent } from "@/lib/utils";

// Stubbed mock data
const movies: any[] = [
  {
    id: "m1",
    title: "Black Panther: Wakanda Forever",
    genre: "Action / Sci-Fi",
    duration: "2h 41m",
    rating: "PG-13",
    cover: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600",
    cinema: "IMAX Nairobi",
    city: "Nairobi",
    showtimes: ["10:00 AM", "1:30 PM", "5:00 PM", "8:30 PM"],
    synopsis: "The people of Wakanda fight to protect their home from intervening world powers as they mourn the death of King T'Challa.",
    price: 12,
    currency: "USD",
  },
  {
    id: "m2",
    title: "The Woman King",
    genre: "Drama / History",
    duration: "2h 15m",
    rating: "PG-13",
    cover: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600",
    cinema: "Silverbird Lagos",
    city: "Lagos",
    showtimes: ["11:00 AM", "2:00 PM", "6:00 PM"],
    synopsis: "A story of the Agojie, the all-female unit of warriors who protected the African Kingdom of Dahomey.",
    price: 10,
    currency: "USD",
  },
  {
    id: "m3",
    title: "Lionheart",
    genre: "Comedy / Drama",
    duration: "1h 35m",
    rating: "PG",
    cover: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600",
    cinema: "Nu Metro Accra",
    city: "Accra",
    showtimes: ["10:30 AM", "1:00 PM", "4:30 PM", "8:00 PM"],
    synopsis: "A young woman is forced to team up with her late father's business partner to save their family business.",
    price: 9,
    currency: "USD",
  },
  {
    id: "m4",
    title: "Atlantics",
    genre: "Drama / Fantasy",
    duration: "1h 46m",
    rating: "NR",
    cover: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600",
    cinema: "IMAX Nairobi",
    city: "Nairobi",
    showtimes: ["2:30 PM", "6:00 PM", "9:00 PM"],
    synopsis: "In a Dakar suburb, young people disappear into the sea and come back to seek revenge on those who wronged them.",
    price: 10,
    currency: "USD",
  },
];
const stories: any[] = [
  {
    id: "s1",
    name: "AfroBeat Fest",
    avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop",
    items: [
      { id: "s1i1", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800" },
      { id: "s1i2", image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800" },
    ],
  },
  {
    id: "s2",
    name: "Lagos Nights",
    avatar: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop",
    items: [{ id: "s2i1", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800" }],
  },
  {
    id: "s3",
    name: "Cape Jazz",
    avatar: "https://images.unsplash.com/photo-1511735111819-9a3efd16269a?w=150&h=150&fit=crop",
    items: [
      { id: "s3i1", image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800" },
    ],
  },
  {
    id: "s4",
    name: "Nairobi FC",
    avatar: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=150&h=150&fit=crop",
    items: [{ id: "s4i1", image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800" }],
  },
  {
    id: "s5",
    name: "Accra Vibes",
    avatar: "https://images.unsplash.com/photo-1545484152-c8e5b50c6fce?w=150&h=150&fit=crop",
    items: [{ id: "s5i1", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800" }],
  },
];

function PopularOrganizers({
  organizersLoading,
  allFollowed,
  unfollowedOrganizers,
  isFollowing,
  toggleFollow,
  ratingsMap,
}: any) {
  return (
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
        ) : allFollowed ? (
          <div className="flex flex-col items-center justify-center w-full py-6 gap-2 text-muted-foreground">
            <Users className="h-8 w-8" />
            <p className="text-sm text-center">You're following all organizers!</p>
            <Link to="/organizers" className="text-xs font-bold text-primary">
              View on organizers page →
            </Link>
          </div>
        ) : unfollowedOrganizers.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full py-6 gap-2 text-muted-foreground">
            <Users className="h-8 w-8" />
            <p className="text-sm">No organizers found</p>
          </div>
        ) : (
          unfollowedOrganizers.map((org: any) => {
            return (
              <Link
                key={org.id}
                to="/organizers"
                className="w-36 shrink-0 rounded-2xl p-4 bg-card border border-border/40 shadow-sm flex flex-col items-center text-center transition-transform active:scale-95 block"
              >
                <img
                  src={org.avatar || org.image || `https://i.pravatar.cc/150?u=${org.id}`}
                  alt={org.name}
                  className="w-16 h-16 rounded-full object-cover mb-3"
                />
                <p className="font-semibold text-sm leading-tight line-clamp-1">{org.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">@{org.handle}</p>
                {ratingsMap[org.id] && (
                  <div className="flex items-center gap-0.5 mt-1 text-[10px] text-primary font-semibold">
                    <Star className="h-2.5 w-2.5 fill-primary" />
                    <span>{ratingsMap[org.id].avg.toFixed(1)}</span>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="default"
                  className="mt-3 w-full rounded-full h-7 text-[10px] font-bold uppercase tracking-wider shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-primary)" }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFollow(org.id);
                  }}
                >
                  Follow
                </Button>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

function UpcomingEvents({ events }: any) {
  if (!events || events.length === 0) return null;
  return (
    <div className="pt-5 pb-3">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-lg font-bold tracking-tight text-foreground">Upcoming Events</h2>
        <Link to="/events" className="text-sm font-bold text-primary">
          See all
        </Link>
      </div>
      <div className="flex gap-4 px-4 overflow-x-auto hide-scrollbar pb-2">
        {events.map((event: any) => (
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
              <div className="mt-1 text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <Users className="h-3 w-3" /> People going · {(event.attendees || 0).toLocaleString()}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function NowShowing({ movies }: any) {
  if (!movies || movies.length === 0) return null;
  return (
    <div className="pt-2 pb-3">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-lg font-bold tracking-tight text-foreground">Now Showing</h2>
        <Link to="/movies" className="text-sm font-bold text-primary">
          See all
        </Link>
      </div>
      <div className="flex gap-4 px-4 overflow-x-auto hide-scrollbar pb-2">
        {movies.map((m: any) => (
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
  );
}

export function HomeMobile() {
  const { user, isLoading, isLoggedIn } = useUserAuth();
  const navigate = useNavigate();
  const { toggleFollow, isFollowing, followedIds } = useFollowedOrganizers();

  const { data: dbOrganizers = [], isLoading: organizersLoading } = useQuery({
    queryKey: ["organizers"],
    queryFn: () => getOrganizers(),
  });

  const { data: dbPosts = [] } = useQuery({
    queryKey: ["global-feed-posts"],
    queryFn: () => getGlobalFeedPosts(),
  });

  const { data: ratingsMap = {} } = useQuery({
    queryKey: ["organizers-ratings"],
    queryFn: () => getOrganizersRatings(),
  });

  const { data: dbEvents = [] } = useQuery({
    queryKey: ["public-events"],
    queryFn: () => getPublicEvents(),
  });

  const mappedEvents = useMemo(() => {
    const publicEvents = dbEvents.filter((e: any) => e.allowed_public === true && e.deleted !== true);
    return publicEvents.map(mapDbEventToEvent).filter(Boolean);
  }, [dbEvents]);

  const weekendEvents = useMemo(() => {
    let filtered = mappedEvents.filter((e: any) => isWeekendEvent(e.date));
    if (filtered.length === 0) {
      filtered = mappedEvents;
    }
    return filtered;
  }, [mappedEvents]);

  // On home page, hide organizers the user already follows
  const unfollowedOrganizers = dbOrganizers.filter((org: any) => !isFollowing(org.id));
  const allFollowed = dbOrganizers.length > 0 && unfollowedOrganizers.length === 0;

  const { channels } = useFirestoreUserMessages(user?.id || "", followedIds);
  const unreadChatsCount = channels.filter(
    (c) =>
      c.lastMessageSenderId !== user?.id &&
      c.rawTimeMillis > parseInt(localStorage.getItem(`chat_read_${c.id}`) || "0", 10),
  ).length;

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const q = query(
      collection(db, "agatike_notifications"),
      where("targetUsers", "array-contains", user.id),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lastReadTimestamp = parseInt(
        localStorage.getItem("lastActivityReadTimestamp") || "0",
        10,
      );
      let count = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.actorId !== user.id) {
          const notifTime = data.createdAt ? new Date(data.createdAt).getTime() : 0;
          if (notifTime > lastReadTimestamp) {
            count++;
          }
        }
      });
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [user?.id]);

  useEffect(() => {
    const handleReadEvent = () => {
      setUnreadCount(0);
    };

    window.addEventListener("activityRead", handleReadEvent);
    return () => {
      window.removeEventListener("activityRead", handleReadEvent);
    };
  }, [user?.id]);

  const carouselPositions = useMemo(() => {
    const max = 25;
    let pos: number[] = [];
    while (pos.length < 3) {
      const r = Math.floor(Math.random() * max) + 1;
      if (pos.indexOf(r) === -1) pos.push(r);
    }
    return pos.sort((a, b) => a - b);
  }, []);

  const sortedPosts = useMemo(() => {
    const filteredPosts = isLoggedIn
      ? dbPosts.filter((post: any) => isFollowing(post.organizerId))
      : dbPosts;

    const postsWithRand = filteredPosts.map((p: any) => ({ ...p, _rand: Math.random() * 50 }));

    return postsWithRand.sort((a: any, b: any) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [dbPosts, followedIds, isLoggedIn]);

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
        <Link
          to="/$userId/message"
          params={{ userId: user?.id || "me" }}
          className="text-foreground relative"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadChatsCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center px-1 shadow-[var(--shadow-glow)] shadow-primary/20">
              {unreadChatsCount > 99 ? "99+" : unreadChatsCount}
            </span>
          )}
        </Link>
        <img src="/icon.svg" alt="Agatike" className="h-8 w-auto object-contain" />
        <Link to="/activity" className="text-foreground relative">
          <Activity className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
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

      {/* The carousels are now interleaved in the feed below */}

      {/* Feed List with Interleaved Carousels */}
      <div className="w-full pt-2 pb-24">
        {(() => {
          if (sortedPosts.length === 0) {
            return (
              <div className="flex flex-col w-full">
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                  <div className="h-14 w-14 bg-secondary text-muted-foreground rounded-full flex items-center justify-center mb-3">
                    <Users className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Your feed is quiet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Follow organizers to see their updates here.
                  </p>
                </div>
                <UpcomingEvents events={weekendEvents} />
                <PopularOrganizers
                  organizersLoading={organizersLoading}
                  allFollowed={allFollowed}
                  unfollowedOrganizers={unfollowedOrganizers}
                  isFollowing={isFollowing}
                  toggleFollow={toggleFollow}
                  ratingsMap={ratingsMap}
                />
                <NowShowing movies={movies} />
              </div>
            );
          }

          return (
            <>
              {sortedPosts.map((item: any, index: number) => {
                const isFirstCarousel = index === carouselPositions[0];
                const isSecondCarousel = index === carouselPositions[1];
                const isThirdCarousel = index === carouselPositions[2];

                return (
                  <Fragment key={`${item.id}-${index}`}>
                    <FeedCard post={item} />

                    {isFirstCarousel && <UpcomingEvents events={weekendEvents} />}
                    {isSecondCarousel && (
                      <PopularOrganizers
                        organizersLoading={organizersLoading}
                        allFollowed={allFollowed}
                        unfollowedOrganizers={unfollowedOrganizers}
                        isFollowing={isFollowing}
                        toggleFollow={toggleFollow}
                        ratingsMap={ratingsMap}
                      />
                    )}
                    {isThirdCarousel && <NowShowing movies={movies} />}
                  </Fragment>
                );
              })}

              {/* Catch-all to ensure carousels always render if the feed is too short */}
              {sortedPosts.length <= carouselPositions[0] && <UpcomingEvents events={weekendEvents} />}
              {sortedPosts.length <= carouselPositions[1] && (
                <PopularOrganizers
                  organizersLoading={organizersLoading}
                  allFollowed={allFollowed}
                  unfollowedOrganizers={unfollowedOrganizers}
                  isFollowing={isFollowing}
                  toggleFollow={toggleFollow}
                  ratingsMap={ratingsMap}
                />
              )}
              {sortedPosts.length <= carouselPositions[2] && <NowShowing movies={movies} />}
            </>
          );
        })()}
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
