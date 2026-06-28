import dotenv from "dotenv";
dotenv.config();
const API_BASE = process.env.HASURA_ADMIN_API.replace("/v1/graphql", "");
const SECRET = process.env.HASURA_ADMIN_SECRETE;

async function trackTable(tableName) {
  console.log(`Tracking table: ${tableName}`);
  const res = await fetch(`${API_BASE}/v1/metadata`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hasura-admin-secret": SECRET },
    body: JSON.stringify({
      type: "pg_track_table",
      args: {
        source: "default",
        table: tableName,
      },
    }),
  });
  const json = await res.json();
  if (json.error && !json.error.includes("already tracked")) {
    console.error(`Error tracking ${tableName}:`, json.error);
  } else {
    console.log(`Successfully tracked ${tableName} (or already tracked).`);
  }
}

async function run() {
  await trackTable("pricing_plans");
  await trackTable("subscriptions");
  await trackTable("invoices");
}
run();
