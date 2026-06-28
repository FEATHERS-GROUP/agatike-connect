import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super_secret_key_12345");

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

export const sendWithdrawalOtp = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { organizer_id } = ctx.data as unknown as { organizer_id: string };

  const query = `
    query GetOrganizer($id: uuid!) {
      organizers_by_pk(id: $id) {
        email
      }
    }
  `;
  const result = await hasuraRequest<{ organizers_by_pk: { email: string } }>(query, {
    id: organizer_id,
  });
  const email = result.organizers_by_pk?.email;

  if (!email) {
    throw new Error("Organizer not found");
  }

  // Generate 8-character alphanumeric OTP
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let otp = "";
  for (let i = 0; i < 8; i++) {
    otp += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const hashedOtp = await bcrypt.hash(otp, 10);

  const token = await new SignJWT({ email, otp: hashedOtp, type: "withdrawal_otp" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("10m")
    .sign(SECRET);

  const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #F2571D; padding: 40px 24px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Withdrawal Security Code</h2>
      </div>
      <div style="padding: 40px 32px; color: #333333; font-size: 16px; line-height: 1.6; text-align: center;">
        <p>A withdrawal request has been initiated for your Agatike Connect account. Please use the following One-Time Password (OTP) to authorize this payout:</p>
        <div style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #F2571D; padding: 24px; background: #fff5f2; border-radius: 12px; display: inline-block; margin: 24px 0;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #666;">This code is valid for 10 minutes. If you did not request this, please change your password immediately.</p>
      </div>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Agatike Connect <hello@agatike.rw>",
      to: [email],
      subject: `Withdrawal OTP: ${otp}`,
      html: html,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to send OTP via email");
  }

  return { success: true, token };
});

export const getExchangeRate = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { base_currency, target_currency } = ctx.data as unknown as {
    base_currency: string;
    target_currency: string;
  };
  if (base_currency === target_currency) return 1;

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base_currency}`);
    const data = await res.json();
    if (data.result === "success") {
      return data.rates[target_currency] || null;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch exchange rate", error);
    return null;
  }
});

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
    otpToken,
    otp,
    password,
    target_currency,
    exchange_rate,
    converted_amount,
    converted_net_payout,
  } = ctx.data as any;

  if (!otpToken || !otp || !password) {
    throw new Error("Missing security verification details.");
  }

  // 1. Verify OTP JWT
  try {
    const { payload } = await jwtVerify(otpToken, SECRET);
    if (payload.type !== "withdrawal_otp") throw new Error("Invalid token type");

    const otpHash = payload.otp as string;
    const isOtpValid = await bcrypt.compare(otp, otpHash);
    if (!isOtpValid) throw new Error("Invalid or expired OTP");
  } catch (err: any) {
    throw new Error("Invalid or expired OTP");
  }

  // 2. Verify Password
  const orgQuery = `query GetOrg { organizers_by_pk(id: "${organizer_id}") { password } }`;
  const orgRes = await hasuraRequest<{ organizers_by_pk: { password: string } }>(orgQuery);
  const orgData = orgRes.organizers_by_pk;
  if (!orgData) throw new Error("Organizer not found");

  const isPasswordValid = await bcrypt.compare(password, orgData.password);
  if (!isPasswordValid) throw new Error("Incorrect password");

  // 3. Get Wallet Balance
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

  const maxWeeklyLimitStr =
    subRes.subscriptions?.[0]?.pricing_plan?.max_withdrawals_per_week || "1";
  const maxWeeklyLimit = isNaN(parseInt(maxWeeklyLimitStr, 10))
    ? 1
    : parseInt(maxWeeklyLimitStr, 10);

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
  const txRes = await hasuraRequest<{
    wallet_transactions_aggregate: { aggregate: { count: number } };
  }>(txQuery, {
    workspace_id,
    seven_days_ago: sevenDaysAgo.toISOString(),
  });

  const weeklyCount = txRes.wallet_transactions_aggregate?.aggregate?.count || 0;
  if (weeklyCount >= maxWeeklyLimit) {
    throw new Error(
      `You have reached your limit of ${maxWeeklyLimit} withdrawal(s) per week for your current plan.`,
    );
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
    description: `Withdrawal to ${payout_method} (${payout_account}) | Base: ${amount} ${currency} | Fee: ${totalFee.toFixed(2)} ${currency}`,
    status: "pending",
    type: "withdrawal",
    raw_callback_data: {
      network_id,
      country_code,
      payout_method,
      amount,
      netAmount,
      totalFee,
      target_currency,
      exchange_rate,
      converted_amount,
      converted_net_payout,
    },
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

export const getPendingWithdrawals = createServerFn({ method: "GET" }).handler(async () => {
  const query = `
    query GetPendingWithdrawals {
      wallet_transactions(
        where: { type: { _eq: "withdrawal" }, status: { _eq: "pending" } }
        order_by: { created_at: desc }
      ) {
        id
        created_at
        amount
        net_amount
        currency
        status
        payout_method
        payout_account
        raw_callback_data
        workspace {
          name
        }
      }
    }
  `;
  const res = await hasuraRequest<{ wallet_transactions: any[] }>(query);
  return res.wallet_transactions || [];
});
