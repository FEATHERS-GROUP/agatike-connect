import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { hasuraRequest } from "./graphql.server";
import { sendWorkspaceUserInviteEmail } from "./email";
import { getSession } from "./auth";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super_secret_key_12345");

export const getWorkspaceUsers = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  let query = "";
  let variables: any = {};

  if (session.type === "organizer") {
    query = `
      query GetOrgUsers($organizer_id: uuid!) {
        workspace_users(where: { organizer_id: { _eq: $organizer_id } }, order_by: { created_at: desc }) {
          id
          name
          email
          status
          role
          workspaces
          modules
          pages
          is_temporary
          expires_at
          created_at
          image
        }
      }
    `;
    variables = { organizer_id: session.sub };
    const data = await hasuraRequest<{ workspace_users: any[] }>(query, variables);
    return data.workspace_users.map((u) => {
      if (u.is_temporary && u.expires_at && new Date(u.expires_at).getTime() < Date.now()) {
        return { ...u, status: "expired" };
      }
      return u;
    });
  } else if (session.type === "workspace_user") {
    // 1. Fetch current workspace_user to see their scope
    const meQuery = `
      query GetMe($id: uuid!) {
        workspace_users_by_pk(id: $id) {
          organizer_id
          workspaces
          modules
        }
      }
    `;
    const meData = await hasuraRequest<{ workspace_users_by_pk: any }>(meQuery, {
      id: session.sub,
    });
    const me = meData.workspace_users_by_pk;

    if (!me) throw new Error("User not found");

    // Check if they have access to the Users module
    const modules = me.modules || [];
    const hasUsersModule =
      modules.includes("users") || modules.includes("Users") || modules.includes("ALL");
    if (!hasUsersModule) {
      return []; // Return empty if no permission to view users
    }

    // 2. Fetch users in the same workspaces
    query = `
      query GetScopedUsers($organizer_id: uuid!) {
        workspace_users(where: { organizer_id: { _eq: $organizer_id } }, order_by: { created_at: desc }) {
          id
          name
          email
          status
          role
          workspaces
          modules
          pages
          is_temporary
          expires_at
          created_at
          image
        }
      }
    `;
    variables = { organizer_id: me.organizer_id };

    const data = await hasuraRequest<{ workspace_users: any[] }>(query, variables);
    let allOrgUsers = data.workspace_users;

    if (me.workspaces && !me.workspaces.includes("ALL")) {
      allOrgUsers = allOrgUsers.filter((u) => {
        if (!u.workspaces) return false;
        if (u.workspaces.includes("ALL")) return true;
        return u.workspaces.some((ws: string) => me.workspaces.includes(ws));
      });
    }

    return allOrgUsers.map((u) => {
      if (u.is_temporary && u.expires_at && new Date(u.expires_at).getTime() < Date.now()) {
        return { ...u, status: "expired" };
      }
      return u;
    });
  } else {
    throw new Error("Invalid session type");
  }
});

export const addWorkspaceUser = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub || session.type !== "organizer") {
    throw new Error("unauthenticated or unauthorized");
  }

  const input = ctx.data as any;
  const hashedPassword = await bcrypt.hash(input.password, 10);

  const mutation = `
    mutation CreateWorkspaceUser(
      $organizer_id: uuid!,
      $name: String!,
      $email: String!,
      $password: String!,
      $workspaces: jsonb!,
      $role: String!,
      $modules: jsonb!,
      $pages: jsonb!,
      $is_temporary: Boolean!,
      $expires_at: timestamptz,
      $image: String
    ) {
      insert_workspace_users_one(object: {
        organizer_id: $organizer_id,
        name: $name,
        email: $email,
        password: $password,
        status: "pending",
        workspaces: $workspaces,
        role: $role,
        modules: $modules,
        pages: $pages,
        is_temporary: $is_temporary,
        expires_at: $expires_at,
        image: $image
      }) {
        id
      }
    }
  `;

  const variables = {
    organizer_id: session.sub,
    name: input.name,
    email: input.email,
    password: hashedPassword,
    workspaces: input.workspaces || ["ALL"],
    role: input.role || "user",
    modules: input.modules || [],
    pages: input.pages || [],
    is_temporary: input.is_temporary || false,
    expires_at: input.expires_at || null,
    image: input.image || null,
  };

  const data = await hasuraRequest<{ insert_workspace_users_one: { id: string } }>(
    mutation,
    variables,
  );

  // Get organizer name
  const orgQuery = `query GetOrg { organizers_by_pk(id: "${session.sub}") { name } }`;
  let orgName = "an organizer";
  try {
    const orgRes = await hasuraRequest<{ organizers_by_pk: { name: string } }>(orgQuery, {});
    if (orgRes.organizers_by_pk) orgName = orgRes.organizers_by_pk.name;
  } catch (e) {}

  console.log(`Sending invite email to ${input.email} with initial password...`);
  try {
    await sendWorkspaceUserInviteEmail({
      data: {
        to: input.email,
        userName: input.name,
        initialPassword: input.password,
        organizerName: orgName,
      },
    } as any);
  } catch (err) {
    console.error("Failed to send invite email:", err);
  }

  return data.insert_workspace_users_one;
});

export const activateWorkspaceUser = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const input = ctx.data as any;

  const query = `
    query FindUser($email: String!) {
      workspace_users(where: { email: { _ilike: $email } }) {
        id
        password
        status
      }
    }
  `;

  const result = await hasuraRequest<{ workspace_users: any[] }>(query, { email: input.email });
  const user = result.workspace_users[0];

  if (!user) throw new Error("Invalid email or initial password");
  if (user.status === "active") throw new Error("Account is already active");

  const isValid = await bcrypt.compare(input.initialPassword, user.password);
  if (!isValid) throw new Error("Invalid email or initial password");

  const newHashedPassword = await bcrypt.hash(input.newPassword, 10);

  const mutation = `
    mutation ActivateUser($id: uuid!, $password: String!) {
      update_workspace_users_by_pk(pk_columns: {id: $id}, _set: {password: $password, status: "active"}) {
        id
      }
    }
  `;

  await hasuraRequest(mutation, { id: user.id, password: newHashedPassword });

  // Log them in immediately
  const token = await new SignJWT({ sub: user.id, type: "workspace_user" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);

  setCookie("agatike_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true };
});

export const loginWorkspaceUser = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { email, password } = ctx.data as any;

  const query = `
    query GetWorkspaceUser($email: String!) {
      workspace_users(where: { email: { _ilike: $email } }) {
        id
        password
        status
        is_temporary
        expires_at
      }
    }
  `;

  const result = await hasuraRequest<{ workspace_users: any[] }>(query, { email });
  const user = result.workspace_users[0];

  if (!user) throw new Error("Invalid email or password");
  if (user.status === "disabled" || user.status === "deleted")
    throw new Error("This account has been disabled or no longer exists.");
  if (user.status !== "active") throw new Error("Please activate your account first");

  if (user.is_temporary && user.expires_at) {
    if (new Date(user.expires_at).getTime() < Date.now()) {
      throw new Error("This temporary account has expired.");
    }
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Invalid email or password");

  const token = await new SignJWT({ sub: user.id, type: "workspace_user" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);

  setCookie("agatike_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  let redirectUrl = "/dashboard";

  if (user.workspaces && !user.workspaces.includes("ALL") && user.workspaces.length > 0) {
    const firstWorkspaceId = user.workspaces[0];
    const wsQuery = `
      query GetWs($id: uuid!) {
        workspaces_by_pk(id: $id) {
          name
        }
      }
    `;
    const wsRes = await hasuraRequest<{ workspaces_by_pk: { name: string } }>(wsQuery, {
      id: firstWorkspaceId,
    });
    if (wsRes.workspaces_by_pk) {
      const slug = wsRes.workspaces_by_pk.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      let pagePath = "";
      if (user.pages && !user.pages.includes("ALL") && user.pages.length > 0) {
        pagePath = user.pages[0]; // e.g., "/events"
      }
      redirectUrl = `/dashboard/${slug}${pagePath}`;
    }
  }

  return { success: true, redirectUrl };
});

export const updateWorkspaceUser = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub || session.type !== "organizer") {
    throw new Error("unauthenticated or unauthorized");
  }

  const input = ctx.data as any;
  const { id, ...updateFields } = input;

  const mutation = `
    mutation UpdateWorkspaceUser($id: uuid!, $_set: workspace_users_set_input!) {
      update_workspace_users_by_pk(pk_columns: {id: $id}, _set: $_set) {
        id
      }
    }
  `;

  const _set: any = { updated_at: new Date().toISOString() };
  if (updateFields.workspaces) _set.workspaces = updateFields.workspaces;
  if (updateFields.role) _set.role = updateFields.role;
  if (updateFields.modules) _set.modules = updateFields.modules;
  if (updateFields.pages) _set.pages = updateFields.pages;
  if (updateFields.is_temporary !== undefined) _set.is_temporary = updateFields.is_temporary;
  if (updateFields.expires_at !== undefined) _set.expires_at = updateFields.expires_at;

  await hasuraRequest(mutation, { id, _set });
  return { success: true };
});

export const removeWorkspaceUser = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub || session.type !== "organizer") {
    throw new Error("unauthenticated or unauthorized");
  }

  const { id } = ctx.data as any;

  const mutation = `
    mutation DeleteWorkspaceUser($id: uuid!) {
      delete_workspace_users_by_pk(id: $id) {
        id
      }
    }
  `;

  await hasuraRequest(mutation, { id });
  return { success: true };
});

export const resendWorkspaceUserInvite = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub || session.type !== "organizer") {
    throw new Error("unauthenticated or unauthorized");
  }

  const input = ctx.data as any;
  const userId = input.userId;

  // Fetch the user to make sure they belong to the organizer and are still pending
  const query = `
    query GetUser($id: uuid!) {
      workspace_users_by_pk(id: $id) {
        id
        email
        name
        status
        organizer_id
      }
    }
  `;
  const data = await hasuraRequest<{ workspace_users_by_pk: any }>(query, { id: userId });
  const user = data.workspace_users_by_pk;

  if (!user || user.organizer_id !== session.sub) throw new Error("User not found");
  if (user.status === "active") throw new Error("User is already active");

  // Generate new password
  const newPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const mutation = `
    mutation UpdateUserPassword($id: uuid!, $password: String!) {
      update_workspace_users_by_pk(pk_columns: {id: $id}, _set: {password: $password}) {
        id
      }
    }
  `;
  await hasuraRequest(mutation, { id: userId, password: hashedPassword });

  // Get organizer name
  const orgQuery = `query GetOrg { organizers_by_pk(id: "${session.sub}") { name } }`;
  let orgName = "an organizer";
  try {
    const orgRes = await hasuraRequest<{ organizers_by_pk: { name: string } }>(orgQuery, {});
    if (orgRes.organizers_by_pk) orgName = orgRes.organizers_by_pk.name;
  } catch (e) {}

  console.log(`Resending invite email to ${user.email}...`);
  await sendWorkspaceUserInviteEmail({
    data: {
      to: user.email,
      userName: user.name,
      initialPassword: newPassword,
      organizerName: orgName,
    },
  } as any);

  return { success: true };
});

export const checkWorkspaceUserStatus = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { email } = ctx.data as any;

    const query = `
      query CheckUserStatus($email: String!) {
        workspace_users(where: { email: { _ilike: $email } }) {
          status
        }
      }
    `;
    const data = await hasuraRequest<{ workspace_users: any[] }>(query, { email });
    const user = data.workspace_users[0];

    if (!user) throw new Error("User not found");
    return user.status;
  });
