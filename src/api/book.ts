import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";

const GET_AGATIKE_BOOKS = `
  query GetAgatikeBooks($event_id: uuid!) {
    agatike_books(where: { event_id: { _eq: $event_id } }, order_by: { created_at: desc }) {
      id
      name
      icon
      schema_fields
      created_at
      records(order_by: { created_at: desc }) {
        id
        record_data
        created_at
      }
    }
  }
`;

export const getAgatikeBooks = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const payload = (ctx.data as any).data || ctx.data;
  const { event_id } = payload;
  const data = await hasuraRequest<{ agatike_books: any[] }>(GET_AGATIKE_BOOKS, { event_id });
  return data.agatike_books || [];
});

const CREATE_AGATIKE_BOOK = `
  mutation CreateAgatikeBook($object: agatike_books_insert_input!) {
    insert_agatike_books_one(object: $object) {
      id
      name
    }
  }
`;

export const createAgatikeBook = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const payload = (ctx.data as any).data || ctx.data;
  const bookData = payload;
  if (!bookData.workspace_id) {
    bookData.workspace_id = session.sub;
  }

  return hasuraRequest(CREATE_AGATIKE_BOOK, { object: bookData });
});

const CREATE_AGATIKE_BOOK_RECORD = `
  mutation CreateAgatikeBookRecord($object: agatike_book_records_insert_input!) {
    insert_agatike_book_records_one(object: $object) {
      id
    }
  }
`;

export const createAgatikeBookRecord = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const payload = (ctx.data as any).data || ctx.data;
  const recordData = payload;
  return hasuraRequest(CREATE_AGATIKE_BOOK_RECORD, { object: recordData });
});

export const createPublicAgatikeBookRecord = createServerFn({ method: "POST" }).handler(async (ctx) => {
  // Public endpoint for Page Builder forms (no auth required)
  const payload = (ctx.data as any).data || ctx.data;
  const recordData = payload;
  return hasuraRequest(CREATE_AGATIKE_BOOK_RECORD, { object: recordData });
});

const DELETE_AGATIKE_BOOK = `
  mutation DeleteAgatikeBook($id: uuid!) {
    delete_agatike_books_by_pk(id: $id) {
      id
    }
  }
`;

export const deleteAgatikeBook = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const payload = (ctx.data as any).data || ctx.data;
  const { id } = payload;
  return hasuraRequest(DELETE_AGATIKE_BOOK, { id });
});

const DELETE_AGATIKE_BOOK_RECORD = `
  mutation DeleteAgatikeBookRecord($id: uuid!) {
    delete_agatike_book_records_by_pk(id: $id) {
      id
    }
  }
`;

export const deleteAgatikeBookRecord = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const payload = (ctx.data as any).data || ctx.data;
  const { id } = payload;
  return hasuraRequest(DELETE_AGATIKE_BOOK_RECORD, { id });
});

const UPDATE_AGATIKE_BOOK_RECORD = `
  mutation UpdateAgatikeBookRecord($id: uuid!, $record_data: jsonb!) {
    update_agatike_book_records_by_pk(pk_columns: { id: $id }, _set: { record_data: $record_data }) {
      id
      record_data
    }
  }
`;

export const updateAgatikeBookRecord = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const { id, record_data } = ctx.data as unknown as { id: string; record_data: any };
  return hasuraRequest(UPDATE_AGATIKE_BOOK_RECORD, { id, record_data });
});

const UPDATE_AGATIKE_BOOK_NAME = `
  mutation UpdateAgatikeBookName($id: uuid!, $name: String!) {
    update_agatike_books_by_pk(pk_columns: { id: $id }, _set: { name: $name }) {
      id
      name
    }
  }
`;

export const updateAgatikeBookName = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const payload = (ctx.data as any).data || ctx.data;
  const { id, name } = payload;
  return hasuraRequest(UPDATE_AGATIKE_BOOK_NAME, { id, name });
});

const GET_AGATIKE_BOOKS_BY_WORKSPACE = `
  query GetAgatikeBooksByWorkspace($workspace_id: uuid!) {
    agatike_books(
      where: { workspace_id: { _eq: $workspace_id }, event_id: { _is_null: true } },
      order_by: { created_at: desc }
    ) {
      id
      name
      icon
      schema_fields
      created_at
      records(order_by: { created_at: desc }) {
        id
        record_data
        created_at
      }
    }
  }
`;

export const getAgatikeBooksByWorkspace = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    const payload = (ctx.data as any).data || ctx.data;
    const { workspace_id } = payload;
    const data = await hasuraRequest<{ agatike_books: any[] }>(GET_AGATIKE_BOOKS_BY_WORKSPACE, {
      workspace_id,
    });
    return data.agatike_books || [];
  },
);

export const getPublicAgatikeBooksByWorkspace = createServerFn({ method: "POST" }).handler(
  async (ctx) => {
    // Public endpoint for Page Builder forms (no auth required)
    const payload = (ctx.data as any).data || ctx.data;
    const { workspace_id } = payload;
    const data = await hasuraRequest<{ agatike_books: any[] }>(GET_AGATIKE_BOOKS_BY_WORKSPACE, {
      workspace_id,
    });
    return data.agatike_books || [];
  },
);
