import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { OrganizerCard } from "@/components/site/OrganizerCard";
import { OrganizerProfile } from "@/components/site/OrganizerProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFollowedOrganizers } from "@/hooks/useFollowedOrganizers";
import { getOrganizers } from "@/api/organizers";
import { getOrganizersRatings } from "@/api/feedback";
import { useQuery } from "@tanstack/react-query";
import { useUserAuth } from "@/contexts/UserAuthContext";
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

// Stubbed mock data
const organizers: any[] = [];
type Organizer = any;

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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const { toggleFollow, isFollowing } = useFollowedOrganizers();
  const { isLoggedIn } = useUserAuth();

  const { data: dbOrganizers } = useQuery({
    queryKey: ["organizers"],
    queryFn: () => getOrganizers(),
  });

  const { data: ratingsMap = {} } = useQuery({
    queryKey: ["organizers-ratings"],
    queryFn: () => getOrganizersRatings(),
  });

  const list = dbOrganizers && dbOrganizers.length > 0 ? dbOrganizers : organizers;

  const filteredList = list.filter((org: any) => {
    const search = searchTerm.toLowerCase();
    return org.name?.toLowerCase().includes(search) || org.handle?.toLowerCase().includes(search);
  });

  const ITEMS_PER_PAGE = 30;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);

  const paginatedList = filteredList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleOrgClick = (org: any) => {
    setSelectedOrg(org);
  };

  const closeProfile = () => {
    setSelectedOrg(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0 md:max-w-md md:mx-auto md:border-x md:border-border/40 lg:max-w-none lg:border-x-0 lg:mx-0 shadow-xl lg:shadow-none flex flex-col">
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 md:px-6 py-6 md:py-10">
        <header className="hidden md:flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Popular Organizers</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Discover and follow Africa's best creators and venues.
            </p>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search organizers..."
              className="pl-9 rounded-full bg-secondary/50 border-border/40 text-sm h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {filteredList.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-dashed border-border/60 text-muted-foreground bg-secondary/20">
            <p className="text-base font-medium">No organizers found matching "{searchTerm}"</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-4">
              {paginatedList.map((org) => (
                <OrganizerCard
                  key={org.id}
                  org={org}
                  following={isFollowing(org.id)}
                  isLoggedIn={isLoggedIn}
                  rating={ratingsMap[org.id]}
                  onClick={() => handleOrgClick(org)}
                  onFollowToggle={() => toggleFollow(org.id)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 h-9 text-xs font-semibold"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }, (_, idx) => {
                  const pageNumber = idx + 1;
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      className="w-9 h-9 rounded-full font-semibold text-xs"
                      style={
                        currentPage === pageNumber
                          ? { background: "var(--gradient-primary)", color: "white" }
                          : undefined
                      }
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 h-9 text-xs font-semibold"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
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
            {selectedOrg && (
              <OrganizerProfile
                org={selectedOrg}
                following={isFollowing(selectedOrg.id)}
                isLoggedIn={isLoggedIn}
                rating={ratingsMap[selectedOrg.id]}
                onFollowToggle={() => toggleFollow(selectedOrg.id)}
              />
            )}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={!!selectedOrg} onOpenChange={(open) => !open && closeProfile()}>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader className="sr-only">
              <DialogTitle>{selectedOrg?.name}</DialogTitle>
              <DialogDescription>Profile details for {selectedOrg?.name}</DialogDescription>
            </DialogHeader>
            {selectedOrg && (
              <OrganizerProfile
                org={selectedOrg}
                following={isFollowing(selectedOrg.id)}
                isLoggedIn={isLoggedIn}
                rating={ratingsMap[selectedOrg.id]}
                onFollowToggle={() => toggleFollow(selectedOrg.id)}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
