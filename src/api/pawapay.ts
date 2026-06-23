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
    const providerStatus = body.status;

    if (providerReference) {
      const updateQuery = `
        mutation UpdateWalletTransaction($provider_reference: String!, $provider_status: String!, $raw_callback_data: jsonb) {
          update_wallet_transactions(
            where: { provider_reference: { _eq: $provider_reference } }, 
            _set: { 
              provider_status: $provider_status, 
              raw_callback_data: $raw_callback_data,
              updated_at: "now()"
            }
          ) {
            returning {
              id
              status
            }
          }
        }
      `;

      await hasuraRequest(updateQuery, {
        provider_reference: providerReference,
        provider_status: providerStatus || "UNKNOWN",
        raw_callback_data: body,
      });
      console.log(`[PawaPay Webhook] Updated transaction for reference: ${providerReference}`);
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
