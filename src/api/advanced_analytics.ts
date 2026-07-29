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
        fields = `id name created_at city logo type address country currency`;
        break;

      case "events":
        baseWhere = { workspaces: { orgnizer_id: { _eq: organizer_id } }, created_at: { _gte: start_date, _lte: end_date } };
        typeName = "events_bool_exp";
        dataKey = "events";
        fields = `id title category cover created_at deleted description event_type suspended updated_at vipPerks workspace_id 
          tour_stops
          event_tickets { id name cost remaining sold type is_consumable }
          workspaces { id name city logo created_at }`;
        break;

      case "attendees":
        baseWhere = { events: { workspaces: { orgnizer_id: { _eq: organizer_id } } }, created_at: { _gte: start_date, _lte: end_date } };
        typeName = "event_attendees_bool_exp";
        dataKey = "event_attendees";
        fields = `id created_at updated_at user_id type ticket_type ticket_id status schedule_id scanned_at scanned quanity qrcode_number phone payment_method names email event_id custom_fields
          events { id title category cover created_at deleted description event_type suspended updated_at vipPerks workspace_id tour_stops }
          event_tickets { id name cost remaining sold type is_consumable product_orders { id amount_paid created_at current_balance decrptions picked phone product_id qty size status } }
          users { id email username phone country dateOfBirth gender handle active banned created_at profile }`;
        break;

      case "venue_bookings":
        baseWhere = { created_at: { _gte: start_date, _lte: end_date } };
        typeName = "venue_bookings_bool_exp";
        dataKey = "venue_bookings";
        fields = `id created_at updated_at start_time end_time status amount customer_email customer_phone customer_name payment_status booking_type total_amount`;
        break;

      case "ticket_tiers":
        baseWhere = { workspace_id: { _eq: organizer_id }, created_at: { _gte: start_date, _lte: end_date } };
        typeName = "cinema_ticket_tiers_bool_exp";
        dataKey = "cinema_ticket_tiers";
        fields = `id created_at updated_at name price type status currency description is_vip includes_glasses is_3d is_imax is_kids`;
        break;

      case "products":
        baseWhere = { workspace_id: { _eq: organizer_id }, created_at: { _gte: start_date, _lte: end_date } };
        typeName = "products_bool_exp";
        dataKey = "products";
        fields = `id created_at updated_at name type price stock_limit description image_url category is_active sold_count`;
        break;

      case "orders":
        baseWhere = { created_at: { _gte: start_date, _lte: end_date } };
        typeName = "product_orders_bool_exp";
        dataKey = "product_orders";
        fields = `id created_at updated_at amount_paid status qty phone size picked product_id ticket_id decrptions current_balance
          product { id name type price stock_limit description image_url }`;
        break;

      case "cinemas":
        baseWhere = { workspaces: { orgnizer_id: { _eq: organizer_id } }, created_at: { _gte: start_date, _lte: end_date } };
        typeName = "cinemas_bool_exp";
        dataKey = "cinemas";
        fields = `id name created_at updated_at city country cover_url logo_url address description email phone status workspaces { id name city logo }`;
        break;

      case "movies":
        baseWhere = { created_at: { _gte: start_date, _lte: end_date } };
        typeName = "cinema_movies_bool_exp";
        dataKey = "cinema_movies";
        fields = `id title created_at updated_at genre duration_minutes language release_date synopsis director distributor rating status cover_url trailer_url`;
        break;

      case "cinema_bookings":
        baseWhere = { created_at: { _gte: start_date, _lte: end_date } };
        typeName = "cinema_bookings_bool_exp";
        dataKey = "cinema_bookings";
        fields = `id total_price quantity created_at updated_at status email phone names payment_method currency`;
        break;

      case "reviews":
        baseWhere = { created_at: { _gte: start_date, _lte: end_date } };
        typeName = "event_feedback_bool_exp";
        dataKey = "event_feedback";
        fields = `id rating reviewer_name reviewer_email created_at title body source is_verified events { id title category }`;
        break;

      case "forms":
        baseWhere = { workspaces: { orgnizer_id: { _eq: organizer_id } }, created_at: { _gte: start_date, _lte: end_date } };
        typeName = "custom_forms_bool_exp";
        dataKey = "custom_forms";
        fields = `id title description created_at updated_at type is_active workspace { id name }`;
        break;

      case "facilities":
        baseWhere = { workspaces: { orgnizer_id: { _eq: organizer_id } }, created_at: { _gte: start_date, _lte: end_date } };
        typeName = "rentable_venues_bool_exp";
        dataKey = "rentable_venues";
        fields = `id name created_at updated_at address city country capacity type status description amenities workspace { id name }`;
        break;

      case "memberships":
        baseWhere = { workspace_id: { _eq: organizer_id }, created_at: { _gte: start_date, _lte: end_date } };
        typeName = "space_subscriptions_bool_exp";
        dataKey = "space_subscriptions";
        fields = `id created_at status plan_name price billing_cycle start_date next_billing_date booking_type customer_name customer_email customer_phone user { id email username phone country }`;
        break;

      case "workspace_users":
        baseWhere = { workspace_id: { _eq: organizer_id }, created_at: { _gte: start_date, _lte: end_date } };
        typeName = "workspace_users_bool_exp";
        dataKey = "workspace_users";
        fields = `id created_at role email status name is_temporary expires_at`;
        break;

      case "wallet_transactions":
        baseWhere = { workspace_id: { _eq: organizer_id }, created_at: { _gte: start_date, _lte: end_date } };
        typeName = "wallet_transactions_bool_exp";
        dataKey = "wallet_transactions";
        fields = `id created_at updated_at amount type status reference_id description net_amount platform_fee`;
        break;

      case "ledger_transactions":
        baseWhere = { created_at: { _gte: start_date, _lte: end_date } };
        typeName = "ledger_transactions_bool_exp";
        dataKey = "ledger_transactions";
        fields = `id created_at amount entry_type account_type currency description reference_id`;
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

    return { rawData, aggregatedData: [] };
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
