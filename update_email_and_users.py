import sys

# 1. Update src/api/email.ts
with open('src/api/email.ts', 'a') as f:
    f.write("""

export const sendWorkspaceUserInviteEmail = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async (ctx) => {
    const { to, userName, initialPassword, organizerName } = ctx.data as any;

    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : import.meta.env.PROD
          ? "https://agatike.rw"
          : "http://localhost:3000";

    const agatikeIconUrl = `${baseUrl}/agatike-icon.png`;
    const activationLink = `${baseUrl}/dashboard/workspace-user/activate`;

    const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #0f172a; padding: 40px 24px; text-align: center;">
        <div style="background: white; width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 16px auto; overflow: hidden; border: 2px solid white;">
          <img src="${agatikeIconUrl}" alt="Agatike" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">You've Been Invited!</h2>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 15px;">to manage ${organizerName ? organizerName + "'s" : "a"} workspace</p>
      </div>
      <div style="padding: 40px 32px; color: #333333; font-size: 16px; line-height: 1.6;">
        <p>Hi <strong>${userName}</strong>,</p>
        <p>You have been invited to join a workspace on Agatike Connect. Your account has been provisioned.</p>

        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 12px; padding: 24px; margin: 28px 0; text-align: center;">
          <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.1em;">Your Temporary Password</p>
          <p style="color: #F2571D; font-size: 28px; font-weight: 800; letter-spacing: 4px; margin: 0; font-family: monospace;">${initialPassword}</p>
        </div>

        <p>To activate your account and set a permanent password, click the link below:</p>
        <div style="margin-top: 32px; text-align: center;">
          <a href="${activationLink}" style="background-color: #f2571d; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; display: inline-block;">Activate Account</a>
        </div>
      </div>
      <div style="background-color: #fafafa; padding: 32px 24px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="font-size: 13px; color: #666; margin: 0 0 16px 0;">Powered securely by <strong>Agatike Connect</strong></p>
      </div>
    </div>
  `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Agatike Connect <hello@agatike.rw>",
        to: [to],
        subject: `You've been invited to join ${organizerName || "a workspace"}`,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send invite email");
    return data;
  });
""")

# 2. Update src/api/workspace_users.ts
with open('src/api/workspace_users.ts', 'r') as f:
    users_content = f.read()

# Add import
import_stmt = 'import { hasuraRequest } from "./graphql.server";'
new_import_stmt = 'import { hasuraRequest } from "./graphql.server";\nimport { sendWorkspaceUserInviteEmail } from "./email";'
users_content = users_content.replace(import_stmt, new_import_stmt)

# Replace TODO in addWorkspaceUser
todo_block = """  // TODO: Send email invitation with initial password and link to /dashboard/workspace-user/activate
  console.log(`Sending invite email to ${input.email} with initial password...`);
  
  return data.insert_workspace_users_one;"""

new_todo_block = """  // Get organizer name
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
      }
    } as any);
  } catch (err) {
    console.error("Failed to send invite email:", err);
  }
  
  return data.insert_workspace_users_one;"""

users_content = users_content.replace(todo_block, new_todo_block)

# Add resendWorkspaceUserInvite
resend_code = """
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
    }
  } as any);

  return { success: true };
});
"""

users_content += resend_code

with open('src/api/workspace_users.ts', 'w') as f:
    f.write(users_content)

print("Updated email.ts and workspace_users.ts")
