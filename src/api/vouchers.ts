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
export const getEventVoucherTransactions = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const payload = (ctx.data as any).data || ctx.data;
    const { event_id } = payload as { event_id: string };
    const data = await hasuraRequest<{ voucher_transactions: any[] }>(GET_VOUCHER_TRANSACTIONS, {
      event_id,
    }).catch(() => ({ voucher_transactions: [] }));
    return data.voucher_transactions || [];
  },
);

const BATCH_GENERATE_VOUCHERS = `
  mutation CreateSponsoredBatch($object: sponsored_voucher_batches_insert_input!) {
    insert_sponsored_voucher_batches_one(object: $object) {
      id
      generation_type
      value_type
      vouchers {
        id
        qr_code_string
        current_balance
      }
    }
  }
`;

export const batchGenerateSponsoredVouchers = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const session = await getSession();
    if (!session || !session.sub) throw new Error("unauthenticated");

    const {
      event_id,
      workspace_id,
      batch_name,
      value_per_person,
      quantity,
      generation_type = "manual",
      linked_ticket_ids = [],
      value_type = "fixed",
    } = ctx.data as any;

    const batchInput: any = {
      event_id,
      workspace_id,
      organizer_id: session.sub,
      name: batch_name,
      value_per_voucher: String(value_per_person || 0),
      generation_type,
      linked_ticket_ids: linked_ticket_ids || [],
      value_type,
    };

    // Only pre-generate the actual voucher records if this is a manual batch
    if (generation_type === "manual" && quantity > 0) {
      batchInput.vouchers = {
        data: Array.from({ length: Number(quantity) }).map(() => ({
          qr_code_string: `VCH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          current_balance: String(value_per_person),
          is_active: true,
        })),
      };
    }

    return hasuraRequest(BATCH_GENERATE_VOUCHERS, { object: batchInput });
  },
);

const GET_SPONSORED_VOUCHERS = `
  query GetSponsoredVouchers($event_id: uuid!) {
    sponsored_voucher_batches(where: { event_id: { _eq: $event_id } }, order_by: { created_at: desc }) {
      id
      name
      value_per_voucher
      generation_type
      value_type
      linked_ticket_ids
      vouchers(order_by: { created_at: desc }) {
        id
        qr_code_string
        current_balance
        is_active
        created_at
        voucher_transactions_aggregate {
          aggregate {
            sum {
              amount
            }
          }
        }
      }
    }
  }
`;

export const getSponsoredVouchers = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { event_id } = ctx.data as unknown as { event_id: string };
  const data = await hasuraRequest<{ sponsored_voucher_batches: any[] }>(GET_SPONSORED_VOUCHERS, {
    event_id,
  });

  // Flatten the result into a list of vouchers with their batch attached
  const vouchers: any[] = [];
  if (data.sponsored_voucher_batches) {
    for (const batch of data.sponsored_voucher_batches) {
      if (batch.vouchers && batch.vouchers.length > 0) {
        for (const voucher of batch.vouchers) {
          vouchers.push({
            ...voucher,
            batch: {
              name: batch.name,
              value_per_voucher: batch.value_per_voucher,
              generation_type: batch.generation_type,
              value_type: batch.value_type,
              linked_ticket_ids: batch.linked_ticket_ids,
            },
          });
        }
      } else {
        // If it's a ticket-linked batch with no vouchers generated yet, we might want to show the batch itself
        // as a placeholder, or just skip it. For now, we skip showing empty batches in the individual voucher list.
      }
    }
  }

  // Sort flat list by created_at desc
  vouchers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return vouchers;
});

const GET_SPONSORED_VOUCHER_BATCHES = `
  query GetSponsoredVoucherBatches($event_id: uuid!) {
    sponsored_voucher_batches(where: { event_id: { _eq: $event_id } }, order_by: { created_at: desc }) {
      id
      name
      value_per_voucher
      generation_type
      value_type
      linked_ticket_ids
      vouchers {
        id
        current_balance
        is_active
        voucher_transactions_aggregate {
          aggregate {
            sum {
              amount
            }
          }
        }
      }
    }
  }
`;

export const getSponsoredVoucherBatches = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const payload = (ctx.data as any).data || ctx.data;
    const { event_id } = payload as { event_id: string };
    const data = await hasuraRequest<{ sponsored_voucher_batches: any[] }>(
      GET_SPONSORED_VOUCHER_BATCHES,
      { event_id },
    ).catch(() => ({ sponsored_voucher_batches: [] }));
    return data.sponsored_voucher_batches || [];
  },
);

const GET_WORKSPACE_SPONSORED_VOUCHER_BATCHES = `
  query GetWorkspaceSponsoredVoucherBatches($workspace_id: uuid!) {
    sponsored_voucher_batches(where: { workspace_id: { _eq: $workspace_id }, event_id: { _is_null: true } }, order_by: { created_at: desc }) {
      id
      name
      value_per_voucher
      generation_type
      value_type
      linked_ticket_ids
      vouchers {
        id
        current_balance
        is_active
        voucher_transactions_aggregate {
          aggregate {
            sum {
              amount
            }
          }
        }
      }
    }
  }
`;

export const getWorkspaceSponsoredVoucherBatches = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const payload = (ctx.data as any).data || ctx.data;
    const { workspace_id } = payload as { workspace_id: string };
    const data = await hasuraRequest<{ sponsored_voucher_batches: any[] }>(
      GET_WORKSPACE_SPONSORED_VOUCHER_BATCHES,
      { workspace_id },
    ).catch(() => ({ sponsored_voucher_batches: [] }));
    return data.sponsored_voucher_batches || [];
  },
);
