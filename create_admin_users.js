import dotenv from "dotenv";
dotenv.config();

const API_BASE = process.env.HASURA_ADMIN_API?.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  if (!API_BASE || !SECRET) {
    console.error("HASURA_ADMIN_API or HASURA_ADMIN_SECRETE is missing in .env");
    return;
  }

  console.log("1. Creating admin_users table...");
  const createRes = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: `
          CREATE TABLE IF NOT EXISTS public.admin_users (
              id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
              email text NOT NULL UNIQUE,
              name text,
              role text DEFAULT 'admin'::text NOT NULL,
              created_at timestamp with time zone DEFAULT now() NOT NULL
          );
        `,
      },
    }),
  });

  const createData = await createRes.json();
  if (createData.error) {
    console.error("Error creating table:", createData.error);
  } else {
    console.log("Table created!");
  }

  console.log("2. Tracking admin_users table...");
  const trackRes = await fetch(`${API_BASE}/v1/metadata`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "pg_track_table",
      args: {
        source: "default",
        table: "admin_users",
      },
    }),
  });
  
  const trackData = await trackRes.json();
  if (trackData.error && trackData.error !== "table/view is already tracked") {
    console.error("Error tracking table:", trackData.error);
  } else {
    console.log("Track table success!");
  }
}

run();
