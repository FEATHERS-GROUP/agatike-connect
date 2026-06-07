import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { jsPDF } from "jspdf";
import { sendTicketsEmail } from "./email";

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
      internal_notes,
      venue_name, // Extracted here
      venue_currency
    } = ctx.data;

    let final_tickets_data = tickets_data;
    let issuedTickets: any[] = [];
    let attachments: any[] = [];

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
          used: false
        });

        try {
          const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [200, 80] });
          doc.setFillColor(248, 250, 252);
          doc.rect(0, 0, 200, 80, 'F');
          
          doc.setFontSize(24);
          doc.setTextColor(15, 23, 42);
          doc.text(venue_name || "Venue Ticket", 10, 20);

          doc.setFontSize(14);
          doc.setTextColor(71, 85, 105);
          doc.text(`Ticket Type: ${t.tier}`, 10, 40);
          doc.text(`Admit: ${t.name}`, 10, 50);

          doc.setFontSize(18);
          doc.setTextColor(242, 87, 29);
          doc.text(`Verification OTP: ${otp}`, 10, 70);

          const base64 = doc.output('datauristring').split(',')[1];
          attachments.push({
            filename: `Ticket_${t.tier.replace(/\\s+/g, '_')}_${otp}.pdf`,
            content: base64
          });
        } catch (err) {
          console.error("PDF generation failed:", err);
        }
      }

      final_tickets_data = {
        summary: tickets_data,
        issued: issuedTickets
      };
    }

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
          tickets_data: final_tickets_data,
          attendees_info,
          internal_notes
        },
      },
    );

    if (attachments.length > 0) {
      try {
        await sendTicketsEmail({
          data: {
            to: customer_email,
            customerName: customer_name,
            venueName: venue_name || "the Venue",
            attachments
          }
        });
      } catch (e) {
        console.error("Failed to send ticket email", e);
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
    const res = await hasuraRequest<{ venue_bookings: any[] }>(
      GET_VENUE_BOOKINGS,
      { venue_id }
    );
    return res.venue_bookings;
  });
