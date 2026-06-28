import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

// ─── SCREENS ──────────────────────────────────────────────────────────────────

const GET_SCREENS = `
  query GetScreens($cinema_id: uuid!) {
    cinema_screens(
      where: { cinema_id: { _eq: $cinema_id } }
      order_by: { name: asc }
    ) {
      id
      cinema_id
      name
      screen_type
      capacity
      has_3d
      has_imax
      has_dolby
      has_4dx
      status
      created_at
    }
  }
`;

const CREATE_SCREEN = `
  mutation CreateScreen($object: cinema_screens_insert_input!) {
    insert_cinema_screens_one(object: $object) {
      id
    }
  }
`;

const UPDATE_SCREEN = `
  mutation UpdateScreen($id: uuid!, $object: cinema_screens_set_input!) {
    update_cinema_screens_by_pk(pk_columns: { id: $id }, _set: $object) {
      id
    }
  }
`;

const DELETE_SCREEN = `
  mutation DeleteScreen($id: uuid!) {
    delete_cinema_screens_by_pk(id: $id) {
      id
    }
  }
`;

// ─── MOVIES (GLOBAL) ─────────────────────────────────────────────────────────

const GET_MOVIES = `
  query GetMovies($workspace_id: uuid!) {
    cinema_movies(
      where: { workspace_id: { _eq: $workspace_id } }
      order_by: { created_at: desc }
    ) {
      id
      workspace_id
      title
      synopsis
      genre
      duration_minutes
      release_date
      cover_url
      trailer_url
      rating
      language
      director
      distributor
      is_3d
      is_imax
      status
      created_at
    }
  }
`;

const CREATE_MOVIE = `
  mutation CreateMovie($object: cinema_movies_insert_input!) {
    insert_cinema_movies_one(object: $object) {
      id
    }
  }
`;

const UPDATE_MOVIE = `
  mutation UpdateMovie($id: uuid!, $object: cinema_movies_set_input!) {
    update_cinema_movies_by_pk(pk_columns: { id: $id }, _set: $object) {
      id
    }
  }
`;

const DELETE_MOVIE = `
  mutation DeleteMovie($id: uuid!) {
    delete_cinema_movies_by_pk(id: $id) {
      id
    }
  }
`;

// ─── CINEMA MOVIES (JUNCTION) ────────────────────────────────────────────────

const GET_CINEMA_MOVIES = `
  query GetCinemaMovies($cinema_id: uuid!) {
    cinema_movie_cinemas(where: { cinema_id: { _eq: $cinema_id } }) {
      id
      status
      movie {
        id
        title
        synopsis
        duration_minutes
        cover_url
        rating
        genre
      }
    }
  }
`;

const LINK_MOVIE_TO_CINEMA = `
  mutation LinkMovieToCinema($cinema_id: uuid!, $movie_id: uuid!, $status: String!) {
    insert_cinema_movie_cinemas_one(
      object: { cinema_id: $cinema_id, movie_id: $movie_id, status: $status }
      on_conflict: { constraint: cinema_movie_cinemas_cinema_id_movie_id_key, update_columns: [status] }
    ) {
      id
    }
  }
`;

const UNLINK_MOVIE_FROM_CINEMA = `
  mutation UnlinkMovieFromCinema($cinema_id: uuid!, $movie_id: uuid!) {
    delete_cinema_movie_cinemas(
      where: { cinema_id: { _eq: $cinema_id }, movie_id: { _eq: $movie_id } }
    ) {
      affected_rows
    }
  }
`;

// ─── SCHEDULES ───────────────────────────────────────────────────────────────

const GET_SCHEDULES = `
  query GetSchedules($cinema_id: uuid!) {
    cinema_schedules(
      where: { cinema_id: { _eq: $cinema_id } }
      order_by: { show_date: asc, start_time: asc }
    ) {
      id
      cinema_id
      screen_id
      movie_id
      show_date
      start_time
      end_time
      language
      subtitles
      is_premiere
      is_3d
      is_imax
      base_price
      currency
      total_seats
      booked_seats
      status
      movie {
        id
        title
        cover_url
        duration_minutes
        genre
        rating
      }
      screen {
        id
        name
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

const CREATE_SCHEDULE = `
  mutation CreateSchedule($object: cinema_schedules_insert_input!) {
    insert_cinema_schedules_one(object: $object) {
      id
    }
  }
`;

const DELETE_SCHEDULE = `
  mutation DeleteSchedule($id: uuid!) {
    delete_cinema_schedules_by_pk(id: $id) {
      id
    }
  }
`;

// ─── SERVER FUNCTIONS ────────────────────────────────────────────────────────

// Screens
export const getScreens = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ cinema_screens: any[] }>(GET_SCREENS, {
      cinema_id: ctx.data.cinema_id,
    });
    return res.cinema_screens;
  });

export const createScreen = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ insert_cinema_screens_one: { id: string } }>(CREATE_SCREEN, {
      object: ctx.data,
    });
    return res.insert_cinema_screens_one;
  });

export const updateScreen = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { id, ...updates } = ctx.data;
    const res = await hasuraRequest<{ update_cinema_screens_by_pk: { id: string } }>(
      UPDATE_SCREEN,
      { id, object: updates },
    );
    return res.update_cinema_screens_by_pk;
  });

export const deleteScreen = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ delete_cinema_screens_by_pk: { id: string } }>(
      DELETE_SCREEN,
      { id: ctx.data.id },
    );
    return res.delete_cinema_screens_by_pk;
  });

// Movies
export const getMovies = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ cinema_movies: any[] }>(GET_MOVIES, {
      workspace_id: ctx.data.workspace_id,
    });
    return res.cinema_movies;
  });

export const createMovie = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ insert_cinema_movies_one: { id: string } }>(CREATE_MOVIE, {
      object: ctx.data,
    });
    return res.insert_cinema_movies_one;
  });

export const updateMovie = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { id, ...updates } = ctx.data;
    const res = await hasuraRequest<{ update_cinema_movies_by_pk: { id: string } }>(UPDATE_MOVIE, {
      id,
      object: updates,
    });
    return res.update_cinema_movies_by_pk;
  });

export const deleteMovie = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ delete_cinema_movies_by_pk: { id: string } }>(DELETE_MOVIE, {
      id: ctx.data.id,
    });
    return res.delete_cinema_movies_by_pk;
  });

// Linking Movies
export const getCinemaMovies = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ cinema_movie_cinemas: any[] }>(GET_CINEMA_MOVIES, {
      cinema_id: ctx.data.cinema_id,
    });
    return res.cinema_movie_cinemas;
  });

export const linkMovieToCinema = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { cinema_id, movie_id, status } = ctx.data;
    const res = await hasuraRequest(LINK_MOVIE_TO_CINEMA, { cinema_id, movie_id, status });
    return res;
  });

export const unlinkMovieFromCinema = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { cinema_id, movie_id } = ctx.data;
    const res = await hasuraRequest(UNLINK_MOVIE_FROM_CINEMA, { cinema_id, movie_id });
    return res;
  });

// Schedules
export const getSchedules = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ cinema_schedules: any[] }>(GET_SCHEDULES, {
      cinema_id: ctx.data.cinema_id,
    });
    return res.cinema_schedules;
  });

export const createSchedule = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ insert_cinema_schedules_one: { id: string } }>(
      CREATE_SCHEDULE,
      { object: ctx.data },
    );
    return res.insert_cinema_schedules_one;
  });

export const deleteSchedule = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ delete_cinema_schedules_by_pk: { id: string } }>(
      DELETE_SCHEDULE,
      { id: ctx.data.id },
    );
    return res.delete_cinema_schedules_by_pk;
  });
