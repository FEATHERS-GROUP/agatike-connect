import { createServerFn } from "@tanstack/react-start";
import { getAdminSession } from "./admin_auth";
import { hasuraRequest } from "./graphql.server";
import bcrypt from "bcryptjs";

export type AdminGroup = {
  id: string;
  name: string;
  permissions: string[];
  created_at: string;
};

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  is_super_admin: boolean;
  admin_group_id: string | null;
  group: AdminGroup | null;
  created_at: string;
};

// --- Groups ---

export const getAdminGroups = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getAdminSession();
  if (!session) throw new Error("unauthenticated");
  if (!session.is_super_admin) throw new Error("unauthorized");

  const query = `
    query GetAdminGroups {
      admin_groups(order_by: { created_at: asc }) {
        id
        name
        permissions
        created_at
      }
    }
  `;

  const res = await hasuraRequest<{ admin_groups: AdminGroup[] }>(query);
  return res.admin_groups || [];
});

export const createAdminGroup = createServerFn({ method: "POST" })
  .validator((d: { name: string; permissions: string[] }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");
    if (!session.is_super_admin) throw new Error("unauthorized");

    const query = `
      mutation CreateAdminGroup($name: String!, $permissions: jsonb!) {
        insert_admin_groups_one(object: { name: $name, permissions: $permissions }) {
          id
        }
      }
    `;

    await hasuraRequest(query, {
      name: ctx.data.name,
      permissions: ctx.data.permissions,
    });
    return { success: true };
  });

export const updateAdminGroup = createServerFn({ method: "POST" })
  .validator((d: { id: string; name: string; permissions: string[] }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");
    if (!session.is_super_admin) throw new Error("unauthorized");

    const query = `
      mutation UpdateAdminGroup($id: uuid!, $name: String!, $permissions: jsonb!) {
        update_admin_groups_by_pk(pk_columns: { id: $id }, _set: { name: $name, permissions: $permissions }) {
          id
        }
      }
    `;

    await hasuraRequest(query, {
      id: ctx.data.id,
      name: ctx.data.name,
      permissions: ctx.data.permissions,
    });
    return { success: true };
  });

export const deleteAdminGroup = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");
    if (!session.is_super_admin) throw new Error("unauthorized");

    const query = `
      mutation DeleteAdminGroup($id: uuid!) {
        delete_admin_groups_by_pk(id: $id) {
          id
        }
      }
    `;

    await hasuraRequest(query, { id: ctx.data.id });
    return { success: true };
  });

// --- Users ---

export const getAdminUsers = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getAdminSession();
  if (!session) throw new Error("unauthenticated");

  const query = `
    query GetAdminUsers {
      admin_users(order_by: { created_at: asc }) {
        id
        email
        name
        role
        is_super_admin
        admin_group_id
        group {
          id
          name
          permissions
        }
        created_at
      }
    }
  `;

  const res = await hasuraRequest<{ admin_users: AdminUser[] }>(query);
  return res.admin_users || [];
});

export const createAdminUser = createServerFn({ method: "POST" })
  .validator(
    (d: {
      email: string;
      password?: string;
      name?: string;
      admin_group_id: string | null;
      is_super_admin: boolean;
    }) => d,
  )
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");
    if (!session.is_super_admin) throw new Error("unauthorized");

    const { email, password, name, admin_group_id, is_super_admin } = ctx.data;

    let hash = "invalid_hash";
    if (password) {
      hash = await bcrypt.hash(password, 10);
    }

    const query = `
      mutation CreateAdminUser($email: String!, $password: String!, $name: String, $admin_group_id: uuid, $is_super_admin: Boolean!) {
        insert_admin_users_one(object: { 
          email: $email, 
          password: $password, 
          name: $name, 
          admin_group_id: $admin_group_id,
          is_super_admin: $is_super_admin 
        }) {
          id
        }
      }
    `;

    await hasuraRequest(query, { email, password: hash, name, admin_group_id, is_super_admin });
    return { success: true };
  });

export const updateAdminUser = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id: string;
      email: string;
      name?: string;
      admin_group_id: string | null;
      is_super_admin: boolean;
    }) => d,
  )
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");
    if (!session.is_super_admin) throw new Error("unauthorized");

    const query = `
      mutation UpdateAdminUser($id: uuid!, $email: String!, $name: String, $admin_group_id: uuid, $is_super_admin: Boolean!) {
        update_admin_users_by_pk(pk_columns: { id: $id }, _set: { 
          email: $email,
          name: $name,
          admin_group_id: $admin_group_id,
          is_super_admin: $is_super_admin
        }) {
          id
        }
      }
    `;

    await hasuraRequest(query, ctx.data);
    return { success: true };
  });

export const deleteAdminUser = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async (ctx) => {
    const session = await getAdminSession();
    if (!session) throw new Error("unauthenticated");
    if (!session.is_super_admin) throw new Error("unauthorized");

    const query = `
      mutation DeleteAdminUser($id: uuid!) {
        delete_admin_users_by_pk(id: $id) {
          id
        }
      }
    `;

    await hasuraRequest(query, { id: ctx.data.id });
    return { success: true };
  });
