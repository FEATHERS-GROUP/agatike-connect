/**
 * Vercel Cron Job handler — runs daily at 11:00 UTC (configured in vercel.json).
 *
 * Finds all space_subscriptions where:
 *   - next_billing_date is more than 7 days in the past
 *   - status is NOT already "on_hold" or "cancelled"
 *
 * And sets their status to "on_hold" + payment_status to "not_paid".
 *
 * This is a background operation; members are NOT notified here.
 * The user does not need to be authenticated to trigger this endpoint
 * (it is protected by Vercel's cron secret header check below).
 */

import { defineEventHandler, getHeader, sendError, createError } from "h3";

export default defineEventHandler(async (event) => {
  // ── Vercel Cron secret guard ───────────────────────────────────────────────
  // Vercel sets the "authorization" header with the CRON_SECRET value when
  // invoking cron jobs.  On local / non-Vercel environments this check is
  // skipped so you can test the endpoint manually.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = getHeader(event, "authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      sendError(event, createError({ statusCode: 401, statusMessage: "Unauthorized" }));
      return;
    }
  }

  const hasuraEndpoint = process.env.HASURA_GRAPHQL_ENDPOINT || process.env.VITE_HASURA_URL;
  const hasuraSecret = process.env.HASURA_ADMIN_SECRET || process.env.VITE_HASURA_ADMIN_SECRET;

  if (!hasuraEndpoint || !hasuraSecret) {
    sendError(
      event,
      createError({ statusCode: 500, statusMessage: "Missing Hasura environment variables" }),
    );
    return;
  }

  // Any subscription whose next_billing_date was more than 7 days ago
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7);

  const mutation = `
    mutation MarkOverdueSubscriptionsOnHold($cutoff: timestamptz!) {
      update_space_subscriptions(
        where: {
          _and: [
            { next_billing_date: { _lt: $cutoff } },
            { status: { _nin: ["on_hold", "cancelled"] } }
          ]
        }
        _set: {
          status: "on_hold"
        }
      ) {
        affected_rows
        returning {
          id
          customer_name
          customer_email
          plan_name
          next_billing_date
        }
      }
    }
  `;

  let affected_rows = 0;
  try {
    const response = await fetch(hasuraEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": hasuraSecret,
      },
      body: JSON.stringify({
        query: mutation,
        variables: { cutoff: cutoffDate.toISOString() },
      }),
    });

    const json = await response.json();

    if (json.errors) {
      console.error("[cron/update-subscriptions] GraphQL errors:", json.errors);
      sendError(
        event,
        createError({ statusCode: 500, statusMessage: json.errors[0]?.message || "GraphQL error" }),
      );
      return;
    }

    affected_rows = json.data?.update_space_subscriptions?.affected_rows ?? 0;

    console.log(
      `[cron/update-subscriptions] ✅ ${affected_rows} subscription(s) moved to on_hold at ${new Date().toISOString()}`,
    );
  } catch (err: any) {
    console.error("[cron/update-subscriptions] Fetch error:", err);
    sendError(event, createError({ statusCode: 500, statusMessage: err.message }));
    return;
  }

  return {
    ok: true,
    ran_at: new Date().toISOString(),
    subscriptions_put_on_hold: affected_rows,
  };
});
