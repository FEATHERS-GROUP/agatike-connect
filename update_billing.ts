import fs from "fs";
let content = fs.readFileSync("src/api/billing.ts", "utf8");

const getWorkspaceUsageStats = `
export const getWorkspaceUsageStats = createServerFn({ method: "POST" })
  .validator((d: { workspace_id: string }) => d)
  .handler(async (ctx) => {
    const query = \`
      query GetWorkspaceUsageStats($workspace_id_uuid: uuid!, $workspace_id_str: String!) {
        events_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        custom_forms_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        workspace_tasks_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        rsvps_aggregate(where: { custom_form: { workspace_id: { _eq: $workspace_id_uuid } } }) { aggregate { count } }
        venue_projects_aggregate(where: { workspaceId: { _eq: $workspace_id_str } }) { aggregate { count } }
        products_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        cinema_movies_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        cinema_screens_aggregate(where: { cinema: { workspace_id: { _eq: $workspace_id_uuid } } }) { aggregate { count } }
        event_post_comments_aggregate(where: { event_post: { workspace_id: { _eq: $workspace_id_uuid } } }) { aggregate { count } }
        badge_projects_aggregate(where: { events: { workspace_id: { _eq: $workspace_id_uuid } } }) { aggregate { count } }
        ticket_projects_aggregate(where: { workspaceId: { _eq: $workspace_id_str } }) { aggregate { count } }
        procurement_invoices_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        agatike_books_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        workspace_notes_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        spaces(where: { workspace_id: { _eq: $workspace_id_uuid } }) { locations plans }
      }
    \`;

    try {
      const res = await hasuraRequest<any>(query, { 
        workspace_id_uuid: ctx.data.workspace_id,
        workspace_id_str: ctx.data.workspace_id
      });
      
      let locationsCount = 0;
      let membershipPlansCount = 0;
      if (res.spaces) {
        for (const space of res.spaces) {
          if (Array.isArray(space.locations)) locationsCount += space.locations.length;
          if (Array.isArray(space.plans)) membershipPlansCount += space.plans.length;
        }
      }

      return {
        events: res.events_aggregate?.aggregate?.count || 0,
        custom_forms: res.custom_forms_aggregate?.aggregate?.count || 0,
        tasks: res.workspace_tasks_aggregate?.aggregate?.count || 0,
        rsvps: res.rsvps_aggregate?.aggregate?.count || 0,
        venue_designs: res.venue_projects_aggregate?.aggregate?.count || 0,
        products: res.products_aggregate?.aggregate?.count || 0,
        movies: res.cinema_movies_aggregate?.aggregate?.count || 0,
        screens: res.cinema_screens_aggregate?.aggregate?.count || 0,
        comments: res.event_post_comments_aggregate?.aggregate?.count || 0,
        badge_designs: res.badge_projects_aggregate?.aggregate?.count || 0,
        ticket_designs: res.ticket_projects_aggregate?.aggregate?.count || 0,
        procurements: res.procurement_invoices_aggregate?.aggregate?.count || 0,
        books: res.agatike_books_aggregate?.aggregate?.count || 0,
        notes: res.workspace_notes_aggregate?.aggregate?.count || 0,
        experiences: res.events_aggregate?.aggregate?.count || 0,
        locations: locationsCount,
        membership_plans: membershipPlansCount,
      };
    } catch (e) {
      console.error("Failed to fetch workspace usage stats", e);
      return {
        events: 0, custom_forms: 0, tasks: 0, rsvps: 0, venue_designs: 0,
        products: 0, movies: 0, screens: 0, comments: 0, badge_designs: 0,
        ticket_designs: 0, procurements: 0, books: 0, notes: 0, experiences: 0,
        locations: 0, membership_plans: 0
      };
    }
  });
`;

content = content + "\n" + getWorkspaceUsageStats;
fs.writeFileSync("src/api/billing.ts", content);
