import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

// ── CLASSES ────────────────────────────────────────────────────────────────

const GET_SPACE_CLASSES = `
  query GetSpaceClasses($space_id: uuid!) {
    space_classes(where: { space_id: { _eq: $space_id } }, order_by: { created_at: asc }) {
      id
      space_id
      name
      description
      duration_minutes
      max_capacity
      price
      is_free_with_subscription
      allowed_plan_names
      cover_url
      status
      instructor_id
      created_at
    }
  }
`;

export const getSpaceClasses = createServerFn({ method: "POST" })
  .validator((d: { space_id: string }) => d)
  .handler(async (ctx) => {
    const { space_id } = ctx.data;
    const res = await hasuraRequest<{ space_classes: any[] }>(GET_SPACE_CLASSES, { space_id });
    return res.space_classes;
  });

const CREATE_SPACE_CLASS = `
  mutation CreateSpaceClass($object: space_classes_insert_input!) {
    insert_space_classes_one(object: $object) {
      id name description duration_minutes max_capacity price is_free_with_subscription status instructor_id
    }
  }
`;

export const createSpaceClass = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ insert_space_classes_one: any }>(CREATE_SPACE_CLASS, {
      object: ctx.data.object,
    });
    return res.insert_space_classes_one;
  });

const UPDATE_SPACE_CLASS = `
  mutation UpdateSpaceClass($id: uuid!, $object: space_classes_set_input!) {
    update_space_classes_by_pk(pk_columns: { id: $id }, _set: $object) {
      id name status instructor_id
    }
  }
`;

export const updateSpaceClass = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ update_space_classes_by_pk: any }>(UPDATE_SPACE_CLASS, {
      id: ctx.data.id,
      object: ctx.data.object,
    });
    return res.update_space_classes_by_pk;
  });

const DELETE_SPACE_CLASS = `
  mutation DeleteSpaceClass($id: uuid!) {
    delete_space_classes_by_pk(id: $id) { id }
  }
`;

export const deleteSpaceClass = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ delete_space_classes_by_pk: any }>(DELETE_SPACE_CLASS, {
      id: ctx.data.id,
    });
    return res.delete_space_classes_by_pk;
  });

// ── SESSIONS ───────────────────────────────────────────────────────────────

const GET_SPACE_SESSIONS = `
  query GetSpaceSessions($space_id: uuid!) {
    space_sessions(
      where: { class: { space_id: { _eq: $space_id } } },
      order_by: { start_time: asc }
    ) {
      id
      class_id
      resource_id
      coach_id
      coach_name
      start_time
      end_time
      status
      notes
      created_at
      class {
        name
        duration_minutes
        max_capacity
        price
        is_free_with_subscription
      }
      resource {
        name
        type
      }
      bookings {
        id
        customer_name
        billing_status
        status
      }
    }
  }
`;

export const getSpaceSessions = createServerFn({ method: "POST" })
  .validator((d: { space_id: string }) => d)
  .handler(async (ctx) => {
    const { space_id } = ctx.data;
    const res = await hasuraRequest<{ space_sessions: any[] }>(GET_SPACE_SESSIONS, { space_id });
    return res.space_sessions;
  });

const CREATE_SPACE_SESSION = `
  mutation CreateSpaceSession($object: space_sessions_insert_input!) {
    insert_space_sessions_one(object: $object) {
      id coach_name start_time end_time status
      class { name }
    }
  }
`;

export const createSpaceSession = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ insert_space_sessions_one: any }>(CREATE_SPACE_SESSION, {
      object: ctx.data.object,
    });
    return res.insert_space_sessions_one;
  });

const UPDATE_SPACE_SESSION = `
  mutation UpdateSpaceSession($id: uuid!, $object: space_sessions_set_input!) {
    update_space_sessions_by_pk(pk_columns: { id: $id }, _set: $object) {
      id status
    }
  }
`;

export const updateSpaceSession = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ update_space_sessions_by_pk: any }>(UPDATE_SPACE_SESSION, {
      id: ctx.data.id,
      object: ctx.data.object,
    });
    return res.update_space_sessions_by_pk;
  });

const DELETE_SPACE_SESSION = `
  mutation DeleteSpaceSession($id: uuid!) {
    delete_space_sessions_by_pk(id: $id) { id }
  }
`;

export const deleteSpaceSession = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ delete_space_sessions_by_pk: any }>(DELETE_SPACE_SESSION, {
      id: ctx.data.id,
    });
    return res.delete_space_sessions_by_pk;
  });

// ── SESSION BOOKINGS ───────────────────────────────────────────────────────

const GET_SESSION_BOOKINGS = `
  query GetSessionBookings($session_id: uuid!) {
    space_session_bookings(where: { session_id: { _eq: $session_id } }, order_by: { created_at: asc }) {
      id
      customer_name
      customer_email
      fee_charged
      billing_status
      status
      created_at
      subscription {
        id
        plan_name
        status
      }
    }
  }
`;

export const getSessionBookings = createServerFn({ method: "POST" })
  .validator((d: { session_id: string }) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ space_session_bookings: any[] }>(GET_SESSION_BOOKINGS, {
      session_id: ctx.data.session_id,
    });
    return res.space_session_bookings;
  });

const CREATE_SESSION_BOOKING = `
  mutation CreateSessionBooking($object: space_session_bookings_insert_input!) {
    insert_space_session_bookings_one(object: $object) {
      id customer_name fee_charged billing_status status
    }
  }
`;

export const createSessionBooking = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ insert_space_session_bookings_one: any }>(
      CREATE_SESSION_BOOKING,
      { object: ctx.data.object },
    );
    return res.insert_space_session_bookings_one;
  });

const UPDATE_SESSION_BOOKING = `
  mutation UpdateSessionBooking($id: uuid!, $object: space_session_bookings_set_input!) {
    update_space_session_bookings_by_pk(pk_columns: { id: $id }, _set: $object) {
      id status billing_status
    }
  }
`;

export const updateSessionBooking = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ update_space_session_bookings_by_pk: any }>(
      UPDATE_SESSION_BOOKING,
      { id: ctx.data.id, object: ctx.data.object },
    );
    return res.update_space_session_bookings_by_pk;
  });

const DELETE_SESSION_BOOKING = `
  mutation DeleteSessionBooking($id: uuid!) {
    delete_space_session_bookings_by_pk(id: $id) { id }
  }
`;

export const deleteSessionBooking = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ delete_space_session_bookings_by_pk: any }>(
      DELETE_SESSION_BOOKING,
      { id: ctx.data.id },
    );
    return res.delete_space_session_bookings_by_pk;
  });
