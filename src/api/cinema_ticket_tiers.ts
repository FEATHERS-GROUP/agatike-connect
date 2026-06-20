import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

// ─── Queries ────────────────────────────────────────────────────────────────

const GET_TICKET_TIERS = `
  query GetCinemaTicketTiers($workspace_id: uuid!) {
    cinema_ticket_tiers(
      where: { workspace_id: { _eq: $workspace_id } }
      order_by: { created_at: desc }
    ) {
      id
      workspace_id
      name
      description
      type
      price
      currency
      includes_glasses
      is_kids
      is_vip
      is_3d
      is_imax
      extras
      status
      created_at
    }
  }
`;

const GET_TICKET_TIER_BY_ID = `
  query GetCinemaTicketTierById($id: uuid!) {
    cinema_ticket_tiers_by_pk(id: $id) {
      id
      workspace_id
      name
      description
      type
      price
      currency
      includes_glasses
      is_kids
      is_vip
      is_3d
      is_imax
      extras
      status
      created_at
    }
  }
`;

// ─── Mutations ───────────────────────────────────────────────────────────────

const CREATE_TICKET_TIER = `
  mutation CreateCinemaTicketTier($object: cinema_ticket_tiers_insert_input!) {
    insert_cinema_ticket_tiers_one(object: $object) {
      id
    }
  }
`;

const UPDATE_TICKET_TIER = `
  mutation UpdateCinemaTicketTier($id: uuid!, $object: cinema_ticket_tiers_set_input!) {
    update_cinema_ticket_tiers_by_pk(pk_columns: { id: $id }, _set: $object) {
      id
    }
  }
`;

const DELETE_TICKET_TIER = `
  mutation DeleteCinemaTicketTier($id: uuid!) {
    delete_cinema_ticket_tiers_by_pk(id: $id) {
      id
    }
  }
`;

const UNLINK_TIER_FROM_CINEMA = `
  mutation UnlinkTierFromCinema($cinema_id: uuid!, $ticket_tier_id: uuid!) {
    delete_cinema_schedule_ticket_tiers(
      where: {
        ticket_tier_id: { _eq: $ticket_tier_id },
        schedule: { cinema_id: { _eq: $cinema_id } }
      }
    ) {
      affected_rows
    }
  }
`;

// ─── Server Functions ────────────────────────────────────────────────────────

export const getCinemaTicketTiers = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { workspace_id } = ctx.data;
    if (!workspace_id) throw new Error("workspace_id is required");
    const res = await hasuraRequest<{ cinema_ticket_tiers: any[] }>(GET_TICKET_TIERS, {
      workspace_id,
    });
    return res.cinema_ticket_tiers;
  });

export const getCinemaTicketTierById = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { id } = ctx.data;
    if (!id) throw new Error("id is required");
    const res = await hasuraRequest<{ cinema_ticket_tiers_by_pk: any }>(GET_TICKET_TIER_BY_ID, {
      id,
    });
    return res.cinema_ticket_tiers_by_pk;
  });

export const createCinemaTicketTier = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ insert_cinema_ticket_tiers_one: { id: string } }>(
      CREATE_TICKET_TIER,
      { object: ctx.data },
    );
    return res.insert_cinema_ticket_tiers_one;
  });

export const updateCinemaTicketTier = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { id, ...updates } = ctx.data;
    if (!id) throw new Error("id is required");
    const res = await hasuraRequest<{ update_cinema_ticket_tiers_by_pk: { id: string } }>(
      UPDATE_TICKET_TIER,
      { id, object: updates },
    );
    return res.update_cinema_ticket_tiers_by_pk;
  });

export const deleteCinemaTicketTier = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { id } = ctx.data;
    if (!id) throw new Error("id is required");
    const res = await hasuraRequest<{ delete_cinema_ticket_tiers_by_pk: { id: string } }>(
      DELETE_TICKET_TIER,
      { id },
    );
    return res.delete_cinema_ticket_tiers_by_pk;
  });

export const unlinkTierFromCinema = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { cinema_id, ticket_tier_id } = ctx.data;
    const res = await hasuraRequest<{ delete_cinema_schedule_ticket_tiers: { affected_rows: number } }>(
      UNLINK_TIER_FROM_CINEMA,
      { cinema_id, ticket_tier_id }
    );
    return res.delete_cinema_schedule_ticket_tiers;
  });
