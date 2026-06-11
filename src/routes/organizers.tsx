import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Search, Instagram, Twitter, CheckCircle2, Star } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { organizers, Organizer } from "@/lib/mock-data";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFollowedOrganizers } from "@/hooks/useFollowedOrganizers";
import { getOrganizers } from "@/api/organizers";
import { getOrganizersRatings } from "@/api/feedback";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export const Route = createFileRoute("/organizers")({
  head: () => ({
    meta: [
      { title: "Organizers — Agatike" },
      { name: "description", content: "Discover the best organizers in Africa." },
    ],
  }),
  component: OrganizersPage,
});

function OrganizersPage() {
  const router = useRouter();
  const [selectedOrg, setSelectedOrg] = useState<any | null>(null);
  const isMobile = useIsMobile();
  const { toggleFollow, isFollowing } = useFollowedOrganizers();

  const { data: dbOrganizers } = useQuery({
    queryKey: ["organizers"],
    queryFn: () => getOrganizers(),
  });

  const { data: ratingsMap = {} } = useQuery({
    queryKey: ["organizers-ratings"],
    queryFn: () => getOrganizersRatings(),
  });

  const list = dbOrganizers && dbOrganizers.length > 0 ? dbOrganizers : organizers;

  const handleOrgClick = (org: any) => {
    setSelectedOrg(org);
  };

  const closeProfile = () => {
    setSelectedOrg(null);
  };

  const ProfileContent = ({ org }: { org: any }) => {
    const following = isFollowing(org.id);
    const followerCount = org.followers ?? 0;
    const avatar = org.avatar || org.image || `https://i.pravatar.cc/150?u=${org.id}`;
    const twitterUrl =
      org.twitterUrl || org.socials?.twitter || `https://twitter.com/${org.handle}`;
    const instagramUrl =
      org.instagramUrl || org.socials?.instagram || `https://instagram.com/${org.handle}`;
    const rating = ratingsMap[org.id];

    return (
      <div className="flex flex-col items-center pt-4 pb-6 px-4">
        <div className="h-24 w-24 rounded-full overflow-hidden border border-border/40 shadow-sm mb-4 relative">
          <img src={avatar} alt={org.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <h2 className="text-xl font-bold">{org.name}</h2>
          <CheckCircle2 className="h-5 w-5 text-primary fill-primary/20" />
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-2">
          @{org.handle} ·{" "}
          {followerCount >= 1000 ? (followerCount / 1000).toFixed(1) + "k" : followerCount}{" "}
          {followerCount === 1 ? "follower" : "followers"}
        </p>

        {rating && (
          <div className="flex items-center gap-1 mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Star className="h-3 w-3 fill-primary" />
            <span>{rating.avg.toFixed(1)}</span>
            <span className="text-muted-foreground font-normal">
              ({rating.count} {rating.count === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}

        <p className="text-center text-sm mb-6 max-w-xs">{org.bio}</p>

        <div className="flex gap-4 w-full justify-center mb-6">
          <Button variant="outline" size="icon" className="rounded-full" asChild>
            <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
              <Twitter className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" size="icon" className="rounded-full" asChild>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
              <Instagram className="h-4 w-4" />
            </a>
          </Button>
        </div>

        <Button
          onClick={() => toggleFollow(org.id)}
          variant={following ? "outline" : "default"}
          className={`w-full max-w-xs rounded-full font-bold ${following ? "" : "shadow-[var(--shadow-glow)]"}`}
          style={following ? undefined : { background: "var(--gradient-primary)" }}
        >
          {following ? "Following" : "Follow"}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0 md:max-w-md md:mx-auto md:border-x md:border-border/40 lg:max-w-none lg:border-x-0 lg:mx-0 shadow-xl lg:shadow-none">
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-3 border-b border-border/40 pt-safe-top flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search organizers..."
            className="pl-9 rounded-full bg-secondary/60 border-transparent text-sm h-10"
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-10">
        <header className="hidden md:flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Popular Organizers</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Discover and follow Africa's best creators and venues.
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-3 md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-4">
          {list.map((org) => {
            const following = isFollowing(org.id);
            const followerCount = org.followers ?? 0;
            const avatar = org.avatar || org.image || `https://i.pravatar.cc/150?u=${org.id}`;
            const rating = ratingsMap[org.id];
            return (
              <div
                key={org.id}
                onClick={() => handleOrgClick(org)}
                className="rounded-2xl border border-border/60 bg-card p-3 md:p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-1 cursor-pointer flex flex-row items-center text-left md:flex-col md:items-center md:text-center animate-in fade-in duration-300"
              >
                <div className="relative h-12 w-12 shrink-0 md:h-20 md:w-20 md:mb-3 rounded-full overflow-hidden border border-border/40">
                  <img src={avatar} alt={org.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0 ml-3 md:ml-0">
                  <h3 className="font-semibold text-sm leading-tight line-clamp-1 w-full">
                    {org.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">
                    {followerCount >= 1000 ? (followerCount / 1000).toFixed(1) + "k" : followerCount}{" "}
                    {followerCount === 1 ? "follower" : "followers"}
                  </p>

                  {rating && (
                    <div className="flex items-center gap-1 mt-0.5 md:mt-2 md:justify-center text-xs text-primary font-medium">
                      <Star className="h-3 w-3 fill-primary" />
                      <span>{rating.avg.toFixed(1)}</span>
                      <span className="text-muted-foreground font-normal">({rating.count})</span>
                    </div>
                  )}
                </div>

                <Button
                  variant={following ? "outline" : "default"}
                  className={`w-24 shrink-0 ml-3 md:w-full md:ml-0 md:mt-4 rounded-full text-xs font-semibold h-8 ${following ? "" : "shadow-[var(--shadow-glow)]"}`}
                  style={following ? undefined : { background: "var(--gradient-primary)" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFollow(org.id);
                  }}
                >
                  {following ? "Following" : "Follow"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Profile Modals */}
      {isMobile ? (
        <Drawer open={!!selectedOrg} onOpenChange={(open) => !open && closeProfile()}>
          <DrawerContent>
            <DrawerHeader className="sr-only">
              <DrawerTitle>{selectedOrg?.name}</DrawerTitle>
              <DrawerDescription>Profile details for {selectedOrg?.name}</DrawerDescription>
            </DrawerHeader>
            {selectedOrg && <ProfileContent org={selectedOrg} />}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={!!selectedOrg} onOpenChange={(open) => !open && closeProfile()}>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader className="sr-only">
              <DialogTitle>{selectedOrg?.name}</DialogTitle>
              <DialogDescription>Profile details for {selectedOrg?.name}</DialogDescription>
            </DialogHeader>
            {selectedOrg && <ProfileContent org={selectedOrg} />}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
