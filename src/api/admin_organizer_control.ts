import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getAdminSession } from "./admin_auth";

// ----------------------------------------------------
// OVERVIEW
// ----------------------------------------------------
export const getAdminOrganizerOverview = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const query = `
      query GetOverview($id: uuid!) {
        organizers_by_pk(id: $id) {
          id
          name
          handle
          email
          phone
          active
          followers
          image
        }
        subscriptions(where: { organizer_id: { _eq: $id }, status: { _eq: "active" } }) {
          id
        }
        workspace_users_aggregate(where: { organizer_id: { _eq: $id } }) {
          aggregate { count }
        }
        workspaces(where: { orgnizer_id: { _eq: $id } }) {
          id
        }
      }
    `;
    const data = await hasuraRequest<any>(query, { id: ctx.data.organizerId });
    
    const workspaceIds = data.workspaces?.map((w: any) => w.id) || [];
    let eventsCount = 0;
    let venuesCount = 0;
    let projectsCount = 0;
    let spacesCount = 0;
    let attendeesCount = 0;
    let postsCount = 0;
    let storiesCount = 0;
    let allEvents = [];
    let walletTx = [];
    let invoices = [];

    if (workspaceIds.length > 0) {
      // 1. Fetch Events & Invoices
      const eventsQuery = `
        query GetEvents($wsIds: [uuid!]!, $orgId: String!) {
          events(where: { workspace_id: { _in: $wsIds } }) {
            id
            title
            created_at
            schedules {
              start_date
            }
          }
          organizer_invoices(where: { organizer_id: { _eq: $orgId }, status: { _eq: "paid" } }) {
            amount
            created_at
          }
        }
      `;
      try {
        const eventsData = await hasuraRequest<any>(eventsQuery, { wsIds: workspaceIds, orgId: ctx.data.organizerId });
        allEvents = eventsData.events || [];
        invoices = eventsData.organizer_invoices || [];
      } catch (err) {
        console.error("Failed fetching events/invoices:", err);
      }

      const eventIds = allEvents.map((e: any) => e.id);
      eventsCount = allEvents.length;

      // 2. Fetch Module Counts & Revenue
      const countsQuery = `
        query GetCounts($wsIds: [uuid!]!, $eventIds: [uuid!]!) {
          venue_projects_aggregate(where: { workspace_id: { _in: $wsIds } }) { aggregate { count } }
          ticket_projects_aggregate(where: { workspaceId: { _in: $wsIds } }) { aggregate { count } }
          spaces_aggregate(where: { workspace_id: { _in: $wsIds } }) { aggregate { count } }
          event_attendees_aggregate(where: { event_id: { _in: $eventIds } }) { aggregate { count } }
          event_posts_aggregate(where: { event_id: { _in: $eventIds } }) { aggregate { count } }
          event_stories_aggregate(where: { event_id: { _in: $eventIds } }) { aggregate { count } }
          wallet_transactions(where: { workspace_id: { _in: $wsIds }, status: { _eq: "completed" } }) {
            type
            net_amount
            created_at
          }
        }
      `;
      try {
        const countsData = await hasuraRequest<any>(countsQuery, { wsIds: workspaceIds, eventIds: eventIds.length > 0 ? eventIds : ["00000000-0000-0000-0000-000000000000"] });
        venuesCount = countsData.venue_projects_aggregate?.aggregate?.count || 0;
        projectsCount = countsData.ticket_projects_aggregate?.aggregate?.count || 0;
        spacesCount = countsData.spaces_aggregate?.aggregate?.count || 0;
        attendeesCount = countsData.event_attendees_aggregate?.aggregate?.count || 0;
        postsCount = countsData.event_posts_aggregate?.aggregate?.count || 0;
        storiesCount = countsData.event_stories_aggregate?.aggregate?.count || 0;
        walletTx = countsData.wallet_transactions || [];
      } catch (err) {
        console.error("Failed fetching module counts:", err);
      }
    }

    return {
      ...data.organizers_by_pk,
      hasActiveSubscription: data.subscriptions?.length > 0,
      usersCount: data.workspace_users_aggregate?.aggregate?.count || 0,
      eventsCount,
      venuesCount,
      projectsCount,
      spacesCount,
      attendeesCount,
      postsCount,
      storiesCount,
      allEvents,
      walletTx,
      invoices,
    };
  });

// ----------------------------------------------------
// SUBSCRIPTIONS
// ----------------------------------------------------
export const getAdminOrganizerSubscriptions = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const query = `
      query GetSubs($id: uuid!) {
        subscriptions(where: { organizer_id: { _eq: $id } }, order_by: { start_date: desc }) {
          id
          status
          amount
          start_date
          pricing_plan {
            name
          }
        }
      }
    `;
    const data = await hasuraRequest<any>(query, { id: ctx.data.organizerId });
    return data.subscriptions || [];
  });

// ----------------------------------------------------
// INVOICES
// ----------------------------------------------------
export const getAdminOrganizerInvoices = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const query = `
      query GetInvoices($id: String!) {
        organizer_invoices(where: { organizer_id: { _eq: $id } }, order_by: { created_at: desc }) {
          id
          amount
          status
          created_at
        }
      }
    `;
    const data = await hasuraRequest<any>(query, { id: ctx.data.organizerId });
    return data.organizer_invoices || [];
  });

// ----------------------------------------------------
// WORKSPACES
// ----------------------------------------------------
export const getAdminOrganizerWorkspaces = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const wsQuery = `
      query GetWorkspaces($orgnizer_id: uuid!) {
        workspaces(where: { orgnizer_id: { _eq: $orgnizer_id } }, order_by: { created_at: desc }) {
          id
          name
          logo
          city
          country
          address
          currency
          moduls
          created_at
          updated_at
          type
          deleted
        }
      }
    `;
    const wsData = await hasuraRequest<any>(wsQuery, { orgnizer_id: ctx.data.organizerId });

    let platformModules: any[] = [];
    try {
      const modQuery = `query { platformModules { id label } }`;
      const modData = await hasuraRequest<any>(modQuery, {});
      platformModules = modData.platformModules || [];
    } catch (_) {
      // Non-critical — fall back to empty so module IDs show truncated
    }

    return { workspaces: wsData.workspaces || [], platformModules };
  });

export const setAdminWorkspaceStatus = createServerFn({ method: "POST" })
  .validator((d: { workspaceId: string; deleted: boolean }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const mutation = `
      mutation UpdateWorkspaceStatus($id: uuid!, $deleted: Boolean!) {
        update_workspaces_by_pk(pk_columns: { id: $id }, _set: { deleted: $deleted }) {
          id
          deleted
        }
      }
    `;
    const data = await hasuraRequest<any>(mutation, { id: ctx.data.workspaceId, deleted: ctx.data.deleted });
    return data.update_workspaces_by_pk;
  });

// ----------------------------------------------------
// VENUES
// ----------------------------------------------------
export const getAdminOrganizerVenues = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const wsQuery = `query GetWs($id: uuid!) { workspaces(where: { orgnizer_id: { _eq: $id } }) { id name } }`;
    const wsData = await hasuraRequest<any>(wsQuery, { id: ctx.data.organizerId });
    const workspaces: any[] = wsData.workspaces || [];
    const wsIds = workspaces.map((w: any) => w.id);
    const wsNameMap = Object.fromEntries(workspaces.map((w: any) => [w.id, w.name]));

    if (wsIds.length === 0) return { venues: [], spaces: [] };

    const query = `
      query GetVenuesAndSpaces($wsIds: [uuid!]!) {
        rentable_venues(where: { workspace_id: { _in: $wsIds } }, order_by: { created_at: desc }) {
          id
          name
          type
          city
          country
          address
          capacity
          rental_type
          currency
          cover_url
          status
          created_at
          workspace_id
          description
          amenities
          pricing_tiers
          opening_hours
          closing_hours
          instructions
          is_venue_private
          images
        }
        spaces(where: { workspace_id: { _in: $wsIds } }, order_by: { created_at: desc }) {
          id
          name
          type
          currency
          status
          created_at
          workspace_id
          description
          cover_url
          locations
          plans
          rsvp_form_id
          show_rsvp_form_button
          rsvp_form_button_text
        }
      }
    `;
    const data = await hasuraRequest<any>(query, { wsIds });
    
    const venues = (data.rentable_venues || []).map((v: any) => ({
      ...v,
      workspaceName: wsNameMap[v.workspace_id] || "—",
    }));

    const spaces = (data.spaces || []).map((s: any) => ({
      ...s,
      workspaceName: wsNameMap[s.workspace_id] || "—",
    }));

    return { venues, spaces };
  });

// ----------------------------------------------------
// EVENTS
// ----------------------------------------------------
export const getAdminOrganizerEvents = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const wsQuery = `query GetWs($id: uuid!) { workspaces(where: { orgnizer_id: { _eq: $id } }) { id name } }`;
    const wsData = await hasuraRequest<any>(wsQuery, { id: ctx.data.organizerId });
    const workspaces: any[] = wsData.workspaces || [];
    const wsIds = workspaces.map((w: any) => w.id);
    const wsNameMap = Object.fromEntries(workspaces.map((w: any) => [w.id, w.name]));

    if (wsIds.length === 0) return [];

    const query = `
      query GetEvents($wsIds: [uuid!]!) {
        events(where: { workspace_id: { _in: $wsIds } }, order_by: { created_at: desc }) {
          id
          title
          category
          event_type
          workspace_id
          created_at
          suspended
          allowed_public
          schedules {
            start_date
          }
        }
      }
    `;
    const data = await hasuraRequest<any>(query, { wsIds });
    return (data.events || []).map((e: any) => ({
      ...e,
      workspaceName: wsNameMap[e.workspace_id] || "—",
      startDate: e.schedules?.[0]?.start_date || null,
    }));
  });

// ----------------------------------------------------
// PROJECTS
// ----------------------------------------------------
export const getAdminOrganizerProjects = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const wsQuery = `query GetWs($id: uuid!) { workspaces(where: { orgnizer_id: { _eq: $id } }) { id name } }`;
    const wsData = await hasuraRequest<any>(wsQuery, { id: ctx.data.organizerId });
    const workspaces: any[] = wsData.workspaces || [];
    const wsIds = workspaces.map((w: any) => w.id);
    const wsNameMap = Object.fromEntries(workspaces.map((w: any) => [w.id, w.name]));

    if (wsIds.length === 0) return { tickets: [], badges: [], venues: [], pages: [] };

    const query = `
      query GetAllProjects($wsIds: [uuid!]!) {
        ticket_projects(where: { workspaceId: { _in: $wsIds } }, order_by: { created_at: desc }) {
          id
          name
          workspaceId
          template
          coverImage
          created_at
          deleted
        }
        venue_projects(where: { workspace_id: { _in: $wsIds } }, order_by: { name: asc }) {
          id
          name
          workspace_id
          boundary_width
          boundary_height
        }
        workspace_pages(where: { workspace_id: { _in: $wsIds } }, order_by: { updated_at: desc }) {
          id
          title
          slug
          workspace_id
          is_published
          updated_at
        }
      }
    `;

    const data = await hasuraRequest<any>(query, { wsIds });

    // Fetch badge_projects per workspace (they filter by event->workspace)
    let badgeProjects: any[] = [];
    try {
      const badgeQ = `
        query GetBadges($wsIds: [uuid!]!) {
          badge_projects(where: { events: { workspace_id: { _in: $wsIds } } }, order_by: { created_at: desc }) {
            id
            logo_text
            theme
            gradient_class
            accent_color
            event_id
            events {
              title
              workspace_id
            }
          }
        }
      `;
      const badgeData = await hasuraRequest<any>(badgeQ, { wsIds });
      badgeProjects = (badgeData.badge_projects || []).map((b: any) => ({
        ...b,
        workspaceName: wsNameMap[b.events?.workspace_id] || "—",
        eventTitle: b.events?.title || "—",
      }));
    } catch (_) { /* non-critical */ }

    return {
      tickets: (data.ticket_projects || []).map((t: any) => ({ ...t, workspaceName: wsNameMap[t.workspaceId] || "—" })),
      badges: badgeProjects,
      venues: (data.venue_projects || []).map((v: any) => ({ ...v, workspaceName: wsNameMap[v.workspace_id] || "—" })),
      pages: (data.workspace_pages || []).map((p: any) => ({ ...p, workspaceName: wsNameMap[p.workspace_id] || "—" })),
    };
  });

// ----------------------------------------------------
// USERS & SETTINGS
// ----------------------------------------------------
export const getAdminOrganizerUsers = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const query = `
      query GetUsers($orgId: uuid!) {
        workspace_users(where: { organizer_id: { _eq: $orgId } }, order_by: { created_at: desc }) {
          id
          name
          email
          role
          status
          created_at
        }
      }
    `;
    const data = await hasuraRequest<any>(query, { orgId: ctx.data.organizerId });
    return data.workspace_users || [];
  });

export const setAdminOrganizerStatus = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string; active: boolean }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const mutation = `
      mutation UpdateStatus($id: uuid!, $active: Boolean!) {
        update_organizers_by_pk(pk_columns: { id: $id }, _set: { active: $active }) {
          id
          active
        }
      }
    `;
    const data = await hasuraRequest<any>(mutation, { id: ctx.data.organizerId, active: ctx.data.active });
    return data.update_organizers_by_pk;
  });
