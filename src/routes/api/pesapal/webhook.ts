import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getPesapalToken } from "@/api/pesapal";
import { handlePawaPayWebhook } from "@/api/pawapay.server";

export const APIRoute = createAPIFileRoute("/api/pesapal/webhook")({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const orderTrackingId = url.searchParams.get("OrderTrackingId");
    const orderMerchantReference = url.searchParams.get("OrderMerchantReference");

    if (!orderTrackingId) {
      return new Response(JSON.stringify({ error: "Missing OrderTrackingId" }), { status: 400 });
    }

    try {
      // 1. Get Pesapal token
      const { token, baseUrl } = await getPesapalToken();

      // 2. Fetch the transaction status from Pesapal
      const statusRes = await fetch(`${baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const statusData = await statusRes.json();

      if (statusData.error || !statusData.payment_status_description) {
        console.error("Pesapal webhook status error:", statusData);
        return new Response(JSON.stringify({ error: "Failed to fetch status" }), { status: 500 });
      }

      const pesapalStatus = statusData.payment_status_description.toUpperCase();
      let pawaPayMappedStatus = "PENDING";

      if (pesapalStatus === "COMPLETED") {
        pawaPayMappedStatus = "COMPLETED";
      } else if (pesapalStatus === "FAILED" || pesapalStatus === "INVALID" || pesapalStatus === "REVERSED") {
        pawaPayMappedStatus = "FAILED";
      }

      if (pawaPayMappedStatus !== "PENDING") {
        // 3. Hand off to the robust PawaPay webhook handler by mocking a PawaPay webhook payload
        const mockedRequest = new Request("https://localhost/api/pawapay/deposits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            depositId: orderTrackingId, // Maps to provider_reference in DB
            status: pawaPayMappedStatus,
            pesapalOriginalData: statusData // Pass full data for raw_callback_data audit
          })
        });

        // The handlePawaPayWebhook method expects a request object with a JSON payload.
        // It updates wallet_transactions, earnings, and triggers ticket issuance/emails.
        const res = await handlePawaPayWebhook(mockedRequest);
        
        // Return 200 to Pesapal with a response to acknowledge receipt
        return new Response(JSON.stringify({
          orderNotificationType: url.searchParams.get("OrderNotificationType"),
          orderTrackingId,
          orderMerchantReference,
          status: 200
        }), { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        });
      }

      return new Response(JSON.stringify({ message: "Status pending, no action taken" }), { status: 200 });

    } catch (e: any) {
      console.error("Pesapal webhook handling error", e);
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  },
});
