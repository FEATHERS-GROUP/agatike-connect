import dotenv from "dotenv";
dotenv.config();
const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

const sql = `
  -- Create new invoices table specific to organizers
  CREATE TABLE IF NOT EXISTS organizer_invoices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organizer_id text,
    workspace_id uuid,
    subscription_id uuid REFERENCES subscriptions(id),
    amount numeric NOT NULL,
    status text DEFAULT 'pending',
    currency text DEFAULT 'USD',
    payment_method text,
    date timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
  );

  -- Create promotional rules table
  CREATE TABLE IF NOT EXISTS promotional_rules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    discount_percentage numeric NOT NULL,
    duration_months integer,
    applies_to_cycles jsonb DEFAULT '["monthly", "annually"]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
  );

  -- Insert the 50% off for 3 months rule requested by user
  INSERT INTO promotional_rules (name, description, discount_percentage, duration_months, applies_to_cycles)
  SELECT 'Launch Promo', '50% off for the first 3 months!', 50, 3, '["monthly", "annually"]'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM promotional_rules WHERE name = 'Launch Promo');
`;

async function execute() {
  // 1. Run SQL
  let res = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({ type: "run_sql", args: { source: "default", sql } }),
  });
  console.log("SQL Result:", await res.json());

  // 2. Track Tables
  const tables = ["organizer_invoices", "promotional_rules"];
  for (const table of tables) {
    res = await fetch(`${API_BASE}/v1/metadata`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
      body: JSON.stringify({
        type: "pg_track_table",
        args: { source: "default", table },
      }),
    });
    console.log(`Tracking ${table}:`, await res.json());
  }
}

execute();
