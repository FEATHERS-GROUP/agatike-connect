import { createServerFn } from "@tanstack/react-start";
import { getAdminSession } from "./admin_auth";
import { hasuraRequest } from "./graphql.server";

export type Lead = {
  id: string;
  organizer_id: string;
  plan_id: string | null;
  name: string;
  email: string;
  company: string | null;
  communication_method: string | null;
  language: string | null;
  country: string | null;
  phone: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const getAdminLeads = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getAdminSession();
  if (!session) throw new Error("unauthenticated");

  const query = `
    query GetAdminLeads {
      leads(order_by: { created_at: desc }) {
        id
        organizer_id
        plan_id
        name
        email
        company
        communication_method
        language
        country
        phone
        message
        status
        notes
        created_at
        updated_at
      }
    }
  `;

  const res = await hasuraRequest<{ leads: Lead[] }>(query);
  return res.leads || [];
});

export const updateAdminLeadStatus = createServerFn({ method: "POST" })
  .validator((d: { id: string; status: string; notes?: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");

    const query = `
      mutation UpdateLeadStatus($id: uuid!, $status: String!, $notes: String) {
        update_leads_by_pk(pk_columns: { id: $id }, _set: { status: $status, notes: $notes }) {
          id
        }
      }
    `;

    await hasuraRequest(query, ctx.data);
    return { success: true };
  });

export const deleteAdminLead = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");
    // Optionally restrict deletion to super_admin
    // if (!session.is_super_admin) throw new Error("unauthorized");

    const query = `
      mutation DeleteLead($id: uuid!) {
        delete_leads_by_pk(id: $id) {
          id
        }
      }
    `;

    await hasuraRequest(query, ctx.data);
    return { success: true };
  });
