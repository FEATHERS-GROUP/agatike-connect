import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

const CREATE_EVENT = `
  mutation CreateEvent($object: events_insert_input!) {
    insert_events_one(object: $object) {
      id
    }
  }
`;

export const createEvent = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const eventData = ctx.data as any;
  return hasuraRequest(CREATE_EVENT, { object: eventData });
});

const GET_PUBLIC_EVENTS = `
  query GetPublicEvents {
    events(where: { allowed_public: { _eq: true } }, order_by: { created_at: desc }) {
      allowed_public
      category
      cover
      created_at
      deleted
      description
      event_requency
      id
      title
      lineup
      tour_stops
      updated_at
      vipPerks
      workspace_id
      event_tickets {
        cost
        created_at
        deleted
        event_id
        id
        is_consumable
        remaining
        sold
        sale_ends_at
        tour_stop_idx
        type
        updated_at
      }
      ticket_projects {
        coverImage
        id
        name
        tier
      }
      merchandises {
        id
        image_url
        name
        price
      }
      workspaces {
        city
        name
        orgnizer_id
        organizer {
          active
          bio
          business
          handle
          id
          image
          name
          followers
        }
        type
        updated_at
        wallet {
          currency
        }
      }
    }
  }
`;

export const getPublicEvents = createServerFn({ method: "GET" }).handler(async () => {
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
      lineup
      allowed_public
      created_at
      event_tickets {
        id
        type
        cost
        remaining
        sold
        tour_stop_idx
      }
    }
  }
`;

export const getWorkspaceEvents = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { workspace_id } = ctx.data as unknown as { workspace_id: string };
  const data = await hasuraRequest<{ events: any[] }>(GET_WORKSPACE_EVENTS, { workspace_id });
  return data.events || [];
});

const GET_EVENT_BY_ID = `
  query GetEventById($id: uuid!) {
    events_by_pk(id: $id) {
      allowed_public
      category
      cover
      created_at
      deleted
      description
      event_requency
      id
      title
      lineup
      tour_stops
      updated_at
      vipPerks
      workspace_id
      event_tickets {
        cost
        created_at
        deleted
        event_id
        id
        is_consumable
        remaining
        sold
        sale_ends_at
        tour_stop_idx
        type
        updated_at
      }
      ticket_projects {
        coverImage
        id
        name
        tier
      }
      merchandises {
        id
        image_url
        name
        price
      }
      workspaces {
        city
        name
        orgnizer_id
        organizer {
          active
          bio
          business
          handle
          id
          image
          name
          followers
        }
        type
        updated_at
        wallet {
          currency
        }
      }
    }
  }
`;

export const getEventById = createServerFn({ method: "POST" }).handler(async (ctx) => {
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
    $event_requency: jsonb,
    $lineup: jsonb,
    $allowed_public: Boolean
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
        event_requency: $event_requency,
        lineup: $lineup,
        allowed_public: $allowed_public
      }
    ) {
      id
    }
  }
`;

export const updateEvent = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const variables = ctx.data as any;
  const data = await hasuraRequest<{ update_events_by_pk: { id: string } }>(
    UPDATE_EVENT,
    variables,
  );
  return data.update_events_by_pk;
});

const SAVE_TICKET_PROJECT = `
  mutation SaveTicketProject($coverImage: String = "", $design_overrides: jsonb = "", $eventId: uuid = "", $font: json = "", $logoText: String = "", $name: String = "", $palette: json = "", $seat: String = "", $template: String = "", $tier: String = "", $updated_on: timestamptz = "", $workspaceId: uuid = "", $logoScale: String = "", $logoImage: String = "", $logoColorMode: String = "", $logoOpacity: String = "") {
    insert_ticket_projects(objects: {coverImage: $coverImage, deleted: false, design_overrides: $design_overrides, eventId: $eventId, font: $font, logoText: $logoText, name: $name, palette: $palette, seat: $seat, template: $template, tier: $tier, updated_on: $updated_on, workspaceId: $workspaceId, logoScale: $logoScale, logoImage: $logoImage, logoColorMode: $logoColorMode, logoOpacity: $logoOpacity}) {
      returning {
        id
      }
    }
  }
`;

export const saveTicketProject = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const variables = ctx.data as any;
  return hasuraRequest(SAVE_TICKET_PROJECT, variables);
});

const GET_TICKET_PROJECT_BY_ID = `
  query GetTicketProjectById($id: uuid!) {
    ticket_projects_by_pk(id: $id) {
      id
      name
      eventId
      template
      coverImage
      design_overrides
      font
      palette
      seat
      tier
      logoText
      logoScale
      logoImage
      logoColorMode
      logoOpacity
      workspaceId
    }
  }
`;

export const getTicketProjectById = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id } = ctx.data as unknown as { id: string };
  const data = await hasuraRequest<{ ticket_projects_by_pk: any }>(GET_TICKET_PROJECT_BY_ID, {
    id,
  });
  return data.ticket_projects_by_pk || null;
});

const UPDATE_TICKET_PROJECT = `
  mutation UpdateTicketProject($id: uuid!, $coverImage: String, $design_overrides: jsonb, $eventId: uuid, $font: json, $logoText: String, $name: String, $palette: json, $seat: String, $template: String, $tier: String, $updated_on: timestamptz, $logoScale: String, $logoImage: String, $logoColorMode: String, $logoOpacity: String) {
    update_ticket_projects_by_pk(pk_columns: {id: $id}, _set: {coverImage: $coverImage, design_overrides: $design_overrides, eventId: $eventId, font: $font, logoText: $logoText, name: $name, palette: $palette, seat: $seat, template: $template, tier: $tier, updated_on: $updated_on, logoScale: $logoScale, logoImage: $logoImage, logoColorMode: $logoColorMode, logoOpacity: $logoOpacity}) {
      id
    }
  }
`;

export const updateTicketProject = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const variables = ctx.data as any;
  return hasuraRequest(UPDATE_TICKET_PROJECT, variables);
});

const GET_WORKSPACE_TICKET_PROJECTS = `
  query GetWorkspaceTicketProjects($workspaceId: uuid!) {
    ticket_projects(where: {workspaceId: {_eq: $workspaceId}, deleted: {_eq: false}}, order_by: {updated_on: desc}) {
      id
      name
      eventId
      template
      coverImage
      design_overrides
      font
      palette
      seat
      tier
      logoText
      logoScale
      logoImage
      logoColorMode
      logoOpacity
      workspaceId
      updated_on
      events {
        category
        cover
        created_at
        deleted
        description
        event_requency
        id
        title
        tour_stops
        updated_at
        vipPerks
        workspace_id
        event_tickets {
          cost
          created_at
          deleted
          event_id
          id
          remaining
          sale_ends_at
          sold
          type
          updated_at
          tour_stop_idx
        }
      }
      created_at
      deleted
    }
  }
`;

export const getWorkspaceTicketProjects = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const { workspaceId } = ctx.data as unknown as { workspaceId: string };
    const data = await hasuraRequest<{ ticket_projects: any[] }>(GET_WORKSPACE_TICKET_PROJECTS, {
      workspaceId,
    });
    return data.ticket_projects || [];
  },
);
