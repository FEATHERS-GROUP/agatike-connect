import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";

// ── Workspace-level procurement invoices ────────────────────────────────────
// Separate from the space subscription invoices in invoices.ts

const GET_PROCUREMENT_INVOICES = `
  query GetProcurementInvoices($workspace_id: String!) {
    workspace_invoices(
      where: { workspace_id: { _eq: $workspace_id } }
      order_by: { created_at: desc }
    ) {
      id
      invoice_number
      invoice_type
      client_name
      client_email
      client_company
      client_address
      issue_date
      due_date
      tax_rate
      notes
      payment_terms
      status
      currency
      created_at
      items: workspace_invoice_items(order_by: { created_at: asc }) {
        id
        description
        quantity
        unit_price
      }
    }
  }
`;

export const getProcurementInvoices = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { workspace_id } = ctx.data as unknown as { workspace_id: string };
  const data = await hasuraRequest<{ workspace_invoices: any[] }>(GET_PROCUREMENT_INVOICES, {
    workspace_id,
  });
  return data.workspace_invoices || [];
});

const CREATE_PROCUREMENT_INVOICE = `
  mutation CreateProcurementInvoice($object: workspace_invoices_insert_input!) {
    insert_workspace_invoices_one(object: $object) {
      id
      invoice_number
      status
    }
  }
`;

export const createProcurementInvoice = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session?.sub) throw new Error("unauthenticated");
  return hasuraRequest(CREATE_PROCUREMENT_INVOICE, { object: ctx.data });
});

const UPDATE_PROCUREMENT_INVOICE = `
  mutation UpdateProcurementInvoice($id: uuid!, $set: workspace_invoices_set_input!) {
    update_workspace_invoices_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
      status
    }
  }
`;

export const updateProcurementInvoice = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session?.sub) throw new Error("unauthenticated");
  const { id, ...set } = ctx.data as any;
  return hasuraRequest(UPDATE_PROCUREMENT_INVOICE, { id, set });
});

const DELETE_PROCUREMENT_INVOICE = `
  mutation DeleteProcurementInvoice($id: uuid!) {
    delete_workspace_invoices_by_pk(id: $id) { id }
  }
`;

export const deleteProcurementInvoice = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session?.sub) throw new Error("unauthenticated");
  const { id } = ctx.data as unknown as { id: string };
  return hasuraRequest(DELETE_PROCUREMENT_INVOICE, { id });
});
