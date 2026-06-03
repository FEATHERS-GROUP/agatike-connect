import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";

const GET_AGATIKE_BOOK_RECORDS = `
  query GetAgatikeBookRecords($event_id: uuid!) {
    agatike_book_records(where: { event_id: { _eq: $event_id } }, order_by: { created_at: desc }) {
      id
      record_type
      title
      description
      amount
      status
      file_url
      metadata
      created_at
      updated_at
    }
  }
`;

export const getAgatikeBookRecords = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { event_id } = ctx.data as unknown as { event_id: string };
  const data = await hasuraRequest<{ agatike_book_records: any[] }>(GET_AGATIKE_BOOK_RECORDS, { event_id });
  return data.agatike_book_records || [];
});

const CREATE_AGATIKE_BOOK_RECORD = `
  mutation CreateAgatikeBookRecord($object: agatike_book_records_insert_input!) {
    insert_agatike_book_records_one(object: $object) {
      id
      title
    }
  }
`;

export const createAgatikeBookRecord = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const recordData = ctx.data as any;
  recordData.workspace_id = session.sub; // Mocking workspace ID for now
  
  return hasuraRequest(CREATE_AGATIKE_BOOK_RECORD, { object: recordData });
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
