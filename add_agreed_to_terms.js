import { config } from "dotenv";
config();

async function run() {
  const url = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v2/query");
  const headers = {
    "Content-Type": "application/json",
    "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
  };

  // 1. Add agreed_to_terms column
  console.log("Adding agreed_to_terms column to users table...");
  const sqlPayload = {
    type: "run_sql",
    args: {
      sql: "ALTER TABLE users ADD COLUMN IF NOT EXISTS agreed_to_terms boolean DEFAULT false;",
    },
  };

  const sqlRes = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(sqlPayload),
  });
  console.log("SQL Result:", await sqlRes.json());

  // 2. Reload metadata
  console.log("Reloading Hasura metadata...");
  const metadataPayload = {
    type: "reload_metadata",
    args: {
      reload_remote_schemas: true,
      reload_sources: true,
    },
  };

  const metadataRes = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(metadataPayload),
  });
  console.log("Metadata Result:", await metadataRes.json());
}
run();
