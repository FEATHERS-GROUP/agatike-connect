import { config } from "dotenv";
config();

const HASURA_API = process.env.HASURA_ADMIN_API;
const HASURA_SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.project_contributors (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      workspace_id uuid NOT NULL,
      email text NOT NULL,
      resource_type text NOT NULL,
      resource_id uuid NOT NULL,
      access_level text NOT NULL,
      status text DEFAULT 'pending',
      created_at timestamp with time zone DEFAULT now() NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE
    );

    -- Ensure a user isn't invited to the same resource twice
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'project_contributors_email_resource_type_resource_id_key'
      ) THEN 
        ALTER TABLE public.project_contributors 
          ADD CONSTRAINT project_contributors_email_resource_type_resource_id_key UNIQUE (email, resource_type, resource_id);
      END IF; 
    END $$;
  `;

  console.log("Creating project_contributors table...");
  const sqlRes = await fetch(HASURA_API.replace("/v1/graphql", "/v2/query"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_SECRET,
    },
    body: JSON.stringify({
      type: "run_sql",
      args: { sql },
    }),
  });
  console.log(await sqlRes.json());

  console.log("Tracking table...");
  const trackRes = await fetch(HASURA_API.replace("/v1/graphql", "/v1/metadata"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_SECRET,
    },
    body: JSON.stringify({
      type: "pg_track_table",
      args: {
        source: "default",
        table: "project_contributors",
      },
    }),
  });
  console.log(await trackRes.json());
}

run();
