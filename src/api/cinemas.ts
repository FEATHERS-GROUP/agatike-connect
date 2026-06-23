import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

// ─── Queries ─────────────────────────────────────────────────────────────────

const GET_CINEMAS = `
  query GetCinemas($workspace_id: uuid!) {
    cinemas(
      where: { workspace_id: { _eq: $workspace_id } }
      order_by: { created_at: desc }
    ) {
      id
      workspace_id
      name
      description
      city
      address
      country
      latitude
      longitude
      cover_url
      logo_url
      phone
      email
      website
      status
      created_at
      screens_aggregate {
        aggregate { count }
      }
      movies_aggregate {
        aggregate { count }
      }
    }
  }
`;

const GET_CINEMA_BY_ID = `
  query GetCinemaById($id: uuid!) {
    cinemas_by_pk(id: $id) {
      id
      workspace_id
      name
      description
      city
      address
      country
      latitude
      longitude
      cover_url
      logo_url
      phone
      email
      website
      socials
      settings
      status
      created_at
      screens {
        id
        name
        screen_type
        capacity
        has_3d
        has_imax
        status
      }
      schedules(order_by: { show_date: asc }) {
        id
        show_date
        start_time
        status
        movie { id title cover_url }
        screen { id name }
        ticket_tiers {
          id
          price_override
          currency
          ticket_tier {
            id
            name
            type
            price
            currency
          }
        }
      }
    }
  }
`;

const GET_PUBLIC_MOVIE_SCHEDULES = `
  query GetPublicMovieSchedules($date: date!) {
    cinema_schedules(
      where: { show_date: { _gte: $date } }
      order_by: { show_date: asc, start_time: asc }
    ) {
      id
      show_date
      start_time
      base_price
      cinema {
        id
        name
        city
        cover_url
        logo_url
        workspace_id
      }
      movie {
        id
        title
        genre
        duration_minutes
        rating
        cover_url
        synopsis
      }
      ticket_tiers {
        id
        price_override
        ticket_tier {
          id
          name
          price
        }
      }
    }
  }
`;

// ─── Mutations ────────────────────────────────────────────────────────────────

const CREATE_CINEMA = `
  mutation CreateCinema($object: cinemas_insert_input!) {
    insert_cinemas_one(object: $object) {
      id
      name
    }
  }
`;

const UPDATE_CINEMA = `
  mutation UpdateCinema($id: uuid!, $object: cinemas_set_input!) {
    update_cinemas_by_pk(pk_columns: { id: $id }, _set: $object) {
      id
    }
  }
`;

const DELETE_CINEMA = `
  mutation DeleteCinema($id: uuid!) {
    delete_cinemas_by_pk(id: $id) {
      id
    }
  }
`;

// ─── Server Functions ─────────────────────────────────────────────────────────

export const getCinemas = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { workspace_id } = ctx.data;
    if (!workspace_id) throw new Error("workspace_id is required");
    const res = await hasuraRequest<{ cinemas: any[] }>(GET_CINEMAS, { workspace_id });
    return res.cinemas;
  });

export const getCinemaById = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { id } = ctx.data;
    if (!id) throw new Error("id is required");
    const res = await hasuraRequest<{ cinemas_by_pk: any }>(GET_CINEMA_BY_ID, { id });
    return res.cinemas_by_pk;
  });

export const createCinema = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ insert_cinemas_one: { id: string; name: string } }>(
      CREATE_CINEMA,
      { object: ctx.data },
    );
    return res.insert_cinemas_one;
  });

export const updateCinema = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { id, ...updates } = ctx.data;
    if (!id) throw new Error("id is required");
    const res = await hasuraRequest<{ update_cinemas_by_pk: { id: string } }>(UPDATE_CINEMA, {
      id,
      object: updates,
    });
    return res.update_cinemas_by_pk;
  });

export const deleteCinema = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { id } = ctx.data;
    if (!id) throw new Error("id is required");
    const res = await hasuraRequest<{ delete_cinemas_by_pk: { id: string } }>(DELETE_CINEMA, {
      id,
    });
    return res.delete_cinemas_by_pk;
  });

export const getPublicMovieSchedules = createServerFn({ method: "POST" }).handler(async () => {
  // Get local date string YYYY-MM-DD
  const date = new Date().toISOString().split("T")[0];
  const res = await hasuraRequest<any>(GET_PUBLIC_MOVIE_SCHEDULES, { date });
  const schedules = res.cinema_schedules || [];

  // Fetch workspaces to get currency
  const workspaceRes = await hasuraRequest<{ workspaces: any[] }>(`
      query GetWorkspacesForSchedules {
        workspaces {
          id
          currency
        }
      }
    `);
  const workspaces = workspaceRes.workspaces || [];
  const workspaceMap = new Map(workspaces.map((w) => [w.id, w]));

  return schedules.map((s: any) => {
    const workspace = workspaceMap.get(s.cinema?.workspace_id);
    return {
      ...s,
      currency: workspace?.currency || "RWF",
    };
  });
});

const GET_MOVIE_SCHEDULES_BY_MOVIE_ID = `
  query GetMovieSchedulesByMovieId($movie_id: uuid!, $cinema_id: uuid!, $date: date!) {
    cinema_schedules(
      where: { movie_id: { _eq: $movie_id }, cinema_id: { _eq: $cinema_id }, show_date: { _gte: $date } }
      order_by: { show_date: asc, start_time: asc }
    ) {
      id
      show_date
      start_time
      base_price
      cinema {
        id
        name
        city
        cover_url
        logo_url
        workspace_id
      }
      movie {
        id
        title
        genre
        duration_minutes
        rating
        cover_url
        synopsis
      }
      ticket_tiers {
        id
        price_override
        ticket_tier {
          id
          name
          price
        }
      }
    }
  }
`;

export const getMovieSchedulesByMovieId = createServerFn({ method: "POST" })
  .inputValidator((d: { movieId: string; cinemaId: string }) => d)
  .handler(async (ctx) => {
    const { movieId, cinemaId } = ctx.data;
    const date = new Date().toISOString().split("T")[0];
    const res = await hasuraRequest<any>(GET_MOVIE_SCHEDULES_BY_MOVIE_ID, {
      movie_id: movieId,
      cinema_id: cinemaId,
      date,
    });
    const schedules = res.cinema_schedules || [];

    // Fetch workspaces to get currency
    const workspaceRes = await hasuraRequest<{ workspaces: any[] }>(`
      query GetWorkspacesForMovieSchedules {
        workspaces {
          id
          currency
        }
      }
    `);
    const workspaces = workspaceRes.workspaces || [];
    const workspaceMap = new Map(workspaces.map((w) => [w.id, w]));

    return schedules.map((s: any) => {
      const workspace = workspaceMap.get(s.cinema?.workspace_id);
      return {
        ...s,
        currency: workspace?.currency || "RWF",
      };
    });
  });
