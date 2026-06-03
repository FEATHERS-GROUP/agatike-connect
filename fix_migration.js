import { config } from "dotenv";
config();

async function run() {
  const sql = `
    DROP TABLE IF EXISTS sponsored_vouchers CASCADE;
    DROP TABLE IF EXISTS sponsored_voucher_batches CASCADE;

    CREATE TABLE sponsored_voucher_batches (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      workspace_id uuid NOT NULL,
      organizer_id uuid NOT NULL,
      name text NOT NULL,
      value_per_voucher numeric NOT NULL,
      created_at timestamptz DEFAULT now()
    );

    CREATE TABLE sponsored_vouchers (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      batch_id uuid NOT NULL REFERENCES sponsored_voucher_batches(id) ON DELETE CASCADE,
      qr_code_string text UNIQUE NOT NULL,
      current_balance numeric NOT NULL,
      is_active boolean DEFAULT true,
      created_at timestamptz DEFAULT now()
    );
  `;

  // 1. Run SQL
  console.log("Running SQL...");
  const sqlRes = await fetch(process.env.HASURA_ADMIN_API.replace("/graphql", "/query"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify({
      type: "run_sql",
      args: { sql, cascade: false },
    }),
  });
  console.log(await sqlRes.json());

  // 2. Track Tables
  console.log("Tracking Tables...");
  const trackRes = await fetch(process.env.HASURA_ADMIN_API.replace("/graphql", "/metadata"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify({
      type: "bulk",
      args: [
        { type: "pg_track_table", args: { schema: "public", name: "sponsored_voucher_batches" } },
        { type: "pg_track_table", args: { schema: "public", name: "sponsored_vouchers" } },
        {
          type: "pg_create_array_relationship",
          args: {
            table: "sponsored_voucher_batches",
            name: "vouchers",
            using: {
              foreign_key_constraint_on: { table: "sponsored_vouchers", column: "batch_id" },
            },
          },
        },
        {
          type: "pg_create_object_relationship",
          args: {
            table: "sponsored_vouchers",
            name: "batch",
            using: { foreign_key_constraint_on: "batch_id" },
          },
        },
      ],
    }),
  });
  console.log(await trackRes.json());
}
run();
