import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

const CREATE_VENUE_BOOKING = `
  mutation CreateVenueBooking($object: venue_bookings_insert_input!) {
    insert_venue_bookings_one(object: $object) {
      id
      customer_name
      customer_email
      start_time
      end_time
      status
      payment_status
      tickets_data
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
      internal_notes,
      venue_name, // Extracted here
      venue_currency,
    } = ctx.data;

    let final_tickets_data = tickets_data;
    let issuedTickets: any[] = [];

    if (payment_status === "Paid" && customer_email && tickets_data) {
      let ticketsToGenerate: any[] = [];

      if (tickets_data.selected_tier) {
        ticketsToGenerate.push({ tier: tickets_data.selected_tier, name: customer_name });
      } else {
        const attendeeNames = [customer_name, ...(attendees_info || []).map((a: any) => a.name)];
        let nameIdx = 0;

        for (const [tierName, qty] of Object.entries(tickets_data)) {
          if (typeof qty === "number") {
            for (let i = 0; i < qty; i++) {
              const nameForTicket = attendeeNames[nameIdx] || customer_name;
              ticketsToGenerate.push({ tier: tierName, name: nameForTicket });
              nameIdx++;
            }
          }
        }
      }

      for (let i = 0; i < ticketsToGenerate.length; i++) {
        const t = ticketsToGenerate[i];
        const otp = Math.random().toString(36).substring(2, 8).toUpperCase();
        const ticketId = `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        issuedTickets.push({
          id: ticketId,
          tier: t.tier,
          attendee_name: t.name,
          otp,
          used: false,
        });
      }

      final_tickets_data = {
        summary: tickets_data,
        issued: issuedTickets,
      };
    }

    const res = await hasuraRequest<{ insert_venue_bookings_one: any }>(CREATE_VENUE_BOOKING, {
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
        tickets_data: final_tickets_data,
        attendees_info,
        internal_notes,
      },
    });

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
    const res = await hasuraRequest<{ venue_bookings: any[] }>(GET_VENUE_BOOKINGS, { venue_id });
    return res.venue_bookings;
  });
