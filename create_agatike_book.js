import { config } from "dotenv";
config();

async function run() {
  const sql = `
    CREATE TABLE IF NOT EXISTS agatike_book_records (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      workspace_id uuid NOT NULL,
      record_type text NOT NULL,
      title text NOT NULL,
      description text,
      amount numeric,
      status text,
      file_url text,
      metadata jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  `;

  // 1. Run SQL
  console.log("Running SQL...");
  const sqlRes = await fetch(process.env.HASURA_ADMIN_API.replace('/graphql', '/query'), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify({
      type: "run_sql",
      args: { sql, cascade: false }
    }),
  });
  console.log(await sqlRes.json());

  // 2. Track Tables
  console.log("Tracking Tables...");
  const trackRes = await fetch(process.env.HASURA_ADMIN_API.replace('/graphql', '/metadata'), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify({
      type: "bulk",
      args: [
        { type: "pg_track_table", args: { schema: "public", name: "agatike_book_records" } },
        { type: "pg_create_array_relationship", args: { table: "events", name: "agatike_book_records", using: { foreign_key_constraint_on: { table: "agatike_book_records", column: "event_id" } } } }
      ]
    }),
  });
  console.log(await trackRes.json());
}
run();
