import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function run() {
  console.log("1. Adding supported_networks column to wallets table...");
  const createRes = await fetch(`${API_BASE}/v2/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: `
          ALTER TABLE public.wallets 
          ADD COLUMN IF NOT EXISTS supported_networks jsonb DEFAULT '[]'::jsonb;
        `,
      },
    }),
  });

  const createData = await createRes.json();
  if (createData.error) {
    console.error("Error modifying table:", createData.error);
  } else {
    console.log("Column added successfully:", createData);
  }

  console.log("2. Reloading metadata...");
  const trackRes = await fetch(`${API_BASE}/v1/metadata`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "reload_metadata"
    }),
  });
  console.log("Metadata reloaded:", await trackRes.json());
}

run();
