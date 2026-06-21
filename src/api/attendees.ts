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
      users {
        id
        profile
        handle
        username
      }
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

  // 1. Group by ticket_id to calculate requested quantities
  const qtyByTier: Record<string, number> = {};
  objects.forEach((obj: any) => {
    const tid = obj.ticket_id;
    if (tid && tid !== "ga") {
      qtyByTier[tid] = (qtyByTier[tid] || 0) + 1;
    }
  });

  const ticketIds = Object.keys(qtyByTier);

  // 2. If there are real tickets, verify capacity
  if (ticketIds.length > 0) {
    const GET_TICKETS = `
      query GetTickets($ids: [uuid!]!) {
        event_tickets(where: { id: { _in: $ids } }) {
          id
          sold
          remaining
          cost
          event_id
        }
      }
    `;
    const ticketsData = await hasuraRequest<{ event_tickets: any[] }>(GET_TICKETS, {
      ids: ticketIds,
    });
    const dbTickets = ticketsData.event_tickets || [];

    // Verify inventory and prepare updates
    const updates: { id: string; new_sold: number }[] = [];
    for (const tid of ticketIds) {
      const dbTier = dbTickets.find((t: any) => t.id === tid);
      if (!dbTier) throw new Error(`Ticket tier not found.`);

      const currentSold = parseInt(dbTier.sold) || 0;
      const capacity = parseInt(dbTier.remaining) || 0;
      const newSold = currentSold + qtyByTier[tid];

      if (newSold > capacity) {
        throw new Error(`Sold out! Not enough tickets remaining.`);
      }
      updates.push({ id: tid, new_sold: newSold });
    }

    // Dynamically build a single GraphQL mutation with all operations.
    // Hasura executes these sequentially in a transaction.
    let mutationStr = `mutation ProcessBooking($objects: [event_attendees_insert_input!]!) {\n`;
    mutationStr += `
      insert_event_attendees(objects: $objects) {
        affected_rows
        returning { id }
      }
    `;

    // Add an update for each ticket tier
    updates.forEach((u, i) => {
      mutationStr += `
        update_${i}: update_event_tickets_by_pk(
          pk_columns: { id: "${u.id}" },
          _set: { sold: "${u.new_sold}" }
        ) {
          id
        }
      `;
    });

    mutationStr += `\n}`;

    let totalCost = 0;
    let eventId = null;
    for (const tid of ticketIds) {
      const dbTier = dbTickets.find((t: any) => t.id === tid);
      if (dbTier) {
        totalCost += (parseFloat(dbTier.cost || "0") * qtyByTier[tid]);
        eventId = dbTier.event_id;
      }
    }

    const res = await hasuraRequest(mutationStr, { objects });

    if (totalCost > 0 && eventId) {
      try {
        const GET_EVENT_WORKSPACE = `
          query GetEventWorkspace($id: uuid!) {
            events_by_pk(id: $id) {
              workspace_id
            }
          }
        `;
        const wsData = await hasuraRequest<{ events_by_pk: { workspace_id: string } }>(GET_EVENT_WORKSPACE, { id: eventId });
        const workspace_id = wsData?.events_by_pk?.workspace_id;
        if (workspace_id) {
          const { addMoneyToWorkspaceWallet } = await import("./wallet");
          await addMoneyToWorkspaceWallet(workspace_id, totalCost);
        }
      } catch (e) {
        console.error("Failed to update wallet for event tickets:", e);
      }
    }

    return res;
  }

  // Fallback for "ga" or free events without specific DB ticket ids
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
