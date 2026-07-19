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

export const getProfitableNetworks = createServerFn({ method: "POST" })
  .validator(
    (d: { workspaceId: string; baseAmount: number; networks: string[]; countryCode?: string }) => d,
  )
  .handler(async (ctx) => {
    const { workspaceId, baseAmount, networks } = ctx.data;
    if (!workspaceId || !baseAmount || !networks || networks.length === 0) return networks;

    const { hasuraRequest } = await import("./graphql.server");
    const { getWorkspaceActivePlanFees } = await import("./billing");

    // Fetch all provider fees and the workspace's organizer ID
    const [feeRes, workspaceRes] = await Promise.all([
      hasuraRequest<any>(
        `query GetProviderFees {
          payment_provider_fees {
            network
            collection_percentage
            collection_fixed_fee
            is_tiered
            tiered_rules
          }
        }`,
      ),
      hasuraRequest<any>(
        `query GetWorkspaceOrg($workspace_id: uuid!) {
          workspaces_by_pk(id: $workspace_id) {
            orgnizer_id
          }
        }`,
        { workspace_id: workspaceId },
      ),
    ]);

    const allFees = feeRes.payment_provider_fees || [];
    const organizerId = workspaceRes.workspaces_by_pk?.orgnizer_id;

    // Fetch pricing plan using the billing service
    const plan = await getWorkspaceActivePlanFees({ data: { organizer_id: organizerId } } as any);

    const custCollectionPct = parseFloat(plan.customer_collection_fee_percentage as any) || 0;
    const custFixed = parseFloat(plan.customer_collection_fee_fixed as any) || 0;
    const custServicePct = parseFloat(plan.customer_service_fee_percentage as any) || 0;

    const orgCollectionPct = parseFloat(plan.organizer_collection_fee_percentage as any) || 0;
    const orgFixed = parseFloat(plan.organizer_collection_fee_fixed as any) || 0;
    const orgPlatformPct = parseFloat(plan.organizer_platform_contribution as any) || 0;

    const planMaxSubsidyPct = parseFloat(plan.max_collection_subsidy_percentage as any) ?? 1.0;
    const withdrawalFeePct = parseFloat(plan.withdrawal_fee_percentage as any) || 0;
    const isSubsidyEnabled = plan.enable_subsidized_collection !== false;

    // Calculate final allowed subsidy amount
    // Option B + A hybrid: cap subsidy percentage at (withdrawal margin * 0.7)
    const finalSubsidyPct = Math.min(planMaxSubsidyPct, withdrawalFeePct * 0.7);
    const maxAllowedSubsidyAmount = isSubsidyEnabled ? baseAmount * (finalSubsidyPct / 100) : 0;

    const profitableNetworks = networks.filter((network) => {
      const providerFees = allFees.find((f: any) => f.network === network) || {};
      let collectionPercentage = parseFloat(providerFees.collection_percentage) || 0;
      let collectionFixed = parseFloat(providerFees.collection_fixed_fee) || 0;

      // Calculate Customer Fee and Organizer Fee based on baseAmount
      const customerFee =
        baseAmount * (custCollectionPct / 100) + custFixed + baseAmount * (custServicePct / 100);
      const grossAmount = baseAmount + customerFee;
      const organizerFee =
        baseAmount * (orgCollectionPct / 100) + orgFixed + baseAmount * (orgPlatformPct / 100);

      // Evaluate tiered rules based on grossAmount
      if (providerFees.is_tiered && providerFees.tiered_rules) {
        let rules = providerFees.tiered_rules;
        try {
          if (typeof rules === "string") rules = JSON.parse(rules);
          if (typeof rules === "string") rules = JSON.parse(rules);
        } catch (e) {
          console.error("Failed to parse tiered rules", e);
        }

        if (rules && rules.collection && Array.isArray(rules.collection)) {
          const matchedRule =
            rules.collection.find((r: any) => grossAmount <= r.max) ||
            rules.collection[rules.collection.length - 1];
          if (matchedRule) {
            collectionPercentage = matchedRule.pct || 0;
            collectionFixed = matchedRule.fixed || 0;
          }
        }
      }

      // Calculate Provider Cost
      const providerCost = grossAmount * (collectionPercentage / 100) + collectionFixed;

      // New Profit Logic (Lifecycle Engine)
      // The organizer and the customer share the collection fee, so both are used to cover the cost
      const guaranteedRevenue = organizerFee + customerFee;
      const shortfall = providerCost - guaranteedRevenue;

      const hideNetwork = shortfall > maxAllowedSubsidyAmount;

      return !hideNetwork;
    });

    return profitableNetworks;
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

    const { hasuraRequest } = await import("./graphql.server");

    // Get or Create Workspace Wallet
    const walletRes = await hasuraRequest<{ wallets: { id: string }[] }>(
      `query GetWorkspaceWallet($workspace_id: uuid!) {
        wallets(where: { workspace_id: { _eq: $workspace_id } }) { id }
      }`,
      { workspace_id: workspaceId },
    );
    let walletId = walletRes.wallets?.[0]?.id;

    if (!walletId) {
      const createRes = await hasuraRequest<{ insert_wallets_one: { id: string } }>(
        `mutation CreateWallet($workspace_id: uuid!, $currency: String!) {
          insert_wallets_one(object: { workspace_id: $workspace_id, amount: 0, currency: $currency, walletNumber: "Not setup" }) { id }
        }`,
        { workspace_id: workspaceId, currency },
      );
      walletId = createRes.insert_wallets_one?.id;
    }

    // Parallel fetch: PawaPay provider fees + workspace organizer
    const [feeRes, workspaceRes] = await Promise.all([
      hasuraRequest<any>(
        `query GetProviderFees($network: String!) {
          payment_provider_fees(where: { network: { _eq: $network } }, limit: 1) {
            collection_percentage
            collection_fixed_fee
            is_tiered
            tiered_rules
          }
        }`,
        { network },
      ),
      hasuraRequest<any>(
        `query GetWorkspaceOrg($workspace_id: uuid!) {
          workspaces_by_pk(id: $workspace_id) {
            orgnizer_id
          }
        }`,
        { workspace_id: workspaceId },
      ),
    ]);

    const organizerId = workspaceRes.workspaces_by_pk?.orgnizer_id;
    const { getWorkspaceActivePlanFees } = await import("./billing");
    const plan = await getWorkspaceActivePlanFees({ data: { organizer_id: organizerId } } as any);

    // ── Pricing plan fees ────────────────────────────────────────────────────
    const custCollectionPct = parseFloat(plan.customer_collection_fee_percentage as any) || 0;
    const custFixed = parseFloat(plan.customer_collection_fee_fixed as any) || 0;
    const custServicePct = parseFloat(plan.customer_service_fee_percentage as any) || 0;

    const orgCollectionPct = parseFloat(plan.organizer_collection_fee_percentage as any) || 0;
    const orgFixed = parseFloat(plan.organizer_collection_fee_fixed as any) || 0;
    const orgPlatformPct = parseFloat(plan.organizer_platform_contribution as any) || 0;

    const grossAmount = parseFloat(amount);
    const baseAmt = parseFloat(baseAmount || amount);
    const calculatedCustomerFee =
      baseAmt * (custCollectionPct / 100) + custFixed + baseAmt * (custServicePct / 100);
    let customerFee = Math.max(grossAmount - baseAmt, calculatedCustomerFee);

    // ── Provider (PawaPay) cost ──────────────────────────────────────────────
    const pf = feeRes.payment_provider_fees?.[0] || {};
    let providerPct = parseFloat(pf.collection_percentage) || 0;
    let providerFixed = parseFloat(pf.collection_fixed_fee) || 0;

    if (pf.is_tiered && pf.tiered_rules) {
      let rules = pf.tiered_rules;
      try {
        if (typeof rules === "string") rules = JSON.parse(rules);
        if (typeof rules === "string") rules = JSON.parse(rules);
      } catch (e) {
        console.error("Failed to parse tiered rules", e);
      }

      if (rules && rules.collection && Array.isArray(rules.collection)) {
        const matchedRule =
          rules.collection.find((r: any) => grossAmount <= r.max) ||
          rules.collection[rules.collection.length - 1];
        if (matchedRule) {
          providerPct = matchedRule.pct || 0;
          providerFixed = matchedRule.fixed || 0;
        }
      }
    }

    const providerCost = grossAmount * (providerPct / 100) + providerFixed;

    // Organizer fee = deducted from their wallet settlement
    let organizerFee =
      baseAmt * (orgCollectionPct / 100) + orgFixed + baseAmt * (orgPlatformPct / 100);

    // If there is a shortfall on a micro-transaction, the organizer absorbs it to cover the network cost (README 12.1)
    if (shortfall > 0) {
      organizerFee += parseFloat(shortfall as any);
    }

    // ── Platform revenue & profit ────────────────────────────────────────────
    // Platform Revenue = Customer Contribution + Organizer Contribution
    // Net Profit       = Platform Revenue − Provider (PawaPay) Cost
    let platformRevenue = customerFee + organizerFee;
    let netProfit = platformRevenue - providerCost;

    // Organizer wallet receives base minus their total contribution (fees + shortfall)
    let organizerNetAmount = Math.max(0, baseAmt - organizerFee);

    if (type === "subscription") {
      customerFee = 0;
      organizerFee = 0;
      platformRevenue = grossAmount;
      netProfit = platformRevenue - providerCost;
      organizerNetAmount = 0; // Subscription is a payment to the platform, not a wallet deposit
    }

    // ── Insert wallet transaction + earnings atomically ──────────────────────
    const txRes = await hasuraRequest<any>(
      `mutation CreatePendingWalletTransactionAndEarnings(
        $amount: String!, $net_amount: String!, $currency: String!,
        $provider_reference: String!, $reference_id: String!,
        $type: String!, $provider_status: String!, $status: String!,
        $wallet_id: uuid!, $workspace_id: uuid!,
        $gross: numeric!, $cost: numeric!, $rev: numeric!, $profit: numeric!,
        $cust_fee: numeric!, $org_fee: numeric!, $platform_fee: numeric!
      ) {
        insert_wallet_transactions_one(object: {
          amount: $amount, net_amount: $net_amount, currency: $currency,
          provider_reference: $provider_reference, reference_id: $reference_id,
          type: $type, provider_status: $provider_status, status: $status,
          wallet_id: $wallet_id, workspace_id: $workspace_id, description: "PawaPay Deposit",
          platform_fee: $platform_fee
        }) { id }
        insert_earnings_one(object: {
          transaction_type: $type,
          gross_amount: $gross,
          provider_cost: $cost,
          platform_revenue: $rev,
          net_profit: $profit,
          customer_fee: $cust_fee,
          organizer_fee: $org_fee,
          currency: $currency,
          status: $status
        }) { id }
      }`,
      {
        amount: String(baseAmt),
        net_amount: String(organizerNetAmount),
        currency: baseCurrency || currency,
        provider_reference: depositId,
        reference_id: referenceId,
        type,
        provider_status: "PENDING",
        status: "pending",
        wallet_id: walletId,
        workspace_id: workspaceId,
        gross: grossAmount,
        cost: providerCost,
        rev: platformRevenue,
        profit: netProfit,
        cust_fee: customerFee,
        org_fee: organizerFee,
        platform_fee: organizerFee,
      },
    );

    // Link the earnings record to the wallet transaction via FK
    const txId = txRes.insert_wallet_transactions_one.id;
    const earningsId = txRes.insert_earnings_one.id;
    await hasuraRequest(
      `mutation LinkEarnings($id: uuid!, $txId: uuid!) {
        update_earnings_by_pk(pk_columns: {id: $id}, _set: {wallet_transaction_id: $txId}) { id }
      }`,
      { id: earningsId, txId },
    );

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
            const pawaPayload = Array.isArray(pawaData) ? pawaData[0] : pawaData;

            // Simulate a webhook request to reuse the exact same completion/failure logic (Email, SMS, Wallet, Earnings)
            const mockRequest = new Request("http://localhost:3000/api/pawapay/deposits", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(pawaPayload),
            });

            const { handlePawaPayWebhook } = await import("./pawapay.server");
            await handlePawaPayWebhook(mockRequest);

            const newStatus = providerStatus === "COMPLETED" ? "completed" : "failed";

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

export const cancelPendingPayment = createServerFn({ method: "POST" })
  .validator((d: { depositId: string }) => d)
  .handler(async (ctx) => {
    const { depositId } = ctx.data;
    if (!depositId) return { success: false };

    const { hasuraRequest } = await import("./graphql.server");

    // 1. Fetch the wallet transaction for this deposit
    const txQuery = `
      query GetTxForCancel($provider_reference: String!) {
        wallet_transactions(where: { provider_reference: { _eq: $provider_reference } }, limit: 1) {
          id
          status
          type
          reference_id
        }
      }
    `;
    const txData = await hasuraRequest<{ wallet_transactions: any[] }>(txQuery, {
      provider_reference: depositId,
    });
    const tx = txData.wallet_transactions?.[0];

    if (!tx || tx.status !== "pending") {
      // Already completed/failed/cancelled — nothing to do
      return { success: false, reason: "no_pending_tx" };
    }

    // 2. Mark wallet transaction as cancelled
    await hasuraRequest(
      `mutation CancelWalletTx($id: uuid!) {
        update_wallet_transactions_by_pk(pk_columns: { id: $id }, _set: { status: "cancelled", provider_status: "CANCELLED" }) { id }
      }`,
      { id: tx.id },
    );

    // 3. Roll back the dependent entity based on transaction type
    if (tx.type === "event_ticket" && tx.reference_id) {
      // reference_id is booking_ref for events
      // Mark attendees with this booking_ref as Cancelled and restore sold counts
      const attendeesQuery = `
        query GetPendingAttendees($booking_ref: String!) {
          event_attendees(where: {
            custom_fields: { _contains: { booking_ref: $booking_ref } },
            status: { _eq: "Pending Payment" }
          }) {
            id
            ticket_id
          }
        }
      `;
      const attendeesData = await hasuraRequest<{ event_attendees: any[] }>(attendeesQuery, {
        booking_ref: tx.reference_id,
      });
      const attendees = attendeesData.event_attendees || [];

      if (attendees.length > 0) {
        // Cancel the attendees
        await hasuraRequest(
          `mutation CancelAttendees($booking_ref: String!) {
            update_event_attendees(
              where: { custom_fields: { _contains: { booking_ref: $booking_ref } }, status: { _eq: "Pending Payment" } },
              _set: { status: "Cancelled" }
            ) { affected_rows }
          }`,
          { booking_ref: tx.reference_id },
        );

        // Restore ticket sold counts by ticket_id
        const soldByTier: Record<string, number> = {};
        for (const a of attendees) {
          if (a.ticket_id && a.ticket_id !== "ga") {
            soldByTier[a.ticket_id] = (soldByTier[a.ticket_id] || 0) + 1;
          }
        }
        for (const [ticketId, qty] of Object.entries(soldByTier)) {
          // Bug fix 1: use query (not mutation) to fetch the current ticket data
          await hasuraRequest(
            `query GetTicketSold($id: uuid!) {
              ticket: event_tickets_by_pk(id: $id) { id sold remaining }
            }`,
            { id: ticketId },
          )
            .then(async (r: any) => {
              const currentSold = parseInt(r?.ticket?.sold || "0");
              const currentRemaining = parseInt(r?.ticket?.remaining || "0");
              const newSold = Math.max(0, currentSold - (qty as number));
              // Bug fix 2: also restore `remaining` so spaces-left is correctly updated
              const newRemaining = currentRemaining + (qty as number);
              await hasuraRequest(
                `mutation RestoreTicketCounts($id: uuid!, $sold: String!, $remaining: String!) {
                update_event_tickets_by_pk(pk_columns: { id: $id }, _set: { sold: $sold, remaining: $remaining }) { id }
              }`,
                { id: ticketId, sold: String(newSold), remaining: String(newRemaining) },
              );
            })
            .catch(console.error);
        }
      }
    } else if (tx.type === "venue_booking" && tx.reference_id) {
      const bookingIds = tx.reference_id.split(",");
      await hasuraRequest(
        `mutation CancelVenueBookings($ids: [uuid!]!) {
          update_venue_bookings(
            where: { id: { _in: $ids }, status: { _neq: "Cancelled" } },
            _set: { status: "Cancelled", payment_status: "Cancelled" }
          ) { affected_rows }
        }`,
        { ids: bookingIds },
      );
    } else if (tx.type === "movie_ticket" && tx.reference_id) {
      const bookingIds = tx.reference_id.split(",");
      // First fetch booking details to know schedule/tier/quantity before cancelling
      const bookingDetails = await hasuraRequest<{ cinema_bookings: any[] }>(
        `query GetCinemaBookingsForCancel($ids: [uuid!]!) {
          cinema_bookings(where: { id: { _in: $ids }, status: { _neq: "Cancelled" } }) {
            id
            schedule_id
            ticket_tier_id
            quantity
          }
        }`,
        { ids: bookingIds },
      );
      const activeBookings = bookingDetails.cinema_bookings || [];

      // Cancel the bookings
      await hasuraRequest(
        `mutation CancelCinemaBookings($ids: [uuid!]!) {
          update_cinema_bookings(
            where: { id: { _in: $ids }, status: { _neq: "Cancelled" } },
            _set: { status: "Cancelled" }
          ) { affected_rows }
        }`,
        { ids: bookingIds },
      );

      // Decrement booked_seats and sold_seats for each booking (mirrors createCinemaBooking increments)
      for (const booking of activeBookings) {
        if (booking.schedule_id && booking.quantity) {
          await hasuraRequest(
            `mutation RestoreCinemaSeats($schedule_id: uuid!, $qty: Int!, $ticket_tier_id: uuid) {
              update_cinema_schedules_by_pk(
                pk_columns: { id: $schedule_id },
                _inc: { booked_seats: $qty }
              ) { id }
              update_cinema_schedule_ticket_tiers(
                where: { schedule_id: { _eq: $schedule_id }, ticket_tier_id: { _eq: $ticket_tier_id } },
                _inc: { sold_seats: $qty }
              ) { affected_rows }
            }`,
            {
              schedule_id: booking.schedule_id,
              qty: -booking.quantity, // negative to decrement
              ticket_tier_id: booking.ticket_tier_id || null,
            },
          ).catch(console.error);
        }
      }
    } else if (tx.type === "space_subscription" && tx.reference_id) {
      await hasuraRequest(
        `mutation CancelSpaceSubscription($id: uuid!) {
          update_space_subscriptions_by_pk(pk_columns: { id: $id }, _set: { status: "cancelled" }) { id }
        }`,
        { id: tx.reference_id },
      );
    }

    return { success: true };
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
    const res = await hasuraRequest<{ wallet_transactions_by_pk: any }>(query, {
      id: transactionId,
    });
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
        address: { value: tx.payout_account },
      },
      customerTimestamp: new Date().toISOString(),
      statementDescription: "Agatike Withdrawal",
    };

    const payoutRes = await fetch(`${baseUrl}/v1/payouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAWAPAY_API_KEY}`,
      },
      body: JSON.stringify(body),
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
