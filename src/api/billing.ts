import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_cycle: "monthly" | "yearly";
  features: string[];
  modules_included: string[];
  usage_limits?: any;
  is_popular: boolean;
  yearly_price?: number;
  customer_service_fee_percentage?: number;
  customer_collection_fee_percentage?: number;
  customer_collection_fee_fixed?: number;
  organizer_platform_contribution?: number;
  organizer_collection_fee_percentage?: number;
  organizer_collection_fee_fixed?: number;
  platform_margin_buffer?: number;
  max_withdrawals_per_week?: string;
  withdrawal_fee_percentage?: number;
  withdrawal_fee_fixed?: string;
}

export interface Subscription {
  id: string;
  organizer_id: string;
  plan_id: string;
  status: "active" | "canceled" | "past_due";
  start_date: any;
  next_billing_date: any;
  amount: number;
  pricing_plan?: PricingPlan;
}

const GET_PLANS = `
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
      yearly_price
      customer_service_fee_percentage
      customer_collection_fee_percentage
      customer_collection_fee_fixed
      organizer_platform_contribution
      organizer_collection_fee_percentage
      organizer_collection_fee_fixed
      platform_margin_buffer
      max_withdrawals_per_week
      withdrawal_fee_percentage
      withdrawal_fee_fixed
    }
  }
`;

export const getPricingPlans = createServerFn({ method: "GET" }).handler(async () => {
  const res = await hasuraRequest<{ pricing_plans: PricingPlan[] }>(GET_PLANS);
  return res.pricing_plans;
});

const GET_ACTIVE_SUB = `
  query GetActiveSub($organizer_id: uuid!) {
    subscriptions(where: { organizer_id: { _eq: $organizer_id }, status: { _eq: "active" } }, limit: 1) {
      id
      plan_id
      status
      start_date
      next_billing_date
      amount
      pricing_plan {
        id
        name
        usage_limits
        customer_service_fee_percentage
        organizer_platform_contribution
        platform_margin_buffer
        max_withdrawals_per_week
        withdrawal_fee_percentage
        withdrawal_fee_fixed
      }
    }
  }
`;

export const getActiveSubscription = createServerFn({ method: "POST" })
  .validator((d: { organizer_id: string }) => d)
  .handler(async (ctx) => {
    const res = await hasuraRequest<{ subscriptions: Subscription[] }>(GET_ACTIVE_SUB, {
      organizer_id: ctx.data.organizer_id,
    });
    return res.subscriptions[0] || null;
  });

const GET_ACTIVE_PLAN_FEES = `
  query GetActivePlanFees($organizer_id: uuid!) {
    subscriptions(where: { organizer_id: { _eq: $organizer_id }, status: { _eq: "active" } }, limit: 1) {
      pricing_plan {
        customer_service_fee_percentage
        customer_collection_fee_percentage
        customer_collection_fee_fixed
        organizer_platform_contribution
        organizer_collection_fee_percentage
        organizer_collection_fee_fixed
        withdrawal_fee_percentage
        withdrawal_fee_fixed
        max_collection_subsidy_percentage
        enable_subsidized_collection
        withdrawal_dependency_required
        platform_margin_buffer
        max_withdrawals_per_week
      }
    }
  }
`;

export const getWorkspaceActivePlanFees = createServerFn({ method: "POST" })
  .validator((d: { organizer_id: string }) => d)
  .handler(async (ctx) => {
    if (!ctx.data.organizer_id)
      return {
        customer_service_fee_percentage: 2.0,
        customer_collection_fee_percentage: 2.0,
        customer_collection_fee_fixed: 0,
        organizer_platform_contribution: 0,
        organizer_collection_fee_percentage: 0,
        organizer_collection_fee_fixed: 0,
        withdrawal_fee_percentage: 0,
        withdrawal_fee_fixed: 0,
        max_collection_subsidy_percentage: 1.0,
        enable_subsidized_collection: true,
        withdrawal_dependency_required: true,
        platform_margin_buffer: 0,
      };
    const res = await hasuraRequest<any>(GET_ACTIVE_PLAN_FEES, {
      organizer_id: ctx.data.organizer_id,
    });
    const plan = res.subscriptions?.[0]?.pricing_plan;
    return {
      customer_service_fee_percentage: plan?.customer_service_fee_percentage ?? 2.0,
      customer_collection_fee_percentage: plan?.customer_collection_fee_percentage ?? 2.0,
      customer_collection_fee_fixed: plan?.customer_collection_fee_fixed ?? 0,
      organizer_platform_contribution: plan?.organizer_platform_contribution ?? 0,
      organizer_collection_fee_percentage: plan?.organizer_collection_fee_percentage ?? 0,
      organizer_collection_fee_fixed: plan?.organizer_collection_fee_fixed ?? 0,
      withdrawal_fee_percentage: plan?.withdrawal_fee_percentage ?? 0,
      withdrawal_fee_fixed: plan?.withdrawal_fee_fixed ?? 0,
      max_collection_subsidy_percentage: plan?.max_collection_subsidy_percentage ?? 1.0,
      enable_subsidized_collection: plan?.enable_subsidized_collection ?? true,
      withdrawal_dependency_required: plan?.withdrawal_dependency_required ?? true,
      platform_margin_buffer: plan?.platform_margin_buffer ?? 0,
    };
  });

const GET_INVOICES = `
  query GetInvoices($organizer_id: String!) {
    organizer_invoices(where: { organizer_id: { _eq: $organizer_id } }, order_by: { created_at: desc }) {
      id
      amount
      status
      created_at
    }
  }
`;

export const getInvoices = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { organizer_id } = ctx.data;
    const res = await hasuraRequest<{ organizer_invoices: any[] }>(GET_INVOICES, { organizer_id });
    return res.organizer_invoices;
  });

const CANCEL_SUB = `
  mutation CancelSub($id: uuid!) {
    update_subscriptions_by_pk(pk_columns: { id: $id }, _set: { status: "canceled" }) {
      id
    }
  }
`;

const CREATE_SUB = `
  mutation CreateSub($object: subscriptions_insert_input!) {
    insert_subscriptions_one(
      object: $object,
      on_conflict: {
        constraint: subscriptions_organizer_id_key,
        update_columns: [plan_id, amount, status, next_billing_date, workspace_id, modules, updated_at]
      }
    ) {
      id
    }
  }
`;

const CREATE_INVOICE = `
  mutation CreateInvoice($object: organizer_invoices_insert_input!) {
    insert_organizer_invoices_one(object: $object) {
      id
    }
  }
`;

export interface PromotionalRule {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  duration_months: number;
  applies_to_cycles: string[];
}

const GET_PROMO_RULES = `
  query GetPromoRules {
    promotional_rules(where: { is_active: { _eq: true } }) {
      id
      name
      description
      discount_percentage
      duration_months
      applies_to_cycles
    }
  }
`;

export const getPromotionalRules = createServerFn({ method: "GET" }).handler(async () => {
  const res = await hasuraRequest<{ promotional_rules: PromotionalRule[] }>(GET_PROMO_RULES);
  return res.promotional_rules;
});

export const upgradeSubscription = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { organizer_id, plan_id, amount, insertEarnings, network } = ctx.data;

    // 1. Cancel existing
    const activeSubRes = await hasuraRequest<{ subscriptions: { id: string }[] }>(GET_ACTIVE_SUB, {
      organizer_id,
    });
    if (activeSubRes.subscriptions.length > 0) {
      await hasuraRequest(CANCEL_SUB, { id: activeSubRes.subscriptions[0].id });
    }

    let nextBillingDate = new Date();

    if (amount === 0) {
      // Find the first free sub to track the true 14-day window.
      const GET_FIRST_FREE_SUB = `
        query GetFirstFreeSub($organizer_id: uuid!) {
          subscriptions(where: { organizer_id: { _eq: $organizer_id }, amount: { _eq: 0 } }, order_by: { start_date: asc }, limit: 1) {
            start_date
          }
        }
      `;
      const freeSubRes = await hasuraRequest<{ subscriptions: { start_date: string }[] }>(
        GET_FIRST_FREE_SUB,
        { organizer_id },
      );
      if (freeSubRes.subscriptions.length > 0) {
        // Tie expiration to the first ever free sub so they can't get it again
        const firstStartDate = new Date(freeSubRes.subscriptions[0].start_date);
        firstStartDate.setDate(firstStartDate.getDate() + 14);
        nextBillingDate = firstStartDate;
      } else {
        // Very first time
        nextBillingDate.setDate(nextBillingDate.getDate() + 14);
      }
    } else {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }

    // 2. Fetch all workspace IDs for this organizer
    const wsQuery = `query GetWs($id: uuid!) { workspaces(where: { orgnizer_id: { _eq: $id } }) { id } }`;
    const wsRes = await hasuraRequest<{ workspaces: { id: string }[] }>(wsQuery, {
      id: organizer_id,
    });
    const workspaceIds = wsRes.workspaces.map((w) => w.id);

    // 3. Create new sub
    const newSubRes = await hasuraRequest<{ insert_subscriptions_one: { id: string } }>(
      CREATE_SUB,
      {
        object: {
          organizer_id,
          plan_id,
          amount,
          status: "active",
          next_billing_date: nextBillingDate.toISOString(),
          workspace_id: workspaceIds,
          modules: ["ALL"],
        },
      },
    );

    // 3. Invoice
    await hasuraRequest(CREATE_INVOICE, {
      object: {
        organizer_id,
        subscription_id: newSubRes.insert_subscriptions_one.id,
        amount,
        status: "paid",
      },
    });

    if (insertEarnings && amount > 0) {
      // Fetch provider fees for the network
      const feeRes = await hasuraRequest<any>(
        `query GetProviderFees($network: String!) {
          payment_provider_fees(where: { network: { _eq: $network } }, limit: 1) {
            collection_percentage
            collection_fixed_fee
            is_tiered
            tiered_rules
          }
        }`,
        { network: network || "Card" }
      );

      const pf = feeRes.payment_provider_fees?.[0] || {};
      let providerPct = parseFloat(pf.collection_percentage) || 0;
      let providerFixed = parseFloat(pf.collection_fixed_fee) || 0;

      if (pf.is_tiered && pf.tiered_rules) {
        let rules = pf.tiered_rules;
        try {
          if (typeof rules === "string") rules = JSON.parse(rules);
          if (typeof rules === "string") rules = JSON.parse(rules);
        } catch (e) {
          console.error("Failed to parse tiered rules", e);
        }

        if (rules && rules.collection && Array.isArray(rules.collection)) {
          const matchedRule =
            rules.collection.find((r: any) => amount <= r.max) ||
            rules.collection[rules.collection.length - 1];
          if (matchedRule) {
            providerPct = matchedRule.pct || 0;
            providerFixed = matchedRule.fixed || 0;
          }
        }
      }

      const providerCost = amount * (providerPct / 100) + providerFixed;
      const netProfit = amount - providerCost;

      await hasuraRequest(
        `mutation InsertEarnings(
          $gross: numeric!, $cost: numeric!,
          $rev: numeric!, $profit: numeric!, $curr: String!
        ) {
          insert_earnings_one(object: {
            transaction_type: "subscription",
            gross_amount: $gross,
            provider_cost: $cost,
            platform_revenue: $rev,
            net_profit: $profit,
            customer_fee: 0,
            organizer_fee: 0,
            currency: $curr,
            status: "completed"
          }) { id }
        }`,
        {
          gross: amount,
          cost: providerCost,
          rev: amount, // platform revenue is the full amount paid by the organizer
          profit: netProfit,
          curr: "USD", // Card payments are in USD
        }
      );
    }

    return { success: true };
  });

const GET_BASIC_PLAN = `
  query GetBasicPlan {
    pricing_plans(where: { name: { _eq: "Basic" } }, limit: 1) {
      id
      modules_included
    }
  }
`;

const UPDATE_WORKSPACES_MODULES = `
  mutation UpdateWorkspacesModules($organizer_id: uuid!, $modules: jsonb!) {
    update_workspaces(where: { orgnizer_id: { _eq: $organizer_id } }, _set: { moduls: $modules }) {
      affected_rows
    }
  }
`;

export const cancelSubscriptionAdmin = createServerFn({ method: "POST" })
  .validator((d: { organizer_id: string }) => d)
  .handler(async (ctx) => {
    const session = await getSession();
    if (!session || !session.sub) throw new Error("unauthenticated");

    const { organizer_id } = ctx.data;

    // 1. Fetch Basic Plan
    const basicPlanRes = await hasuraRequest<{
      pricing_plans: { id: string; modules_included: any[] }[];
    }>(GET_BASIC_PLAN);
    const basicPlan = basicPlanRes.pricing_plans[0];
    if (!basicPlan) throw new Error("Basic plan not found");

    // 2. Cancel existing active subscription(s)
    const activeSubRes = await hasuraRequest<{ subscriptions: { id: string }[] }>(GET_ACTIVE_SUB, {
      organizer_id,
    });
    if (activeSubRes.subscriptions.length > 0) {
      for (const sub of activeSubRes.subscriptions) {
        await hasuraRequest(CANCEL_SUB, { id: sub.id });
      }
    }

    // 3. Create a new subscription for Basic Plan
    const nextBillingDate = new Date();
    nextBillingDate.setDate(nextBillingDate.getDate() + 14); // Keep basic standard trial logic or just give them a placeholder expiration

    await hasuraRequest<{ insert_subscriptions_one: { id: string } }>(CREATE_SUB, {
      object: {
        organizer_id,
        plan_id: basicPlan.id,
        amount: 0,
        status: "active",
        next_billing_date: nextBillingDate.toISOString(),
      },
    });

    // 4. Update all workspaces' modules to basic modules
    await hasuraRequest(UPDATE_WORKSPACES_MODULES, {
      organizer_id,
      modules: basicPlan.modules_included,
    });

    return { success: true };
  });

export const createEnterpriseLead = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const session = await getSession();
    if (!session || !session.sub) throw new Error("unauthenticated");

    const { name, email, company, communication_method, language, country, phone, message } =
      ctx.data as unknown as {
        name: string;
        email: string;
        company: string;
        communication_method: string;
        language: string;
        country: string;
        phone: string;
        message: string;
      };

    const mutation = `
      mutation InsertLead($organizer_id: uuid!, $name: String!, $email: String!, $company: String!, $communication_method: String, $language: String, $country: String, $phone: String, $message: String) {
        insert_leads_one(object: {
          organizer_id: $organizer_id,
          name: $name,
          email: $email,
          company: $company,
          communication_method: $communication_method,
          language: $language,
          country: $country,
          phone: $phone,
          message: $message,
          status: "new"
        }) {
          id
        }
      }
    `;

    const result = await hasuraRequest<{ insert_leads_one: { id: string } }>(mutation, {
      organizer_id: session.sub,
      name,
      email,
      company,
      communication_method,
      language,
      country,
      phone,
      message,
    });

    return { success: true, leadId: result.insert_leads_one?.id };
  });

export const getOrganizerUsageStats = createServerFn({ method: "POST" })
  .validator((d: { organizer_id: string }) => d)
  .handler(async (ctx) => {
    const query = `
      query GetOrganizerUsageStats($organizer_id_uuid: uuid!, $organizer_id_str: String!) {
        workspaces_aggregate(where: { orgnizer_id: { _eq: $organizer_id_uuid } }) { aggregate { count } }
        organizer_invoices_aggregate(where: { organizer_id: { _eq: $organizer_id_str } }) { aggregate { count } }
        workspace_users_aggregate(where: { organizer_id: { _eq: $organizer_id_uuid } }) { aggregate { count } }
      }
    `;

    try {
      const res = await hasuraRequest<any>(query, {
        organizer_id_uuid: ctx.data.organizer_id,
        organizer_id_str: ctx.data.organizer_id,
      });

      return {
        workspaces: res.workspaces_aggregate?.aggregate?.count || 0,
        invoices: res.organizer_invoices_aggregate?.aggregate?.count || 0,
        users: res.workspace_users_aggregate?.aggregate?.count || 0,
      };
    } catch (e) {
      console.error("Failed to fetch organizer usage stats", e);
      return { workspaces: 0, invoices: 0, users: 0 };
    }
  });

export const getWorkspaceUsageStats = createServerFn({ method: "POST" })
  .validator((d: { workspace_id: string }) => d)
  .handler(async (ctx) => {
    const query = `
      query GetWorkspaceUsageStats($workspace_id_uuid: uuid!, $workspace_id_str: String!) {
        events_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid }, event_type: { _neq: "experience" } }) { aggregate { count } }
        experiences_aggregate: events_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid }, event_type: { _eq: "experience" } }) { aggregate { count } }
        cinemas_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        spaces_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        custom_forms_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        workspace_tasks_aggregate(where: { workspace_id: { _eq: $workspace_id_str } }) { aggregate { count } }
        rentable_venues_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        workspace_pages_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        products_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        campaigns_aggregate: products_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid }, type: { _eq: "merch" } }) { aggregate { count } }
        gift_cards_aggregate: products_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid }, type: { _eq: "voucher" } }) { aggregate { count } }
        punch_cards_aggregate: products_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid }, type: { _in: ["punch_card", "loyalty_card"] } }) { aggregate { count } }
        cinema_movies_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        cinema_screens_aggregate(where: { cinema: { workspace_id: { _eq: $workspace_id_uuid } } }) { aggregate { count } }
        venue_projects_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        ticket_projects_aggregate(where: { workspaceId: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        badge_projects_aggregate(where: { events: { workspace_id: { _eq: $workspace_id_uuid } } }) { aggregate { count } }
        workspace_notes_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        agatike_books_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        rsvps_aggregate(where: { custom_form: { workspace_id: { _eq: $workspace_id_uuid } } }) { aggregate { count } }
        invoices_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
        event_tickets_aggregate(where: { event: { workspace_id: { _eq: $workspace_id_uuid } } }) { aggregate { count } }
        cinema_ticket_tiers_aggregate(where: { workspace_id: { _eq: $workspace_id_uuid } }) { aggregate { count } }
      }
    `;

    try {
      const res = await hasuraRequest<any>(query, {
        workspace_id_uuid: ctx.data.workspace_id,
        workspace_id_str: ctx.data.workspace_id,
      });

      return {
        events: res.events_aggregate?.aggregate?.count || 0,
        experiences: res.experiences_aggregate?.aggregate?.count || 0,
        cinemas: res.cinemas_aggregate?.aggregate?.count || 0,
        screens: res.cinema_screens_aggregate?.aggregate?.count || 0,
        spaces: res.spaces_aggregate?.aggregate?.count || 0,
        venues: res.rentable_venues_aggregate?.aggregate?.count || 0,
        page_builders: res.workspace_pages_aggregate?.aggregate?.count || 0,
        custom_forms: res.custom_forms_aggregate?.aggregate?.count || 0,
        tasks: res.workspace_tasks_aggregate?.aggregate?.count || 0,
        products: res.products_aggregate?.aggregate?.count || 0,
        campaigns: res.campaigns_aggregate?.aggregate?.count || 0,
        gift_cards: res.gift_cards_aggregate?.aggregate?.count || 0,
        punch_cards: res.punch_cards_aggregate?.aggregate?.count || 0,
        movies: res.cinema_movies_aggregate?.aggregate?.count || 0,
        venue_designs: res.venue_projects_aggregate?.aggregate?.count || 0,
        ticket_designs: res.ticket_projects_aggregate?.aggregate?.count || 0,
        badge_designs: res.badge_projects_aggregate?.aggregate?.count || 0,
        notes: res.workspace_notes_aggregate?.aggregate?.count || 0,
        books: res.agatike_books_aggregate?.aggregate?.count || 0,
        rsvps: res.rsvps_aggregate?.aggregate?.count || 0,
        procurements: res.invoices_aggregate?.aggregate?.count || 0, // Using invoices for finance/procurement for now
        ticket_tiers:
          (res.event_tickets_aggregate?.aggregate?.count || 0) +
          (res.cinema_ticket_tiers_aggregate?.aggregate?.count || 0),
        comments: 0,
        membership_plans: 0,
        locations: 0,
      };
    } catch (e) {
      console.error("Failed to fetch workspace usage stats", e);
      return {
        events: 0,
        experiences: 0,
        cinemas: 0,
        screens: 0,
        spaces: 0,
        venues: 0,
        page_builders: 0,
        custom_forms: 0,
        tasks: 0,
        products: 0,
        campaigns: 0,
        gift_cards: 0,
        punch_cards: 0,
        movies: 0,
        venue_designs: 0,
        ticket_designs: 0,
        badge_designs: 0,
        notes: 0,
        books: 0,
        rsvps: 0,
        procurements: 0,
        ticket_tiers: 0,
        comments: 0,
        membership_plans: 0,
        locations: 0,
      };
    }
  });

export const payPendingInvoice = createServerFn({ method: "POST" })
  .validator((d: { invoice_id: string; amount: number; payment_method?: string }) => d)
  .handler(async (ctx) => {
    const session = await getSession();
    if (!session || !session.sub) throw new Error("unauthenticated");

    const { invoice_id, amount } = ctx.data;

    // 1. Fetch the invoice to get the subscription_id
    const GET_INVOICE = `
      query GetInvoice($id: uuid!) {
        organizer_invoices_by_pk(id: $id) {
          id
          subscription_id
          status
        }
      }
    `;
    const invRes = await hasuraRequest<{ organizer_invoices_by_pk: any }>(GET_INVOICE, {
      id: invoice_id,
    });
    const invoice = invRes.organizer_invoices_by_pk;
    if (!invoice) throw new Error("Invoice not found");
    if (invoice.status === "paid") throw new Error("Invoice already paid");
    if (!invoice.subscription_id) throw new Error("Invoice is not linked to a subscription");

    // 2. Mark invoice as paid
    const UPDATE_INVOICE = `
      mutation UpdateInvoice($id: uuid!) {
        update_organizer_invoices_by_pk(pk_columns: { id: $id }, _set: { status: "paid" }) {
          id
        }
      }
    `;
    await hasuraRequest(UPDATE_INVOICE, { id: invoice_id });

    // 3. Extend subscription by 1 month and activate it
    const GET_SUB = `
      query GetSub($id: uuid!) {
        subscriptions_by_pk(id: $id) {
          id
          next_billing_date
        }
      }
    `;
    const subRes = await hasuraRequest<{ subscriptions_by_pk: any }>(GET_SUB, {
      id: invoice.subscription_id,
    });
    const sub = subRes.subscriptions_by_pk;
    if (sub) {
      const nextDate = new Date(sub.next_billing_date);
      // Only advance the date if it's currently past due or close to due, so we don't accidentally skip a month if paid late
      // Actually, if paid, it extends exactly 1 month from the OLD billing date.
      nextDate.setMonth(nextDate.getMonth() + 1);

      const UPDATE_SUB = `
        mutation UpdateSub($id: uuid!, $next_date: timestamptz!) {
          update_subscriptions_by_pk(pk_columns: { id: $id }, _set: { status: "active", next_billing_date: $next_date }) {
            id
          }
        }
      `;
      await hasuraRequest(UPDATE_SUB, { id: sub.id, next_date: nextDate.toISOString() });
    }

    return { success: true };
  });
