import { config } from "dotenv";
config();

async function run() {
  const url = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v2/query");
  const headers = {
    "Content-Type": "application/json",
    "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
  };

  // 1. Add `banned` column
  console.log("Adding `banned` column to users table...");
  const bannedRes = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: "run_sql",
      args: {
        sql: "ALTER TABLE users ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false;",
      },
    }),
  });
  console.log("banned result:", await bannedRes.json());

  // 2. Reload metadata so Hasura picks up the new columns
  console.log("Reloading Hasura metadata...");
  const metadataRes = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: "reload_metadata",
      args: {
        reload_remote_schemas: true,
        reload_sources: true,
      },
    }),
  });
  console.log("Metadata result:", await metadataRes.json());

  console.log("Done! Both columns are now available on the users table.");
}

run();
