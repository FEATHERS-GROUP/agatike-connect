import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

const CREATE_EVENT = `
  mutation CreateEvent($object: events_insert_input!) {
    insert_events_one(object: $object) {
      id
    }
  }
`;

export const createEvent = createServerFn({ method: "POST" })
  .handler(async (ctx) => {
    const eventData = ctx.data as any;
    return hasuraRequest(CREATE_EVENT, { object: eventData });
  });

const GET_PUBLIC_EVENTS = `
  query GetPublicEvents {
    events(order_by: { created_at: desc }) {
      id
      title
      category
      description
      cover
      tour_stops
      vipPerks
      created_at
      workspace {
        name
        orgnizer_id
        wallet {
          currency
        }
      }
      event_tickets(limit: 1, order_by: { cost: asc }) {
        type
        cost
        remaining
      }
    }
  }
`;

export const getPublicEvents = createServerFn({ method: "GET" })
  .handler(async () => {
    const data = await hasuraRequest<{ events: any[] }>(GET_PUBLIC_EVENTS, {});
    return data.events || [];
  });

const GET_WORKSPACE_EVENTS = `
  query GetWorkspaceEvents($workspace_id: uuid!) {
    events(where: { workspace_id: { _eq: $workspace_id } }, order_by: { created_at: desc }) {
      id
      title
      category
      description
      cover
      tour_stops
      created_at
      event_tickets {
        id
        type
        cost
        remaining
        sold
      }
    }
  }
`;

export const getWorkspaceEvents = createServerFn({ method: "POST" })
  .handler(async (ctx) => {
    const { workspace_id } = ctx.data as unknown as { workspace_id: string };
    const data = await hasuraRequest<{ events: any[] }>(GET_WORKSPACE_EVENTS, { workspace_id });
    return data.events || [];
  });

const GET_EVENT_BY_ID = `
  query GetEventById($id: uuid!) {
    events_by_pk(id: $id) {
      id
      title
      category
      description
      cover
      tour_stops
      vipPerks
      event_requency
      workspace_id
      event_tickets {
        id
        type
        cost
        remaining
        sold
        sale_ends_at
      }
    }
  }
`;

export const getEventById = createServerFn({ method: "POST" })
  .handler(async (ctx) => {
    const { id } = ctx.data as unknown as { id: string };
    const data = await hasuraRequest<{ events_by_pk: any }>(GET_EVENT_BY_ID, { id });
    return data.events_by_pk || null;
  });

const UPDATE_EVENT = `
  mutation UpdateEvent(
    $id: uuid!,
    $title: String,
    $category: String,
    $description: String,
    $cover: String,
    $tour_stops: jsonb,
    $vipPerks: String,
    $event_requency: jsonb
  ) {
    update_events_by_pk(
      pk_columns: { id: $id },
      _set: {
        title: $title,
        category: $category,
        description: $description,
        cover: $cover,
        tour_stops: $tour_stops,
        vipPerks: $vipPerks,
        event_requency: $event_requency
      }
    ) {
      id
    }
  }
`;

export const updateEvent = createServerFn({ method: "POST" })
  .handler(async (ctx) => {
    const variables = ctx.data as any;
    const data = await hasuraRequest<{ update_events_by_pk: { id: string } }>(UPDATE_EVENT, variables);
    return data.update_events_by_pk;
  });



