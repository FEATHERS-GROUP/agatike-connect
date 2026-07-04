import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getAdminSession } from "./admin_auth";

// --- Provider Fees ---

export const getPaymentProviderFeesAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  const GET_PROVIDER_FEES = `
    query GetProviderFees {
      payment_provider_fees(order_by: { network: asc }) {
        id
        network
        country_code
        collection_percentage
        collection_fixed_fee
        disbursement_percentage
        disbursement_fixed_fee
        is_tiered
        tiered_rules
        category
        updated_at
      }
    }
  `;
  const data = await hasuraRequest<any>(GET_PROVIDER_FEES);
  return data.payment_provider_fees || [];
});

export const updatePaymentProviderFeeAdmin = createServerFn({ method: "POST" })
  .validator((d: { id: string; updates: Record<string, any> }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("Unauthorized");

    const { id, updates } = ctx.data;
    
    // Convert rules back to string if it's an object to safely store in jsonb
    let formattedUpdates = { ...updates };
    if (formattedUpdates.tiered_rules && typeof formattedUpdates.tiered_rules !== "string") {
      formattedUpdates.tiered_rules = JSON.stringify(formattedUpdates.tiered_rules);
    }

    // Build dynamic mutation
    const updateKeys = Object.keys(formattedUpdates).filter(k => k !== "id");
    const setArgs = updateKeys.map(k => `${k}: $${k}`).join(", ");
    
    const query = `
      mutation UpdateProviderFee($id: uuid!, ${updateKeys.map(k => `$${k}: ${typeof formattedUpdates[k] === 'number' ? 'numeric' : typeof formattedUpdates[k] === 'boolean' ? 'Boolean' : 'String'}`).join(', ')}) {
        update_payment_provider_fees_by_pk(
          pk_columns: { id: $id }
          _set: { ${setArgs} }
        ) {
          id
        }
      }
    `;

    await hasuraRequest(query, { id, ...formattedUpdates });
    return { success: true };
  });

export const createPaymentProviderFeeAdmin = createServerFn({ method: "POST" })
  .validator((d: { data: Record<string, any> }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("Unauthorized");

    let formattedData = { ...ctx.data.data };
    if (formattedData.tiered_rules && typeof formattedData.tiered_rules !== "string") {
      formattedData.tiered_rules = JSON.stringify(formattedData.tiered_rules);
    }
    
    // Convert numeric strings to numbers and boolean strings to booleans
    const numericFields = ['collection_percentage', 'collection_fixed_fee', 'disbursement_percentage', 'disbursement_fixed_fee'];
    for (const field of numericFields) {
      if (formattedData[field] !== undefined) formattedData[field] = Number(formattedData[field]);
    }
    if (formattedData.is_tiered === "true") formattedData.is_tiered = true;
    if (formattedData.is_tiered === "false") formattedData.is_tiered = false;

    const query = `
      mutation CreateProviderFee($object: payment_provider_fees_insert_input!) {
        insert_payment_provider_fees_one(object: $object) {
          id
        }
      }
    `;

    await hasuraRequest(query, { object: formattedData });
    return { success: true };
  });

// --- Pricing Plans ---

export const getPricingPlansAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  const GET_PRICING_PLANS = `
    query GetPricingPlans {
      pricing_plans(order_by: { price: asc }) {
        id
        name
        description
        price
        currency
        billing_cycle
        features
        modules_included
        usage_limits
        is_popular
        created_at
        updated_at
        yearly_price
        customer_service_fee_percentage
        organizer_platform_contribution
        active
        platform_margin_buffer
        max_withdrawals_per_week
        customer_collection_fee_percentage
        customer_collection_fee_fixed
        organizer_collection_fee_percentage
        organizer_collection_fee_fixed
        withdrawal_fee_percentage
        withdrawal_fee_fixed
        max_collection_subsidy_percentage
        enable_subsidized_collection
        withdrawal_dependency_required
      }
    }
  `;
  const data = await hasuraRequest<any>(GET_PRICING_PLANS);
  return data.pricing_plans || [];
});

export const updatePricingPlanAdmin = createServerFn({ method: "POST" })
  .validator((d: { id: string; updates: Record<string, any> }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("Unauthorized");

    const { id, updates } = ctx.data;
    let formattedUpdates = { ...updates };
    
    // Let Hasura handle the jsonb objects directly
    // Ensure they are arrays/objects if they came in as strings (e.g. from UI state if not parsed)
    if (typeof formattedUpdates.features === "string") {
      try { formattedUpdates.features = JSON.parse(formattedUpdates.features); } catch(e) {}
    }
    if (typeof formattedUpdates.modules_included === "string") {
      try { formattedUpdates.modules_included = JSON.parse(formattedUpdates.modules_included); } catch(e) {}
    }
    if (typeof formattedUpdates.usage_limits === "string") {
      try { formattedUpdates.usage_limits = JSON.parse(formattedUpdates.usage_limits); } catch(e) {}
    }

    const updateKeys = Object.keys(formattedUpdates).filter(k => k !== "id");
    const setArgs = updateKeys.map(k => `${k}: $${k}`).join(", ");

    const getType = (k: string, val: any) => {
      if (['features', 'modules_included', 'usage_limits'].includes(k)) return 'jsonb';
      if (typeof val === 'number') return 'numeric';
      if (typeof val === 'boolean') return 'Boolean';
      return 'String';
    };

    const query = `
      mutation UpdatePricingPlan($id: uuid!, ${updateKeys.map(k => `$${k}: ${getType(k, formattedUpdates[k])}`).join(', ')}) {
        update_pricing_plans_by_pk(
          pk_columns: { id: $id }
          _set: { ${setArgs} }
        ) {
          id
        }
      }
    `;

    await hasuraRequest(query, { id, ...formattedUpdates });
    return { success: true };
  });

export const createPricingPlanAdmin = createServerFn({ method: "POST" })
  .validator((d: { data: Record<string, any> }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("Unauthorized");

    let formattedData = { ...ctx.data.data };
    
    // Let Hasura handle the jsonb objects directly
    // Ensure they are arrays/objects if they came in as strings
    if (typeof formattedData.features === "string") {
      try { formattedData.features = JSON.parse(formattedData.features); } catch(e) {}
    }
    if (typeof formattedData.modules_included === "string") {
      try { formattedData.modules_included = JSON.parse(formattedData.modules_included); } catch(e) {}
    }
    if (typeof formattedData.usage_limits === "string") {
      try { formattedData.usage_limits = JSON.parse(formattedData.usage_limits); } catch(e) {}
    }

    // Convert strings to numbers where appropriate
    const numericFields = [
      'price', 'yearly_price', 'customer_service_fee_percentage', 
      'organizer_platform_contribution', 'platform_margin_buffer',
      'customer_collection_fee_percentage', 'customer_collection_fee_fixed',
      'organizer_collection_fee_percentage', 'organizer_collection_fee_fixed',
      'withdrawal_fee_percentage', 'withdrawal_fee_fixed',
      'max_collection_subsidy_percentage'
    ];
    for (const field of numericFields) {
      if (formattedData[field] !== undefined && formattedData[field] !== null && formattedData[field] !== "") {
        formattedData[field] = Number(formattedData[field]);
      }
    }
    
    // Booleans
    const booleanFields = ['active', 'is_popular', 'enable_subsidized_collection', 'withdrawal_dependency_required'];
    for (const field of booleanFields) {
      if (formattedData[field] === "true") formattedData[field] = true;
      if (formattedData[field] === "false") formattedData[field] = false;
    }

    const query = `
      mutation CreatePricingPlan($object: pricing_plans_insert_input!) {
        insert_pricing_plans_one(object: $object) {
          id
        }
      }
    `;

    await hasuraRequest(query, { object: formattedData });
    return { success: true };
  });

export const getPricingPlanStatsAdmin = createServerFn({ method: "POST" })
  .validator((d: { planId: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("Unauthorized");

    const query = `
      query GetPlanStats($planId: uuid!) {
        subscriptions(where: { plan_id: { _eq: $planId } }) {
          id
          status
          amount
          created_at
          workspace_id
          modules
          organizer {
            id
            name
          }
        }
      }
    `;

    const data = await hasuraRequest<any>(query, { planId: ctx.data.planId });
    const subs = data.subscriptions || [];

    const activeSubs = subs.filter((s: any) => s.status === 'active' || s.status === 'ACTIVE');
    const mrr = activeSubs.reduce((acc: number, curr: any) => acc + (parseFloat(curr.amount) || 0), 0);

    return {
      totalSubscribers: subs.length,
      activeSubscribers: activeSubs.length,
      monthlyRecurringRevenue: mrr,
      subscriptions: subs
    };
  });

// --- Earnings ---

export const getEarningsAnalyticsAdmin = createServerFn({ method: "POST" })
  .validator((d: { startDate?: string; endDate?: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("Unauthorized");

    const { startDate, endDate } = ctx.data;

    let dateFilter = "";
    if (startDate && endDate) {
      dateFilter = `created_at: { _gte: "${startDate}", _lte: "${endDate}" }`;
    } else if (startDate) {
      dateFilter = `created_at: { _gte: "${startDate}" }`;
    }

    const GET_EARNINGS = `
      query GetEarnings {
        earnings(
          ${dateFilter ? `where: { ${dateFilter} }` : ""}
          order_by: { created_at: desc }
        ) {
          id
          transaction_type
          gross_amount
          provider_cost
          platform_revenue
          net_profit
          currency
          status
          created_at
          wallet_transaction {
            id
            workspace_id
          }
        }
      }
    `;

    const data = await hasuraRequest<any>(GET_EARNINGS);
    const records = data.earnings || [];

    // Aggregate stats
    const stats = records.reduce((acc: any, record: any) => {
      acc.total_gross += parseFloat(record.gross_amount) || 0;
      acc.total_provider_cost += parseFloat(record.provider_cost) || 0;
      acc.total_revenue += parseFloat(record.platform_revenue) || 0;
      acc.total_net_profit += parseFloat(record.net_profit) || 0;
      return acc;
    }, {
      total_gross: 0,
      total_provider_cost: 0,
      total_revenue: 0,
      total_net_profit: 0
    });

    return { records, stats };
  });

export const getEarningsLedgerAdmin = createServerFn({ method: "POST" })
  .validator((d: { startDate?: string; endDate?: string; limit: number; offset: number }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("Unauthorized");

    const { startDate, endDate, limit, offset } = ctx.data;

    let dateFilter = "";
    if (startDate && endDate) {
      dateFilter = `created_at: { _gte: "${startDate}", _lte: "${endDate}" }`;
    } else if (startDate) {
      dateFilter = `created_at: { _gte: "${startDate}" }`;
    }

    const query = `
      query GetEarningsLedger($limit: Int!, $offset: Int!) {
        earnings(
          ${dateFilter ? `where: { ${dateFilter} }` : ""}
          order_by: { created_at: desc }
          limit: $limit
          offset: $offset
        ) {
          id
          transaction_type
          gross_amount
          provider_cost
          platform_revenue
          net_profit
          currency
          status
          created_at
          wallet_transaction {
            id
            workspace_id
          }
        }
        earnings_aggregate(${dateFilter ? `where: { ${dateFilter} }` : ""}) {
          aggregate {
            count
          }
        }
      }
    `;

    const data = await hasuraRequest<any>(query, { limit, offset });
    return {
      records: data.earnings || [],
      totalCount: data.earnings_aggregate?.aggregate?.count || 0
    };
  });

// --- Platform Modules ---

export const getPlatformModulesAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");

  const query = `
    query GetPlatformModules {
      platformModules(order_by: { label: asc }) {
        id
        label
        category
      }
    }
  `;
  const data = await hasuraRequest<any>(query);
  return data.platformModules || [];
});
