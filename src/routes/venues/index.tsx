import { createFileRoute } from "@tanstack/react-router";
import { VenuesMobile } from "@/components/mobile/VenuesMobile";
import { VenuesDesktop } from "@/components/desktop/VenuesDesktop";
import { getPublicRentableVenues } from "@/api/rentable_venues";

export const Route = createFileRoute("/venues/")({
  head: () => ({
    meta: [
      { title: "Venue Tickets — Agatike" },
      {
        name: "description",
        content: "Get access tickets for parks, museums, and gaming centers.",
      },
    ],
  }),
  loader: async () => {
    return await getPublicRentableVenues();
  },
  component: VenuesIndex,
});

function VenuesIndex() {
  return (
    <>
      <div className="md:hidden">
        <VenuesMobile />
      </div>
      <div className="hidden md:block">
        <VenuesDesktop />
      </div>
    </>
  );
}
