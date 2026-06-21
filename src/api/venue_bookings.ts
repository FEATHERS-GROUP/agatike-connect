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
      user_id,
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
        ticketsToGenerate.push({
          tier: tickets_data.selected_tier,
          name: customer_name,
          id_document: customer_id_document,
        });
      } else {
        const attendeeList = [
          { name: customer_name, id_document: customer_id_document },
          ...(attendees_info || []).map((a: any) => ({ name: a.name, id_document: a.id_document })),
        ];
        let nameIdx = 0;

        for (const [tierName, qty] of Object.entries(tickets_data)) {
          if (typeof qty === "number") {
            for (let i = 0; i < qty; i++) {
              const attendee = attendeeList[nameIdx] || {
                name: customer_name,
                id_document: customer_id_document,
              };
              ticketsToGenerate.push({
                tier: tierName,
                name: attendee.name,
                id_document: attendee.id_document,
              });
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
          id_document: t.id_document || null,
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
        user_id,
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

    if (payment_status === "Paid" && parseFloat(amount || "0") > 0 && workspace_id) {
      try {
        const { addMoneyToWorkspaceWallet } = await import("./wallet");
        await addMoneyToWorkspaceWallet(workspace_id, parseFloat(amount));
      } catch (e) {
        console.error("Failed to update wallet for venue booking:", e);
      }
    }

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

const VALIDATE_TICKET_OTP = `
  query ValidateTicketOtp($otp: String!) {
    venue_bookings(
      where: {
        tickets_data: { _contains: { issued: [{ otp: $otp }] } }
      }
    ) {
      id
      customer_name
      customer_email
      start_time
      end_time
      status
      payment_status
      amount
      tickets_data
      venue_id
    }
  }
`;

export const getVenueBookingByOtp = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { otp } = ctx.data;
    if (!otp) throw new Error("otp is required");

    // Check if otp matches a UUID format (used for subscriptions)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(otp);
    if (isUuid) {
      const query = `
        query GetSpaceSubscriptionById($id: uuid!) {
          space_subscriptions_by_pk(id: $id) {
            id
            plan_name
            price
            status
            billing_cycle
            start_date
            next_billing_date
            booking_type
            customer_name
            customer_email
            customer_phone
            team_members
            created_at
            space {
              id
              name
              cover_url
              currency
            }
          }
        }
      `;
      try {
        const data = await hasuraRequest<{ space_subscriptions_by_pk: any }>(query, { id: otp });
        const sub = data.space_subscriptions_by_pk;
        if (sub) {
          return { type: "subscription", data: sub };
        }
      } catch (e) {
        console.error("Error fetching space subscription by id in getVenueBookingByOtp:", e);
      }
    }

    const res = await hasuraRequest<{ venue_bookings: any[] }>(VALIDATE_TICKET_OTP, { otp });
    const booking = res.venue_bookings[0] || null;
    if (booking && booking.venue_id) {
      const venueRes = await hasuraRequest<{ rentable_venues_by_pk: any }>(
        `
        query GetVenueName($id: uuid!) {
          rentable_venues_by_pk(id: $id) {
            name
          }
        }
      `,
        { id: booking.venue_id },
      );
      booking.venue_name = venueRes?.rentable_venues_by_pk?.name || "Venue";
    }

    if (booking) {
      return { type: "ticket", data: booking };
    }
    return null;
  });

const GET_VENUE_BOOKING = `
  query GetVenueBooking($id: uuid!) {
    venue_bookings_by_pk(id: $id) {
      id
      tickets_data
    }
  }
`;

const UPDATE_VENUE_BOOKING_TICKETS = `
  mutation UpdateVenueBookingTickets($id: uuid!, $tickets_data: jsonb!) {
    update_venue_bookings_by_pk(pk_columns: {id: $id}, _set: {tickets_data: $tickets_data}) {
      id
    }
  }
`;

export const updateTicketStatus = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { booking_id, ticket_id, new_status } = ctx.data;
    if (!booking_id || !ticket_id || !new_status) throw new Error("Missing parameters");

    const getRes = await hasuraRequest<{ venue_bookings_by_pk: any }>(GET_VENUE_BOOKING, {
      id: booking_id,
    });
    const booking = getRes.venue_bookings_by_pk;
    if (!booking) throw new Error("Booking not found");

    const tickets_data = booking.tickets_data;
    if (!tickets_data || !tickets_data.issued) throw new Error("No tickets found in booking");

    const ticketIndex = tickets_data.issued.findIndex((t: any) => t.id === ticket_id);
    if (ticketIndex === -1) throw new Error("Ticket not found");

    tickets_data.issued[ticketIndex].status = new_status;

    await hasuraRequest(UPDATE_VENUE_BOOKING_TICKETS, {
      id: booking_id,
      tickets_data,
    });

    return { success: true };
  });
