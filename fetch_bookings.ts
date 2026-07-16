import { getVenueBookings } from "./src/api/venue_bookings";

async function run() {
  const bookings = await getVenueBookings({
    data: { venue_id: "4654692e-8691-4763-8081-c598a1cc8d60" },
  } as any);
  console.log(JSON.stringify(bookings, null, 2));
}

run().catch(console.error);
