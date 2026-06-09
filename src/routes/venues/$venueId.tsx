import { createFileRoute } from "@tanstack/react-router";
import { VenueDetailsMobile } from "@/components/mobile/VenueDetailsMobile";
import { VenueDetailsDesktop } from "@/components/desktop/VenueDetailsDesktop";
import { getRentableVenueById } from "@/api/rentable_venues";

export const Route = createFileRoute("/venues/$venueId")({
  loader: async ({ params }) => {
    return await getRentableVenueById({ data: { id: params.venueId } });
  },
  component: VenueDetails,
});

function VenueDetails() {
  const venue = Route.useLoaderData();

  if (!venue) {
    return <div className="p-8 text-center">Venue not found</div>;
  }

  return (
    <>
      <div className="md:hidden">
        <VenueDetailsMobile venue={venue} />
      </div>
      <div className="hidden md:block">
        <VenueDetailsDesktop venue={venue} />
      </div>
    </>
  );
}
