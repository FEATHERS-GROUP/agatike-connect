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
      const statusRes = await fetch(
        `${baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const statusData = await statusRes.json();

      if (statusData.error || !statusData.payment_status_description) {
        console.error("Pesapal webhook status error:", statusData);
        return new Response(JSON.stringify({ error: "Failed to fetch status" }), { status: 500 });
      }

      const pesapalStatus = statusData.payment_status_description.toUpperCase();
      let pawaPayMappedStatus = "PENDING";

      if (pesapalStatus === "COMPLETED") {
        pawaPayMappedStatus = "COMPLETED";
      } else if (
        pesapalStatus === "FAILED" ||
        pesapalStatus === "INVALID" ||
        pesapalStatus === "REVERSED"
      ) {
        pawaPayMappedStatus = "FAILED";
      }

      if (pawaPayMappedStatus !== "PENDING") {
        // 3. Build a PawaPay-compatible mocked payload from Pesapal's status data.
        //    We populate all the fields that handlePawaPayWebhook uses to generate
        //    notification messages (email + SMS) so card payers get the same experience
        //    as mobile-money payers.
        //
        //    Pesapal statusData fields (from GetTransactionStatus):
        //      amount           – total amount paid by the customer (gross)
        //      currency         – payment currency (e.g. "RWF", "USD")
        //      phone            – customer phone number (if provided at order time)
        //      confirmation_code – provider's payment reference (e.g. card auth code)
        //      payment_account  – masked card number (e.g. "****1234")
        //      merchant_reference – our reference_id / booking ref stored in the DB

        const pesapalAmount = statusData.amount ?? statusData.charged_amount ?? 0;
        const pesapalCurrency = statusData.currency || "RWF";
        const pesapalPhone = statusData.phone || statusData.billing_address?.phone_number || "";
        const pesapalEmail =
          statusData.billing_address?.email_address &&
          statusData.billing_address.email_address !== "guest@agatike.com"
            ? statusData.billing_address.email_address
            : "";

        const mockedBody = {
          depositId: orderTrackingId, // matches provider_reference in wallet_transactions
          status: pawaPayMappedStatus,

          // ── Fields used by handlePawaPayWebhook to build notification messages ──
          depositedAmount: String(pesapalAmount),   // shown as "amount paid" in emails/SMS
          requestedAmount: String(pesapalAmount),
          currency: pesapalCurrency,
          baseCurrency: pesapalCurrency,

          // payer.address.value is the phone used for SMS confirmations
          payer: {
            address: {
              value: pesapalPhone,
            },
          },

          // guestEmail is used by the handler when sending product-only receipts
          // (attendee-linked purchases use the email from the attendee record itself)
          guestEmail: pesapalEmail,

          // Passed through as raw audit data
          pesapalOriginalData: statusData,
        };

        const mockedRequest = new Request("https://localhost/api/pawapay/deposits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mockedBody),
        });

        // Delegate to the unified webhook handler — handles ticket confirmation,
        // product order confirmation, subscription activation, wallet funding,
        // and all email + SMS notifications.
        await handlePawaPayWebhook(mockedRequest);

        // Return 200 to Pesapal to acknowledge receipt
        return new Response(
          JSON.stringify({
            orderNotificationType: url.searchParams.get("OrderNotificationType"),
            orderTrackingId,
            orderMerchantReference,
            status: 200,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return new Response(
        JSON.stringify({ message: "Status pending, no action taken" }),
        { status: 200 },
      );
    } catch (e: any) {
      console.error("Pesapal webhook handling error", e);
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  },
});
