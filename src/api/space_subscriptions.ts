import { createServerFn } from "@tanstack/react-start";
import { setCookie, getCookie } from "@tanstack/react-start/server";
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
  .validator((d: any) => d)
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
      } else if (
        billing_cycle.toLowerCase() === "annually" ||
        billing_cycle.toLowerCase() === "yearly"
      ) {
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
        .map((m: any) => (m.handle ? m.handle.replace("@", "") : null))
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
          const usersData = await hasuraRequest<{ users: any[] }>(lookupQuery, {
            handles: handlesToLookup,
          });
          const usersMap = new Map();
          usersData.users.forEach((u) => usersMap.set(u.username, u.id));

          finalTeamMembers = finalTeamMembers.map((m: any) => {
            if (m.handle) {
              const cleanHandle = m.handle.replace("@", "");
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

    let existingSubscriptionId: string | null = null;
    const isIndividual = !booking_type || booking_type === "individual";
    if (user_id && isIndividual) {
      const checkQuery = `
      query CheckExistingSpaceSubscription($user_id: uuid!, $space_id: uuid!) {
        space_subscriptions(where: { user_id: { _eq: $user_id }, space_id: { _eq: $space_id }, booking_type: { _eq: "individual" } }) {
          id
        }
      }
    `;
      try {
        const existingData = await hasuraRequest<{ space_subscriptions: { id: string }[] }>(
          checkQuery,
          { user_id, space_id },
        );
        if (existingData?.space_subscriptions?.length > 0) {
          existingSubscriptionId = existingData.space_subscriptions[0].id;
        }
      } catch (err) {
        console.error("Failed to check existing space subscription:", err);
      }
    }

    let result = null;

    if (existingSubscriptionId) {
      const updateMutation = `
      mutation UpdateSpaceSubscription(
        $id: uuid!,
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
        update_space_subscriptions_by_pk(
          pk_columns: { id: $id }
          _set: {
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
      const updateVariables = {
        id: existingSubscriptionId,
        customer_name,
        customer_email,
        customer_phone,
        plan_name,
        price: String(price),
        billing_cycle,
        status: ctx.data.status || "active",
        start_date: baseDate.toISOString(),
        next_billing_date: nextBillingDate,
        booking_type: booking_type || "individual",
        team_members: finalTeamMembers,
      };
      const data = await hasuraRequest<{ update_space_subscriptions_by_pk: any }>(
        updateMutation,
        updateVariables,
      );
      result = data.update_space_subscriptions_by_pk;
    } else {
      const insertMutation = `
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
      const insertVariables = {
        space_id,
        user_id: user_id || null,
        customer_name,
        customer_email,
        customer_phone,
        plan_name,
        price: String(price),
        billing_cycle,
        status: ctx.data.status || "active",
        start_date: baseDate.toISOString(),
        next_billing_date: nextBillingDate,
        booking_type: booking_type || "individual",
        team_members: finalTeamMembers,
      };
      const data = await hasuraRequest<{ insert_space_subscriptions_one: any }>(
        insertMutation,
        insertVariables,
      );
      result = data.insert_space_subscriptions_one;
    }

    if (parseFloat(price || "0") > 0 && (ctx.data.status === "active" || !ctx.data.status)) {
      try {
        const spaceRes = await hasuraRequest<{ spaces_by_pk: { workspace_id: string } }>(
          `query GetSpaceWorkspace($id: uuid!) { spaces_by_pk(id: $id) { workspace_id } }`,
          { id: space_id },
        );
        const workspace_id = spaceRes?.spaces_by_pk?.workspace_id;

        if (workspace_id) {
          const { addMoneyToWorkspaceWallet } = await import("./wallet");
          await addMoneyToWorkspaceWallet({
            data: { workspace_id, amount: parseFloat(price) },
          } as any);
        }
      } catch (e) {
        console.error("Failed to update wallet for space subscription:", e);
      }
    }

    return result;
  });

export const getUserSubscriptions = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { user_id, email } = ctx.data as any;
    if (!user_id) return [];

    // Read explicitly linked group subscriptions
    const linkedCredsCookie = getCookie("agatike_linked_credentials");
    let linkedCreds: any[] = [];
    try {
      if (linkedCredsCookie) linkedCreds = JSON.parse(linkedCredsCookie);
    } catch (e) {}

    const filters: any[] = [];
    if (email) filters.push({ team_members: { _contains: [{ email }] } });

    for (const cred of linkedCreds) {
      if (cred.email) filters.push({ team_members: { _contains: [{ email: cred.email }] } });
      if (cred.membership_id)
        filters.push({ team_members: { _contains: [{ membership_id: cred.membership_id }] } });
    }

    const whereClause: any = {
      _or: [{ user_id: { _eq: user_id } }, ...filters],
    };

    let subscriptions: any[] = [];
    try {
      const query = `
        query GetUserSubscriptions($where: space_subscriptions_bool_exp!) {
          space_subscriptions(
            where: $where,
            order_by: { created_at: desc }
          ) {
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
      const data = await hasuraRequest<{ space_subscriptions: any[] }>(query, {
        where: whereClause,
      });
      subscriptions = data.space_subscriptions || [];

      // Helper function to check validity
      const getValidity = (sub: any) => {
        const status = (sub.status || "").toLowerCase();
        if (status === "cancelled" || status === "inactive") return false;
        if (sub.next_billing_date) {
          const nextBilling = new Date(sub.next_billing_date);
          const now = new Date();
          if (nextBilling < now) return false;
        }
        return true;
      };

      // Extract active memberships
      const activeMemberships = subscriptions.filter(getValidity).map((sub: any) => {
        let membership_id = sub.id;
        if (sub.booking_type === "group" && sub.team_members) {
          let matched = null;
          if (email) matched = sub.team_members.find((m: any) => m.email === email);
          if (!matched && linkedCreds.length > 0) {
            for (const cred of linkedCreds) {
              if (cred.email) matched = sub.team_members.find((m: any) => m.email === cred.email);
              if (matched) break;
              if (cred.membership_id)
                matched = sub.team_members.find((m: any) => m.membership_id === cred.membership_id);
              if (matched) break;
            }
          }
          if (matched?.membership_id) {
            membership_id = matched.membership_id;
          }
        }
        return {
          space_id: sub.space?.id,
          plan_name: sub.plan_name,
          membership_id,
          status: sub.status,
        };
      });

      // Save memberships list in cookies
      setCookie("agatike_user_memberships", JSON.stringify(activeMemberships), {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return subscriptions.filter(getValidity);
    } catch (e) {
      console.error("Error fetching user subscriptions:", e);
      return [];
    }
  });

export const getSubscriptionById = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { id, user_id, email } = ctx.data as any;
    if (!id) return null;

    try {
      const query = `
        query GetSubscriptionById($id: uuid!) {
          space_subscriptions_by_pk(id: $id) {
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
            space_id
            space {
              id
              name
              description
              cover_url
              currency
              type
              locations
              socials
              plans
            }
            invoices(order_by: { created_at: desc }) {
              id
              invoice_number
              amount
              status
              created_at
            }
          }
        }
      `;
      const data = await hasuraRequest<{ space_subscriptions_by_pk: any }>(query, { id });
      return data.space_subscriptions_by_pk;
    } catch (e) {
      console.error("Error fetching subscription by ID:", e);
      return null;
    }
  });

/** Search for a group subscription by team member email OR personal membership_id */
export const findGroupSubscriptionByEmailOrId = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { email, membership_id } = ctx.data as any;
    if (!email && !membership_id) return null;

    // Build parallel OR queries depending on what was provided
    const results: any[] = [];

    if (membership_id) {
      const query = `
        query FindGroupSubByMembershipId($filter: jsonb!) {
          space_subscriptions(
            where: {
              booking_type: { _eq: "group" },
              team_members: { _contains: $filter }
            }
            limit: 1
          ) {
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
            space {
              id
              name
              cover_url
              currency
            }
          }
        }
      `;
      try {
        const data = await hasuraRequest<{ space_subscriptions: any[] }>(query, {
          filter: [{ membership_id }],
        });
        if (data.space_subscriptions?.length > 0) {
          results.push(data.space_subscriptions[0]);
        }
      } catch (e) {
        console.error("Error searching by membership_id:", e);
      }
    }

    if (!results.length && email) {
      const query = `
        query FindGroupSubByEmail($filter: jsonb!) {
          space_subscriptions(
            where: {
              booking_type: { _eq: "group" },
              team_members: { _contains: $filter }
            }
            limit: 5
          ) {
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
            space {
              id
              name
              cover_url
              currency
            }
          }
        }
      `;
      try {
        const data = await hasuraRequest<{ space_subscriptions: any[] }>(query, {
          filter: [{ email }],
        });
        results.push(...(data.space_subscriptions || []));
      } catch (e) {
        console.error("Error searching by email:", e);
      }
    }

    return results;
  });

export const getLinkedCredentials = createServerFn({ method: "GET" }).handler(async () => {
  const cookieStr = getCookie("agatike_linked_credentials");
  let creds: any[] = [];
  try {
    if (cookieStr) creds = JSON.parse(cookieStr);
  } catch (e) {}
  return creds;
});

const GET_WORKSPACE_SUBSCRIPTIONS = `
  query GetWorkspaceSubscriptionsByWorkspaceId($workspace_id: uuid!) {
    space_subscriptions(
      where: { space: { workspace_id: { _eq: $workspace_id } } },
      order_by: { created_at: desc }
    ) {
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
        name
      }
    }
  }
`;

export const getWorkspaceSubscriptionsByWorkspaceId = createServerFn({ method: "POST" })
  .validator((d: { workspace_id: string }) => d)
  .handler(async (ctx) => {
    const { workspace_id } = ctx.data;
    if (!workspace_id) return [];
    try {
      const data = await hasuraRequest<{ space_subscriptions: any[] }>(
        GET_WORKSPACE_SUBSCRIPTIONS,
        { workspace_id },
      );
      return data.space_subscriptions || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });

const GET_SPACE_SUBSCRIPTIONS = `
  query GetSpaceSubscriptionsBySpaceId($space_id: uuid!) {
    space_subscriptions(
      where: { space_id: { _eq: $space_id } },
      order_by: { created_at: desc }
    ) {
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
      resource_id
      resource {
        id
        name
        type
      }
      space {
        name
      }
      invoices(order_by: { created_at: desc }) {
        id
        invoice_number
        amount
        status
        created_at
      }
    }
  }
`;

export const getSpaceSubscriptionsBySpaceId = createServerFn({ method: "POST" })
  .validator((d: { space_id: string }) => d)
  .handler(async (ctx) => {
    const { space_id } = ctx.data;
    if (!space_id) return [];
    try {
      const data = await hasuraRequest<{ space_subscriptions: any[] }>(GET_SPACE_SUBSCRIPTIONS, {
        space_id,
      });
      return data.space_subscriptions || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });

export const addLinkedGroupSubscription = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { email, membership_id } = ctx.data as any;
    if (!email && !membership_id) throw new Error("Need email or membership_id");

    const cookieStr = getCookie("agatike_linked_credentials");
    let creds: any[] = [];
    try {
      if (cookieStr) creds = JSON.parse(cookieStr);
    } catch (e) {}

    // Check if it exists
    const exists = creds.find((c) => c.email === email && c.membership_id === membership_id);
    if (!exists) {
      creds.push({ email, membership_id });
      setCookie("agatike_linked_credentials", JSON.stringify(creds), {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }
    return { success: true };
  });

export const removeLinkedGroupSubscription = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { email, membership_id } = ctx.data as any;
    const cookieStr = getCookie("agatike_linked_credentials");
    let creds: any[] = [];
    try {
      if (cookieStr) creds = JSON.parse(cookieStr);
    } catch (e) {}

    creds = creds.filter((c) => !(c.email === email && c.membership_id === membership_id));
    setCookie("agatike_linked_credentials", JSON.stringify(creds), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return { success: true };
  });

// ── Renew a subscription ─────────────────────────────────────────────────────
// Creates a "pending" renewal invoice and advances the next_billing_date.
export const renewSpaceSubscription = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { subscription_id } = ctx.data as { subscription_id: string };
    if (!subscription_id) throw new Error("subscription_id required");

    // 1. Fetch current subscription
    const fetchQuery = `
      query GetSubscriptionForRenew($id: uuid!) {
        space_subscriptions_by_pk(id: $id) {
          id
          billing_cycle
          next_billing_date
          start_date
          status
          price
          plan_name
          customer_name
          customer_email
          space {
            id
            name
            currency
          }
        }
      }
    `;
    const fetchData = await hasuraRequest<{ space_subscriptions_by_pk: any }>(fetchQuery, {
      id: subscription_id,
    });
    const sub = fetchData?.space_subscriptions_by_pk;
    if (!sub) throw new Error("Subscription not found");

    // 2. Calculate new next_billing_date based on billing_cycle
    const baseDate = sub.next_billing_date ? new Date(sub.next_billing_date) : new Date();

    const cycle = (sub.billing_cycle || "").toLowerCase();
    const newBillingDate = new Date(baseDate);
    if (cycle === "daily") {
      newBillingDate.setDate(newBillingDate.getDate() + 1);
    } else if (cycle === "weekly") {
      newBillingDate.setDate(newBillingDate.getDate() + 7);
    } else if (cycle === "monthly") {
      newBillingDate.setMonth(newBillingDate.getMonth() + 1);
    } else if (cycle === "annually" || cycle === "yearly") {
      newBillingDate.setFullYear(newBillingDate.getFullYear() + 1);
    } else {
      // Default: monthly
      newBillingDate.setMonth(newBillingDate.getMonth() + 1);
    }

    // 3. Create a renewal invoice (status: "pending")
    const { generateInvoiceNumber } = await import("./invoices");
    const invoiceNumber = generateInvoiceNumber();

    const invoiceMutation = `
      mutation CreateRenewalInvoice(
        $invoice_number: String!
        $type: String!
        $reference_id: uuid
        $space_id: uuid
        $space_subscription_id: uuid
        $customer_name: String!
        $customer_email: String!
        $amount: String!
        $currency: String!
        $plan_name: String
        $billing_cycle: String
        $status: String!
      ) {
        insert_invoices_one(object: {
          invoice_number: $invoice_number
          type: $type
          reference_id: $reference_id
          space_id: $space_id
          space_subscription_id: $space_subscription_id
          customer_name: $customer_name
          customer_email: $customer_email
          amount: $amount
          currency: $currency
          plan_name: $plan_name
          billing_cycle: $billing_cycle
          status: $status
        }) {
          id
          invoice_number
        }
      }
    `;
    await hasuraRequest(invoiceMutation, {
      invoice_number: invoiceNumber,
      type: "space_subscription_renewal",
      reference_id: subscription_id,
      space_id: sub.space?.id || null,
      space_subscription_id: subscription_id,
      customer_name: sub.customer_name,
      customer_email: sub.customer_email,
      amount: String(sub.price || "0"),
      currency: sub.space?.currency || "RWF",
      plan_name: sub.plan_name,
      billing_cycle: sub.billing_cycle,
      status: "pending",
    });

    // 4. Update the subscription: advance next_billing_date + set active
    const updateMutation = `
      mutation RenewSubscription($id: uuid!, $next_billing_date: timestamptz!, $status: String!) {
        update_space_subscriptions_by_pk(
          pk_columns: { id: $id }
          _set: {
            next_billing_date: $next_billing_date
            status: $status
          }
        ) {
          id
          status
          next_billing_date
        }
      }
    `;
    const updated = await hasuraRequest<{ update_space_subscriptions_by_pk: any }>(updateMutation, {
      id: subscription_id,
      next_billing_date: newBillingDate.toISOString(),
      status: "active",
    });

    return {
      success: true,
      invoiceNumber,
      newNextBillingDate: newBillingDate.toISOString(),
      subscription: updated.update_space_subscriptions_by_pk,
    };
  });

// ── Cancel a subscription ────────────────────────────────────────────────────
export const cancelSpaceSubscription = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { subscription_id } = ctx.data as { subscription_id: string };
    if (!subscription_id) throw new Error("subscription_id required");

    // 1. Fetch subscription details
    const subQuery = `
      query GetSubForCancel($id: uuid!) {
        space_subscriptions_by_pk(id: $id) {
          id
          price
          status
          start_date
          customer_phone
          customer_name
          booking_type
          space {
            id
            currency
            workspace_id
            name
            workspace {
              orgnizer_id
            }
          }
        }
      }
    `;
    const subRes = await hasuraRequest<{ space_subscriptions_by_pk: any }>(subQuery, { id: subscription_id });
    const sub = subRes.space_subscriptions_by_pk;
    if (!sub) throw new Error("Subscription not found");

    if (sub.status === "cancelled") {
      return { success: true, subscription: sub }; // already cancelled
    }

    if (sub.start_date) {
      const now = new Date();
      const startDate = new Date(sub.start_date);
      // If today is the start date (ignoring time) or after, block cancellation
      now.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      if (now >= startDate) {
        throw new Error("You cannot cancel a subscription that has already started.");
      }
    }

    const price = parseFloat(sub.price || "0");

    // 2. Process Refund if applicable (not a visitor, price > 0)
    if (price > 0 && sub.booking_type !== "visitor") {
      const refundAmount = price * 0.5; // 50% refund
      const workspace_id = sub.space?.workspace_id;
      const currency = sub.space?.currency || "RWF";

      // 2a. Deduct from organizer wallet
      if (workspace_id) {
        const deductMutation = `
          mutation DeductRefund($workspace_id: uuid!, $amount: numeric!, $updated_at: timestamptz!) {
            update_wallets(
              where: { workspace_id: { _eq: $workspace_id }, amount: { _gte: $amount } }
              _inc: { amount: -$amount }
              _set: { updated_at: $updated_at }
            ) {
              affected_rows
            }
          }
        `;
        const deductRes = await hasuraRequest<any>(deductMutation, {
          workspace_id,
          amount: refundAmount,
          updated_at: new Date().toISOString()
        });

        if (deductRes.update_wallets?.affected_rows === 0) {
          throw new Error("Organizer wallet does not have sufficient funds for the refund.");
        }
      }

      // 2b. Execute PawaPay Refund
      if (sub.customer_phone) {
        try {
          const { sendRefundPayout } = await import("./pawapay");
          await sendRefundPayout({
            data: {
              amount: refundAmount,
              currency,
              phone: sub.customer_phone,
              description: `Agatike Cancel 50% Refund`
            }
          } as any);
        } catch (e: any) {
          console.error("Failed to execute pawapay refund", e);
          throw new Error(`Refund failed: ${e.message}`);
        }
      }

      // 2c. Record Invoice for the refund
      const invoiceNumber = "REF-" + Math.floor(Math.random() * 1000000);
      const invoiceMutation = `
        mutation CreateRefundInvoice(
          $invoice_number: String!
          $type: String!
          $space_id: uuid
          $space_subscription_id: uuid
          $customer_name: String!
          $amount: String!
          $currency: String!
          $status: String!
        ) {
          insert_invoices_one(object: {
            invoice_number: $invoice_number
            type: $type
            space_id: $space_id
            space_subscription_id: $space_subscription_id
            customer_name: $customer_name
            customer_email: "refund"
            amount: $amount
            currency: $currency
            status: $status
          }) { id }
        }
      `;
      await hasuraRequest(invoiceMutation, {
        invoice_number: invoiceNumber,
        type: "subscription_refund",
        space_id: sub.space?.id,
        space_subscription_id: sub.id,
        customer_name: sub.customer_name || "Unknown",
        amount: String(-refundAmount), // Negative amount for refund
        currency,
        status: "completed"
      });

      // 2d. Send Notifications
      try {
        const { db } = await import("./firebase");
        const orgnizer_id = sub.space?.workspace?.orgnizer_id;
        
        // Notify organizer
        if (orgnizer_id) {
          await db.collection("agatike_notifications").add({
            type: "subscription_refund",
            actorId: "system",
            organizerId: workspace_id,
            content: `User ${sub.customer_name} cancelled their subscription at ${sub.space?.name}. A 50% refund (${refundAmount} ${currency}) has been deducted from your wallet.`,
            targetUsers: [orgnizer_id],
            createdAt: new Date().toISOString()
          });
        }
      } catch (e) {
        console.error("Failed to send notification", e);
      }
    }

    // 3. Set status to cancelled
    const mutation = `
      mutation CancelSubscription($id: uuid!) {
        update_space_subscriptions_by_pk(
          pk_columns: { id: $id }
          _set: { status: "cancelled" }
        ) {
          id
          status
        }
      }
    `;
    const updateData = await hasuraRequest<{ update_space_subscriptions_by_pk: any }>(mutation, {
      id: subscription_id,
    });

    return { success: true, subscription: updateData.update_space_subscriptions_by_pk };
  });

// ── Mark overdue subscriptions as on_hold ────────────────────────────────────
// Called by the daily cron job at 11:00 UTC.
// Finds subscriptions where next_billing_date is more than 7 days in the past
// AND status is not already "on_hold" or "cancelled".
export const upgradeSpaceSubscription = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const {
      subscription_id,
      new_plan_name,
      new_price,
      new_billing_cycle,
      new_next_billing_date,
      customer_email,
      customer_name,
      workspace_id,
      space_id
    } = ctx.data as any;

    if (!subscription_id) throw new Error("Missing subscription_id");

    const updateMutation = `
      mutation UpgradeSubscription($id: uuid!, $plan_name: String!, $price: String!, $billing_cycle: String!, $next_billing_date: timestamptz!) {
        update_space_subscriptions_by_pk(
          pk_columns: { id: $id }
          _set: {
            plan_name: $plan_name
            price: $price
            billing_cycle: $billing_cycle
            next_billing_date: $next_billing_date
            status: "active"
          }
        ) {
          id
          status
          plan_name
          price
          next_billing_date
        }
      }
    `;
    const updated = await hasuraRequest<{ update_space_subscriptions_by_pk: any }>(updateMutation, {
      id: subscription_id,
      plan_name: new_plan_name,
      price: String(new_price),
      billing_cycle: new_billing_cycle,
      next_billing_date: new_next_billing_date,
    });

    // Create Invoice for upgrade
    const invoiceNumber = "UPG-" + Math.floor(Math.random() * 1000000);
    const createInvoiceMutation = `
      mutation CreateUpgradeInvoice(
        $invoice_number: String!
        $type: String!
        $space_id: uuid
        $space_subscription_id: uuid
        $customer_name: String!
        $customer_email: String!
        $amount: String!
        $currency: String!
        $plan_name: String
        $billing_cycle: String
        $status: String!
      ) {
        insert_invoices_one(object: {
          invoice_number: $invoice_number
          type: $type
          space_id: $space_id
          space_subscription_id: $space_subscription_id
          customer_name: $customer_name
          customer_email: $customer_email
          amount: $amount
          currency: $currency
          plan_name: $plan_name
          billing_cycle: $billing_cycle
          status: $status
        }) {
          id
        }
      }
    `;
    
    // Attempt to get space currency, fallback to RWF
    let currency = "RWF";
    if (space_id) {
        try {
            const spaceRes = await hasuraRequest<{ spaces_by_pk: { currency: string } }>(
            `query GetSpaceCurrency($id: uuid!) { spaces_by_pk(id: $id) { currency } }`,
            { id: space_id }
            );
            if (spaceRes?.spaces_by_pk?.currency) currency = spaceRes.spaces_by_pk.currency;
        } catch(e) {}
    }

    try {
      await hasuraRequest(createInvoiceMutation, {
        invoice_number: invoiceNumber,
        type: "subscription_upgrade",
        space_id: space_id || null,
        space_subscription_id: subscription_id,
        customer_name,
        customer_email,
        amount: String(new_price),
        currency: currency,
        plan_name: new_plan_name,
        billing_cycle: new_billing_cycle,
        status: "paid"
      });
    } catch (e) {
      console.error("Failed to create upgrade invoice", e);
    }

    // Add money to wallet
    if (workspace_id && parseFloat(new_price) > 0) {
      try {
        const { addMoneyToWorkspaceWallet } = await import("./wallet");
        await addMoneyToWorkspaceWallet({
          data: { workspace_id, amount: parseFloat(new_price) },
        } as any);
      } catch (e) {
        console.error("Failed to update wallet for upgrade:", e);
      }
    }

    // Send Receipt Email
    try {
      const { sendSubscriptionInvoiceEmail } = await import("./email");
      await sendSubscriptionInvoiceEmail({
        data: {
          customer_name,
          customer_email,
          amount: parseFloat(new_price),
          plan_name: new_plan_name,
          billing_cycle: new_billing_cycle,
          currency: currency,
          start_date: new Date().toISOString(),
          end_date: new_next_billing_date,
          workspace_id: workspace_id
        }
      });
    } catch (e) {
      console.error("Failed to send upgrade receipt:", e);
    }

    return { success: true, subscription: updated.update_space_subscriptions_by_pk };
  });

export const markOverdueSubscriptionsOnHold = createServerFn({ method: "POST" }).handler(
  async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const mutation = `
      mutation MarkOverdueOnHold($cutoff: timestamptz!) {
        update_space_subscriptions(
          where: {
            _and: [
              { next_billing_date: { _lt: $cutoff } },
              { status: { _nin: ["on_hold", "cancelled"] } }
            ]
          }
          _set: { status: "on_hold" }
        ) {
          affected_rows
        }
      }
    `;
    const data = await hasuraRequest<{ update_space_subscriptions: { affected_rows: number } }>(
      mutation,
      {
        cutoff: sevenDaysAgo.toISOString(),
      },
    );
    return { success: true, affected_rows: data.update_space_subscriptions?.affected_rows ?? 0 };
  },
);
