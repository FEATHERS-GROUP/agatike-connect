import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

const CREATE_RENTABLE_VENUE = `
  mutation CreateRentableVenue($object: rentable_venues_insert_input!) {
    insert_rentable_venues_one(object: $object) {
      id
    }
  }
`;

export const createRentableVenue = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { 
      workspace_id, 
      name, 
      type, 
      rental_model, 
      city, 
      capacity, 
      rental_type, 
      price_per_day, 
      price_per_hour, 
      price_per_week, 
      price_annually, 
      entrance_fee, 
      currency,
      cover_url,
      description,
      images,
      opening_hours,
      closing_hours,
      instructions,
      amenities,
      sections,
      address,
      country,
      latitude,
      longitude,
      is_venue_private
    } = ctx.data;

    const res = await hasuraRequest<{ insert_rentable_venues_one: { id: string } }>(
      CREATE_RENTABLE_VENUE,
      {
        object: {
          workspace_id,
          name,
          type,
          rental_model,
          city,
          capacity,
          rental_type,
          price_per_day,
          price_per_hour,
          price_per_week,
          price_annually,
          entrance_fee,
          currency,
          cover_url,
          description,
          images,
          opening_hours,
          closing_hours,
          instructions,
          amenities,
          sections,
          address,
          country,
          latitude,
          longitude,
          is_venue_private
        },
      },
    );
    return res.insert_rentable_venues_one;
  });
