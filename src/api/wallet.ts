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
