import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

export const getWorkspaceFolders = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { workspace_id, module_type } = (ctx as any).data as { workspace_id: string; module_type: string };
  const query = `
    query GetFolders($workspace_id: uuid!, $module_type: String!) {
      workspace_folders(where: { workspace_id: { _eq: $workspace_id }, module_type: { _eq: $module_type } }, order_by: { created_at: asc }) {
        id
        name
        module_type
      }
    }
  `;
  const res = await hasuraRequest<{ workspace_folders: any[] }>(query, { workspace_id, module_type });
  return res.workspace_folders || [];
});

export const createWorkspaceFolder = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { workspace_id, name, module_type } = (ctx as any).data as { workspace_id: string; name: string; module_type: string };
  const query = `
    mutation CreateFolder($workspace_id: uuid!, $name: String!, $module_type: String!) {
      insert_workspace_folders_one(object: { workspace_id: $workspace_id, name: $name, module_type: $module_type }) {
        id
        name
      }
    }
  `;
  const res = await hasuraRequest<{ insert_workspace_folders_one: any }>(query, { workspace_id, name, module_type });
  return res.insert_workspace_folders_one;
});

export const deleteWorkspaceFolder = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id } = (ctx as any).data as { id: string };
  const query = `
    mutation DeleteFolder($id: uuid!) {
      delete_workspace_folders_by_pk(id: $id) {
        id
      }
    }
  `;
  const res = await hasuraRequest<{ delete_workspace_folders_by_pk: any }>(query, { id });
  return res.delete_workspace_folders_by_pk;
});
