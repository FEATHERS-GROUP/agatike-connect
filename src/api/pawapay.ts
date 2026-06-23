import { createServerFn } from "@tanstack/react-start";

export const initiatePawaPayDeposit = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { amount, phone, network, type, referenceId } = ctx.data as any;

    if (!process.env.PAWAPAY_API_KEY) {
      throw new Error("PawaPay API Key is not configured.");
    }

    const depositId = crypto.randomUUID();

    const payload = {
      depositId,
      amount: String(amount),
      currency: "RWF", // Adjust if needed
      correspondent: network,
      payer: {
        type: "MSISDN",
        address: { value: phone },
      },
      customerTimestamp: new Date().toISOString(),
      statementDescription: `Payment for ${type}`,
    };

    const response = await fetch("https://api.sandbox.pawapay.cloud/v1/deposits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAWAPAY_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`PawaPay Error: ${data.errorMessage || JSON.stringify(data)}`);
    }

    // Save pending transaction
    const insertQuery = `
      mutation CreatePendingWalletTransaction($amount: numeric!, $currency: String!, $provider_reference: String!, $reference_id: String!, $type: String!, $provider_status: String!, $status: String!) {
        insert_wallet_transactions_one(object: {
          amount: $amount,
          net_amount: $amount,
          currency: $currency,
          provider_reference: $provider_reference,
          reference_id: $reference_id,
          type: $type,
          provider_status: $provider_status,
          status: $status,
          description: "PawaPay Deposit"
        }) {
          id
        }
      }
    `;

    const { hasuraRequest } = await import("./graphql.server");

    await hasuraRequest(insertQuery, {
      amount,
      currency: "RWF",
      provider_reference: depositId,
      reference_id: referenceId, // Could be eventId or subscriptionId
      type,
      provider_status: "PENDING",
      status: "pending",
    });

    return { success: true, depositId };
  });

export const getPawaPayDepositStatus = createServerFn({ method: "POST" })
  .inputValidator((d: { depositId: string }) => d)
  .handler(async (ctx) => {
    const { depositId } = ctx.data;
    if (!depositId) return null;

    const query = `
      query GetDepositStatus($provider_reference: String!) {
        wallet_transactions(where: { provider_reference: { _eq: $provider_reference } }, limit: 1) {
          id
          status
          provider_status
        }
      }
    `;

    const { hasuraRequest } = await import("./graphql.server");

    const data = await hasuraRequest<{ wallet_transactions: any[] }>(query, {
      provider_reference: depositId,
    });

    return data.wallet_transactions?.[0] || null;
  });

