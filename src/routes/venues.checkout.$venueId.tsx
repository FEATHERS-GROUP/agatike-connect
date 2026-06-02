import { createFileRoute } from "@tanstack/react-router";
import { VenueCheckoutMobile } from "@/components/mobile/VenueCheckoutMobile";
import { VenueCheckoutDesktop } from "@/components/desktop/VenueCheckoutDesktop";
import { mockVenues } from "@/lib/mock-venue-data";

export const Route = createFileRoute("/venues/checkout/$venueId")({
  loader: ({ params }) => {
    return mockVenues.find((v) => v.id === params.venueId);
  },
  component: VenueCheckout,
});

function VenueCheckout() {
  const venue = Route.useLoaderData();

  if (!venue) {
    return <div className="p-8 text-center">Venue not found</div>;
  }

  return (
    <>
      <div className="md:hidden">
        <VenueCheckoutMobile venue={venue} />
      </div>
      <div className="hidden md:block">
        <VenueCheckoutDesktop venue={venue} />
      </div>
    </>
  );
}
