import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

const GET_EVENT_ATTENDEES = `
  query GetEventAttendees($event_id: uuid!) {
    event_attendees(where: { event_id: { _eq: $event_id } }, order_by: { created_at: desc }) {
      created_at
      custom_fields
      email
      event_id
      id
      names
      payment_method
      phone
      qrcode_number
      quanity
      status
      ticket_id
      ticket_type
      type
      updated_at
      user_id
      events {
        title
      }
    }
  }
`;

export const getEventAttendees = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { event_id } = ctx.data as unknown as { event_id: string };
  const data = await hasuraRequest<{ event_attendees: any[] }>(GET_EVENT_ATTENDEES, { event_id });
  return data.event_attendees || [];
});

const GET_ATTENDEE_BY_QR_CODE = `
  query GetAttendeeByQrCode($qrcode_number: String!) {
    event_attendees(where: { qrcode_number: { _eq: $qrcode_number } }, limit: 1) {
      created_at
      custom_fields
      email
      event_id
      id
      names
      payment_method
      phone
      qrcode_number
      quanity
      status
      ticket_id
      ticket_type
      type
      updated_at
      user_id
      events {
        title
      }
    }
  }
`;

export const getAttendeeByQrCode = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { qrcode_number } = ctx.data as unknown as { qrcode_number: string };
  const data = await hasuraRequest<{ event_attendees: any[] }>(GET_ATTENDEE_BY_QR_CODE, { qrcode_number });
  return data.event_attendees?.[0] || null;
});

const ADD_EVENT_ATTENDEES = `
  mutation AddEventAttendees($objects: [event_attendees_insert_input!]!) {
    insert_event_attendees(objects: $objects) {
      affected_rows
      returning {
        id
      }
    }
  }
`;

export const addEventAttendees = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { objects } = ctx.data as any;
  return hasuraRequest(ADD_EVENT_ATTENDEES, { objects });
});


