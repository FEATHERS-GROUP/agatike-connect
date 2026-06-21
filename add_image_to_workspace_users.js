import dotenv from "dotenv";
dotenv.config();

const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  console.log("1. Adding image column to workspace_users table...");
  const alterRes = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: `ALTER TABLE public.workspace_users ADD COLUMN IF NOT EXISTS image text;`,
      },
    }),
  });
  const alterData = await alterRes.json();
  if (alterData.error) {
    console.error("Error altering table:", alterData.error);
  } else {
    console.log("Column added!", alterData);
  }

  console.log("2. Reloading metadata...");
  const trackRes = await fetch(`${API_BASE}/v1/metadata`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "reload_metadata",
    }),
  });
  console.log("Reload metadata result:", await trackRes.json());
}

run();
