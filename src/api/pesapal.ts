import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

export async function getPesapalToken() {
  const key = process.env.PESAPAL_CONSUMER_KEY;
  const secret = process.env.PESAPAL_CONSUMER_SECRET;
  if (!key || !secret) throw new Error("Pesapal credentials not found");

  const isLive = process.env.NODE_ENV === "production";
  const baseUrl = isLive ? "https://pay.pesapal.com/v3" : "https://cybqa.pesapal.com/pesapalv3";

  console.log(`[PESAPAL] Attempting to authenticate with ${baseUrl}...`);
  try {
    const res = await fetch(`${baseUrl}/api/Auth/RequestToken`, {
      signal: AbortSignal.timeout(15000),
      method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ consumer_key: key, consumer_secret: secret }),
  });

    const data = await res.json();
    if (data.status !== "200") {
      console.error(`[PESAPAL] Auth Error: ${data.message}`);
      throw new Error(`Payment Auth Error: ${data.message}`);
    }
    console.log(`[PESAPAL] Successfully authenticated! Token received.`);
    return { token: data.token, baseUrl };
  } catch (err: any) {
    console.error(`[PESAPAL] Authentication failed or timed out:`, err.message);
    throw err;
  }
}

export const initiatePesapalPayment = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
  const {
    amount,
    baseAmount,
    baseCurrency,
    phone,
    type,
    referenceId,
    workspaceId,
    currency,
    reason,
    shortfall = 0,
    pageSlug,
  } = ctx.data;

  const depositId = crypto.randomUUID();

  // Get token
  const { token, baseUrl } = await getPesapalToken();

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
      { workspace_id: workspaceId, currency: currency || "RWF" },
    );
    walletId = createRes.insert_wallets_one?.id;
  }

  // Fees calculation
  const [feeRes, workspaceRes] = await Promise.all([
    hasuraRequest<any>(
      `query GetProviderFees {
        payment_provider_fees(where: { network: { _eq: "PESAPAL_CARD" } }, limit: 1) {
          collection_percentage
          collection_fixed_fee
        }
      }`
    ),
    hasuraRequest<any>(
      `query GetWorkspaceOrg($workspace_id: uuid!) {
        workspaces_by_pk(id: $workspace_id) { orgnizer_id }
      }`,
      { workspace_id: workspaceId },
    ),
  ]);

  const organizerId = workspaceRes.workspaces_by_pk?.orgnizer_id;
  const { getWorkspaceActivePlanFees } = await import("./billing");
  const plan = await getWorkspaceActivePlanFees({ data: { organizer_id: organizerId } } as any);

  const custCollectionPct = parseFloat(plan.customer_collection_fee_percentage as any) || 0;
  const custFixed = parseFloat(plan.customer_collection_fee_fixed as any) || 0;
  const custServicePct = parseFloat(plan.customer_service_fee_percentage as any) || 0;

  const orgCollectionPct = parseFloat(plan.organizer_collection_fee_percentage as any) || 0;
  const orgFixed = parseFloat(plan.organizer_collection_fee_fixed as any) || 0;

  const grossAmount = parseFloat(amount);
  const baseAmt = parseFloat(baseAmount || amount);
  const calculatedCustomerFee = baseAmt * (custCollectionPct / 100) + custFixed + baseAmt * (custServicePct / 100);
  let customerFee = Math.max(grossAmount - baseAmt, calculatedCustomerFee);

  const pf = feeRes.payment_provider_fees?.[0] || {};
  const providerPct = parseFloat(pf.collection_percentage) || 3.5;
  const providerFixed = parseFloat(pf.collection_fixed_fee) || 0;

  const providerCost = grossAmount * (providerPct / 100) + providerFixed;

  // Extra 1.5% for organizer on card payments
  let organizerFee = baseAmt * (orgCollectionPct / 100) + orgFixed + (baseAmt * 0.015);
  if (shortfall > 0) organizerFee += parseFloat(shortfall as any);

  let platformRevenue = customerFee + organizerFee;
  let netProfit = platformRevenue - providerCost;
  let organizerNetAmount = Math.max(0, baseAmt - organizerFee);

  if (type === "subscription") {
    customerFee = 0;
    organizerFee = 0;
    platformRevenue = grossAmount;
    netProfit = platformRevenue - providerCost;
    organizerNetAmount = 0;
  }

  // Register IPN URL if not registered (in a real app, this should be a one-time setup)
  const appHost = process.env.VITE_APP_URL || "https://agatike.com";
  const ipnUrl = `${appHost}/api/pesapal/webhook`;
  let ipnId = "mock-ipn-id";
  try {
    const ipnRes = await fetch(`${baseUrl}/api/URLSetup/RegisterIPN`, {
      signal: AbortSignal.timeout(10000),
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, Accept: "application/json" },
      body: JSON.stringify({ url: ipnUrl, ipn_notification_type: "GET" })
    });
    const ipnData = await ipnRes.json();
    if (ipnData.ipn_id) ipnId = ipnData.ipn_id;
  } catch (e) {
    console.warn("Failed to register IPN", e);
  }

  // Submit Order
  const payload = {
    id: depositId,
    currency: currency || "RWF",
    amount: grossAmount,
    description: (reason || `Agatike Payment`).substring(0, 50),
    callback_url: `${appHost}/api/pesapal/callback?reference_id=${referenceId}&type=${type}`,
    notification_id: ipnId,
    billing_address: {
      email_address: "guest@agatike.com", // Pesapal requires email or phone
      phone_number: phone || "0000000000",
      country_code: "RW",
      first_name: "Agatike",
      last_name: "User"
    }
  };

  let redirectUrl = "";
  let orderTrackingId = "";

  console.log(`[PESAPAL] Submitting payment order for amount: ${grossAmount} ${currency || "RWF"}...`);
  try {
    const orderRes = await fetch(`${baseUrl}/api/Transactions/SubmitOrderRequest`, {
      signal: AbortSignal.timeout(15000),
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, Accept: "application/json" },
      body: JSON.stringify(payload)
    });

    const orderData = await orderRes.json();
    if (orderData.status === "500" || orderData.error) {
      console.error(`[PESAPAL] Order Submission Error:`, orderData);
      throw new Error(`Payment Error: ${orderData.error?.message || orderData.message || JSON.stringify(orderData)}`);
    }

    redirectUrl = orderData.redirect_url;
    if (!redirectUrl) {
      console.error(`[PESAPAL] Missing redirect_url. Response:`, orderData);
      throw new Error(`Payment Error: Missing redirect_url in response. ${JSON.stringify(orderData)}`);
    }
    orderTrackingId = orderData.order_tracking_id;
    console.log(`[PESAPAL] Order submitted successfully! Redirect URL generated.`);

  } catch (err: any) {
    console.error(`[PESAPAL] Order Submission failed or timed out:`, err.message);
    throw err;
  }

  // Insert Transaction
  const txRes = await hasuraRequest<any>(
    `mutation CreatePesapalTx(
      $amount: String!, $net_amount: String!, $currency: String!,
      $provider_reference: String!, $reference_id: String!,
      $type: String!, $provider_status: String!, $status: String!,
      $wallet_id: uuid!, $workspace_id: uuid!,
      $gross: numeric!, $cost: numeric!, $rev: numeric!, $profit: numeric!,
      $cust_fee: numeric!, $org_fee: numeric!, $platform_fee: numeric!,
      $description: String!
    ) {
      insert_wallet_transactions_one(object: {
        amount: $amount, net_amount: $net_amount, currency: $currency,
        provider_reference: $provider_reference, reference_id: $reference_id,
        type: $type, provider_status: $provider_status, status: $status,
        wallet_id: $wallet_id, workspace_id: $workspace_id, description: $description,
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
      provider_reference: orderTrackingId, // using order tracking id for webhook matching
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
      description: pageSlug ? `Agatike::${pageSlug}` : "Agatike",
    },
  );

  const txId = txRes.insert_wallet_transactions_one.id;
  const earningsId = txRes.insert_earnings_one.id;
  await hasuraRequest(
    `mutation LinkEarnings($id: uuid!, $txId: uuid!) {
      update_earnings_by_pk(pk_columns: {id: $id}, _set: {wallet_transaction_id: $txId}) { id }
    }`,
    { id: earningsId, txId },
  );

  return { success: true, depositId, redirectUrl, orderTrackingId };
});
