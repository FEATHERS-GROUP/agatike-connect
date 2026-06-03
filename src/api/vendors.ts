import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";

const GET_EVENT_VENDORS = `
  query GetEventVendors($event_id: uuid!) {
    event_vendors(where: { event_id: { _eq: $event_id } }, order_by: { created_at: desc }) {
      id
      event_id
      vendor_unique_id
      name
      description
      contact_info
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
`;

export const getEventVendors = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { event_id } = ctx.data as unknown as { event_id: string };
  const data = await hasuraRequest<{ event_vendors: any[] }>(GET_EVENT_VENDORS, { event_id });
  return data.event_vendors.map((v) => ({
    ...v,
    total_revenue: v.voucher_transactions_aggregate?.aggregate?.sum?.amount || 0,
  }));
});

const CREATE_EVENT_VENDOR = `
  mutation CreateEventVendor($object: event_vendors_insert_input!) {
    insert_event_vendors_one(object: $object) {
      id
      vendor_unique_id
      name
    }
  }
`;

export const createEventVendor = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const vendorData = ctx.data as any;
  return hasuraRequest(CREATE_EVENT_VENDOR, { object: vendorData });
});

const UPDATE_EVENT_VENDOR = `
  mutation UpdateEventVendor($id: uuid!, $set: event_vendors_set_input!) {
    update_event_vendors_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
      vendor_unique_id
      name
    }
  }
`;

export const updateEventVendor = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const { id, ...setData } = ctx.data as any;
  return hasuraRequest(UPDATE_EVENT_VENDOR, { id, set: setData });
});

const DELETE_EVENT_VENDOR = `
  mutation DeleteEventVendor($id: uuid!) {
    delete_event_vendors_by_pk(id: $id) {
      id
    }
  }
`;

export const deleteEventVendor = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const { id } = ctx.data as unknown as { id: string };
  return hasuraRequest(DELETE_EVENT_VENDOR, { id });
});

const GET_VENDOR_TRANSACTIONS = `
  query GetVendorTransactions($vendor_id: uuid!) {
    voucher_transactions(where: { vendor_id: { _eq: $vendor_id } }, order_by: { created_at: desc }) {
      id
      amount
      description
      created_at
      voucher {
        qr_code_string
        batch {
          name
        }
      }
    }
  }
`;

export const getVendorTransactions = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { vendor_id } = ctx.data as unknown as { vendor_id: string };
  const data = await hasuraRequest<{ voucher_transactions: any[] }>(GET_VENDOR_TRANSACTIONS, {
    vendor_id,
  });
  return data.voucher_transactions || [];
});
