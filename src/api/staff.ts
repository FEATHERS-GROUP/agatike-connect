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
    }
  }
`;

export const addEventStaff = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const staffData = ctx.data as any;
  return hasuraRequest(ADD_EVENT_STAFF, { object: staffData });
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
