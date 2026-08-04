import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

// ── RESOURCES ──────────────────────────────────────────────────────────────

const CREATE_SPACE_RESOURCE = `
  mutation CreateSpaceResource($object: space_resources_insert_input!) {
    insert_space_resources_one(object: $object) {
      id
      space_id
      parent_resource_id
      name
      type
      capacity_people
      capacity_tables
      rules
      status
    }
  }
`;

export const createSpaceResource = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { object } = ctx.data;
    const res = await hasuraRequest<{ insert_space_resources_one: any }>(CREATE_SPACE_RESOURCE, {
      object,
    });
    return res.insert_space_resources_one;
  });

const GET_SPACE_RESOURCES = `
  query GetSpaceResources($space_id: uuid!) {
    space_resources(where: { space_id: { _eq: $space_id } }, order_by: { created_at: asc }) {
      id
      parent_resource_id
      name
      type
      capacity_people
      capacity_tables
      rules
      status
      created_at
      subscriptions {
        id
        customer_name
        status
        start_date
        end_date
      }
    }
  }
`;

export const getSpaceResources = createServerFn({ method: "POST" })
  .validator((d: { space_id: string }) => d)
  .handler(async (ctx) => {
    const { space_id } = ctx.data;
    if (!space_id) return [];
    const res = await hasuraRequest<{ space_resources: any[] }>(GET_SPACE_RESOURCES, {
      space_id,
    });
    return res.space_resources;
  });

const UPDATE_SPACE_RESOURCE = `
  mutation UpdateSpaceResource($id: uuid!, $object: space_resources_set_input!) {
    update_space_resources_by_pk(pk_columns: { id: $id }, _set: $object) {
      id
      name
      type
      capacity_people
      capacity_tables
      rules
      status
    }
  }
`;

export const updateSpaceResource = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { id, object } = ctx.data;
    const res = await hasuraRequest<{ update_space_resources_by_pk: any }>(UPDATE_SPACE_RESOURCE, {
      id,
      object,
    });
    return res.update_space_resources_by_pk;
  });

const DELETE_SPACE_RESOURCE = `
  mutation DeleteSpaceResource($id: uuid!) {
    delete_space_resources_by_pk(id: $id) {
      id
    }
  }
`;

export const deleteSpaceResource = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async (ctx) => {
    const { id } = ctx.data;
    const res = await hasuraRequest<{ delete_space_resources_by_pk: { id: string } }>(
      DELETE_SPACE_RESOURCE,
      { id },
    );
    return res.delete_space_resources_by_pk;
  });

// ── BOOKINGS ───────────────────────────────────────────────────────────────

const CREATE_SPACE_RESOURCE_BOOKING = `
  mutation CreateSpaceResourceBooking($object: space_resource_bookings_insert_input!) {
    insert_space_resource_bookings_one(object: $object) {
      id
      title
      organizer_name
      start_time
      end_time
      status
    }
  }
`;

export const createSpaceResourceBooking = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { object } = ctx.data;
    const res = await hasuraRequest<{ insert_space_resource_bookings_one: any }>(
      CREATE_SPACE_RESOURCE_BOOKING,
      { object },
    );
    return res.insert_space_resource_bookings_one;
  });

const GET_SPACE_RESOURCE_BOOKINGS = `
  query GetSpaceResourceBookings($space_id: uuid!) {
    space_resource_bookings(
      where: { resource: { space_id: { _eq: $space_id } } },
      order_by: { start_time: asc }
    ) {
      id
      resource_id
      title
      organizer_name
      customer_id
      assigned_coach_id
      start_time
      end_time
      status
      resource {
        name
        type
      }
    }
  }
`;

export const getSpaceResourceBookings = createServerFn({ method: "POST" })
  .validator((d: { space_id: string }) => d)
  .handler(async (ctx) => {
    const { space_id } = ctx.data;
    const res = await hasuraRequest<{ space_resource_bookings: any[] }>(
      GET_SPACE_RESOURCE_BOOKINGS,
      { space_id },
    );
    return res.space_resource_bookings;
  });

const UPDATE_SPACE_RESOURCE_BOOKING = `
  mutation UpdateSpaceResourceBooking($id: uuid!, $object: space_resource_bookings_set_input!) {
    update_space_resource_bookings_by_pk(pk_columns: { id: $id }, _set: $object) {
      id
      title
      start_time
      end_time
      status
    }
  }
`;

export const updateSpaceResourceBooking = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { id, object } = ctx.data;
    const res = await hasuraRequest<{ update_space_resource_bookings_by_pk: any }>(
      UPDATE_SPACE_RESOURCE_BOOKING,
      { id, object },
    );
    return res.update_space_resource_bookings_by_pk;
  });

const DELETE_SPACE_RESOURCE_BOOKING = `
  mutation DeleteSpaceResourceBooking($id: uuid!) {
    delete_space_resource_bookings_by_pk(id: $id) {
      id
    }
  }
`;

export const deleteSpaceResourceBooking = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async (ctx) => {
    const { id } = ctx.data;
    const res = await hasuraRequest<{ delete_space_resource_bookings_by_pk: { id: string } }>(
      DELETE_SPACE_RESOURCE_BOOKING,
      { id },
    );
    return res.delete_space_resource_bookings_by_pk;
  });
