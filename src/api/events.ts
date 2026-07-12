import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

import { getSession } from "./auth";
import { sendPushNotification } from "./push";
import { syncEventToGoogleCalendar } from "./integrations";

const CREATE_EVENT = `
  mutation CreateEvent($object: events_insert_input!) {
    insert_events_one(object: $object) {
      id
    }
  }
`;

export const createEvent = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const eventData = ctx.data as any;
  const result = await hasuraRequest<{ insert_events_one: any }>(CREATE_EVENT, {
    object: eventData,
  });
  const eventId = result?.insert_events_one?.id;

  if (eventId && eventData.workspace_id) {
    try {
      // 1. Get organizer_id from workspace
      const wsQuery = `
        query GetWorkspaceOrg($id: uuid!) {
          workspaces_by_pk(id: $id) {
            orgnizer_id
          }
        }
      `;
      const wsData = await hasuraRequest<{ workspaces_by_pk: any }>(wsQuery, {
        id: eventData.workspace_id,
      });
      const orgId = wsData?.workspaces_by_pk?.orgnizer_id;

      if (orgId) {
        // 2. Get followers
        const followersQuery = `
          query GetFollowers($orgId: uuid!) {
            organizer_followers(where: { organizer_id: { _eq: $orgId } }) {
              user_id
            }
          }
        `;
        const followersData = await hasuraRequest<{ organizer_followers: any[] }>(followersQuery, {
          orgId,
        });
        const row = followersData?.organizer_followers?.[0];

        if (row && row.user_id) {
          const userIds = Array.isArray(row.user_id) ? row.user_id : [row.user_id];
          const targetUsers = userIds.map((u: any) => String(u).replace(/"/g, ""));

          if (targetUsers.length > 0) {
            const session = await getSession();
            const { getFirebaseAdmin } = await import("@/lib/firebase.server");
            const { db } = getFirebaseAdmin();
            await db.collection("agatike_notifications").add({
              type: "new_event",
              eventId: eventId,
              organizerId: eventData.workspace_id, // Front-end might need workspace_id or org_id
              actorId: session?.sub || orgId,
              targetUsers: targetUsers,
              createdAt: new Date().toISOString(),
            });

            await sendPushNotification({
              data: {
                userIds: targetUsers,
                title: "New Event Announced!",
                body: "An organizer you follow just posted a new event.",
                data: { url: `/event/${eventId}` },
              },
            } as any);
          }
        }
      }
    } catch (e) {
      console.error("Failed to push new_event notification:", e);
    }

    try {
      // Sync to Google Calendar if configured
      await syncEventToGoogleCalendar({
        data: {
          workspaceId: eventData.workspace_id,
          eventDetails: {
            summary: eventData.name,
            description: eventData.description || "",
            start: eventData.date,
            end: eventData.end_date || eventData.date,
            location: eventData.location || "TBA",
          },
        } as any,
      });
    } catch (e) {
      console.error("Failed to sync event to Google Calendar:", e);
    }
  }

  return result;
});

export const getEventAttendeesCount = createServerFn({ method: "POST" })
  .validator((d: { eventId?: string; scheduleId?: string }) => d)
  .handler(async (ctx) => {
    const data = ctx.data;
    if (!data.eventId && !data.scheduleId) return 0;

    let where = "";
    if (data.scheduleId) {
      where = `where: {schedule_id: {_eq: "${data.scheduleId}"}}`;
    } else if (data.eventId) {
      where = `where: {event_id: {_eq: "${data.eventId}"}}`;
    }

    const query = `
    query GetAttendeesCount {
      event_attendees_aggregate(${where}) {
        aggregate {
          count
        }
      }
    }
  `;
    const result = await hasuraRequest<any>(query);
    return result?.event_attendees_aggregate?.aggregate?.count || 0;
  });

const CREATE_EVENT_SCHEDULE = `
  mutation CreateEventSchedule($data: event_schedules_insert_input!) {
    insert_event_schedules_one(object: $data) {
      id
      start_date
      end_date
      total_spots
      spots_filled
      event_id
    }
  }
`;

export const createEventSchedule = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  const scheduleData = ctx.data as any;
  return hasuraRequest<any>(CREATE_EVENT_SCHEDULE, { data: scheduleData });
});

const GET_PUBLIC_EVENTS = `
  query GetPublicEvents {
    events(where: { allowed_public: { _eq: true } }, order_by: { created_at: desc }) {
      allowed_public
      suspended
      category
      cover
      created_at
      deleted
      description
      event_requency
      event_type
      id
      title
      lineup
      tour_stops
      updated_at
      vipPerks
      workspace_id
      event_tickets {
        name
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
        form_id
        vip_privilege_ids
      }
      event_attendees_aggregate {
        aggregate {
          count(columns: email, distinct: true)
        }
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
        currency
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

export const getPublicEvents = createServerFn({ method: "GET" })
  .validator((d: any) => d)
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
      event_requency
      lineup
      event_type
      allowed_public
      suspended
      created_at
      event_tickets {
        id
        name
        type
        cost
        remaining
        sold
        tour_stop_idx
        form_id
        vip_privilege_ids
      }
      schedules {
        id
        total_spots
        spots_filled
        start_date
        end_date
      }
    }
  }
`;

export const getWorkspaceEvents = createServerFn({ method: "POST" })
  .validator((d: { workspace_id: string }) => d)
  .handler(async (ctx) => {
    const { workspace_id } = ctx.data;
    const data = await hasuraRequest<{ events: any[] }>(GET_WORKSPACE_EVENTS, { workspace_id });
    return data.events || [];
  });

const GET_EVENT_BY_ID = `
  query GetEventById($id: uuid!) {
    events_by_pk(id: $id) {
      allowed_public
      suspended
      category
      cover
      created_at
      deleted
      description
      event_requency
      event_type
      id
      title
      lineup
      tour_stops
      updated_at
      vipPerks
      workspace_id
      schedules {
        id
        start_date
        end_date
        total_spots
        spots_filled
        created_at
      }
      event_tickets {
        name
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
        form_id
        vip_privilege_ids
      }
      event_attendees_aggregate {
        aggregate {
          count(columns: email, distinct: true)
        }
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
        currency
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
    $event_type: String,
    $allowed_public: Boolean,
    $suspended: Boolean
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
        event_type: $event_type,
        allowed_public: $allowed_public,
        suspended: $suspended
      }
    ) {
      id
    }
  }
`;

export const updateEvent = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const payload = ctx.data as any;
  const { id, event_tickets, schedules, workspace_id, ...eventUpdateVars } = payload;

  // Fetch the existing event to fallback on unchanged or empty fields
  const existingEvent = await getEventById({ data: { id } } as any);
  if (!existingEvent) {
    throw new Error("Event not found");
  }

  // Merge payload with existing event data to prevent overwriting with blank values
  const mergedVars = {
    id,
    title:
      eventUpdateVars.title !== undefined && eventUpdateVars.title !== ""
        ? eventUpdateVars.title
        : existingEvent.title,
    category:
      eventUpdateVars.category !== undefined && eventUpdateVars.category !== ""
        ? eventUpdateVars.category
        : existingEvent.category,
    description:
      eventUpdateVars.description !== undefined && eventUpdateVars.description !== ""
        ? eventUpdateVars.description
        : existingEvent.description,
    cover:
      eventUpdateVars.cover !== undefined && eventUpdateVars.cover !== ""
        ? eventUpdateVars.cover
        : existingEvent.cover,
    tour_stops:
      eventUpdateVars.tour_stops !== undefined
        ? eventUpdateVars.tour_stops
        : existingEvent.tour_stops,
    vipPerks:
      eventUpdateVars.vipPerks !== undefined ? eventUpdateVars.vipPerks : existingEvent.vipPerks,
    event_requency:
      eventUpdateVars.event_requency !== undefined
        ? eventUpdateVars.event_requency
        : existingEvent.event_requency,
    lineup: eventUpdateVars.lineup !== undefined ? eventUpdateVars.lineup : existingEvent.lineup,
    event_type:
      eventUpdateVars.event_type !== undefined
        ? eventUpdateVars.event_type
        : existingEvent.event_type,
    allowed_public:
      eventUpdateVars.allowed_public !== undefined
        ? eventUpdateVars.allowed_public
        : existingEvent.allowed_public,
    suspended:
      eventUpdateVars.suspended !== undefined ? eventUpdateVars.suspended : existingEvent.suspended,
  };

  // 1. Update the event table basic info
  const data = await hasuraRequest<{ update_events_by_pk: { id: string } }>(
    UPDATE_EVENT,
    mergedVars,
  );

  // 2. Update/Upsert Tickets
  if (event_tickets && event_tickets.data) {
    const tickets = event_tickets.data;

    // Identify active tickets that have valid UUIDs
    const isValidUUID = (str: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    const activeTicketIds = tickets
      .map((t: any) => t.id)
      .filter((tid: any) => tid && isValidUUID(tid));

    // Try deleting tickets that are not in the active list
    if (activeTicketIds.length > 0) {
      try {
        await hasuraRequest(
          `
          mutation DeleteOldTickets($eventId: uuid!, $activeIds: [uuid!]!) {
            delete_event_tickets(
              where: { event_id: { _eq: $eventId }, id: { _nin: $activeIds } }
            ) {
              affected_rows
            }
          }
          `,
          { eventId: id, activeIds: activeTicketIds },
        );
      } catch (e) {
        console.error("Failed to delete unused tickets:", e);
      }
    } else {
      // If no active ticket IDs, try deleting all tickets for this event
      try {
        await hasuraRequest(
          `
          mutation DeleteAllTickets($eventId: uuid!) {
            delete_event_tickets(
              where: { event_id: { _eq: $eventId } }
            ) {
              affected_rows
            }
          }
          `,
          { eventId: id },
        );
      } catch (e) {
        console.error("Failed to delete all tickets:", e);
      }
    }

    // Upsert active tickets
    const ticketsToInsert = tickets.map((t: any) => {
      const ticketObj: any = {
        event_id: id,
        name: t.name,
        type: t.type,
        cost: t.cost,
        remaining: t.remaining,
        sold: t.sold || "0",
        form_id: t.form_id || null,
        vip_privilege_ids: t.vip_privilege_ids || null,
        tour_stop_idx: t.tour_stop_idx !== undefined ? t.tour_stop_idx : null,
      };
      if (t.id && isValidUUID(t.id)) {
        ticketObj.id = t.id;
      }
      return ticketObj;
    });

    if (ticketsToInsert.length > 0) {
      try {
        await hasuraRequest(
          `
          mutation UpsertTickets($objects: [event_tickets_insert_input!]!) {
            insert_event_tickets(
              objects: $objects,
              on_conflict: {
                constraint: event_tickets_pkey,
                update_columns: [name, type, cost, remaining, form_id, vip_privilege_ids, tour_stop_idx]
              }
            ) {
              affected_rows
            }
          }
          `,
          { objects: ticketsToInsert },
        );
      } catch (e) {
        console.error("Failed to upsert tickets:", e);
      }
    }
  }

  // 3. Update primary schedule
  if (schedules && schedules.data && schedules.data.length > 0) {
    const primarySchedule = schedules.data[0];

    // Fetch existing schedules for the event
    try {
      const schedulesResult = await hasuraRequest<{ event_schedules: any[] }>(
        `
        query GetEventSchedules($eventId: uuid!) {
          event_schedules(where: { event_id: { _eq: $eventId } }) {
            id
          }
        }
        `,
        { eventId: id },
      );

      const existingSchedules = schedulesResult?.event_schedules || [];
      if (existingSchedules.length > 0) {
        // Update the first schedule
        const firstScheduleId = existingSchedules[0].id;
        await hasuraRequest(
          `
          mutation UpdatePrimarySchedule(
            $id: uuid!,
            $start_date: date!,
            $end_date: date!,
            $total_spots: Int!
          ) {
            update_event_schedules_by_pk(
              pk_columns: { id: $id },
              _set: {
                start_date: $start_date,
                end_date: $end_date,
                total_spots: $total_spots
              }
            ) {
              id
            }
          }
          `,
          {
            id: firstScheduleId,
            start_date: primarySchedule.start_date,
            end_date: primarySchedule.end_date,
            total_spots: parseInt(primarySchedule.total_spots || 0),
          },
        );
      } else {
        // Insert a new schedule if none exists
        await hasuraRequest(
          `
          mutation InsertPrimarySchedule($object: event_schedules_insert_input!) {
            insert_event_schedules_one(object: $object) {
              id
            }
          }
          `,
          {
            object: {
              event_id: id,
              start_date: primarySchedule.start_date,
              end_date: primarySchedule.end_date,
              total_spots: parseInt(primarySchedule.total_spots || 0),
              spots_filled: 0,
            },
          },
        );
      }
    } catch (e) {
      console.error("Failed to update/create schedule:", e);
    }
  }

  return data.update_events_by_pk;
});

const SAVE_TICKET_PROJECT = `
  mutation SaveTicketProject($coverImage: String = "", $design_overrides: jsonb = "", $eventId: uuid, $venueId: uuid, $cinemaId: uuid, $font: json = "", $logoText: String = "", $name: String = "", $palette: json = "", $seat: String = "", $template: String = "", $tier: String = "", $updated_on: timestamptz = "", $workspaceId: uuid = "", $logoScale: String = "", $logoImage: String = "", $logoColorMode: String = "", $logoOpacity: String = "") {
    insert_ticket_projects(objects: {coverImage: $coverImage, deleted: false, design_overrides: $design_overrides, eventId: $eventId, venueId: $venueId, cinemaId: $cinemaId, font: $font, logoText: $logoText, name: $name, palette: $palette, seat: $seat, template: $template, tier: $tier, updated_on: $updated_on, workspaceId: $workspaceId, logoScale: $logoScale, logoImage: $logoImage, logoColorMode: $logoColorMode, logoOpacity: $logoOpacity}) {
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
      venueId
      cinemaId
      folder_id
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
  try {
    const { id } = ctx.data as unknown as { id: string };
    const data = await hasuraRequest<{ ticket_projects_by_pk: any }>(GET_TICKET_PROJECT_BY_ID, {
      id,
    });
    return data.ticket_projects_by_pk || null;
  } catch (err) {
    console.error("getTicketProjectById Error:", err);
    throw err;
  }
});

const UPDATE_TICKET_PROJECT = `
  mutation UpdateTicketProject($id: uuid!, $coverImage: String, $design_overrides: jsonb, $eventId: uuid, $venueId: uuid, $cinemaId: uuid, $font: json, $logoText: String, $name: String, $palette: json, $seat: String, $template: String, $tier: String, $updated_on: timestamptz, $logoScale: String, $logoImage: String, $logoColorMode: String, $logoOpacity: String) {
    update_ticket_projects_by_pk(pk_columns: {id: $id}, _set: {coverImage: $coverImage, design_overrides: $design_overrides, eventId: $eventId, venueId: $venueId, cinemaId: $cinemaId, font: $font, logoText: $logoText, name: $name, palette: $palette, seat: $seat, template: $template, tier: $tier, updated_on: $updated_on, logoScale: $logoScale, logoImage: $logoImage, logoColorMode: $logoColorMode, logoOpacity: $logoOpacity}) {
      id
    }
  }
`;

export const updateTicketProjectFolder = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id, folder_id } = ctx.data as any;
  const q = `
    mutation UpdateTicketProjectFolder($id: uuid!, $folder_id: uuid) {
      update_ticket_projects_by_pk(pk_columns: {id: $id}, _set: {folder_id: $folder_id}) {
        id
      }
    }
  `;
  return hasuraRequest(q, { id, folder_id });
});

export const deleteTicketProject = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id } = ctx.data as any;
  const q = `
    mutation DeleteTicketProject($id: uuid!) {
      update_ticket_projects_by_pk(pk_columns: {id: $id}, _set: {deleted: true}) {
        id
      }
    }
  `;
  return hasuraRequest(q, { id });
});

export const updateTicketProject = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const variables = ctx.data as any;
  return hasuraRequest(UPDATE_TICKET_PROJECT, variables);
});

const GET_WORKSPACE_TICKET_PROJECTS = `
  query GetWorkspaceTicketProjects($workspaceId: uuid!) {
    ticket_projects(where: {workspaceId: {_eq: $workspaceId}, deleted: {_eq: false}}, order_by: {updated_on: desc}) {
      id
      folder_id
      name
      eventId
      venueId
      cinemaId
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
        event_type
        id
        title
        tour_stops
        updated_at
        vipPerks
        workspace_id
        event_tickets {
          name
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
          form_id
          vip_privilege_ids
        }
      }
      created_at
      deleted
    }
  }
`;

export const getWorkspaceTicketProjects = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const session = await getSession();
    if (!session) return [];

    const { workspaceId } = ctx.data as unknown as { workspaceId: string };

    let isContributorOnly = false;
    let userEmail = "";

    if (session.type === "workspace_user") {
      const q = `query { workspace_users_by_pk(id: "${session.sub}") { role, email } }`;
      const res = await hasuraRequest<any>(q, {});
      if (res?.workspace_users_by_pk?.role === "contributor") {
        isContributorOnly = true;
        userEmail = res.workspace_users_by_pk.email;
      }
    }

    if (isContributorOnly) {
      const contribQuery = `
        query GetContributorProjects($workspaceId: uuid!, $email: String!) {
          ticket_projects(
            where: {
              workspaceId: { _eq: $workspaceId },
              deleted: { _eq: false },
              _exists: {
                _table: { schema: "public", name: "project_contributors" },
                _where: {
                  email: { _eq: $email },
                  resource_type: { _eq: "ticket_project" },
                  resource_id: { _eq: ticket_projects.id }
                }
              }
            },
            order_by: { updated_on: desc }
          ) {
            id
            name
            eventId
            venueId
            cinemaId
            template
            palette
            font
            status
            created_on
            updated_on
          }
        }
      `;

      // Wait, Hasura _exists requires relationships. Since we just created project_contributors, there is no Hasura relationship mapped to ticket_projects yet.
      // So we must fetch project_contributors first, then filter ticket_projects in JS.
      const getContributorsQuery = `
        query {
          project_contributors(where: { email: { _ilike: "${userEmail}" }, resource_type: { _eq: "ticket_project" } }) {
            resource_id
          }
        }
      `;
      const contribs = await hasuraRequest<any>(getContributorsQuery, {});
      const projectIds = contribs.project_contributors.map((c: any) => c.resource_id);

      if (projectIds.length === 0) return [];

      const restrictedQuery = `
        query GetRestrictedProjects($workspaceId: uuid!, $ids: [uuid!]!) {
          ticket_projects(
            where: { workspaceId: { _eq: $workspaceId }, deleted: { _eq: false }, id: { _in: $ids } },
            order_by: { updated_on: desc }
          ) {
            id
            folder_id
            name
            eventId
            venueId
            cinemaId
            template
            palette
            font
            status
            created_on
            updated_on
          }
        }
      `;
      const data = await hasuraRequest<any>(restrictedQuery, { workspaceId, ids: projectIds });
      return data.ticket_projects || [];
    }

    const data = await hasuraRequest<{ ticket_projects: any[] }>(GET_WORKSPACE_TICKET_PROJECTS, {
      workspaceId,
    });
    return data.ticket_projects || [];
  },
);
