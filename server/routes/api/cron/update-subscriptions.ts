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
import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export default defineEventHandler(async (event) => {
  // ── Vercel Cron secret guard ───────────────────────────────────────────────
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
          status: "on_hold",
          plan_name: "Basic",
          price: "0"
        }
      ) {
        affected_rows
        returning {
          id
          customer_name
          customer_email
          plan_name
          next_billing_date
          space {
            workspace {
              orgnizer_id
            }
          }
        }
      }
    }
  `;

  let affected_rows = 0;
  let returning = [];
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
    returning = json.data?.update_space_subscriptions?.returning ?? [];

    console.log(
      `[cron/update-subscriptions] ✅ ${affected_rows} subscription(s) moved to on_hold and downgraded to Basic at ${new Date().toISOString()}`,
    );
    
    // Force logout the organizers of the affected subscriptions
    if (returning.length > 0) {
      if (getApps().length === 0) {
        try {
          initializeApp({
            credential: applicationDefault(),
          });
        } catch (error) {
          console.warn("Firebase Admin Initialization Warning:", error);
        }
      }
      
      const db = getFirestore();
      const organizerIds = new Set<string>();
      
      returning.forEach((sub: any) => {
        const orgId = sub?.space?.workspace?.orgnizer_id;
        if (orgId) {
          organizerIds.add(orgId);
        }
      });
      
      const batch = db.batch();
      for (const orgId of organizerIds) {
        const docRef = db.collection("organizer_sessions").doc(orgId);
        batch.set(docRef, { status: "force_logout", updated_at: new Date().toISOString() }, { merge: true });
      }
      
      if (organizerIds.size > 0) {
        await batch.commit();
        console.log(`[cron/update-subscriptions] ✅ Forced logout for ${organizerIds.size} organizer(s).`);
      }
    }
    
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
