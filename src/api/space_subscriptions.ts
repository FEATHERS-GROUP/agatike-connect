import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

export const createSpaceSubscription = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const {
    space_id,
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    customer_gender,
    plan_name,
    price,
    billing_cycle,
    start_date,
    booking_type,
    team_members,
  } = ctx.data as any;

  const baseDate = start_date ? new Date(start_date) : new Date();

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

  let finalTeamMembers = team_members || [];

  // Look up user_ids for any handles provided in team_members
  if (finalTeamMembers.length > 0) {
    const handlesToLookup = finalTeamMembers
      .map((m: any) => m.handle ? m.handle.replace('@', '') : null)
      .filter(Boolean);

    if (handlesToLookup.length > 0) {
      const lookupQuery = `
        query GetUsersByHandles($handles: [String!]!) {
          users(where: { username: { _in: $handles } }) {
            id
            username
          }
        }
      `;
      try {
        const usersData = await hasuraRequest<{ users: any[] }>(lookupQuery, { handles: handlesToLookup });
        const usersMap = new Map();
        usersData.users.forEach(u => usersMap.set(u.username, u.id));

        finalTeamMembers = finalTeamMembers.map((m: any) => {
          if (m.handle) {
            const cleanHandle = m.handle.replace('@', '');
            if (usersMap.has(cleanHandle)) {
              return { ...m, user_id: usersMap.get(cleanHandle) };
            }
          }
          return m;
        });
      } catch (err) {
        console.error("Failed to lookup handles:", err);
      }
    }
  }

  const query = `
    mutation CreateSpaceSubscription(
      $space_id: uuid!,
      $user_id: uuid,
      $customer_name: String!,
      $customer_email: String!,
      $customer_phone: String!,
      $customer_gender: String,
      $plan_name: String!,
      $price: String!,
      $billing_cycle: String!,
      $status: String!,
      $start_date: timestamptz,
      $next_billing_date: timestamptz,
      $booking_type: String!,
      $team_members: jsonb
    ) {
      insert_space_subscriptions_one(
        object: {
          space_id: $space_id,
          user_id: $user_id,
          customer_name: $customer_name,
          customer_email: $customer_email,
          customer_phone: $customer_phone,
          customer_gender: $customer_gender,
          plan_name: $plan_name,
          price: $price,
          billing_cycle: $billing_cycle,
          status: $status,
          start_date: $start_date,
          next_billing_date: $next_billing_date,
          booking_type: $booking_type,
          team_members: $team_members
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
    user_id: user_id || null,
    customer_name,
    customer_email,
    customer_phone,
    customer_gender,
    plan_name,
    price: String(price),
    billing_cycle,
    status: "active",
    start_date: baseDate.toISOString(),
    next_billing_date: nextBillingDate,
    booking_type: booking_type || "individual",
    team_members: finalTeamMembers,
  };

  const data = await hasuraRequest<{ insert_space_subscriptions_one: any }>(query, variables);
  return data.insert_space_subscriptions_one;
});
