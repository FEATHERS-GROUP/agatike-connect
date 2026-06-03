import { config } from "dotenv";
config();

async function run() {
  const sql = `
    CREATE TABLE IF NOT EXISTS event_vendors (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      vendor_unique_id text UNIQUE NOT NULL,
      name text NOT NULL,
      description text,
      contact_info text,
      created_at timestamptz DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS voucher_transactions (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      product_order_id uuid NOT NULL REFERENCES product_orders(id) ON DELETE CASCADE,
      vendor_id uuid NOT NULL REFERENCES event_vendors(id) ON DELETE CASCADE,
      amount numeric NOT NULL,
      description text,
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
        { type: "pg_track_table", args: { schema: "public", name: "event_vendors" } },
        { type: "pg_track_table", args: { schema: "public", name: "voucher_transactions" } },
      ],
    }),
  });
  console.log(await trackRes.json());
}

run();
