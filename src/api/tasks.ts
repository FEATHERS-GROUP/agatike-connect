import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";

// ── Queries ─────────────────────────────────────────────────────────────────

const GET_TASKS = `
  query GetWorkspaceTasks($workspace_id: uuid!) {
    workspace_tasks(
      where: { workspace_id: { _eq: $workspace_id } }
      order_by: { created_at: desc }
    ) {
      id
      title
      description
      status
      priority
      due_date
      assigned_to
      created_at
      updated_at
    }
  }
`;

export const getWorkspaceTasks = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { workspace_id } = ctx.data as unknown as { workspace_id: string };
  const data = await hasuraRequest<{ workspace_tasks: any[] }>(GET_TASKS, { workspace_id });
  return data.workspace_tasks || [];
});

// ── Mutations ────────────────────────────────────────────────────────────────

const CREATE_TASK = `
  mutation CreateWorkspaceTask($object: workspace_tasks_insert_input!) {
    insert_workspace_tasks_one(object: $object) {
      id
      title
      status
      priority
      due_date
    }
  }
`;

export const createWorkspaceTask = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session?.sub) throw new Error("unauthenticated");
  const taskData = ctx.data as any;
  return hasuraRequest(CREATE_TASK, { object: taskData });
});

const UPDATE_TASK = `
  mutation UpdateWorkspaceTask($id: uuid!, $set: workspace_tasks_set_input!) {
    update_workspace_tasks_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
      status
      priority
      title
    }
  }
`;

export const updateWorkspaceTask = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session?.sub) throw new Error("unauthenticated");
  const { id, ...set } = ctx.data as any;
  return hasuraRequest(UPDATE_TASK, { id, set });
});

const DELETE_TASK = `
  mutation DeleteWorkspaceTask($id: uuid!) {
    delete_workspace_tasks_by_pk(id: $id) { id }
  }
`;

export const deleteWorkspaceTask = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session?.sub) throw new Error("unauthenticated");
  const { id } = ctx.data as unknown as { id: string };
  return hasuraRequest(DELETE_TASK, { id });
});
