import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";

// ── Workspace-level procurement invoices ────────────────────────────────────

const GET_PROCUREMENT_INVOICES = `
  query GetProcurementInvoices($workspace_id: uuid!) {
    agatike_book_invoices(
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
      logo_url
      signature_url
      stamp_url
      metadata
      folder_id
      created_at
      items(order_by: { created_at: asc }) {
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
  const data = await hasuraRequest<{ agatike_book_invoices: any[] }>(GET_PROCUREMENT_INVOICES, {
    workspace_id,
  });
  return data.agatike_book_invoices || [];
});

const CREATE_PROCUREMENT_INVOICE = `
  mutation CreateProcurementInvoice($object: agatike_book_invoices_insert_input!) {
    insert_agatike_book_invoices_one(object: $object) {
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
  mutation UpdateProcurementInvoice($id: uuid!, $set: agatike_book_invoices_set_input!) {
    update_agatike_book_invoices_by_pk(pk_columns: { id: $id }, _set: $set) {
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
    delete_agatike_book_invoices_by_pk(id: $id) { id }
  }
`;

export const deleteProcurementInvoice = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session?.sub) throw new Error("unauthenticated");
  const { id } = ctx.data as unknown as { id: string };
  return hasuraRequest(DELETE_PROCUREMENT_INVOICE, { id });
});

// ── Folders ───────────────────────────────────────────────────────────────

const GET_PROCUREMENT_FOLDERS = `
  query GetProcurementFolders($workspace_id: uuid!) {
    agatike_book_folders(
      where: { workspace_id: { _eq: $workspace_id } }
      order_by: { created_at: desc }
    ) {
      id
      name
      created_at
    }
  }
`;

export const getProcurementFolders = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { workspace_id } = ctx.data as unknown as { workspace_id: string };
  const data = await hasuraRequest<{ agatike_book_folders: any[] }>(GET_PROCUREMENT_FOLDERS, { workspace_id });
  return data.agatike_book_folders || [];
});

const CREATE_PROCUREMENT_FOLDER = `
  mutation CreateProcurementFolder($object: agatike_book_folders_insert_input!) {
    insert_agatike_book_folders_one(object: $object) {
      id
      name
    }
  }
`;

export const createProcurementFolder = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session?.sub) throw new Error("unauthenticated");
  return hasuraRequest(CREATE_PROCUREMENT_FOLDER, { object: ctx.data });
});

const DELETE_PROCUREMENT_FOLDER = `
  mutation DeleteProcurementFolder($id: uuid!) {
    delete_agatike_book_folders_by_pk(id: $id) { id }
  }
`;

export const deleteProcurementFolder = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session?.sub) throw new Error("unauthenticated");
  const { id } = ctx.data as unknown as { id: string };
  return hasuraRequest(DELETE_PROCUREMENT_FOLDER, { id });
});

const GET_PROCUREMENT_INVOICE_BY_ID = `
  query GetProcurementInvoiceById($id: uuid!) {
    agatike_book_invoices_by_pk(id: $id) {
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
      logo_url
      signature_url
      stamp_url
      metadata
      folder_id
      created_at
      items(order_by: { created_at: asc }) {
        id
        description
        quantity
        unit_price
      }
    }
  }
`;

export const getProcurementInvoiceById = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id } = ctx.data as unknown as { id: string };
  const data = await hasuraRequest<{ agatike_book_invoices_by_pk: any }>(GET_PROCUREMENT_INVOICE_BY_ID, { id });
  return data.agatike_book_invoices_by_pk;
});
