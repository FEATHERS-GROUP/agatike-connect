import { config } from "dotenv";
config();

async function run() {
  // First get columns
  const getQuery = {
    type: "run_sql",
    args: {
      sql: "SELECT column_name FROM information_schema.columns WHERE table_name = 'venue_projects';",
    },
  };

  const getRes = await fetch(process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v2/query"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify(getQuery),
  });
  const data = await getRes.json();
  console.log("Columns:", JSON.stringify(data, null, 2));

  // Then try to drop if it has 'image_url' or 'venue_image_url' or similar
  const dropQuery = {
    type: "run_sql",
    args: {
      sql: "ALTER TABLE venue_projects DROP COLUMN IF EXISTS image_url; ALTER TABLE venue_projects DROP COLUMN IF EXISTS venue_image_url;",
    },
  };

  const dropRes = await fetch(process.env.HASURA_ADMIN_API.replace("/v1/graphql", "/v2/query"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRETE,
    },
    body: JSON.stringify(dropQuery),
  });
  const dropData = await dropRes.json();
  console.log("Drop result:", JSON.stringify(dropData, null, 2));

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
}
run();
