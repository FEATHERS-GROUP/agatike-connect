import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Search, Instagram, Twitter, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { organizers, Organizer } from "@/lib/mock-data";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const [selectedOrg, setSelectedOrg] = useState<Organizer | null>(null);
  const isMobile = useIsMobile();

  const handleOrgClick = (org: Organizer) => {
    setSelectedOrg(org);
  };

  const closeProfile = () => {
    setSelectedOrg(null);
  };

  const ProfileContent = ({ org }: { org: Organizer }) => (
    <div className="flex flex-col items-center pt-4 pb-6 px-4">
      <div className="h-24 w-24 rounded-full overflow-hidden border border-border/40 shadow-sm mb-4 relative">
        <img src={org.avatar} alt={org.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex items-center gap-1.5 mb-1">
        <h2 className="text-xl font-bold">{org.name}</h2>
        <CheckCircle2 className="h-5 w-5 text-primary fill-primary/20" />
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-4">
        @{org.handle} • {(org.followers / 1000).toFixed(1)}k followers
      </p>

      <p className="text-center text-sm mb-6 max-w-xs">{org.bio}</p>

      <div className="flex gap-4 w-full justify-center mb-6">
        <Button variant="outline" size="icon" className="rounded-full" asChild>
          <a href={org.twitterUrl} target="_blank" rel="noopener noreferrer">
            <Twitter className="h-4 w-4" />
          </a>
        </Button>
        <Button variant="outline" size="icon" className="rounded-full" asChild>
          <a href={org.instagramUrl} target="_blank" rel="noopener noreferrer">
            <Instagram className="h-4 w-4" />
          </a>
        </Button>
      </div>

      <Button
        className="w-full max-w-xs rounded-full font-bold shadow-[var(--shadow-glow)]"
        style={{ background: "var(--gradient-primary)" }}
      >
        Follow
      </Button>
    </div>
  );

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

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {organizers.map((org) => (
            <div
              key={org.id}
              onClick={() => handleOrgClick(org)}
              className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center"
            >
              <div className="relative h-20 w-20 mb-3 rounded-full overflow-hidden border border-border/40">
                <img src={org.avatar} alt={org.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-semibold text-sm leading-tight line-clamp-1 w-full">
                {org.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {(org.followers / 1000).toFixed(1)}k followers
              </p>

              <Button
                className="w-full mt-4 rounded-full text-xs font-semibold h-8 shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                Follow
              </Button>
            </div>
          ))}
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
