import { config } from "dotenv";
config();

async function run() {
  console.log("Dropping Relationships...");
  const dropRes = await fetch(process.env.HASURA_ADMIN_API.replace('/graphql', '/metadata'), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify({
      type: "bulk",
      args: [
        { type: "pg_drop_relationship", args: { table: "event_vendors", relationship: "voucher_transactions" } },
        { type: "pg_drop_relationship", args: { table: "products", relationship: "voucher_transactions" } }
      ]
    }),
  });
  console.log(await dropRes.json());

  const sql = `
    DROP TABLE IF EXISTS voucher_transactions CASCADE;

    CREATE TABLE voucher_transactions (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      voucher_id uuid NOT NULL REFERENCES sponsored_vouchers(id) ON DELETE CASCADE,
      vendor_id uuid NOT NULL REFERENCES event_vendors(id) ON DELETE CASCADE,
      amount numeric NOT NULL,
      description text,
      created_at timestamptz DEFAULT now()
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

  // 2. Track Tables and Relationships
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
        { type: "pg_track_table", args: { schema: "public", name: "voucher_transactions" } },
        { type: "pg_create_array_relationship", args: { table: "event_vendors", name: "voucher_transactions", using: { foreign_key_constraint_on: { table: "voucher_transactions", column: "vendor_id" } } } },
        { type: "pg_create_object_relationship", args: { table: "voucher_transactions", name: "vendor", using: { foreign_key_constraint_on: "vendor_id" } } },
        { type: "pg_create_object_relationship", args: { table: "voucher_transactions", name: "voucher", using: { foreign_key_constraint_on: "voucher_id" } } }
      ]
    }),
  });
  console.log(await trackRes.json());
}
run();
