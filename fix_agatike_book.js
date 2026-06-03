import { config } from "dotenv";
config();

async function run() {
  const sql = `
    DROP TABLE IF EXISTS agatike_book_records CASCADE;
    DROP TABLE IF EXISTS agatike_books CASCADE;

    CREATE TABLE agatike_books (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      workspace_id uuid NOT NULL,
      name text NOT NULL,
      icon text DEFAULT 'BookOpen',
      schema_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    CREATE TABLE agatike_book_records (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      book_id uuid NOT NULL REFERENCES agatike_books(id) ON DELETE CASCADE,
      record_data jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  `;

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
        { type: "pg_track_table", args: { schema: "public", name: "agatike_books" } },
        { type: "pg_track_table", args: { schema: "public", name: "agatike_book_records" } },
        { type: "pg_create_array_relationship", args: { table: "events", name: "agatike_books", using: { foreign_key_constraint_on: { table: "agatike_books", column: "event_id" } } } },
        { type: "pg_create_array_relationship", args: { table: "agatike_books", name: "records", using: { foreign_key_constraint_on: { table: "agatike_book_records", column: "book_id" } } } },
        { type: "pg_create_object_relationship", args: { table: "agatike_book_records", name: "book", using: { foreign_key_constraint_on: "book_id" } } }
      ]
    }),
  });
  console.log(await trackRes.json());
}
run();
