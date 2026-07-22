import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

export const getScheduledServices = createServerFn({ method: "POST" })
  .validator((d: { startDate: string; endDate: string }) => d)
  .handler(async (ctx) => {
    const { startDate, endDate } = ctx.data;

    const query = `
      query GetScheduledServices($startDate: timestamptz!, $endDate: timestamptz!, $dateStart: date!, $dateEnd: date!) {
        events(
          where: { schedules: { start_date: { _gte: $dateStart, _lte: $dateEnd } } },
          order_by: { created_at: asc }
        ) {
          id
          title
          created_at
          cover
          schedules(limit: 1, order_by: { start_date: asc }) {
            start_date
          }
          workspaces {
            organizer {
              name
            }
          }
          event_tickets {
            name
            cost
          }
          event_attendees_aggregate {
            aggregate {
              count
            }
          }
        }

        cinema_schedules(
          where: { show_date: { _gte: $dateStart, _lte: $dateEnd } },
          order_by: { show_date: asc, start_time: asc }
        ) {
          id
          show_date
          start_time
          base_price
          movie {
            title
            cover_url
          }
          cinema {
            name
            city
            workspaces {
              organizer {
                name
              }
            }
          }
          ticket_tiers {
            price_override
            ticket_tier {
              name
            }
          }
        }
        
        event_posts(
          where: { created_at: { _gte: $startDate, _lte: $endDate } },
          order_by: { created_at: asc }
        ) {
          id
          content
          created_at
          media_urls
          event_id
          workspace {
            organizer {
              name
            }
          }
        }
        
        venue_bookings(
          where: { start_time: { _gte: $startDate, _lte: $endDate } },
          order_by: { start_time: asc }
        ) {
          id
          start_time
          end_time
          venue_name
          amount
          status
          customer_name
          number_of_attendees
          booking_type
          workspace {
            organizer {
              name
            }
          }
        }
      }
    `;

    // cinema_schedules uses `date` type in Hasura, while events use `timestamptz`.
    // We pass both formats.
    const dateStart = startDate.split("T")[0];
    const dateEnd = endDate.split("T")[0];

    try {
      const data = await hasuraRequest<{
        events: any[];
        cinema_schedules: any[];
        event_posts: any[];
        venue_bookings: any[];
      }>(query, { startDate, endDate, dateStart, dateEnd });

      // Transform into a unified timeline
      const unifiedTimeline: any[] = [];

      (data.events || []).forEach((e) => {
        unifiedTimeline.push({
          id: e.id,
          type: "Event",
          title: e.title,
          date: e.schedules?.[0]?.start_date || e.created_at,
          location: "See details",
          organizer: e.workspaces?.organizer?.name || "Unknown",
          coverUrl: e.cover,
          ticketTiers: e.event_tickets?.map((t: any) => ({ name: t.name, price: t.cost })) || [],
          bookings: e.event_attendees_aggregate?.aggregate?.count || 0,
        });
      });

      (data.cinema_schedules || []).forEach((c) => {
        // Combine show_date and start_time to make a valid date string
        const datetimeStr = `${c.show_date}T${c.start_time}`;
        unifiedTimeline.push({
          id: c.id,
          type: "Cinema",
          title: c.movie?.title || "Movie Screening",
          date: datetimeStr,
          location: c.cinema?.name ? `${c.cinema.name} (${c.cinema.city || ""})` : "TBA",
          organizer: c.cinema?.workspaces?.organizer?.name || "Unknown",
          coverUrl: c.movie?.cover_url,
          ticketTiers: c.ticket_tiers?.map((t: any) => ({
            name: t.ticket_tier?.name || "General",
            price: t.price_override || c.base_price,
          })) || [{ name: "General", price: c.base_price }],
          bookings: 0,
        });
      });

      (data.event_posts || []).forEach((p) => {
        // media_urls might be a JSON array or a string depending on Hasura
        let cover = null;
        if (p.media_urls && Array.isArray(p.media_urls)) {
          cover = p.media_urls[0];
        } else if (typeof p.media_urls === "string") {
          try {
            cover = JSON.parse(p.media_urls)[0];
          } catch (e) {
            cover = p.media_urls;
          }
        }

        unifiedTimeline.push({
          id: p.id,
          type: "Experience",
          title: p.content ? `Experience: ${p.content.substring(0, 30)}...` : "Platform Experience",
          date: p.created_at,
          location: "Virtual / Platform",
          organizer: p.workspace?.organizer?.name || "Unknown",
          coverUrl: cover,
          ticketTiers: [],
          bookings: 0,
        });
      });

      (data.venue_bookings || []).forEach((b) => {
        unifiedTimeline.push({
          id: b.id,
          type: "Venue Booking",
          title: `${b.booking_type || "Booking"} for ${b.customer_name}`,
          date: b.start_time,
          location: b.venue_name || "Unknown Venue",
          organizer: b.workspace?.organizer?.name || "Unknown",
          coverUrl: null,
          ticketTiers: [{ name: "Total Amount", price: b.amount || 0 }],
          bookings: b.number_of_attendees || 1,
        });
      });

      // Sort chronological
      unifiedTimeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return { items: unifiedTimeline };
    } catch (error: any) {
      console.error("Admin Services Error:", error);
      throw new Error("Failed to fetch scheduled services");
    }
  });

export const getServiceAttendees = createServerFn({ method: "POST" })
  .validator((d: { type: string; id: string }) => d)
  .handler(async (ctx) => {
    const { type, id } = ctx.data;

    try {
      if (type === "Event") {
        const query = `
          query GetEventAttendees($event_id: uuid!) {
            event_attendees(where: { event_id: { _eq: $event_id } }, order_by: { created_at: desc }) {
              id
              names
              email
              ticket_type
              status
            }
          }
        `;
        const data = await hasuraRequest<{ event_attendees: any[] }>(query, { event_id: id });
        return data.event_attendees.map((a) => ({
          id: a.id,
          name: a.names || "Unknown",
          email: a.email || "No email",
          ticketTier: a.ticket_type || "General",
          status: a.status || "Confirmed",
        }));
      } else if (type === "Cinema") {
        // For cinema schedules, bookings are in cinema_bookings
        const query = `
          query GetCinemaBookings($schedule_id: uuid!) {
            cinema_bookings(where: { schedule_id: { _eq: $schedule_id } }, order_by: { created_at: desc }) {
              id
              user_name
              user_email
              ticket_type
              status
            }
          }
        `;
        const data = await hasuraRequest<{ cinema_bookings: any[] }>(query, { schedule_id: id });
        return data.cinema_bookings.map((b) => ({
          id: b.id,
          name: b.user_name || "Unknown",
          email: b.user_email || "No email",
          ticketTier: b.ticket_type || "General",
          status: b.status || "Confirmed",
        }));
      }
      return [];
    } catch (error: any) {
      console.error("Error fetching attendees:", error);
      throw new Error("Failed to fetch attendees");
    }
  });
