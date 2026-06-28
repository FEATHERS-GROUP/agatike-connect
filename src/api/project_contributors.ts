import { createServerFn } from "@tanstack/react-start";
import { executeSendWorkspaceUserInviteEmail, executeSendProjectAccessEmail } from "./email";
import * as bcrypt from "bcryptjs";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";

const INVITE_CONTRIBUTOR = `
  mutation InviteContributor($object: project_contributors_insert_input!) {
    insert_project_contributors_one(
      object: $object
      on_conflict: {
        constraint: project_contributors_email_resource_type_resource_id_key,
        update_columns: [access_level]
      }
    ) {
      id
      email
      access_level
    }
  }
`;

const GET_CONTRIBUTORS = `
  query GetContributors($resource_type: String!, $resource_id: uuid!) {
    project_contributors(
      where: { resource_type: { _eq: $resource_type }, resource_id: { _eq: $resource_id } }
      order_by: { created_at: desc }
    ) {
      id
      email
      access_level
      status
      created_at
    }
  }
`;

const REMOVE_CONTRIBUTOR = `
  mutation RemoveContributor($id: uuid!) {
    delete_project_contributors_by_pk(id: $id) {
      id
    }
  }
`;

export const inviteContributor = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const session = await getSession();
    if (!session || !session.sub) throw new Error("unauthenticated");

    const { email, workspace_id, resource_type, resource_id, access_level } = ctx.data;

    // First insert or update the contributor record
    const res = await hasuraRequest<{ insert_project_contributors_one: { id: string } }>(
      INVITE_CONTRIBUTOR,
      {
        object: {
          email: email.toLowerCase().trim(),
          workspace_id,
          resource_type,
          resource_id,
          access_level,
        },
      },
    );

    // Now check if a workspace_user already exists globally
    const checkUserQuery = `
      query CheckWorkspaceUser($email: String!) {
        workspace_users(where: { email: { _ilike: $email } }) {
          id
          workspaces
        }
      }
    `;
    const userRes = await hasuraRequest<{ workspace_users: any[] }>(checkUserQuery, {
      email,
    });

    const existingUser = userRes.workspace_users[0];

    // We assume the inviter is the organizer, or we need to find the organizer ID
    // If session is organizer, session.sub is organizer_id
    // If session is workspace_user, we need their organizer_id
    let organizer_id = session.sub;
    if (session.type === "workspace_user") {
      const getOrgQuery = `query { workspace_users_by_pk(id: "${session.sub}") { organizer_id } }`;
      const orgRes = await hasuraRequest<any>(getOrgQuery, {});
      organizer_id = orgRes.workspace_users_by_pk.organizer_id;
    }

    if (!existingUser) {
      // Create a basic workspace_user for them to login with
      const createWorkspaceUser = `
        mutation CreateBasicWorkspaceUser($email: String!, $organizer_id: uuid!, $workspace_id: jsonb!, $password: String!) {
          insert_workspace_users_one(object: {
            email: $email,
            name: $email,
            organizer_id: $organizer_id,
            workspaces: $workspace_id,
            role: "contributor",
            modules: "[]",
            pages: "[]",
            is_temporary: false,
            status: "pending",
            password: $password
          }) {
            id
          }
        }
      `;

      const initialPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(initialPassword, 10);

      await hasuraRequest(createWorkspaceUser, {
        email: email.toLowerCase().trim(),
        organizer_id,
        workspace_id: [workspace_id],
        password: hashedPassword,
      });

      try {
        const orgQuery = `query { organizers_by_pk(id: "${organizer_id}") { name } }`;
        const orgData = await hasuraRequest<any>(orgQuery, {});
        const orgName = orgData?.organizers_by_pk?.name || "an organizer";

        await executeSendWorkspaceUserInviteEmail({
          to: email.toLowerCase().trim(),
          userName: email.split("@")[0],
          initialPassword,
          organizerName: orgName,
        });
      } catch (emailErr) {
        console.error("Failed to send contributor invite email:", emailErr);
      }
    } else {
      // User exists. Ensure workspace_id is in their workspaces array.
      const existingWorkspaces = existingUser.workspaces || [];
      if (!existingWorkspaces.includes(workspace_id)) {
        const updateWorkspaces = `
          mutation UpdateWorkspaces($id: uuid!, $workspaces: jsonb!) {
            update_workspace_users_by_pk(pk_columns: {id: $id}, _set: {workspaces: $workspaces}) {
              id
            }
          }
        `;
        await hasuraRequest(updateWorkspaces, {
          id: existingUser.id,
          workspaces: [...existingWorkspaces, workspace_id],
        });
      }

      // Send the "Project Access Granted" email
      try {
        const orgQuery = `query { organizers_by_pk(id: "${organizer_id}") { name } }`;
        const orgData = await hasuraRequest<any>(orgQuery, {});
        const orgName = orgData?.organizers_by_pk?.name || "an organizer";

        let projectLink =
          process.env.NODE_ENV === "production"
            ? "https://agatike.rw/dashboard"
            : "http://localhost:3000/dashboard";
        let projectName = "a project";

        const getWsQuery = `query { workspaces_by_pk(id: "${workspace_id}") { name } }`;
        const wsData = await hasuraRequest<any>(getWsQuery, {});
        const wsName = wsData?.workspaces_by_pk?.name || "";
        const slug = wsName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        if (resource_type === "ticket_project") {
          const getProjQuery = `query { ticket_projects_by_pk(id: "${resource_id}") { name } }`;
          const projData = await hasuraRequest<any>(getProjQuery, {});
          projectName = projData?.ticket_projects_by_pk?.name || "Ticket Project";
          if (slug) {
            projectLink = `${process.env.NODE_ENV === "production" ? "https://agatike.rw" : "http://localhost:3000"}/dashboard/${slug}/ticket-designer/${resource_id}`;
          }
        }

        await executeSendProjectAccessEmail({
          to: email.toLowerCase().trim(),
          userName: email.split("@")[0],
          organizerName: orgName,
          projectName,
          projectLink,
        });
      } catch (emailErr) {
        console.error("Failed to send project access email:", emailErr);
      }
    }

    return res.insert_project_contributors_one;
  });

export const getContributors = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { resource_type, resource_id } = ctx.data;
    const res = await hasuraRequest<{ project_contributors: any[] }>(GET_CONTRIBUTORS, {
      resource_type,
      resource_id,
    });
    return res.project_contributors;
  });

export const removeContributor = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const { id } = ctx.data;
    const res = await hasuraRequest<{ delete_project_contributors_by_pk: { id: string } }>(
      REMOVE_CONTRIBUTOR,
      { id },
    );
    return res.delete_project_contributors_by_pk;
  });

export const getContributorAccessLevel = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    try {
      const session = await getSession();
      if (!session || !session.sub) return null;

      if (session.type === "organizer") return "edit"; // Organizer always has edit access

      const { resource_type, resource_id } = ctx.data;

      const q = `query { workspace_users_by_pk(id: "${session.sub}") { email } }`;
      const res = await hasuraRequest<any>(q, {});
      const email = res?.workspace_users_by_pk?.email;

      if (!email) return "view"; // fallback

      const contribQuery = `
      query {
        project_contributors(
          where: { email: { _ilike: "${email}" }, resource_type: { _eq: "${resource_type}" }, resource_id: { _eq: "${resource_id}" } }
        ) {
          access_level
        }
      }
    `;
      const contribRes = await hasuraRequest<any>(contribQuery, {});

      // If they have no specific record but they are a workspace_user, they might have access via general workspace module permissions.
      // Usually workspace_users with full module access have edit access unless restricted.
      if (!contribRes.project_contributors.length) return "edit";

      return contribRes.project_contributors[0].access_level as "view" | "edit";
    } catch (err) {
      console.error("getContributorAccessLevel Error:", err);
      throw err;
    }
  });
