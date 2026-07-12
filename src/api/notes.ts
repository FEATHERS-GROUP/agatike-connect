import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";

const GET_NOTES = `
  query GetWorkspaceNotes($workspace_id: uuid!) {
    workspace_notes(
      where: { workspace_id: { _eq: $workspace_id } }
      order_by: [{ pinned: desc }, { updated_at: desc }]
    ) {
      id
      title
      content
      pinned
      tags
      folder_id
      created_at
      updated_at
    }
  }
`;

export const getWorkspaceNotes = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { workspace_id } = ctx.data as unknown as { workspace_id: string };
  const data = await hasuraRequest<{ workspace_notes: any[] }>(GET_NOTES, { workspace_id });
  return data.workspace_notes || [];
});

const GET_NOTE_BY_ID = `
  query GetWorkspaceNoteById($id: uuid!) {
    workspace_notes_by_pk(id: $id) {
      id
      workspace_id
      title
      content
      pinned
      tags
      folder_id
      created_at
      updated_at
    }
  }
`;

export const getWorkspaceNoteById = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id } = ctx.data as unknown as { id: string };
  const data = await hasuraRequest<{ workspace_notes_by_pk: any }>(GET_NOTE_BY_ID, { id });
  return data.workspace_notes_by_pk;
});

const CREATE_NOTE = `
  mutation CreateWorkspaceNote($object: workspace_notes_insert_input!) {
    insert_workspace_notes_one(object: $object) {
      id
      title
      folder_id
    }
  }
`;

export const createWorkspaceNote = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session?.sub) throw new Error("unauthenticated");
  return hasuraRequest(CREATE_NOTE, { object: ctx.data });
});

const UPDATE_NOTE = `
  mutation UpdateWorkspaceNote($id: uuid!, $set: workspace_notes_set_input!) {
    update_workspace_notes_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
      title
      content
      pinned
      tags
      folder_id
      updated_at
    }
  }
`;

export const updateWorkspaceNote = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session?.sub) throw new Error("unauthenticated");
  const { id, ...set } = ctx.data as any;
  return hasuraRequest(UPDATE_NOTE, { id, set });
});

const DELETE_NOTE = `
  mutation DeleteWorkspaceNote($id: uuid!) {
    delete_workspace_notes_by_pk(id: $id) { id }
  }
`;

export const deleteWorkspaceNote = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session?.sub) throw new Error("unauthenticated");
  const { id } = ctx.data as unknown as { id: string };
  return hasuraRequest(DELETE_NOTE, { id });
});
