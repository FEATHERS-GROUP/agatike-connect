import dotenv from "dotenv";
dotenv.config();
const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

const sql = `
  CREATE TABLE IF NOT EXISTS leads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organizer_id uuid NOT NULL,
    plan_id uuid,
    name text NOT NULL,
    email text NOT NULL,
    company text,
    communication_method text,
    language text,
    country text,
    phone text,
    message text,
    status text DEFAULT 'new',
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
  );

  -- Create updated_at trigger if it doesn't exist (assuming the function set_current_timestamp_updated_at exists, typical in Hasura)
  -- If the function doesn't exist, we skip it to prevent errors, or just let Hasura handle it.
`;

async function execute() {
  console.log("Running SQL to create leads table...");
  const res = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({ type: "run_sql", args: { source: "default", sql } }),
  });
  const sqlData = await res.json();
  console.log("SQL Result:", sqlData);

  if (!sqlData.error) {
    console.log("Tracking leads table in Hasura...");
    const trackRes = await fetch(`${API_BASE}/v1/metadata`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
      body: JSON.stringify({
        type: "pg_track_table",
        args: {
          source: "default",
          table: "leads",
          configuration: {}
        }
      }),
    });
    const trackData = await trackRes.json();
    console.log("Track Table Result:", trackData);
    
    // Reload metadata
    await fetch(`${API_BASE}/v1/metadata`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
      body: JSON.stringify({ type: "reload_metadata", args: {} }),
    });
    console.log("Metadata reloaded!");
  }
}

execute();
