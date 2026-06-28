import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

export const getExchangeRate = createServerFn({ method: "POST" })
  .validator((d: { base: string; target: string }) => d)
  .handler(async (ctx) => {
    const { base, target } = ctx.data;
    const safeBase = (base || "RWF").toUpperCase().replace("FRW", "RWF");
    const safeTarget = (target || "RWF").toUpperCase().replace("FRW", "RWF");

    if (safeBase === safeTarget) return { rate: 1, markupRate: 1 };

    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${safeBase}`);
      if (!res.ok) throw new Error("Failed to fetch exchange rates");
      const data = await res.json();

      const rate = data.rates[safeTarget];
      if (!rate) throw new Error(`Currency ${safeTarget} not supported by exchange API`);

      // Add 2% markup to protect from FX fluctuations
      const markupRate = rate * 1.02;

      return { rate, markupRate };
    } catch (err) {
      console.error("Exchange Rate Error:", err);
      // Fallback rough rates if API fails
      return { rate: 1, markupRate: 1.02 };
    }
  });

export const getPawaPayNetworks = createServerFn({ method: "GET" }).handler(async () => {
  if (!process.env.PAWAPAY_API_KEY) {
    console.log("[PawaPay] PAWAPAY_API_KEY is missing from env");
    return [];
  }

  try {
    const baseUrl = process.env.PAWAPAY_API_URL;
    if (!baseUrl) return [];
    const response = await fetch(`${baseUrl}/v1/active-conf`, {
      headers: { Authorization: `Bearer ${process.env.PAWAPAY_API_KEY}` },
    });
    if (!response.ok) {
      console.error(`[PawaPay] active-conf failed: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const networks: { id: string; name: string; currency: string; country: string }[] = [];

    for (const item of data.countries || []) {
      for (const corr of item.correspondents) {
        const hasDeposit = corr.operationTypes?.some((op: any) => op.operationType === "DEPOSIT");
        if (hasDeposit) {
          networks.push({
            id: corr.correspondent,
            name: corr.correspondent.replace(/_/g, " "), // Basic pretty print
            currency: corr.currency,
            country: item.country,
          });
        }
      }
    }

    // Deduplicate by network ID to prevent React duplicate key errors
    const uniqueNetworks = Array.from(new Map(networks.map((n) => [n.id, n])).values());
    return uniqueNetworks;
  } catch (e) {
    console.error("Failed to fetch pawapay networks", e);
    return [];
  }
});

const GET_PAYMENT_PROVIDER_FEES = `
  query GetProviderFees($network: String!, $countryCode: String) {
    payment_provider_fees(where: {
      _and: [
        { network: { _eq: $network } },
        { country_code: { _eq: $countryCode } }
      ]
    }, limit: 1) {
      id
      collection_percentage
      collection_fixed_fee
      disbursement_percentage
      disbursement_fixed_fee
      is_tiered
    }
  }
`;

export const getPaymentProviderFees = createServerFn({ method: "POST" })
  .validator((d: { network: string; countryCode?: string }) => d)
  .handler(async (ctx) => {
    try {
      const res = await hasuraRequest<any>(GET_PAYMENT_PROVIDER_FEES, {
        network: ctx.data.network,
        countryCode: ctx.data.countryCode || "RWA",
      });
      return res.payment_provider_fees?.[0] || null;
    } catch (e) {
      console.error("Failed to fetch payment provider fees:", e);
      return null;
    }
  });

const GET_ALL_PROVIDER_FEES = `
  query GetAllProviderFees {
    payment_provider_fees {
      id
      network
      country_code
      collection_percentage
      collection_fixed_fee
      disbursement_percentage
      disbursement_fixed_fee
      is_tiered
    }
  }
`;

export const getAllPaymentProviderFees = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const res = await hasuraRequest<any>(GET_ALL_PROVIDER_FEES);
    return res.payment_provider_fees || [];
  } catch (e) {
    console.error("Failed to fetch all provider fees:", e);
    return [];
  }
});

export const initiatePawaPayDeposit = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const {
      amount,
      baseAmount,
      baseCurrency,
      phone,
      network,
      type,
      referenceId,
      workspaceId,
      currency,
      reason,
      shortfall = 0,
    } = ctx.data as any;

    if (!currency) {
      throw new Error("Currency is required for PawaPay deposit.");
    }

    if (!workspaceId) {
      throw new Error("Workspace ID is required for PawaPay deposit.");
    }

    if (!process.env.PAWAPAY_API_KEY) {
      throw new Error("PawaPay API Key is not configured.");
    }

    const depositId = crypto.randomUUID();

    const payload = {
      depositId,
      amount: String(amount),
      currency: currency,
      correspondent: network, // exact PawaPay correspondent passed from frontend
      payer: {
        type: "MSISDN",
        address: { value: phone },
      },
      customerTimestamp: new Date().toISOString(),
      statementDescription: (reason || `Agatike ${type === "event_ticket" ? "Ticket" : "Sub"}`)
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .substring(0, 22),
    };

    const baseUrl = process.env.PAWAPAY_API_URL;
    const response = await fetch(`${baseUrl}/v1/deposits`, {
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

    if (data.status === "REJECTED") {
      throw new Error(
        `PawaPay Rejected: ${data.rejectionReason?.rejectionMessage || "Invalid Payment Details"}`,
      );
    }

    // Save pending transaction
    const { hasuraRequest } = await import("./graphql.server");

    // Get or Create Wallet
    const getWalletQuery = `
      query GetWorkspaceWallet($workspace_id: uuid!) {
        wallets(where: { workspace_id: { _eq: $workspace_id } }) {
          id
        }
      }
    `;
    const walletRes = await hasuraRequest<{ wallets: { id: string }[] }>(getWalletQuery, {
      workspace_id: workspaceId,
    });
    let walletId = walletRes.wallets?.[0]?.id;

    if (!walletId) {
      const createWalletMutation = `
        mutation CreateWallet($workspace_id: uuid!, $currency: String!) {
          insert_wallets_one(object: { workspace_id: $workspace_id, amount: 0, currency: $currency, walletNumber: "Not setup" }) {
            id
          }
        }
      `;
      const createRes = await hasuraRequest<{ insert_wallets_one: { id: string } }>(
        createWalletMutation,
        { workspace_id: workspaceId, currency: currency },
      );
      walletId = createRes.insert_wallets_one?.id;
    }

    const insertQuery = `
      mutation CreatePendingWalletTransaction($amount: String!, $net_amount: String!, $currency: String!, $provider_reference: String!, $reference_id: String!, $type: String!, $provider_status: String!, $status: String!, $wallet_id: uuid!) {
        insert_wallet_transactions_one(object: {
          amount: $amount,
          net_amount: $net_amount,
          currency: $currency,
          provider_reference: $provider_reference,
          reference_id: $reference_id,
          type: $type,
          provider_status: $provider_status,
          status: $status,
          wallet_id: $wallet_id,
          description: "PawaPay Deposit"
        }) {
          id
        }
      }
    `;

    await hasuraRequest(insertQuery, {
      amount: String(baseAmount || amount),
      net_amount: String((baseAmount || amount) - shortfall),
      currency: baseCurrency || currency,
      provider_reference: depositId,
      reference_id: referenceId, // Could be eventId or subscriptionId
      type,
      provider_status: "PENDING",
      status: "pending",
      wallet_id: walletId,
    });

    return { success: true, depositId };
  });

export const getPawaPayDepositStatus = createServerFn({ method: "POST" })
  .validator((d: { depositId: string }) => d)
  .handler(async (ctx) => {
    const { depositId } = ctx.data;
    if (!depositId) return null;
    const { hasuraRequest } = await import("./graphql.server");

    const query = `
      query GetDepositStatus($provider_reference: String!) {
        wallet_transactions(where: { provider_reference: { _eq: $provider_reference } }, limit: 1) {
          id
          status
          provider_status
          reference_id
          type
        }
      }
    `;

    const data = await hasuraRequest<{ wallet_transactions: any[] }>(query, {
      provider_reference: depositId,
    });

    let tx = data.wallet_transactions?.[0] || null;

    // Active Polling Fallback: If webhook hasn't hit or we are on localhost, check PawaPay API directly
    if (tx && tx.status === "pending" && process.env.PAWAPAY_API_KEY) {
      try {
        const baseUrl = process.env.PAWAPAY_API_URL;
        if (!baseUrl) return tx;
        const url = `${baseUrl}/v1/deposits/${depositId}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.PAWAPAY_API_KEY}`,
          },
        });

        if (response.ok) {
          const pawaData = await response.json();
          const providerStatus = Array.isArray(pawaData) ? pawaData[0]?.status : pawaData.status;

          if (providerStatus && (providerStatus === "COMPLETED" || providerStatus === "FAILED")) {
            const newStatus = providerStatus === "COMPLETED" ? "completed" : "failed";

            // Update local DB
            const updateQuery = `
              mutation UpdateWalletTransaction($provider_reference: String!, $provider_status: String!, $status: String!) {
                update_wallet_transactions(
                  where: { provider_reference: { _eq: $provider_reference } }, 
                  _set: { 
                    provider_status: $provider_status, 
                    status: $status,
                    updated_at: "now()"
                  }
                ) {
                  returning { id }
                }
              }
            `;
            await hasuraRequest(updateQuery, {
              provider_reference: depositId,
              provider_status: providerStatus,
              status: newStatus,
            });

            // Trigger completion logic
            if (newStatus === "completed") {
              if (tx.type === "event_ticket") {
                const confirmQuery = `
                  mutation ConfirmEventAttendees($booking_ref: String!) {
                    update_event_attendees(
                      where: { custom_fields: { _contains: { booking_ref: $booking_ref } } },
                      _set: { status: "Confirmed" }
                    ) { affected_rows }
                  }
                `;
                await hasuraRequest(confirmQuery, { booking_ref: tx.reference_id });
              } else if (tx.type === "space_subscription") {
                const activateSubQuery = `
                  mutation ActivateSpaceSubscription($id: uuid!) {
                    update_space_subscriptions_by_pk(pk_columns: { id: $id }, _set: { status: "active" }) { id }
                  }
                `;
                await hasuraRequest(activateSubQuery, { id: tx.reference_id });
              } else if (tx.type === "movie_ticket") {
                const bookingIds = tx.reference_id.split(",");
                const confirmQuery = `
                  mutation ConfirmCinemaBookings($ids: [uuid!]!) {
                    update_cinema_bookings(
                      where: { id: { _in: $ids } },
                      _set: { status: "Confirmed" }
                    ) { affected_rows }
                  }
                `;
                await hasuraRequest(confirmQuery, { ids: bookingIds });
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
            }

            // Update local object so the frontend sees it immediately
            tx.status = newStatus;
            tx.provider_status = providerStatus;
          }
        }
      } catch (err) {
        console.error("[PawaPay] Active polling fallback failed:", err);
      }
    }

    return tx;
  });

export const triggerPawaPayPayout = createServerFn({ method: "POST" })
  .validator((d: { transactionId: string }) => d)
  .handler(async (ctx) => {
    const { transactionId } = ctx.data;
    if (!process.env.PAWAPAY_API_KEY) throw new Error("PAWAPAY_API_KEY is missing");

    const query = `
      query GetTx($id: uuid!) {
        wallet_transactions_by_pk(id: $id) {
          id
          status
          net_amount
          currency
          payout_account
          raw_callback_data
        }
      }
    `;
    const res = await hasuraRequest<{ wallet_transactions_by_pk: any }>(query, { id: transactionId });
    const tx = res.wallet_transactions_by_pk;

    if (!tx) throw new Error("Transaction not found");
    if (tx.status !== "pending") throw new Error(`Transaction is already ${tx.status}`);

    const network = tx.raw_callback_data?.network_id;
    if (!network) throw new Error("Missing network_id in transaction data");

    const baseUrl = process.env.PAWAPAY_API_URL;
    const body = {
      payoutId: tx.id,
      amount: String(tx.net_amount),
      currency: tx.currency,
      correspondent: network,
      recipient: {
        type: "MSISDN",
        address: { value: tx.payout_account }
      },
      customerTimestamp: new Date().toISOString(),
      statementDescription: "Agatike Withdrawal"
    };

    const payoutRes = await fetch(`${baseUrl}/v1/payouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAWAPAY_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    const data = await payoutRes.json();
    if (!payoutRes.ok) {
      throw new Error(data.errorMessage || data.message || "PawaPay API error");
    }

    const updateQuery = `
      mutation UpdateTx($id: uuid!, $provider_status: String!) {
        update_wallet_transactions_by_pk(pk_columns: { id: $id }, _set: { provider_status: $provider_status, provider_reference: $id }) {
          id
        }
      }
    `;
    await hasuraRequest(updateQuery, { id: tx.id, provider_status: data.status || "ACCEPTED" });

    return { success: true, data };
  });



