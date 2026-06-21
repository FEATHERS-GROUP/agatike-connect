import sys

# 1. Update src/api/auth.ts
with open('src/api/auth.ts', 'r') as f:
    auth_content = f.read()

old_get_session = """export const getSession = createServerFn({ method: "POST" }).handler(async () => {
  const token = getCookie("agatike_auth");
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as { sub: string; type: string };
  } catch (e) {
    return null;
  }
});"""

new_get_session = """export const getSession = createServerFn({ method: "POST" }).handler(async () => {
  const token = getCookie("agatike_auth");
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const session = payload as unknown as { sub: string; type: string };
    
    if (session.type === "workspace_user") {
      const query = `
        query GetStatus($id: uuid!) {
          workspace_users_by_pk(id: $id) {
            status
          }
        }
      `;
      const res = await hasuraRequest<{ workspace_users_by_pk: { status: string } | null }>(query, { id: session.sub });
      const user = res.workspace_users_by_pk;
      
      if (!user || user.status === "disabled" || user.status === "deleted") {
        deleteCookie("agatike_auth", { path: "/" });
        return null;
      }
    }
    
    return session;
  } catch (e) {
    return null;
  }
});"""

auth_content = auth_content.replace(old_get_session, new_get_session)

with open('src/api/auth.ts', 'w') as f:
    f.write(auth_content)


# 2. Update src/api/workspace_users.ts
with open('src/api/workspace_users.ts', 'r') as f:
    users_content = f.read()

old_login_check = """  if (!user) throw new Error("Invalid email or password");
  if (user.status !== "active") throw new Error("Please activate your account first");"""

new_login_check = """  if (!user) throw new Error("Invalid email or password");
  if (user.status === "disabled" || user.status === "deleted") throw new Error("This account has been disabled or no longer exists.");
  if (user.status !== "active") throw new Error("Please activate your account first");"""

users_content = users_content.replace(old_login_check, new_login_check)

with open('src/api/workspace_users.ts', 'w') as f:
    f.write(users_content)

print("Updated session and login checks.")
