import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

export const createSpaceSubscription = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const {
    space_id,
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    plan_name,
    price,
    billing_cycle,
    start_date, // Added start_date from client
  } = ctx.data as any;

  // Use provided start_date or fallback to now
  const baseDate = start_date ? new Date(start_date) : new Date();

  // Calculate next billing date if not a one-off (Daily/Monthly/Yearly)
  let nextBillingDate = null;
  if (billing_cycle) {
    const now = new Date(baseDate);
    if (billing_cycle.toLowerCase() === "daily") {
      now.setDate(now.getDate() + 1);
      nextBillingDate = now.toISOString();
    } else if (billing_cycle.toLowerCase() === "monthly") {
      now.setMonth(now.getMonth() + 1);
      nextBillingDate = now.toISOString();
    } else if (billing_cycle.toLowerCase() === "annually" || billing_cycle.toLowerCase() === "yearly") {
      now.setFullYear(now.getFullYear() + 1);
      nextBillingDate = now.toISOString();
    }
  }

  const query = `
    mutation CreateSpaceSubscription(
      $space_id: uuid!,
      $user_id: uuid,
      $customer_name: String!,
      $customer_email: String!,
      $customer_phone: String!,
      $plan_name: String!,
      $price: String!,
      $billing_cycle: String!,
      $status: String!,
      $start_date: timestamptz,
      $next_billing_date: timestamptz
    ) {
      insert_space_subscriptions_one(
        object: {
          space_id: $space_id,
          user_id: $user_id,
          customer_name: $customer_name,
          customer_email: $customer_email,
          customer_phone: $customer_phone,
          plan_name: $plan_name,
          price: $price,
          billing_cycle: $billing_cycle,
          status: $status,
          start_date: $start_date,
          next_billing_date: $next_billing_date
        }
      ) {
        id
        status
        start_date
        next_billing_date
      }
    }
  `;

  const variables = {
    space_id,
    user_id: user_id || null, // Optional
    customer_name,
    customer_email,
    customer_phone,
    plan_name,
    price,
    billing_cycle,
    status: "active",
    start_date: baseDate.toISOString(),
    next_billing_date: nextBillingDate,
  };

  const data = await hasuraRequest<{ insert_space_subscriptions_one: any }>(query, variables);
  return data.insert_space_subscriptions_one;
});
