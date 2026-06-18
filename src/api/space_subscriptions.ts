import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

// Generate a unique membership ID: YYYYMM + 6 random uppercase alphanumeric (no O, 0, I, 1)
function generateMembershipId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let rand = "";
  for (let i = 0; i < 6; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${year}${month}${rand}`;
}

export const createSpaceSubscription = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
  const {
    space_id,
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    customer_gender,
    customer_address,
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

  // Generate membership ID for this subscription
  const membershipId = generateMembershipId();

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

    // Assign a unique membership_id to each team member
    finalTeamMembers = finalTeamMembers.map((m: any) => ({
      ...m,
      membership_id: generateMembershipId(),
    }));
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
        team_members
      }
    }
  `;

  const variables = {
    space_id,
    user_id: user_id || null,
    customer_name,
    customer_email,
    customer_phone,
    plan_name,
    price: String(price),
    billing_cycle,
    status: "active",
    start_date: baseDate.toISOString(),
    next_billing_date: nextBillingDate,
    booking_type: booking_type || "individual",
    // team_members carry individual membership_id inside each member's JSON object
    team_members: finalTeamMembers,
  };

  const data = await hasuraRequest<{ insert_space_subscriptions_one: any }>(query, variables);
  return data.insert_space_subscriptions_one;
});

export const getUserSubscriptions = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { user_id } = ctx.data as any;
    if (!user_id) return [];
    
    const query = `
      query GetUserSubscriptions($user_id: uuid!) {
        space_subscriptions(where: { user_id: { _eq: $user_id } }, order_by: { created_at: desc }) {
          id
          plan_name
          price
          status
          billing_cycle
          start_date
          next_billing_date
          booking_type
          customer_name
          customer_email
          customer_phone
          team_members
          created_at
          space {
            id
            name
            cover_url
            currency
          }
          invoices(order_by: { created_at: desc }, limit: 1) {
            id
            invoice_number
            amount
            status
            created_at
          }
        }
      }
    `;
    
    try {
      const data = await hasuraRequest<{ space_subscriptions: any[] }>(query, { user_id });
      return data.space_subscriptions || [];
    } catch (e) {
      console.error("Error fetching user subscriptions:", e);
      return [];
    }
  });


