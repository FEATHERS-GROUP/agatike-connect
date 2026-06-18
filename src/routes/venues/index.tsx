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
    const data = await getPublicRentableVenues();
    
    // Inject mock data for offices and gyms so the user can see what they look like
    const mockData = [
      {
        id: "mock-office-1",
        name: "Agatike Hub (Mock)",
        type: "office",
        city: "Kigali",
        address: "Norrsken House",
        opening_hours: "08:00",
        closing_hours: "20:00",
        description: "A premium co-working space for startups and freelancers with high-speed internet, free coffee, and sound-proof meeting rooms.",
        cover_url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1000",
        currency: "RWF",
        pricing_tiers: [{ name: "Daily Pass", amount: 15000 }],
      },
      {
        id: "mock-gym-1",
        name: "FitLife Academy (Mock)",
        type: "gym",
        city: "Kigali",
        address: "Remera, KG 11 Ave",
        opening_hours: "05:00",
        closing_hours: "23:00",
        description: "State-of-the-art fitness center with modern equipment, personal trainers, sauna, and daily group classes.",
        cover_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000",
        currency: "RWF",
        pricing_tiers: [{ name: "Day Pass", amount: 5000 }],
      }
    ];
    
    return [...data, ...mockData];
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
