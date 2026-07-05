import { hasuraRequest } from "./graphql.server";

export async function handlePawaPayWebhook(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    console.log(`[PawaPay Webhook] Received callback for ${path}:`, body);

    const providerReference = body.depositId || body.payoutId || body.refundId;
    const providerStatus = body.status; // e.g., "COMPLETED", "FAILED"

    if (providerReference) {
      // 1. Update the wallet transaction status
      const updateQuery = `
        mutation UpdateWalletTransactionAndEarnings($provider_reference: String!, $provider_status: String!, $status: String!, $raw_callback_data: jsonb) {
          update_wallet_transactions(
            where: { provider_reference: { _eq: $provider_reference } }, 
            _set: { 
              provider_status: $provider_status, 
              status: $status,
              raw_callback_data: $raw_callback_data,
              updated_at: "now()"
            }
          ) {
            returning {
              id
              status
              reference_id
              type
              amount
              net_amount
              workspace_id
            }
          }
          update_earnings(
            where: { wallet_transaction: { provider_reference: { _eq: $provider_reference } } },
            _set: {
              status: $status,
              updated_at: "now()"
            }
          ) {
            affected_rows
          }
        }
      `;

      const res = await hasuraRequest<{ update_wallet_transactions: any }>(updateQuery, {
        provider_reference: providerReference,
        provider_status: providerStatus || "UNKNOWN",
        status:
          providerStatus === "COMPLETED"
            ? "completed"
            : providerStatus === "FAILED"
              ? "failed"
              : "pending",
        raw_callback_data: body,
      });

      const tx = res.update_wallet_transactions?.returning?.[0];

      // 2. If it's a completed deposit, activate the associated ticket/subscription
      if (tx && tx.status === "completed") {
        if (tx.type === "event_ticket") {
          // Update event_attendees status to "Confirmed" based on a unique custom group ID (reference_id)
          const confirmQuery = `
            mutation ConfirmEventAttendees($booking_ref: String!) {
              update_event_attendees(
                where: { custom_fields: { _contains: { booking_ref: $booking_ref } } },
                _set: { status: "Confirmed" }
              ) {
                affected_rows
              }
            }
          `;
          await hasuraRequest(confirmQuery, { booking_ref: tx.reference_id });
          // Note: Email sending logic might need to be hooked up here if we want background PDF generation
        } else if (tx.type === "space_subscription") {
          const activateSubQuery = `
            mutation ActivateSpaceSubscription($id: uuid!) {
              update_space_subscriptions_by_pk(
                pk_columns: { id: $id },
                _set: { status: "active" }
              ) {
                id
              }
            }
          `;
          await hasuraRequest(activateSubQuery, { id: tx.reference_id });
        } else if (tx.type === "venue_booking") {
          const confirmQuery = `
            mutation ConfirmVenueBooking($id: uuid!) {
              update_venue_bookings_by_pk(
                pk_columns: { id: $id },
                _set: { payment_status: "Paid", status: "Confirmed" }
              ) { id }
            }
          `;
          await hasuraRequest(confirmQuery, { id: tx.reference_id });
        }

        // Safely fund the workspace wallet using the exactly computed net_amount (which securely deducts shortfalls!)
        if (tx.workspace_id && tx.net_amount) {
          const { addMoneyToWorkspaceWallet } = await import("./wallet");
          await addMoneyToWorkspaceWallet({
            data: {
              workspace_id: tx.workspace_id,
              amount: parseFloat(tx.net_amount),
            },
          } as any);
        }
      }

      // 3. Handle Failed Withdrawals (Refund the wallet)
      if (tx && tx.status === "failed" && tx.type === "withdrawal") {
        if (tx.workspace_id && tx.amount) {
          console.log(
            `[PawaPay Webhook] Withdrawal failed. Refunding ${tx.amount} to workspace ${tx.workspace_id}`,
          );
          const { addMoneyToWorkspaceWallet } = await import("./wallet");
          await addMoneyToWorkspaceWallet({
            data: {
              workspace_id: tx.workspace_id,
              amount: parseFloat(tx.amount),
            },
          } as any);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`[PawaPay Webhook] Error processing ${path}:`, error);
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
