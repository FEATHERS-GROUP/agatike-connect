import { createServerFn } from "@tanstack/react-start";
import { getSession } from "./auth";
import { hasuraRequest } from "./graphql.server";

export type VipFieldType = "text" | "number" | "boolean";

export interface VipField {
  id: string;
  name: string;
  type: VipFieldType;
  required?: boolean;
}

export interface VipPrivilege {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  icon: string;
  fields: VipField[];
  created_at: string;
  updated_at: string;
}

export const getWorkspaceVipPrivileges = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const query = `
      query GetWorkspaceVipPrivileges($workspace_id: uuid!) {
        vip_privileges(
          where: { workspace_id: { _eq: $workspace_id } }
          order_by: { created_at: desc }
        ) {
          id
          workspace_id
          name
          description
          icon
          fields
          created_at
          updated_at
        }
      }
    `;

  const data = await hasuraRequest<{ vip_privileges: VipPrivilege[] }>(query, {
    workspace_id: ctx.data?.workspace_id,
  });
  return data.vip_privileges || [];
});

export const createVipPrivilege = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const mutation = `
      mutation CreateVipPrivilege(
        $workspace_id: uuid!
        $name: String!
        $description: String
        $icon: String
        $fields: jsonb!
      ) {
        insert_vip_privileges_one(
          object: {
            workspace_id: $workspace_id
            name: $name
            description: $description
            icon: $icon
            fields: $fields
          }
        ) {
          id
        }
      }
    `;

  const data = await hasuraRequest<{ insert_vip_privileges_one: { id: string } }>(
    mutation,
    ctx.data,
  );
  return data.insert_vip_privileges_one;
});

export const updateVipPrivilege = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const mutation = `
      mutation UpdateVipPrivilege(
        $id: uuid!
        $name: String!
        $description: String
        $icon: String
        $fields: jsonb!
      ) {
        update_vip_privileges_by_pk(
          pk_columns: { id: $id }
          _set: { name: $name, description: $description, icon: $icon, fields: $fields }
        ) {
          id
        }
      }
    `;

  const data = await hasuraRequest<{ update_vip_privileges_by_pk: { id: string } }>(
    mutation,
    ctx.data,
  );
  return data.update_vip_privileges_by_pk;
});

export const deleteVipPrivilege = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const mutation = `
      mutation DeleteVipPrivilege($id: uuid!) {
        delete_vip_privileges_by_pk(id: $id) {
          id
        }
      }
    `;

  const data = await hasuraRequest<{ delete_vip_privileges_by_pk: { id: string } }>(mutation, {
    id: ctx.data.id,
  });
  return data.delete_vip_privileges_by_pk;
});

export const getVipTicketsUsage = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const query = `
      query GetVipTicketsUsage($workspace_id: uuid!) {
        event_tickets(where: {
          event: { workspace_id: { _eq: $workspace_id } }
        }) {
          id
          type
          cost
          vip_privilege_ids
          event {
            id
            title
            cover
          }
        }
      }
    `;

  const data = await hasuraRequest<{ event_tickets: any[] }>(query, {
    workspace_id: ctx.data?.workspace_id,
  });

  // Filter out tickets that do not have any vip privileges
  return (data.event_tickets || []).filter(
    (t) => Array.isArray(t.vip_privilege_ids) && t.vip_privilege_ids.length > 0,
  );
});
