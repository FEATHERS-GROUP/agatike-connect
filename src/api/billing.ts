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
  is_popular: boolean;
}

export interface Subscription {
  id: string;
  organizer_id: string;
  plan_id: string;
  status: "active" | "canceled" | "past_due";
  start_date: any;
  next_billing_date: any;
  amount: number;
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
      is_popular
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
    }
  }
`;

export const getActiveSubscription = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { organizer_id } = ctx.data;
    const res = await hasuraRequest<{ subscriptions: Subscription[] }>(GET_ACTIVE_SUB, {
      organizer_id,
    });
    return res.subscriptions[0] || null;
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
        update_columns: [plan_id, amount, status, next_billing_date, updated_at]
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
    const { organizer_id, plan_id, amount } = ctx.data;

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
      const freeSubRes = await hasuraRequest<{ subscriptions: { start_date: string }[] }>(GET_FIRST_FREE_SUB, { organizer_id });
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

    // 2. Create new sub
    const newSubRes = await hasuraRequest<{ insert_subscriptions_one: { id: string } }>(
      CREATE_SUB,
      {
        object: {
          organizer_id,
          plan_id,
          amount,
          status: "active",
          next_billing_date: nextBillingDate.toISOString(),
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
