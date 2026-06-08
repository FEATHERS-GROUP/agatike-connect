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
      is_venue_private,
      pricing_tiers,
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
          is_venue_private,
          pricing_tiers,
        },
      },
    );
    return res.insert_rentable_venues_one;
  });

const GET_RENTABLE_VENUES = `
  query GetRentableVenues($workspace_id: uuid!) {
    rentable_venues(where: { workspace_id: { _eq: $workspace_id } }, order_by: { created_at: desc }) {
      id
      name
      type
      city
      country
      address
      capacity
      rental_type
      currency
      cover_url
      status
      pricing_tiers
      amenities
      created_at
    }
  }
`;

export const getRentableVenues = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { workspace_id } = ctx.data;
    if (!workspace_id) throw new Error("workspace_id is required");
    const res = await hasuraRequest<{ rentable_venues: any[] }>(GET_RENTABLE_VENUES, {
      workspace_id,
    });
    return res.rentable_venues;
  });

const GET_RENTABLE_VENUE_BY_ID = `
  query GetRentableVenueById($id: uuid!) {
    rentable_venues_by_pk(id: $id) {
      id
      name
      type
      city
      country
      address
      capacity
      rental_type
      currency
      cover_url
      status
      pricing_tiers
      amenities
      created_at
    }
  }
`;

export const getRentableVenueById = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { id } = ctx.data;
    if (!id) throw new Error("id is required");
    const res = await hasuraRequest<{ rentable_venues_by_pk: any }>(GET_RENTABLE_VENUE_BY_ID, {
      id,
    });
    return res.rentable_venues_by_pk;
  });

const UPDATE_RENTABLE_VENUE = `
  mutation UpdateRentableVenue($id: uuid!, $object: rentable_venues_set_input!) {
    update_rentable_venues_by_pk(pk_columns: { id: $id }, _set: $object) {
      id
    }
  }
`;

export const updateRentableVenue = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { id, ...updates } = ctx.data;
    if (!id) throw new Error("id is required");
    const res = await hasuraRequest<{ update_rentable_venues_by_pk: { id: string } }>(
      UPDATE_RENTABLE_VENUE,
      {
        id,
        object: updates,
      },
    );
    return res.update_rentable_venues_by_pk;
  });
