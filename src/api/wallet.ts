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
  };
});

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
