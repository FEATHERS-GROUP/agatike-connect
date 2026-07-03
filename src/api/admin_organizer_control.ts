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
          bio
          business
          business_cert
          dateOfBirth
          field
          gender
          national_id
          socials
          speciality
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
        const eventsData = await hasuraRequest<any>(eventsQuery, {
          wsIds: workspaceIds,
          orgId: ctx.data.organizerId,
        });
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
        const countsData = await hasuraRequest<any>(countsQuery, {
          wsIds: workspaceIds,
          eventIds: eventIds.length > 0 ? eventIds : ["00000000-0000-0000-0000-000000000000"],
        });
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

    const wsQuery = `query GetWs($id: uuid!) { workspaces(where: { orgnizer_id: { _eq: $id } }) { id name } }`;
    const wsData = await hasuraRequest<any>(wsQuery, { id: ctx.data.organizerId });
    const workspaces: any[] = wsData.workspaces || [];
    const wsIds = workspaces.map((w: any) => w.id);

    const query = `
      query GetSubs($id: uuid!, $wsIds: [uuid!]!) {
        subscriptions(where: { organizer_id: { _eq: $id } }, order_by: { start_date: desc }) {
          id
          status
          amount
          start_date
          pricing_plan {
            name
          }
        }
        wallet_transactions(where: { workspace_id: { _in: $wsIds } }, order_by: { created_at: desc }) {
          id
          type
          amount
          currency
          status
          description
          created_at
          provider_reference
        }
      }
    `;
    let data;
    try {
      data = await hasuraRequest<any>(query, {
        id: ctx.data.organizerId,
        wsIds: wsIds.length > 0 ? wsIds : ["00000000-0000-0000-0000-000000000000"],
      });
    } catch {
      data = { subscriptions: [], wallet_transactions: [] };
    }

    return {
      subscriptions: data.subscriptions || [],
      transactions: data.wallet_transactions || [],
    };
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
    const data = await hasuraRequest<any>(mutation, {
      id: ctx.data.workspaceId,
      deleted: ctx.data.deleted,
    });
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
    } catch (_) {
      /* non-critical */
    }

    return {
      tickets: (data.ticket_projects || []).map((t: any) => ({
        ...t,
        workspaceName: wsNameMap[t.workspaceId] || "—",
      })),
      badges: badgeProjects,
      venues: (data.venue_projects || []).map((v: any) => ({
        ...v,
        workspaceName: wsNameMap[v.workspace_id] || "—",
      })),
      pages: (data.workspace_pages || []).map((p: any) => ({
        ...p,
        workspaceName: wsNameMap[p.workspace_id] || "—",
      })),
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
    const data = await hasuraRequest<any>(mutation, {
      id: ctx.data.organizerId,
      active: ctx.data.active,
    });
    return data.update_organizers_by_pk;
  });

// ----------------------------------------------------
// FORMS & RSVPS
// ----------------------------------------------------
export const getAdminOrganizerForms = createServerFn({ method: "POST" })
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
      query GetForms($wsIds: [uuid!]!) {
        custom_forms(where: { workspace_id: { _in: $wsIds } }, order_by: { created_at: desc }) {
          id
          title
          description
          is_active
          workspace_id
          created_at
          rsvps {
            id
          }
        }
      }
    `;
    const data = await hasuraRequest<any>(query, { wsIds });
    return (data.custom_forms || []).map((f: any) => ({
      ...f,
      workspaceName: wsNameMap[f.workspace_id] || "—",
      rsvpCount: f.rsvps?.length || 0,
    }));
  });

export const getAdminOrganizerRSVPs = createServerFn({ method: "POST" })
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
      query GetRSVPs($wsIds: [uuid!]!) {
        rsvps(where: { custom_form: { workspace_id: { _in: $wsIds } } }, order_by: { created_at: desc }) {
          id
          email
          first_name
          last_name
          status
          created_at
          custom_form {
            id
            title
            workspace_id
          }
        }
      }
    `;
    const data = await hasuraRequest<any>(query, { wsIds });
    return (data.rsvps || []).map((r: any) => ({
      ...r,
      formTitle: r.custom_form?.title || "—",
      workspaceName: wsNameMap[r.custom_form?.workspace_id] || "—",
    }));
  });

// ----------------------------------------------------
// BOOK & INVOICES
// ----------------------------------------------------
export const getAdminOrganizerBook = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    // The agatike_books usually links to event_id. We fetch org's workspaces -> events -> books
    const wsQuery = `query GetWs($id: uuid!) { workspaces(where: { orgnizer_id: { _eq: $id } }) { id name } }`;
    const wsData = await hasuraRequest<any>(wsQuery, { id: ctx.data.organizerId });
    const workspaces: any[] = wsData.workspaces || [];
    const wsIds = workspaces.map((w: any) => w.id);
    const wsNameMap = Object.fromEntries(workspaces.map((w: any) => [w.id, w.name]));

    if (wsIds.length === 0) return [];

    // agatike_books has direct workspace_id column (not events relation for filtering)
    // It also has event_id for linking to events
    const query = `
      query GetBooks($wsIds: [uuid!]!) {
        agatike_books(where: { workspace_id: { _in: $wsIds } }, order_by: { created_at: desc }) {
          id
          name
          workspace_id
          event_id
          schema_fields
          created_at
          records {
            id
          }
        }
      }
    `;
    let data;
    try {
      data = await hasuraRequest<any>(query, { wsIds });
    } catch {
      data = { agatike_books: [] };
    }

    return (data.agatike_books || []).map((b: any) => ({
      ...b,
      workspaceName: wsNameMap[b.workspace_id] || "—",
      recordCount: b.records?.length || 0,
    }));
  });

export const getAdminOrganizerBookInvoices = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    // Let's just fetch all invoices that have type 'book' or 'agatike_book' for this organizer's scope
    const wsQuery = `query GetWs($id: uuid!) { workspaces(where: { orgnizer_id: { _eq: $id } }) { id name } }`;
    const wsData = await hasuraRequest<any>(wsQuery, { id: ctx.data.organizerId });
    const workspaces: any[] = wsData.workspaces || [];
    const wsIds = workspaces.map((w: any) => w.id);

    if (wsIds.length === 0) return [];

    // Assuming we don't have direct workspace_id on invoices,
    // we'll fetch invoices linked to space_subscriptions or books within these workspaces.
    // For safety, let's just fetch recent invoices and try to filter if needed,
    // or just fetch invoices where reference_id matches books.
    // A safer query for now is all invoices (we might not have a direct relation set up in Hasura).
    // Let's try fetching invoices linked to space_id for now, or just all for this organizer.
    const query = `
      query GetInvoices {
        invoices(order_by: { created_at: desc }, limit: 100) {
          id
          invoice_number
          type
          customer_name
          customer_email
          amount
          currency
          status
          created_at
        }
      }
    `;
    let data;
    try {
      data = await hasuraRequest<any>(query, {});
    } catch {
      data = { invoices: [] };
    }
    return data.invoices || [];
  });

// ----------------------------------------------------
// MEMBERSHIPS
// ----------------------------------------------------
export const getAdminOrganizerMemberships = createServerFn({ method: "POST" })
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
      query GetMemberships($wsIds: [uuid!]!) {
        space_subscriptions(where: { space: { workspace_id: { _in: $wsIds } } }, order_by: { created_at: desc }) {
          id
          customer_name
          customer_email
          plan_name
          status
          booking_type
          created_at
          space {
            name
            workspace_id
          }
        }
      }
    `;
    const data = await hasuraRequest<any>(query, { wsIds });
    return (data.space_subscriptions || []).map((s: any) => ({
      ...s,
      workspaceName: wsNameMap[s.space?.workspace_id] || "—",
      spaceName: s.space?.name || "—",
    }));
  });

// ----------------------------------------------------
// ATTENDEES
// ----------------------------------------------------
export const getAdminOrganizerAttendees = createServerFn({ method: "POST" })
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
      query GetAttendees($wsIds: [uuid!]!) {
        event_attendees(where: { events: { workspace_id: { _in: $wsIds } } }, order_by: { created_at: desc }) {
          id
          names
          email
          phone
          status
          ticket_type
          quanity
          qrcode_number
          created_at
          event_id
          events {
            title
            workspace_id
          }
        }
      }
    `;
    const data = await hasuraRequest<any>(query, { wsIds });
    return (data.event_attendees || []).map((a: any) => ({
      ...a,
      eventTitle: a.events?.title || "—",
      workspaceName: wsNameMap[a.events?.workspace_id] || "—",
    }));
  });

// ----------------------------------------------------
// BILLING SETTINGS (for Settings page)
// ----------------------------------------------------
export const getAdminOrganizerBillingSettings = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const query = `
      query GetBillingSettings($id: uuid!) {
        organizers_by_pk(id: $id) {
          id
          name
          email
        }
        subscriptions(where: { organizer_id: { _eq: $id } }, order_by: { start_date: desc }) {
          id
          status
          amount
          start_date
          next_billing_date
          plan_id
          pricing_plan {
            id
            name
            description
            price
            currency
            billing_cycle
            features
            customer_service_fee_percentage
            organizer_platform_contribution
            platform_margin_buffer
            max_withdrawals_per_week
          }
        }
        workspaces(where: { orgnizer_id: { _eq: $id } }, order_by: { created_at: desc }) {
          id
          name
          currency
          city
          country
          logo
        }
        pricing_plans(order_by: { price: asc }) {
          id
          name
          description
          price
          currency
          billing_cycle
          features
          is_popular
          customer_service_fee_percentage
          organizer_platform_contribution
          platform_margin_buffer
          max_withdrawals_per_week
        }
      }
    `;
    const data = await hasuraRequest<any>(query, { id: ctx.data.organizerId });
    return {
      organizer: data.organizers_by_pk,
      subscriptions: data.subscriptions || [],
      activeSubscription:
        (data.subscriptions || []).find((s: any) => s.status === "active") || null,
      workspaces: data.workspaces || [],
      pricingPlans: data.pricing_plans || [],
    };
  });

export const updateAdminWorkspaceCurrency = createServerFn({ method: "POST" })
  .validator((d: { workspaceId: string; currency: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const mutation = `
      mutation UpdateWorkspaceAndWalletCurrency($id: uuid!, $currency: String!) {
        update_workspaces_by_pk(pk_columns: { id: $id }, _set: { currency: $currency }) {
          id
          currency
        }
        update_wallets(where: { workspace_id: { _eq: $id } }, _set: { currency: $currency }) {
          affected_rows
        }
      }
    `;
    const data = await hasuraRequest<any>(mutation, {
      id: ctx.data.workspaceId,
      currency: ctx.data.currency,
    });
    return data.update_workspaces_by_pk;
  });

export const updateAdminOrganizerSubscriptionPlan = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string; planId: string; amount: number }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    // Cancel any active sub first
    const cancelMutation = `
      mutation CancelActiveSubs($orgId: uuid!) {
        update_subscriptions(where: { organizer_id: { _eq: $orgId }, status: { _eq: "active" } }, _set: { status: "canceled" }) {
          affected_rows
        }
      }
    `;
    await hasuraRequest<any>(cancelMutation, { orgId: ctx.data.organizerId });

    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const createMutation = `
      mutation CreateSub($object: subscriptions_insert_input!) {
        insert_subscriptions_one(
          object: $object,
          on_conflict: {
            constraint: subscriptions_organizer_id_key,
            update_columns: [plan_id, amount, status, next_billing_date, updated_at]
          }
        ) {
          id
          status
          next_billing_date
          pricing_plan { name }
        }
      }
    `;
    const data = await hasuraRequest<any>(createMutation, {
      object: {
        organizer_id: ctx.data.organizerId,
        plan_id: ctx.data.planId,
        amount: ctx.data.amount,
        status: "active",
        next_billing_date: nextBillingDate.toISOString(),
      },
    });
    return data.insert_subscriptions_one;
  });

// ----------------------------------------------------
// ENHANCED SUBSCRIPTIONS (with fee simulations)
// ----------------------------------------------------
export const getAdminOrganizerSubscriptionsDetail = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    // 1. Get workspaces
    const wsQuery = `query GetWs($id: uuid!) {
      workspaces(where: { orgnizer_id: { _eq: $id } }) { id name }
    }`;
    const wsData = await hasuraRequest<any>(wsQuery, { id: ctx.data.organizerId });
    const workspaces: any[] = wsData.workspaces || [];
    const wsIds = workspaces.map((w: any) => w.id);
    const safeWsIds = wsIds.length > 0 ? wsIds : ["00000000-0000-0000-0000-000000000000"];
    const wsNameMap = Object.fromEntries(workspaces.map((w: any) => [w.id, w.name]));

    // 2. Get wallets for all workspaces
    let walletIds: string[] = [];
    const walletIdToWsMap: Record<string, string> = {};
    try {
      const walletsQuery = `query GetWallets($wsIds: [uuid!]!) {
        wallets(where: { workspace_id: { _in: $wsIds } }) { id workspace_id }
      }`;
      const walletsData = await hasuraRequest<any>(walletsQuery, { wsIds: safeWsIds });
      const wallets: any[] = walletsData.wallets || [];
      walletIds = wallets.map((w: any) => w.id);
      wallets.forEach((w: any) => {
        walletIdToWsMap[w.id] = w.workspace_id;
      });
    } catch (e) {
      console.error("Failed to fetch wallets:", e);
    }

    const safeWalletIds =
      walletIds.length > 0 ? walletIds : ["00000000-0000-0000-0000-000000000000"];

    // 3. Main query: subscriptions + transactions (by BOTH workspace_id and wallet_id)
    const query = `
      query GetSubsDetail($id: uuid!, $wsIds: [uuid!]!, $walletIds: [uuid!]!) {
        subscriptions(where: { organizer_id: { _eq: $id } }, order_by: { start_date: desc }) {
          id
          status
          amount
          start_date
          next_billing_date
          pricing_plan {
            id
            name
            price
            currency
            billing_cycle
            customer_service_fee_percentage
            organizer_platform_contribution
            platform_margin_buffer
            max_withdrawals_per_week
          }
        }
        wallet_transactions(
          where: {
            _or: [
              { workspace_id: { _in: $wsIds } },
              { wallet_id: { _in: $walletIds } }
            ]
          },
          order_by: { created_at: desc }
        ) {
          id
          wallet_id
          workspace_id
          type
          amount
          net_amount
          currency
          status
          provider_status
          provider_reference
          reference_id
          description
          payout_method
          payout_account
          raw_callback_data
          created_at
          updated_at
        }
        fee_simulations(order_by: { created_at: desc }, limit: 100) {
          transaction_id
          expected_collection_cost
          expected_disbursement_cost
          expected_margin
          decision
          input_snapshot
          created_at
        }
      }
    `;
    let data;
    try {
      data = await hasuraRequest<any>(query, {
        id: ctx.data.organizerId,
        wsIds: safeWsIds,
        walletIds: safeWalletIds,
      });
    } catch {
      data = { subscriptions: [], wallet_transactions: [], fee_simulations: [] };
    }

    // Map workspace names — resolve via workspace_id first, fallback via wallet_id
    const transactions = (data.wallet_transactions || []).map((t: any) => {
      const wsId = t.workspace_id || walletIdToWsMap[t.wallet_id];
      return {
        ...t,
        workspaceName: wsNameMap[wsId] || "—",
      };
    });

    return {
      subscriptions: data.subscriptions || [],
      transactions,
      feeSimulations: data.fee_simulations || [],
    };
  });

// ----------------------------------------------------
// PROJECT CONTRIBUTORS (all for the organizer)
// ----------------------------------------------------
export const getAdminOrganizerContributors = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    // Get all workspace IDs for this organizer
    const wsQuery = `query GetWs($id: uuid!) { workspaces(where: { orgnizer_id: { _eq: $id } }) { id name } }`;
    const wsData = await hasuraRequest<any>(wsQuery, { id: ctx.data.organizerId });
    const workspaces: any[] = wsData.workspaces || [];
    const wsIds = workspaces.map((w: any) => w.id);
    const wsNameMap = Object.fromEntries(workspaces.map((w: any) => [w.id, w.name]));

    if (wsIds.length === 0) return [];

    const query = `
      query GetOrgContributors($wsIds: [uuid!]!) {
        project_contributors(
          where: { workspace_id: { _in: $wsIds } },
          order_by: { created_at: desc }
        ) {
          id
          email
          access_level
          status
          resource_type
          resource_id
          workspace_id
          created_at
        }
      }
    `;
    let data;
    try {
      data = await hasuraRequest<any>(query, { wsIds });
    } catch {
      data = { project_contributors: [] };
    }

    return (data.project_contributors || []).map((c: any) => ({
      ...c,
      workspaceName: wsNameMap[c.workspace_id] || "—",
    }));
  });

// ----------------------------------------------------
// WALLETS (View and Configure Networks)
// ----------------------------------------------------
export const getAdminOrganizerWallets = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const wsQuery = `
      query GetOrgWallets($id: uuid!) {
        workspaces(where: { orgnizer_id: { _eq: $id } }, order_by: { created_at: desc }) {
          id
          name
          city
          country
          wallet {
            id
            amount
            currency
            walletNumber
            supported_networks
            created_at
            updated_at
          }
        }
      }
    `;
    const data = await hasuraRequest<any>(wsQuery, { id: ctx.data.organizerId });
    return data.workspaces || [];
  });

export const updateAdminWalletNetworks = createServerFn({ method: "POST" })
  .validator((d: { walletId: string; networks: string[] }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const query = `
      mutation UpdateWalletNetworks($id: uuid!, $networks: jsonb!) {
        update_wallets_by_pk(pk_columns: { id: $id }, _set: { supported_networks: $networks }) {
          id
          supported_networks
        }
      }
    `;
    const data = await hasuraRequest<any>(query, {
      id: ctx.data.walletId,
      networks: ctx.data.networks,
    });
    return data.update_wallets_by_pk;
  });

// ----------------------------------------------------
// MODULES (Platform Modules assigned to Workspaces)
// ----------------------------------------------------
export const getAdminOrganizerModulesData = createServerFn({ method: "POST" })
  .validator((d: { organizerId: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const query = `
      query GetOrgModules($id: uuid!) {
        platformModules {
          id
          label
          category
        }
        workspaces(where: { orgnizer_id: { _eq: $id } }, order_by: { created_at: desc }) {
          id
          name
          moduls
        }
      }
    `;
    const data = await hasuraRequest<any>(query, { id: ctx.data.organizerId });
    return {
      platformModules: data.platformModules || [],
      workspaces: data.workspaces || [],
    };
  });

export const updateAdminWorkspaceModules = createServerFn({ method: "POST" })
  .validator((d: { workspaceId: string; moduls: any }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const query = `
      mutation UpdateWorkspaceModules($id: uuid!, $moduls: jsonb!) {
        update_workspaces_by_pk(pk_columns: { id: $id }, _set: { moduls: $moduls }) {
          id
          moduls
        }
      }
    `;
    const data = await hasuraRequest<any>(query, {
      id: ctx.data.workspaceId,
      moduls: ctx.data.moduls,
    });
    return data.update_workspaces_by_pk;
  });

// ----------------------------------------------------
// PLATFORM WIDE TRANSACTIONS
// ----------------------------------------------------
export const getAllPlatformTransactions = createServerFn({ method: "POST" })
  .handler(async () => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const query = `
      query GetAllPlatformTransactions {
        organizer_invoices(order_by: {created_at: desc}) {
          id
          amount
          status
          created_at
          organizer_id
          subscription_id
        }
        organizers {
          id
          name
          handle
          email
          image
        }
        subscriptions {
          id
          next_billing_date
          plan_id
          pricing_plan {
            name
            currency
          }
        }
      }
    `;

    try {
      const data = await hasuraRequest<any>(query, {});
      const invoices = data.organizer_invoices || [];
      const organizers = data.organizers || [];
      const subscriptions = data.subscriptions || [];

      const orgMap = new Map(organizers.map((o: any) => [o.id, o]));
      const subMap = new Map(subscriptions.map((s: any) => [s.id, s]));

      return invoices.map((inv: any) => {
        const org = orgMap.get(inv.organizer_id);
        const sub = subMap.get(inv.subscription_id);
        return {
          ...inv,
          organizer: org || null,
          subscription: sub || null,
        };
      });
    } catch (e) {
      console.error("Failed to fetch platform transactions:", e);
      return [];
    }
  });

// ----------------------------------------------------
// ADMIN WITHDRAWAL MANAGEMENT
// ----------------------------------------------------

export const getAdminWithdrawals = createServerFn({ method: "POST" })
  .handler(async () => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    // Step 1: Fetch all withdrawal requests
    const query = `
      query GetAdminWithdrawals {
        withdrawal_requests(
          order_by: { created_at: desc }
        ) {
          id
          amount
          net_amount
          currency
          status
          payout_method
          payout_account
          created_at
          updated_at
          workspace_id
        }
      }
    `;

    try {
      const data = await hasuraRequest<any>(query, {});
      const transactions = data.withdrawal_requests || [];
      if (transactions.length === 0) return [];

      // Step 2: Get unique workspace IDs, look up the organizer via workspaces
      const wsIds = [...new Set(transactions.map((t: any) => t.workspace_id).filter(Boolean))];

      let wsOrgMap = new Map<string, string>(); // workspace_id -> organizer_id
      let orgMap = new Map<string, any>();       // organizer_id -> organizer

      if (wsIds.length > 0) {
        const wsQuery = `
          query GetWorkspacesForWithdrawals($ids: [uuid!]!) {
            workspaces(where: { id: { _in: $ids } }) {
              id
              name
              orgnizer_id
            }
          }
        `;
        const wsData = await hasuraRequest<any>(wsQuery, { ids: wsIds });
        const workspaces: any[] = wsData.workspaces || [];
        workspaces.forEach((w: any) => wsOrgMap.set(w.id, w.orgnizer_id));

        const orgIds = [...new Set(workspaces.map((w: any) => w.orgnizer_id).filter(Boolean))];
        if (orgIds.length > 0) {
          const orgQuery = `
            query GetOrgsForWithdrawals($ids: [uuid!]!) {
              organizers(where: { id: { _in: $ids } }) {
                id
                name
                email
                phone
                image
                handle
              }
            }
          `;
          const orgData = await hasuraRequest<any>(orgQuery, { ids: orgIds });
          orgMap = new Map((orgData.organizers || []).map((o: any) => [o.id, o]));
        }
      }

      return transactions.map((tx: any) => {
        const orgId = wsOrgMap.get(tx.workspace_id);
        return {
          ...tx,
          // map to raw_callback_data so the UI badge "Admin approval needed" keeps working
          raw_callback_data: { requires_admin_approval: true },
          organizer: orgId ? (orgMap.get(orgId) || null) : null,
        };
      });
    } catch (e) {
      console.error("Failed to fetch admin withdrawals:", e);
      return [];
    }
  });

export const sendAdminWithdrawalOtp = createServerFn({ method: "POST" })
  .validator((d: { transactionId: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const { transactionId } = ctx.data;

    // Step 1: Get request
    const txQuery = `
      query GetTxForOtp($id: uuid!) {
        withdrawal_requests_by_pk(id: $id) {
          id
          amount
          currency
          status
          workspace_id
        }
      }
    `;
    const txData = await hasuraRequest<any>(txQuery, { id: transactionId });
    const tx = txData.withdrawal_requests_by_pk;
    if (!tx) throw new Error("Transaction not found");
    if (tx.status !== "pending") throw new Error(`Transaction is already ${tx.status}`);

    // Step 2: Get organizer via workspace
    const wsQuery = `
      query GetWsOrg($id: uuid!) {
        workspaces_by_pk(id: $id) {
          orgnizer_id
        }
      }
    `;
    const wsData = await hasuraRequest<any>(wsQuery, { id: tx.workspace_id });
    const organizerId = wsData.workspaces_by_pk?.orgnizer_id;
    if (!organizerId) throw new Error("Workspace or organizer not found");

    const orgQuery = `
      query GetOrgForOtp($id: uuid!) {
        organizers_by_pk(id: $id) {
          name
          email
          phone
        }
      }
    `;
    const orgData = await hasuraRequest<any>(orgQuery, { id: organizerId });
    const organizer = orgData.organizers_by_pk;
    if (!organizer) throw new Error("Organizer not found");
    if (!organizer.email) throw new Error("Organizer has no email address on file");

    // Step 3: Generate 6-digit OTP and sign a JWT
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const { default: bcrypt } = await import("bcryptjs");
    const { SignJWT } = await import("jose");

    const hashedOtp = await bcrypt.hash(otp, 10);
    const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "super_secret_key_12345");
    const token = await new SignJWT({ otp: hashedOtp, transactionId, type: "admin_withdrawal_otp" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("10m")
      .sign(SECRET_KEY);

    // Step 4: Send via Resend email
    if (!process.env.RESEND_API_KEY) {
      console.log(`[DEV] Admin Withdrawal OTP for ${organizer.name} (${organizer.email}): ${otp}`);
      return { success: true, token, email: organizer.email };
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Agatike Connect <hello@agatike.rw>",
        to: [organizer.email],
        subject: `Your Withdrawal Authorization Code: ${otp}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;border:1px solid #eee;border-radius:12px">
            <h2 style="color:#f97316;margin-top:0">Withdrawal Authorization Code</h2>
            <p style="color:#333">Hi <strong>${organizer.name}</strong>,</p>
            <p style="color:#555">An Agatike admin is processing a withdrawal from your account. Please provide them with the following code:</p>
            <div style="font-size:40px;font-weight:800;letter-spacing:8px;color:#f97316;padding:24px;background:#fff8f5;border:2px dashed #f97316;border-radius:10px;text-align:center;margin:24px 0">${otp}</div>
            <p style="color:#555">This code is valid for <strong>10 minutes</strong>. Do not share it with anyone other than the Agatike admin you are speaking with.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
            <p style="color:#999;font-size:13px">Withdrawal amount: <strong>${tx.currency} ${Number(tx.amount).toLocaleString()}</strong></p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.json().catch(() => ({}));
      throw new Error(`Failed to send OTP email: ${errBody?.message || emailRes.status}`);
    }

    return { success: true, token, email: organizer.email };
  });

export const approveAdminPayout = createServerFn({ method: "POST" })
  .validator((d: { transactionId: string; otpToken: string; otp: string; overrideNetworkId?: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const { transactionId, otpToken, otp, overrideNetworkId } = ctx.data;

    // Verify OTP
    const { jwtVerify } = await import("jose");
    const { default: bcrypt } = await import("bcryptjs");
    const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "super_secret_key_12345");

    try {
      const { payload } = await jwtVerify(otpToken, SECRET_KEY);
      if (payload.type !== "admin_withdrawal_otp") throw new Error("Invalid token type");
      if (payload.transactionId !== transactionId) throw new Error("Token mismatch");

      const isValid = await bcrypt.compare(otp, payload.otp as string);
      if (!isValid) throw new Error("Incorrect OTP");
    } catch (err: any) {
      throw new Error(err.message || "Invalid or expired OTP");
    }

    // 1. Fetch the withdrawal request
    const reqQuery = `
      query GetWithdrawalRequest($id: uuid!) {
        withdrawal_requests_by_pk(id: $id) {
          id
          wallet_id
          workspace_id
          amount
          net_amount
          currency
          payout_method
          payout_account
          network_id
          country_code
          status
          target_currency
          exchange_rate
          platform_fee
          network_fee
        }
      }
    `;
    const reqData = await hasuraRequest<any>(reqQuery, { id: transactionId });
    const req = reqData.withdrawal_requests_by_pk;
    if (!req) throw new Error("Withdrawal request not found");
    if (req.status !== "pending") throw new Error(`Request is already ${req.status}`);

    // 2. Deduct wallet & insert wallet_transaction
    const totalFee = (req.platform_fee || 0) + (req.network_fee || 0);
    const executeMutation = `
      mutation ExecuteWithdrawal(
        $wallet_id: uuid!
        $workspace_id: uuid!
        $amount: numeric!
        $amount_str: String!
        $deduct_amount: numeric!
        $net_amount_str: String!
        $currency: String!
        $payout_method: String!
        $payout_account: String!
        $description: String!
        $raw_callback_data: jsonb
        $updated_at: timestamptz!
      ) {
        update_wallets(
          where: { id: { _eq: $wallet_id }, amount: { _gte: $amount } }
          _inc: { amount: $deduct_amount }
          _set: { updated_at: $updated_at }
        ) {
          affected_rows
        }
        insert_wallet_transactions_one(object: {
          wallet_id: $wallet_id
          workspace_id: $workspace_id
          amount: $amount_str
          net_amount: $net_amount_str
          currency: $currency
          payout_method: $payout_method
          payout_account: $payout_account
          description: $description
          status: "pending"
          type: "withdrawal"
          provider_reference: "PENDING"
          provider_status: "PENDING"
          raw_callback_data: $raw_callback_data
        }) {
          id
        }
      }
    `;

    const description = `[ADMIN APPROVED] Withdrawal to ${req.payout_method} (${req.payout_account}) | Base: ${req.amount} ${req.currency} | Fee: ${totalFee.toFixed(2)} ${req.currency}`;

    const execData = await hasuraRequest<any>(executeMutation, {
      wallet_id: req.wallet_id,
      workspace_id: req.workspace_id,
      amount: req.amount,
      amount_str: String(req.amount),
      deduct_amount: -req.amount,
      net_amount_str: String(req.net_amount),
      currency: req.currency,
      payout_method: req.payout_method,
      payout_account: req.payout_account,
      description,
      raw_callback_data: {
        network_id: overrideNetworkId || req.network_id,
        country_code: req.country_code,
        payout_method: req.payout_method,
        amount: req.amount,
        netAmount: req.net_amount,
        totalFee,
        target_currency: req.target_currency,
        exchange_rate: req.exchange_rate,
        requires_admin_approval: true,
      },
      updated_at: new Date().toISOString()
    });

    if (execData.update_wallets.affected_rows === 0) {
      throw new Error("Failed to deduct from wallet. Insufficient balance.");
    }

    const newTxId = execData.insert_wallet_transactions_one.id;
    const netProfit = (req.platform_fee || 0) - (req.network_fee || 0);

    // 3. Mark the withdrawal request as approved, link the transaction, and insert earnings
    const updateReqMutation = `
      mutation UpdateRequestAndEarnings(
        $id: uuid!, 
        $tx_id: uuid!, 
        $admin_id: uuid!,
        $gross_amount: numeric!,
        $provider_cost: numeric!,
        $platform_revenue: numeric!,
        $net_profit: numeric!,
        $currency: String!
      ) {
        update_withdrawal_requests_by_pk(
          pk_columns: { id: $id }
          _set: { 
            status: "approved", 
            wallet_transaction_id: $tx_id,
            admin_user_id: $admin_id,
            approved_at: "now()"
          }
        ) {
          id
        }
        insert_earnings_one(object: {
          wallet_transaction_id: $tx_id
          withdrawal_request_id: $id
          transaction_type: "withdrawal"
          gross_amount: $gross_amount
          provider_cost: $provider_cost
          platform_revenue: $platform_revenue
          net_profit: $net_profit
          currency: $currency
          status: "pending"
        }) {
          id
        }
      }
    `;
    await hasuraRequest(updateReqMutation, { 
      id: req.id, 
      tx_id: newTxId, 
      admin_id: session.sub,
      gross_amount: req.amount,
      provider_cost: req.network_fee || 0,
      platform_revenue: req.platform_fee || 0,
      net_profit: netProfit,
      currency: req.currency || "RWF"
    });

    // 4. Trigger the PawaPay payout with the newly created wallet transaction ID
    const { triggerPawaPayPayout } = await import("./pawapay");
    const result = await triggerPawaPayPayout({ data: { transactionId: newTxId } } as any);

    return { success: true, pawapayResult: result };
  });

export const rejectAdminPayout = createServerFn({ method: "POST" })
  .validator((d: { transactionId: string; reason?: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const { transactionId, reason } = ctx.data;

    const query = `
      query GetReq($id: uuid!) {
        withdrawal_requests_by_pk(id: $id) {
          id
          status
        }
      }
    `;
    const res = await hasuraRequest<any>(query, { id: transactionId });
    const req = res.withdrawal_requests_by_pk;

    if (!req) throw new Error("Withdrawal request not found");
    if (req.status !== "pending") throw new Error(`Request is already ${req.status}. Cannot reject.`);

    // Just mark as rejected — no wallet refund needed since it was never deducted
    const mutation = `
      mutation RejectRequest($id: uuid!, $reason: String, $admin_id: uuid!) {
        update_withdrawal_requests_by_pk(
          pk_columns: { id: $id }
          _set: { 
            status: "rejected", 
            rejection_reason: $reason, 
            admin_user_id: $admin_id,
            updated_at: "now()" 
          }
        ) {
          id
        }
      }
    `;

    await hasuraRequest<any>(mutation, {
      id: transactionId,
      reason: reason || "Rejected by admin",
      admin_id: session.sub,
    });

    return { success: true };
  });


