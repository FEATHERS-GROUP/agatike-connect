import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getUserSession } from "./auth";

const GET_USER_EVENT_ATTENDEES = `
  query GetUserEventAttendees($user_id: uuid, $email: String!) {
    event_attendees(
      where: {
        _or: [
          { user_id: { _eq: $user_id } },
          { email: { _eq: $email } }
        ]
      },
      order_by: { created_at: desc }
    ) {
      id
      names
      email
      phone
      qrcode_number
      quanity
      status
      ticket_id
      ticket_type
      type
      created_at
      custom_fields
      events {
        id
        title
        cover
        category
        tour_stops
        event_type
        schedules {
          start_date
          end_date
        }
        workspaces {
          currency
        }
        ticket_projects(where: { deleted: { _eq: false } }) {
          id
          name
          template
          coverImage
          palette
          font
          design_overrides
          logoText
          logoScale
          logoImage
          logoColorMode
          logoOpacity
          eventId
          venueId
          tier
        }
      }
    }
  }
`;

const GET_USER_VENUE_BOOKINGS = `
  query GetUserVenueBookings($user_id: uuid, $email: String!) {
    venue_bookings(
      where: {
        _or: [
          { user_id: { _eq: $user_id } },
          { customer_email: { _eq: $email } }
        ]
      },
      order_by: { created_at: desc }
    ) {
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
      venue_id
      rentable_venue {
        id
        name
        city
        cover_url
        currency
        rental_model
        ticket_projects(where: { deleted: { _eq: false } }) {
          id
          name
          template
          coverImage
          palette
          font
          design_overrides
          logoText
          logoScale
          logoImage
          logoColorMode
          logoOpacity
          eventId
          venueId
          tier
        }
      }
    }
  }
`;

const GET_USER_CINEMA_BOOKINGS = `
  query GetUserCinemaBookings($email: String!) {
    cinema_bookings(
      where: {
        email: { _eq: $email }
      },
      order_by: { created_at: desc }
    ) {
      id
      names
      email
      phone
      quantity
      total_price
      currency
      payment_method
      status
      qrcode_number
      created_at
      schedule {
        show_date
        start_time
        movie {
          title
          cover_url
          duration_minutes
        }
        screen {
          name
        }
        cinema {
          name
          city
        }
      }
      ticket_tier {
        name
        type
        price
      }
    }
  }
`;

const getMergedProjectDesign = (baseProject: any, stopIdx: number, tierId: string) => {
  if (!baseProject) return null;
  const overrides = baseProject.design_overrides?.overrides;
  if (!overrides) return baseProject;

  const stopOverride = overrides.tourStops?.[stopIdx] || {};
  const tierOverride = overrides.tiers?.[tierId] || {};
  const combinationOverride = overrides.combinations?.[`${stopIdx}_${tierId}`] || {};

  return {
    ...baseProject,
    ...stopOverride,
    ...tierOverride,
    ...combinationOverride,
    palette:
      combinationOverride.palette ||
      tierOverride.palette ||
      stopOverride.palette ||
      baseProject.palette,
    font: combinationOverride.font || tierOverride.font || stopOverride.font || baseProject.font,
  };
};

export const getUserAllTickets = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getUserSession();
  if (!user || !user.email) {
    return [];
  }

  const userId = user.id || null;
  const email = user.email;

  const [attendeesRes, bookingsRes, cinemaRes] = await Promise.all([
    hasuraRequest<{ event_attendees: any[] }>(GET_USER_EVENT_ATTENDEES, {
      user_id: userId,
      email,
    }),
    hasuraRequest<{ venue_bookings: any[] }>(GET_USER_VENUE_BOOKINGS, {
      user_id: userId,
      email,
    }),
    hasuraRequest<{ cinema_bookings: any[] }>(GET_USER_CINEMA_BOOKINGS, {
      email,
    }),
  ]);

  const attendees = attendeesRes.event_attendees || [];
  const bookings = bookingsRes.venue_bookings || [];
  const cinemaBookings = cinemaRes.cinema_bookings || [];

  const tickets: any[] = [];

  // Map event attendees
  for (const att of attendees) {
    const event = att.events;
    const stopIdx = att.custom_fields?.tour_stop_idx ?? 0;
    const stop = event?.tour_stops?.[stopIdx] || event?.tour_stops?.[0];

    const cat = event?.category?.toLowerCase();
    let ticketCategory = "event";
    if (cat === "cinema" || cat === "movie") {
      ticketCategory = "movie";
    } else if (cat === "conferences" || cat === "conference") {
      ticketCategory = "conference";
    } else if (cat) {
      ticketCategory = cat;
    }

    const baseProject = event?.ticket_projects?.[0];
    const mergedProject = baseProject
      ? getMergedProjectDesign(baseProject, stopIdx, att.ticket_id)
      : null;
    const design = mergedProject
      ? {
          template: mergedProject.template || "default",
          palette: mergedProject.palette || null,
          font: mergedProject.font || null,
          coverImage: mergedProject.coverImage || null,
          logoText:
            mergedProject.logoText !== undefined && mergedProject.logoText !== null
              ? mergedProject.logoText
              : null,
          logoScale: mergedProject.logoScale ? Number(mergedProject.logoScale) : null,
          logoImage: mergedProject.logoImage || null,
          logoColorMode: mergedProject.logoColorMode || null,
          logoOpacity:
            mergedProject.logoOpacity !== undefined && mergedProject.logoOpacity !== null
              ? Number(mergedProject.logoOpacity)
              : null,
          layout: mergedProject.design_overrides?.layout || null,
          back: mergedProject.design_overrides?.back || null,
        }
      : null;

    tickets.push({
      id: att.id,
      title: event?.title || "Event Ticket",
      cover: event?.cover || "/afrobeats_night.png",
      date: stop?.date || event?.tour_stops?.[0]?.date || "Date TBA",
      time: stop?.time || event?.tour_stops?.[0]?.time || "Time TBA",
      seat: att.names || "General Admission",
      passengerName: att.names || user.username || "Guest",
      passengerProfile: user.profile || null,
      orderId: att.qrcode_number,
      ticketType: att.ticket_type || "Standard",
      ticketCategory,
      price: 0,
      isVenueBooking: false,
      status: att.status || "Confirmed",
      eventDate: stop?.date || event?.schedules?.[0]?.start_date || att.created_at,
      design,
    });
  }

  // Map venue bookings
  for (const booking of bookings) {
    const venue = booking.rentable_venue;
    const venueName = venue?.name || "Venue Booking";
    const coverUrl = venue?.cover_url || "/venues.png";
    const city = venue?.city || "Unknown City";

    // Venue booking could have multiple tickets issued inside tickets_data.issued
    const issuedTickets = booking.tickets_data?.issued || [];
    const baseProject = venue?.ticket_projects?.[0];

    if (issuedTickets.length > 0) {
      for (const t of issuedTickets) {
        const mergedProject = baseProject
          ? getMergedProjectDesign(baseProject, 0, t.tier || "")
          : null;
        const design = mergedProject
          ? {
              template: mergedProject.template || "default",
              palette: mergedProject.palette || null,
              font: mergedProject.font || null,
              coverImage: mergedProject.coverImage || null,
              logoText:
                mergedProject.logoText !== undefined && mergedProject.logoText !== null
                  ? mergedProject.logoText
                  : null,
              logoScale: mergedProject.logoScale ? Number(mergedProject.logoScale) : null,
              logoImage: mergedProject.logoImage || null,
              logoColorMode: mergedProject.logoColorMode || null,
              logoOpacity:
                mergedProject.logoOpacity !== undefined && mergedProject.logoOpacity !== null
                  ? Number(mergedProject.logoOpacity)
                  : null,
              layout: mergedProject.design_overrides?.layout || null,
              back: mergedProject.design_overrides?.back || null,
            }
          : null;

        tickets.push({
          id: t.id,
          bookingId: booking.id,
          title: venueName,
          cover: coverUrl,
          date: new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }).format(new Date(booking.start_time)),
          time: new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(new Date(booking.start_time)),
          seat: t.attendee_name || booking.customer_name || "Guest",
          passengerName: t.attendee_name || booking.customer_name || user.username || "Guest",
          passengerProfile: user.profile || null,
          orderId: t.otp || booking.id.substring(0, 8),
          ticketType: t.tier || "Standard Entry",
          ticketCategory: venue?.rental_model === "ENTRANCE_ONLY" ? "entrance" : "venue",
          price: booking.amount,
          isVenueBooking: true,
          status: t.status || booking.status || "Confirmed",
          eventDate: booking.start_time,
          venueName,
          city,
          design,
        });
      }
    } else {
      const mergedProject = baseProject ? getMergedProjectDesign(baseProject, 0, "") : null;
      const design = mergedProject
        ? {
            template: mergedProject.template || "default",
            palette: mergedProject.palette || null,
            font: mergedProject.font || null,
            coverImage: mergedProject.coverImage || null,
            logoText:
              mergedProject.logoText !== undefined && mergedProject.logoText !== null
                ? mergedProject.logoText
                : null,
            logoScale: mergedProject.logoScale ? Number(mergedProject.logoScale) : null,
            logoImage: mergedProject.logoImage || null,
            logoColorMode: mergedProject.logoColorMode || null,
            logoOpacity:
              mergedProject.logoOpacity !== undefined && mergedProject.logoOpacity !== null
                ? Number(mergedProject.logoOpacity)
                : null,
            layout: mergedProject.design_overrides?.layout || null,
            back: mergedProject.design_overrides?.back || null,
          }
        : null;

      tickets.push({
        id: booking.id,
        bookingId: booking.id,
        title: venueName,
        cover: coverUrl,
        date: new Intl.DateTimeFormat("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }).format(new Date(booking.start_time)),
        time: new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date(booking.start_time)),
        seat: booking.customer_name || "Guest",
        passengerName: booking.customer_name || user.username || "Guest",
        passengerProfile: user.profile || null,
        orderId: booking.id.substring(0, 8),
        ticketType: "Standard Entry",
        ticketCategory: venue?.rental_model === "ENTRANCE_ONLY" ? "entrance" : "venue",
        price: booking.amount,
        isVenueBooking: true,
        status: booking.status || "Confirmed",
        eventDate: booking.start_time,
        venueName,
        city,
        design,
      });
    }
  }

  // Map cinema bookings
  for (const booking of cinemaBookings) {
    const venueName = booking.schedule?.cinema?.name || "Cinema";
    const city = booking.schedule?.cinema?.city || "Unknown City";
    const coverUrl = booking.schedule?.movie?.cover_url || "/venues.png";
    const screenName = booking.schedule?.screen?.name || "Main Screen";
    const duration = booking.schedule?.movie?.duration_minutes
      ? `${Math.floor(booking.schedule.movie.duration_minutes / 60)}h ${booking.schedule.movie.duration_minutes % 60}m`
      : "2h 0m";

    tickets.push({
      id: booking.id,
      bookingId: booking.id,
      title: booking.schedule?.movie?.title || "Movie Ticket",
      cover: coverUrl,
      date: booking.schedule?.show_date ? new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(new Date(booking.schedule.show_date)) : "TBA",
      time: booking.schedule?.start_time ? booking.schedule.start_time.substring(0, 5) : "TBA",
      duration,
      seat: booking.names || "Guest",
      passengerName: booking.names || user.username || "Guest",
      passengerProfile: user.profile || null,
      orderId: booking.qrcode_number || booking.id.substring(0, 8),
      ticketType: booking.ticket_tier?.name || "Standard",
      ticketCategory: "movie",
      price: booking.total_price,
      quantity: booking.quantity || 1,
      isVenueBooking: false,
      status: booking.status || "Confirmed",
      eventDate: booking.schedule?.show_date || booking.created_at,
      venueName,
      cinema: venueName,
      screen: screenName,
      city,
      design: null,
    });
  }

  return tickets;
});
