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
