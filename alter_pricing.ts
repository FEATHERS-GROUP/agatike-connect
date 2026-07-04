import { hasuraRequest } from "./src/api/graphql.server.ts";

async function run() {
  try {
    const res = await fetch("https://open-languages.hasura.app/v2/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE || "",
      },
      body: JSON.stringify({
        type: "run_sql",
        args: {
          sql: "ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS usage_limits jsonb DEFAULT '{}'::jsonb;",
          cascade: true
        }
      }),
    });
    console.log(await res.json());

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
