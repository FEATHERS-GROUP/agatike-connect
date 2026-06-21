import dotenv from "dotenv";
dotenv.config();

const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  console.log("1. Creating workspace_users table...");
  const createRes = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: `
          CREATE TABLE IF NOT EXISTS public.workspace_users (
              id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
              organizer_id uuid NOT NULL,
              workspace_id uuid,
              user_id uuid,
              email text,
              role text DEFAULT 'user'::text NOT NULL,
              modules jsonb DEFAULT '[]'::jsonb,
              pages jsonb DEFAULT '[]'::jsonb,
              is_temporary boolean DEFAULT false,
              expires_at timestamp with time zone,
              created_at timestamp with time zone DEFAULT now() NOT NULL
          );

          -- Ensure we don't add duplicate pairs for specific workspace
          CREATE UNIQUE INDEX IF NOT EXISTS uq_workspace_user_idx ON public.workspace_users (workspace_id, user_id) WHERE workspace_id IS NOT NULL;
          
          -- Ensure we don't add duplicate pairs for ALL workspaces per organizer
          CREATE UNIQUE INDEX IF NOT EXISTS uq_organizer_user_all_idx ON public.workspace_users (organizer_id, user_id) WHERE workspace_id IS NULL;
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

  console.log("2. Tracking workspace_users table...");
  const trackRes = await fetch(`${API_BASE}/v1/metadata`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "pg_track_table",
      args: {
        source: "default",
        table: "workspace_users",
      },
    }),
  });
  console.log("Track table:", await trackRes.json());
}

run();
