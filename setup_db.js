import dotenv from "dotenv";
dotenv.config();

const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  console.log("1. Creating table...");
  const createRes = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: `
          CREATE TABLE IF NOT EXISTS public.organizer_users (
              id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
              organizer_id uuid NOT NULL,
              user_id uuid NOT NULL,
              role text DEFAULT 'owner'::text NOT NULL,
              created_at timestamp with time zone DEFAULT now() NOT NULL,
              CONSTRAINT uq_organizer_user UNIQUE (organizer_id, user_id)
          );
        `,
      },
    }),
  });

  const createData = await createRes.json();
  if (createData.error) {
    console.error("Error creating table:", createData.error);
    // Ignore error if table exists
  } else {
    console.log("Table created!");
  }

  console.log("2. Tracking table...");
  const trackRes = await fetch(`${API_BASE}/v1/metadata`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "pg_track_table",
      args: {
        source: "default",
        table: "organizer_users",
      },
    }),
  });
  console.log("Track table:", await trackRes.json());
}

run();
