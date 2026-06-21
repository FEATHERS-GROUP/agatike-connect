import dotenv from "dotenv";
dotenv.config();

const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  console.log("1. Dropping old workspace_users table...");
  const dropRes = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: `DROP TABLE IF EXISTS public.workspace_users CASCADE;`,
      },
    }),
  });
  console.log("Drop result:", await dropRes.json());

  console.log("2. Creating corrected workspace_users table...");
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
              name text NOT NULL,
              email text NOT NULL,
              password text,
              status text DEFAULT 'pending'::text NOT NULL,
              workspaces jsonb DEFAULT '[]'::jsonb,
              role text DEFAULT 'user'::text NOT NULL,
              modules jsonb DEFAULT '[]'::jsonb,
              pages jsonb DEFAULT '[]'::jsonb,
              is_temporary boolean DEFAULT false,
              expires_at timestamp with time zone,
              created_at timestamp with time zone DEFAULT now() NOT NULL,
              updated_at timestamp with time zone DEFAULT now() NOT NULL,
              CONSTRAINT uq_workspace_user_email UNIQUE (organizer_id, email)
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

  console.log("3. Tracking workspace_users table...");
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
