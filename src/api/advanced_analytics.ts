import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

export type LogicalOperator = "and" | "or";

export interface FilterRule {
  type: "rule";
  field: string;
  operator: string;
  value: any;
}

export interface FilterGroup {
  type: "group";
  logicalOperator: LogicalOperator;
  conditions: (FilterRule | FilterGroup)[];
}

// Keeping AnalyticsFilter for backward compatibility or replace entirely
export type AnalyticsFilter = FilterRule | FilterGroup;

export interface AdvancedQueryInput {
  organizer_id: string;
  entity_type: string;
  start_date: string;
  end_date: string;
  group_by?: string;
  filters?: AnalyticsFilter[];
}

export const executeAdvancedQuery = createServerFn({ method: "POST" })
  .validator((d: AdvancedQueryInput) => d)
  .handler(async (ctx) => {
    const { organizer_id, entity_type, start_date, end_date, group_by, filters } = ctx.data;
    if (!organizer_id) throw new Error("organizer_id is required");

    const start = new Date(start_date);
    const end = new Date(end_date);
    const monthDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthDiff > 3.5) {
      // Allow user to wait longer for large queries, but we log a warning or could throw later.
    }

    let query = "";
    let baseWhere: any = {};
    let dataKey = "";
    let typeName = "";
    let fields = "";

    switch (entity_type) {
      case "workspaces":
        baseWhere = { orgnizer_id: { _eq: organizer_id }, created_at: { _gte: start_date, _lte: end_date } };
        typeName = "workspaces_bool_exp";
        dataKey = "workspaces";
        fields = `id name created_at city logo`;
        break;

      case "events":
        baseWhere = { workspaces: { orgnizer_id: { _eq: organizer_id } }, created_at: { _gte: start_date, _lte: end_date } };
        typeName = "events_bool_exp";
        dataKey = "events";
        fields = `id title created_at category event_type venue_details tour_stops`;
        break;

      case "attendees":
        baseWhere = { events: { workspaces: { orgnizer_id: { _eq: organizer_id } } }, created_at: { _gte: start_date, _lte: end_date } };
        typeName = "event_attendees_bool_exp";
        dataKey = "event_attendees";
        fields = `id created_at status email phone names type ticket_type quanity qrcode_number`;
        break;

      case "orders":
        baseWhere = { created_at: { _gte: start_date, _lte: end_date } };
        typeName = "product_orders_bool_exp";
        dataKey = "product_orders";
        fields = `id created_at amount_paid status qty phone size picked product { name type }`;
        break;

      case "movies":
        baseWhere = { created_at: { _gte: start_date, _lte: end_date } };
        typeName = "cinema_movies_bool_exp";
        dataKey = "cinema_movies";
        fields = `id title created_at genre duration language release_date`;
        break;

      case "cinema_bookings":
        baseWhere = { created_at: { _gte: start_date, _lte: end_date } };
        typeName = "cinema_bookings_bool_exp";
        dataKey = "cinema_bookings";
        fields = `id total_price quantity created_at status customer_email customer_phone payment_method`;
        break;

      case "reviews":
        baseWhere = { created_at: { _gte: start_date, _lte: end_date } };
        typeName = "event_feedback_bool_exp";
        dataKey = "event_feedback";
        fields = `id rating reviewer_name reviewer_email created_at title body source is_verified`;
        break;

      case "forms":
        baseWhere = { workspaces: { orgnizer_id: { _eq: organizer_id } }, created_at: { _gte: start_date, _lte: end_date } };
        typeName = "custom_forms_bool_exp";
        dataKey = "custom_forms";
        fields = `id title description created_at workspace_id`;
        break;

      case "facilities":
        baseWhere = { workspaces: { orgnizer_id: { _eq: organizer_id } }, created_at: { _gte: start_date, _lte: end_date } };
        typeName = "rentable_venues_bool_exp";
        dataKey = "rentable_venues";
        fields = `id name created_at price_per_day capacity location`;
        break;
        
      default:
        throw new Error(`Unsupported entity type: ${entity_type}`);
    }

    const where = { ...baseWhere };
    
    if (filters && Array.isArray(filters)) {
      // Backward compatibility for old flat array
      const andClause: any[] = [];
      for (const f of filters) {
        if (!f.field || !f.operator || f.value === "") continue;
        let val: any = f.value;
        if (f.operator === "_ilike") {
          val = `%${f.value}%`;
        } else if (!isNaN(Number(f.value))) {
          val = Number(f.value);
        }
        
        const parts = f.field.split(".");
        let current: any = {};
        let temp = current;
        for (let i = 0; i < parts.length - 1; i++) {
          temp[parts[i]] = {};
          temp = temp[parts[i]];
        }
        temp[parts[parts.length - 1]] = { [f.operator]: val };
        andClause.push(current);
      }
      if (andClause.length > 0) {
        where._and = andClause;
      }
    } else if (filters && typeof filters === "object" && filters.type === "group") {
      // New nested tree logic
      const parseNode = (node: any): any => {
        if (node.type === "rule") {
          if (!node.field || !node.operator || node.value === "") return null;
          let val: any = node.value;
          if (node.operator === "_ilike") {
            val = `%${node.value}%`;
          } else if (node.operator !== "_is_null" && !isNaN(Number(node.value))) {
            val = Number(node.value);
          }
          const parts = node.field.split(".");
          let current: any = {};
          let temp = current;
          for (let i = 0; i < parts.length - 1; i++) {
            temp[parts[i]] = {};
            temp = temp[parts[i]];
          }
          temp[parts[parts.length - 1]] = { [node.operator]: val };
          return current;
        } else if (node.type === "group") {
          if (!node.conditions || node.conditions.length === 0) return null;
          const parsed = node.conditions.map(parseNode).filter((c: any) => c !== null);
          if (parsed.length === 0) return null;
          if (parsed.length === 1) return parsed[0];
          return { [node.logicalOperator === "or" ? "_or" : "_and"]: parsed };
        }
        return null;
      };
      
      const parsedFilters = parseNode(filters);
      if (parsedFilters) {
        if (where._and) {
          where._and = [...where._and, parsedFilters];
        } else {
          where._and = [parsedFilters];
        }
      }
    }

    query = `
      query GetAnalyticsData($where: ${typeName}!) {
        ${dataKey}(where: $where) {
          ${fields}
        }
      }
    `;

    let variables: Record<string, any> = { where };

    console.log("=== ADVANCED ANALYTICS QUERY ===");
    console.log("Query:\n", query);
    console.log("Variables:\n", JSON.stringify(variables, null, 2));
    console.log("================================");

    const res = await hasuraRequest<any>(query, variables);
    const rawData = res[dataKey] || [];

    if (!group_by) {
      return { rawData, aggregatedData: [] };
    }

    const aggregated = new Map<string, number>();

    rawData.forEach((item: any) => {
      let key = "Unknown";
      
      if (group_by === "month") {
        if (item.created_at) {
          const d = new Date(item.created_at);
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        }
      } else if (group_by === "status") {
        key = item.status || "Unknown";
      } else if (group_by === "country") {
        key = item.user?.country || "Unknown";
      }
      
      const metric = item.amount ? parseFloat(item.amount) : (item.total_price ? parseFloat(item.total_price) : 1);
      
      aggregated.set(key, (aggregated.get(key) || 0) + metric);
    });

    const aggregatedData = Array.from(aggregated.entries()).map(([name, value]) => ({ name, value }));

    return { rawData, aggregatedData };
  });

export const getSavedQueries = createServerFn({ method: "POST" })
  .validator((d: { user_id: string }) => d)
  .handler(async (ctx) => {
    const { user_id } = ctx.data;
    if (!user_id) throw new Error("user_id is required");

    const query = `
      query GetUserProfile($user_id: uuid!) {
        users_by_pk(id: $user_id) {
          profile
        }
      }
    `;
    const res = await hasuraRequest<{ users_by_pk: { profile: any } }>(query, { user_id });
    const profile = res.users_by_pk?.profile || {};
    return profile.saved_analytics_queries || [];
  });

export const saveQueries = createServerFn({ method: "POST" })
  .validator((d: { user_id: string; queries: any[] }) => d)
  .handler(async (ctx) => {
    const { user_id, queries } = ctx.data;
    if (!user_id) throw new Error("user_id is required");

    const fetchQ = `
      query GetUserProfile($user_id: uuid!) {
        users_by_pk(id: $user_id) {
          profile
        }
      }
    `;
    const res = await hasuraRequest<{ users_by_pk: { profile: any } }>(fetchQ, { user_id });
    const currentProfile = res.users_by_pk?.profile || {};
    
    currentProfile.saved_analytics_queries = queries;

    const mutation = `
      mutation UpdateUserProfile($user_id: uuid!, $profile: jsonb!) {
        update_users_by_pk(pk_columns: {id: $user_id}, _set: {profile: $profile}) {
          id
        }
      }
    `;
    
    await hasuraRequest(mutation, { user_id, profile: currentProfile });
    return { success: true };
  });
