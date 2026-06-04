import { config } from "dotenv";
config();

async function run() {
  const query = {
    type: "run_sql",
    args: {
      sql: `ALTER TABLE venue_projects ADD COLUMN IF NOT EXISTS tour_stop_idx integer DEFAULT 0;`,
    },
  };

  const res = await fetch(process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v2/query"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify(query),
  });

  const data = await res.json();
  console.log("SQL Result:", JSON.stringify(data, null, 2));

  // Then reload metadata
  const metaQuery = { type: "reload_metadata", args: {} };
  await fetch(process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v1/metadata"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify(metaQuery),
  });

  console.log("Metadata reloaded.");
}
run();
