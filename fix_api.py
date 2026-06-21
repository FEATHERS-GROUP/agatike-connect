import sys

# 1. Add checkWorkspaceUserStatus to src/api/workspace_users.ts
with open('src/api/workspace_users.ts', 'r') as f:
    users_content = f.read()

status_code = """
export const checkWorkspaceUserStatus = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
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
"""

users_content += status_code

with open('src/api/workspace_users.ts', 'w') as f:
    f.write(users_content)


# 2. Update src/api/email.ts to include encodeURIComponent(to) in activationLink
with open('src/api/email.ts', 'r') as f:
    email_content = f.read()

email_content = email_content.replace(
    'const activationLink = `${baseUrl}/dashboard/workspace-user/activate`;',
    'const activationLink = `${baseUrl}/dashboard/workspace-user/${encodeURIComponent(to)}/activate`;'
)

with open('src/api/email.ts', 'w') as f:
    f.write(email_content)

print("Updated APIs.")
