import dotenv from "dotenv";
dotenv.config();

const API_BASE = process.env.HASURA_ADMIN_API?.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  if (!API_BASE || !SECRET) {
    console.error("HASURA_ADMIN_API or HASURA_ADMIN_SECRETE is missing in .env");
    return;
  }

  console.log("1. Creating admin_groups table and altering admin_users...");
  const createRes = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: `
          CREATE TABLE IF NOT EXISTS public.admin_groups (
              id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
              name text NOT NULL UNIQUE,
              permissions jsonb DEFAULT '[]'::jsonb NOT NULL,
              created_at timestamp with time zone DEFAULT now() NOT NULL
          );

          ALTER TABLE public.admin_users
          ADD COLUMN IF NOT EXISTS admin_group_id uuid REFERENCES public.admin_groups(id) ON DELETE SET NULL;
        `,
      },
    }),
  });

  const createData = await createRes.json();
  if (createData.error) {
    console.error("Error running SQL:", createData.error);
    return;
  } else {
    console.log("SQL executed successfully!");
  }

  console.log("2. Tracking admin_groups table...");
  const trackRes = await fetch(`${API_BASE}/v1/metadata`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "pg_track_table",
      args: {
        source: "default",
        table: "admin_groups",
      },
    }),
  });

  const trackData = await trackRes.json();
  if (trackData.error && trackData.error !== "table/view is already tracked") {
    console.error("Error tracking admin_groups:", trackData.error);
  } else {
    console.log("Track admin_groups success!");
  }
  
  console.log("3. Creating Relationships...");
  const relRes = await fetch(`${API_BASE}/v1/metadata`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "bulk",
      args: [
        {
          type: "pg_create_object_relationship",
          args: {
            source: "default",
            table: "admin_users",
            name: "group",
            using: {
              foreign_key_constraint_on: "admin_group_id"
            }
          }
        },
        {
          type: "pg_create_array_relationship",
          args: {
            source: "default",
            table: "admin_groups",
            name: "users",
            using: {
              foreign_key_constraint_on: {
                table: "admin_users",
                column: "admin_group_id"
              }
            }
          }
        }
      ]
    }),
  });

  const relData = await relRes.json();
  if (relData.error) {
    console.error("Error creating relationships:", relData.error);
  } else {
    console.log("Relationships created!");
  }
}

run();
