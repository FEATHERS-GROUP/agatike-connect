import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

const GET_USER_WORKSPACES = `
  query GetUserWorkspaces($id: uuid!) {
    workspace_users_by_pk(id: $id) {
      organizer_id
      workspaces
      role
    }
    organizers_by_pk(id: $id) {
      id
      workspaces {
        id
        name
        slug
      }
    }
  }
`;

export const getWorkspacesForStaffUser = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { user_id } = ctx.data as any;
  if (!user_id) return [];

  const res = await hasuraRequest<any>(GET_USER_WORKSPACES, { id: user_id });
  
  if (res.organizers_by_pk) {
    return res.organizers_by_pk.workspaces;
  }

  if (res.workspace_users_by_pk) {
    const orgId = res.workspace_users_by_pk.organizer_id;
    const allowed = res.workspace_users_by_pk.workspaces;
    
    const wsQuery = `
      query GetWorkspaces($orgId: uuid!) {
        workspaces(where: { orgnizer_id: { _eq: $orgId } }) {
          id
          name
          slug
        }
      }
    `;
    const wsRes = await hasuraRequest<any>(wsQuery, { orgId });
    const allWs = wsRes.workspaces || [];
    
    if (allowed && !allowed.includes("ALL")) {
      return allWs.filter((w: any) => allowed.includes(w.id));
    }
    return allWs;
  }

  return [];
});
