import { createServerFn } from "@tanstack/react-start";
import { getAdminSession } from "./admin_auth";
import { hasuraRequest } from "./graphql.server";

export const getAdminDashboardStats = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getAdminSession();
  if (!session) throw new Error("unauthenticated");

  const query = `
    query GetAdminDashboardStats {
      users_aggregate { aggregate { count } }
      organizers_aggregate { aggregate { count } }
      workspaces_aggregate { aggregate { count } }
      workspace_users_aggregate { aggregate { count } }
      platformModules_aggregate { aggregate { count } }
      workspace_pages_aggregate { aggregate { count } }
      ticket_projects_aggregate { aggregate { count } }
      badge_projects_aggregate { aggregate { count } }
      venue_projects_aggregate { aggregate { count } }
      
      earnings_aggregate(where: { status: { _in: ["success", "completed"] } }) {
        aggregate {
          sum {
            platform_revenue
            provider_cost
          }
        }
      }

      wallets_aggregate {
        aggregate {
          count
          sum {
            amount
          }
        }
      }

      earnings(where: { status: { _in: ["success", "completed"] } }, order_by: { created_at: asc }, limit: 1000) {
        id
        transaction_type
        platform_revenue
        created_at
      }

      subscriptions(where: { status: { _eq: "active" } }) {
        id
        plan_id
        pricing_plan {
          name
        }
      }

      events(order_by: { created_at: desc }, limit: 1000) {
        id
        created_at
        schedules {
          start_date
        }
      }

      demographic_workspaces: workspaces {
        country
        city
      }
      demographic_users: users {
        gender
        dateOfBirth
      }
      demographic_organizers: organizers {
        gender
      }
    }
  `;

  try {
    const data = await hasuraRequest<any>(query);

    return {
      users: data.users_aggregate?.aggregate?.count || 0,
      organizers: data.organizers_aggregate?.aggregate?.count || 0,
      workspaces: data.workspaces_aggregate?.aggregate?.count || 0,
      staff: data.workspace_users_aggregate?.aggregate?.count || 0,
      modules: data.platformModules_aggregate?.aggregate?.count || 0,
      designProjects: 
        (data.workspace_pages_aggregate?.aggregate?.count || 0) +
        (data.ticket_projects_aggregate?.aggregate?.count || 0) +
        (data.badge_projects_aggregate?.aggregate?.count || 0) +
        (data.venue_projects_aggregate?.aggregate?.count || 0),
      revenue: data.earnings_aggregate?.aggregate?.sum?.platform_revenue || 0,
      providerCost: data.earnings_aggregate?.aggregate?.sum?.provider_cost || 0,
      totalWallets: data.wallets_aggregate?.aggregate?.count || 0,
      totalWalletBalance: data.wallets_aggregate?.aggregate?.sum?.amount || 0,
      earnings: data.earnings || [],
      subscriptions: data.subscriptions || [],
      events: data.events || [],
      workspacesDemographics: data.demographic_workspaces || [],
      usersDemographics: data.demographic_users || [],
      organizersDemographics: data.demographic_organizers || [],
    };
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    // Return safe default values so the dashboard doesn't crash completely
    return {
      users: 0,
      organizers: 0,
      workspaces: 0,
      staff: 0,
      modules: 0,
      designProjects: 0,
      revenue: 0,
      providerCost: 0,
      totalWallets: 0,
      totalWalletBalance: 0,
      earnings: [],
      subscriptions: [],
      events: [],
      workspacesDemographics: [],
      usersDemographics: [],
      organizersDemographics: [],
      error: error.message
    };
  }
});
