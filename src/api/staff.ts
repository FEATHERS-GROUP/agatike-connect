import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

// SECTIONS

const GET_EVENT_SECTIONS = `
  query GetEventSections($event_id: uuid!) {
    event_sections(where: { event_id: { _eq: $event_id } }, order_by: { created_at: desc }) {
      id
      name
      description
    }
  }
`;

export const getEventSections = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { event_id } = ctx.data as unknown as { event_id: string };
  const data = await hasuraRequest<{ event_sections: any[] }>(GET_EVENT_SECTIONS, { event_id });
  return data.event_sections || [];
});

const CREATE_EVENT_SECTION = `
  mutation CreateEventSection($object: event_sections_insert_input!) {
    insert_event_sections_one(object: $object) {
      id
      name
    }
  }
`;

export const createEventSection = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const sectionData = ctx.data as any;
  return hasuraRequest(CREATE_EVENT_SECTION, { object: sectionData });
});

// STAFF

const GET_EVENT_STAFF = `
  query GetEventStaff($event_id: uuid!) {
    event_staff(where: { event_id: { _eq: $event_id } }, order_by: { created_at: desc }) {
      id
      user_id
      first_name
      last_name
      email
      phone
      role
      status
      badge_qr_string
      allowed_sections
      profile_image
      pin_code
      app_permissions
    }
  }
`;

export const getEventStaff = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { event_id } = ctx.data as unknown as { event_id: string };
  const data = await hasuraRequest<{ event_staff: any[] }>(GET_EVENT_STAFF, { event_id });
  return data.event_staff || [];
});

const GET_STAFF_BY_BADGE = `
  query GetStaffByBadge($badge_qr_string: String!) {
    event_staff(where: { badge_qr_string: { _eq: $badge_qr_string } }, limit: 1) {
      id
      user_id
      first_name
      last_name
      email
      phone
      role
      status
      badge_qr_string
      allowed_sections
      profile_image
      event_id
      pin_code
      app_permissions
    }
  }
`;

export const getStaffByBadgeId = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { badge_qr_string } = ctx.data as unknown as { badge_qr_string: string };
  const data = await hasuraRequest<{ event_staff: any[] }>(GET_STAFF_BY_BADGE, { badge_qr_string });
  return data.event_staff?.[0] || null;
});

const ADD_EVENT_STAFF = `
  mutation AddEventStaff($object: event_staff_insert_input!) {
    insert_event_staff_one(object: $object) {
      id
      role
      badge_qr_string
      first_name
      last_name
      email
      phone
      profile_image
      pin_code
      app_permissions
    }
  }
`;

export const addEventStaff = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const staffData = ctx.data as any;
  return hasuraRequest(ADD_EVENT_STAFF, { object: staffData });
});

const ADD_MULTIPLE_EVENT_STAFF = `
  mutation AddMultipleEventStaff($objects: [event_staff_insert_input!]!) {
    insert_event_staff(objects: $objects) {
      returning {
        id
        role
        badge_qr_string
        first_name
        last_name
        email
        phone
        profile_image
        pin_code
        app_permissions
      }
    }
  }
`;

export const addMultipleEventStaff = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { objects } = ctx.data as { objects: any[] };
  return hasuraRequest(ADD_MULTIPLE_EVENT_STAFF, { objects });
});

const UPDATE_EVENT_STAFF = `
  mutation UpdateEventStaff($id: uuid!, $allowed_sections: jsonb) {
    update_event_staff_by_pk(pk_columns: { id: $id }, _set: { allowed_sections: $allowed_sections }) {
      id
      allowed_sections
    }
  }
`;

export const updateEventStaff = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id, allowed_sections } = ctx.data as any;
  return hasuraRequest(UPDATE_EVENT_STAFF, { id, allowed_sections });
});

const UPDATE_STAFF_STATUS = `
  mutation UpdateStaffStatus($id: uuid!, $status: String!) {
    update_event_staff_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
      id
      status
    }
  }
`;

export const updateStaffStatus = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id, status } = ctx.data as any;
  return hasuraRequest(UPDATE_STAFF_STATUS, { id, status });
});

const DELETE_EVENT_STAFF = `
  mutation DeleteEventStaff($id: uuid!) {
    delete_event_staff_by_pk(id: $id) {
      id
    }
  }
`;

export const deleteEventStaff = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id } = ctx.data as any;
  return hasuraRequest(DELETE_EVENT_STAFF, { id });
});

const GET_USER_STAFF_ASSIGNMENTS = `
  query GetUserStaffAssignments($user_id: uuid!) {
    event_staff(where: { user_id: { _eq: $user_id }, status: { _eq: "active" } }, order_by: { created_at: desc }) {
      id
      role
      status
      event_id
      pin_code
      badge_qr_string
      allowed_sections
      app_permissions
      event {
        id
        title
        cover
        schedules {
          start_date
          end_date
        }
      }
    }
  }
`;

export const getUserStaffAssignments = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { user_id } = ctx.data as unknown as { user_id: string };
  if (!user_id) return [];
  const data = await hasuraRequest<{ event_staff: any[] }>(GET_USER_STAFF_ASSIGNMENTS, { user_id });
  return data.event_staff || [];
});
