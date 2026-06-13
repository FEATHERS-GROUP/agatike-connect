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
        tour_stops
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
  const data = await hasuraRequest<{ event_attendees: any[] }>(GET_ATTENDEE_BY_QR_CODE, {
    qrcode_number,
  });
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

export const checkUserAttendance = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { event_id } = ctx.data as unknown as { event_id: string };

  // Need to dynamically import to avoid circular dependencies if auth imports from elsewhere,
  // but a static import at top is fine too. Let's just use it dynamically to be safe.
  const { getUserSession } = await import("./auth");
  const user = await getUserSession();

  if (!user || !user.email) return null;

  const query = `
    query CheckUserAttendance($event_id: uuid!, $user_id: uuid, $email: String!) {
      event_attendees(where: {
        event_id: { _eq: $event_id },
        _or: [
          { user_id: { _eq: $user_id } },
          { email: { _eq: $email } }
        ]
      }, limit: 1) {
        id
        email
        names
      }
    }
  `;

  const data = await hasuraRequest<{ event_attendees: any[] }>(query, {
    event_id,
    user_id: user.id || null,
    email: user.email,
  });

  return data.event_attendees.length > 0 ? data.event_attendees[0] : null;
});

export const getUserAttendedEventIds = createServerFn({ method: "GET" }).handler(async () => {
  const { getUserSession } = await import("./auth");
  const user = await getUserSession();

  if (!user || !user.email) return [];

  const query = `
    query GetUserAttendedEvents($user_id: uuid, $email: String!) {
      event_attendees(where: {
        _or: [
          { user_id: { _eq: $user_id } },
          { email: { _eq: $email } }
        ]
      }) {
        event_id
      }
    }
  `;

  const data = await hasuraRequest<{ event_attendees: { event_id: string }[] }>(query, {
    user_id: user.id || null,
    email: user.email,
  });

  return [...new Set(data.event_attendees.map((a) => a.event_id))];
});
