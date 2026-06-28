import { hasuraRequest } from "./graphql.server";

export type WalletState = "PENDING" | "PROCESSING" | "AVAILABLE" | "HELD" | "WITHDRAWN";

export interface LedgerEntry {
  transaction_group_id: string;
  entry_type: "debit" | "credit";
  account_type: "CUSTOMER_ACCOUNT" | "ORGANIZER_WALLET" | "AGATIKE_REVENUE" | "PAYMENT_PROVIDER" | "RESERVE_ACCOUNT" | "FEES_POOL";
  reference_id: string;
  amount: number;
  currency: string;
  wallet_state: WalletState;
  description: string;
}

const INSERT_LEDGER_ENTRIES = `
  mutation InsertLedgerEntries($objects: [ledger_transactions_insert_input!]!) {
    insert_ledger_transactions(objects: $objects) {
      affected_rows
    }
  }
`;

/**
 * Validates that debits equal credits before inserting into the ledger.
 */
export const recordDoubleEntryLedger = async (entries: LedgerEntry[]) => {
  let debits = 0;
  let credits = 0;

  for (const entry of entries) {
    if (entry.entry_type === "debit") {
      debits += entry.amount;
    } else {
      credits += entry.amount;
    }
  }

  // Tolerance of 1 to handle potential tiny floating point rounding issues
  if (Math.abs(debits - credits) > 1) {
    throw new Error(`CRITICAL: Ledger imbalance detected. Debits: ${debits}, Credits: ${credits}. Group ID: ${entries[0]?.transaction_group_id}`);
  }

  try {
    await hasuraRequest(INSERT_LEDGER_ENTRIES, {
      objects: entries,
    });
    return true;
  } catch (error) {
    console.error("Failed to write to ledger:", error);
    throw new Error("Failed to write double-entry ledger");
  }
};

/**
 * Standard checkout double-entry generator.
 */
export const generateCheckoutLedgerEntries = (params: {
  transactionGroupId: string;
  referenceId: string;
  currency: string;
  baseAmount: number;
  serviceFee: number;
  pawapayCost: number;
  organizerContribution: number;
}): LedgerEntry[] => {
  const {
    transactionGroupId,
    referenceId,
    currency,
    baseAmount,
    serviceFee,
    pawapayCost,
    organizerContribution,
  } = params;

  const totalCustomerCharge = baseAmount + serviceFee;
  const organizerNet = baseAmount - organizerContribution;
  const platformMargin = serviceFee + organizerContribution - pawapayCost;

  return [
    // 1. Customer Payment
    {
      transaction_group_id: transactionGroupId,
      entry_type: "debit",
      account_type: "CUSTOMER_ACCOUNT",
      reference_id: referenceId,
      amount: totalCustomerCharge,
      currency,
      wallet_state: "PROCESSING",
      description: "Customer payment initiated",
    },
    {
      transaction_group_id: transactionGroupId,
      entry_type: "credit",
      account_type: "FEES_POOL",
      reference_id: referenceId,
      amount: totalCustomerCharge,
      currency,
      wallet_state: "PROCESSING",
      description: "Customer funds received into temporary pool",
    },
    
    // 2. PawaPay Expense
    {
      transaction_group_id: transactionGroupId,
      entry_type: "debit",
      account_type: "FEES_POOL",
      reference_id: referenceId,
      amount: pawapayCost,
      currency,
      wallet_state: "PROCESSING",
      description: "PawaPay collection cost deduction",
    },
    {
      transaction_group_id: transactionGroupId,
      entry_type: "credit",
      account_type: "PAYMENT_PROVIDER",
      reference_id: referenceId,
      amount: pawapayCost,
      currency,
      wallet_state: "PROCESSING",
      description: "PawaPay payable cost",
    },

    // 3. Platform Margin Allocation
    {
      transaction_group_id: transactionGroupId,
      entry_type: "debit",
      account_type: "FEES_POOL",
      reference_id: referenceId,
      amount: platformMargin,
      currency,
      wallet_state: "PROCESSING",
      description: "Platform margin deduction from pool",
    },
    {
      transaction_group_id: transactionGroupId,
      entry_type: "credit",
      account_type: "AGATIKE_REVENUE",
      reference_id: referenceId,
      amount: platformMargin,
      currency,
      wallet_state: "AVAILABLE",
      description: "Agatike recognized dynamic profit",
    },

    // 4. Organizer Wallet Balance
    {
      transaction_group_id: transactionGroupId,
      entry_type: "debit",
      account_type: "FEES_POOL",
      reference_id: referenceId,
      amount: organizerNet,
      currency,
      wallet_state: "PROCESSING",
      description: "Organizer net allocation",
    },
    {
      transaction_group_id: transactionGroupId,
      entry_type: "credit",
      account_type: "ORGANIZER_WALLET",
      reference_id: referenceId,
      amount: organizerNet,
      currency,
      wallet_state: "PENDING", // Wait for PawaPay webhook to turn to AVAILABLE
      description: "Pending organizer balance",
    },
  ];
};
