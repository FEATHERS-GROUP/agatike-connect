import { createFileRoute } from "@tanstack/react-router";
import { VenuesMobile } from "@/components/mobile/VenuesMobile";
import { VenuesDesktop } from "@/components/desktop/VenuesDesktop";
import { getPublicSpaces } from "@/api/spaces";
import { getPublicRentableVenues } from "@/api/rentable_venues";
import { mockVenues } from "@/lib/mock-venue-data";

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
    const [data, spacesData] = await Promise.all([getPublicRentableVenues(), getPublicSpaces()]);

    const formattedSpaces = spacesData.map((s: any) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      city: s.locations?.[0]?.city,
      address: s.locations?.[0]?.address,
      opening_hours: "08:00",
      closing_hours: "20:00",
      description: s.description,
      cover_url: s.cover_url,
      currency: s.workspace?.currency || s.currency,
      source: "space",
      status: s.status,
      pricing_tiers:
        s.plans?.map((p: any) => ({
          name: p.name,
          amount: p.price,
        })) || [],
    }));

    return [
      ...data.map((v: any) => ({
        ...v,
        source: "venue",
        currency: v.workspace?.currency || v.currency,
      })),
      ...formattedSpaces,
      // Inject mock venues from other countries (booking disabled)
      ...mockVenues
        .filter((m) => m.isMock)
        .map((m) => ({
          ...m,
          source: "mock_venue",
        })),
    ];
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
