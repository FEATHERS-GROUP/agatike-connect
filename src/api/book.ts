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
  const { event_id } = ctx.data as unknown as { event_id: string };
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

  const bookData = ctx.data as any;
  bookData.workspace_id = session.sub;
  
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

  const recordData = ctx.data as any;
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

  const { id } = ctx.data as unknown as { id: string };
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

  const { id } = ctx.data as unknown as { id: string };
  return hasuraRequest(DELETE_AGATIKE_BOOK_RECORD, { id });
});
