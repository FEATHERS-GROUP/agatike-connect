import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";

const CHARGE_VOUCHER = `
  mutation ChargeVoucher($product_order_id: uuid!, $vendor_id: uuid!, $amount: numeric!, $description: String!) {
    insert_voucher_transactions_one(object: {
      product_order_id: $product_order_id,
      vendor_id: $vendor_id,
      amount: $amount,
      description: $description
    }) {
      id
      amount
      created_at
    }
  }
`;

export const chargeVoucher = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const { product_order_id, vendor_id, amount, description } = ctx.data as any;
  
  // Here we would also typically decrement the current_balance on product_orders
  // and ensure they have enough balance. For now, we record the transaction.

  return hasuraRequest(CHARGE_VOUCHER, { product_order_id, vendor_id, amount, description });
});

const GET_VOUCHER_TRANSACTIONS = `
  query GetVoucherTransactions($event_id: uuid!) {
    voucher_transactions(where: { product_order: { event_id: { _eq: $event_id } } }, order_by: { created_at: desc }) {
      id
      amount
      description
      created_at
      vendor {
        id
        name
        vendor_unique_id
      }
      product_order {
        id
        qr_code_string
        buyer {
          id
          first_name
          last_name
        }
      }
    }
  }
`;

// Fetch all transactions for an event's vouchers
export const getEventVoucherTransactions = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { event_id } = ctx.data as unknown as { event_id: string };
  // Note: requires relationship setup between voucher_transactions -> product_orders -> events
  // For the sake of UI mocking if relations aren't fully nested, we'll return mock data or basic fetch
  const data = await hasuraRequest<{ voucher_transactions: any[] }>(GET_VOUCHER_TRANSACTIONS, { event_id }).catch(() => ({ voucher_transactions: [] }));
  return data.voucher_transactions || [];
});
