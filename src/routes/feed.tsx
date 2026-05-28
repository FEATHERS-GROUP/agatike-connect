import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Send, Bookmark, Ticket } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Stories } from "@/components/site/Stories";
import { Button } from "@/components/ui/button";
import { events, feedPosts } from "@/lib/mock-data";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Feed — Agatike" },
      { name: "description", content: "Live moments, reels and reviews from events across Africa." },
      { property: "og:title", content: "Agatike Feed" },
      { property: "og:description", content: "The social heartbeat of African nightlife and culture." },
    ],
  }),
  component: Feed,
});

function Feed() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_320px]">
        <main>
          <Stories />
          <div className="mt-8 space-y-8">
            {feedPosts.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-card)]">
                <header className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full" style={{ background: "var(--gradient-primary)" }} />
                    <div>
                      <p className="text-sm font-semibold">{p.user}</p>
                      <p className="text-xs text-muted-foreground">@{p.handle}</p>
                    </div>
                  </div>
                  <Link to="/events/$eventId" params={{ eventId: p.eventId }} className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                    <Ticket className="h-3 w-3" /> {p.eventTitle}
                  </Link>
                </header>
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
                  <img src={p.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3 text-foreground">
                    <button className="hover:text-primary transition"><Heart className="h-6 w-6" /></button>
                    <button className="hover:text-primary transition"><MessageCircle className="h-6 w-6" /></button>
                    <button className="hover:text-primary transition"><Send className="h-6 w-6" /></button>
                    <button className="ml-auto hover:text-primary transition"><Bookmark className="h-6 w-6" /></button>
                  </div>
                  <p className="mt-3 text-sm font-semibold">{p.likes.toLocaleString()} likes</p>
                  <p className="mt-1 text-sm"><span className="font-semibold">@{p.handle}</span> {p.caption}</p>
                  <p className="mt-1 text-xs text-muted-foreground">View all {p.comments} comments</p>
                </div>
              </article>
            ))}
          </div>
        </main>

        <aside className="hidden lg:block space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <p className="text-sm font-semibold">Upcoming for you</p>
            <div className="mt-4 space-y-3">
              {events.slice(0, 3).map((e) => (
                <Link key={e.id} to="/events/$eventId" params={{ eventId: e.id }} className="flex items-center gap-3 rounded-xl p-2 hover:bg-secondary transition">
                  <img src={e.cover} className="h-12 w-12 rounded-lg object-cover" alt={e.title} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.date} · {e.city}</p>
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
                  <img src={e.cover} className="h-10 w-10 rounded-full object-cover" alt={e.organizer} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{e.organizer}</p>
                    <p className="text-xs text-muted-foreground">@{e.organizerHandle}</p>
                  </div>
                  <Button size="sm" variant="outline" className="ml-auto rounded-full">Follow</Button>
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