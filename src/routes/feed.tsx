import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Send, Bookmark, Ticket, Users } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Stories } from "@/components/site/Stories";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedCard } from "@/components/site/FeedCard";
import { events, feedPosts } from "@/lib/mock-data";
import { useFollowedOrganizers } from "@/hooks/useFollowedOrganizers";
import { getOrganizers } from "@/api/organizers";
import { getGlobalFeedPosts } from "@/api/experience";
import { useQuery } from "@tanstack/react-query";

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
  const { isFollowing } = useFollowedOrganizers();
  const { data: dbPosts = [], isLoading } = useQuery({
    queryKey: ["global-feed-posts"],
    queryFn: () => getGlobalFeedPosts(),
  });

  // Filter feed posts to only show those from followed organizers
  const filteredPosts = dbPosts.filter((post) => isFollowing(post.organizerId));

  return (
    <div className="min-h-screen bg-background text-foreground">
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
              {events.slice(0, 3).map((e) => (
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
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <p className="text-sm font-semibold">Suggested organizers</p>
            <div className="mt-4 space-y-3">
              {events.slice(2, 5).map((e) => (
                <div key={e.id} className="flex items-center gap-3">
                  <img
                    src={e.cover}
                    className="h-10 w-10 rounded-full object-cover"
                    alt={e.organizer}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{e.organizer}</p>
                    <p className="text-xs text-muted-foreground">@{e.organizerHandle}</p>
                  </div>
                  <Button size="sm" variant="outline" className="ml-auto rounded-full">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
      <Footer />
    </div>
  );
}
