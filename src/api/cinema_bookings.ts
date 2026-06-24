import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

// ─── Queries ────────────────────────────────────────────────────────────────

const GET_CINEMA_BOOKINGS = `
  query GetCinemaBookings($cinema_id: uuid!, $limit: Int = 50, $offset: Int = 0) {
    cinema_bookings(
      where: { cinema_id: { _eq: $cinema_id } }
      order_by: { created_at: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      cinema_id
      schedule_id
      ticket_tier_id
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
        id
        show_date
        start_time
        movie {
          id
          title
          cover_url
        }
        screen {
          id
          name
        }
      }
      ticket_tier {
        id
        name
        type
        price
      }
    }
  }
`;

const GET_CINEMA_BOOKING_BY_ID = `
  query GetCinemaBookingById($id: uuid!) {
    cinema_bookings_by_pk(id: $id) {
      id
      cinema_id
      schedule_id
      ticket_tier_id
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
        id
        show_date
        start_time
        movie {
          id
          title
          cover_url
        }
        screen {
          id
          name
        }
      }
      ticket_tier {
        id
        name
        type
        price
      }
    }
  }
`;

// ─── Mutations ───────────────────────────────────────────────────────────────

const GET_CINEMA_STATS = `
  query GetCinemaStats($cinema_id: uuid!) {
    cinema_bookings_aggregate(where: { cinema_id: { _eq: $cinema_id }, status: { _neq: "cancelled" } }) {
      aggregate {
        sum {
          quantity
          total_price
        }
      }
    }
    today_bookings: cinema_bookings_aggregate(
      where: { 
        cinema_id: { _eq: $cinema_id }, 
        status: { _neq: "cancelled" },
        created_at: { _gte: "today" } 
      }
    ) {
      aggregate {
        sum {
          quantity
        }
      }
    }
  }
`;

const GET_CINEMA_CHART_DATA = `
  query GetCinemaChartData($cinema_id: uuid!) {
    cinema_bookings(
      where: { cinema_id: { _eq: $cinema_id }, status: { _neq: "cancelled" } }
      order_by: { created_at: asc }
    ) {
      created_at
      total_price
      quantity
    }
  }
`;

export const getCinemaBookings = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { cinema_id, limit = 50, offset = 0 } = ctx.data;
    if (!cinema_id) throw new Error("cinema_id is required");
    const res = await hasuraRequest<{ cinema_bookings: any[] }>(GET_CINEMA_BOOKINGS, {
      cinema_id,
      limit,
      offset,
    });
    return res.cinema_bookings;
  });

export const getCinemaStats = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { cinema_id } = ctx.data;
    if (!cinema_id) throw new Error("cinema_id is required");

    // We replace 'today' with actual ISO string for midnight UTC
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const query = GET_CINEMA_STATS.replace('"today"', `"${todayISO}"`);

    const res = await hasuraRequest<any>(query, {
      cinema_id,
    });

    return {
      total_quantity: res.cinema_bookings_aggregate?.aggregate?.sum?.quantity || 0,
      total_revenue: res.cinema_bookings_aggregate?.aggregate?.sum?.total_price || 0,
      today_quantity: res.today_bookings?.aggregate?.sum?.quantity || 0,
    };
  });

export const getCinemaChartData = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { cinema_id } = ctx.data;
    if (!cinema_id) throw new Error("cinema_id is required");

    const res = await hasuraRequest<{ cinema_bookings: any[] }>(GET_CINEMA_CHART_DATA, {
      cinema_id,
    });

    return res.cinema_bookings;
  });

export const getCinemaBookingById = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { id } = ctx.data;
    if (!id) throw new Error("id is required");
    const res = await hasuraRequest<{ cinema_bookings_by_pk: any }>(GET_CINEMA_BOOKING_BY_ID, {
      id,
    });
    return res.cinema_bookings_by_pk;
  });

export const createCinemaBooking = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { object } = ctx.data;

    // We need to increment the booked_seats for the schedule.
    // Hasura doesn't easily do a nested update during an insert, so we'll do both via a multi-query string.

    // Generate a simple unique QR code number
    const qrcode_number = `CBK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const objWithQr = {
      ...object,
      qrcode_number,
    };

    const CREATE_AND_UPDATE = `
      mutation CreateCinemaBooking($object: cinema_bookings_insert_input!, $schedule_id: uuid!, $qty: Int!, $ticket_tier_id: uuid) {
        insert_cinema_bookings_one(object: $object) {
          id
          qrcode_number
        }
        update_cinema_schedules_by_pk(
          pk_columns: { id: $schedule_id },
          _inc: { booked_seats: $qty }
        ) {
          id
        }
        update_cinema_schedule_ticket_tiers(
          where: { schedule_id: { _eq: $schedule_id }, ticket_tier_id: { _eq: $ticket_tier_id } },
          _inc: { sold_seats: $qty }
        ) {
          affected_rows
        }
      }
    `;

    const res = await hasuraRequest<{ insert_cinema_bookings_one: { id: string; qrcode_number: string } }>(
      CREATE_AND_UPDATE,
      {
        object: objWithQr,
        schedule_id: object.schedule_id,
        qty: object.quantity || 1,
        ticket_tier_id: object.ticket_tier_id || null,
      },
    );

    if (object.status === "Confirmed" && parseFloat(object.total_price || "0") > 0) {
      try {
        const cinemaRes = await hasuraRequest<{ cinemas_by_pk: { workspace_id: string } }>(
          `query GetCinemaWorkspace($id: uuid!) { cinemas_by_pk(id: $id) { workspace_id } }`,
          { id: object.cinema_id },
        );
        const workspace_id = cinemaRes?.cinemas_by_pk?.workspace_id;
        if (workspace_id) {
          const { addMoneyToWorkspaceWallet } = await import("./wallet");
          await addMoneyToWorkspaceWallet({
            data: { workspace_id, amount: parseFloat(object.total_price) },
          } as any);
        }
      } catch (e) {
        console.error("Failed to update wallet for cinema booking:", e);
      }
    }

    return res.insert_cinema_bookings_one;
  });
