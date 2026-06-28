import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

const GET_WORKSPACE_WALLET = `
  query GetWorkspaceWallet($workspace_id: uuid!) {
    wallets(where: { workspace_id: { _eq: $workspace_id } }) {
      amount
      created_at
      currency
      deleted
      id
      updated_at
      walletNumber
      workspace_id
      supported_networks
    }
  }
`;

export const getWorkspaceWallet = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { workspace_id } = ctx.data as unknown as { workspace_id: string };
  const data = await hasuraRequest<{ wallets: any[] }>(GET_WORKSPACE_WALLET, { workspace_id });

  // Return the first wallet found or a default empty wallet
  if (data.wallets && data.wallets.length > 0) {
    return data.wallets[0];
  }

  return {
    amount: 0,
    currency: "RWF",
    walletNumber: "Not setup",
    supported_networks: [],
  };
});

const UPDATE_WALLET_NETWORKS = `
  mutation UpdateWalletNetworks($id: uuid!, $networks: jsonb!) {
    update_wallets_by_pk(pk_columns: { id: $id }, _set: { supported_networks: $networks }) {
      id
      supported_networks
    }
  }
`;

export const updateWalletSupportedNetworks = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const { id, networks } = ctx.data as unknown as { id: string; networks: string[] };
    const data = await hasuraRequest<{ update_wallets_by_pk: any }>(UPDATE_WALLET_NETWORKS, {
      id,
      networks,
    });
    return data.update_wallets_by_pk;
  },
);

const GET_WALLET_TRANSACTIONS = `
  query GetWalletTransactions($wallet_id: uuid!) {
    wallet_transactions(where: { wallet_id: { _eq: $wallet_id } }, order_by: { created_at: desc }) {
      amount
      created_at
      id
      net_amount
      provider_reference
      provider_status
      status
      type
      updated_at
      wallet_id
      description
      currency
      payout_account
      payout_method
      reference_id
      workspace_id
    }
  }
`;

export const getWalletTransactions = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { wallet_id } = ctx.data as unknown as { wallet_id: string };
  const data = await hasuraRequest<{ wallet_transactions: any[] }>(GET_WALLET_TRANSACTIONS, {
    wallet_id,
  });

  return data.wallet_transactions || [];
});

const ADD_MONEY_TO_WORKSPACE_WALLET = `
  mutation AddMoneyToWorkspaceWallet($workspace_id: uuid!, $amount: numeric!, $updated_at: timestamptz!) {
    update_wallets(
      where: { workspace_id: { _eq: $workspace_id } }, 
      _inc: { amount: $amount },
      _set: { updated_at: $updated_at }
    ) {
      returning {
        id
        amount
      }
    }
  }
`;

export const addMoneyToWorkspaceWallet = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { workspace_id, amount } = ctx.data as any;
  const data = await hasuraRequest<{ update_wallets: { returning: any[] } }>(
    ADD_MONEY_TO_WORKSPACE_WALLET,
    {
      workspace_id,
      amount,
      updated_at: new Date().toISOString(),
    },
  );

  return data.update_wallets?.returning?.[0] || null;
});

const REQUEST_WITHDRAWAL_MUTATION = `
  mutation RequestWithdrawal(
    $wallet_id: uuid!
    $workspace_id: uuid!
    $amount: numeric!
    $deduct_amount: numeric!
    $net_amount: numeric!
    $currency: String!
    $payout_method: String!
    $payout_account: String!
    $description: String!
    $status: String!
    $type: String!
    $raw_callback_data: jsonb
    $updated_at: timestamptz!
  ) {
    update_wallets(
      where: { id: { _eq: $wallet_id }, amount: { _gte: $amount } }
      _inc: { amount: $deduct_amount }
      _set: { updated_at: $updated_at }
    ) {
      affected_rows
      returning {
        id
        amount
      }
    }
    insert_wallet_transactions_one(object: {
      wallet_id: $wallet_id
      workspace_id: $workspace_id
      amount: $amount
      net_amount: $net_amount
      currency: $currency
      payout_method: $payout_method
      payout_account: $payout_account
      description: $description
      status: $status
      type: $type
      raw_callback_data: $raw_callback_data
    }) {
      id
    }
  }
`;

export const requestWithdrawal = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const {
    wallet_id,
    workspace_id,
    organizer_id,
    amount,
    payout_method,
    payout_account,
    currency,
    network_id,
    country_code,
  } = ctx.data as any;

  // 1. Get Wallet Balance
  const walletQuery = `query GetWallet { wallets_by_pk(id: "${wallet_id}") { amount } }`;
  const walletRes = await hasuraRequest<{ wallets_by_pk: { amount: number } }>(walletQuery);
  if (!walletRes.wallets_by_pk || walletRes.wallets_by_pk.amount < amount) {
    throw new Error("Insufficient wallet balance.");
  }

  // 2. Get Platform Fee from Subscription
  const subQuery = `
    query GetActiveSub {
      subscriptions(
        where: { organizer_id: { _eq: "${organizer_id}" }, status: { _eq: "active" } }
        order_by: { created_at: desc }
        limit: 1
      ) {
        pricing_plan {
          organizer_platform_contribution
          max_withdrawals_per_week
        }
      }
    }
  `;
  const subRes = await hasuraRequest<{ subscriptions: any[] }>(subQuery);
  const platformPercentage =
    subRes.subscriptions?.[0]?.pricing_plan?.organizer_platform_contribution || 3.0; // fallback 3%

  const maxWeeklyLimitStr = subRes.subscriptions?.[0]?.pricing_plan?.max_withdrawals_per_week || "1";
  const maxWeeklyLimit = isNaN(parseInt(maxWeeklyLimitStr, 10)) ? 1 : parseInt(maxWeeklyLimitStr, 10);

  // 2.5 Check Withdrawal Limits
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const txQuery = `
    query GetWeeklyWithdrawals($workspace_id: uuid!, $seven_days_ago: timestamptz!) {
      wallet_transactions_aggregate(
        where: {
          workspace_id: { _eq: $workspace_id },
          type: { _eq: "withdrawal" },
          status: { _in: ["pending", "completed"] },
          created_at: { _gte: $seven_days_ago }
        }
      ) {
        aggregate {
          count
        }
      }
    }
  `;
  const txRes = await hasuraRequest<{ wallet_transactions_aggregate: { aggregate: { count: number } } }>(txQuery, {
    workspace_id,
    seven_days_ago: sevenDaysAgo.toISOString(),
  });
  
  const weeklyCount = txRes.wallet_transactions_aggregate?.aggregate?.count || 0;
  if (weeklyCount >= maxWeeklyLimit) {
    throw new Error(`You have reached your limit of ${maxWeeklyLimit} withdrawal(s) per week for your current plan.`);
  }

  // 3. Get Network Disbursement Fee
  let netPercentage = 0;
  let netFixed = 0;
  if (payout_method === "momo" && network_id) {
    const feeQuery = `
      query GetProviderFees {
        payment_provider_fees(where: {
          _and: [
            { network: { _eq: "${network_id}" } },
            { country_code: { _eq: "${country_code || "RWA"}" } }
          ]
        }, limit: 1) {
          disbursement_percentage
          disbursement_fixed_fee
          is_tiered
          tiered_rules
        }
      }
    `;
    const feeRes = await hasuraRequest<{ payment_provider_fees: any[] }>(feeQuery);
    const fees = feeRes.payment_provider_fees?.[0];
    if (fees) {
      if (fees.is_tiered && fees.tiered_rules) {
        let rules = fees.tiered_rules;
        try {
          if (typeof rules === "string") rules = JSON.parse(rules);
          if (typeof rules === "string") rules = JSON.parse(rules);
        } catch (e) {
          console.error("Failed to parse tiered rules backend", e);
        }

        if (rules && rules.disbursement && Array.isArray(rules.disbursement)) {
          const matchedRule =
            rules.disbursement.find((r: any) => amount <= r.max) ||
            rules.disbursement[rules.disbursement.length - 1];
          if (matchedRule) {
            netPercentage = matchedRule.pct || 0;
            netFixed = matchedRule.fixed || 0;
          }
        }
      } else {
        netPercentage = fees.disbursement_percentage || 0;
        netFixed = fees.disbursement_fixed_fee || 0;
      }
    }
  }

  // 4. Calculate Total Fee and Net Payout
  const agatikeFee = amount * (platformPercentage / 100);
  const networkFee = amount * (netPercentage / 100) + netFixed;
  const totalFee = agatikeFee + networkFee;
  const netAmount = amount - totalFee;

  if (netAmount <= 0) {
    throw new Error("Withdrawal amount is too low to cover the processing fees.");
  }

  // 5. Execute Transaction
  const data = await hasuraRequest<any>(REQUEST_WITHDRAWAL_MUTATION, {
    wallet_id,
    workspace_id,
    amount,
    deduct_amount: -amount,
    net_amount: netAmount,
    currency,
    payout_method,
    payout_account,
    description: `Withdrawal to ${payout_method} (${payout_account}) | Base: ${amount} | Fee: ${totalFee.toFixed(2)}`,
    status: "pending",
    type: "withdrawal",
    raw_callback_data: { network_id, country_code, payout_method, amount, netAmount, totalFee },
    updated_at: new Date().toISOString(),
  });

  if (data.update_wallets.affected_rows === 0) {
    throw new Error("Failed to deduct from wallet. Please try again.");
  }

  return {
    success: true,
    transactionId: data.insert_wallet_transactions_one.id,
    netAmount,
    agatikeFee,
    networkFee,
  };
});
