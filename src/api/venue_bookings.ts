import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

const CREATE_VENUE_BOOKING = `
  mutation CreateVenueBooking($object: venue_bookings_insert_input!) {
    insert_venue_bookings_one(object: $object) {
      id
      customer_name
      start_time
      end_time
      status
      payment_status
    }
  }
`;

export const createVenueBooking = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { 
      workspace_id,
      venue_id,
      customer_name,
      customer_email,
      customer_phone,
      customer_id_document,
      start_time,
      end_time,
      status,
      payment_status,
      amount,
      number_of_attendees,
      tickets_data,
      attendees_info,
      internal_notes
    } = ctx.data;

    const res = await hasuraRequest<{ insert_venue_bookings_one: any }>(
      CREATE_VENUE_BOOKING,
      {
        object: {
          workspace_id,
          venue_id,
          customer_name,
          customer_email,
          customer_phone,
          customer_id_document,
          start_time,
          end_time,
          status,
          payment_status,
          amount,
          number_of_attendees,
          tickets_data,
          attendees_info,
          internal_notes
        },
      },
    );
    return res.insert_venue_bookings_one;
  });

const GET_VENUE_BOOKINGS = `
  query GetVenueBookings($venue_id: uuid!) {
    venue_bookings(where: { venue_id: { _eq: $venue_id } }, order_by: { start_time: asc }) {
      id
      customer_name
      customer_email
      customer_phone
      customer_id_document
      start_time
      end_time
      status
      payment_status
      amount
      number_of_attendees
      tickets_data
      attendees_info
      internal_notes
    }
  }
`;

export const getVenueBookings = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { venue_id } = ctx.data;
    if (!venue_id) throw new Error("venue_id is required");
    const res = await hasuraRequest<{ venue_bookings: any[] }>(
      GET_VENUE_BOOKINGS,
      { venue_id }
    );
    return res.venue_bookings;
  });
