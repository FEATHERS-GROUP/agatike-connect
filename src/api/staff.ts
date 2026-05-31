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
      role
      status
      badge_qr_string
      section_id
    }
  }
`;

export const getEventStaff = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { event_id } = ctx.data as unknown as { event_id: string };
  const data = await hasuraRequest<{ event_staff: any[] }>(GET_EVENT_STAFF, { event_id });
  return data.event_staff || [];
});

const ADD_EVENT_STAFF = `
  mutation AddEventStaff($object: event_staff_insert_input!) {
    insert_event_staff_one(object: $object) {
      id
      role
      badge_qr_string
    }
  }
`;

export const addEventStaff = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const staffData = ctx.data as any;
  return hasuraRequest(ADD_EVENT_STAFF, { object: staffData });
});
