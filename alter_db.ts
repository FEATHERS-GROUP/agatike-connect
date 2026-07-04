import { hasuraRequest } from "./src/api/graphql.server.ts";

async function run() {
  try {
    const res1 = await fetch("https://open-languages.hasura.app/v2/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE || "",
      },
      body: JSON.stringify({
        type: "bulk",
        args: [
          {
            type: "run_sql",
            args: {
              sql: "ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_workspace_id_fkey CASCADE;",
              cascade: true
            }
          },
          {
            type: "run_sql",
            args: {
              sql: "ALTER TABLE subscriptions ALTER COLUMN workspace_id TYPE jsonb USING jsonb_build_array(workspace_id);",
              cascade: true
            }
          },
          {
            type: "run_sql",
            args: {
              sql: "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS modules jsonb DEFAULT '[]'::jsonb;",
              cascade: true
            }
          }
        ]
      }),
    });
    console.log(await res1.json());
    
    const res2 = await fetch("https://open-languages.hasura.app/v1/metadata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE || "",
      },
      body: JSON.stringify({
        type: "reload_metadata",
        args: {
          reload_remote_schemas: true,
          reload_sources: true
        }
      }),
    });
    console.log(await res2.json());
  } catch (err) {
    console.error(err);
  }
}

run();
